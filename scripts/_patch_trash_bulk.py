"""Patch prod bundle: trash bulk delete + AdminLang keys."""
import re
from pathlib import Path

ROOT = Path(r"C:/Projects/HTRGroupLLC")
bundle = ROOT / "assets/index-utf8-v4.js"
html = ROOT / "index.html"
old_fn = ROOT / "scripts/_trash_tab_old.js"

text = bundle.read_text(encoding="utf-8")
old = old_fn.read_text(encoding="utf-8")

# ── Build new TrashTab from old + bulk selection ─────────────────────────────
new = old
new = new.replace(
  "  const [emptyErr, setEmptyErr] = reactExports.useState(null);\n  const load =",
  """  const [emptyErr, setEmptyErr] = reactExports.useState(null);
  const [selectedIds, setSelectedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [confirmBulkPerm, setConfirmBulkPerm] = reactExports.useState(null);
  const load =""",
)

new = new.replace(
  "  }, [apiBase, adminAuthH]);\n  reactExports.useEffect(() => {\n    load();\n  }, [load]);",
  """  }, [apiBase, adminAuthH, onCountChange]);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  reactExports.useEffect(() => {
    setSelectedIds((prev) => {
      const valid = new Set(bookings.map((b) => b.id));
      const next = new Set([...prev].filter((id2) => valid.has(id2)));
      return next.size === prev.size ? prev : next;
    });
  }, [bookings]);
  const allSelected = bookings.length > 0 && selectedIds.size === bookings.length;
  const toggleSelect = (id2) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id2)) next.delete(id2);
      else next.add(id2);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(/* @__PURE__ */ new Set());
    else setSelectedIds(new Set(bookings.map((b) => b.id)));
  };""",
)

new = new.replace(
  """        setBookings((prev) => {
          const next = prev.filter((b) => b.id !== id2);
          onCountChange?.(next.length);
          return next;
        });
      } else {
        const d = await r2.json().catch(() => ({}));
        setErr(d.error ?? "Error");
      }
    } catch {
      setErr("Connection error");
    } finally {
      setRestoringId(null);
    }
  };
  const permanentDelete = async () => {""",
  """        setBookings((prev) => {
          const next = prev.filter((b) => b.id !== id2);
          onCountChange?.(next.length);
          return next;
        });
        setSelectedIds((prev) => {
          if (!prev.has(id2)) return prev;
          const next = new Set(prev);
          next.delete(id2);
          return next;
        });
      } else {
        const d = await r2.json().catch(() => ({}));
        setErr(d.error ?? "Error");
      }
    } catch {
      setErr("Connection error");
    } finally {
      setRestoringId(null);
    }
  };
  const permanentDelete = async () => {""",
)

new = new.replace(
  """        setConfirmPerm(null);
      } else {
        const d = await r2.json().catch(() => ({}));
        setPermErr(d.error ?? "Error");
      }
    } catch {
      setPermErr("Connection error");
    } finally {
      setPermDeleting(false);
    }
  };
  const emptyTrash = async () => {""",
  """        setSelectedIds((prev) => {
          if (!prev.has(confirmPerm.id)) return prev;
          const next = new Set(prev);
          next.delete(confirmPerm.id);
          return next;
        });
        setConfirmPerm(null);
      } else {
        const d = await r2.json().catch(() => ({}));
        setPermErr(d.error ?? "Error");
      }
    } catch {
      setPermErr("Connection error");
    } finally {
      setPermDeleting(false);
    }
  };
  const permanentDeleteBulk = async () => {
    if (!confirmBulkPerm?.length || permDeleting) return;
    setPermDeleting(true);
    setPermErr(null);
    try {
      const r2 = await fetch(`${apiBase}/api/admin/permanent-delete-bulk`, {
        method: "POST",
        headers: adminAuthH({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ids: confirmBulkPerm })
      });
      if (r2.ok) {
        const deleted = new Set(confirmBulkPerm);
        setBookings((prev) => {
          const next = prev.filter((b) => !deleted.has(b.id));
          onCountChange?.(next.length);
          return next;
        });
        setSelectedIds(/* @__PURE__ */ new Set());
        setConfirmBulkPerm(null);
      } else {
        const d = await r2.json().catch(() => ({}));
        setPermErr(d.error ?? "Error");
      }
    } catch {
      setPermErr("Connection error");
    } finally {
      setPermDeleting(false);
    }
  };
  const emptyTrash = async () => {""",
)

new = new.replace(
  """      if (r2.ok) {
        setBookings([]);
        onCountChange?.(0);
        setConfirmEmpty(false);
      } else {
        const d = await r2.json().catch(() => ({}));
        setEmptyErr(d.error ?? "Error");
      }
    } catch {
      setEmptyErr("Connection error");
    } finally {
      setEmptying(false);
    }
  };
  const fmtDate2 = (d) => {""",
  """      if (r2.ok) {
        setBookings([]);
        setSelectedIds(/* @__PURE__ */ new Set());
        onCountChange?.(0);
        setConfirmEmpty(false);
      } else {
        const d = await r2.json().catch(() => ({}));
        setEmptyErr(d.error ?? "Error");
      }
    } catch {
      setEmptyErr("Connection error");
    } finally {
      setEmptying(false);
    }
  };
  const fmtDate2 = (d) => {""",
)

