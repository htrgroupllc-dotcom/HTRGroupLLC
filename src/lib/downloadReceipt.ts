import html2pdf from "html2pdf.js";

const LOGO_INVOICE = "/htr-logo-invoice.png";
const LOGO_ESTIMATE = "/htr-logo-estimate.png";

function fixEmailAssetUrls(html: string): string {
  return html
    .replace(/cid:htr-invoice-logo@htr/gi, LOGO_INVOICE)
    .replace(/cid:htr-estimate-logo@htr/gi, LOGO_ESTIMATE);
}

async function waitForImages(root: ParentNode): Promise<void> {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  );
}

/** Download a server-generated PDF (invoice). */
export async function downloadBinaryPdf(opts: {
  url: string;
  headers?: Record<string, string>;
  filenameBase: string;
}): Promise<void> {
  const res = await fetch(opts.url, { headers: opts.headers });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* body is not JSON */
    }
    throw new Error(msg);
  }
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = `${opts.filenameBase}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

/**
 * Fetches server-rendered HTML (estimate) and converts to PDF in-browser.
 */
export async function downloadReceiptPdf(opts: {
  url: string;
  headers?: Record<string, string>;
  filenameBase: string;
}): Promise<void> {
  const res = await fetch(opts.url, { headers: opts.headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

  await new Promise<void>((resolve) => {
    iframe.addEventListener("load", () => resolve(), { once: true });
  });

  const innerDoc = iframe.contentDocument;
  if (!innerDoc) {
    document.body.removeChild(iframe);
    throw new Error("iframe load failed");
  }

  await waitForImages(innerDoc);
  await new Promise((r) => setTimeout(r, 200));

  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.width = "680px";
  host.style.background = "#f4f6f9";

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
    await html2pdf()
      .set({
        margin: 0,
        filename: `${opts.filenameBase}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#f4f6f9", scrollY: 0 },
        jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(content)
      .save();
  } finally {
    document.body.removeChild(host);
    document.body.removeChild(iframe);
  }
}

/** Opens server-rendered HTML in a new browser tab (for estimate preview). */
export async function openHtmlDocument(opts: {
  url: string;
  headers?: Record<string, string>;
}): Promise<void> {
  const res = await fetch(opts.url, { headers: opts.headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = fixEmailAssetUrls(await res.text());
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(blobUrl), 120_000);
}
