from pathlib import Path

CSS_OLD = """/* Header phone buttons (desktop + mobile menu) */
.htr-header-spacer {
  min-height: 3.5rem;
}
.htr-site-header-bar {
  min-height: 3.5rem;
  padding-top: 2mm;
  padding-bottom: 2mm;
}
.header-phone-pair {
  margin-top: 5mm;
  transform: translateX(5mm);
}
.header-phone-link {
  padding-top: calc(0.375rem + 2.5mm) !important;
  padding-bottom: calc(0.375rem + 2.5mm) !important;
  box-sizing: border-box;
}"""

CSS_NEW = Path(r"C:\Projects\HTRGroupLLC\src\index.css").read_text(encoding="utf-8")
start = CSS_NEW.find("/* Header + site-wide phone call buttons */")
end = CSS_NEW.find("}", start)
# grab full block until end of htr-phone-btn--contact rule
block_start = start
block_end = CSS_NEW.find(".htr-phone-btn--contact", start)
block_end = CSS_NEW.find("}", block_end) + 1
CSS_BLOCK = CSS_NEW[block_start:block_end]

for css_path in [
    Path(r"C:\Projects\HTRGroupLLC\assets\index-_bdQPowM.css"),
]:
    text = css_path.read_text(encoding="utf-8")
    if CSS_OLD not in text:
        raise SystemExit(f"CSS old block missing in {css_path}")
    css_path.write_text(text.replace(CSS_OLD, CSS_BLOCK), encoding="utf-8")
    print(f"{css_path.name} ok")

js = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
j = js.read_text(encoding="utf-8")

# Home header phone pair wrapper
j = j.replace(
    'className: "header-phone-pair flex flex-col gap-1 items-end"',
    'className: "header-phone-pair htr-phone-pair flex flex-col gap-1 items-end"',
)
j = j.replace(
    'className: "header-phone-link flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm"',
    'className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm"',
)
j = j.replace(
    'className: "header-phone-pair flex flex-col gap-1.5 mt-1 items-start"',
    'className: "header-phone-pair htr-phone-pair flex flex-col gap-1.5 mt-1 items-start"',
)
j = j.replace(
    'className: "header-phone-link flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit"',
    'className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit"',
)

# Hero compact phones
j = j.replace(
    'className: "inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm", style: { backgroundColor: K$3.accent }',
    'className: "htr-phone-btn inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm", style: { backgroundColor: K$3.accent }',
)

# Mid strip - two occurrences
j = j.replace(
    'className: "inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm", style: { backgroundColor: K$3.accent }',
    'className: "htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm", style: { backgroundColor: K$3.accent }',
)

# Contact text phones
j = j.replace(
    'className: "font-bold text-stone-900 hover:opacity-70 transition-opacity block", children: PHONE_DISPLAY$3',
    'className: "htr-phone-btn htr-phone-btn--contact font-bold text-stone-900 hover:opacity-70 transition-opacity block", children: PHONE_DISPLAY$3',
)
j = j.replace(
    'className: "font-bold text-stone-900 hover:opacity-70 transition-opacity block mt-1", children: COMPANY_PHONE_DISPLAY$3',
    'className: "htr-phone-btn htr-phone-btn--contact font-bold text-stone-900 hover:opacity-70 transition-opacity block mt-1", children: COMPANY_PHONE_DISPLAY$3',
)

# Footer phones
j = j.replace(
    'className: "inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity", children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4", style: { color: K$3.accentLight } }), PHONE_DISPLAY$3]',
    'className: "htr-phone-btn inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity", children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4", style: { color: K$3.accentLight } }), PHONE_DISPLAY$3]',
)
j = j.replace(
    'className: "inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity", children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4", style: { color: K$3.accentLight } }), COMPANY_PHONE_DISPLAY$3]',
    'className: "htr-phone-btn inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity", children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4", style: { color: K$3.accentLight } }), COMPANY_PHONE_DISPLAY$3]',
)

