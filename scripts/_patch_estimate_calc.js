const fs = require("fs");
const path = "C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js";
let t = fs.readFileSync(path, "utf8");

const priceExpr = "(parseFloat(String(i.unit_price).replace(\",\", \".\")) || 0)";

const reps = [
  [
    'setAdminEstimateItems((prev) => [...prev, { description: "", category: "Labor", qty: 1, unit_price: 0 }])',
    'setAdminEstimateItems((prev) => [...prev, { description: "", category: "Labor", qty: 1, unit_price: "" }])',
  ],
  [
    'setAdminEstimateItems([{ description: "", category: "Labor", qty: 1, unit_price: 0 }])',
    'setAdminEstimateItems([{ description: "", category: "Labor", qty: 1, unit_price: "" }])',
  ],
  [
    'const labor = adminEstimateItems.filter((i) => i.category === "Labor").reduce((s, i) => s + i.qty * i.unit_price, 0);',
    `const labor = adminEstimateItems.filter((i) => i.category === "Labor").reduce((s, i) => s + i.qty * ${priceExpr}, 0);`,
  ],
  [
    'const parts = adminEstimateItems.filter((i) => i.category !== "Labor").reduce((s, i) => s + i.qty * i.unit_price, 0);',
    `const parts = adminEstimateItems.filter((i) => i.category !== "Labor").reduce((s, i) => s + i.qty * ${priceExpr}, 0);`,
  ],
  [
    `                    type: "number",
                    min: "0",
                    step: "0.01",
                    value: item.unit_price === 0 ? "" : item.unit_price,
                    onChange: (e) => setAdminEstimateItems((prev) => prev.map((x, idx) => idx === i ? { ...x, unit_price: parseFloat(e.target.value) || 0 } : x)),`,
    `                    type: "text",
                    inputMode: "decimal",
                    value: item.unit_price,
                    placeholder: "0.00",
                    onChange: (e) => setAdminEstimateItems((prev) => prev.map((x, idx) => idx === i ? { ...x, unit_price: e.target.value.replace(/[^\\d.,]/g, "") } : x)),`,
  ],
  [
    "const validItems = adminEstimateItems.filter((i) => i.description.trim() && i.unit_price >= 0);",
    'const validItems = adminEstimateItems.filter((i) => i.description.trim()).map((i) => ({ description: i.description.trim(), category: i.category, qty: Math.max(1, i.qty), unit_price: parseFloat(String(i.unit_price).replace(",", ".")) || 0 })).filter((i) => i.unit_price >= 0);',
  ],
];

for (const [from, to] of reps) {
  if (!t.includes(from)) {
    console.error("MISSING:", from.slice(0, 80));
    process.exit(1);
  }
  t = t.replace(from, to);
}

fs.writeFileSync(path, t, "utf8");
console.log("patched", path, "size", t.length);
