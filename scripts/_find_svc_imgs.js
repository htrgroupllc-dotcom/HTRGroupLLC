const fs = require("fs");
const b = fs.readFileSync("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js", "utf8");
for (const n of ["svcFridgeImg", "svcWasherImg", "svcOvenImg", "svcStoveImg"]) {
  const idx = b.indexOf(`const ${n}`);
  if (idx < 0) {
    const idx2 = b.indexOf(n);
    console.log(n, "const not found, first at", idx2);
    if (idx2 >= 0) console.log(b.slice(idx2, idx2 + 200));
    continue;
  }
  console.log(n, b.slice(idx, idx + 250));
}
