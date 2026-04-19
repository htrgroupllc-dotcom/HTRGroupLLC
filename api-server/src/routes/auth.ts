import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import pg from "pg";
import { verifyAdminToken as _verifyToken, verifyPin } from "../admin-auth.js";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
// Derive types from library function signatures — avoids requiring @simplewebauthn/types separately
type RegistrationResponseJSON   = Parameters<typeof verifyRegistrationResponse>[0]["response"];
type AuthenticationResponseJSON = Parameters<typeof verifyAuthenticationResponse>[0]["response"];
// Bundled primitive types from @simplewebauthn/server
type AuthenticatorTransportFuture = "ble" | "hybrid" | "internal" | "nfc" | "usb" | "cable" | "smart-card";
type Base64URLString = string;

const authRouter = Router();
const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });

// Ensure webauthn_credentials table exists on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS webauthn_credentials (
    id SERIAL PRIMARY KEY,
    credential_id TEXT UNIQUE NOT NULL,
    public_key TEXT NOT NULL,
    counter BIGINT NOT NULL DEFAULT 0,
    transports TEXT,
    label TEXT DEFAULT 'Device',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )
`).catch(err => console.error("[AUTH] Failed to init webauthn table:", err));

const RP_NAME = "HTRGroupTX Admin";
const RP_ID  = process.env["WEBAUTHN_RP_ID"] ?? "htr-group-llc-appliance-repair.replit.app";

const ALLOWED_ORIGINS = [
  `https://${RP_ID}`,
  `http://localhost:3000`,
  `http://localhost:5173`,
];

// Fail fast if SESSION_SECRET is not configured
const SESSION_SECRET = process.env["SESSION_SECRET"];
if (!SESSION_SECRET) {
  console.error("[AUTH] FATAL: SESSION_SECRET env var is required but not set. Auth endpoints will be disabled.");
}
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

function signToken(payload: object): string {
  if (!SESSION_SECRET) throw new Error("SESSION_SECRET not configured");
  const data = JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + TOKEN_TTL_MS });
  const sig  = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
  return Buffer.from(data).toString("base64url") + "." + sig;
}

export const verifyAdminToken = _verifyToken;

// Per-challenge storage: challengeId → { challenge, createdAt }
// TTL-cleaned after 5 minutes to prevent memory leaks
const pendingChallenges = new Map<string, { challenge: string; createdAt: number }>();

function storePendingChallenge(challenge: string): string {
  const id = crypto.randomBytes(16).toString("hex");
  pendingChallenges.set(id, { challenge, createdAt: Date.now() });
  const staleThreshold = Date.now() - 5 * 60 * 1000;
  for (const [key, val] of pendingChallenges.entries()) {
    if (val.createdAt < staleThreshold) pendingChallenges.delete(key);
  }
  return id;
}

function consumePendingChallenge(id: string): string | null {
  const entry = pendingChallenges.get(id);
  if (!entry) return null;
  pendingChallenges.delete(id);
  if (Date.now() - entry.createdAt > 5 * 60 * 1000) return null;
  return entry.challenge;
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  if (!SESSION_SECRET) {
    res.status(503).json({ error: "Auth service not configured (SESSION_SECRET missing)" });
    return;
  }
  const authHeader = req.headers["authorization"];
  const token = typeof authHeader === "string" ? authHeader.replace("Bearer ", "") : undefined;
  if (!token || !verifyAdminToken(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// ── POST /api/auth/verify-pin ─────────────────────────────────────────────────
authRouter.post("/auth/verify-pin", async (req: Request, res: Response) => {
  if (!SESSION_SECRET) {
    res.status(503).json({ error: "Auth service not configured" });
    return;
  }
  const body = req.body as { pin?: unknown };
  const pin = typeof body.pin === "string" ? body.pin : undefined;
  const adminPin = process.env["ADMIN_PIN"];
  if (!adminPin) { res.status(500).json({ error: "ADMIN_PIN not configured" }); return; }
  if (!pin) { res.status(401).json({ error: "Invalid PIN" }); return; }
  // Use the same timing-safe hashed-PIN verification as all other admin routes
  const ok = await verifyPin(pin, adminPin).catch(() => false);
  if (!ok) {
    res.status(401).json({ error: "Invalid PIN" });
    return;
  }
  const token = signToken({ role: "admin" });
  res.json({ ok: true, token });
});

// ── GET /api/auth/webauthn/register-options ───────────────────────────────────
authRouter.get("/auth/webauthn/register-options", requireAdminAuth, async (_req: Request, res: Response) => {
  const { rows } = await pool.query("SELECT credential_id FROM webauthn_credentials");
  const existingCredentials = (rows as { credential_id: string }[]).map(r => ({
    id: r.credential_id as Base64URLString,
    type: "public-key" as const,
  }));

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: "admin",
    userDisplayName: "HTRGroupTX Admin",
    attestationType: "none",
    excludeCredentials: existingCredentials,
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
      authenticatorAttachment: "platform",
    },
  });

  const challengeId = storePendingChallenge(options.challenge);
  res.json({ ...options, challengeId });
});

