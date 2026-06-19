/**
 * Patch production bundle: server PDF for invoices + fixed estimate PDF + admin archive estimate buttons.
 */
const fs = require("fs");
const path = "C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js";
let t = fs.readFileSync(path, "utf8");
const NL = t.includes("\r\n") ? "\r\n" : "\n";

function mustReplace(from, to, label) {
  const fromNl = from.replace(/\n/g, NL);
  const toNl = to.replace(/\n/g, NL);
  if (!t.includes(fromNl)) {
    console.error("MISSING:", label || from.slice(0, 100));
    process.exit(1);
  }
  t = t.replace(fromNl, toNl);
  console.log("OK:", label);
}

const OLD_PDF_FN = `async function downloadReceiptPdf(opts) {
  const res = await fetch(opts.url, { headers: opts.headers });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  const html = await res.text();
  const iframe = document.createElement("iframe");
  iframe.setAttribute("sandbox", "allow-same-origin");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "640px";
  iframe.style.height = "10px";
  iframe.style.border = "0";
  iframe.srcdoc = html;
  document.body.appendChild(iframe);
  await new Promise((resolve) => {
    iframe.addEventListener("load", () => resolve(), { once: true });
  });
  const innerDoc = iframe.contentDocument;
  if (!innerDoc) {
    document.body.removeChild(iframe);
    throw new Error("iframe load failed");
  }
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.width = "640px";
  host.style.background = "#f4f6f9";
  host.innerHTML = innerDoc.body.innerHTML;
  document.body.appendChild(host);
  try {
    await html2pdf().set({
      margin: 0,
      filename: \`\${opts.filenameBase}.pdf\`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#f4f6f9" },
      jsPDF: { unit: "pt", format: "letter", orientation: "portrait" }
    }).from(host).save();
  } finally {
    document.body.removeChild(host);
    document.body.removeChild(iframe);
  }
}`;

const NEW_PDF_FNS = `const LOGO_INVOICE = "/htr-logo-invoice.png";
const LOGO_ESTIMATE = "/htr-logo-estimate.png";
function fixEmailAssetUrls(html) {
  return html.replace(/cid:htr-invoice-logo@htr/gi, LOGO_INVOICE).replace(/cid:htr-estimate-logo@htr/gi, LOGO_ESTIMATE);
}
async function waitForImages(root) {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(imgs.map((img) => new Promise((resolve) => {
    if (img.complete && img.naturalWidth > 0) { resolve(); return; }
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  })));
}
async function downloadBinaryPdf(opts) {
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

mustReplace(OLD_PDF_FN, NEW_PDF_FNS, "downloadReceiptPdf + downloadBinaryPdf");

mustReplace(
  `async function openHtmlDocument(opts) {
  const res = await fetch(opts.url, { headers: opts.headers });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  const html = await res.text();`,
  `async function openHtmlDocument(opts) {
  const res = await fetch(opts.url, { headers: opts.headers });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  const html = fixEmailAssetUrls(await res.text());`,
  "openHtmlDocument fix cid",
);

// Admin invoice: server PDF
mustReplace(
  `const url = \`\${API$2()}/api/admin/bookings/\${b.id}/invoice-html\``,
  `const url = \`\${API$2()}/api/admin/bookings/\${b.id}/invoice-pdf\``,
  "admin invoice-pdf url",
);
mustReplace(
  `await downloadReceiptPdf({
        url,
        headers: adminAuthH(),
        filenameBase: \`receipt-\${b.id}\`
      });`,
  `await downloadBinaryPdf({
        url,
        headers: adminAuthH(),
        filenameBase: \`receipt-\${b.id.slice(0, 8)}\`
      });`,
  "admin downloadBinaryPdf",
);

// Employee invoice: server PDF
mustReplace(
  `const url = \`\${API$1()}/api/employee/bookings/\${b.id}/invoice-html\``,
  `const url = \`\${API$1()}/api/employee/bookings/\${b.id}/invoice-pdf\``,
  "employee invoice-pdf url",
);

// Employee downloadReceipt - find the downloadReceiptPdf call after employee invoice url
if (t.includes("await downloadReceiptPdf({\r\n        url,\r\n        headers: { Authorization: `Bearer ${token}` }")) {
  t = t.replace(
    `await downloadReceiptPdf({
        url,
        headers: { Authorization: \`Bearer \${token}\` },
        filenameBase: \`receipt-\${b.id}\`
      });`,
    `await downloadBinaryPdf({
        url,
        headers: { Authorization: \`Bearer \${token}\` },
        filenameBase: \`receipt-\${b.id.slice(0, 8)}\`
      });`,
  );
  console.log("OK: employee downloadBinaryPdf");
} else {
  console.error("MISSING: employee downloadReceiptPdf call");
  process.exit(1);
}

// Payment success public invoice
if (t.includes("/api/public/invoice-html?session_id=")) {
  t = t.replace(/\/api\/public\/invoice-html\?session_id=/g, "/api/public/invoice-pdf?session_id=");
  t = t.replace(
    /await downloadReceiptPdf\(\{ url, filenameBase \}\)/,
    "await downloadBinaryPdf({ url, filenameBase })",
  );
  console.log("OK: payment-success invoice-pdf");
}

fs.writeFileSync(path, t, "utf8");
console.log("Patched", path, "size", t.length);
