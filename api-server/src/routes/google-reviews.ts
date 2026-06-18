import { Router, type IRouter } from "express";

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

import path from "node:path";



/** 8 hours — within 6–12h spec. */

const CACHE_TTL_MS = 8 * 60 * 60 * 1000;

const CACHE_VERSION = 55;



/** Google Places Details returns max 5 reviews per request. */

const GOOGLE_PLACES_REVIEWS_PER_REQUEST = 5;



const GOOGLE_REVIEW_URL = "https://g.page/r/CU7DlHNCZb8hEAE/review";



/** Verified via g.page/r/CU7DlHNCZb8hEAE (Maps feature 0x2066db6f9cc15e1b:0x21bf65427394c34e). */

const DEFAULT_GOOGLE_PLACE_ID = "ChIJG17BnG_bZiARTsOUc0JlvyE";

const EXPECTED_PLACE_ID = DEFAULT_GOOGLE_PLACE_ID;



const REJECTED_REVIEW_PATTERNS = [

  /mastertex/i,

  /mr\.?\s*steve\b/i,

  /all katy service/i,

  /liz kent/i,

  /brake\s+(shop|repair|service)/i,

];



const AVATAR_COLORS = [

  "#4285F4", "#1A7A6E", "#C0392B", "#2471A3", "#117A65",

  "#7D6608", "#884EA0", "#1F618D",

];



type CacheEntry = { version: number; fetchedAt: number; payload: Record<string, unknown> };

let cache: CacheEntry | null = null;



const FILE_CACHE_PATH = path.join(process.cwd(), ".cache", "google-reviews-v55.json");



function loadFileCache(): CacheEntry | null {

  try {

    if (!existsSync(FILE_CACHE_PATH)) return null;

    const raw = readFileSync(FILE_CACHE_PATH, "utf8");

    const parsed = JSON.parse(raw) as CacheEntry;

    if (parsed.version !== CACHE_VERSION) return null;

    return parsed;

  } catch {

    return null;

  }

}



function saveFileCache(entry: CacheEntry): void {

  try {

    mkdirSync(path.dirname(FILE_CACHE_PATH), { recursive: true });

    writeFileSync(FILE_CACHE_PATH, JSON.stringify(entry), "utf8");

  } catch (err) {

    console.warn("[google-reviews] file cache write failed:", err);

  }

}



function getStalePayload(): Record<string, unknown> | null {

  const mem = cache?.payload;

  if (mem && typeof mem.placeId === "string" && mem.placeId === EXPECTED_PLACE_ID && Array.isArray(mem.reviews) && mem.reviews.length) {

    return mem;

  }

  const file = loadFileCache();

  if (file?.payload && typeof file.payload.placeId === "string" && file.payload.placeId === EXPECTED_PLACE_ID && Array.isArray(file.payload.reviews) && file.payload.reviews.length) {

    cache = file;

    return file.payload;

  }

  return null;

}



function serveStale(res: import("express").Response, reason: string): boolean {

  const stale = getStalePayload();

  if (!stale) return false;

  res.json({

    ...stale,

    ok: true,

    source: "stale_cache",

    staleReason: reason,

    fetchedAt: stale.fetchedAt ?? new Date().toISOString(),

  });

  return true;

}



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

  if (/hitech|htrg|htr group|hi-tech repair/i.test(n)) score += 12;

  if (/repair/.test(n)) score += 4;

  if (/appliance/.test(n)) score += 6;

  if (/katy|richmond|fulshear|sugar land|houston|cinco ranch/i.test(a)) score += 3;

  if (/mastertex|all katy service|brake|tire|oil change|muffler|collision|liz kent/i.test(n + " " + a)) score -= 50;

  return score;

}



