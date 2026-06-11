import type { ReviewData } from "./reviews";

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
  },,
{
    name: "James W.",
    initials: "JW",
    avatarColor: "#7D6608",
    rating: 5,
    time: "1 month ago",
    textEn: "Fixed my fridge same day, no drama. Highly recommend.",
    textEs: "Arreglaron la nevera el mismo dia. Muy recomendados.",
    category: "5",
  },
  {
    name: "Sarah J.",
    initials: "SJ",
    avatarColor: "#884EA0",
    rating: 5,
    time: "2 months ago",
    textEn: "Tech showed up on time and knew exactly what was wrong. Fair price.",
    textEs: "El tecnico llego puntual y supo el problema de inmediato. Precio justo.",
    category: "5",
  },
  {
    name: "David T.",
    initials: "DT",
    avatarColor: "#1F618D",
    rating: 5,
    time: "7 months ago",
    textEn: "Called at 8 AM, fixed by noon. Oven works perfectly now.",
    textEs: "Llame a las 8, arreglado al mediodia. El horno funciona perfecto.",
    category: "5",
  },
  {
    name: "Lisa M.",
    initials: "LM",
    avatarColor: "#D35400",
    rating: 5,
    time: "6 months ago",
    textEn: "Refrigerator back to normal after one visit. No hidden fees at all.",
    textEs: "La nevera normal despues de una visita. Sin cargos ocultos.",
    category: "5",
  },
  {
    name: "Maria S.",
    initials: "MS",
    avatarColor: "#1E8449",
    rating: 5,
    time: "2 months ago",
    textEn: "Called for dishwasher repair. Fixed same day, no extra fees.",
    textEs: "Llame por el lavavajillas. Arreglado ese dia, sin cargos extra.",
    category: "5",
  },
];
