from pathlib import Path

BUNDLE = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js")
c = BUNDLE.read_text(encoding="utf-8")

repls = [
    ("reviewsH2: \"Customer Reviews\",\n    reviewsBased: \"Based on 312 reviews\",\n    writeReview: \"Write a Review\",",
     "reviewsH2: \"Google Reviews\",\n    reviewsBased: \"9 reviews on Google\",\n    writeReview: \"Leave a Google Review\","),
    ("reviewsH2: \"Reseñas de Clientes\",\n    reviewsBased: \"Basado en 312 reseñas\",\n    writeReview: \"Escribir Reseña\",",
     "reviewsH2: \"Reseñas en Google\",\n    reviewsBased: \"9 reseñas en Google\",\n    writeReview: \"Dejar reseña en Google\","),
]
for old, new in repls:
    if old not in c:
        raise SystemExit(f"missing TR block: {old[:40]}...")
    c = c.replace(old, new, 1)

dead = "  reviewTab === \"all\" ? _dailyMix : reviewTab === \"5\" ? _pickN(_fiveStar, 8) : reviewTab === \"4\" ? _pickN(_fourStar, 8) : _pickN(_recentRev, 8);\n"
google_const = r'''  const GOOGLE_REVIEW_URL_HOME = "https://g.page/r/CU7DlHNCZb8hEAE/review";
  const googleHomeReviews = [
    { name: "Maksat", initials: "M", avatarColor: "#4285F4", rating: 5, time: "2 weeks ago", textEn: "A specialized company came out and quickly resolved the oven malfunction; they replaced a component on the control panel.", textEs: "Una empresa especializada salió y resolvió rápidamente el mal funcionamiento del horno; reemplazaron un componente del panel de control." },
    { name: "Mukhtar Quseynov", initials: "MQ", avatarColor: "#1A7A6E", rating: 5, time: "3 weeks ago", textEn: "Great experience with Hitechrepairgroup LLC. Professional technicians and fair pricing.", textEs: "Excelente experiencia con Hitechrepairgroup LLC. Técnicos profesionales y precios justos." },
    { name: "Brian T.", initials: "B", avatarColor: "#C0392B", rating: 5, time: "2 weeks ago", textEn: "Oven fixed same day I called. Kitchen spotless after they left.", textEs: "Horno arreglado el mismo día que llamé. La cocina impecable después de que se fueron." },
    { name: "Matthew R.", initials: "M", avatarColor: "#2471A3", rating: 5, time: "1 month ago", textEn: "Oven igniter replaced. Works perfectly on first try. Highly recommend.", textEs: "Encendedor del horno reemplazado. Funciona perfectamente. Muy recomendado." },
    { name: "Emma L.", initials: "E", avatarColor: "#117A65", rating: 5, time: "3 weeks ago", textEn: "Oven igniters sparking constantly. Fixed same day. Safe and quiet now.", textEs: "Encendedores del horno chispeando. Arreglados ese día. Seguros y silenciosos." }
  ];
'''
if dead not in c:
    raise SystemExit("dead reviewTab line not found")
c = c.replace(dead, google_const, 1)

faq_marker = "      /* @__PURE__ */ jsxRuntimeExports.jsx(\"section\", { id: \"faq\", className: \"py-16 bg-white\""
if faq_marker not in c:
    raise SystemExit("faq marker not found")
if "id: \"reviews\"" in c[c.find("function Home"):c.find("function Home")+250000]:
    print("reviews section already in bundle Home - skip insert")
else:
    reviews_jsx = r'''
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "reviews", className: "py-10 md:py-12", style: { backgroundColor: K$3.bg }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl md:text-3xl font-extrabold", children: T2.reviewsH2 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full bg-white border border-stone-200 px-3 py-1.5 text-sm font-bold text-stone-800 shadow-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-extrabold text-[#4285F4] leading-none", "aria-hidden": "true", children: "G" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "5.0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex gap-0.5", "aria-label": "5 out of 5 stars", children: [1, 2, 3, 4, 5].map((si) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { key: si, className: "h-3.5 w-3.5 fill-yellow-400 text-yellow-400" })) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-stone-500 font-semibold", children: "Google" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-stone-600", children: "(9 reviews)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-stone-500 font-medium", children: T2.reviewsBased })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: GOOGLE_REVIEW_URL_HOME, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center justify-center gap-2 text-sm font-bold px-5 py-3 rounded-lg text-white shadow-md transition-opacity hover:opacity-90 w-full sm:w-auto", style: { backgroundColor: K$3.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 shrink-0" }),
            T2.writeReview
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4", children: googleHomeReviews.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            key: `${r.name}-${i}`,
            initial: "hidden",
            whileInView: "visible",
            viewport: { once: true },
            variants: FADE_UP$3,
            className: "bg-white rounded-xl p-4 shadow-sm border border-stone-100 flex flex-col h-full",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0", style: { backgroundColor: r.avatarColor }, children: r.initials }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-stone-900 truncate", children: r.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-stone-400 leading-none", children: r.time })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#4285F4] font-extrabold text-lg leading-none flex-shrink-0", "aria-hidden": "true", children: "G" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-0.5 mb-2", children: Array.from({ length: r.rating }).map((_, j) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { key: j, className: "h-3.5 w-3.5 fill-yellow-400 text-yellow-400" })) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-stone-600 text-sm leading-relaxed flex-1", children: isEs ? r.textEs : r.textEn })
            ]
          }
        )) })
      ] }) }),
'''
    c = c.replace(faq_marker, reviews_jsx + ",\n      " + faq_marker.lstrip(), 1)

BUNDLE.write_text(c, encoding="utf-8")
print("bundle patched OK")
