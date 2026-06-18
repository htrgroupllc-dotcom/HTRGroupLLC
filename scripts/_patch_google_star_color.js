const fs = require("fs");
const p = "C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js";
let t = fs.readFileSync(p, "utf8");
const from = "color: GOOGLE_STAR_COLOR, fill: GOOGLE_STAR_COLOR";
const to = 'color: "#FBBC04", fill: "#FBBC04"';
const c = t.split(from).length - 1;
if (!c) {
  console.error("no matches for GOOGLE_STAR_COLOR in bundle");
  process.exit(1);
}
t = t.split(from).join(to);
fs.writeFileSync(p, t, "utf8");
console.log("replaced", c, "occurrences");
