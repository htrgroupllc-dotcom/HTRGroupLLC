#!/usr/bin/env node
/**
 * Safe patch: PageBgPicker into pinned admin-index bundle (candidate → verify → promote).
 * Usage:
 *   node scripts/_patch-admin-page-bg.mjs           # writes .candidate
 *   node scripts/_patch-admin-page-bg.mjs --promote # copy candidate → live + bump hint
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "assets/index-utf8-v4.js");
const adminPath = path.join(root, "assets/admin-index-utf8-v4.js");
const candidatePath = path.join(root, "assets/admin-index-utf8-v4.js.candidate");
const backupPath = path.join(root, "assets/admin-index-utf8-v4.js.v150.bak");

const promote = process.argv.includes("--promote");

function verifyCandidate(text) {
  const checks = [
    ["htr-portal-page-bg", text.includes("htr-portal-page-bg")],
    ["PgBgPicker mobile", text.includes("PgBgPicker,{value:PgBgVal,onChange:PgBgSet,lang:t,compact:!0}")],
  ["PgBgPicker desktop", text.includes("PgBgPicker,{value:PgBgVal,onChange:PgBgSet,lang:t})")],
  ["palette icon Fr", text.includes('PgBgPaletteIcon=Fr("palette"')],
  ["usePageBg hook", text.includes("[PgBgVal,PgBgSet]=PgBgUseHook($0)")],
    ["HTRGroupTX Admin", text.includes("HTRGroupTX Admin")],
    ["tabTrash", text.includes("tabTrash")],
    ["size ok", text.length > 2_000_000 && text.length < 25 * 1024 * 1024],
  ];
  const failed = checks.filter(([, ok]) => !ok);
  if (failed.length) {
    console.error("Verification failed:");
    for (const [name] of failed) console.error("  -", name);
    process.exit(1);
  }
  console.log("OK:", checks.map(([n]) => n).join(", "));
}

if (promote) {
  if (!fs.existsSync(candidatePath)) {
    console.error("Missing candidate:", candidatePath);
    process.exit(1);
  }
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(adminPath, backupPath);
    console.log("Backup saved:", backupPath);
  }
  fs.copyFileSync(candidatePath, adminPath);
  console.log("Promoted candidate →", adminPath);
  execSync(`node --check "${adminPath}"`, { stdio: "inherit" });
  process.exit(0);
}

const idx = fs.readFileSync(indexPath, "utf8");
let adm = fs.readFileSync(adminPath, "utf8");

if (adm.includes("htr-portal-page-bg")) {
  console.log("Admin bundle already has page bg picker — skip.");
  process.exit(0);
}

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(adminPath, backupPath);
  console.log("Backup saved:", backupPath);
}

const modStart = idx.indexOf('const fS="htr-portal-page-bg"');
const modEnd = idx.indexOf("const pS={ru:{schedule");
if (modStart < 0 || modEnd < 0) {
  console.error("Could not locate page-bg module in index bundle");
  process.exit(1);
}
let modBlock = idx.slice(modStart, modEnd);

const iconEnd = idx.indexOf('oN=Lr("palette",aN);');
const iconStart = idx.lastIndexOf("const aN=", iconEnd);
if (iconStart < 0 || iconEnd < 0) {
  console.error("Could not locate palette icon in index bundle");
  process.exit(1);
}
const iconBlock = idx.slice(iconStart, iconEnd + 'oN=Lr("palette",aN);'.length);

const rename = {
  fS: "PgBgKey",
  Z0: "PgBgEvt",
  lI: "PgBgPresets",
  cI: "PgBgValidHex",
  ib: "PgBgRead",
  AI: "PgBgWrite",
  lb: "PgBgApplyDoc",
  hS: "PgBgUseHook",
  og: "PgBgPicker",
  oN: "PgBgPaletteIcon",
  aN: "PgBgIconPaths",
};

let patchedMod = modBlock + iconBlock;
for (const [from, to] of Object.entries(rename)) {
  patchedMod = patchedMod.replace(new RegExp(`\\b${from}\\b`, "g"), to);
}
patchedMod = patchedMod.replace(/\bO\./g, "_.");
patchedMod = patchedMod.replace(/PgBgPaletteIcon=Lr\(/g, "PgBgPaletteIcon=Fr(");

const insertAt = adm.indexOf("const tS={ru:{schedule");
if (insertAt < 0) {
  console.error("Could not locate admin translations in admin bundle");
  process.exit(1);
}
adm = adm.slice(0, insertAt) + patchedMod + adm.slice(insertAt);

const piHookNeedle = "function PI(){const{lang:t,setLang:s,t:r}=jh(),{toast:i}=a1(),u=RI(),";
const piHookReplace =
  "function PI(){const{lang:t,setLang:s,t:r}=jh(),{toast:i}=a1(),[PgBgVal,PgBgSet]=PgBgUseHook($0),u=RI(),";
if (!adm.includes(piHookNeedle)) {
  console.error("Could not locate PI() hook insertion point");
  process.exit(1);
}
adm = adm.replace(piHookNeedle, piHookReplace);

/** Only the 3 admin-shell backgrounds inside PI — no bulk slice of PI body. */
const bgReplacements = [
  [
    '"min-h-screen flex flex-col items-center justify-center gap-3",style:{background:$0}',
    '"min-h-screen flex flex-col items-center justify-center gap-3",style:{background:PgBgVal}',
  ],
  [
    'className:"min-h-screen",style:{background:$0},children:[at&&',
    'className:"min-h-screen",style:{background:PgBgVal},children:[at&&',
  ],
  [
    "style:{background:$0,paddingBottom:80},children:[e.jsxs(",
    "style:{background:PgBgVal,paddingBottom:80},children:[e.jsxs(",
  ],
];
for (const [from, to] of bgReplacements) {
  if (!adm.includes(from)) {
    console.error("Missing expected PI background anchor:", from.slice(0, 80));
    process.exit(1);
  }
  const count = adm.split(from).length - 1;
  if (count !== 1) {
    console.error(`Expected 1 match for background anchor, got ${count}:`, from.slice(0, 80));
    process.exit(1);
  }
  adm = adm.replace(from, to);
}

