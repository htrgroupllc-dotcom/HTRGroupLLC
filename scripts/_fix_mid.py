from pathlib import Path
p = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
j = p.read_text(encoding="utf-8")
old = (
    '/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm", style: { backgroundColor: K$3.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }), PHONE_DISPLAY$3] }), /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm", style: { backgroundColor: K$3.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }), COMPANY_PHONE_DISPLAY$3] })'
)
new = (
    '/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm", style: { backgroundColor: K$3.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }), COMPANY_PHONE_DISPLAY$3] }), /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "htr-phone-btn htr-phone-btn--mid inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm", style: { backgroundColor: K$3.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }), PHONE_DISPLAY$3] })'
)
c = j.count(old)
if not c:
    raise SystemExit("mid strip pattern not found")
j = j.replace(old, new)
p.write_text(j, encoding="utf-8")
print("mid swaps", c)
