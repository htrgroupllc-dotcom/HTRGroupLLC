import type { ReviewData } from "../data/reviews";
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
  return `${r.name.toLowerCase()}|${(r.textEn || "").slice(0, 48)}`;
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
  const base = apiBase.replace(/\/$/, "");
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/google-reviews`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as GoogleReviewsApiResponse;
  } catch {
    return null;
  }
}

export function defaultGoogleMeta(): { rating: number; count: number } {
  return { rating: GOOGLE_RATING, count: GOOGLE_REVIEW_COUNT };
}
