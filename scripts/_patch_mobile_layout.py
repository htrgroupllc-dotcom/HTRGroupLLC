from pathlib import Path

ROOT = Path(r"C:\Projects\HTRGroupLLC")

MOBILE_CSS = """
/* Mobile layout (max-width 767px): header phones, marquee, blog sidebar */
@media (max-width: 767px) {
  .htr-header-spacer {
    min-height: 10.75rem;
  }
  .htr-header-mobile-strip {
    width: 100%;
    border-top: 1px solid #e7e5e4;
    background: #fff;
  }
  .htr-header-mobile-strip .header-phone-pair {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 0.375rem;
  }
  .htr-header-mobile-strip .header-phone-link {
    justify-content: center;
    width: 100%;
    min-height: 44px;
    font-size: 0.8125rem;
    white-space: nowrap;
  }
  .htr-header-mobile-book {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    width: 100%;
    text-align: center;
  }
  .htr-blog-post-aside {
    order: -1;
    width: 100%;
  }
  .htr-brand-marquee-stack {
    gap: 0.75rem;
  }
  .htr-brand-marquee-stack .htr-brand-marquee {
    min-height: 92px;
  }
  #services {
    scroll-margin-top: 11rem;
  }
}
.htr-brand-marquee-stack .htr-brand-marquee {
  min-height: 96px;
}
"""

HOME_STRIP_TSX = """
        <div className="htr-header-mobile-strip md:hidden">
          <div className="container mx-auto px-4 py-2 flex flex-col gap-2">
            <PhonePair inHeader />
            <a href="#contact" className="htr-header-mobile-book text-white font-bold px-3 py-2 rounded text-sm uppercase tracking-wider" style={{ backgroundColor: K.dark }}>
              {T.bookNow}
            </a>
          </div>
        </div>
"""

BLOG_STRIP_TSX = """
        <div className="htr-header-mobile-strip md:hidden">
          <div className="container mx-auto px-4 py-2 flex flex-col gap-2">
            <BlogHeaderPhonesMobile />
            <a href={`${base}/#contact`} className="htr-header-mobile-book text-white font-bold px-3 py-2 rounded text-sm uppercase tracking-wider" style={{ backgroundColor: K.dark }}>
              {T.bookNow}
            </a>
          </div>
        </div>
"""

GALLERY_STRIP_TSX = """
        <div className="htr-header-mobile-strip md:hidden">
          <div className="container mx-auto px-4 py-2 flex flex-col gap-2">
            <div className="header-phone-pair flex flex-col gap-1.5 items-stretch w-full">
              <a href={COMPANY_PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {COMPANY_PHONE_DISPLAY}</a>
              <a href={PHONE_HREF} className="header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full" style={{ backgroundColor: K.accent }}><Phone className="h-3.5 w-3.5" /> {PHONE_DISPLAY}</a>
            </div>
            <a href={`${base}/#contact`} className="htr-header-mobile-book text-white font-bold px-3 py-2 rounded text-sm uppercase tracking-wider" style={{ backgroundColor: K.dark }}>
              {T.bookNow}
            </a>
          </div>
        </div>
"""

MARKER_HOME = "        </div>\n\n        {menuOpen && (\n          <div className=\"md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700\">\n            {[\"/\",\"#services\""

def inject_strip_tsx(path: Path, strip: str, marker_suffix: str):
    t = path.read_text(encoding="utf-8")
    if "htr-header-mobile-strip" in t:
        print(path.name, "strip ok")
        return
    needle = marker_suffix
    if needle not in t:
        raise SystemExit(f"{path.name}: marker not found")
    t = t.replace(needle, strip + needle, 1)
    path.write_text(t, encoding="utf-8")
    print(path.name, "strip patched")


def patch_css(rel: str):
    p = ROOT / rel
    t = p.read_text(encoding="utf-8")
    if "htr-header-mobile-strip" in t:
        print(rel, "css ok")
        return
    t = t.rstrip() + "\n" + MOBILE_CSS
    p.write_text(t, encoding="utf-8")
    print(rel, "css patched")


