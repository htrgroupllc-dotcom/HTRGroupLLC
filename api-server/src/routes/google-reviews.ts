import { Router, type IRouter } from "express";

const CACHE_TTL_MS = 3 * 60 * 60 * 1000;
const CACHE_VERSION = 2;

/** Verified via g.page/r/CU7DlHNCZb8hEAE (Maps feature 0x2066db6f9cc15e1b:0x21bf65427394c34e). */
const BUSINESS_LOCATION = { lat: 29.7463431, lng: -95.7612032 };

/** Override with Replit Secret GOOGLE_PLACE_ID when needed. Filled by Places search when empty. */
const DEFAULT_GOOGLE_PLACE_ID = "";

const SEARCH_QUERIES = [
  "Hitechrepairgroup LLC appliance repair Katy TX",
  "Hitechrepairgroup LLC Katy TX",
  "Hitech Repair Group Katy Texas",
  "htrgrouptx appliance repair Katy",
  "Hitechrepairgroup LLC (346) 820-6021",
];

const AVATAR_COLORS = [
  "#4285F4", "#1A7A6E", "#C0392B", "#2471A3", "#117A65",
  "#7D6608", "#884EA0", "#1F618D",
];

type CacheEntry = { version: number; fetchedAt: number; payload: Record<string, unknown> };
let cache: CacheEntry | null = null;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
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


function scoreBusinessCandidate(name: string, address: string): number {
  const n = name.toLowerCase();
  const a = address.toLowerCase();
  let score = 0;
  if (/hitech|htrg|htr group/.test(n)) score += 12;
  if (/repair/.test(n)) score += 4;
  if (/appliance/.test(n)) score += 6;
  if (/katy|richmond|fulshear|sugar land|houston/.test(a)) score += 3;
  if (/brake|tire|oil change|muffler|collision/.test(n + " " + a)) score -= 25;
  return score;
}

function pickBestPlace(
  places: { id?: string; displayName?: { text?: string }; formattedAddress?: string }[] | undefined,
): string | null {
  if (!places?.length) return null;
  let bestId: string | null = null;
  let bestScore = -999;
  for (const p of places) {
    const name = p.displayName?.text ?? "";
    const address = p.formattedAddress ?? "";
    const score = scoreBusinessCandidate(name, address);
    if (score > bestScore && p.id) {
      bestScore = score;
      bestId = normalizePlaceId(p.id);
    }
  }
  return bestScore >= 10 ? bestId : null;
}

function normalizePlaceId(raw: string): string {
  return raw.replace(/^places\//, "").trim();
}

async function searchPlaceIdNew(key: string): Promise<string | null> {
  for (const textQuery of SEARCH_QUERIES) {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
      },
      body: JSON.stringify({
        textQuery,
        locationBias: {
          circle: {
            center: { latitude: BUSINESS_LOCATION.lat, longitude: BUSINESS_LOCATION.lng },
            radius: 80_000,
          },
        },
      }),
    });
    if (!res.ok) continue;
    const data = (await res.json()) as { places?: { id?: string }[] };
    const picked = pickBestPlace(data.places);
    if (picked) return picked;
  }
  return null;
}

async function searchPlaceIdLegacy(key: string): Promise<string | null> {
  for (const query of SEARCH_QUERIES) {
    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", query);
    url.searchParams.set("location", `${BUSINESS_LOCATION.lat},${BUSINESS_LOCATION.lng}`);
    url.searchParams.set("radius", "80000");
    url.searchParams.set("key", key);
    const res = await fetch(url.toString());
    if (!res.ok) continue;
    const data = (await res.json()) as { results?: { place_id?: string }[]; status?: string };
    for (const r of data.results ?? []) {
      const score = scoreBusinessCandidate(r.name ?? "", r.formatted_address ?? "");
      if (score >= 10 && r.place_id) return r.place_id;
    }
  }
  for (const input of SEARCH_QUERIES) {
    const url = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
    url.searchParams.set("input", input);
    url.searchParams.set("inputtype", "textquery");
    url.searchParams.set("fields", "place_id");
    url.searchParams.set("locationbias", `circle:80000@${BUSINESS_LOCATION.lat},${BUSINESS_LOCATION.lng}`);
    url.searchParams.set("key", key);
    const res = await fetch(url.toString());
    if (!res.ok) continue;
    const data = (await res.json()) as { candidates?: { place_id?: string }[] };
    const pid = data.candidates?.[0]?.place_id;
    if (pid) return pid;
  }
  return null;
}

