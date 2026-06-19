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
  console.log("OK:", label || from.slice(0, 60));
}

// 1. openHtmlDocument helper (after downloadReceiptPdf)
mustReplace(
  `  } finally {
    document.body.removeChild(host);
    document.body.removeChild(iframe);
  }
}
const ACCENT$c = "#1B6FE8";`,
  `  } finally {
    document.body.removeChild(host);
    document.body.removeChild(iframe);
  }
}
async function openHtmlDocument(opts) {
  const res = await fetch(opts.url, { headers: opts.headers });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  const html = await res.text();
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(blobUrl), 120000);
}
const ACCENT$c = "#1B6FE8";`,
  "openHtmlDocument helper",
);

// 2. Employee i18n
mustReplace(
  `    estimateEdit: "Edit & Resend",
    estimateEditTitle: "Edit Estimate",`,
  `    estimateEdit: "Edit & Resend",
    estimateView: "View",
    estimateDownload: "PDF",
    estimateViewError: "Could not open estimate. Please try again.",
    estimateEditTitle: "Edit Estimate",`,
  "emp i18n en",
);
mustReplace(
  `    estimateEdit: "Изменить и отправить",
    estimateEditTitle: "Редактировать смету",`,
  `    estimateEdit: "Изменить и отправить",
    estimateView: "Просмотр",
    estimateDownload: "PDF",
    estimateViewError: "Не удалось открыть смету. Попробуйте ещё раз.",
    estimateEditTitle: "Редактировать смету",`,
  "emp i18n ru",
);
mustReplace(
  `    estimateEdit: "Editar y reenviar",
    estimateEditTitle: "Editar presupuesto",`,
  `    estimateEdit: "Editar y reenviar",
    estimateView: "Ver",
    estimateDownload: "PDF",
    estimateViewError: "No se pudo abrir el presupuesto. Inténtelo de nuevo.",
    estimateEditTitle: "Editar presupuesto",`,
  "emp i18n es",
);

// 3. Admin i18n
mustReplace(
  `    estimateEditBtn: "Edit / Resend",
    noTax: "No tax (discount for client)",`,
  `    estimateEditBtn: "Edit / Resend",
    estimateViewBtn: "View",
    estimateDownloadBtn: "PDF",
    estimateViewError: "Could not open estimate. Please try again.",
    noTax: "No tax (discount for client)",`,
  "admin i18n en",
);
mustReplace(
  `    estimateEditBtn: "Изм. / Повтор",
    noTax: "Без налога (скидка для клиента)",`,
  `    estimateEditBtn: "Изм. / Повтор",
    estimateViewBtn: "Просмотр",
    estimateDownloadBtn: "PDF",
    estimateViewError: "Не удалось открыть смету. Попробуйте ещё раз.",
    noTax: "Без налога (скидка для клиента)",`,
  "admin i18n ru",
);

