from pathlib import Path
import re
ROOT = Path(r"C:\Projects\HTRGroupLLC")
css = ROOT / "src/index.css"
bundle_css = ROOT / "assets/index-_bdQPowM.css"
bundle_js = ROOT / "assets/index-utf8-v4.js"
index_html = ROOT / "index.html"

REVIEWS_CSS = """.htr-google-reviews-grid {
  display: grid;
  gap: 0.375rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (min-width: 768px) {
  .htr-google-reviews-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .htr-google-reviews-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    grid-template-rows: repeat(2, auto);
  }
}
.htr-google-reviews-grid > * {
  min-height: 0;
}
"""

MARQUEE_CSS = """/* Center-converge brand marquee (between services and stats) */
.htr-brand-marquee-center__card {
  width: 180px;
  height: 90px;
  padding: 0.75rem;
  box-sizing: border-box;
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
}
.htr-brand-marquee-center__wing--left {
  -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 12%, #000 100%);
  mask-image: linear-gradient(to right, transparent 0%, #000 12%, #000 100%);
}
.htr-brand-marquee-center__wing--right {
  -webkit-mask-image: linear-gradient(to left, transparent 0%, #000 12%, #000 100%);
  mask-image: linear-gradient(to left, transparent 0%, #000 12%, #000 100%);
}
.htr-brand-marquee-center__seam {
  background: linear-gradient(90deg, transparent 0%, #fff 42%, #fff 58%, transparent 100%);
}
.htr-brand-marquee-center__track > * {
  position: relative;
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
    t = path.read_text(encoding="utf-8")
    t = re.sub(r"\.htr-google-reviews-grid \{[\s\S]*?\n\}\n\n/\* Center-converge", REVIEWS_CSS + "\n\n/* Center-converge", t, count=1)
    t = re.sub(r"/\* Center-converge brand marquee \(between services and stats\) \*/[\s\S]*\Z", MARQUEE_CSS.strip() + "\n", t, count=1)
    path.write_text(t, encoding="utf-8")
    print("css", path.name)

# load CENTER_JS from apply script by reading between markers
src = Path(r"C:\Projects\HTRGroupLLC\scripts\_apply_ui_fixes_jun11.py").read_text(encoding="utf-8")
CENTER_JS = src.split("CENTER_JS = r'''")[1].split("'''")[0]

js = bundle_js.read_text(encoding="utf-8")
i = js.find("function CenterConvergeMarquee")
j = js.find("const SERVICE_AREA_MAP_EMBED", i)
js = js[:i] + CENTER_JS + js[j:]
bundle_js.write_text(js, encoding="utf-8")
print("bundle js ok")

html = index_html.read_text(encoding="utf-8")
html = re.sub(r"\?v=\d+", "?v=39", html)
index_html.write_text(html, encoding="utf-8")
print("html v39")
