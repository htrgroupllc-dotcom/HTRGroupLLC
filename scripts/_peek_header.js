const fs = require("fs");
const t = fs.readFileSync("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js", "utf8");
const i = t.indexOf("showCompleted ? t.allOrders");
console.log(JSON.stringify(t.slice(i - 200, i + 900)));
