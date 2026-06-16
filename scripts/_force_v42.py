# -*- coding: utf-8 -*-
from pathlib import Path
import re

ROOT = Path(r"C:/Projects/HTRGroupLLC")
home = ROOT / "src/pages/home.tsx"
index_css = ROOT / "src/index.css"
bundle_css = ROOT / "assets/index-_bdQPowM.css"
bundle_js = ROOT / "assets/index-utf8-v4.js"
bundle_prod = ROOT / "assets/index-utf8-v4.prod.js"
index_html = ROOT / "index.html"
api_route = ROOT / "api-server/src/routes/google-reviews.ts"

# --- API: merge reviews from multiple Google fetches + cache accumulation ---
api = api_route.read_text(encoding="utf-8")
if "function reviewDedupeKey" not in api:
    insert_after = "type ReviewOut = {\n"
    helpers = '''
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
  return out.filter((r) => r.rating >= 4);
}

'''
    api = api.replace(insert_after, helpers + insert_after, 1)

api = api.replace("const CACHE_VERSION = 3;", "const CACHE_VERSION = 4;")

api = api.replace(
    'detailsUrl.searchParams.set("fields", "rating,user_ratings_total,reviews");',
    'detailsUrl.searchParams.set("fields", "rating,user_ratings_total,reviews");\n  if (reviewsSort) detailsUrl.searchParams.set("reviews_sort", reviewsSort);',
)
api = api.replace(
    "async function fetchPlaceReviewsLegacy(key: string, placeId: string) {",
    "async function fetchPlaceReviewsLegacy(key: string, placeId: string, reviewsSort?: string) {",
)

# replace fetch block in router
old_fetch = """    let reviews: ReviewOut[] = [];
    let rating: number | null = null;
    let userRatingCount: number | null = null;

    const fromNew = await fetchPlaceReviewsNew(key, placeId);
    if (fromNew && fromNew.reviews.length) {
      reviews = fromNew.reviews;
      rating = fromNew.rating;
      userRatingCount = fromNew.userRatingCount;
    } else {
      const fromLegacy = await fetchPlaceReviewsLegacy(key, placeId);
      if (!fromLegacy) {
        res.status(502).json({ ok: false, source: "error", error: "google_http_error", reviews: [] });
        return;
      }
      if ("error" in fromLegacy && fromLegacy.error) {
        res.status(200).json({ ok: false, source: "error", error: fromLegacy.error, reviews: [] });
        return;
      }
      reviews = fromLegacy.reviews;
      rating = fromLegacy.rating;
      userRatingCount = fromLegacy.userRatingCount;
    }"""

new_fetch = """    let reviews: ReviewOut[] = [];
    let rating: number | null = null;
    let userRatingCount: number | null = null;

    const fromNew = await fetchPlaceReviewsNew(key, placeId);
    const legacyRelevant = await fetchPlaceReviewsLegacy(key, placeId, "most_relevant");
    const legacyNewest = await fetchPlaceReviewsLegacy(key, placeId, "newest");

    if (legacyRelevant && "error" in legacyRelevant && legacyRelevant.error) {
      res.status(200).json({ ok: false, source: "error", error: legacyRelevant.error, reviews: [] });
      return;
    }

    const freshLists: ReviewOut[][] = [];
    if (fromNew?.reviews?.length) {
      freshLists.push(fromNew.reviews);
      rating = fromNew.rating ?? rating;
      userRatingCount = fromNew.userRatingCount ?? userRatingCount;
    }
    if (legacyRelevant && !("error" in legacyRelevant)) {
      freshLists.push(legacyRelevant.reviews);
      rating = legacyRelevant.rating ?? rating;
      userRatingCount = legacyRelevant.userRatingCount ?? userRatingCount;
    }
    if (legacyNewest && !("error" in legacyNewest)) {
      freshLists.push(legacyNewest.reviews);
      rating = legacyNewest.rating ?? rating;
      userRatingCount = legacyNewest.userRatingCount ?? userRatingCount;
    }

    if (!freshLists.length) {
      res.status(502).json({ ok: false, source: "error", error: "google_http_error", reviews: [] });
      return;
    }

    const priorAccum = Array.isArray(cache?.payload?.accumulatedReviews)
      ? (cache!.payload.accumulatedReviews as ReviewOut[])
      : [];
    reviews = mergeReviewLists(priorAccum, ...freshLists);"""