bulk_modal = """
    confirmBulkPerm && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-red-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-stone-800", children: t.trashBulkDeleteTitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-stone-600 mb-1 font-semibold", children: t.trashSelected(confirmBulkPerm.length) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-500 mb-4", children: t.trashBulkDeleteMsg(confirmBulkPerm.length) }),
      permErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mb-2", children: permErr }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => { setConfirmBulkPerm(null); setPermErr(null); }, disabled: permDeleting, className: "flex-1 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50", children: t.cancel }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: permanentDeleteBulk, disabled: permDeleting, className: "flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60", children: permDeleting ? t.trashDeleting : t.trashBulkDeleteYes })
      ] })
    ] }) }),
"""

new = new.replace(
  "    ] }) }),\n    confirmEmpty &&",
  "    ] }) }),\n" + bulk_modal + "    confirmEmpty &&",
)

toolbar = """
    bookings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap bg-white rounded-xl border border-stone-100 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs font-semibold text-stone-600 cursor-pointer select-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: allSelected, onChange: toggleSelectAll, className: "w-4 h-4 rounded border-stone-300" }),
        t.trashSelectAll,
        selectedIds.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-stone-400 font-normal", children: [" · ", t.trashSelected(selectedIds.size)] })
      ] }),
      selectedIds.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => { setConfirmBulkPerm([...selectedIds]); setPermErr(null); }, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }),
        t.trashBulkDeleteBtn(selectedIds.size)
      ] })
    ] }),
"""

new = new.replace(
  "    ] }),\n    err &&",
  "    ] }),\n" + toolbar + "    err &&",
)

new = new.replace(
  """    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: bookings.map((b) => {
      const col = STATUS_COLORS[b.status] ?? { bg: "#f3f4f6", text: "#374151" };
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-2xl shadow-sm border border-stone-100 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-stone-700 text-sm", children: b.name }),""",
  """    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: bookings.map((b) => {
      const col = STATUS_COLORS[b.status] ?? { bg: "#f3f4f6", text: "#374151" };
      const checked = selectedIds.has(b.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `bg-white rounded-2xl shadow-sm border p-4 ${checked ? "border-red-300 ring-1 ring-red-100" : "border-stone-100"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 flex-1 min-w-0 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked, onChange: () => toggleSelect(b.id), className: "w-4 h-4 mt-1 rounded border-stone-300 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-stone-700 text-sm", children: b.name }),""",
)

new = new.replace(
  """          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => restoreBooking(b.id),""",
  """          ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => restoreBooking(b.id),""",
)

if old not in text:
    raise SystemExit("Old TrashTab not found in bundle")
text = text.replace(old, new)

# AdminLang keys (ru + en blocks in bundle)
ru_insert = """    trashSelectAll: "Выбрать все",
    trashSelected: (n) => `${n} выбрано`,
    trashBulkDeleteBtn: (n) => `Удалить ${n} навсегда`,
    trashBulkDeleteTitle: "Удалить выбранные навсегда?",
    trashBulkDeleteMsg: (n) => `⚠️ ${n} заявок будут удалены из базы данных без возможности восстановления.`,
    trashBulkDeleteYes: "🗑️ Удалить навсегда",
"""
en_insert = """    trashSelectAll: "Select all",
    trashSelected: (n) => `${n} selected`,
    trashBulkDeleteBtn: (n) => `Delete ${n} permanently`,
    trashBulkDeleteTitle: "Delete selected permanently?",
    trashBulkDeleteMsg: (n) => `⚠️ ${n} booking${n === 1 ? "" : "s"} will be permanently removed from the database.`,
    trashBulkDeleteYes: "🗑️ Delete permanently",
"""

if "trashSelectAll:" not in text:
    text = text.replace(
        '    trashPermanentConfirmYes: "🗑️ Удалить навсегда",\n    trashRestoredToast:',
        '    trashPermanentConfirmYes: "🗑️ Удалить навсегда",\n' + ru_insert + '    trashRestoredToast:',
        1,
    )
    text = text.replace(
        '    trashPermanentConfirmYes: "🗑️ Delete permanently",\n    trashRestoredToast:',
        '    trashPermanentConfirmYes: "🗑️ Delete permanently",\n' + en_insert + '    trashRestoredToast:',
        1,
    )

bundle.write_text(text, encoding="utf-8", newline="\n")
html_text = html.read_text(encoding="utf-8")
html_text = re.sub(r"\?v=\d+", "?v=88", html_text)
html.write_text(html_text, encoding="utf-8", newline="\n")
print("patched bundle + v=88")
