from pathlib import Path
p = Path(r"C:/Projects/HTRGroupLLC/src/pages/home.tsx")
h = p.read_text(encoding="utf-8")

if "googleBusinessReviews" not in h:
    h = h.replace(
        'import { ALL_REVIEWS } from "../data/reviews";',
        'import { ALL_REVIEWS } from "../data/reviews";\nimport {\n  GOOGLE_FEATURED_REVIEWS,\n  GOOGLE_REVIEW_COUNT,\n  GOOGLE_REVIEW_URL,\n} from "../data/googleBusinessReviews";',
        1,
    )

h = h.replace(
    'reviewsH2:   "Customer Reviews",\n    reviewsBased: "Based on 312 reviews",\n    writeReview:  "Write a Review",',
    'reviewsH2:   "Google Reviews",\n    reviewsBased: "9 reviews on Google",\n    writeReview:  "Leave a Google Review",',
    1,
)
h = h.replace(
    'reviewsH2:    "Reseñas de Clientes",\n    reviewsBased: "Basado en 312 reseñas",\n    writeReview:  "Escribir Reseña",',
    'reviewsH2:    "Reseñas en Google",\n    reviewsBased: "9 reseñas en Google",\n    writeReview:  "Dejar reseña en Google",',
    1,
)

old_logic = """  const filteredReviews =
    reviewTab === "all"    ? _dailyMix :
    reviewTab === "5"      ? _pickN(_fiveStar, 8) :
    reviewTab === "4"      ? _pickN(_fourStar, 8) :
                             _pickN(_recentRev, 8);"""

new_logic = """  const googleHomeReviews = GOOGLE_FEATURED_REVIEWS;
  const filteredReviews = googleHomeReviews;"""

if old_logic in h:
    h = h.replace(old_logic, new_logic, 1)
else:
    raise SystemExit("filteredReviews block not found")

old_section = """        {/* ── GOOGLE REVIEWS ── */}
        <section id="reviews" className="py-10" style={{ backgroundColor: K.bg }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-extrabold">{T.reviewsH2}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
                  <span className="text-sm font-semibold text-stone-600">5.0 · {T.reviewsBased}</span>
                  <span className="text-lg font-bold text-[#4285F4]">G</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href="https://google.com/maps" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded border border-stone-300 hover:bg-stone-100 transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" /> {T.writeReview}
                </a>
                <button onClick={handleRefresh} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded text-white transition-opacity hover:opacity-80" style={{ backgroundColor: K.accent }}>
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> {T.refresh}
                </button>
              </div>
            </div>

            <div className="flex gap-1 mb-5 bg-white rounded-lg p-1 w-fit shadow-sm border border-stone-200">
              {(["all","5","4","recent"] as Tab[]).map((key, i) => (
                <button key={key} onClick={() => setReviewTab(key)}
                  className="px-3 py-1.5 rounded text-xs font-semibold transition-all"
                  style={reviewTab === key ? { backgroundColor: K.accent, color: "#fff" } : { color: "#57534e" }}>
                  {T.tabLabels[i]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {filteredReviews.map((r, i) => (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
                  className="bg-white rounded-lg p-2.5 shadow-sm border border-stone-100 flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="h-7 w-7 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: r.avatarColor }}>{r.initials}</div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-stone-900 truncate">{r.name}</p>
                        <p className="text-[10px] text-stone-400 leading-none">{r.time}</p>
                      </div>
                    </div>
                    <span className="text-[#4285F4] font-bold text-base leading-none flex-shrink-0">G</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-stone-600 text-[11px] leading-snug flex-1 line-clamp-4">{isEs ? r.textEs : r.textEn}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>"""

new_section = """        {/* ── GOOGLE REVIEWS ── */}
        <section id="reviews" className="py-10 md:py-12" style={{ backgroundColor: K.bg }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold">{T.reviewsH2}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white border border-stone-200 px-3 py-1.5 text-sm font-bold text-stone-800 shadow-sm">
                    <span className="text-base font-extrabold text-[#4285F4] leading-none" aria-hidden="true">G</span>
                    <span>5.0</span>
                    <span className="flex gap-0.5" aria-label="5 out of 5 stars">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </span>
                    <span className="text-stone-500 font-semibold">Google</span>
                    <span className="text-stone-600">({GOOGLE_REVIEW_COUNT} reviews)</span>
                  </span>
                  <span className="text-xs text-stone-500 font-medium">{T.reviewsBased}</span>
                </div>
              </div>
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm font-bold px-5 py-3 rounded-lg text-white shadow-md transition-opacity hover:opacity-90 w-full sm:w-auto"
                style={{ backgroundColor: K.accent }}
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                {T.writeReview}
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {filteredReviews.map((r, i) => (
                <motion.div
                  key={`${r.name}-${i}`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={FADE_UP}
                  className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 flex flex-col h-full"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{ backgroundColor: r.avatarColor }}
                      >
                        {r.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-stone-900 truncate">{r.name}</p>
                        <p className="text-[11px] text-stone-400 leading-none">{r.time}</p>
                      </div>
                    </div>
                    <span className="text-[#4285F4] font-extrabold text-lg leading-none flex-shrink-0" aria-hidden="true">G</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed flex-1">{isEs ? r.textEs : r.textEn}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>"""

if old_section in h:
    h = h.replace(old_section, new_section, 1)
else:
    raise SystemExit("reviews section not found - check markers")

p.write_text(h, encoding="utf-8")
print("home.tsx patched OK")