function normalizePlaceId(raw: string): string {

  return raw.replace(/^places\//, "").trim();

}



/** Always use verified Place ID — never search for a different business. */

function resolvePlaceId(): string {

  const fromEnv = normalizePlaceId((process.env["GOOGLE_PLACE_ID"] ?? "").trim());

  if (fromEnv && fromEnv === EXPECTED_PLACE_ID) return fromEnv;

  if (fromEnv && fromEnv !== EXPECTED_PLACE_ID) {

    console.warn(

      `[google-reviews] GOOGLE_PLACE_ID secret (${fromEnv}) ignored; using verified ${EXPECTED_PLACE_ID}`,

    );

  }

  return EXPECTED_PLACE_ID;

}



function isRejectedReview(review: ReviewOut): boolean {

  const blob = `${review.name} ${review.textEn} ${review.textEs}`;

  return REJECTED_REVIEW_PATTERNS.some((p) => p.test(blob));

}



function filterValidReviews(reviews: ReviewOut[]): ReviewOut[] {

  return reviews.filter((r) => r.rating >= 4 && !isRejectedReview(r));

}



function sortReviewsNewest(reviews: ReviewOut[]): ReviewOut[] {

  return [...reviews].sort((a, b) => (b.publishTime ?? 0) - (a.publishTime ?? 0));

}



async function fetchPlaceIdentity(

  key: string,

  placeId: string,

): Promise<{ name: string; address: string } | null> {

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;

  const res = await fetch(url, {

    headers: {

      "X-Goog-Api-Key": key,

      "X-Goog-FieldMask": "displayName,formattedAddress",

    },

  });

  if (res.ok) {

    const data = (await res.json()) as {

      displayName?: { text?: string };

      formattedAddress?: string;

    };

    return {

      name: data.displayName?.text ?? "",

      address: data.formattedAddress ?? "",

    };

  }



  const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");

  detailsUrl.searchParams.set("place_id", placeId);

  detailsUrl.searchParams.set("fields", "name,formatted_address");

  detailsUrl.searchParams.set("key", key);

  const detRes = await fetch(detailsUrl.toString());

  if (!detRes.ok) return null;

  const det = (await detRes.json()) as {

    status?: string;

    result?: { name?: string; formatted_address?: string };

  };

  if (det.status !== "OK" || !det.result) return null;

  return {

    name: det.result.name ?? "",

    address: det.result.formatted_address ?? "",

  };

}



function reviewDedupeKey(r: ReviewOut): string {

  if (r.publishTime) return `t:${r.publishTime}|${r.name.toLowerCase()}`;

  return `${r.name}|${r.time}|${(r.textEn || "").slice(0, 120)}`.toLowerCase();

}



function mergeReviewLists(...lists: ReviewOut[][]): ReviewOut[] {

  const seen = new Set<string>();

  const out: ReviewOut[] = [];

  for (const list of lists) {

    for (const r of list) {

      const k = reviewDedupeKey(r);

      if (seen.has(k)) continue;

      seen.add(k);

      out.push(r);

    }

  }

  return sortReviewsNewest(filterValidReviews(out));

}



type ReviewOut = {

  name: string;

  initials: string;

  avatarColor: string;

  profilePhotoUrl?: string;

  rating: number;

  time: string;

  textEn: string;

  textEs: string;

  category: "5" | "4" | "recent";

  publishTime?: number;

};



type LegacyFetchOpts = {

  reviewsSort?: string;

  language?: string;

};



function mapLegacyReviews(

  reviews: {

    author_name?: string;

    rating?: number;

    relative_time_description?: string;

    text?: string;

    time?: number;

    profile_photo_url?: string;

  }[],

): ReviewOut[] {

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

        profilePhotoUrl: r.profile_photo_url || undefined,

        rating,

        time: r.relative_time_description ?? "",

        textEn: text,

        textEs: text,

        category: rating >= 5 ? "5" : "4",

        publishTime: typeof r.time === "number" ? r.time : undefined,

      };

    });

}



