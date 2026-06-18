function TrashTab({
  apiBase,
  adminAuthH,
  onCountChange
}) {
  const { t } = useAdminLang();
  const [bookings, setBookings] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [err, setErr] = reactExports.useState(null);
  const [restoringId, setRestoringId] = reactExports.useState(null);
  const [confirmPerm, setConfirmPerm] = reactExports.useState(null);
  const [permDeleting, setPermDeleting] = reactExports.useState(false);
  const [permErr, setPermErr] = reactExports.useState(null);
  const [confirmEmpty, setConfirmEmpty] = reactExports.useState(false);
  const [emptying, setEmptying] = reactExports.useState(false);
  const [emptyErr, setEmptyErr] = reactExports.useState(null);
  const load = reactExports.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r2 = await fetch(`${apiBase}/api/admin/trash`, {
        headers: adminAuthH(),
        cache: "no-store"
      });
      if (!r2.ok) {
        setErr(`Server error ${r2.status}`);
        return;
      }
      const d = await r2.json();
      const list = d.bookings ?? [];
      setBookings(list);
      onCountChange?.(list.length);
    } catch {
      setErr("Connection error");
    } finally {
      setLoading(false);
    }
  }, [apiBase, adminAuthH]);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  const restoreBooking = async (id2) => {
    setRestoringId(id2);
    try {
      const r2 = await fetch(`${apiBase}/api/admin/restore-from-trash`, {
        method: "POST",
        headers: adminAuthH({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: id2 })
      });
      if (r2.ok) {
        setBookings((prev) => {
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
  const permanentDelete = async () => {
    if (!confirmPerm || permDeleting) return;
    setPermDeleting(true);
    setPermErr(null);
    try {
      const r2 = await fetch(`${apiBase}/api/admin/permanent-delete`, {
        method: "POST",
        headers: adminAuthH({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: confirmPerm.id })
      });
      if (r2.ok) {
        setBookings((prev) => {
          const next = prev.filter((b) => b.id !== confirmPerm.id);
          onCountChange?.(next.length);
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
  const emptyTrash = async () => {
    if (emptying) return;
    setEmptying(true);
    setEmptyErr(null);
    try {
      const r2 = await fetch(`${apiBase}/api/admin/empty-trash`, {
        method: "POST",
        headers: adminAuthH({ "Content-Type": "application/json" })
      });
      if (r2.ok) {
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
  const fmtDate2 = (d) => {
    try {
      return new Date(d).toLocaleString(t.dateLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return d;
    }
  };
  const statusLabel2 = (s) => {
    if (s === "pending") return t.statusPending;
    if (s === "approved") return t.statusApproved;
    if (s === "completed") return t.statusCompleted;
    if (s === "cancelled") return t.statusCancelled;
    return s;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4 max-w-4xl mx-auto", children: [
    confirmPerm && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-red-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-stone-800", children: t.trashPermanentConfirmTitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-stone-600 mb-1 font-semibold", children: confirmPerm.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-500 mb-4", children: t.trashPermanentConfirmMsg }),
      permErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mb-2", children: permErr }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setConfirmPerm(null);
              setPermErr(null);
            },
            disabled: permDeleting,
            className: "flex-1 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50",
            children: t.cancel
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: permanentDelete,
            disabled: permDeleting,
            className: "flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60",
            children: permDeleting ? t.trashDeleting : t.trashPermanentConfirmYes
          }
        )
      ] })
    ] }) }),
    confirmEmpty && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-red-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-stone-800", children: t.trashEmptyConfirmTitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-500 font-semibold mb-4", children: t.trashEmptyConfirmMsg }),
      emptyErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mb-2", children: emptyErr }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setConfirmEmpty(false);
              setEmptyErr(null);
            },
            disabled: emptying,
            className: "flex-1 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50",
            children: t.cancel
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: emptyTrash,
            disabled: emptying,
            className: "flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60",
            children: emptying ? t.trashEmptying : t.trashEmptyConfirmYes
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
  