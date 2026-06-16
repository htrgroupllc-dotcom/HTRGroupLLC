# -*- coding: utf-8 -*-
from pathlib import Path
import re

ROOT = Path(r"C:\Projects\HTRGroupLLC")
home = ROOT / "src/pages/home.tsx"
css = ROOT / "src/index.css"
bundle_css = ROOT / "assets/index-_bdQPowM.css"
bundle_js = ROOT / "assets/index-utf8-v4.js"
index_html = ROOT / "index.html"

CENTER_TSX = r'''function CenterConvergeMarquee({ brands, base }: { brands: [string, string][]; base: string }) {
  const leftTrackRef = useRef<HTMLDivElement>(null);
  const rightTrackRef = useRef<HTMLDivElement>(null);
  const leftOffsetRef = useRef(0);
  const rightOffsetRef = useRef(0);
  const lastTsRef = useRef(0);
  const rafRef = useRef<number>();
  const leftInitRef = useRef(false);
  const rightInitRef = useRef(false);

  const wrapOffset = (offset: number, half: number) => {
    if (half <= 0) return offset;
    while (offset > 0) offset -= half;
    while (offset <= -half) offset += half;
    return offset;
  };

  useEffect(() => {
    leftInitRef.current = false;
    rightInitRef.current = false;
    const DURATION_MS = 120_000;
    const tick = (ts: number) => {
      const dt = lastTsRef.current ? ts - lastTsRef.current : 0;
      const leftTrack = leftTrackRef.current;
      const rightTrack = rightTrackRef.current;
      if (leftTrack && dt) {
        const half = leftTrack.scrollWidth / 2;
        if (half > 0) {
          const speed = half / DURATION_MS;
          if (!leftInitRef.current) {
            leftOffsetRef.current = -half;
            leftInitRef.current = true;
          }
          leftOffsetRef.current += speed * dt;
          leftOffsetRef.current = wrapOffset(leftOffsetRef.current, half);
          leftTrack.style.transform = `translateX(${leftOffsetRef.current}px)`;
        }
      }
      if (rightTrack && dt) {
        const half = rightTrack.scrollWidth / 2;
        if (half > 0) {
          const speed = half / DURATION_MS;
          if (!rightInitRef.current) {
            rightOffsetRef.current = 0;
            rightInitRef.current = true;
          }
          rightOffsetRef.current -= speed * dt;
          rightOffsetRef.current = wrapOffset(rightOffsetRef.current, half);
          rightTrack.style.transform = `translateX(${rightOffsetRef.current}px)`;
        }
      }
      lastTsRef.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const all = [...brands, ...brands];
  const cardClass =
    "htr-brand-marquee-center__card flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-stone-100 shadow-sm p-3";

  return (
    <section className="htr-brand-marquee-center py-6 bg-white border-y border-stone-100" aria-label="Brands we service">
      <div className="htr-brand-marquee-center__stage relative mx-auto w-full max-w-6xl px-4">
        <div className="htr-brand-marquee-center__row relative min-h-[96px] h-[96px] overflow-hidden">
          <div className="htr-brand-marquee-center__seam pointer-events-none absolute left-1/2 top-0 bottom-0 z-20 w-16 -ml-8" />
          <div className="htr-brand-marquee-center__wing htr-brand-marquee-center__wing--left absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden z-10">
            <div
              ref={leftTrackRef}
              className="htr-brand-marquee-center__track flex items-center gap-4 w-max h-full justify-end"
              style={{ willChange: "transform" }}
            >
              {all.map(([name, file], i) => (
                <div key={`l-${i}`} className={cardClass} style={{ width: 180, height: 90 }}>
                  <img src={`${base}/logos/${file}.png`} alt={name} className="w-full h-full object-contain" draggable={false} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
          <div className="htr-brand-marquee-center__wing htr-brand-marquee-center__wing--right absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden z-[15]">
            <div
              ref={rightTrackRef}
              className="htr-brand-marquee-center__track flex items-center gap-4 w-max h-full justify-start"
              style={{ willChange: "transform" }}
            >
              {all.map(([name, file], i) => (
                <div key={`r-${i}`} className={cardClass} style={{ width: 180, height: 90 }}>
                  <img src={`${base}/logos/${file}.png`} alt={name} className="w-full h-full object-contain" draggable={false} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}'''

