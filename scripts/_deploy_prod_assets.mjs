/** Copy fresh build to assets/ and bump ?v= cache in HTML entrypoints. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distAssets = path.join(root, "dist/public/assets");
const liveAssets = path.join(root, "assets");
const version = process.argv[2] ?? "96";

const jsSrc = path.join(distAssets, "index-utf8-v4.js");
const cssSrc = path.join(distAssets, "index-_bdQPowM.css");
if (!fs.existsSync(jsSrc)) {
  console.error("Missing build output:", jsSrc);
  process.exit(1);
}

const liveJs = path.join(liveAssets, "index-utf8-v4.js");
const distSize = fs.statSync(jsSrc).size;
const liveSize = fs.existsSync(liveJs) ? fs.statSync(liveJs).size : 0;
if (distSize > 3_000_000) {
  fs.copyFileSync(jsSrc, liveJs);
  if (fs.existsSync(cssSrc)) {
    fs.copyFileSync(cssSrc, path.join(liveAssets, "index-_bdQPowM.css"));
  }
  console.log("Copied build assets", distSize, "bytes");
} else {
  console.log("Skip JS copy (dist too small:", distSize, "live:", liveSize, ")");
}

const htmlFiles = [
  path.join(root, "index.html"),
  path.join(root, "admin/index.html"),
  path.join(root, "pay/index.html"),
];

for (const file of htmlFiles) {
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/\?v=\d+/g, `?v=${version}`);
  fs.writeFileSync(file, html, "utf8");
  console.log("Updated cache:", file);
}

console.log("Deployed assets v=" + version);
