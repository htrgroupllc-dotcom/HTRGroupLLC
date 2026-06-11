# -*- coding: utf-8 -*-
from pathlib import Path
import shutil
import re

ROOT = Path(r"C:\Projects\HTRGroupLLC")
BACKUP = Path(r"C:\Projects\htrgr\REPLIT-LATEST\HTRGroupLLC-source\src\assets")
ASSETS = ROOT / "assets"
BUNDLE = ROOT / "assets" / "index-utf8-v4.js"
CSS_SRC = ROOT / "src" / "index.css"
CSS_DIST = ROOT / "assets" / "index-_bdQPowM.css"

GALLERY_FIX = [
    ("n85a", "photo_85_2026-04-02_02-41-17_1775273781273.jpg", "photo_85_2026-04-02_02-41-17_1775273781273-GalFix85.jpg"),
    ("h65a", "photo_65_2026-04-02_02-41-17_1775276590975.jpg", "photo_65_2026-04-02_02-41-17_1775276590975-GalFix65.jpg"),
    ("h73b", "photo_73_2026-04-02_02-42-16_1775276590977.jpg", "photo_73_2026-04-02_02-42-16_1775276590977-GalFix73.jpg"),
]

for var, src_name, dest_name in GALLERY_FIX:
    src = BACKUP / src_name
    if not src.is_file():
        raise SystemExit(f"missing backup {src}")
    dest = ASSETS / dest_name
    shutil.copy2(src, dest)
    print("copied", dest_name)

t = BUNDLE.read_text(encoding="utf-8")
for var, _src, dest_name in GALLERY_FIX:
    path = f"/assets/{dest_name}"
    pat = re.compile(rf'const {var} = "/assets/[^"]+";')
    if not pat.search(t):
        raise SystemExit(f"const {var} not in bundle")
    t = pat.sub(f'const {var} = "{path}";', t, count=1)
    print("bundle", var, "->", path)
BUNDLE.write_text(t, encoding="utf-8")

HERO_CSS = """
/* Home hero: keep blue banner from overlapping services grid */
.htr-home-hero-desktop {
  overflow: hidden;
  isolation: isolate;
}
.htr-home-hero-desktop .htr-hero-banner {
  max-height: 100%;
  overflow: auto;
}
#services {
  position: relative;
  z-index: 20;
}
"""

for css_path in (CSS_SRC, CSS_DIST):
    css = css_path.read_text(encoding="utf-8")
    if ".htr-home-hero-desktop" not in css:
        css = css.rstrip() + "\n" + HERO_CSS
        css_path.write_text(css, encoding="utf-8")
        print("css hero rules ->", css_path.name)

home = (ROOT / "src" / "pages" / "home.tsx").read_text(encoding="utf-8")
home_old = '<div className="hidden md:block relative">'
home_new = '<div className="hidden md:block relative htr-home-hero-desktop">'
if home_old not in home:
    raise SystemExit("home hero div not found")
home = home.replace(home_old, home_new, 1)
motion_old = '            <div className="absolute top-0 left-0 z-10">'
motion_new = '            <div className="absolute top-0 left-0 z-10 htr-hero-banner">'
if motion_old not in home:
    raise SystemExit("home hero banner div not found")
home = home.replace(motion_old, motion_new, 1)
(ROOT / "src" / "pages" / "home.tsx").write_text(home, encoding="utf-8")
print("home.tsx hero classes ok")

j = BUNDLE.read_text(encoding="utf-8")
j = j.replace(
    'className: "hidden md:block relative", children: [',
    'className: "hidden md:block relative htr-home-hero-desktop", children: [',
    1,
)
j = j.replace(
    'className: "absolute top-0 left-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(',
    'className: "absolute top-0 left-0 z-10 htr-hero-banner", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(',
    1,
)
BUNDLE.write_text(j, encoding="utf-8")
print("bundle hero classes ok")

PHONE_PAIR_TSX = '''
function BlogHeaderPhones() {
  return (
    <div className="header-phone-pair htr-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end">
      <a href={COMPANY_PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm" style={{ backgroundColor: K.accent }}>
        <Phone className="h-3.5 w-3.5" /> {COMPANY_PHONE_DISPLAY}
      </a>
      <a href={PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm" style={{ backgroundColor: K.accent }}>
        <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}
      </a>
    </div>
  );
}

function BlogHeaderPhonesMobile() {
  return (
    <div className="header-phone-pair htr-phone-pair flex flex-col gap-1.5 mt-1 items-start">
      <a href={COMPANY_PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit" style={{ backgroundColor: K.accent }}>
        <Phone className="h-3.5 w-3.5" /> {COMPANY_PHONE_DISPLAY}
      </a>
      <a href={PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit" style={{ backgroundColor: K.accent }}>
        <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}
      </a>
    </div>
  );
}
'''

