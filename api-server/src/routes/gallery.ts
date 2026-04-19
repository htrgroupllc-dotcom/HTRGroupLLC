import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import pg from "pg";
import { verifyAdminToken } from "../admin-auth.js";
import { Storage } from "@google-cloud/storage";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });

// ── GCS client (Replit sidecar auth) ─────────────────────────────────────────
const SIDECAR = "http://127.0.0.1:1106";
const gcs = new Storage({
  credentials: {
    audience:           "replit",
    subject_token_type: "access_token",
    token_url:          `${SIDECAR}/token`,
    type:               "external_account",
    credential_source: {
      url:    `${SIDECAR}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

function getBucket() {
  const id = process.env["DEFAULT_OBJECT_STORAGE_BUCKET_ID"];
  if (!id) throw new Error("DEFAULT_OBJECT_STORAGE_BUCKET_ID not set");
  return gcs.bucket(id);
}

// ── Multer — memory storage (buffer → GCS, nothing written to disk) ───────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB per file
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only images are allowed"));
  },
});

// ── Upload buffer → GCS, returns GCS object name (no slashes → safe as URL param) ─
async function uploadToGCS(buffer: Buffer, originalname: string, mimetype: string): Promise<string> {
  const ts  = Date.now();
  const ext = path.extname(originalname).toLowerCase().replace(/\.(heic|heif)$/i, ".jpg") || ".jpg";
  const objectName = `gallery_${ts}_${crypto.randomBytes(4).toString("hex")}${ext}`;
  const bucket  = getBucket();
  const gcsFile = bucket.file(`gallery/${objectName}`);
  await gcsFile.save(buffer, {
    metadata: { contentType: /heic|heif/i.test(mimetype) ? "image/jpeg" : (mimetype || "image/jpeg") },
    resumable: false,
  });
  return objectName; // stored in DB without "gallery/" prefix
}

// ── PIN verification — supports plain and salt:hash (scrypt) formats ──────────
async function verifyPin(provided: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  if (!stored.includes(":")) {
    try { return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(stored)); }
    catch { return false; }
  }
  const [salt, hash] = stored.split(":");
  return new Promise(resolve => {
    crypto.scrypt(provided, salt!, 64, (err, key) => {
      if (err) { resolve(false); return; }
      try { resolve(crypto.timingSafeEqual(Buffer.from(hash!, "hex"), key)); }
      catch { resolve(false); }
    });
  });
}

function requirePin(req: Request, res: Response, next: NextFunction): void {
  // Accept Bearer token (biometric / session auth) as alternative to PIN
  const bearer = (req.headers["authorization"] as string | undefined)?.replace("Bearer ", "");
  if (bearer && verifyAdminToken(bearer)) { next(); return; }

  const stored = process.env["ADMIN_PIN"] ?? "";
  if (!stored) { res.status(503).json({ error: "ADMIN_PIN not configured" }); return; }
  const raw      = (req.headers["x-admin-pin"] as string | undefined) ?? "";
  const supplied = (() => { try { return decodeURIComponent(raw); } catch { return raw; } })();
  verifyPin(supplied, stored).then(ok => {
    if (!ok) { res.status(401).json({ error: "Unauthorized" }); return; }
    next();
  }).catch(() => res.status(401).json({ error: "Unauthorized" }));
}

const galleryRouter = Router();

// ─── GET /api/gallery/photos ──────────────────────────────────────────────────
galleryRouter.get("/gallery/photos", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, filename, caption_en, caption_es, created_at
       FROM gallery_photos ORDER BY created_at DESC`,
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── GET /api/gallery/file/:filename — stream from GCS ───────────────────────
galleryRouter.get("/gallery/file/:filename", async (req, res) => {
  const filename = req.params["filename"] ?? "";
  if (!filename) { res.status(400).send("Bad request"); return; }

  // All new uploads store name WITHOUT "gallery/" prefix in DB;
  // prepend it for GCS lookup. Old disk-based names fall through to 404.
  const objectName = `gallery/${filename}`;

  try {
    const gcsFile = getBucket().file(objectName);
    const [meta]  = await gcsFile.getMetadata();
    const ct      = (meta.contentType as string | undefined) ?? "image/jpeg";

    res.set("Content-Type", ct);
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    gcsFile.createReadStream()
      .on("error", () => res.status(404).send("Not found"))
      .pipe(res);
  } catch {
    res.status(404).send("Not found");
  }
});

// ─── POST /api/gallery/upload (single) ───────────────────────────────────────
galleryRouter.post("/gallery/upload", requirePin, upload.single("photo"), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  const { caption_en = "", caption_es = "" } = req.body as { caption_en?: string; caption_es?: string };
  try {
    const objectName = await uploadToGCS(req.file.buffer, req.file.originalname, req.file.mimetype);
    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO gallery_photos (filename, caption_en, caption_es)
       VALUES ($1, $2, $3) RETURNING id`,
      [objectName, caption_en.trim(), caption_es.trim()],
    );
    res.json({ ok: true, id: rows[0]?.id, filename: objectName });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── POST /api/gallery/upload-many (up to 50 files) ─────────────────────────
galleryRouter.post("/gallery/upload-many", requirePin, upload.array("photos", 50), async (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) { res.status(400).json({ error: "No files uploaded" }); return; }
  const results: Array<{ ok: boolean; filename?: string; id?: number; error?: string }> = [];
  for (const file of files) {
    try {
      const objectName = await uploadToGCS(file.buffer, file.originalname, file.mimetype);
      const { rows } = await pool.query<{ id: number }>(
        `INSERT INTO gallery_photos (filename, caption_en, caption_es) VALUES ($1,$2,$3) RETURNING id`,
        [objectName, "", ""],
      );
      results.push({ ok: true, id: rows[0]?.id, filename: objectName });
    } catch (e) {
      results.push({ ok: false, filename: file.originalname, error: String(e) });
    }
  }
  res.json({ ok: true, results });
});

// ─── DELETE /api/gallery/photo/:id ───────────────────────────────────────────
galleryRouter.delete("/gallery/photo/:id", requirePin, async (req, res) => {
  const id = parseInt(req.params["id"] ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const { rows } = await pool.query<{ filename: string }>(
      `DELETE FROM gallery_photos WHERE id=$1 RETURNING filename`, [id],
    );
    const objectName = rows[0]?.filename;
    if (objectName) {
      try { await getBucket().file(objectName).delete(); } catch { /* non-fatal */ }
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ─── POST /api/gallery/bulk-delete ───────────────────────────────────────────
galleryRouter.post("/gallery/bulk-delete", requirePin, async (req, res) => {
  const { ids } = req.body as { ids?: unknown };
  if (!Array.isArray(ids) || ids.length === 0) { res.status(400).json({ error: "ids array required" }); return; }
  const numIds = (ids as unknown[]).map(Number).filter(n => !isNaN(n) && n > 0);
  if (numIds.length === 0) { res.status(400).json({ error: "No valid ids" }); return; }
  try {
    const { rows } = await pool.query<{ filename: string }>(
      `DELETE FROM gallery_photos WHERE id = ANY($1::int[]) RETURNING filename`,
      [numIds],
    );
    for (const row of rows) {
      if (row.filename) {
        try { await getBucket().file(row.filename).delete(); } catch { /* non-fatal */ }
      }
    }
    res.json({ ok: true, deleted: rows.length });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default galleryRouter;
