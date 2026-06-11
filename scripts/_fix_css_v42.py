from pathlib import Path
import re
ROOT = Path(r"C:/Projects/HTRGroupLLC")
NEW = r"""
/* Google Reviews - prod-safe (not purged) */
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
  opacity: 1 !important;
}
.htr-google-review-card { min-height: 0; }

/* Center-converge brand marquee (between services and stats) */
.htr-brand-marquee-center__bleed { max-width: 100vw; }
.htr-brand-marquee-center__card {
  width: 150px; height: 72px; padding: 0.5rem; box-sizing: border-box;
}
.htr-brand-marquee-center__card img {
  filter: none !important; -webkit-filter: none !important; opacity: 1;
}
.htr-brand-marquee-center { min-height: 88px; }
.htr-brand-marquee-center__row {
  position: relative; overflow: hidden; height: 88px; min-height: 88px;
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
  background: linear-gradient(90deg, transparent 0%, #f9fafb 28%, #f9fafb 72%, transparent 100%);
}
.htr-brand-marquee-center__stage::before,
.htr-brand-marquee-center__stage::after {
  content: ""; position: absolute; top: 0; bottom: 0; width: 4rem; z-index: 30; pointer-events: none;
}
.htr-brand-marquee-center__stage::before {
  left: 0; background: linear-gradient(to right, #f9fafb, transparent);
}
.htr-brand-marquee-center__stage::after {
  right: 0; background: linear-gradient(to left, #f9fafb, transparent);
}
.htr-brand-marquee-center__track--left {
  animation: htr-marquee-center-left 90s linear infinite; will-change: transform;
}
.htr-brand-marquee-center__track--right {
  animation: htr-marquee-center-right 90s linear infinite; will-change: transform;
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
for rel in ["src/index.css", "assets/index-_bdQPowM.css"]:
    p = ROOT / rel
    t = p.read_text(encoding="utf-8")
    t2, n = re.subn(r"/\* Google Reviews[\s\S]*?(?=/\* Home: Why Us \+ Our Work)", NEW, t, count=1)
    if n != 1:
        raise SystemExit(f"replace failed for {rel}: {n}")
    p.write_text(t2, encoding="utf-8")
    print("ok", rel)