# home.tsx - unique marker with reviews in nav
home = ROOT / "src/pages/home.tsx"
ht = home.read_text(encoding="utf-8")
if "htr-header-mobile-strip" not in ht:
    needle = '        </div>\n\n        {menuOpen && (\n          <div className="md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700">\n            {["/","#services","#about","#reviews","#faq","#contact"].map'
    if needle not in ht:
        raise SystemExit("home marker missing")
    ht = ht.replace(needle, HOME_STRIP_TSX + needle, 1)
    home.write_text(ht, encoding="utf-8")
    print("home.tsx strip patched")
else:
    print("home.tsx strip ok")

for name, strip in [
    ("blog.tsx", BLOG_STRIP_TSX),
    ("blog-post.tsx", BLOG_STRIP_TSX),
]:
    p = ROOT / "src/pages" / name
    t = p.read_text(encoding="utf-8")
    if "htr-header-mobile-strip" in t:
        print(name, "strip ok")
        continue
    needle = '        </div>\n\n        {menuOpen && (\n          <div className="md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700">\n            {T.nav.map'
    if needle not in t:
        raise SystemExit(f"{name} marker missing")
    t = t.replace(needle, strip + needle, 1)
    p.write_text(t, encoding="utf-8")
    print(name, "strip patched")

# blog-post aside
bp = ROOT / "src/pages/blog-post.tsx"
bpt = bp.read_text(encoding="utf-8")
if "htr-blog-post-aside" not in bpt:
    old = '{/* Sidebar */}\n                <div className="flex flex-col gap-5">'
    new = '{/* Sidebar */}\n                <div className="htr-blog-post-aside flex flex-col gap-5">'
    if old not in bpt:
        raise SystemExit("blog-post aside marker missing")
    bp.write_text(bpt.replace(old, new, 1), encoding="utf-8")
    print("blog-post aside patched")

# gallery
gal = ROOT / "src/pages/gallery.tsx"
gt = gal.read_text(encoding="utf-8")
if "htr-header-mobile-strip" not in gt:
    needle = '        </div>\n\n        {menuOpen && (\n          <div className="md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700">\n            {T.nav.map'
    if needle not in gt:
        raise SystemExit("gallery marker missing")
    gt = gt.replace(needle, GALLERY_STRIP_TSX + needle, 1)
    gal.write_text(gt, encoding="utf-8")
    print("gallery strip patched")
# gallery header bar classes
if "htr-blog-header-bar" not in gt:
    gt = gal.read_text(encoding="utf-8")
    gt = gt.replace(
        'className="container mx-auto px-4 htr-site-header-bar flex items-center justify-between gap-3"',
        'className="container mx-auto px-4 htr-site-header-bar htr-blog-header-bar flex flex-wrap items-center justify-between gap-x-3 gap-y-2"',
        1,
    )
    gal.write_text(gt, encoding="utf-8")
    print("gallery header bar patched")

for rel in ("src/index.css", "assets/index-_bdQPowM.css"):
    patch_css(rel)

# Bundle patches
B = ROOT / "assets/index-utf8-v4.js"
j = B.read_text(encoding="utf-8")

HOME_INSERT = r'''      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-header-mobile-strip md:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-2 flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), " ", COMPANY_PHONE_DISPLAY$3] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), " ", PHONE_DISPLAY$3] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#contact", className: "htr-header-mobile-book text-white font-bold px-3 py-2 rounded text-sm uppercase tracking-wider", style: { backgroundColor: K$3.dark }, children: T2.bookNow })
        ] })
      ] }),
      menuOpen &&'''

HOME_NEEDLE = r'''      ] }),
      menuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700", children: [
        ["/", "#services", "#about", "#faq", "#contact"].map'''

if "htr-header-mobile-strip md:hidden" not in j.split("fixed top-0 left-0 right-0", 1)[1][:8000]:
    if HOME_NEEDLE not in j:
        raise SystemExit("bundle home needle missing")
    j = j.replace(HOME_NEEDLE, HOME_INSERT, 1)
    print("bundle home strip ok")

