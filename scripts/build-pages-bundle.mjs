#!/usr/bin/env node
/**
 * Build src/ → dist-build/ and copy JS+CSS into assets/ for Cloudflare Pages.
 * Bumps ?v= on index.html, admin/index.html, pay/index.html.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arDir = path.resolve(root, "../htrgr/REPLIT-LATEST/HTRGroupLLC1/artifacts/appliance-repair");
const viteBin = path.join(arDir, "node_modules/vite/bin/vite.js");
const viteConfig = path.join(arDir, "vite.htr.config.ts");

if (!fs.existsSync(viteBin)) {
  console.error("vite not found:", viteBin);
  process.exit(1);
}

process.env.NODE_ENV = "production";

const tsconfigPath = path.join(root, "tsconfig.json");
const tsconfigBak = path.join(root, "tsconfig.json.build-bak");
const tsconfigBuild = path.join(root, "tsconfig.build.json");
let swappedTsconfig = false;
if (fs.existsSync(tsconfigBuild)) {
  fs.copyFileSync(tsconfigPath, tsconfigBak);
  fs.copyFileSync(tsconfigBuild, tsconfigPath);
  swappedTsconfig = true;
}

const nmPath = path.join(root, "node_modules");
const nmBak = path.join(root, "node_modules.build-bak");
const arNm = path.join(arDir, "node_modules");
let linkedNm = false;
if (fs.existsSync(arNm)) {
  if (fs.existsSync(nmPath)) {
    fs.renameSync(nmPath, nmBak);
  }
  fs.symlinkSync(arNm, nmPath, "junction");
  linkedNm = true;
}

const assetsPath = path.join(root, "attached_assets");
const assetsBak = path.join(root, "attached_assets.build-bak");
const replitAssets = path.resolve(arDir, "../../attached_assets");
let linkedAssets = false;
if (fs.existsSync(replitAssets) && !fs.existsSync(assetsPath)) {
  fs.symlinkSync(replitAssets, assetsPath, "junction");
  linkedAssets = true;
}

console.log("Running vite build...");
try {
  execSync(`node "${viteBin}" build --config "${viteConfig}"`, {
    cwd: arDir,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });
} finally {
  if (linkedAssets) {
    fs.rmSync(assetsPath, { recursive: true, force: true });
    if (fs.existsSync(assetsBak)) {
      fs.renameSync(assetsBak, assetsPath);
    }
  }
  if (linkedNm) {
    fs.rmSync(nmPath, { recursive: true, force: true });
    if (fs.existsSync(nmBak)) {
      fs.renameSync(nmBak, nmPath);
    }
  }
  if (swappedTsconfig && fs.existsSync(tsconfigBak)) {
    fs.copyFileSync(tsconfigBak, tsconfigPath);
    fs.unlinkSync(tsconfigBak);
  }
}

const distJs = path.join(root, "dist-build/assets/index-utf8-v4.js");
const outJs = path.join(root, "assets/index-utf8-v4.js");

if (!fs.existsSync(distJs)) {
  console.error("Missing build output:", distJs);
  process.exit(1);
}

fs.copyFileSync(distJs, outJs);
console.log("Copied JS", (fs.statSync(outJs).size / 1048576).toFixed(2), "MiB");

const distCss = path.join(root, "dist-build/assets/index-_bdQPowM.css");
const outCss = path.join(root, "assets/index-_bdQPowM.css");
if (fs.existsSync(distCss)) {
  fs.copyFileSync(distCss, outCss);
  console.log("Copied CSS", (fs.statSync(outCss).size / 1024).toFixed(2), "KiB");
} else {
  console.warn("Missing build CSS output:", distCss);
}

const distAssetsDir = path.join(root, "dist-build/assets");
const outAssetsDir = path.join(root, "assets");
const assetExt = /\.(png|jpe?g|webp|gif|svg|woff2?|ttf|ico)$/i;
let copiedAssets = 0;
if (fs.existsSync(distAssetsDir)) {
  for (const name of fs.readdirSync(distAssetsDir)) {
    if (name === "index-utf8-v4.js" || name === "index-_bdQPowM.css") continue;
    if (!assetExt.test(name)) continue;
    fs.copyFileSync(path.join(distAssetsDir, name), path.join(outAssetsDir, name));
    copiedAssets++;
  }
}
console.log(`Copied ${copiedAssets} static asset(s) from dist-build/assets`);

/** Fail deploy if bundle references missing files (prevents broken service-card images). */
function verifyBundleAssets(jsText, assetsDir) {
  const refs = new Set();
  const re = /\/assets\/((?:[^"'`\\]|\\u[0-9a-fA-F]{4})+\.(?:png|jpe?g|webp|gif|svg))/g;
  let m;
  while ((m = re.exec(jsText)) !== null) {
    try {
      refs.add(decodeURIComponent(m[1].replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      )));
    } catch {
      refs.add(m[1]);
    }
  }
  const missing = [...refs].filter((name) => !fs.existsSync(path.join(assetsDir, name)));
  if (missing.length > 0) {
    console.error("Build verification failed: bundle references missing assets:");
    for (const name of missing.slice(0, 20)) console.error("  -", name);
    if (missing.length > 20) console.error(`  ... and ${missing.length - 20} more`);
    process.exit(1);
  }
  console.log(`OK: ${refs.size} bundle asset reference(s) present in assets/`);
}

const jsText = fs.readFileSync(outJs, "utf8");
verifyBundleAssets(jsText, outAssetsDir);
if (fs.existsSync(outCss)) {
  const cssText = fs.readFileSync(outCss, "utf8");
  if (cssText.includes("@tailwind utilities")) {
    console.error("Build verification failed: CSS still contains unprocessed @tailwind utilities");
    process.exit(1);
  }
  if (!cssText.includes(".md\\:hidden") && !cssText.includes(".md:hidden")) {
    console.error("Build verification failed: CSS missing .md:hidden utility");
    process.exit(1);
  }
  console.log("OK: CSS utilities present in bundle");
} else {
  console.log("CSS unchanged (reusing existing index-_bdQPowM.css)");
}

if (!jsText.includes("/api/calendar/events") && !jsText.includes("calendarTab")) {
  console.error("Build verification failed: calendar code not found in bundle");
  process.exit(1);
}
console.log("OK: calendar code present in bundle");

const htmlFiles = [
  path.join(root, "index.html"),
  path.join(root, "pay/index.html"),
  // admin/index.html uses pinned admin-index-utf8-v4.js — do not bump with site bundle
];
const oldVer = (() => {
  const t = fs.readFileSync(htmlFiles[0], "utf8");
  const m = t.match(/index-utf8-v4\.js\?v=(\d+)/);
  return m ? parseInt(m[1], 10) : 100;
})();
const newVer = oldVer + 1;

for (const html of htmlFiles) {
  if (!fs.existsSync(html)) continue;
  let t = fs.readFileSync(html, "utf8");
  t = t.replace(/index-utf8-v4\.js\?v=\d+/g, `index-utf8-v4.js?v=${newVer}`);
  t = t.replace(/index-_bdQPowM\.css\?v=\d+/g, `index-_bdQPowM.css?v=${newVer}`);
  fs.writeFileSync(html, t, "utf8");
  console.log("Updated", path.relative(root, html), "→ v=" + newVer);
}

console.log("Done. Commit assets/ + HTML and push for Cloudflare deploy.");
