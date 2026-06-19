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

mustReplace(
  `  const [downloadingReceiptId, setDownloadingReceiptId] = reactExports.useState(null);
  const [resendingReceiptId, setResendingReceiptId] = reactExports.useState(null);`,
  `  const [downloadingReceiptId, setDownloadingReceiptId] = reactExports.useState(null);
  const [downloadingEstimateId, setDownloadingEstimateId] = reactExports.useState(null);
  const [resendingReceiptId, setResendingReceiptId] = reactExports.useState(null);`,
  "admin downloadingEstimateId state",
);

mustReplace(
  `  }, [adminAuthH, downloadingReceiptId, loadReceiptHistory, getReceiptHistoryFilters, t.downloadReceiptError]);
  const resendReceipt = reactExports.useCallback(async (b) => {`,
  `  }, [adminAuthH, downloadingReceiptId, loadReceiptHistory, getReceiptHistoryFilters, t.downloadReceiptError]);
  const viewEstimate = reactExports.useCallback(async (b, estimateId) => {
    try {
      const url = \`\${API$2()}/api/admin/bookings/\${b.id}/estimate-html\` + (estimateId ? \`?estimate_id=\${estimateId}\` : "");
      await openHtmlDocument({ url, headers: adminAuthH() });
    } catch {
      window.alert(t.estimateViewError);
    }
  }, [adminAuthH, t.estimateViewError]);
  const downloadEstimate = reactExports.useCallback(async (b, estimateId) => {
    if (downloadingEstimateId) return;
    setDownloadingEstimateId(b.id);
    try {
      const url = \`\${API$2()}/api/admin/bookings/\${b.id}/estimate-html\` + (estimateId ? \`?estimate_id=\${estimateId}\` : "");
      await downloadReceiptPdf({
        url,
        headers: adminAuthH(),
        filenameBase: \`estimate-\${b.id.slice(0, 8)}\`
      });
    } catch {
      window.alert(t.estimateViewError);
    } finally {
      setDownloadingEstimateId(null);
    }
  }, [adminAuthH, downloadingEstimateId, t.estimateViewError]);
  const resendReceipt = reactExports.useCallback(async (b) => {`,
  "admin viewEstimate handlers",
);

mustReplace(
  `      setAllBookings(d.bookings ?? []);
      const nonCompleted = (d.bookings ?? []).filter((b) => b.status !== "completed");
      void Promise.all(nonCompleted.map((b) => loadAdminLastEstimate(b.id)));`,
  `      setAllBookings(d.bookings ?? []);
      void Promise.all((d.bookings ?? []).map((b) => loadAdminLastEstimate(b.id)));`,
  "admin loadSchedule all estimates",
);

mustReplace(
  `                      adminEstimateHistory[b.id] && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-500", children: "📋" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-500", children: [
                            t.estimateSentBadge,
                            ":"
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-blue-700", children: [
                            "$",
                            Number(adminEstimateHistory[b.id].total).toFixed(2)
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: () => openAdminEstimate({ id: b.id, name: b.name, email: b.email ?? "", phone: b.phone ?? "" }, adminEstimateHistory[b.id]),
                            className: "font-bold text-blue-700 border border-blue-300 rounded px-2 py-0.5 hover:bg-blue-100 transition",
                            children: t.estimateEditBtn
                          }
                        )
                      ] }),`,
  `                      adminEstimateHistory[b.id] && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-500", children: "📋" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-500", children: [
                              t.estimateSentBadge,
                              ":"
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-blue-700", children: [
                              "$",
                              Number(adminEstimateHistory[b.id].total).toFixed(2)
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "button",
                            {
                              onClick: () => openAdminEstimate({ id: b.id, name: b.name, email: b.email ?? "", phone: b.phone ?? "" }, adminEstimateHistory[b.id]),
                              className: "font-bold text-blue-700 border border-blue-300 rounded px-2 py-0.5 hover:bg-blue-100 transition",
                              children: t.estimateEditBtn
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "button",
                            {
                              onClick: () => void viewEstimate(b, adminEstimateHistory[b.id].id),
                              className: "flex-1 font-bold text-blue-700 border border-blue-300 rounded px-2 py-1 hover:bg-blue-100 transition",
                              children: t.estimateViewBtn
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "button",
                            {
                              disabled: downloadingEstimateId === b.id,
                              onClick: () => void downloadEstimate(b, adminEstimateHistory[b.id].id),
                              className: "flex-1 font-bold text-blue-700 border border-blue-300 rounded px-2 py-1 hover:bg-blue-100 transition disabled:opacity-50",
                              children: downloadingEstimateId === b.id ? t.downloadReceiptDownloading : t.estimateDownloadBtn
                            }
                          )
                        ] })
                      ] }),`,
  "admin mobile estimate badge",
);

fs.writeFileSync(path, t, "utf8");
console.log("admin patched", path, "size", t.length);
