from pathlib import Path

ROOT = Path(r"C:\Projects\HTRGroupLLC")

CSS_BLOCK = """
/* Blog / blog-post header: phones must not overlap Book Now */
.htr-blog-header-bar {
  min-height: 3.5rem;
  height: auto;
  flex-wrap: wrap;
  align-content: center;
  row-gap: 0.375rem;
}
.htr-blog-header-nav {
  flex: 1 1 auto;
  min-width: 0;
  flex-wrap: wrap;
  row-gap: 0.25rem;
}
.htr-blog-header-actions {
  flex: 1 1 16rem;
  min-width: 0;
  max-width: 100%;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
}
.htr-blog-header-bar .header-phone-pair,
.htr-blog-header-phone-pair {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  justify-content: flex-end;
}
.htr-blog-header-bar .header-phone-link {
  flex: 0 1 auto;
  max-width: 100%;
  white-space: nowrap;
}
.htr-blog-book-now {
  flex: 0 0 auto;
  position: relative;
  z-index: 4;
}
@media (min-width: 768px) and (max-width: 1279px) {
  .htr-blog-header-actions {
    flex: 1 1 100%;
    max-width: 100%;
  }
}
"""

OLD_BAR = 'className="container mx-auto px-4 h-14 flex items-center justify-between gap-3"'
NEW_BAR = 'className="container mx-auto px-4 htr-site-header-bar htr-blog-header-bar flex flex-wrap items-center justify-between gap-x-3 gap-y-2"'

OLD_NAV = 'className="hidden md:flex items-center gap-5 text-sm font-semibold text-stone-600"'
NEW_NAV = 'className="htr-blog-header-nav hidden md:flex items-center gap-5 text-sm font-semibold text-stone-600"'

OLD_ACTIONS = 'className="hidden md:flex items-center gap-2 flex-shrink-0"'
NEW_ACTIONS = 'className="htr-blog-header-actions hidden md:flex items-center gap-2 flex-shrink-0 flex-wrap justify-end min-w-0"'

OLD_BOOK = 'className="text-white font-bold px-3 py-1.5 rounded text-sm uppercase tracking-wider" style={{ backgroundColor: K.dark }}'
NEW_BOOK = 'className="htr-blog-book-now shrink-0 whitespace-nowrap text-white font-bold px-3 py-1.5 rounded text-sm uppercase tracking-wider" style={{ backgroundColor: K.dark }}'

OLD_BOOK_K1 = 'className="text-white font-bold px-3 py-1.5 rounded text-sm uppercase tracking-wider" style={{ backgroundColor: K.accent }}'
# blog uses K.dark for book now - check blog-post

OLD_PHONES = 'className="header-phone-pair htr-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end"'
NEW_PHONES = 'className="header-phone-pair htr-phone-pair htr-blog-header-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end min-w-0 max-w-full"'


def patch_blog_tsx(path: Path):
    t = path.read_text(encoding="utf-8")
    if "htr-blog-header-bar" in t:
        print(path.name, "already patched")
        return
    c = t.count(OLD_BAR)
    if c != 1:
        raise SystemExit(f"{path.name}: bar count {c}")
    t = t.replace(OLD_BAR, NEW_BAR, 1)
    t = t.replace(OLD_NAV, NEW_NAV, 1)
    t = t.replace(OLD_ACTIONS, NEW_ACTIONS, 1)
    t = t.replace(OLD_BOOK, NEW_BOOK, 1)
    t = t.replace(OLD_PHONES, NEW_PHONES, 1)
    path.write_text(t, encoding="utf-8")
    print(path.name, "tsx ok")


for name in ("blog.tsx", "blog-post.tsx"):
    patch_blog_tsx(ROOT / "src" / "pages" / name)

for rel in ("src/index.css", "assets/index-_bdQPowM.css"):
    p = ROOT / rel
    t = p.read_text(encoding="utf-8")
    if ".htr-blog-header-bar" in t:
        print(rel, "css skip")
        continue
    t = t.rstrip() + "\n" + CSS_BLOCK
    p.write_text(t, encoding="utf-8")
    print(rel, "css ok")

BUNDLE = ROOT / "assets" / "index-utf8-v4.js"
j = BUNDLE.read_text(encoding="utf-8")

OLD_BAR_J = 'className: "container mx-auto px-4 h-14 flex items-center justify-between gap-3"'
NEW_BAR_J = 'className: "container mx-auto px-4 htr-site-header-bar htr-blog-header-bar flex flex-wrap items-center justify-between gap-x-3 gap-y-2"'

OLD_NAV_J = 'className: "hidden md:flex items-center gap-5 text-sm font-semibold text-stone-600"'
NEW_NAV_J = 'className: "htr-blog-header-nav hidden md:flex items-center gap-5 text-sm font-semibold text-stone-600"'

OLD_ACT_J = 'className: "hidden md:flex items-center gap-2 flex-shrink-0", children: [\n          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair htr-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end"'
NEW_ACT_J = 'className: "htr-blog-header-actions hidden md:flex items-center gap-2 flex-shrink-0 flex-wrap justify-end min-w-0", children: [\n          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair htr-phone-pair htr-blog-header-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end min-w-0 max-w-full"'

# Book now in blog uses K$1.dark and K.dark in blog-post
for old_book, new_book in [
    ('className: "text-white font-bold px-3 py-1.5 rounded text-sm uppercase tracking-wider", style: { backgroundColor: K$1.dark }',
     'className: "htr-blog-book-now shrink-0 whitespace-nowrap text-white font-bold px-3 py-1.5 rounded text-sm uppercase tracking-wider", style: { backgroundColor: K$1.dark }'),
    ('className: "text-white font-bold px-3 py-1.5 rounded text-sm uppercase tracking-wider", style: { backgroundColor: K.dark }',
     'className: "htr-blog-book-now shrink-0 whitespace-nowrap text-white font-bold px-3 py-1.5 rounded text-sm uppercase tracking-wider", style: { backgroundColor: K.dark }'),
]:
    n = j.count(old_book)
    if n:
        j = j.replace(old_book, new_book)

# Patch only blog/blog-post blocks: after function Blog() and BlogPost() - replace bar+nav in those sections
# Safer: replace paired markers unique to blog pages

def patch_blog_fn(fn_marker: str):
    global j
    idx = j.find(fn_marker)
    if idx < 0:
        raise SystemExit(f"missing {fn_marker}")
    chunk = j[idx:idx+8000]
    if OLD_BAR_J not in chunk:
        raise SystemExit(f"bar missing in {fn_marker}")
    new_chunk = chunk.replace(OLD_BAR_J, NEW_BAR_J, 1)
    new_chunk = new_chunk.replace(OLD_NAV_J, NEW_NAV_J, 1)
    if OLD_ACT_J not in new_chunk:
        raise SystemExit(f"actions missing in {fn_marker}")
    new_chunk = new_chunk.replace(OLD_ACT_J, NEW_ACT_J, 1)
    j = j[:idx] + new_chunk + j[idx+8000:]

patch_blog_fn("function Blog()")
patch_blog_fn("function BlogPost()")

BUNDLE.write_text(j, encoding="utf-8")
print("bundle ok")
