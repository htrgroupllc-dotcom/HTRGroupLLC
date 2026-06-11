# -*- coding: utf-8 -*-
from pathlib import Path
import re

ROOT = Path(r"C:\Projects\HTRGroupLLC")

NEW_MARQUEE_JS = r'''function CenterConvergeMarquee({ brands, base }) {
  const cardClass = "htr-brand-marquee-center__card flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-stone-100 shadow-sm p-2";
  const renderStrip = (pfx) => brands.map(([name, file], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cardClass, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: `${base}/logos/${file}.png`, alt: name, className: "w-full h-full object-contain", draggable: false, loading: "lazy" }) }, `${pfx}-${i}`));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "htr-brand-marquee-center relative w-full py-6 bg-stone-50 border-y border-stone-200 overflow-hidden", "aria-label": "Brands we service", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__bleed w-screen relative left-1/2 -translate-x-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__stage relative w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-brand-marquee-center__row relative w-full min-h-[88px] h-[88px] overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__seam pointer-events-none absolute left-1/2 top-0 bottom-0 z-20", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__wing htr-brand-marquee-center__wing--left absolute inset-y-0 left-0 w-1/2 overflow-hidden z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-brand-marquee-center__track htr-brand-marquee-center__track--left flex items-center w-max h-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__strip flex items-center gap-3 flex-shrink-0", children: renderStrip("la") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__strip flex items-center gap-3 flex-shrink-0", "aria-hidden": "true", children: renderStrip("lb") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__wing htr-brand-marquee-center__wing--right absolute inset-y-0 right-0 w-1/2 overflow-hidden z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-brand-marquee-center__track htr-brand-marquee-center__track--right flex items-center w-max h-full justify-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__strip flex items-center gap-3 flex-shrink-0", children: renderStrip("ra") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__strip flex items-center gap-3 flex-shrink-0", "aria-hidden": "true", children: renderStrip("rb") })
    ] }) })
  ] }) }) }) });
}
'''

REVIEWS_ROW_OLD = 'className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"'
REVIEWS_ROW_NEW = 'className: "htr-reviews-row gap-4"'

REVIEWS_CSS = """
/* Reviews: two rows — explicit grid (Tailwind-safe on patched bundle) */
.htr-reviews-row {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .htr-reviews-row {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1024px) {
  .htr-reviews-row {
    grid-template-columns: repeat(5, 1fr);
  }
}

"""

STRIP_CSS = """.htr-brand-marquee-center__strip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}
"""

TRACK_JUSTIFY_CSS = """.htr-brand-marquee-center__track--right {
  justify-content: flex-end;
}
"""


def patch_bundle_js(path: Path) -> None:
    t = path.read_text(encoding="utf-8")
    s = t.find("function CenterConvergeMarquee({ brands, base }) {")
    e = t.find("const SERVICE_AREA_MAP_EMBED", s)
    if s == -1 or e == -1:
        raise SystemExit(f"{path.name}: CenterConvergeMarquee markers missing")
    t = t[:s] + NEW_MARQUEE_JS + t[e:]
    n = t.count(REVIEWS_ROW_OLD)
    if n < 2:
        raise SystemExit(f"{path.name}: expected 2 review row class occurrences, got {n}")
    t = t.replace(REVIEWS_ROW_OLD, REVIEWS_ROW_NEW)
    path.write_text(t, encoding="utf-8")
    print(f"{path.name}: marquee + reviews rows OK")


def patch_css(path: Path) -> None:
    t = path.read_text(encoding="utf-8")
    if ".htr-reviews-row" not in t:
        marker = "/* Center-converge brand marquee (between services and stats) */"
        if marker not in t:
            raise SystemExit(f"{path.name}: CSS marker missing")
        t = t.replace(marker, REVIEWS_CSS + marker)
    if ".htr-brand-marquee-center__strip" not in t:
        ins = ".htr-brand-marquee-center__track--left,\n.htr-brand-marquee-center__track--right {"
        if ins not in t:
            raise SystemExit(f"{path.name}: track CSS anchor missing")
        t = t.replace(ins, STRIP_CSS + ins)
    if "justify-content: flex-end" not in t or ".htr-brand-marquee-center__track--right {\n  justify-content" not in t:
        anchor = ".htr-brand-marquee-center__track--left {\n  animation:"
        if anchor not in t:
            raise SystemExit(f"{path.name}: left track animation anchor missing")
        t = t.replace(anchor, TRACK_JUSTIFY_CSS + ".htr-brand-marquee-center__track--left {\n  animation:")
    path.write_text(t, encoding="utf-8")
    print(f"{path.name}: CSS OK")


def patch_index_html() -> None:
    p = ROOT / "index.html"
    t = p.read_text(encoding="utf-8")
    t = re.sub(r"index-utf8-v4\.js\?v=\d+", "index-utf8-v4.js?v=58", t)
    t = re.sub(r"index-_bdQPowM\.css\?v=\d+", "index-_bdQPowM.css?v=58", t)
    p.write_text(t, encoding="utf-8")
    print("index.html v58 OK")


if __name__ == "__main__":
    patch_bundle_js(ROOT / "assets" / "index-utf8-v4.js")
    prod = ROOT / "assets" / "index-utf8-v4.prod.js"
    if prod.exists():
        patch_bundle_js(prod)
    patch_css(ROOT / "assets" / "index-_bdQPowM.css")
    patch_index_html()
