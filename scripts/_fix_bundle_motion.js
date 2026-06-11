const fs = require("fs");
const path = "C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js";
let js = fs.readFileSync(path, "utf8");
const needle = "googleHomeReviews.slice(reviewPage * 10, reviewPage * 10 + 10).map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(";
const idx = js.indexOf(needle);
if (idx < 0) {
  console.error("needle not found");
  process.exit(1);
}
const motionIdx = js.indexOf("motion.div", idx);
if (motionIdx < 0 || motionIdx > idx + 200) {
  console.error("motion not found near slice");
  process.exit(1);
}
const before = js.slice(0, motionIdx);
const after = js.slice(motionIdx);
const replaced = after.replace(
  /motion\.div,\s*\{\s*key: `\$\{r\.name\}-\$\{i\}`,\s*initial: "hidden",\s*whileInView: "visible",\s*viewport: \{ once: true \},\s*variants: FADE_UP\$3,\s*className: "bg-white rounded-lg p-2 md:p-2\.5 shadow-sm border border-stone-100 flex flex-col h-full min-h-0 htr-google-review-card",/,
  '"div", { key: `${r.name}-${i}`, className: "bg-white rounded-lg p-2 md:p-2.5 shadow-sm border border-stone-100 flex flex-col h-full min-h-0 htr-google-review-card",'
);
if (replaced === after) {
  console.error("regex replace failed");
  process.exit(1);
}
js = before + replaced;
fs.writeFileSync(path, js);
fs.writeFileSync("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.prod.js", js);
console.log("bundle motion fixed");