const mobilePayEnd =
  'children:r.pay??"Pay"})]}),e.jsxs("button",{onClick:()=>s(t==="ru"?"en":"ru"),className:"px-2 py-1 rounded-md text-xs font-bold border border-stone-200';
const mobileWithPicker =
  'children:r.pay??"Pay"})]}),e.jsx(PgBgPicker,{value:PgBgVal,onChange:PgBgSet,lang:t,compact:!0}),e.jsxs("button",{onClick:()=>s(t==="ru"?"en":"ru"),className:"px-2 py-1 rounded-md text-xs font-bold border border-stone-200';
if (!adm.includes(mobilePayEnd)) {
  console.error("Could not locate mobile admin header for PageBgPicker insert");
  process.exit(1);
}
adm = adm.replace(mobilePayEnd, mobileWithPicker);

const desktopPayEnd =
  'r.pay??"Pay"]}),e.jsxs("button",{onClick:()=>s(t==="ru"?"en":"ru"),className:"px-3 py-1.5 rounded-lg border border-stone-200';
const desktopWithPicker =
  'r.pay??"Pay"]}),e.jsx(PgBgPicker,{value:PgBgVal,onChange:PgBgSet,lang:t}),e.jsxs("button",{onClick:()=>s(t==="ru"?"en":"ru"),className:"px-3 py-1.5 rounded-lg border border-stone-200';
if (!adm.includes(desktopPayEnd)) {
  console.error("Could not locate desktop admin header for PageBgPicker insert");
  process.exit(1);
}
adm = adm.replace(desktopPayEnd, desktopWithPicker);

fs.writeFileSync(candidatePath, adm, "utf8");
console.log("Wrote candidate", candidatePath, "→", (adm.length / 1048576).toFixed(2), "MiB");

const checkTmp = path.join(root, "assets/_admin-candidate-syntax-check.js");
fs.copyFileSync(candidatePath, checkTmp);
try {
  execSync(`node --check "${checkTmp}"`, { stdio: "inherit" });
} finally {
  fs.unlinkSync(checkTmp);
}
verifyCandidate(adm);
console.log("Candidate ready. Local test admin with candidate bundle before --promote.");
