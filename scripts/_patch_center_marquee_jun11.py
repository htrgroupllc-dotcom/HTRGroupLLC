# -*- coding: utf-8 -*-
from pathlib import Path
import re

ROOT = Path(r"C:\Projects\HTRGroupLLC")
home = ROOT / "src" / "pages" / "home.tsx"
css = ROOT / "src" / "index.css"
bundle_css = ROOT / "assets" / "index-_bdQPowM.css"
bundle_js = ROOT / "assets" / "index-utf8-v4.js"
bundle_prod = ROOT / "assets" / "index-utf8-v4.prod.js"
index_html = ROOT / "index.html"

NEW_TSX = r'''function CenterConvergeMarquee({ brands, base }: { brands: [string, string][]; base: string }) {
  const all = [...brands, ...brands];
  const cardClass =
    "htr-brand-marquee-center__card flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-stone-100 shadow-sm p-3";

  return (
    <section className="htr-brand-marquee-center relative w-full py-6 bg-white border-y border-stone-100" aria-label="Brands we service">
      <div className="htr-brand-marquee-center__stage relative w-full">
        <div
          className="absolute left-0 top-0 bottom-0 w-20 z-30 pointer-events-none"
          style={{ background: "linear-gradient(to right, #ffffff, transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-20 z-30 pointer-events-none"
          style={{ background: "linear-gradient(to left, #ffffff, transparent)" }}
        />
        <div className="htr-brand-marquee-center__row relative w-full min-h-[96px] h-[96px] overflow-hidden">
          <div className="htr-brand-marquee-center__seam pointer-events-none absolute left-1/2 top-0 bottom-0 z-20 w-12 -ml-6" />
          <div className="htr-brand-marquee-center__wing htr-brand-marquee-center__wing--left absolute inset-y-0 left-0 w-1/2 overflow-hidden z-10">
            <div className="htr-brand-marquee-center__track htr-brand-marquee-center__track--left flex items-center gap-4 w-max h-full justify-end">
              {all.map(([name, file], i) => (
                <div key={`l-${i}`} className={cardClass} style={{ width: 180, height: 90 }}>
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
            <div className="htr-brand-marquee-center__track htr-brand-marquee-center__track--right flex items-center gap-4 w-max h-full justify-start">
              {all.map(([name, file], i) => (
                <div key={`r-${i}`} className={cardClass} style={{ width: 180, height: 90 }}>
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
    </section>
  );
}

'''

NEW_JS = r'''function CenterConvergeMarquee({ brands, base }) {
  const all = [...brands, ...brands];
  const cardClass = "htr-brand-marquee-center__card flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-stone-100 shadow-sm p-3";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "htr-brand-marquee-center relative w-full py-6 bg-white border-y border-stone-100", "aria-label": "Brands we service", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-brand-marquee-center__stage relative w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 top-0 bottom-0 w-20 z-30 pointer-events-none", style: { background: "linear-gradient(to right, #ffffff, transparent)" } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 top-0 bottom-0 w-20 z-30 pointer-events-none", style: { background: "linear-gradient(to left, #ffffff, transparent)" } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-brand-marquee-center__row relative w-full min-h-[96px] h-[96px] overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__seam pointer-events-none absolute left-1/2 top-0 bottom-0 z-20 w-12 -ml-6" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__wing htr-brand-marquee-center__wing--left absolute inset-y-0 left-0 w-1/2 overflow-hidden z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__track htr-brand-marquee-center__track--left flex items-center gap-4 w-max h-full justify-end", children: all.map(([name, file], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cardClass, style: { width: 180, height: 90 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: `${base}/logos/${file}.png`, alt: name, className: "w-full h-full object-contain", draggable: false, loading: "lazy" }) }, `l-${i}`)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__wing htr-brand-marquee-center__wing--right absolute inset-y-0 right-0 w-1/2 overflow-hidden z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__track htr-brand-marquee-center__track--right flex items-center gap-4 w-max h-full justify-start", children: all.map(([name, file], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cardClass, style: { width: 180, height: 90 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: `${base}/logos/${file}.png`, alt: name, className: "w-full h-full object-contain", draggable: false, loading: "lazy" }) }, `r-${i}`)) }) })
    ] })
  ] }) });
}
'''

