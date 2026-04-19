import crypto from "crypto";

const SESSION_SECRET = process.env["SESSION_SECRET"];
const TOKEN_TTL_MS   = 8 * 60 * 60 * 1000;

/**
 * Timing-safe PIN verification.
 * Supports both plain-text (legacy/dev) and hashed `salt:hash` (scrypt) formats.
 * This matches the verifyPin implementation used in booking.ts, gallery.ts, and watchdog.ts.
 */
export async function verifyPin(provided: string, stored: string): Promise<boolean> {
  if (!stored.includes(":")) {
    // Plain-text comparison (dev / legacy)
    try {
      return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(stored));
    } catch {
      return false;
    }
  }
  // Hashed format: "salt:hexhash"
  const [salt, hash] = stored.split(":");
  return new Promise(resolve => {
    crypto.scrypt(provided, salt!, 64, (err, key) => {
      if (err) { resolve(false); return; }
      try {
        resolve(crypto.timingSafeEqual(Buffer.from(hash!, "hex"), key));
      } catch { resolve(false); }
    });
  });
}

export function verifyAdminToken(token: string): boolean {
  if (!SESSION_SECRET) return false;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return false;
  try {
    const data     = Buffer.from(b64, "base64url").toString();
    const expected = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
    if (sig !== expected) return false;
    const parsed = JSON.parse(data) as Record<string, unknown>;
    if (typeof parsed["exp"] === "number" && parsed["exp"] < Date.now()) return false;
    if (typeof parsed["iat"] === "number" && parsed["iat"] > Date.now() + TOKEN_TTL_MS) return false;
    return parsed["role"] === "admin";
  } catch {
    return false;
  }
}
