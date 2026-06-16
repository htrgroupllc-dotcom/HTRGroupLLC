# -*- coding: utf-8 -*-
from pathlib import Path

root = Path(r"C:\Projects\HTRGroupLLC")

FOOTER_PHONE_TSX = '''
          <div className="htr-phone-pair--row flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-sm">
            <a href={COMPANY_PHONE_HREF} className="htr-phone-btn inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity">
              <Phone className="h-4 w-4" style={{ color: K.accentLight }} /> {COMPANY_PHONE_DISPLAY}
            </a>
            <a href={PHONE_HREF} className="htr-phone-btn inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity">
              <Phone className="h-4 w-4" style={{ color: K.accentLight }} /> {PHONE_DISPLAY}
            </a>
          </div>
'''

blog_post = root / "src/pages/blog-post.tsx"
bp = blog_post.read_text(encoding="utf-8")
marker = '          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">'
if "htr-phone-pair--row" not in bp.split("footer")[1] if "footer" in bp else True:
    if marker not in bp:
        raise SystemExit("blog-post footer marker not found")
    bp = bp.replace(marker, FOOTER_PHONE_TSX + marker, 1)
    blog_post.write_text(bp, encoding="utf-8", newline="\n")
    print("blog-post.tsx: footer phones added")
else:
    print("blog-post.tsx: footer phones already present")

blog = root / "src/pages/blog.tsx"
bl = blog.read_text(encoding="utf-8")
old_cta = '''        <div className="py-8 text-center" style={{ backgroundColor: K.dark }}>
          <p className="text-white font-bold text-lg mb-3">{T.ctaText}</p>
          <a href={PHONE_HREF} className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base" style={{ backgroundColor: K.accent }}>
            <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
          </a>
        </div>'''
new_cta = '''        <div className="py-8 text-center" style={{ backgroundColor: K.dark }}>
          <p className="text-white font-bold text-lg mb-3">{T.ctaText}</p>
          <div className="htr-phone-pair--row flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={COMPANY_PHONE_HREF} className="htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm" style={{ backgroundColor: K.accent }}>
              <Phone className="h-4 w-4" /> {COMPANY_PHONE_DISPLAY}
            </a>
            <a href={PHONE_HREF} className="htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm" style={{ backgroundColor: K.accent }}>
              <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
            </a>
          </div>
        </div>'''
if old_cta in bl:
    bl = bl.replace(old_cta, new_cta, 1)
    blog.write_text(bl, encoding="utf-8", newline="\n")
    print("blog.tsx: CTA band phones updated")
elif "htr-phone-pair--row" in bl and "ctaText" in bl:
    print("blog.tsx: CTA already has phone pair")
else:
    raise SystemExit("blog.tsx CTA block not found")

js = root / "assets/index-utf8-v4.js"
j = js.read_text(encoding="utf-8")

blog_cta_old = '''      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center", style: { backgroundColor: K$1.dark }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white font-bold text-lg mb-3", children: T2.ctaText }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$1, className: "inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base", style: { backgroundColor: K$1.accent }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
          " ",
          PHONE_DISPLAY$1
        ] })
      ] })'''

blog_cta_new = '''      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center", style: { backgroundColor: K$1.dark }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white font-bold text-lg mb-3", children: T2.ctaText }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-phone-pair--row flex flex-col sm:flex-row items-center justify-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$5, className: "htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm", style: { backgroundColor: K$1.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }), " ", COMPANY_PHONE_DISPLAY$5] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$1, className: "htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm", style: { backgroundColor: K$1.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }), " ", PHONE_DISPLAY$1] })
        ] })
      ] })'''

if blog_cta_old in j:
    j = j.replace(blog_cta_old, blog_cta_new, 1)
    print("bundle: Blog CTA updated")
elif "COMPANY_PHONE_HREF$5" in j and "ctaText" in j[j.find("function Blog()"):j.find("function Blog()")+15000]:
    print("bundle: Blog CTA already updated")
else:
    raise SystemExit("bundle Blog CTA block not found")

# BlogPost footer: unique marker with T2.allRights in footer after function BlogPost
idx = j.find("function BlogPost()")
if idx == -1:
    raise SystemExit("BlogPost not in bundle")
sub = j[idx:idx+25000]
footer_marker = '''        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminSecretAccess, { label: `© ${(/* @__PURE__ */ new Date()).getFullYear()} HTRGroupTX. ${T2.allRights}` }) }),'''

phone_row = '''        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-phone-pair--row flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-sm", children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$6, className: "htr-phone-btn inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity", children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4", style: { color: K.accentLight } }), COMPANY_PHONE_DISPLAY$6] }), /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$6, className: "htr-phone-btn inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity", children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4", style: { color: K.accentLight } }), PHONE_DISPLAY$6] })] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminSecretAccess, { label: `© ${(/* @__PURE__ */ new Date()).getFullYear()} HTRGroupTX. ${T2.allRights}` }) }),'''

if footer_marker in sub and "htr-phone-pair--row" not in sub[sub.find("jsxRuntimeExports.jsx(\"footer\""):]:
    sub_new = sub.replace(footer_marker, phone_row, 1)
    j = j[:idx] + sub_new + j[idx+25000:]
    print("bundle: BlogPost footer phones added")
elif "COMPANY_PHONE_HREF$6" in sub and "htr-phone-pair--row" in sub[sub.find('jsxRuntimeExports.jsx("footer"'):] if 'jsxRuntimeExports.jsx("footer"' in sub else "":
    print("bundle: BlogPost footer already has phones")
else:
    raise SystemExit("bundle BlogPost footer marker not found")

js.write_text(j, encoding="utf-8", newline="\n")
print("OK all patches")