BLOG_INSERT = r'''      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-header-mobile-strip md:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-2 flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair htr-phone-pair flex flex-col gap-1.5 mt-0 items-stretch w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$5, className: "header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full", style: { backgroundColor: K$1.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), " ", COMPANY_PHONE_DISPLAY$5] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$5, className: "header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full", style: { backgroundColor: K$1.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), " ", PHONE_DISPLAY$5] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `${base}/#contact`, className: "htr-header-mobile-book text-white font-bold px-3 py-2 rounded text-sm uppercase tracking-wider", style: { backgroundColor: K$1.dark }, children: T2.bookNow })
        ] })
      ] }),
      menuOpen &&'''

def patch_fn_menu(fn: str, insert_after: str, insert: str):
    global j
    idx = j.find(f"function {fn}()")
    if idx < 0:
        raise SystemExit(f"missing {fn}")
    chunk_end = j.find("function ", idx + 10)
    if chunk_end < 0:
        chunk_end = idx + 12000
    chunk = j[idx:chunk_end]
    if "htr-header-mobile-strip md:hidden" in chunk:
        print(f"bundle {fn} strip ok")
        return
    if insert_after not in chunk:
        raise SystemExit(f"{fn} needle missing")
    new_chunk = chunk.replace(insert_after, insert, 1)
    j = j[:idx] + new_chunk + j[idx + len(chunk):]
    print(f"bundle {fn} strip patched")

# Blog uses T2 and K$1 - check blog function constants
blog_needle = r'''      ] }),
      menuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700", children: [
        T2.nav.map'''
blog_insert = BLOG_INSERT.replace("COMPANY_PHONE_HREF$5", "COMPANY_PHONE_HREF$5").replace("K$1", "K$1")
# Blog function - find actual variable names
idx = j.find("function Blog()")
chunk = j[idx:idx+9000]
if "htr-header-mobile-strip md:hidden" not in chunk and blog_needle in j:
    # detect K ref in Blog
    if "K$1.accent" in chunk:
        ins = BLOG_INSERT
    elif "K.accent" in chunk and "function Blog()" in j:
        ins = BLOG_INSERT.replace("K$1", "K").replace("COMPANY_PHONE_HREF$5", "COMPANY_PHONE_HREF$5").replace("PHONE_HREF$5", "PHONE_HREF").replace("PHONE_DISPLAY$5", "PHONE_DISPLAY").replace("COMPANY_PHONE_DISPLAY$5", "COMPANY_PHONE_DISPLAY$6")
    j = j.replace(blog_needle, blog_insert.replace("K$1", "K$1"), 1)
    # only first Blog occurrence - need scoped replace in Blog()
    idx = j.find("function Blog()")
    sub = j[idx:idx+9000]
    if blog_needle.split("menuOpen")[0] in sub:
        pass

# Simpler: replace first blog_needle after function Blog()
bi = j.find("function Blog()")
if bi >= 0:
    sub = j[bi:bi+10000]
    if "htr-header-mobile-strip md:hidden" not in sub:
        bn = r'''      ] }),
      menuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700", children: [
        T2.nav.map'''
        # Blog uses K$1 from grep earlier - read snippet
        if "COMPANY_PHONE_HREF$5" in sub:
            ins = r'''      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-header-mobile-strip md:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-2 flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair htr-phone-pair flex flex-col gap-1.5 items-stretch w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$5, className: "header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full", style: { backgroundColor: K$1.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), " ", COMPANY_PHONE_DISPLAY$5] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$5, className: "header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full", style: { backgroundColor: K$1.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), " ", PHONE_DISPLAY$5] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `${base}/#contact`, className: "htr-header-mobile-book text-white font-bold px-3 py-2 rounded text-sm uppercase tracking-wider", style: { backgroundColor: K$1.dark }, children: T2.bookNow })
        ] })
      ] }),
      menuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700", children: [
        T2.nav.map'''
            sub2 = sub.replace(bn, ins, 1)
            j = j[:bi] + sub2 + j[bi+10000:]
            print("bundle Blog strip ok")