if old_fetch in api:
    api = api.replace(old_fetch, new_fetch)
else:
    print("WARN: api fetch block not found")

api = api.replace(
    "      reviews,\n      fetchedAt: new Date().toISOString(),\n    };",
    "      reviews,\n      accumulatedReviews: reviews,\n      fetchedAt: new Date().toISOString(),\n    };",
)
api_route.write_text(api, encoding="utf-8")
print("api-route OK")

# --- home.tsx import + review cards without motion ---
ht = home.read_text(encoding="utf-8")
imp = '''import {
  GOOGLE_STAR_COLOR,
  REVIEWS_PER_PAGE,
  fetchGoogleReviewsFromApi,
  filterPositiveGoogleReviews,
} from "../lib/googleReviewsClient";
'''
if "from \"../lib/googleReviewsClient\"" not in ht:
    ht = ht.replace(
        'import { GOOGLE_REVIEW_URL } from "../data/googleBusinessReviews";',
        'import { GOOGLE_REVIEW_URL } from "../data/googleBusinessReviews";\n' + imp,
    )

ht = re.sub(
    r"<motion\.div\s+key=\{`\$\{r\.name\}-\$\{i\}`\}\s+initial=\"hidden\"\s+whileInView=\"visible\"\s+viewport=\{\{ once: true \}\}\s+variants=\{FADE_UP\}\s+className=\"bg-white rounded-lg p-2 md:p-2\.5 shadow-sm border border-stone-100 flex flex-col h-full min-h-0 htr-google-review-card\"\s*>",
    '<div key={`${r.name}-${i}`} className="bg-white rounded-lg p-2 md:p-2.5 shadow-sm border border-stone-100 flex flex-col h-full min-h-0 htr-google-review-card">',
    ht,
    count=1,
)
ht = ht.replace(
    "                  <p className=\"text-stone-600 text-[11px] md:text-xs leading-snug flex-1 line-clamp-3\">{isEs ? r.textEs : r.textEn}</p>\n                </motion.div>",
    "                  <p className=\"text-stone-600 text-[11px] md:text-xs leading-snug flex-1 line-clamp-3\">{isEs ? r.textEs : r.textEn}</p>\n                </div>",
    1,
)

# Center marquee TSX
new_center = '''function CenterConvergeMarquee({ brands, base }: { brands: [string, string][]; base: string }) {
  const all = [...brands, ...brands];
  const cardClass =
    "htr-brand-marquee-center__card flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-stone-100 shadow-sm p-2";

  return (
    <section className="htr-brand-marquee-center relative w-full py-6 bg-stone-50 border-y border-stone-200 overflow-hidden" aria-label="Brands we service">
      <div className="htr-brand-marquee-center__bleed w-screen relative left-1/2 -translate-x-1/2">
        <div className="htr-brand-marquee-center__stage relative w-full">
          <div className="htr-brand-marquee-center__row relative w-full min-h-[88px] h-[88px] overflow-hidden">
            <div className="htr-brand-marquee-center__seam pointer-events-none absolute left-1/2 top-0 bottom-0 z-20" aria-hidden="true" />
            <div className="htr-brand-marquee-center__wing htr-brand-marquee-center__wing--left absolute inset-y-0 left-0 w-1/2 overflow-hidden z-10">
              <div className="htr-brand-marquee-center__track htr-brand-marquee-center__track--left flex items-center gap-3 w-max h-full justify-end">
                {all.map(([name, file], i) => (
                  <div key={`l-${i}`} className={cardClass}>
                    <img
                      src={`${base}/logos/${file}.png`}
                      alt={name}
                      className="w-full h-full object-contain"
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="htr-brand-marquee-center__wing htr-brand-marquee-center__wing--right absolute inset-y-0 right-0 w-1/2 overflow-hidden z-10">
              <div className="htr-brand-marquee-center__track htr-brand-marquee-center__track--right flex items-center gap-3 w-max h-full justify-start">
                {all.map(([name, file], i) => (
                  <div key={`r-${i}`} className={cardClass}>
                    <img
                      src={`${base}/logos/${file}.png`}
                      alt={name}
                      className="w-full h-full object-contain"
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
'''
ht = re.sub(r"function CenterConvergeMarquee\([\s\S]*?\n\}\n\nexport default function Home", new_center + "\nexport default function Home", ht, count=1)
home.write_text(ht, encoding="utf-8")
print("home.tsx OK")

