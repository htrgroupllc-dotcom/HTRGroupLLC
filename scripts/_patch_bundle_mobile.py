from pathlib import Path
B = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
j = B.read_text(encoding="utf-8")

def insert_once(needle: str, insert: str, label: str):
    global j
    if insert.strip()[:40] in j and label in insert:
        # rough skip if already
        pass
    c = j.count(needle)
    if c == 0:
        raise SystemExit(f"{label}: needle missing")
    if "htr-header-mobile-strip md:hidden" in j[j.find(needle)-200:j.find(needle)+200]:
        print(label, "skip")
        return
    j = j.replace(needle, insert, 1)
    print(label, "ok")

HOME_NEEDLE = '''      ] }),
      menuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700", children: [
        ["/", "#services", "#about", "#faq", "#contact"].map'''

HOME_INSERT = '''      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-header-mobile-strip md:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-2 flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), " ", COMPANY_PHONE_DISPLAY$3] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), " ", PHONE_DISPLAY$3] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#contact", className: "htr-header-mobile-book text-white font-bold px-3 py-2 rounded text-sm uppercase tracking-wider", style: { backgroundColor: K$3.dark }, children: T2.bookNow })
        ] })
      ] }),
      menuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700", children: [
        ["/", "#services", "#about", "#faq", "#contact"].map'''

BLOG_NEEDLE = '''      ] }),
      menuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700", children: [
        T2.nav.map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: navHrefs[i], onClick: () => setMenuOpen(false), className: "py-2 border-b border-stone-100", children: label }, label)),'''

def blog_insert(k, cref, cd, pref, pd):
    return f'''      ] }}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {{ className: "htr-header-mobile-strip md:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {{ className: "container mx-auto px-4 py-2 flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {{ className: "header-phone-pair htr-phone-pair flex flex-col gap-1.5 items-stretch w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", {{ href: {cref}, className: "header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full", style: {{ backgroundColor: {k}.accent }}, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, {{ className: "h-3.5 w-3.5" }}), " ", {cd}] }}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", {{ href: {pref}, className: "header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full", style: {{ backgroundColor: {k}.accent }}, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, {{ className: "h-3.5 w-3.5" }}), " ", {pd}] }})
          ] }}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", {{ href: `${{base}}/#contact`, className: "htr-header-mobile-book text-white font-bold px-3 py-2 rounded text-sm uppercase tracking-wider", style: {{ backgroundColor: {k}.dark }}, children: T2.bookNow }})
        ] }})
      ] }}),
      menuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {{ className: "md:hidden bg-white border-t border-stone-100 px-4 pb-3 flex flex-col gap-2 text-sm font-semibold text-stone-700", children: [
        T2.nav.map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", {{ href: navHrefs[i], onClick: () => setMenuOpen(false), className: "py-2 border-b border-stone-100", children: label }}, label)),'''

if "htr-header-mobile-strip md:hidden" not in j.split('function Home()',1)[1][:12000]:
    if HOME_NEEDLE not in j:
        raise SystemExit('home needle')
    j = j.replace(HOME_NEEDLE, HOME_INSERT, 1)
    print('home ok')

# Blog - first occurrence after function Blog()
bi = j.find('function Blog()')
if bi >= 0:
    rest = j[bi:bi+12000]
    if 'htr-header-mobile-strip md:hidden' not in rest:
        ins = blog_insert('K$1', 'COMPANY_PHONE_HREF$5', 'COMPANY_PHONE_DISPLAY$5', 'PHONE_HREF$5', 'PHONE_DISPLAY$5')
        if BLOG_NEEDLE not in rest:
            raise SystemExit('blog needle in fn')
        rest2 = rest.replace(BLOG_NEEDLE, ins, 1)
        j = j[:bi] + rest2 + j[bi+12000:]
        print('blog ok')

# BlogPost
pi = j.find('function BlogPost()')
if pi >= 0:
    rest = j[pi:pi+12000]
    if 'htr-header-mobile-strip md:hidden' not in rest:
        ins = blog_insert('K', 'COMPANY_PHONE_HREF$6', 'COMPANY_PHONE_DISPLAY$6', 'PHONE_HREF', 'PHONE_DISPLAY')
        if BLOG_NEEDLE not in rest:
            raise SystemExit('blogpost needle')
        rest2 = rest.replace(BLOG_NEEDLE, ins, 1)
        j = j[:pi] + rest2 + j[pi+12000:]
        print('blogpost ok')

# Gallery - find menu needle with T2 or T
gi = j.find('function Gallery()')
if gi >= 0:
    rest = j[gi:gi+15000]
    if 'htr-header-mobile-strip md:hidden' not in rest:
        gn = BLOG_NEEDLE.replace('T2.nav', 'T.nav')
        ins = blog_insert('K$2', 'COMPANY_PHONE_HREF$2', 'COMPANY_PHONE_DISPLAY$2', 'PHONE_HREF$2', 'PHONE_DISPLAY$2').replace('T2.bookNow', 'T.bookNow')
        if gn not in rest:
            gn = BLOG_NEEDLE
            ins = ins.replace('T2.bookNow', 'T2.bookNow')
        if gn not in rest:
            raise SystemExit('gallery needle')
        rest2 = rest.replace(gn, ins, 1)
        j = j[:gi] + rest2 + j[gi+15000:]
        print('gallery ok')

old_aside = 'className: "flex flex-col gap-5", children: [\n          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-6 text-white", style: { backgroundColor: K.dark }'
new_aside = 'className: "htr-blog-post-aside flex flex-col gap-5", children: [\n          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-6 text-white", style: { backgroundColor: K.dark }'
if 'htr-blog-post-aside' not in j:
    if old_aside in j:
        j = j.replace(old_aside, new_aside, 1)
        print('aside ok')

# gallery header bar class
old_gal_bar = 'className: "container mx-auto px-4 htr-site-header-bar flex items-center justify-between gap-3"'
new_gal_bar = 'className: "container mx-auto px-4 htr-site-header-bar htr-blog-header-bar flex flex-wrap items-center justify-between gap-x-3 gap-y-2"'
if 'htr-blog-header-bar flex flex-wrap' not in j.split('function Gallery()',1)[1][:3000]:
    idx = j.find('function Gallery()')
    sub = j[idx:idx+5000]
    if old_gal_bar in sub:
        j = j[:idx] + sub.replace(old_gal_bar, new_gal_bar, 1) + j[idx+5000:]
        print('gallery bar ok')

B.write_text(j, encoding='utf-8')
print('done')
