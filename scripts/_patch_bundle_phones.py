from pathlib import Path
p = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js")
t = p.read_text(encoding="utf-8")
repls = [
    ('header-phone-pair htr-phone-pair flex flex-col gap-1 items-end',
     'header-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end'),
    ('header-phone-pair htr-phone-pair flex flex-col gap-1.5 mt-1 items-start',
     'header-phone-pair flex flex-row flex-wrap gap-2 mt-1 items-start justify-start'),
    ('className: "flex flex-col gap-1.5 mb-4"',
     'className: "htr-phone-pair--hero-top flex flex-row flex-wrap gap-2 items-center justify-start mb-4"'),
]
for a,b in repls:
    n = t.count(a)
    print(a[:40], '->', n)
    t = t.replace(a, b)
# Fix header phone order: PHONE then COMPANY -> COMPANY then PHONE in header blocks only
# Pattern in bundle: header div then PHONE link first
old_header = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              " ",
              PHONE_DISPLAY$3
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              " ",
              COMPANY_PHONE_DISPLAY$3
            ] })
          ] })'''
new_header = '''/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "header-phone-pair flex flex-row flex-wrap gap-2 items-center justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              " ",
              COMPANY_PHONE_DISPLAY$3
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "header-phone-link htr-phone-btn flex items-center gap-1.5 text-white font-bold px-3 py-1.5 rounded text-sm", style: { backgroundColor: K$3.accent }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
              " ",
              PHONE_DISPLAY$3
            ] })
          ] })'''
if old_header in t:
    t = t.replace(old_header, new_header)
    print('header order fixed home')
else:
    print('header order block not found home')
# gallery uses $2 vars - search similar
p.write_text(t, encoding="utf-8")
print('bundle saved')