def patch_blog_page(path: Path):
    h = path.read_text(encoding="utf-8")
    old_const = 'const PHONE_DISPLAY = "(346) 820-6021";\nconst PHONE_HREF    = "tel:3468206021";'
    new_const = 'import { PHONE_DISPLAY, PHONE_HREF, COMPANY_PHONE_DISPLAY, COMPANY_PHONE_HREF } from "@/lib/sitePhones";'
    if old_const in h:
        h = h.replace(old_const, new_const, 1)
    elif "sitePhones" not in h:
        raise SystemExit(f"{path.name}: phone constants missing")
    if "function BlogHeaderPhones" not in h:
        anchor = "const K = {"
        h = h.replace(anchor, PHONE_PAIR_TSX + "\n" + anchor, 1)
    desk_old = '''          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <a href={PHONE_HREF} className="flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm" style={{ backgroundColor: K.accent }}>
              <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}
            </a>'''
    desk_new = '''          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <BlogHeaderPhones />'''
    if desk_old in h:
        h = h.replace(desk_old, desk_new, 1)
    mob_old = '''            <a href={PHONE_HREF} className="flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit mt-1" style={{ backgroundColor: K.accent }}>
              <Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}
            </a>'''
    mob_new = '''            <BlogHeaderPhonesMobile />'''
    if mob_old in h:
        h = h.replace(mob_old, mob_new, 1)
    path.write_text(h, encoding="utf-8")
    print(path.name, "ok")

patch_blog_page(ROOT / "src" / "pages" / "blog.tsx")
patch_blog_page(ROOT / "src" / "pages" / "blog-post.tsx")

j = BUNDLE.read_text(encoding="utf-8")
if 'const COMPANY_PHONE_DISPLAY$5' not in j:
    j = j.replace(
        'const PHONE_HREF$1 = "tel:+13468206021";',
        'const PHONE_HREF$1 = "tel:+13468206021";\nconst COMPANY_PHONE_DISPLAY$5 = "(606) 660-6067";\nconst COMPANY_PHONE_HREF$5 = "tel:+16066606067";',
        1,
    )

BLOG_DESK_OLD = '''        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-2 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$1, className: "flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$1.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            " ",
            PHONE_DISPLAY$1
          ] }),'''
BLOG_DESK_NEW = '''        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-2 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair htr-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$5, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$1.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              " ",
              COMPANY_PHONE_DISPLAY$5
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$1, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$1.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              " ",
              PHONE_DISPLAY$1
            ] })
          ] }),'''

if BLOG_DESK_OLD not in j:
    raise SystemExit("blog desktop block missing")
j = j.replace(BLOG_DESK_OLD, BLOG_DESK_NEW, 1)

BLOG_MOB_OLD = '''        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$1, className: "flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit mt-1", style: { backgroundColor: K$1.accent }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
          " ",
          PHONE_DISPLAY$1
        ] })'''
BLOG_MOB_NEW = '''        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair htr-phone-pair flex flex-col gap-1.5 mt-1 items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$5, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit", style: { backgroundColor: K$5.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            " ",
            COMPANY_PHONE_DISPLAY$5
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$1, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit", style: { backgroundColor: K$1.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            " ",
            PHONE_DISPLAY$1
          ] })
        ] })'''

# fix typo K$5 -> K$1 in mobile block
BLOG_MOB_NEW = BLOG_MOB_NEW.replace("K$5.accent", "K$1.accent")

if BLOG_MOB_OLD not in j:
    raise SystemExit("blog mobile block missing")
j = j.replace(BLOG_MOB_OLD, BLOG_MOB_NEW, 1)

# BlogPost uses PHONE_HREF without suffix in header - add company constants if missing
if 'const COMPANY_PHONE_DISPLAY$6' not in j:
    j = j.replace(
        'const PHONE_HREF = "tel:+13468206021";',
        'const PHONE_HREF = "tel:+13468206021";\nconst COMPANY_PHONE_DISPLAY$6 = "(606) 660-6067";\nconst COMPANY_PHONE_HREF$6 = "tel:+16066606067";',
        1,
    )

POST_DESK_OLD = '''        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-2 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF, className: "flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            " ",
            PHONE_DISPLAY
          ] }),'''
POST_DESK_NEW = '''        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-2 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair htr-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$6, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              " ",
              COMPANY_PHONE_DISPLAY$6
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              " ",
              PHONE_DISPLAY
            ] })
          ] }),'''

if POST_DESK_OLD not in j:
    raise SystemExit("blogpost desktop block missing")
j = j.replace(POST_DESK_OLD, POST_DESK_NEW, 1)

POST_MOB_OLD = '''        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF, className: "flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit mt-1", style: { backgroundColor: K.accent }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
          " ",
          PHONE_DISPLAY
        ] })'''
POST_MOB_NEW = '''        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair htr-phone-pair flex flex-col gap-1.5 mt-1 items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$6, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit", style: { backgroundColor: K.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            " ",
            COMPANY_PHONE_DISPLAY$6
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit", style: { backgroundColor: K.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            " ",
            PHONE_DISPLAY
          ] })
        ] })'''

if POST_MOB_OLD not in j:
    raise SystemExit("blogpost mobile block missing")
j = j.replace(POST_MOB_OLD, POST_MOB_NEW, 1)

BUNDLE.write_text(j, encoding="utf-8")
print("bundle blog phones ok")
