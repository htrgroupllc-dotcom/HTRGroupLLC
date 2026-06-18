"""Patch prod bundle: TrashTab mobile layout (no overlap)."""
from pathlib import Path

ROOT = Path(r"C:/Projects/HTRGroupLLC")
bundle = ROOT / "assets/index-utf8-v4.js"
html = ROOT / "index.html"

text = bundle.read_text(encoding="utf-8")
replacements = [
    (
        'permErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mb-2", children: permErr }),\n      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [\n        /* @__PURE__ */ jsxRuntimeExports.jsx(\n          "button",\n          {\n            onClick: () => {\n              setConfirmPerm(null);\n              setPermErr(null);\n            },\n            disabled: permDeleting,\n            className: "flex-1 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50",\n            children: t.cancel\n          }\n        ),\n        /* @__PURE__ */ jsxRuntimeExports.jsx(\n          "button",\n          {\n            onClick: permanentDelete,\n            disabled: permDeleting,\n            className: "flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60",\n            children: permDeleting ? t.trashDeleting : t.trashPermanentConfirmYes',
        'permErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mb-2", children: permErr }),\n      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col-reverse sm:flex-row gap-2", children: [\n        /* @__PURE__ */ jsxRuntimeExports.jsx(\n          "button",\n          {\n            onClick: () => {\n              setConfirmPerm(null);\n              setPermErr(null);\n            },\n            disabled: permDeleting,\n            className: "flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50",\n            children: t.cancel\n          }\n        ),\n        /* @__PURE__ */ jsxRuntimeExports.jsx(\n          "button",\n          {\n            onClick: permanentDelete,\n            disabled: permDeleting,\n            className: "flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 inline-flex items-center justify-center text-center leading-snug",\n            children: permDeleting ? t.trashDeleting : t.trashPermanentConfirmYes',
    ),
    (
        'permErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mb-2", children: permErr }),\n      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [\n        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => { setConfirmBulkPerm(null); setPermErr(null); }, disabled: permDeleting, className: "flex-1 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50", children: t.cancel }),\n        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: permanentDeleteBulk, disabled: permDeleting, className: "flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60", children: permDeleting ? t.trashDeleting : t.trashBulkDeleteYes }',
        'permErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mb-2", children: permErr }),\n      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col-reverse sm:flex-row gap-2", children: [\n        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => { setConfirmBulkPerm(null); setPermErr(null); }, disabled: permDeleting, className: "flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50", children: t.cancel }),\n        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: permanentDeleteBulk, disabled: permDeleting, className: "flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 inline-flex items-center justify-center text-center leading-snug", children: permDeleting ? t.trashDeleting : t.trashBulkDeleteYes }',
    ),
    (
        'onClick: () => { setConfirmBulkPerm([...selectedIds]); setPermErr(null); }, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition", children: [\n        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }),\n        t.trashBulkDeleteBtn(selectedIds.size)',
        'onClick: () => { setConfirmBulkPerm([...selectedIds]); setPermErr(null); }, className: "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition text-center leading-snug shrink-0", children: [\n        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 shrink-0" }),\n        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.trashBulkDeleteBtn(selectedIds.size) })',
    ),
    (
        'className: "flex items-start justify-between gap-3 flex-wrap", children: [\n        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 flex-1 min-w-0 cursor-pointer", children: [',
        'className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", children: [\n        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 min-w-0 cursor-pointer w-full sm:flex-1", children: [',
    ),
    (
        '/* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-stone-700 text-sm", children: b.name }),\n            /* @__PURE__ */ jsxRuntimeExports.jsx(\n              "span",\n              {\n                className: "inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold",\n                style: { background: col.bg, color: col.text },\n                children: statusLabel2(b.status)',
        '/* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-stone-700 text-sm break-words", children: b.name }),\n            /* @__PURE__ */ jsxRuntimeExports.jsx(\n              "span",\n              {\n                className: "inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0",\n                style: { background: col.bg, color: col.text },\n                children: statusLabel2(b.status)',
    ),
    (
        'b.appliance && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-stone-400", children: b.appliance }),\n          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-stone-400", children: [\n            b.preferred_date,\n            " · ",\n            b.preferred_time',
        'b.appliance && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-stone-400 break-words", children: b.appliance }),\n          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-stone-400 break-words", children: [\n            b.preferred_date,\n            " · ",\n            b.preferred_time',
    ),
    (
        '/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [\n          /* @__PURE__ */ jsxRuntimeExports.jsxs(\n            "button",\n            {\n              onClick: () => restoreBooking(b.id),\n              disabled: restoringId === b.id,\n              className: "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition disabled:opacity-50",\n              style: { borderColor: ACCENT$6, color: ACCENT$6 },\n              title: t.trashRestoreBtn,\n              children: [\n                /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: `w-3.5 h-3.5 ${restoringId === b.id ? "animate-spin" : ""}` }),\n                restoringId === b.id ? t.trashRestoring : t.trashRestoreBtn\n              ]',
        '/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full gap-2 pl-7 sm:pl-0 sm:w-auto sm:flex-shrink-0", children: [\n          /* @__PURE__ */ jsxRuntimeExports.jsxs(\n            "button",\n            {\n              onClick: () => restoreBooking(b.id),\n              disabled: restoringId === b.id,\n              className: "flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition disabled:opacity-50 leading-snug text-center",\n              style: { borderColor: ACCENT$6, color: ACCENT$6 },\n              title: t.trashRestoreBtn,\n              children: [\n                /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: `w-3.5 h-3.5 shrink-0 ${restoringId === b.id ? "animate-spin" : ""}` }),\n                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: restoringId === b.id ? t.trashRestoring : t.trashRestoreBtn })',
    ),
    (
        'disabled: restoringId === b.id,\n              className: "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-50",\n              title: t.trashPermanentBtn,\n              children: [\n                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }),\n                t.trashPermanentBtn\n              ]',
        'disabled: restoringId === b.id,\n              className: "flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-50 leading-snug text-center",\n              title: t.trashPermanentBtn,\n              children: [\n                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5 shrink-0" }),\n                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.trashPermanentBtn })',
    ),
]

for old, new in replacements:
    if old not in text:
        raise SystemExit(f"PATCH MISS:\n{old[:160]}...")
    text = text.replace(old, new, 1)

bundle.write_text(text, encoding="utf-8")

html_text = html.read_text(encoding="utf-8")
html_text = html_text.replace("?v=89", "?v=90")
html.write_text(html_text, encoding="utf-8")
print("Patched bundle + index.html cache v=90")