function mapNewReviews(

  reviews: {

    rating?: number;

    relativePublishTimeDescription?: string;

    publishTime?: string;

    text?: { text?: string };

    authorAttribution?: { displayName?: string; photoUri?: string };

  }[],

): ReviewOut[] {

  return reviews

    .filter((r) => (r.rating ?? 0) >= 4)

    .map((r) => {

      const name = r.authorAttribution?.displayName ?? "Google User";

      const rating = r.rating ?? 5;

      const text = r.text?.text ?? "";

      let publishTime: number | undefined;

      if (r.publishTime) {

        const ms = Date.parse(r.publishTime);

        if (!Number.isNaN(ms)) publishTime = Math.floor(ms / 1000);

      }

      return {

        name,

        initials: initials(name),

        avatarColor: avatarColor(name),

        profilePhotoUrl: r.authorAttribution?.photoUri || undefined,

        rating,

        time: r.relativePublishTimeDescription ?? "",

        textEn: text,

        textEs: text,

        category: rating >= 5 ? "5" : "4",

        publishTime,

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



async function fetchPlaceReviewsLegacy(key: string, placeId: string, opts: LegacyFetchOpts = {}) {

  const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");

  detailsUrl.searchParams.set("place_id", placeId);

  detailsUrl.searchParams.set("fields", "rating,user_ratings_total,reviews");

  if (opts.reviewsSort) detailsUrl.searchParams.set("reviews_sort", opts.reviewsSort);

  if (opts.language) detailsUrl.searchParams.set("language", opts.language);

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



async function fetchAllReviewsForPlace(key: string, placeId: string) {

  const fromNew = await fetchPlaceReviewsNew(key, placeId);

  const legacyFetches = await Promise.all([

    fetchPlaceReviewsLegacy(key, placeId, { reviewsSort: "most_relevant" }),

    fetchPlaceReviewsLegacy(key, placeId, { reviewsSort: "newest" }),

    fetchPlaceReviewsLegacy(key, placeId, { reviewsSort: "rating" }),

    fetchPlaceReviewsLegacy(key, placeId, { reviewsSort: "most_relevant", language: "en" }),

    fetchPlaceReviewsLegacy(key, placeId, { reviewsSort: "newest", language: "en" }),

  ]);

  return { fromNew, legacyFetches };

}



const router: IRouter = Router();



router.get("/google-reviews", async (_req, res) => {

  const key = apiKey();

  if (!key) {

    if (serveStale(res, "unconfigured")) return;

    res.status(200).json({

      ok: false,

      source: "unconfigured",

      error: "Set GOOGLE_PLACES_API_KEY in Replit Secrets (Places API enabled).",

      reviews: [],

    });

    return;

  }



  const expectedPlaceId = resolvePlaceId();

  if (cache && cache.version === CACHE_VERSION && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {

    const cachedPlaceId = typeof cache.payload.placeId === "string" ? cache.payload.placeId : "";

    if (cachedPlaceId !== expectedPlaceId) {

      cache = null;

    } else {

      res.json({ ...cache.payload, source: "cache" });

      return;

    }

  }



  try {

    const placeId = expectedPlaceId;



    const identity = await fetchPlaceIdentity(key, placeId);

    if (!identity) {

      if (serveStale(res, "place_identity_failed")) return;

      res.status(200).json({ ok: false, source: "error", error: "place_identity_failed", reviews: [] });

      return;

    }



    const placeScore = scoreBusinessCandidate(identity.name, identity.address);

    if (placeScore < 10) {

      if (serveStale(res, "place_name_mismatch")) return;

      res.status(200).json({

        ok: false,

        source: "error",

        error: "place_name_mismatch",

        placeName: identity.name,

        placeId,

        reviews: [],

      });

      return;

    }



    let rating: number | null = null;

    let userRatingCount: number | null = null;



    const { fromNew, legacyFetches } = await fetchAllReviewsForPlace(key, placeId);



    const freshLists: ReviewOut[][] = [];

    let legacyError = "";

    if (fromNew?.reviews?.length) {

      freshLists.push(fromNew.reviews);

      rating = fromNew.rating ?? rating;

      userRatingCount = fromNew.userRatingCount ?? userRatingCount;

    }

    for (const legacy of legacyFetches) {

      if (!legacy) continue;

      if ("error" in legacy && legacy.error) {

        legacyError = String(legacy.error);

        continue;

      }

      if (legacy.reviews.length) freshLists.push(legacy.reviews);

      rating = legacy.rating ?? rating;

      userRatingCount = legacy.userRatingCount ?? userRatingCount;

    }



    if (!freshLists.length) {

      const err =

        legacyError ||

        (fromNew == null && legacyFetches.every((l) => l == null) ? "google_http_error" : "no_reviews");

      if (serveStale(res, err)) return;

      res.status(200).json({ ok: false, source: "error", error: err, reviews: [] });

      return;

    }



    const priorAccum = Array.isArray(cache?.payload?.accumulatedReviews)

      ? (cache!.payload.accumulatedReviews as ReviewOut[])

      : loadFileCache()?.payload?.accumulatedReviews as ReviewOut[] | undefined ?? [];

    const reviews = mergeReviewLists(priorAccum, ...freshLists);



    if (!reviews.length) {

      if (serveStale(res, "reviews_rejected")) return;

      res.status(200).json({ ok: false, source: "error", error: "reviews_rejected", reviews: [] });

      return;

    }



    const payload = {

      ok: true,

      source: "google",

      placeId,

      placeName: identity.name,

      rating,

      userRatingCount,

      reviewsReturned: reviews.length,

      googlePlacesApiLimitPerRequest: GOOGLE_PLACES_REVIEWS_PER_REQUEST,

      googleReviewUrl: GOOGLE_REVIEW_URL,

      reviews,

      accumulatedReviews: reviews,

      fetchedAt: new Date().toISOString(),

    };



    cache = { version: CACHE_VERSION, fetchedAt: Date.now(), payload };

    saveFileCache(cache);

    res.json(payload);

  } catch (err) {

    if (serveStale(res, err instanceof Error ? err.message : "fetch_failed")) return;

    res.status(500).json({

      ok: false,

      source: "error",

      error: err instanceof Error ? err.message : "fetch_failed",

      reviews: [],

    });

  }

});



export default router;

