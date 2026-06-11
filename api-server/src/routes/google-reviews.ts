import { Router, type IRouter } from "express";

const CACHE_TTL_MS = 3 * 60 * 60 * 1000;
const CACHE_VERSION = 7;

/** Verified via g.page/r/CU7DlHNCZb8hEAE (Maps feature 0x2066db6f9cc15e1b:0x21bf65427394c34e). */
const BUSINESS_LOCATION = { lat: 29.7463431, lng: -95.7612032 };

/** Canonical Place ID for Hitechrepairgroup LLC — never resolve via search when set. */
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
  if (/katy|richmond|fulshear|sugar land|houston|fulshear|fulshear|cinco ranch/i.test(a)) score += 3;
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
  return `${r.name}|${r.time}|${(r.textEn || "").slice(0, 80)}`.toLowerCase();
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
  return filterValidReviews(out);
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

async function fetchPlaceReviewsLegacy(key: string, placeId: string, reviewsSort?: string) {
  const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  detailsUrl.searchParams.set("place_id", placeId);
  detailsUrl.searchParams.set("fields", "rating,user_ratings_total,reviews");
  if (reviewsSort) detailsUrl.searchParams.set("reviews_sort", reviewsSort);
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
  const legacyRelevant = await fetchPlaceReviewsLegacy(key, placeId, "most_relevant");
  const legacyNewest = await fetchPlaceReviewsLegacy(key, placeId, "newest");
  return { fromNew, legacyRelevant, legacyNewest };
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
      res.status(200).json({ ok: false, source: "error", error: "place_identity_failed", reviews: [] });
      return;
    }

    const placeScore = scoreBusinessCandidate(identity.name, identity.address);
    if (placeScore < 10) {
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

    const collectFromFetches = (
      fromNew: Awaited<ReturnType<typeof fetchPlaceReviewsNew>>,
      legacyRelevant: Awaited<ReturnType<typeof fetchPlaceReviewsLegacy>>,
      legacyNewest: Awaited<ReturnType<typeof fetchPlaceReviewsLegacy>>,
    ) => {
      const freshLists: ReviewOut[][] = [];
      let nextRating: number | null = null;
      let nextCount: number | null = null;
      if (fromNew?.reviews?.length) {
        freshLists.push(fromNew.reviews);
        nextRating = fromNew.rating ?? nextRating;
        nextCount = fromNew.userRatingCount ?? nextCount;
      }
      if (legacyRelevant && !("error" in legacyRelevant)) {
        freshLists.push(legacyRelevant.reviews);
        nextRating = legacyRelevant.rating ?? nextRating;
        nextCount = legacyRelevant.userRatingCount ?? nextCount;
      }
      if (legacyNewest && !("error" in legacyNewest)) {
        freshLists.push(legacyNewest.reviews);
        nextRating = legacyNewest.rating ?? nextRating;
        nextCount = legacyNewest.userRatingCount ?? nextCount;
      }
      return { freshLists, nextRating, nextCount };
    };

    const { fromNew, legacyRelevant, legacyNewest } = await fetchAllReviewsForPlace(key, placeId);
    const collected = collectFromFetches(fromNew, legacyRelevant, legacyNewest);

    const legacyError =
      legacyRelevant && "error" in legacyRelevant && legacyRelevant.error
        ? String(legacyRelevant.error)
        : "";

    if (!collected.freshLists.length) {
      const err =
        legacyError ||
        (fromNew == null && legacyRelevant == null ? "google_http_error" : "no_reviews");
      res.status(200).json({ ok: false, source: "error", error: err, reviews: [] });
      return;
    }

    rating = collected.nextRating;
    userRatingCount = collected.nextCount;
    const reviews = mergeReviewLists(...collected.freshLists);

    if (!reviews.length) {
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