# Remove duplicate footer phone row (second identical div)
dup = ', /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-sm", children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "htr-phone-btn inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity", children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4", style: { color: K$3.accentLight } }), PHONE_DISPLAY$3] }), /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "htr-phone-btn inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity", children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4", style: { color: K$3.accentLight } }), COMPANY_PHONE_DISPLAY$3] })] })'
# try before htr-phone-btn patch for dup - use original without htr-phone-btn
dup_orig = ', /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-sm", children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity", children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4", style: { color: K$3.accentLight } }), PHONE_DISPLAY$3] }), /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity", children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4", style: { color: K$3.accentLight } }), COMPANY_PHONE_DISPLAY$3] })] })'
if dup_orig in j:
    j = j.replace(dup_orig, '', 1)
    print('removed duplicate footer row')
elif dup in j:
    j = j.replace(dup, '', 1)
    print('removed duplicate footer row (patched)')
else:
    print('WARN: duplicate footer not found')

# Gallery desktop header - replace single phone with pair
GALLERY_OLD = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-2 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$2, className: "flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$2.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            " ",
            PHONE_DISPLAY$2
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `${base}/#contact`, className: "text-white font-bold px-3 py-1.5 rounded text-sm uppercase tracking-wider", style: { backgroundColor: K$2.dark }, children: T2.bookNow })
        ] })'''

GALLERY_NEW = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-2 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair htr-phone-pair flex flex-col gap-1 items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$2, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$2.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              " ",
              PHONE_DISPLAY$2
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$2, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$2.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              " ",
              COMPANY_PHONE_DISPLAY$2
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `${base}/#contact`, className: "text-white font-bold px-3 py-1.5 rounded text-sm uppercase tracking-wider", style: { backgroundColor: K$2.dark }, children: T2.bookNow })
        ] })'''

if GALLERY_OLD not in j:
    raise SystemExit('gallery desktop block not found')
j = j.replace(GALLERY_OLD, GALLERY_NEW, 1)

GALLERY_MOB_OLD = '''        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$2, className: "flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit mt-1", style: { backgroundColor: K$2.accent }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
          " ",
          PHONE_DISPLAY$2
        ] })'''
GALLERY_MOB_NEW = '''        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair htr-phone-pair flex flex-col gap-1.5 mt-1 items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$2, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit", style: { backgroundColor: K$2.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            " ",
            PHONE_DISPLAY$2
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$2, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit", style: { backgroundColor: K$2.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            " ",
            COMPANY_PHONE_DISPLAY$2
          ] })
        ] })'''
if GALLERY_MOB_OLD not in j:
    raise SystemExit('gallery mobile block not found')
j = j.replace(GALLERY_MOB_OLD, GALLERY_MOB_NEW, 1)

# Gallery CTA band - single phone to dual
CTA_OLD = '''      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center", style: { backgroundColor: K$2.dark }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white font-bold text-lg mb-3", children: isEs ? "¿Tiene un electrodoméstico dañado?" : "Got a broken appliance?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            href: PHONE_HREF$2,
            className: "inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base",
            style: { backgroundColor: K$2.accent },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
              " ",
              PHONE_DISPLAY$2
            ]
          }
        )
      ] })'''

CTA_NEW = '''      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center", style: { backgroundColor: K$2.dark }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white font-bold text-lg mb-3", children: isEs ? "¿Tiene un electrodoméstico dañado?" : "Got a broken appliance?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-phone-pair--row flex flex-col sm:flex-row items-center justify-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$2, className: "htr-phone-btn htr-phone-btn--lg inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base", style: { backgroundColor: K$2.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
            " ",
            PHONE_DISPLAY$2
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$2, className: "htr-phone-btn htr-phone-btn--lg inline-flex items-center gap-2 font-bold px-6 py-3 rounded text-white text-base", style: { backgroundColor: K$2.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
            " ",
            COMPANY_PHONE_DISPLAY$2
          ] })
        ] })
      ] })'''

if CTA_OLD not in j:
    # try without accented chars
    import re
    m = re.search(r'py-8 text-center", style: \{ backgroundColor: K\$2\.dark \}, children: \[\s*/\* @__PURE__ \*/ jsxRuntimeExports\.jsx\("p"', j)
    if not m:
        raise SystemExit('gallery CTA block not found')
    print('WARN: CTA old exact match failed - manual check needed')
else:
    j = j.replace(CTA_OLD, CTA_NEW, 1)
    print('gallery CTA ok')

js.write_text(j, encoding="utf-8")
print('bundle ok')
