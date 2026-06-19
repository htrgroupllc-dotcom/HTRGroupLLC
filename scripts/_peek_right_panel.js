const fs = require("fs");
const t = fs.readFileSync("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js", "utf8");
const needle = 'overflow-y-auto p-4 ${mobileTab !== "bookings"';
const i = t.indexOf(needle);
console.log(JSON.stringify(t.slice(i - 500, i + 200)));
