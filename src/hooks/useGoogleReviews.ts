import { useState, useEffect, useCallback, useMemo } from "react";
import type { ReviewData } from "../data/reviews";
import {
  fetchGoogleReviewsFromApi,
  filterPositiveGoogleReviews,
  isVerifiedGooglePlace,
  sortGoogleReviewsNewest,
} from "../lib/googleReviewsClient";

export function useGoogleReviews() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    const apiBase = (import.meta.env.VITE_API_BASE ?? "https://htr-group-llc-appliance-repair.replit.app").replace(/\/$/, "");
    setLoading(true);
    try {
      const data = await fetchGoogleReviewsFromApi(apiBase);
      const accept =
        data?.reviews &&
        Array.isArray(data.reviews) &&
        data.reviews.length > 0 &&
        (data.ok || data.source === "stale_cache" || data.source === "cache") &&
        isVerifiedGooglePlace(data.placeId);

      if (accept) {
        setReviews(sortGoogleReviewsNewest(filterPositiveGoogleReviews(data.reviews!)));
        if (typeof data.rating === "number") setRating(data.rating);
        if (typeof data.userRatingCount === "number") setReviewCount(data.userRatingCount);
        setSource(data.source ?? null);
      } else {
        setReviews([]);
        setRating(null);
        setReviewCount(null);
        setSource(data?.source ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const sortedReviews = useMemo(() => sortGoogleReviewsNewest(filterPositiveGoogleReviews(reviews)), [reviews]);

  return {
    reviews: sortedReviews,
    rating,
    reviewCount,
    loading,
    source,
    refresh: loadReviews,
  };
}