GRID_CSS = """/* Google Reviews — prod-safe (not purged) */
.htr-google-reviews .htr-google-star,
.htr-google-reviews svg.lucide-star {
  fill: #FBBC04 !important;
  color: #FBBC04 !important;
  stroke: #FBBC04 !important;
}
.htr-google-reviews-grid {
  display: grid !important;
  gap: 0.375rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (min-width: 768px) {
  .htr-google-reviews-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: none;
  }
}
@media (min-width: 1024px) {
  .htr-google-reviews-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
    grid-template-rows: repeat(2, auto) !important;
  }
}
.htr-google-reviews-grid > * {
  min-height: 0;
}
.htr-google-review-card {
  min-height: 0;
}
"""

MARQUEE_CSS = """/* Center-converge brand marquee (between services and stats) */
.htr-brand-marquee-center__bleed {
  max-width: 100vw;
}
.htr-brand-marquee-center__card {
  width: 150px;
  height: 72px;
  padding: 0.5rem;
  box-sizing: border-box;
}
.htr-brand-marquee-center__card img {
  filter: none !important;
  -webkit-filter: none !important;
  opacity: 1;
}
.htr-brand-marquee-center {
  min-height: 88px;
}
.htr-brand-marquee-center__row {
  position: relative;
  overflow: hidden;
  height: 88px;
  min-height: 88px;
}
.htr-brand-marquee-center__wing--left {
  height: 100%;
  -webkit-mask-image: linear-gradient(to right, #000 0%, #000 52%, transparent 96%, transparent 100%);
  mask-image: linear-gradient(to right, #000 0%, #000 52%, transparent 96%, transparent 100%);
}
.htr-brand-marquee-center__wing--right {
  height: 100%;
  -webkit-mask-image: linear-gradient(to left, #000 0%, #000 52%, transparent 96%, transparent 100%);
  mask-image: linear-gradient(to left, #000 0%, #000 52%, transparent 96%, transparent 100%);
}
.htr-brand-marquee-center__seam {
  width: min(32vw, 220px);
  margin-left: calc(min(32vw, 220px) / -2);
  background: linear-gradient(
    90deg,
    transparent 0%,
    #f9fafb 28%,
    #f9fafb 72%,
    transparent 100%
  );
}
.htr-brand-marquee-center__stage::before,
.htr-brand-marquee-center__stage::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4rem;
  z-index: 30;
  pointer-events: none;
}
.htr-brand-marquee-center__stage::before {
  left: 0;
  background: linear-gradient(to right, #f9fafb, transparent);
}
.htr-brand-marquee-center__stage::after {
  right: 0;
  background: linear-gradient(to left, #f9fafb, transparent);
}
.htr-brand-marquee-center__track--left {
  animation: htr-marquee-center-left 90s linear infinite;
  will-change: transform;
}
.htr-brand-marquee-center__track--right {
  animation: htr-marquee-center-right 90s linear infinite;
  will-change: transform;
}
@keyframes htr-marquee-center-left {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}
@keyframes htr-marquee-center-right {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
"""

