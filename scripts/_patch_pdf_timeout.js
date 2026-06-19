/**
 * Add fetch/PDF timeouts to production bundle (prevents infinite "Создание PDF…").
 * Idempotent — safe to re-run after _patch_pdf_download.js.
 */
const fs = require("fs");
const path = "C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js";
let t = fs.readFileSync(path, "utf8");
const NL = t.includes("\r\n") ? "\r\n" : "\n";

if (t.includes("async function fetchWithTimeout(")) {
  console.log("SKIP: fetchWithTimeout already in bundle");
  process.exit(0);
}

const OLD_BLOCK = `async function downloadBinaryPdf(opts) {
  const res = await fetch(opts.url, { headers: opts.headers });
  if (!res.ok) {
    let msg = \`HTTP \${res.status}\`;
    try { const j = await res.json(); if (j.error) msg = j.error; } catch {}
    throw new Error(msg);
  }
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = \`\${opts.filenameBase}.pdf\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 6e4);
}
async function downloadReceiptPdf(opts) {
  const res = await fetch(opts.url, { headers: opts.headers });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  const html = fixEmailAssetUrls(await res.text());
  const iframe = document.createElement("iframe");
  iframe.setAttribute("sandbox", "allow-same-origin");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "680px";
  iframe.style.height = "2400px";
  iframe.style.border = "0";
  iframe.srcdoc = html;
  document.body.appendChild(iframe);
  await new Promise((resolve) => { iframe.addEventListener("load", () => resolve(), { once: true }); });
  const innerDoc = iframe.contentDocument;
  if (!innerDoc) { document.body.removeChild(iframe); throw new Error("iframe load failed"); }
  await waitForImages(innerDoc);
  await new Promise((r) => setTimeout(r, 200));
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;width:680px;background:#f4f6f9;";
  innerDoc.querySelectorAll("style").forEach((s) => {
    const el = document.createElement("style");
    el.textContent = s.textContent;
    host.appendChild(el);
  });
  const content = document.createElement("div");
  content.innerHTML = innerDoc.body.innerHTML;
  host.appendChild(content);
  document.body.appendChild(host);
  await waitForImages(host);
  try {
    await html2pdf().set({
      margin: 0,
      filename: \`\${opts.filenameBase}.pdf\`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#f4f6f9", scrollY: 0 },
      jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }
    }).from(content).save();
  } finally {
    document.body.removeChild(host);
    document.body.removeChild(iframe);
  }
}`;

const NEW_BLOCK = `async function fetchWithTimeout(url, init, ms = 9e4) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (err) {
    if (ctrl.signal.aborted) throw new Error(\`Request timed out after \${Math.round(ms / 1e3)}s\`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
async function withTimeout(promise, ms, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(\`\${label} timed out after \${Math.round(ms / 1e3)}s\`)), ms);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
async function downloadBinaryPdf(opts) {
  const res = await fetchWithTimeout(opts.url, { headers: opts.headers });
  if (!res.ok) {
    let msg = \`HTTP \${res.status}\`;
    try { const j = await res.json(); if (j.error) msg = j.error; } catch {}
    throw new Error(msg);
  }
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = \`\${opts.filenameBase}.pdf\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 6e4);
}
async function downloadReceiptPdf(opts) {
  const res = await fetchWithTimeout(opts.url, { headers: opts.headers });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  const html = fixEmailAssetUrls(await res.text());
  const iframe = document.createElement("iframe");
  iframe.setAttribute("sandbox", "allow-same-origin");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "680px";
  iframe.style.height = "2400px";
  iframe.style.border = "0";
  iframe.srcdoc = html;
  document.body.appendChild(iframe);
  await new Promise((resolve) => { iframe.addEventListener("load", () => resolve(), { once: true }); });
  const innerDoc = iframe.contentDocument;
  if (!innerDoc) { document.body.removeChild(iframe); throw new Error("iframe load failed"); }
  await waitForImages(innerDoc);
  await new Promise((r) => setTimeout(r, 200));
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;width:680px;background:#f4f6f9;";
  innerDoc.querySelectorAll("style").forEach((s) => {
    const el = document.createElement("style");
    el.textContent = s.textContent;
    host.appendChild(el);
  });
  const content = document.createElement("div");
  content.innerHTML = innerDoc.body.innerHTML;
  host.appendChild(content);
  document.body.appendChild(host);
  await waitForImages(host);
  try {
    await withTimeout(html2pdf().set({
      margin: 0,
      filename: \`\${opts.filenameBase}.pdf\`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#f4f6f9", scrollY: 0 },
      jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }
    }).from(content).save(), 12e4, "PDF generation");
  } finally {
    document.body.removeChild(host);
    document.body.removeChild(iframe);
  }
}`;

const oldNl = OLD_BLOCK.replace(/\n/g, NL);
const newNl = NEW_BLOCK.replace(/\n/g, NL);
if (!t.includes(oldNl)) {
  console.error("MISSING: downloadBinaryPdf block for timeout patch");
  process.exit(1);
}
t = t.replace(oldNl, newNl);

t = t.replace(
  `async function openHtmlDocument(opts) {
  const res = await fetch(opts.url, { headers: opts.headers });`,
  `async function openHtmlDocument(opts) {
  const res = await fetchWithTimeout(opts.url, { headers: opts.headers });`,
);

fs.writeFileSync(path, t, "utf8");
console.log("OK: PDF timeout patch applied, size", t.length);
