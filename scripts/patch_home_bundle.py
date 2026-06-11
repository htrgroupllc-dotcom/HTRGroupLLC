from pathlib import Path

p = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
t = p.read_text(encoding="utf-8")

if "COMPANY_PHONE_HREF$3" not in t:
    t = t.replace(
        'const PHONE_HREF$3 = "tel:+13468206021";',
        'const PHONE_HREF$3 = "tel:+13468206021";\nconst COMPANY_PHONE_DISPLAY$3 = "(606) 660-6067";\nconst COMPANY_PHONE_HREF$3 = "tel:+16066606067";',
        1,
    )

# Gallery page constants PHONE_HREF$2 or similar
if "COMPANY_PHONE_HREF$2" not in t and 'const PHONE_HREF$2 = "tel:+13468206021";' in t:
    t = t.replace(
        'const PHONE_HREF$2 = "tel:+13468206021";',
        'const PHONE_HREF$2 = "tel:+13468206021";\nconst COMPANY_PHONE_DISPLAY$2 = "(606) 660-6067";\nconst COMPANY_PHONE_HREF$2 = "tel:+16066606067";',
        1,
    )

company_link = (
    '/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm", '
    'style: { backgroundColor: K$3.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }), COMPANY_PHONE_DISPLAY$3] })'
)
mid_strip = (
    '/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center bg-white border-y border-stone-100", children: ['
    '/* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-stone-600 text-sm font-semibold mb-3", children: "Call us anytime" }), '
    '/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3", children: ['
    '/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm", style: { backgroundColor: K$3.accent }, children: ['
    '/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }), PHONE_DISPLAY$3] }), '
    + company_link + '] }) ] })'
)

# Insert mid strips after stats and gallery sections - find unique markers
stats_marker = 'className: "text-white text-xs font-medium uppercase tracking-wide"'
# find second occurrence after stats - use WHY US section marker
why = 'children: T$3.whyH2'
idx = t.find(why)
if idx > 0 and mid_strip not in t:
    # insert before WHY US - search backwards for closing section tag pattern near whyH2
    anchor = t.rfind("/* ── WHY US ── */", 0, idx)
    if anchor == -1:
        anchor = t.rfind("whyH2", 0, idx)
    # simpler: insert right before whyH2 heading jsx - find motion.div with whyH2
    ins_point = t.rfind("        {/*", 0, idx)
    # use explicit string from bundle
    old = '        {/* ── WHY US ── */}'
    if old in t and t.count(mid_strip) == 0:
        t = t.replace(old, mid_strip + ",\n        " + old, 1)

certs = '        {/* ── OUR CERTIFICATIONS ── */}'
if certs in t and t.count(mid_strip) < 2:
    t = t.replace(certs, mid_strip + ",\n        " + certs, 1)

# Header desktop: wrap phone + add company
header_old = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            PHONE_DISPLAY$3
          ] })'''
header_new = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              PHONE_DISPLAY$3
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              COMPANY_PHONE_DISPLAY$3
            ] })
          ] })'''
if header_old in t:
    t = t.replace(header_old, header_new, 1)

mobile_old = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit mt-1", style: { backgroundColor: K$3.accent }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
          PHONE_DISPLAY$3
        ] })'''
mobile_new = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit", style: { backgroundColor: K$3.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            PHONE_DISPLAY$3
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "flex items-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-fit", style: { backgroundColor: K$3.accent }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            COMPANY_PHONE_DISPLAY$3
          ] })
        ] })'''
if mobile_old in t:
    t = t.replace(mobile_old, mobile_new, 1)

hero_old = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm mb-4", style: { backgroundColor: K$3.accent }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
                  PHONE_DISPLAY$3
                ] })'''
hero_new = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5 mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
                    PHONE_DISPLAY$3
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "inline-flex items-center gap-2 text-white font-bold px-4 py-2 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
                    COMPANY_PHONE_DISPLAY$3
                  ] })
                ] })'''
t = t.replace(hero_old, hero_new)

contact_old = '''/* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: PHONE_HREF$3, className: "font-bold text-stone-900 hover:opacity-70 transition-opacity", children: PHONE_DISPLAY$3 })'''
contact_new = '''/* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: PHONE_HREF$3, className: "font-bold text-stone-900 hover:opacity-70 transition-opacity block", children: PHONE_DISPLAY$3 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: COMPANY_PHONE_HREF$3, className: "font-bold text-stone-900 hover:opacity-70 transition-opacity block mt-1", children: COMPANY_PHONE_DISPLAY$3 })
                  ] })'''
if contact_old in t:
    t = t.replace(contact_old, contact_new, 1)

footer_anchor = 'className: "border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400"'
if footer_anchor in t and "COMPANY_PHONE_HREF$3" in t and "COMPANY_PHONE_DISPLAY$3" in t:
    footer_block = (
        '/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-sm", children: ['
        '/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity", children: ['
        '/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4", style: { color: K$3.accentLight } }), PHONE_DISPLAY$3] }), '
        '/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "inline-flex items-center gap-2 text-white font-semibold hover:opacity-80 transition-opacity", children: ['
        '/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4", style: { color: K$3.accentLight } }), COMPANY_PHONE_DISPLAY$3] })'
        '] }), '
    )
    # only home footer - first occurrence after home function - risky if multiple footers same
    pos = t.find(footer_anchor)
    if pos > 0 and t.find("flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-sm", pos - 500, pos) == -1:
        t = t[:pos] + footer_block + t[pos:]

p.write_text(t, encoding="utf-8")
print("done", "660-6067" in t, "mid strips", t.count("Call us anytime"))