def replace_css_block(text: str, start_marker: str, end_marker: str, new_block: str) -> str:
    s = text.find(start_marker)
    e = text.find(end_marker, s + 1) if s >= 0 else -1
    if s < 0 or e < 0:
        return text
    return text[:s] + new_block + text[e:]

for css_path in (index_css, bundle_css):
    t = css_path.read_text(encoding="utf-8")
    t = replace_css_block(t, "/* Google Reviews", "/* Center-converge brand marquee", GRID_CSS + "\n\n")
    t = replace_css_block(t, "/* Center-converge brand marquee", "/* Home: Why Us + Our Work", MARQUEE_CSS + "\n\n")
    css_path.write_text(t, encoding="utf-8")
print("css OK")

# bundle JS
js = bundle_js.read_text(encoding="utf-8")
# reviews motion -> div
old_motion = """googleHomeReviews.slice(reviewPage * 10, reviewPage * 10 + 10).map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            key: `${r.name}-${i}`,
            initial: "hidden",
            whileInView: "visible",
            viewport: { once: true },
            variants: FADE_UP$3,
            className: "bg-white rounded-lg p-2 md:p-2.5 shadow-sm border border-stone-100 flex flex-col h-full min-h-0 htr-google-review-card","""
new_motion = """googleHomeReviews.slice(reviewPage * 10, reviewPage * 10 + 10).map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            key: `${r.name}-${i}`,
            className: "bg-white rounded-lg p-2 md:p-2.5 shadow-sm border border-stone-100 flex flex-col h-full min-h-0 htr-google-review-card","""
if old_motion in js:
    js = js.replace(old_motion, new_motion, 1)
else:
    print("WARN: bundle motion block not found")

# CenterConvergeMarquee in bundle - replace function body via regex
js = re.sub(
    r"function CenterConvergeMarquee\(\{ brands, base \}\) \{[\s\S]*?\n\}\nfunction ",
    '''function CenterConvergeMarquee({ brands, base }) {
  const all = [...brands, ...brands];
  const cardClass = "htr-brand-marquee-center__card flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-stone-100 shadow-sm p-2";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "htr-brand-marquee-center relative w-full py-6 bg-stone-50 border-y border-stone-200 overflow-hidden", "aria-label": "Brands we service", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__bleed w-screen relative left-1/2 -translate-x-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__stage relative w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-brand-marquee-center__row relative w-full min-h-[88px] h-[88px] overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__seam pointer-events-none absolute left-1/2 top-0 bottom-0 z-20", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__wing htr-brand-marquee-center__wing--left absolute inset-y-0 left-0 w-1/2 overflow-hidden z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__track htr-brand-marquee-center__track--left flex items-center gap-3 w-max h-full justify-end", children: all.map(([name, file], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cardClass, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: `${base}/logos/${file}.png`, alt: name, className: "w-full h-full object-contain", draggable: false, loading: "lazy" }) }, `l-${i}`)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__wing htr-brand-marquee-center__wing--right absolute inset-y-0 right-0 w-1/2 overflow-hidden z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__track htr-brand-marquee-center__track--right flex items-center gap-3 w-max h-full justify-start", children: all.map(([name, file], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cardClass, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: `${base}/logos/${file}.png`, alt: name, className: "w-full h-full object-contain", draggable: false, loading: "lazy" }) }, `r-${i}`)) }) })
  ] }) }) }) });
}
function ''',
    js,
    count=1,
)

bundle_js.write_text(js, encoding="utf-8")
if bundle_prod.exists():
    bundle_prod.write_text(js, encoding="utf-8")
print("bundle js OK")

# index.html cache bump
h = index_html.read_text(encoding="utf-8")
h = re.sub(r"index-utf8-v4\.js\?v=\d+", "index-utf8-v4.js?v=42", h)
h = re.sub(r"index-_bdQPowM\.css\?v=\d+", "index-_bdQPowM.css?v=42", h)
index_html.write_text(h, encoding="utf-8")
print("index v42 OK")
