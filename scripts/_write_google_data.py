from pathlib import Path

ROOT = Path(r"C:/Projects/HTRGroupLLC")
data = ROOT / "src/data/googleBusinessReviews.ts"
data.write_text("""import type { ReviewData } from "./reviews";

export const GOOGLE_REVIEW_URL =
  "https://g.page/r/CU7DlHNCZb8hEAE/review";

export const GOOGLE_RATING = 5.0;
export const GOOGLE_REVIEW_COUNT = 9;

/** Featured reviews shown on the home page (Google Business profile). */
export const GOOGLE_FEATURED_REVIEWS: ReviewData[] = [
  {
    name: "Maksat",
    initials: "M",
    avatarColor: "#4285F4",
    rating: 5,
    time: "2 weeks ago",
    textEn:
      "A specialized company came out and quickly resolved the oven malfunction; they replaced a component on the control panel.",
    textEs:
      "Una empresa especializada salió y resolvió rápidamente el mal funcionamiento del horno; reemplazaron un componente del panel de control.",
    category: "5",
  },
  {
    name: "Mukhtar Quseynov",
    initials: "MQ",
    avatarColor: "#1A7A6E",
    rating: 5,
    time: "3 weeks ago",
    textEn:
      "Great experience with Hitechrepairgroup LLC. Professional technicians and fair pricing.",
    textEs:
      "Excelente experiencia con Hitechrepairgroup LLC. Técnicos profesionales y precios justos.",
    category: "5",
  },
  {
    name: "Brian T.",
    initials: "B",
    avatarColor: "#C0392B",
    rating: 5,
    time: "2 weeks ago",
    textEn:
      "Oven fixed same day I called. Kitchen spotless after they left.",
    textEs:
      "Horno arreglado el mismo día que llamé. La cocina impecable después de que se fueron.",
    category: "recent",
  },
  {
    name: "Matthew R.",
    initials: "M",
    avatarColor: "#2471A3",
    rating: 5,
    time: "1 month ago",
    textEn:
      "Oven igniter replaced. Works perfectly on first try. Highly recommend.",
    textEs:
      "Encendedor del horno reemplazado. Funciona perfectamente. Muy recomendado.",
    category: "5",
  },
  {
    name: "Emma L.",
    initials: "E",
    avatarColor: "#117A65",
    rating: 5,
    time: "3 weeks ago",
    textEn:
      "Oven igniters sparking constantly. Fixed same day. Safe and quiet now.",
    textEs:
      "Encendedores del horno chispeando. Arreglados ese día. Seguros y silenciosos.",
    category: "recent",
  },
];
""", encoding="utf-8")
print("written", data)