// 4. Employee view/download handlers
mustReplace(
  `  const [downloadingReceiptId, setDownloadingReceiptId] = reactExports.useState(null);
  const downloadReceipt = reactExports.useCallback(async (b) => {
    if (!token || downloadingReceiptId) return;
    setDownloadingReceiptId(b.id);
    try {
      const langOverride = b.client_lang === "es" ? "es" : b.client_lang === "en" ? "en" : b.payment_language === "es" ? "es" : b.payment_language === "en" ? "en" : null;
      const url = \`\${API$1()}/api/employee/bookings/\${b.id}/invoice-html\` + (langOverride ? \`?lang=\${langOverride}\` : "");
      await downloadReceiptPdf({
        url,
        headers: { "Authorization": \`Bearer \${token}\` },
        filenameBase: \`receipt-\${b.id}\`
      });
    } catch {
      window.alert(t("receiptError"));
    } finally {
      setDownloadingReceiptId(null);
    }
  }, [token, downloadingReceiptId, t]);`,
  `  const [downloadingReceiptId, setDownloadingReceiptId] = reactExports.useState(null);
  const [downloadingEstimateId, setDownloadingEstimateId] = reactExports.useState(null);
  const downloadReceipt = reactExports.useCallback(async (b) => {
    if (!token || downloadingReceiptId) return;
    setDownloadingReceiptId(b.id);
    try {
      const langOverride = b.client_lang === "es" ? "es" : b.client_lang === "en" ? "en" : b.payment_language === "es" ? "es" : b.payment_language === "en" ? "en" : null;
      const url = \`\${API$1()}/api/employee/bookings/\${b.id}/invoice-html\` + (langOverride ? \`?lang=\${langOverride}\` : "");
      await downloadReceiptPdf({
        url,
        headers: { "Authorization": \`Bearer \${token}\` },
        filenameBase: \`receipt-\${b.id}\`
      });
    } catch {
      window.alert(t("receiptError"));
    } finally {
      setDownloadingReceiptId(null);
    }
  }, [token, downloadingReceiptId, t]);
  const viewEstimate = reactExports.useCallback(async (b, estimateId) => {
    if (!token) return;
    try {
      const url = \`\${API$1()}/api/employee/bookings/\${b.id}/estimate-html\` + (estimateId ? \`?estimate_id=\${estimateId}\` : "");
      await openHtmlDocument({ url, headers: { Authorization: \`Bearer \${token}\` } });
    } catch {
      window.alert(t("estimateViewError"));
    }
  }, [token, t]);
  const downloadEstimate = reactExports.useCallback(async (b, estimateId) => {
    if (!token || downloadingEstimateId) return;
    setDownloadingEstimateId(b.id);
    try {
      const url = \`\${API$1()}/api/employee/bookings/\${b.id}/estimate-html\` + (estimateId ? \`?estimate_id=\${estimateId}\` : "");
      await downloadReceiptPdf({
        url,
        headers: { Authorization: \`Bearer \${token}\` },
        filenameBase: \`estimate-\${b.id.slice(0, 8)}\`
      });
    } catch {
      window.alert(t("estimateViewError"));
    } finally {
      setDownloadingEstimateId(null);
    }
  }, [token, downloadingEstimateId, t]);`,
  "employee viewEstimate handlers",
);

// 5. Load estimates for all bookings (not only active)
mustReplace(
  `      for (const b of bks) {
        if (b.status === "completed" || b.employee_archived_at) continue;
        if (b.last_estimate_id != null) {`,
  `      for (const b of bks) {
        if (b.last_estimate_id != null) {`,
  "employee loadBookings estimates filter",
);

// 6. JobCard props — active jobs
mustReplace(
  `                    onEditEstimate: estimateHistory[b.id] ? () => openEstimateModal(b, estimateHistory[b.id]) : void 0,
                    lastEstimate: estimateHistory[b.id],
                    onPhotos: () => openPhotoModal(b.id),`,
  `                    onEditEstimate: estimateHistory[b.id] ? () => openEstimateModal(b, estimateHistory[b.id]) : void 0,
                    lastEstimate: estimateHistory[b.id],
                    onViewEstimate: estimateHistory[b.id] ? () => void viewEstimate(b, estimateHistory[b.id].id) : void 0,
                    onDownloadEstimate: estimateHistory[b.id] ? () => void downloadEstimate(b, estimateHistory[b.id].id) : void 0,
                    downloadingEstimate: downloadingEstimateId === b.id,
                    onPhotos: () => openPhotoModal(b.id),`,
  "JobCard active props",
);

// 7. JobCard props — completed jobs
mustReplace(
  `                    onClose: void 0,
                    onArchive: () => void archiveJob(b.id),
                    archiving: archivingId === b.id,
                    onPhotos: () => openPhotoModal(b.id),`,
  `                    onClose: void 0,
                    lastEstimate: estimateHistory[b.id],
                    onViewEstimate: estimateHistory[b.id] ? () => void viewEstimate(b, estimateHistory[b.id].id) : void 0,
                    onDownloadEstimate: estimateHistory[b.id] ? () => void downloadEstimate(b, estimateHistory[b.id].id) : void 0,
                    downloadingEstimate: downloadingEstimateId === b.id,
                    onArchive: () => void archiveJob(b.id),
                    archiving: archivingId === b.id,
                    onPhotos: () => openPhotoModal(b.id),`,
  "JobCard completed props",
);

