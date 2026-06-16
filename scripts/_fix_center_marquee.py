from pathlib import Path
import re

ROOT = Path(r"C:\Projects\HTRGroupLLC")
home = ROOT / "src" / "pages" / "home.tsx"
css = ROOT / "src" / "index.css"
bundle_css = ROOT / "assets" / "index-_bdQPowM.css"
bundle_js = ROOT / "assets" / "index-utf8-v4.js"
index_html = ROOT / "index.html"

NEW_TSX = r'''function CenterConvergeMarquee({ brands, base }: { brands: [string, string][]; base: string }) {
  const all = [...brands, ...brands];
  const cardClass =
    "htr-brand-marquee-center__card flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-stone-100 shadow-sm";

  return (
    <section className="htr-brand-marquee-center py-6 bg-white border-y border-stone-100" aria-label="Brands we service">
      <div className="htr-brand-marquee-center__stage relative mx-auto w-full max-w-6xl px-4">
        <div className="htr-brand-marquee-center__row relative h-[72px] md:h-[88px] overflow-hidden">
          <div className="htr-brand-marquee-center__seam pointer-events-none absolute left-1/2 top-0 bottom-0 z-30 w-20 -ml-10" />
          <div className="htr-brand-marquee-center__wing htr-brand-marquee-center__wing--left absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden z-10">
            <div className="htr-brand-marquee-center__track htr-brand-marquee-center__track--left flex items-center gap-3 md:gap-4 w-max h-full justify-end">
              {all.map(([name, file], i) => (
                <div key={`l-${i}`} className={cardClass}>
                  <img src={`${base}/logos/${file}.png`} alt={name} className="w-full h-full object-contain" draggable={false} loading="eager" decoding="async" />
                </div>
              ))}
            </div>
          </div>
          <div className="htr-brand-marquee-center__wing htr-brand-marquee-center__wing--right absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden z-20">
            <div className="htr-brand-marquee-center__track htr-brand-marquee-center__track--right flex items-center gap-3 md:gap-4 w-max h-full justify-start">
              {all.map(([name, file], i) => (
                <div key={`r-${i}`} className={cardClass}>
                  <img src={`${base}/logos/${file}.png`} alt={name} className="w-full h-full object-contain" draggable={false} loading="eager" decoding="async" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'''

ht = home.read_text(encoding="utf-8")
si = ht.find("function CenterConvergeMarquee")
ei = ht.find("\nexport default function Home()")
if si == -1 or ei == -1:
    raise SystemExit("home.tsx markers missing")
ht = ht[:si] + NEW_TSX + ht[ei+1:]
home.write_text(ht, encoding="utf-8")
print("home.tsx updated")

CSS_OLD_MARKER = "/* Center-converge brand marquee (between services and stats) */"
CSS_NEW = """/* Center-converge brand marquee (between services and stats) */
.htr-brand-marquee-center__card {
  width: 7.5rem;
  height: 3.75rem;
  padding: 0.5rem;
}
@media (min-width: 768px) {
  .htr-brand-marquee-center__card {
    width: 10rem;
    height: 5rem;
    padding: 0.75rem;
  }
}
.htr-brand-marquee-center__row {
  overflow: hidden;
}
.htr-brand-marquee-center__wing--left {
  -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 14%, #000 100%);
  mask-image: linear-gradient(to right, transparent 0%, #000 14%, #000 100%);
}
.htr-brand-marquee-center__wing--right {
  -webkit-mask-image: linear-gradient(to left, transparent 0%, #000 14%, #000 100%);
  mask-image: linear-gradient(to left, transparent 0%, #000 14%, #000 100%);
}
.htr-brand-marquee-center__seam {
  background: linear-gradient(90deg, transparent 0%, #fff 38%, #fff 62%, transparent 100%);
}
.htr-brand-marquee-center__track > * {
  position: relative;
}
.htr-brand-marquee-center__track--left {
  animation: htr-marquee-center-left 48s linear infinite;
  will-change: transform;
}
.htr-brand-marquee-center__track--right {
  animation: htr-marquee-center-right 48s linear infinite;
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
.htr-brand-marquee-center__wing--left .htr-brand-marquee-center__track > *:nth-child(odd) {
  z-index: 2;
}
.htr-brand-marquee-center__wing--left .htr-brand-marquee-center__track > *:nth-child(even) {
  z-index: 1;
}
.htr-brand-marquee-center__wing--right .htr-brand-marquee-center__track > *:nth-child(odd) {
  z-index: 1;
}
.htr-brand-marquee-center__wing--right .htr-brand-marquee-center__track > *:nth-child(even) {
  z-index: 2;
}
"""

for path in (css, bundle_css):
    text = path.read_text(encoding="utf-8")
    idx = text.find(CSS_OLD_MARKER)
    if idx == -1:
        raise SystemExit(f"{path.name}: CSS marker missing")
    text = text[:idx] + CSS_NEW
    path.write_text(text, encoding="utf-8")
    print(f"{path.name} updated")

NEW_JS = r'''function CenterConvergeMarquee({ brands, base }) {
  const all = [...brands, ...brands];
  const cardClass = "htr-brand-marquee-center__card flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-stone-100 shadow-sm";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "htr-brand-marquee-center py-6 bg-white border-y border-stone-100", "aria-label": "Brands we service", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__stage relative mx-auto w-full max-w-6xl px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-brand-marquee-center__row relative h-[72px] md:h-[88px] overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__seam pointer-events-none absolute left-1/2 top-0 bottom-0 z-30 w-20 -ml-10" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__wing htr-brand-marquee-center__wing--left absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__track htr-brand-marquee-center__track--left flex items-center gap-3 md:gap-4 w-max h-full justify-end", children: all.map(([name, file], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cardClass, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: `${base}/logos/${file}.png`, alt: name, className: "w-full h-full object-contain", draggable: false, loading: "eager", decoding: "async" }) }, `l-${i}`)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__wing htr-brand-marquee-center__wing--right absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden z-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__track htr-brand-marquee-center__track--right flex items-center gap-3 md:gap-4 w-max h-full justify-start", children: all.map(([name, file], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cardClass, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: `${base}/logos/${file}.png`, alt: name, className: "w-full h-full object-contain", draggable: false, loading: "eager", decoding: "async" }) }, `r-${i}`)) }) })
  ] }) }) });
}
'''

js = bundle_js.read_text(encoding="utf-8")
js_start = js.find("function CenterConvergeMarquee({ brands, base }) {")
js_end = js.find("const SERVICE_AREA_MAP_EMBED", js_start)
if js_start == -1 or js_end == -1:
    raise SystemExit("bundle js markers missing")
js = js[:js_start] + NEW_JS + js[js_end:]
bundle_js.write_text(js, encoding="utf-8")
print("bundle js updated")

html = index_html.read_text(encoding="utf-8")
html = re.sub(r"index-utf8-v4\.js\?v=\d+", "index-utf8-v4.js?v=35", html)
html = re.sub(r"index-_bdQPowM\.css\?v=\d+", "index-_bdQPowM.css?v=7", html)
index_html.write_text(html, encoding="utf-8")
print("index.html cache bumped")
