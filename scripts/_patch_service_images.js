const fs = require("fs");
const path = "C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js";
let t = fs.readFileSync(path, "utf8");

const FRIDGE = "/assets/ChatGPT_Image_3_%D0%B0%D0%BF%D1%80._2026_%D0%B3.__21_10_20_1775269648058-DzQgMMeY.png";
const WASHER = "/assets/ChatGPT_Image_3_%D0%B0%D0%BF%D1%80._2026_%D0%B3.__21_04_57_1775269648058-CC0M5H-1.png";
const GAS_OVEN = "/assets/ChatGPT_Image_3_%D0%B0%D0%BF%D1%80._2026_%D0%B3.__21_18_00_1775269648060-DvFzQgSu.png";
const ELECTRIC_STOVE = "/assets/ChatGPT_Image_3_%D0%B0%D0%BF%D1%80._2026_%D0%B3.__21_20_14_1775269648060-BKyAYrsQ.png";

function patchOnce(from, to, label) {
  if (!t.includes(from)) {
    console.error("MISSING:", label);
    process.exit(1);
  }
  if (from === to) {
    console.log("SKIP (already ok):", label);
    return;
  }
  t = t.replace(from, to);
  console.log("OK:", label);
}

// Fix refrigerator card (was washer image)
patchOnce(
  'const svcFridgeImg$1 = "/assets/ChatGPT_Image_3_%D0%B0%D0%BF%D1%80._2026_%D0%B3.__21_04_57_1775269648058-CC0M5H-1.png";',
  `const svcFridgeImg$1 = "${FRIDGE}";`,
  "svcFridgeImg$1 -> refrigerator",
);

// Fix electric oven & stove card (was gas range image)
patchOnce(
  'const svcStoveImg = "/assets/ChatGPT_Image_3_%D0%B0%D0%BF%D1%80._2026_%D0%B3.__21_18_00_1775269648060-DvFzQgSu.png";',
  `const svcStoveImg = "${ELECTRIC_STOVE}";`,
  "svcStoveImg -> electric stove",
);

fs.writeFileSync(path, t, "utf8");
console.log("Patched", path);
