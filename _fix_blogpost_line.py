from pathlib import Path
path = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js")
s = path.read_text(encoding="utf-8")
old = (
    '            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF, className: "header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full", style: { backgroundColor: K.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), " ", PHONE_DISPLAY] })'
)
new = (
    '            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$6, className: "header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full", style: { backgroundColor: K.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), " ", PHONE_DISPLAY$6] })'
)
if old not in s:
    raise SystemExit("target line not found")
s = s.replace(old, new, 1)
path.write_text(s, encoding="utf-8", newline="\n")
print("fixed")