CENTER_JS = r'''function CenterConvergeMarquee({ brands, base }) {
  const leftTrackRef = reactExports.useRef(null);
  const rightTrackRef = reactExports.useRef(null);
  const leftOffsetRef = reactExports.useRef(0);
  const rightOffsetRef = reactExports.useRef(0);
  const lastTsRef = reactExports.useRef(0);
  const rafRef = reactExports.useRef();
  const leftInitRef = reactExports.useRef(false);
  const rightInitRef = reactExports.useRef(false);
  const wrapOffsetCenter = (offset, half) => {
    if (half <= 0) return offset;
    while (offset > 0) offset -= half;
    while (offset <= -half) offset += half;
    return offset;
  };
  reactExports.useEffect(() => {
    leftInitRef.current = false;
    rightInitRef.current = false;
    const DURATION_MS = 12e4;
    const tick = (ts) => {
      const dt = lastTsRef.current ? ts - lastTsRef.current : 0;
      const leftTrack = leftTrackRef.current;
      const rightTrack = rightTrackRef.current;
      if (leftTrack && dt) {
        const half = leftTrack.scrollWidth / 2;
        if (half > 0) {
          const speed = half / DURATION_MS;
          if (!leftInitRef.current) {
            leftOffsetRef.current = -half;
            leftInitRef.current = true;
          }
          leftOffsetRef.current += speed * dt;
          leftOffsetRef.current = wrapOffsetCenter(leftOffsetRef.current, half);
          leftTrack.style.transform = `translateX(${leftOffsetRef.current}px)`;
        }
      }
      if (rightTrack && dt) {
        const half = rightTrack.scrollWidth / 2;
        if (half > 0) {
          const speed = half / DURATION_MS;
          if (!rightInitRef.current) {
            rightOffsetRef.current = 0;
            rightInitRef.current = true;
          }
          rightOffsetRef.current -= speed * dt;
          rightOffsetRef.current = wrapOffsetCenter(rightOffsetRef.current, half);
          rightTrack.style.transform = `translateX(${rightOffsetRef.current}px)`;
        }
      }
      lastTsRef.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
  const all = [...brands, ...brands];
  const cardClass = "htr-brand-marquee-center__card flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-stone-100 shadow-sm p-3";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "htr-brand-marquee-center py-6 bg-white border-y border-stone-100", "aria-label": "Brands we service", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__stage relative mx-auto w-full max-w-6xl px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-brand-marquee-center__row relative min-h-[96px] h-[96px] overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__seam pointer-events-none absolute left-1/2 top-0 bottom-0 z-20 w-16 -ml-8" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__wing htr-brand-marquee-center__wing--left absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: leftTrackRef, className: "htr-brand-marquee-center__track flex items-center gap-4 w-max h-full justify-end", style: { willChange: "transform" }, children: all.map(([name, file], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cardClass, style: { width: 180, height: 90 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: `${base}/logos/${file}.png`, alt: name, className: "w-full h-full object-contain", draggable: false, loading: "lazy" }) }, `l-${i}`)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__wing htr-brand-marquee-center__wing--right absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden z-[15]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: rightTrackRef, className: "htr-brand-marquee-center__track flex items-center gap-4 w-max h-full justify-start", style: { willChange: "transform" }, children: all.map(([name, file], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cardClass, style: { width: 180, height: 90 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: `${base}/logos/${file}.png`, alt: name, className: "w-full h-full object-contain", draggable: false, loading: "lazy" }) }, `r-${i}`)) }) })
  ] }) }) });
}
'''

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

MARQUEE_CSS = """
/* Center-converge brand marquee (between services and stats) */
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


def replace_block(text: str, start_marker: str, end_marker: str, new_block: str) -> str:
    s = text.find(start_marker)
    if s == -1:
        raise SystemExit(f"start not found: {start_marker[:40]}")
    e = text.find(end_marker, s)
    if e == -1:
        raise SystemExit(f"end not found after {start_marker[:40]}")
    return text[:s] + new_block.strip() + "\n\n" + text[e:]


# home.tsx CenterConvergeMarquee
ht = home.read_text(encoding="utf-8")
m = re.search(r"function CenterConvergeMarquee\([\s\S]*?\n\}\n\nexport default function Home", ht)
if not m:
    raise SystemExit("CenterConvergeMarquee block not found in home.tsx")
ht = ht[: m.start()] + CENTER_TSX + "\n\nexport default function Home" + ht[m.end() - len("export default function Home") :]

# compact review cards
ht = ht.replace(
    'className="bg-white rounded-lg p-2.5 md:p-3 shadow-sm border border-stone-100 flex flex-col h-full min-h-0"',
    'className="bg-white rounded-lg p-2 md:p-2.5 shadow-sm border border-stone-100 flex flex-col h-full min-h-0 htr-google-review-card"',
)
ht = ht.replace('className="h-9 w-9 rounded-full', 'className="h-8 w-8 rounded-full')
ht = ht.replace('line-clamp-4', 'line-clamp-3')
home.write_text(ht, encoding="utf-8")
print("home.tsx patched")

# CSS files
for path in (css, bundle_css):
    t = path.read_text(encoding="utf-8")
    t = replace_block(t, ".htr-google-reviews-grid {", "/* Center-converge brand marquee", REVIEWS_CSS)
    t = replace_block(t, "/* Center-converge brand marquee (between services and stats) */", ".htr-brand-marquee-stack", MARQUEE_CSS + "\n.htr-brand-marquee-stack")
    # fix duplicate .htr-brand-marquee-stack line if doubled
    t = t.replace(".htr-brand-marquee-stack\n.htr-brand-marquee-stack", ".htr-brand-marquee-stack")
    path.write_text(t, encoding="utf-8")
    print(f"css patched: {path.name}")

# bundle js
js = bundle_js.read_text(encoding="utf-8")
i = js.find("function CenterConvergeMarquee")
j = js.find("const SERVICE_AREA_MAP_EMBED", i)
if i == -1 or j == -1:
    raise SystemExit("CenterConvergeMarquee bounds not found in bundle")
js = js[:i] + CENTER_JS + js[j:]
bundle_js.write_text(js, encoding="utf-8")
print("bundle js patched")

# bump cache
html = index_html.read_text(encoding="utf-8")
html = re.sub(r"\?v=\d+", "?v=39", html)
index_html.write_text(html, encoding="utf-8")
print("index.html cache v=39")
