import type { ReviewData } from "../data/reviews";

export const GOOGLE_STAR_COLOR = "#FBBC04";
export const REVIEWS_PER_PAGE = 10;

export type GoogleReviewsApiResponse = {
  ok?: boolean;
  source?: string;
  rating?: number | null;
  userRatingCount?: number | null;
  reviews?: ReviewData[];
};

export function filterPositiveGoogleReviews(live: ReviewData[]): ReviewData[] {
  return live.filter((r) => r.rating >= 4);
}

/** @deprecated use filterPositiveGoogleReviews */
export function mergePositiveGoogleReviews(live: ReviewData[]): ReviewData[] {
  return filterPositiveGoogleReviews(live);
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