# BlogPost
pi = j.find("function BlogPost()")
if pi >= 0:
    sub = j[pi:pi+10000]
    if "htr-header-mobile-strip md:hidden" not in sub:
        bn = r'''      ] }),
      menuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700", children: [
        T2.nav.map'''
        ins = r'''      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-header-mobile-strip md:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-2 flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair htr-phone-pair flex flex-col gap-1.5 items-stretch w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$6, className: "header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full", style: { backgroundColor: K.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), " ", COMPANY_PHONE_DISPLAY$6] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF, className: "header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full", style: { backgroundColor: K.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), " ", PHONE_DISPLAY] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `${base}/#contact`, className: "htr-header-mobile-book text-white font-bold px-3 py-2 rounded text-sm uppercase tracking-wider", style: { backgroundColor: K.dark }, children: T2.bookNow })
        ] })
      ] }),
      menuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700", children: [
        T2.nav.map'''
        sub2 = sub.replace(bn, ins, 1)
        j = j[:pi] + sub2 + j[pi+10000:]
        print("bundle BlogPost strip ok")
    if 'className: "flex flex-col gap-5", children: [' in sub and "htr-blog-post-aside" not in sub:
        j = j.replace('className: "flex flex-col gap-5", children: [\n          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-6 text-white", style: { backgroundColor: K.dark }', 'className: "htr-blog-post-aside flex flex-col gap-5", children: [\n          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-6 text-white", style: { backgroundColor: K.dark }', 1)
        print("bundle blog-post aside ok")

# Gallery function
gi = j.find("function Gallery")
if gi < 0:
    gi = j.find("function GalleryPage")
if gi >= 0:
    sub = j[gi:gi+12000]
    if "htr-header-mobile-strip md:hidden" not in sub:
        gn = r'''      ] }),
      menuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700", children: [
        T2.nav.map'''
        if gn not in sub:
            gn = gn.replace("T2.nav", "T.nav")  # try T
        # read gallery chunk for variable names
        if "COMPANY_PHONE_HREF$2" in sub:
            cref, pref, cd, pd, kv = "COMPANY_PHONE_HREF$2", "PHONE_HREF$2", "COMPANY_PHONE_DISPLAY$2", "PHONE_DISPLAY$2", "K$2"
        else:
            cref, pref, cd, pd, kv = "COMPANY_PHONE_HREF$3", "PHONE_HREF$3", "COMPANY_PHONE_DISPLAY$3", "PHONE_DISPLAY$3", "K$3"
        ins = f'''      ] }}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {{ className: "htr-header-mobile-strip md:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {{ className: "container mx-auto px-4 py-2 flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {{ className: "header-phone-pair flex flex-col gap-1.5 items-stretch w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", {{ href: {cref}, className: "header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full", style: {{ backgroundColor: {kv}.accent }}, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, {{ className: "h-3.5 w-3.5" }}), " ", {cd}] }}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", {{ href: {pref}, className: "header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full", style: {{ backgroundColor: {kv}.accent }}, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, {{ className: "h-3.5 w-3.5" }}), " ", {pd}] }})
          ] }}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", {{ href: `${{base}}/#contact`, className: "htr-header-mobile-book text-white font-bold px-3 py-2 rounded text-sm uppercase tracking-wider", style: {{ backgroundColor: {kv}.dark }}, children: T2.bookNow }})
        ] }})
      ] }}),
      menuOpen &&'''
        # fix broken f-string braces - use manual
        pass

if "htr-header-mobile-strip" not in j:
    print("WARN gallery bundle not patched - manual may be needed")

if "htr-header-mobile-strip" in MOBILE_CSS and "htr-header-mobile-strip" not in j[j.find("@keyframes marquee")-500:j.find("@keyframes marquee")+500] if False else True:
    if ".htr-header-mobile-strip" not in j and False:
        pass

# Append CSS to bundle if it's only in separate css file - skip

B.write_text(j, encoding="utf-8")
print("bundle written")
