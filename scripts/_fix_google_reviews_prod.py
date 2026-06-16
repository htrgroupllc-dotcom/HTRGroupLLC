from pathlib import Path

ROOT = Path(r"C:/Projects/HTRGroupLLC")
BUNDLE = ROOT / "assets/index-utf8-v4.js"
CSS = ROOT / "assets/index-_bdQPowM.css"
INDEX_CSS = ROOT / "src/index.css"
HOME = ROOT / "src/pages/home.tsx"
INDEX_HTML = ROOT / "index.html"

STAR_STYLE = 'style: { color: "#FBBC04", fill: "#FBBC04" }'
STAR_OLD_CLASSES = [
    'className: "h-3.5 w-3.5 fill-[#FBBC04] text-[#FBBC04]"',
    'className: "h-3 w-3 fill-[#FBBC04] text-[#FBBC04]"',
    'className: "h-3.5 w-3.5 fill-yellow-400 text-yellow-400"',
    'className: "h-3 w-3 fill-yellow-400 text-yellow-400"',
]
STAR_NEW = f'className: "h-3.5 w-3.5 htr-google-star", {STAR_STYLE}'

CSS_BLOCK = """
/* Google Reviews — prod-safe (not purged) */
.htr-google-reviews .htr-google-star,
.htr-google-reviews svg.lucide-star {
  fill: #FBBC04 !important;
  color: #FBBC04 !important;
  stroke: #FBBC04 !important;
}
.htr-google-reviews-grid {
  display: grid;
  gap: 0.5rem;
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
    grid-auto-rows: minmax(0, auto);
    max-height: none;
  }
}
"""

def patch_bundle(c: str) -> str:
    for old in STAR_OLD_CLASSES:
        c = c.replace(old, STAR_NEW)
    # header stars h-3 w-3 without fill class
    c = c.replace(
        'className: "h-3 w-3"',
        f'className: "h-3 w-3 htr-google-star", {STAR_STYLE}',
    )
    c = c.replace(
        'id: "reviews", className: "py-10 md:py-12"',
        'id: "reviews", className: "htr-google-reviews py-10 md:py-12"',
    )
    c = c.replace(
        'className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-2.5"',
        'className: "htr-google-reviews-grid gap-2 md:gap-2.5"',
    )
    c = c.replace(
        'className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"',
        'className: "htr-google-reviews-grid gap-2 md:gap-2.5"',
    )
    return c

def append_css(path: Path):
    text = path.read_text(encoding="utf-8")
    if "htr-google-reviews-grid" in text:
        return
    path.write_text(text.rstrip() + "\n" + CSS_BLOCK + "\n", encoding="utf-8")

def patch_home():
    if not HOME.exists():
        return
    t = HOME.read_text(encoding="utf-8")
    t = t.replace(
        '<section id="reviews" className="py-10 md:py-12"',
        '<section id="reviews" className="htr-google-reviews py-10 md:py-12"',
    )
    t = t.replace(
        'className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-2.5"',
        'className="htr-google-reviews-grid gap-2 md:gap-2.5"',
    )
    t = t.replace(
        'className="h-3 w-3" style={{ color: GOOGLE_STAR_COLOR, fill: GOOGLE_STAR_COLOR }}',
        'className="h-3 w-3 htr-google-star" style={{ color: GOOGLE_STAR_COLOR, fill: GOOGLE_STAR_COLOR }}',
    )
    HOME.write_text(t, encoding="utf-8")

def bump_html():
    t = INDEX_HTML.read_text(encoding="utf-8")
    t = t.replace("index-utf8-v4.js?v=30", "index-utf8-v4.js?v=31")
    t = t.replace("index-_bdQPowM.css?v=4", "index-_bdQPowM.css?v=5")
    if "?v=31" not in t:
        t = t.replace("index-utf8-v4.js", "index-utf8-v4.js?v=31")
    if "css?v=5" not in t:
        t = t.replace("index-_bdQPowM.css", "index-_bdQPowM.css?v=5")
    INDEX_HTML.write_text(t, encoding="utf-8")

c = BUNDLE.read_text(encoding="utf-8")
before = c.count("fill-[#FBBC04]")
c = patch_bundle(c)
after = c.count("fill-[#FBBC04]")
BUNDLE.write_text(c, encoding="utf-8")
append_css(CSS)
append_css(INDEX_CSS)
patch_home()
bump_html()
print(f"bundle: removed fill-[#FBBC04] {before}->{after}")
print("htr-google-reviews CSS appended, index.html bumped")
