from pathlib import Path
t = Path(r"C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js").read_text(encoding="utf-8")
needle = 'jsxRuntimeExports.jsx(User, { className: "w-3.5 h-3.5 text-stone-400 flex-shrink-0" }),\n                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-stone-800", children: b.name }),\n                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ${resolveBookingBiz'
print("count", t.count(needle))