// ── POST /api/auth/webauthn/register-verify ───────────────────────────────────
authRouter.post("/auth/webauthn/register-verify", requireAdminAuth, async (req: Request, res: Response) => {
  const body = req.body as { response?: RegistrationResponseJSON; label?: unknown; challengeId?: unknown };
  const { response, label, challengeId } = body;

  if (typeof challengeId !== "string" || !challengeId) {
    res.status(400).json({ error: "Missing challengeId" });
    return;
  }
  if (!response) {
    res.status(400).json({ error: "Missing response" });
    return;
  }

  const challenge = consumePendingChallenge(challengeId);
  if (!challenge) { res.status(400).json({ error: "No valid pending challenge" }); return; }

  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: ALLOWED_ORIGINS,
      expectedRPID: RP_ID,
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      res.status(400).json({ error: "Verification failed" });
      return;
    }

    const { credential } = verification.registrationInfo;
    // credential.id is already a Base64URL string in @simplewebauthn/server v13+
    const credId     = credential.id as string;
    const pubKey     = Buffer.from(credential.publicKey).toString("base64url");
    const transports = (response.response?.transports ?? []).join(",");
    const labelStr   = typeof label === "string" ? label : "Device";

    await pool.query(
      `INSERT INTO webauthn_credentials (credential_id, public_key, counter, transports, label)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (credential_id) DO UPDATE
         SET counter = $3, transports = $4, label = $5`,
      [credId, pubKey, credential.counter, transports, labelStr],
    );

    res.json({ ok: true, credentialId: credId });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// ── POST /api/auth/webauthn/login-options ─────────────────────────────────────
// Accepts optional credentialId to scope challenge to a specific device.
// Without credentialId: uses empty allowCredentials (allows any registered key on device).
authRouter.post("/auth/webauthn/login-options", async (req: Request, res: Response) => {
  const body = req.body as { credentialId?: unknown };
  const credentialId = typeof body.credentialId === "string" ? body.credentialId : undefined;

  let allowCredentials: { id: Base64URLString; type: "public-key"; transports?: AuthenticatorTransportFuture[] }[] = [];

  if (credentialId) {
    // Challenge only the specific device credential (no broad enumeration)
    const { rows } = await pool.query(
      "SELECT credential_id, transports FROM webauthn_credentials WHERE credential_id = $1",
      [credentialId],
    );
    allowCredentials = (rows as { credential_id: string; transports: string }[]).map(r => ({
      id: r.credential_id as Base64URLString,
      type: "public-key" as const,
      transports: r.transports ? (r.transports.split(",") as AuthenticatorTransportFuture[]) : undefined,
    }));
  }
  // If no credentialId: leave allowCredentials empty — browser will prompt for any available key

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: "preferred",
    allowCredentials,
  });

  const challengeId = storePendingChallenge(options.challenge);
  res.json({ ...options, challengeId });
});

// ── POST /api/auth/webauthn/login-verify ──────────────────────────────────────
authRouter.post("/auth/webauthn/login-verify", async (req: Request, res: Response) => {
  if (!SESSION_SECRET) {
    res.status(503).json({ error: "Auth service not configured" });
    return;
  }
  const body = req.body as { response?: AuthenticationResponseJSON; challengeId?: unknown };
  const { response, challengeId } = body;

  if (typeof challengeId !== "string" || !challengeId) {
    res.status(400).json({ error: "Missing challengeId" });
    return;
  }
  if (!response) {
    res.status(400).json({ error: "Missing response" });
    return;
  }

  const challenge = consumePendingChallenge(challengeId);
  if (!challenge) { res.status(400).json({ error: "No valid pending challenge" }); return; }

  const credId = response.id;
  const { rows } = await pool.query(
    "SELECT * FROM webauthn_credentials WHERE credential_id = $1",
    [credId],
  );
  if (!rows.length) { res.status(404).json({ error: "Credential not found" }); return; }

  const cred = rows[0] as {
    credential_id: string;
    public_key: string;
    counter: number;
    transports: string;
  };

  try {
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: ALLOWED_ORIGINS,
      expectedRPID: RP_ID,
      requireUserVerification: false,
      credential: {
        id: cred.credential_id as Base64URLString,
        publicKey: Buffer.from(cred.public_key, "base64url"),
        counter: cred.counter,
        transports: cred.transports
          ? (cred.transports.split(",") as AuthenticatorTransportFuture[])
          : undefined,
      },
    });

    if (!verification.verified) { res.status(401).json({ error: "Verification failed" }); return; }

    await pool.query(
      "UPDATE webauthn_credentials SET counter = $1 WHERE credential_id = $2",
      [verification.authenticationInfo.newCounter, credId],
    );

    const token = signToken({ role: "admin" });
    res.json({ ok: true, token });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// ── GET /api/auth/webauthn/credentials ───────────────────────────────────────
authRouter.get("/auth/webauthn/credentials", requireAdminAuth, async (_req: Request, res: Response) => {
  const { rows } = await pool.query(
    "SELECT id, credential_id, label, created_at FROM webauthn_credentials ORDER BY created_at DESC",
  );
  res.json({ credentials: rows });
});

// ── DELETE /api/auth/webauthn/credentials/:id ─────────────────────────────────
authRouter.delete("/auth/webauthn/credentials/:id", requireAdminAuth, async (req: Request, res: Response) => {
  await pool.query("DELETE FROM webauthn_credentials WHERE id = $1", [req.params["id"]]);
  res.json({ ok: true });
});

export { authRouter };
