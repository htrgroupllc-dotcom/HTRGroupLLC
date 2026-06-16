from pathlib import Path
ROOT = Path(r"C:/Projects/HTRGroupLLC")

css_block = """
/* Desktop: more space between logo and first nav link (Home) */
@media (min-width: 768px) {
  .htr-site-header-nav,
  .htr-blog-header-nav {
    margin-left: 2rem;
  }
}

/* Mobile flyout menu: align nav links slightly right of logo column */
@media (max-width: 767px) {
  .htr-site-header-mobile-menu {
    padding-left: 1.25rem;
  }
}
"""

needle = """.htr-blog-header-nav {
  flex: 1 1 auto;
  min-width: 0;
  flex-wrap: wrap;
  row-gap: 0.25rem;
}"""

for rel in ["src/index.css", "assets/index-_bdQPowM.css"]:
    p = ROOT / rel
    text = p.read_text(encoding="utf-8")
    if "Desktop: more space between logo" in text:
        print(rel, "already patched")
        continue
    if needle not in text:
        raise SystemExit(f"needle not found in {rel}")
    p.write_text(text.replace(needle, needle + css_block), encoding="utf-8")
    print("patched", rel)

nav_old = 'className="hidden md:flex items-center gap-5 text-sm font-semibold text-stone-600"'
nav_new = 'className="htr-site-header-nav hidden md:flex items-center gap-5 text-sm font-semibold text-stone-600"'
menu_old = 'className="md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700"'
menu_new = 'className="htr-site-header-mobile-menu md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700"'

for name in ["home.tsx", "gallery.tsx"]:
    p = ROOT / "src/pages" / name
    t = p.read_text(encoding="utf-8")
    if nav_old in t:
        t = t.replace(nav_old, nav_new, 1)
        print("nav", name)
    p.write_text(t, encoding="utf-8")

for name in ["home.tsx", "blog.tsx", "blog-post.tsx", "gallery.tsx"]:
    p = ROOT / "src/pages" / name
    t = p.read_text(encoding="utf-8")
    if menu_old in t:
        t = t.replace(menu_old, menu_new)
        p.write_text(t, encoding="utf-8")
        print("menu", name)

bp = ROOT / "assets/index-utf8-v4.js"
bt = bp.read_text(encoding="utf-8")
old_b = 'className: "hidden md:flex items-center gap-5 text-sm font-semibold text-stone-600"'
new_b = 'className: "htr-site-header-nav hidden md:flex items-center gap-5 text-sm font-semibold text-stone-600"'
count = bt.count(old_b)
if count:
    bp.write_text(bt.replace(old_b, new_b), encoding="utf-8")
    print("bundle nav replacements", count)
else:
    print("bundle htr-site-header-nav count", bt.count("htr-site-header-nav"))
