from pathlib import Path

p = Path(r"C:\Projects\HTRGroupLLC\assets\index-utf8-v4.js")
t = p.read_text(encoding="utf-8")

mid_strip = (
    '/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center bg-white border-y border-stone-100", children: ['
    '/* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-stone-600 text-sm font-semibold mb-3", children: "Call us anytime" }), '
    '/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3", children: ['
    '/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: PHONE_HREF$3, className: "inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm", style: { backgroundColor: K$3.accent }, children: ['
    '/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }), PHONE_DISPLAY$3] }), '
    '/* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: COMPANY_PHONE_HREF$3, className: "inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded text-white text-sm", style: { backgroundColor: K$3.accent }, children: ['
    '/* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }), COMPANY_PHONE_DISPLAY$3] })'
    '] }) ] }), '
)

anchor1 = (
    '      ) }) }),\n      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-10 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[2fr_3fr] gap-8 items-center", children: [\n        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: FADE_UP$3, className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: whyUsBgImg'
)
if anchor1 in t and t.count('"Call us anytime"') < 2:
    t = t.replace(anchor1, '      ) }) }),\n      ' + mid_strip + anchor1[len('      ) }) }),\n      '):], 1)

# after gallery section - before certs section with T2.certsH2
anchor2 = '          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl md:text-3xl font-extrabold", children: T2.certsH2 })'
if anchor2 in t and t.count('"Call us anytime"') < 2:
    t = t.replace(anchor2, mid_strip + anchor2, 1)

p.write_text(t, encoding="utf-8")
print("mid strips", t.count('"Call us anytime"'))
