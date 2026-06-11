from pathlib import Path
B = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
j = B.read_text(encoding="utf-8")
old = 'href: PHONE_HREF$5, className: "header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full", style: { backgroundColor: K$1.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), " ", PHONE_DISPLAY$5]'
new = 'href: PHONE_HREF$1, className: "header-phone-link htr-phone-btn flex items-center justify-center gap-1.5 text-white font-bold px-3 py-2 rounded text-sm w-full", style: { backgroundColor: K$1.accent }, children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), " ", PHONE_DISPLAY$1]'
if old not in j:
    raise SystemExit('blog mobile strip block not found')
j = j.replace(old, new, 1)
B.write_text(j, encoding='utf-8')
print('fixed blog PHONE refs')
