import html2pdf from "html2pdf.js";

/**
 * Fetches a server-rendered receipt HTML, sandboxes it inside an off-screen
 * iframe (so any inline JS cannot execute), then rasterizes the result to a
 * PDF the browser downloads. Mirrors the flow used on the public
 * /payment-success page so admin/employee receipts match exactly.
 */
export async function downloadReceiptPdf(opts: {
  url: string;
  headers?: Record<string, string>;
  filenameBase: string;
}): Promise<void> {
  const res = await fetch(opts.url, { headers: opts.headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

  await new Promise<void>((resolve) => {
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
    await html2pdf()
      .set({
        margin: 0,
        filename: `${opts.filenameBase}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#f4f6f9" },
        jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },
      })
      .from(host)
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
  const html = await res.text();
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(blobUrl), 120_000);
}