async function resolvePlaceId(key: string): Promise<string | null> {
  const fromEnv = (process.env["GOOGLE_PLACE_ID"] ?? "").trim();
  if (fromEnv) return fromEnv;
  if (DEFAULT_GOOGLE_PLACE_ID.trim()) return DEFAULT_GOOGLE_PLACE_ID.trim();
  return (await searchPlaceIdNew(key)) ?? (await searchPlaceIdLegacy(key));
}

type ReviewOut = {
  name: string;
  initials: string;
  avatarColor: string;
  rating: number;
  time: string;
  textEn: string;
  textEs: string;
  category: "5" | "4" | "recent";
};

function mapLegacyReviews(reviews: { author_name?: string; rating?: number; relative_time_description?: string; text?: string }[]): ReviewOut[] {
  return reviews
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
}

function mapNewReviews(
  reviews: {
    rating?: number;
    relativePublishTimeDescription?: string;
    text?: { text?: string };
    authorAttribution?: { displayName?: string };
  }[],
): ReviewOut[] {
  return reviews
    .filter((r) => (r.rating ?? 0) >= 4)
    .map((r) => {
      const name = r.authorAttribution?.displayName ?? "Google User";
      const rating = r.rating ?? 5;
      const text = r.text?.text ?? "";
      return {
        name,
        initials: initials(name),
        avatarColor: avatarColor(name),
        rating,
        time: r.relativePublishTimeDescription ?? "",
        textEn: text,
        textEs: text,
        category: rating >= 5 ? "5" : "4",
      };
    });
}

async function fetchPlaceReviewsNew(key: string, placeId: string) {
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "reviews,rating,userRatingCount",
    },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    reviews?: Parameters<typeof mapNewReviews>[0];
    rating?: number;
    userRatingCount?: number;
  };
  return {
    reviews: mapNewReviews(data.reviews ?? []),
    rating: data.rating ?? null,
    userRatingCount: data.userRatingCount ?? null,
  };
}

async function fetchPlaceReviewsLegacy(key: string, placeId: string) {
  const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  detailsUrl.searchParams.set("place_id", placeId);
  detailsUrl.searchParams.set("fields", "rating,user_ratings_total,reviews");
  detailsUrl.searchParams.set("key", key);
  const detRes = await fetch(detailsUrl.toString());
  if (!detRes.ok) return null;
  const det = (await detRes.json()) as {
    status?: string;
    error_message?: string;
    result?: { rating?: number; user_ratings_total?: number; reviews?: Parameters<typeof mapLegacyReviews>[0] };
  };
  if (det.status && det.status !== "OK" && det.status !== "ZERO_RESULTS") {
    return { error: det.error_message ?? det.status, reviews: [] as ReviewOut[], rating: null, userRatingCount: null };
  }
  return {
    reviews: mapLegacyReviews(det.result?.reviews ?? []),
    rating: det.result?.rating ?? null,
    userRatingCount: det.result?.user_ratings_total ?? null,
  };
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

  if (cache && cache.version === CACHE_VERSION && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    res.json({ ...cache.payload, source: "cache" });
    return;
  }

  try {
    const placeId = await resolvePlaceId(key);
    if (!placeId) {
      res.status(200).json({ ok: false, source: "error", error: "place_not_found", reviews: [] });
      return;
    }

    let reviews: ReviewOut[] = [];
    let rating: number | null = null;
    let userRatingCount: number | null = null;

    const fromNew = await fetchPlaceReviewsNew(key, placeId);
    if (fromNew && fromNew.reviews.length) {
      reviews = fromNew.reviews;
      rating = fromNew.rating;
      userRatingCount = fromNew.userRatingCount;
    } else {
      const fromLegacy = await fetchPlaceReviewsLegacy(key, placeId);
      if (!fromLegacy) {
        res.status(502).json({ ok: false, source: "error", error: "google_http_error", reviews: [] });
        return;
      }
      if ("error" in fromLegacy && fromLegacy.error) {
        res.status(200).json({ ok: false, source: "error", error: fromLegacy.error, reviews: [] });
        return;
      }
      reviews = fromLegacy.reviews;
      rating = fromLegacy.rating;
      userRatingCount = fromLegacy.userRatingCount;
    }

    const payload = {
      ok: true,
      source: "google",
      placeId,
      rating,
      userRatingCount,
      reviews,
      fetchedAt: new Date().toISOString(),
    };

    cache = { version: CACHE_VERSION, fetchedAt: Date.now(), payload };
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
