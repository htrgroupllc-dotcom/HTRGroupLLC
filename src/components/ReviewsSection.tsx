import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { GOOGLE_REVIEW_URL } from "../data/googleBusinessReviews";
import { GOOGLE_STAR_COLOR, REVIEWS_PER_PAGE } from "../lib/googleReviewsClient";
import type { ReviewData } from "../data/reviews";

type ReviewsCopy = {
  reviewsH2: string;
  reviewsLoading: string;
  writeReview: string;
  viewOnGoogle: string;
  empty: string;
  prev: string;
  next: string;
};

type Props = {
  reviews: ReviewData[];
  rating: number | null;
  reviewCount: number | null;
  loading: boolean;
  isEs: boolean;
  accentColor: string;
  bgColor: string;
  copy: ReviewsCopy;
};

function ReviewCard({
  review,
  isEs,
  compact,
}: {
  review: ReviewData;
  isEs: boolean;
  compact?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-100 flex flex-col h-full min-h-0 htr-google-review-card">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {review.profilePhotoUrl ? (
            <img
              src={review.profilePhotoUrl}
              alt=""
              className="htr-google-review-avatar rounded-full flex-shrink-0 object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="htr-google-review-avatar rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ backgroundColor: review.avatarColor }}
            >
              {review.initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="htr-google-review-name font-semibold text-stone-900 truncate">{review.name}</p>
            <p className="htr-google-review-time text-stone-400 leading-none">{review.time}</p>
          </div>
        </div>
        <span className="text-[#4285F4] font-extrabold text-sm leading-none flex-shrink-0" aria-hidden="true">
          G
        </span>
      </div>
      <div className="flex items-center gap-0.5 mb-1.5">
        {Array.from({ length: review.rating }).map((_, j) => (
          <Star
            key={j}
            className="htr-google-star htr-google-review-star"
            style={{ color: GOOGLE_STAR_COLOR, fill: GOOGLE_STAR_COLOR }}
          />
        ))}
      </div>
      <p className={`htr-google-review-body text-stone-600 flex-1 ${compact ? "line-clamp-4" : "line-clamp-3"}`}>
        {isEs ? review.textEs : review.textEn}
      </p>
      <a
        href={GOOGLE_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#4285F4] hover:underline"
      >
        <ExternalLink className="h-3 w-3 shrink-0" />
        {isEs ? "Ver en Google" : "View on Google"}
      </a>
    </div>
  );
}

export default function ReviewsSection({
  reviews,
  rating,
  reviewCount,
  loading,
  isEs,
  accentColor,
  bgColor,
  copy,
}: Props) {
  const [page, setPage] = useState(0);
  const [mobileIdx, setMobileIdx] = useState(0);

  const totalPages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pagedReviews = reviews.slice(
    safePage * REVIEWS_PER_PAGE,
    safePage * REVIEWS_PER_PAGE + REVIEWS_PER_PAGE,
  );
  const firstRow = pagedReviews.slice(0, 5);
  const secondRow = pagedReviews.slice(5, 10);

  useEffect(() => {
    setPage(0);
    setMobileIdx(0);
  }, [reviews.length]);

  const ratingLabel = rating != null ? rating.toFixed(1) : "—";

  return (
    <section id="reviews" className="htr-google-reviews py-10 md:py-12" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold">{copy.reviewsH2}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-stone-200 px-3 py-1.5 text-sm font-bold text-stone-800 shadow-sm">
                <span className="text-base font-extrabold text-[#4285F4] leading-none" aria-hidden="true">
                  G
                </span>
                <span>{ratingLabel}</span>
                <span className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 htr-google-star"
                      style={{ color: GOOGLE_STAR_COLOR, fill: GOOGLE_STAR_COLOR }}
                    />
                  ))}
                </span>
                <span className="text-stone-500 font-semibold">Google</span>
                <span className="text-stone-600">({reviewCount ?? 0} reviews)</span>
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {reviewCount != null
                  ? `${reviewCount} ${isEs ? "reseñas en Google" : "reviews on Google"}`
                  : loading
                    ? copy.reviewsLoading
                    : ""}
              </span>
            </div>
          </div>
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-sm font-bold px-5 py-3 rounded-lg text-white shadow-md transition-opacity hover:opacity-90 w-full sm:w-auto"
            style={{ backgroundColor: accentColor }}
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {copy.writeReview}
          </a>
        </div>

        {loading && !reviews.length && (
          <p className="text-sm text-stone-500 font-medium py-6 text-center">{copy.reviewsLoading}</p>
        )}
        {!loading && !reviews.length && (
          <p className="text-sm text-stone-500 font-medium py-6 text-center">{copy.empty}</p>
        )}

        {reviews.length > 0 && (
          <>
            {/* Mobile: single-card carousel */}
            <div className="md:hidden relative htr-google-reviews-mobile">
              <ReviewCard review={reviews[mobileIdx]!} isEs={isEs} compact />
              {reviews.length > 1 && (
                <div className="flex items-center justify-center gap-3 mt-3">
                  <button
                    type="button"
                    aria-label={copy.prev}
                    disabled={mobileIdx <= 0}
                    onClick={() => setMobileIdx((i) => Math.max(0, i - 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition-opacity disabled:opacity-40 hover:opacity-80"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-xs font-semibold text-stone-500 tabular-nums">
                    {mobileIdx + 1} / {reviews.length}
                  </span>
                  <button
                    type="button"
                    aria-label={copy.next}
                    disabled={mobileIdx >= reviews.length - 1}
                    onClick={() => setMobileIdx((i) => Math.min(reviews.length - 1, i + 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition-opacity disabled:opacity-40 hover:opacity-80"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Tablet + desktop: two rows of up to 5 cards */}
            <div className="relative htr-google-reviews-grid-wrap hidden md:block">
              <div className="space-y-4">
                <div className="htr-reviews-row gap-4">
                  {firstRow.map((r, i) => (
                    <ReviewCard key={`${r.name}-${safePage}-${i}`} review={r} isEs={isEs} />
                  ))}
                </div>
                <div className="htr-reviews-row gap-4">
                  {secondRow.map((r, i) => (
                    <ReviewCard key={`${r.name}-${safePage}-${i + 5}`} review={r} isEs={isEs} />
                  ))}
                </div>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    type="button"
                    aria-label={copy.prev}
                    disabled={safePage <= 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition-opacity disabled:opacity-40 hover:opacity-80"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-xs font-semibold text-stone-500 tabular-nums">
                    {safePage + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    aria-label={copy.next}
                    disabled={safePage >= totalPages - 1}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition-opacity disabled:opacity-40 hover:opacity-80"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {loading && reviews.length > 0 && (
          <p className="text-center text-[11px] text-stone-400 mt-2">
            {isEs ? "Actualizando reseñas…" : "Updating reviews…"}
          </p>
        )}
      </div>
    </section>
  );
}
