const fs = require("fs");
const path = "C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js";
let js = fs.readFileSync(path, "utf8");
const start = js.indexOf("function CenterConvergeMarquee({ brands, base }) {");
const end = js.indexOf("const SERVICE_AREA_MAP_EMBED", start);
if (start < 0 || end < 0) { console.error("bounds", start, end); process.exit(1); }
const fn = `function CenterConvergeMarquee({ brands, base }) {
  const all = [...brands, ...brands];
  const cardClass = "htr-brand-marquee-center__card flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-stone-100 shadow-sm p-2";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "htr-brand-marquee-center relative w-full py-6 bg-stone-50 border-y border-stone-200 overflow-hidden", "aria-label": "Brands we service", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__bleed w-screen relative left-1/2 -translate-x-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__stage relative w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "htr-brand-marquee-center__row relative w-full min-h-[88px] h-[88px] overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__seam pointer-events-none absolute left-1/2 top-0 bottom-0 z-20", "aria-hidden": "true" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__wing htr-brand-marquee-center__wing--left absolute inset-y-0 left-0 w-1/2 overflow-hidden z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__track htr-brand-marquee-center__track--left flex items-center gap-3 w-max h-full justify-end", children: all.map(([name, file], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cardClass, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: \`\${base}/logos/\${file}.png\`, alt: name, className: "w-full h-full object-contain", draggable: false, loading: "lazy" }) }, \`l-\${i}\`)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__wing htr-brand-marquee-center__wing--right absolute inset-y-0 right-0 w-1/2 overflow-hidden z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "htr-brand-marquee-center__track htr-brand-marquee-center__track--right flex items-center gap-3 w-max h-full justify-start", children: all.map(([name, file], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cardClass, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: \`\${base}/logos/\${file}.png\`, alt: name, className: "w-full h-full object-contain", draggable: false, loading: "lazy" }) }, \`r-\${i}\`)) }) })
  ] }) }) }) });
}
`;
js = js.slice(0, start) + fn + js.slice(end);
fs.writeFileSync(path, js);
fs.writeFileSync("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.prod.js", js);
console.log("marquee ok");
