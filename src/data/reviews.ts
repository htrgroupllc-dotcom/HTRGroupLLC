export type ReviewData = {
  name: string;
  initials: string;
  avatarColor: string;
  rating: number;
  time: string;
  textEn: string;
  textEs: string;
  category: "5" | "4" | "recent";
};

/** Static fake reviews removed — use GET /api/google-reviews only. */
export const ALL_REVIEWS: ReviewData[] = [];
