const fs = require("fs");
const path = require("path");

const route = `import { Router, type IRouter } from "express";

const CACHE_TTL_MS = 3 * 60 * 60 * 1000;
const TEXT_QUERY = "Hitechrepairgroup LLC Katy TX";

const AVATAR_COLORS = [
  "#4285F4", "#1A7A6E", "#C0392B", "#2471A3", "#117A65",
  "#7D6608", "#884EA0", "#1F618D",
];

type GoogleReviewOut = {
  name: string;
  initials: string;
  avatarColor: string;
  rating: number;
  time: string;
  textEn: string;
  textEs: string;
  category: "5" | "4" | "recent";
};

type CacheEntry = { fetchedAt: number; payload: Record<string, unknown> };
let cache: CacheEntry | null = null;

function initials(name: string): string {
  const parts = name.trim().split(/\\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? "G").toUpperCase();
}

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i) * 17) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h] ?? AVATAR_COLORS[0];
}

function apiKey(): string {
  return (
    process.env["GOOGLE_PLACES_API_KEY"] ??
    process.env["GOOGLE_MAPS_API_KEY"] ??
    ""
  ).trim();
}

async function resolvePlaceId(key: string): Promise<string | null> {
  const fromEnv = (process.env["GOOGLE_PLACE_ID"] ?? "").trim();
  if (fromEnv) return fromEnv;

  const url = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
  url.searchParams.set("input", TEXT_QUERY);
  url.searchParams.set("inputtype", "textquery");
  url.searchParams.set("fields", "place_id");
  url.searchParams.set("key", key);

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  return data.candidates?.[0]?.place_id ?? null;
}

const router: IRouter = Router();

router.get("/google-reviews", async (_req, res) => {
  const key = apiKey();
  if (!key) {
    res.status(200).json({
      ok: false,
      source: "unconfigured",
      error: "Set GOOGLE_PLACES_API_KEY in Replit Secrets (Places API enabled).",
      reviews: [],
    });
    return;
  }

  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    res.json({ ...cache.payload, source: "cache" });
    return;
  }

  try {
    const placeId = await resolvePlaceId(key);
    if (!placeId) {
      res.status(200).json({ ok: false, source: "error", error: "place_not_found", reviews: [] });
      return;
    }

    const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    detailsUrl.searchParams.set("place_id", placeId);
    detailsUrl.searchParams.set("fields", "rating,user_ratings_total,reviews");
    detailsUrl.searchParams.set("key", key);

    const detRes = await fetch(detailsUrl.toString());
    if (!detRes.ok) {
      res.status(502).json({ ok: false, source: "error", error: "google_http_error", reviews: [] });
      return;
    }

    const det = await detRes.json();

    if (det.status && det.status !== "OK" && det.status !== "ZERO_RESULTS") {
      res.status(200).json({
        ok: false,
        source: "error",
        error: det.error_message ?? det.status,
        reviews: [],
      });
      return;
    }

    const reviews = (det.result?.reviews ?? [])
      .filter((r) => (r.rating ?? 0) >= 4)
      .map((r) => {
        const name = r.author_name ?? "Google User";
        const rating = r.rating ?? 5;
        const text = r.text ?? "";
        return {
          name,
          initials: initials(name),
          avatarColor: avatarColor(name),
          rating,
          time: r.relative_time_description ?? "",
          textEn: text,
          textEs: text,
          category: rating >= 5 ? "5" : "4",
        };
      });

    const payload = {
      ok: true,
      source: "google",
      rating: det.result?.rating ?? null,
      userRatingCount: det.result?.user_ratings_total ?? null,
      reviews,
      fetchedAt: new Date().toISOString(),
    };

    cache = { fetchedAt: Date.now(), payload };
    res.json(payload);
  } catch (err) {
    res.status(500).json({
      ok: false,
      source: "error",
      error: err instanceof Error ? err.message : "fetch_failed",
      reviews: [],
    });
  }
});

export default router;
`;

const client = `import type { ReviewData } from "../data/reviews";
import {
  GOOGLE_FEATURED_REVIEWS,
  GOOGLE_RATING,
  GOOGLE_REVIEW_COUNT,
} from "../data/googleBusinessReviews";

export const GOOGLE_STAR_COLOR = "#FBBC04";
export const REVIEWS_PER_PAGE = 10;

export type GoogleReviewsApiResponse = {
  ok?: boolean;
  source?: string;
  rating?: number | null;
  userRatingCount?: number | null;
  reviews?: ReviewData[];
};

function reviewKey(r: ReviewData): string {
  return \`\${r.name.toLowerCase()}|\${(r.textEn || "").slice(0, 48)}\`;
}

export function mergePositiveGoogleReviews(
  live: ReviewData[],
  fallback: ReviewData[] = GOOGLE_FEATURED_REVIEWS,
): ReviewData[] {
  const seen = new Set<string>();
  const out: ReviewData[] = [];
  for (const r of [...live, ...fallback]) {
    if (r.rating < 4) continue;
    const k = reviewKey(r);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

export async function fetchGoogleReviewsFromApi(
  apiBase: string,
): Promise<GoogleReviewsApiResponse | null> {
  const base = apiBase.replace(/\\/$/, "");
  if (!base) return null;
  try {
    const res = await fetch(\`\${base}/api/google-reviews\`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as GoogleReviewsApiResponse;
  } catch {
    return null;
  }
}

export function defaultGoogleMeta(): { rating: number; count: number } {
  return { rating: GOOGLE_RATING, count: GOOGLE_REVIEW_COUNT };
}
`;

const targets = [
  "C:/Projects/HTRGroupLLC/api-server/src/routes/google-reviews.ts",
  "c:/Projects/htrgr/REPLIT-LATEST/HTRGroupLLC1/artifacts/api-server/src/routes/google-reviews.ts",
  "c:/Projects/htrgr/REPLIT-LATEST/HTRGroupLLC-source/api-server/src/routes/google-reviews.ts",
  "C:/Projects/HTRGroupLLC/src/lib/googleReviewsClient.ts",
];

for (const t of targets) {
  const p = path.dirname(t);
  if (!fs.existsSync(p)) continue;
  fs.writeFileSync(t, t.endsWith("Client.ts") ? client : route, "utf8");
  console.log("wrote", t);
}
