import html2pdf from "html2pdf.js";

const LOGO_INVOICE = "/htr-logo-invoice.png";
const LOGO_ESTIMATE = "/htr-logo-estimate.png";

function previewOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

function logoUrl(path: string): string {
  const origin = previewOrigin();
  if (!origin) return path;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

function fixEmailAssetUrls(html: string): string {
  const inv = logoUrl(LOGO_INVOICE);
  const est = logoUrl(LOGO_ESTIMATE);
  return html
    .replace(/cid:htr-invoice-logo@htr/gi, inv)
    .replace(/cid:htr-estimate-logo@htr/gi, est);
}

function ensurePreviewBase(html: string): string {
  const origin = previewOrigin();
  const logoCss = `<style>img[src*="htr-logo"],img[alt*="HTR Group"]{height:auto!important;max-height:72px!important;width:auto!important;max-width:150px!important;object-fit:contain!important;}</style>`;
  let out = html;
  if (origin && !/<base\s/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}/">`);
  }
  if (!out.includes("htr-doc-logo-css")) {
    out = out.replace(/<head([^>]*)>/i, `<head$1>${logoCss.replace("<style>", '<style id="htr-doc-logo-css">')}`);
  }
  return out;
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

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  ms = 90_000,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (err) {
    if (ctrl.signal.aborted) {
      throw new Error(`Request timed out after ${Math.round(ms / 1000)}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function fixSignLinksForPreview(html: string): string {
  return html.replace(
    /<a\b([^>]*\bhref="[^"]*\/api\/sign\/[^"]*")([^>]*)>/gi,
    (_match, hrefPart: string, rest: string) => {
      if (/\btarget\s*=/.test(hrefPart + rest)) return _match;
      return `<a ${hrefPart} target="_blank" rel="noopener noreferrer"${rest}>`;
    },
  );
}

export function fixDocumentHtmlForPreview(html: string): string {
  return ensurePreviewBase(fixSignLinksForPreview(fixEmailAssetUrls(html)));
}

/** Download a server-generated PDF (invoice). */
export async function downloadBinaryPdf(opts: {
  url: string;
  headers?: Record<string, string>;
  filenameBase: string;
}): Promise<void> {
  const res = await fetchWithTimeout(opts.url, { headers: opts.headers });
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
  const res = await fetchWithTimeout(opts.url, { headers: opts.headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = fixDocumentHtmlForPreview(await res.text());

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
    await withTimeout(
      html2pdf()
        .set({
          margin: 0,
          filename: `${opts.filenameBase}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#f4f6f9", scrollY: 0 },
          jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(content)
        .save(),
      120_000,
      "PDF generation",
    );
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
  const res = await fetchWithTimeout(opts.url, { headers: opts.headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = fixDocumentHtmlForPreview(await res.text());
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(blobUrl), 120_000);
}
