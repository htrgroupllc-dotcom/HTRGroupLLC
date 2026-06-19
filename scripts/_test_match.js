const fs = require("fs");
const t = fs.readFileSync("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js", "utf8");
const NL = "\r\n";
const from = `      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: \`flex gap-0 md:overflow-hidden md:h-[calc(100vh-96px)] \${adminTab !== "bookings" ? "hidden" : ""}\`, children: [`;
console.log("match", t.includes(from.replace(/\n/g, NL)));
console.log(JSON.stringify(from.replace(/\n/g, NL).slice(0,120)));