// 8. JobCard props — archived jobs
mustReplace(
  `                    onClose: void 0,
                    isArchived: true,
                    onRestore: () => void restoreJob(b.id),
                    archiving: archivingId === b.id,
                    onPhotos: () => openPhotoModal(b.id),`,
  `                    onClose: void 0,
                    isArchived: true,
                    lastEstimate: estimateHistory[b.id],
                    onViewEstimate: estimateHistory[b.id] ? () => void viewEstimate(b, estimateHistory[b.id].id) : void 0,
                    onDownloadEstimate: estimateHistory[b.id] ? () => void downloadEstimate(b, estimateHistory[b.id].id) : void 0,
                    downloadingEstimate: downloadingEstimateId === b.id,
                    onRestore: () => void restoreJob(b.id),
                    archiving: archivingId === b.id,
                    onPhotos: () => openPhotoModal(b.id),`,
  "JobCard archived props",
);

// 9. JobCard function signature
mustReplace(
  `  onEditEstimate,
  lastEstimate,
  onArchive,`,
  `  onEditEstimate,
  lastEstimate,
  onViewEstimate,
  onDownloadEstimate,
  downloadingEstimate,
  onArchive,`,
  "JobCard signature",
);

// 10. JobCard estimate badge UI
mustReplace(
  `    lastEstimate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: 8,
      padding: "8px 12px",
      marginTop: 12
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 13 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { style: { width: 14, height: 14, color: ACCENT$3, flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#64748b" }, children: [
          t("estimateSent"),
          ":"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 800, color: ACCENT$3 }, children: [
          "$",
          Number(lastEstimate.total).toFixed(2)
        ] })
      ] }),
      onEditEstimate && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onEditEstimate,
          style: {
            background: "none",
            border: \`1px solid \${ACCENT$3}\`,
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            color: ACCENT$3,
            padding: "3px 8px",
            borderRadius: 6
          },
          children: t("estimateEdit")
        }
      )
    ] }),`,
  `    lastEstimate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: 8,
      padding: "8px 12px",
      marginTop: 12
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 13 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { style: { width: 14, height: 14, color: ACCENT$3, flexShrink: 0 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#64748b" }, children: [
            t("estimateSent"),
            ":"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 800, color: ACCENT$3 }, children: [
            "$",
            Number(lastEstimate.total).toFixed(2)
          ] })
        ] }),
        onEditEstimate && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onEditEstimate,
            style: {
              background: "none",
              border: \`1px solid \${ACCENT$3}\`,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              color: ACCENT$3,
              padding: "3px 8px",
              borderRadius: 6
            },
            children: t("estimateEdit")
          }
        )
      ] }),
      (onViewEstimate || onDownloadEstimate) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        onViewEstimate && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onViewEstimate,
            style: {
              flex: 1,
              background: "#fff",
              border: \`1px solid \${ACCENT$3}\`,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              color: ACCENT$3,
              padding: "6px 8px",
              borderRadius: 6
            },
            children: t("estimateView")
          }
        ),
        onDownloadEstimate && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onDownloadEstimate,
            disabled: downloadingEstimate,
            style: {
              flex: 1,
              background: "#fff",
              border: \`1px solid \${ACCENT$3}\`,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              color: ACCENT$3,
              padding: "6px 8px",
              borderRadius: 6,
              opacity: downloadingEstimate ? 0.6 : 1
            },
            children: downloadingEstimate ? t("generating") : t("estimateDownload")
          }
        )
      ] })
    ] }),`,
  "JobCard estimate badge UI",
);

fs.writeFileSync(path, t, "utf8");
console.log("patched", path, "size", t.length);
