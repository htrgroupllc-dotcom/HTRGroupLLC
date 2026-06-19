const fs = require("fs");
const t = fs.readFileSync("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js", "utf8");
const needle = 'adminTab !== "bookings" ? "hidden"';
const i = t.indexOf(needle);
console.log(JSON.stringify(t.slice(i - 150, i + 150)));