CSS_MARKER = "/* Center-converge brand marquee (between services and stats) */"
CSS_NEW = """/* Center-converge brand marquee (between services and stats) */
.htr-brand-marquee-center__card {
  width: 180px;
  height: 90px;
  padding: 0.75rem;
  box-sizing: border-box;
}
.htr-brand-marquee-center__card img {
  filter: none !important;
  -webkit-filter: none !important;
  opacity: 1;
}
.htr-brand-marquee-center {
  min-height: 96px;
}
.htr-brand-marquee-center__row {
  position: relative;
  overflow: hidden;
  height: 96px;
  min-height: 96px;
}
.htr-brand-marquee-center__wing--left,
.htr-brand-marquee-center__wing--right {
  height: 100%;
  -webkit-mask-image: none;
  mask-image: none;
}
.htr-brand-marquee-center__seam {
  background: linear-gradient(90deg, transparent 0%, #fff 42%, #fff 58%, transparent 100%);
}
.htr-brand-marquee-center__track--left {
  animation: htr-marquee-center-left 120s linear infinite;
  will-change: transform;
}
.htr-brand-marquee-center__track--right {
  animation: htr-marquee-center-right 120s linear infinite;
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

# --- home.tsx ---
ht = home.read_text(encoding="utf-8")
ht = re.sub(
    r"export default function Home(?:export default function Home)*\(\)",
    "export default function Home()",
    ht,
    count=1,
)
si = ht.find("function CenterConvergeMarquee")
ei = ht.find("\nexport default function Home()")
if si == -1 or ei == -1:
    raise SystemExit("home.tsx: CenterConvergeMarquee markers missing")
ht = ht[:si] + NEW_TSX + ht[ei + 1 :]
home.write_text(ht, encoding="utf-8")
print("home.tsx OK")

# --- CSS ---
for path in (css, bundle_css):
    text = path.read_text(encoding="utf-8")
    idx = text.find(CSS_MARKER)
    if idx == -1:
        raise SystemExit(f"{path.name}: CSS marker missing")
    rest = text[idx + len(CSS_MARKER) :]
    m = re.search(r"\n/\* Home:", rest)
    tail = rest[m.start() :] if m else ""
    path.write_text(text[:idx] + CSS_NEW + tail, encoding="utf-8")
    print(f"{path.name} OK")

# --- bundle js ---
js = bundle_js.read_text(encoding="utf-8")
js_start = js.find("function CenterConvergeMarquee({ brands, base }) {")
js_end = js.find("const SERVICE_AREA_MAP_EMBED", js_start)
if js_start == -1 or js_end == -1:
    raise SystemExit("bundle js markers missing")
js = js[:js_start] + NEW_JS + js[js_end:]
bundle_js.write_text(js, encoding="utf-8")
print("bundle js OK")
if bundle_prod.exists():
    prod = bundle_prod.read_text(encoding="utf-8")
    ps = prod.find("function CenterConvergeMarquee({ brands, base }) {")
    pe = prod.find("const SERVICE_AREA_MAP_EMBED", ps)
    if ps != -1 and pe != -1:
        prod = prod[:ps] + NEW_JS + prod[pe:]
        bundle_prod.write_text(prod, encoding="utf-8")
        print("bundle prod js OK")

html = index_html.read_text(encoding="utf-8")
html = re.sub(r"index-utf8-v4\.js\?v=\d+", "index-utf8-v4.js?v=41", html)
html = re.sub(r"index-_bdQPowM\.css\?v=\d+", "index-_bdQPowM.css?v=8", html)
index_html.write_text(html, encoding="utf-8")
print("index.html cache v41/v8")
