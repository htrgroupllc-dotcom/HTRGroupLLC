# -*- coding: utf-8 -*-
from pathlib import Path

ROOT = Path(r"C:\Projects\HTRGroupLLC")
home = ROOT / "src" / "pages" / "home.tsx"
css = ROOT / "src" / "index.css"
bundle_css = ROOT / "assets" / "index-_bdQPowM.css"
bundle_js = ROOT / "assets" / "index-utf8-v4.js"

CENTER_TSX = r'''
function CenterConvergeMarquee({ brands, base }: { brands: [string, string][]; base: string }) {
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
    "htr-brand-marquee-center__card flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-stone-100 shadow-sm";

  return (
    <section className="htr-brand-marquee-center py-6 bg-white border-y border-stone-100" aria-label="Brands we service">
      <div className="htr-brand-marquee-center__stage relative mx-auto w-full max-w-6xl px-4">
        <div className="htr-brand-marquee-center__row relative h-[72px] md:h-[88px]">
          <div className="htr-brand-marquee-center__seam pointer-events-none absolute left-1/2 top-0 bottom-0 z-20 w-16 -ml-8" />
          <div className="htr-brand-marquee-center__wing htr-brand-marquee-center__wing--left absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden z-10">
            <div
              ref={leftTrackRef}
              className="htr-brand-marquee-center__track flex items-center gap-3 md:gap-4 w-max h-full justify-end"
              style={{ willChange: "transform" }}
            >
              {all.map(([name, file], i) => (
                <div key={`l-${i}`} className={cardClass}>
                  <img src={`${base}/logos/${file}.png`} alt={name} className="w-full h-full object-contain" draggable={false} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
          <div className="htr-brand-marquee-center__wing htr-brand-marquee-center__wing--right absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden z-[15]">
            <div
              ref={rightTrackRef}
              className="htr-brand-marquee-center__track flex items-center gap-3 md:gap-4 w-max h-full"
              style={{ willChange: "transform" }}
            >
              {all.map(([name, file], i) => (
                <div key={`r-${i}`} className={cardClass}>
                  <img src={`${base}/logos/${file}.png`} alt={name} className="w-full h-full object-contain" draggable={false} loading="lazy" />
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

CENTER_JS = r'''function CenterConvergeMarquee({ brands, base }) {
  const leftTrackRef = reactExports.useRef(null);
  const rightTrackRef = reactExports.useRef(null);
  const leftOffsetRef = reactExports.useRef(0);
  const rightOffsetRef = reactExports.useRef(0);
  const lastTsRef = reactExports.useRef(0);
  const rafRef = reactExports.useRef();
  const leftInitRef = reactExports.useRef(false);
  const rightInitRef = reactExports.useRef(false);
  const wrapOffset2 = (offset, half) => {
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
          leftOffsetRef.current = wrapOffset2(leftOffsetRef.current, half);
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
          rightOffsetRef.current = wrapOffset2(rightOffsetRef.current, half);
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
  const cardClass = "htr-brand-marquee-center__card flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-stone-100 shadow-sm";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "htr-brand-marquee-center py-6 bg-white border-y border-stone-100", "aria-label": "Brands we service", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__stage relative mx-auto w-full max-w-6xl px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-brand-marquee-center__row relative h-[72px] md:h-[88px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__seam pointer-events-none absolute left-1/2 top-0 bottom-0 z-20 w-16 -ml-8" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__wing htr-brand-marquee-center__wing--left absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: leftTrackRef, className: "htr-brand-marquee-center__track flex items-center gap-3 md:gap-4 w-max h-full justify-end", style: { willChange: "transform" }, children: all.map(([name, file], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cardClass, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: `${base}/logos/${file}.png`, alt: name, className: "w-full h-full object-contain", draggable: false, loading: "lazy" }) }, `l-${i}`)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__wing htr-brand-marquee-center__wing--right absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden z-[15]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: rightTrackRef, className: "htr-brand-marquee-center__track flex items-center gap-3 md:gap-4 w-max h-full", style: { willChange: "transform" }, children: all.map(([name, file], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cardClass, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: `${base}/logos/${file}.png`, alt: name, className: "w-full h-full object-contain", draggable: false, loading: "lazy" }) }, `r-${i}`)) }) })
  ] }) }) });
}
'''

CSS_BLOCK = """
/* Center-converge brand marquee (between services and stats) */
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
.htr-brand-marquee-center__wing--left {
  -webkit-mask-image: linear-gradient(to right, #000 55%, transparent 100%);
  mask-image: linear-gradient(to right, #000 55%, transparent 100%);
}
.htr-brand-marquee-center__wing--right {
  -webkit-mask-image: linear-gradient(to left, #000 55%, transparent 100%);
  mask-image: linear-gradient(to left, #000 55%, transparent 100%);
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

# --- home.tsx ---
ht = home.read_text(encoding="utf-8")
if "function CenterConvergeMarquee" not in ht:
    needle = "export default function Home()"
    if needle not in ht:
        raise SystemExit("home.tsx: export default function Home() not found")
    ht = ht.replace(needle, CENTER_TSX.strip() + "\n\n" + needle)
    print("home.tsx: added CenterConvergeMarquee function")
else:
    print("home.tsx: CenterConvergeMarquee already present")

usage = """        <CenterConvergeMarquee
          brands={MARQUEE_BRANDS}
          base={import.meta.env.BASE_URL.replace(/\\/$/, "")}
        />

"""
marker = '        </section>\n\n        {/*'
# find services->stats: after id="services" section close before about stats
insert_after = '            </div>\n          </div>\n        </section>\n\n        {/*'
idx = ht.find(insert_after)
if idx == -1:
    raise SystemExit("home.tsx: services/stats boundary not found")
if "CenterConvergeMarquee" not in ht[ht.find("id=\"services\""):ht.find('id="about"')]:
    ht = ht[: idx + len(insert_after)] + "\n" + usage + ht[idx + len(insert_after):]
    print("home.tsx: inserted usage between services and stats")
else:
    print("home.tsx: usage already between services and stats")

home.write_text(ht, encoding="utf-8")

# --- CSS ---
for path in (css, bundle_css):
    text = path.read_text(encoding="utf-8")
    if "htr-brand-marquee-center__card" not in text:
        path.write_text(text.rstrip() + "\n" + CSS_BLOCK + "\n", encoding="utf-8")
        print(f"CSS appended: {path.name}")
    else:
        print(f"CSS already in {path.name}")

# --- bundle js ---
js = bundle_js.read_text(encoding="utf-8")
if "function CenterConvergeMarquee" not in js:
    anchor = "const SERVICE_AREA_MAP_EMBED"
    if anchor not in js:
        raise SystemExit("bundle: SERVICE_AREA_MAP_EMBED anchor missing")
    js = js.replace(anchor, CENTER_JS + anchor)
    print("bundle js: added CenterConvergeMarquee")
else:
    print("bundle js: CenterConvergeMarquee already present")

js_marker = '      ] }) }),\n      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "about", className: "relative py-12", style: { background: "linear-gradient(135deg, #0B1A3F 0%, #0D47B0 50%, #1B6FE8 100%)" }'
js_insert = '      ] }) }),\n      /* @__PURE__ */ jsxRuntimeExports.jsx(CenterConvergeMarquee, { brands: MARQUEE_BRANDS, base: "/".replace(/\\/$/, "") }),\n      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "about", className: "relative py-12", style: { background: "linear-gradient(135deg, #0B1A3F 0%, #0D47B0 50%, #1B6FE8 100%)" }'
if "jsxRuntimeExports.jsx(CenterConvergeMarquee" not in js:
    if js_marker not in js:
        raise SystemExit("bundle: services/about boundary not found")
    js = js.replace(js_marker, js_insert, 1)
    print("bundle js: inserted CenterConvergeMarquee usage")
else:
    print("bundle js: usage already present")

bundle_js.write_text(js, encoding="utf-8")
print("done")
