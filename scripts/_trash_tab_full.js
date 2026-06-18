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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-bold text-stone-800 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-5 h-5 text-stone-400" }),
          t.trashTitle,
          bookings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center min-w-[22px] h-5 rounded-full bg-red-100 text-red-600 text-[11px] font-bold px-1.5", children: bookings.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-stone-400 mt-0.5", children: t.trashNote })
      ] }),
      bookings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setConfirmEmpty(true),
          className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }),
            t.trashEmptyBtn
          ]
        }
      )
    ] }),
    err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700", children: err }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-stone-400 py-8 text-center", children: t.loading }) : bookings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-sm p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-10 h-10 text-stone-200 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-stone-400 text-sm", children: t.trashEmpty })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: bookings.map((b) => {
      const col = STATUS_COLORS[b.status] ?? { bg: "#f3f4f6", text: "#374151" };
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-2xl shadow-sm border border-stone-100 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-stone-700 text-sm", children: b.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold",
                style: { background: col.bg, color: col.text },
                children: statusLabel2(b.status)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-stone-500 mt-0.5", children: b.phone }),
          b.appliance && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-stone-400", children: b.appliance }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-stone-400", children: [
            b.preferred_date,
            " · ",
            b.preferred_time
          ] }),
          b.address && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-stone-400 truncate", children: b.address }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-stone-300 mt-1", children: [
            t.trashDeletedAt,
            " ",
            fmtDate2(b.deleted_at)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => restoreBooking(b.id),
              disabled: restoringId === b.id,
              className: "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition disabled:opacity-50",
              style: { borderColor: ACCENT$6, color: ACCENT$6 },
              title: t.trashRestoreBtn,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: `w-3.5 h-3.5 ${restoringId === b.id ? "animate-spin" : ""}` }),
                restoringId === b.id ? t.trashRestoring : t.trashRestoreBtn
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                setConfirmPerm(b);
                setPermErr(null);
              },
              disabled: restoringId === b.id,
              className: "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-50",
              title: t.trashPermanentBtn,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }),
                t.trashPermanentBtn
              ]
            }
          )
        ] })
      ] }) }, b.id);
    }) })
  ] });
}
const ACCENT$5 = "#1B6FE8";
const CATEGORIES = ["Labor", "Part", "Material"];
const CAT_COLOR = {
  Labor: "#1B6FE8",
  Part: "#16a34a",
  Material: "#d97706"
};
function Badge({ cat }) {
  const color2 = CAT_COLOR[cat] ?? "#64748b";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 20,
    background: `${color2}18`,
    color: color2,
    fontSize: 11,
    fontWeight: 700
  }, children: cat });
}
const EMPTY = { name: "", description: "", category: "Labor", unit_price: "", active: true };
function PricebookTab({ apiBase, adminAuthH }) {
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [filterCat, setFilterCat] = reactExports.useState("All");
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY);
  const [saving, setSaving] = reactExports.useState(false);
  const [err, setErr] = reactExports.useState("");
  const [deletingId, setDeletingId] = reactExports.useState(null);
  const load = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const r2 = await fetch(`${apiBase}/api/admin/pricebook`, { headers: adminAuthH() });
      const d = await r2.json();
      setItems(d.items ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [apiBase, adminAuthH]);
  reactExports.useEffect(() => {
    void load();
  }, [load]);
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setErr("");
    setShowForm(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      category: item.category,
      unit_price: String(item.unit_price),
      active: item.active
    });
    setErr("");
    setShowForm(true);
  };
  const save = async () => {
    if (!form.name.trim()) {
      setErr("Название обязательно");
      return;
    }
    const price = parseFloat(form.unit_price);
    if (isNaN(price) || price < 0) {
      setErr("Введите корректную цену");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category,
        unit_price: price,
        active: form.active
      };
      const url = editing ? `${apiBase}/api/admin/pricebook/${editing.id}` : `${apiBase}/api/admin/pricebook`;
      const method = editing ? "PUT" : "POST";
      const r2 = await fetch(url, {
        method,
        headers: { ...adminAuthH(), "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!r2.ok) throw new Error("Ошибка сохранения");
      setShowForm(false);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  };
  const del = async (id2) => {
    if (!confirm("Удалить позицию из прайс-листа?")) return;
    setDeletingId(id2);
    try {
      await fetch(`${apiBase}/api/admin/pricebook/${id2}`, {
        method: "DELETE",
        headers: adminAuthH()
      });
      await load();
    } finally {
      setDeletingId(null);
    }
  };
  const visible = items.filter((i) => filterCat === "All" || i.category === filterCat);
  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = visible.filter((i) => i.category === cat);
    return acc;
  }, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-bold text-slate-800 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-5 h-5 text-blue-600" }),
          "Прайс-лист услуг"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-400 mt-0.5", children: [
          items.length,
          " позиций · Работник выбирает из списка при создании эстимейта"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: openCreate,
          className: "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white",
          style: { background: ACCENT$5 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            " Добавить"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-4 overflow-x-auto pb-1", children: ["All", ...CATEGORIES].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setFilterCat(c),
        className: `flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${filterCat === c ? "border-blue-600 text-blue-600 bg-blue-50" : "border-stone-200 text-stone-500 bg-white hover:border-stone-300"}`,
        children: c === "All" ? "Все" : c
      },
      c
    )) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-16 text-slate-400 text-sm", children: "Загрузка..." }) : visible.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-slate-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-10 h-10 mx-auto mb-3 opacity-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Прайс-лист пустой. Добавьте первую позицию." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: CATEGORIES.map((cat) => {
      const grp = grouped[cat] ?? [];
      if (!grp.length) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { cat }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-slate-400", children: [
            grp.length,
            " поз."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: grp.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `flex items-center gap-3 p-3 rounded-xl border bg-white transition ${item.active ? "border-slate-100 hover:border-slate-200" : "border-dashed border-slate-200 opacity-50"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-slate-800 truncate", children: item.name }),
                  !item.active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full", children: "Выкл" })
                ] }),
                item.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400 mt-0.5 truncate", children: item.description })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-base text-slate-800", children: [
                  "$",
                  Number(item.unit_price).toFixed(2)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400", children: "за ед." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => openEdit(item),
                    className: "p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => void del(item.id),
                    disabled: deletingId === item.id,
                    className: "p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                  }
                )
              ] })
            ]
          },
          item.id
        )) })
      ] }, cat);
    }) }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", style: { background: "rgba(15,23,42,0.6)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-base text-slate-800", children: editing ? "Редактировать позицию" : "Новая позиция" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowForm(false), className: "p-1.5 rounded-full hover:bg-slate-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-slate-500" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-slate-500 mb-1.5", children: "Название *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: form.name,
              onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })),
              placeholder: "Диагностика, Замена термостата...",
              className: "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-slate-500 mb-1.5", children: "Описание" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: form.description,
              onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })),
              placeholder: "Краткое описание (необязательно)",
              className: "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-slate-500 mb-1.5", children: "Категория" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: form.category,
                onChange: (e) => setForm((f) => ({ ...f, category: e.target.value })),
                className: "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400",
                children: CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-slate-500 mb-1.5", children: "Цена ($)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                min: "0",
                value: form.unit_price,
                onChange: (e) => setForm((f) => ({ ...f, unit_price: e.target.value })),
                placeholder: "0.00",
                className: "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setForm((f) => ({ ...f, active: !f.active })),
              className: `w-10 h-6 rounded-full transition-colors ${form.active ? "bg-green-500" : "bg-slate-300"} flex items-center`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-4 h-4 rounded-full bg-white shadow mx-0.5 transition-transform ${form.active ? "translate-x-4" : ""}` })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-slate-600", children: "Активна (доступна работникам)" })
        ] }),
        err && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-500", children: err }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setShowForm(false),
              className: "flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50",
              children: "Отмена"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => void save(),
              disabled: saving,
              className: "flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5",
              style: { background: ACCENT$5, opacity: saving ? 0.7 : 1 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" }),
                saving ? "Сохраняем..." : "Сохранить"
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
const SITE_META = {
  appliance: {
    label: "Appliance",
    website: "htrgrouptx.com",
    accent: "#1B6FE8"
  },
  dental: {
    label: "Dental",
    website: "dentequmentfix.com",
    accent: "#6B7280"
  }
};
function VisitFeeSettings({ apiBase, adminAuthH, site }) {
  const meta = SITE_META[site];
  const settingsKey = site === "dental" ? "visit_fee_dental" : "visit_fee_appliance";
  const [visitFee, setVisitFee] = reactExports.useState("50");
  const [loading, setLoading] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [msg, setMsg] = reactExports.useState(null);
  const load = reactExports.useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      const pub = await fetch(`${apiBase}/api/settings/visit-fee?site=${site}`, { cache: "no-store" });
      const pd = await pub.json();
      if (pd.fee != null) {
        setVisitFee(pd.fee);
        return;
      }
      const r2 = await fetch(`${apiBase}/api/admin/settings`, { headers: adminAuthH() });
      const d = await r2.json();
      const fee = d.settings?.[settingsKey];
      if (d.ok && fee) setVisitFee(fee);
    } catch {
      setMsg({ ok: false, text: "Ошибка загрузки настроек" });
    } finally {
      setLoading(false);
    }
  }, [apiBase, adminAuthH, settingsKey, site]);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  const handleSave = async () => {
    const raw = visitFee.trim();
    const num = Number(raw);
    if (!raw || !Number.isFinite(num) || num < 0) {
      setMsg({ ok: false, text: "Введите корректную сумму (0 или больше)" });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const r2 = await fetch(`${apiBase}/api/settings/visit-fee`, {
        method: "POST",
        headers: { ...adminAuthH(), "Content-Type": "application/json" },
        body: JSON.stringify({ fee: String(Math.round(num)), site })
      });
      const d = await r2.json();
      if (!r2.ok || !d.ok) {
        setMsg({ ok: false, text: d.error ?? "Ошибка сохранения" });
      } else {
        setVisitFee(d.fee ?? raw);
        setMsg({ ok: true, text: `Сохранено! ${meta.label}: ${Number(d.fee ?? raw) === 0 ? "Free" : `$${d.fee}`}` });
      }
    } catch {
      setMsg({ ok: false, text: "Нет соединения с сервером" });
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border-2 shadow-sm p-5 space-y-4", style: { borderColor: meta.accent }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base font-bold text-stone-800 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "w-5 h-5", style: { color: meta.accent } }),
        meta.label,
        " — popup при входе на сайт"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: load,
          disabled: loading,
          className: "p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition",
          "aria-label": "Обновить",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-4 h-4 ${loading ? "animate-spin" : ""}` })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-stone-500 leading-relaxed", children: [
      "Цена диагностики во всплывающем окне на ",
      meta.website,
      " (EN/ES). 0 = «Free» / «Gratis». Не влияет на другой сайт."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: "Цена диагностики ($)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm", children: "$" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            inputMode: "numeric",
            pattern: "[0-9]*",
            value: visitFee,
            onChange: (e) => setVisitFee(e.target.value),
            placeholder: "50",
            className: "w-full border border-stone-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2",
            style: { "--tw-ring-color": meta.accent }
          }
        )
      ] })
    ] }),
    msg && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs font-medium ${msg.ok ? "text-green-600" : "text-red-500"}`, children: msg.text }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: handleSave,
        disabled: saving,
        className: "flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50",
        style: { backgroundColor: meta.accent },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
          saving ? "Сохранение…" : `Сохранить (${meta.label})`
        ]
      }
    )
  ] });
}
const ADMIN_SITE_CONFIG = {
  defaultBizFilter: "all",
  bookingBizFallback: "appliance",
  defaultGallerySite: "appliance",
  visitFeeSites: ["appliance", "dental"],
  accent: "#6B7280",
  pageBg: "#F3F4F6"
};
function resolveBookingBiz(businessType) {
  if (businessType === "dental") return "dental";
  if (businessType === "appliance") return "appliance";
  return "appliance";
}
const ACCENT$4 = ADMIN_SITE_CONFIG.accent;
const PAGE_BG = ADMIN_SITE_CONFIG.pageBg;
const TIME_SLOTS = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_S = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const API$2 = () => "https://htr-group-llc-appliance-repair.replit.app".replace(/\/$/, "");
function getInitialHoustonDate() {
  const houstonStr = (/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "America/Chicago" });
  const d = new Date(houstonStr);
  if (d.getHours() >= 17) d.setDate(d.getDate() + 1);
  return { month: d.getMonth() + 1, day: d.getDate(), year: d.getFullYear() };
}
function getNextBusinessDays(n) {
  const days = [];
  const d = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "America/Chicago" }));
  d.setDate(d.getDate() + 1);
  while (days.length < n) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push(`${MONTHS_S[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`);
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}
function AdminInput({ label, value, onChange, placeholder, type = "text" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2",
        style: { "--tw-ring-color": ACCENT$4 }
      }
    )
  ] });
}
function highlightText(text, query) {
  const q = query.trim();
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map(
    (part, i) => i % 2 === 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx("mark", { className: "bg-yellow-200 text-yellow-900 rounded-sm", children: part }, i) : part
  );
}
function ReceiptHistoryPanel({ rows, loading, error, t, filters, onFiltersChange, onExport, exporting }) {
  const actorLabel = (row) => {
    const type = (row.actor_type ?? "").toLowerCase();
    const base = type === "admin" ? t.receiptHistoryActorAdmin : type === "employee" ? t.receiptHistoryActorEmployee : type === "client" ? t.receiptHistoryActorClient : t.receiptHistoryActorUnknown;
    return row.actor_name ? `${base} · ${row.actor_name}` : base;
  };
  const hl = (text) => highlightText(text, filters.q ?? "");
  const updateFilter = (patch) => onFiltersChange({ ...filters, ...patch });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 pb-2 pt-1 text-[10px] text-stone-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-1.5 mb-2 pb-2 border-b border-stone-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-semibold text-stone-500 uppercase tracking-wide", children: t.receiptHistoryFilterFrom }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: filters.from,
            onChange: (e) => updateFilter({ from: e.target.value }),
            className: "border border-stone-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-semibold text-stone-500 uppercase tracking-wide", children: t.receiptHistoryFilterTo }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: filters.to,
            onChange: (e) => updateFilter({ to: e.target.value }),
            className: "border border-stone-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-semibold text-stone-500 uppercase tracking-wide", children: t.receiptHistoryFilterActor }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filters.actor,
            onChange: (e) => updateFilter({ actor: e.target.value }),
            className: "border border-stone-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: t.receiptHistoryFilterActorAll }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "admin", children: t.receiptHistoryActorAdmin }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "employee", children: t.receiptHistoryActorEmployee }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "client", children: t.receiptHistoryActorClient })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-semibold text-stone-500 uppercase tracking-wide", children: t.receiptHistoryFilterSearch }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "search",
            value: filters.q,
            onChange: (e) => updateFilter({ q: e.target.value }),
            placeholder: t.receiptHistoryFilterSearchPlaceholder,
            className: "border border-stone-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: onExport,
          disabled: exporting,
          className: "ml-auto px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[10px] font-semibold disabled:opacity-50",
          children: [
            "⬇ ",
            t.receiptHistoryExportCsv
          ]
        }
      )
    ] }),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-stone-500 italic", children: t.receiptHistoryLoading }),
    error && !loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-600", children: error }),
    !loading && !error && rows && rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-stone-400 italic", children: t.receiptHistoryEmpty }),
    !loading && !error && rows && rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `border-l-2 pl-2 ${row.suspicious ? "border-red-400 bg-red-50/50" : "border-stone-200"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-stone-700 flex items-center gap-2", children: [
          hl(actorLabel(row)),
          row.suspicious && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: "inline-flex items-center rounded-full bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 text-xs font-semibold",
              title: row.suspicious_reason ?? void 0,
              children: [
                "⚠ ",
                t.receiptHistorySuspicious
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-stone-500", children: new Date(row.downloaded_at).toLocaleString(t.dateLocale, { dateStyle: "short", timeStyle: "short", timeZone: "America/Chicago" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-stone-500 flex items-center gap-2 flex-wrap", children: [
        row.lang && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "uppercase", children: [
          t.receiptHistoryLang,
          ": ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: row.lang })
        ] }),
        row.ip_address && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          t.receiptHistoryIp,
          ": ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: hl(row.ip_address) })
        ] }),
        row.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          t.receiptHistoryLocation,
          ": ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: row.location })
        ] })
      ] }),
      row.user_agent && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-stone-400 truncate", title: row.user_agent, children: [
        t.receiptHistoryUserAgent,
        ": ",
        hl(row.user_agent)
      ] })
    ] }, row.id)) })
  ] });
}
function AdminDashboard() {
  const { lang, setLang, t } = useAdminLang();
  const { toast: toast2 } = useToast();
  const [pin, setPin] = reactExports.useState("");
  const [adminBearer, setBearer] = reactExports.useState(null);
  const [authed, setAuthed] = reactExports.useState(false);
  const [fidLabel, setFidLabel] = reactExports.useState(null);
  const [adminTab, setAdminTab] = reactExports.useState("bookings");
  const [trashCount, setTrashCount] = reactExports.useState(0);
  const [employees, setEmployees] = reactExports.useState([]);
  const [empFilter, setEmpFilter] = reactExports.useState("");
  const [callbackLoading, setCallbackLoading] = reactExports.useState(/* @__PURE__ */ new Set());
  const [genderPickerId, setGenderPickerId] = reactExports.useState(null);
  const handleCallback = reactExports.useCallback(async (phone, bookingId, clientName, clientLanguage, clientGender = "male") => {
    if (callbackLoading.has(bookingId)) return;
    setCallbackLoading((prev) => new Set(prev).add(bookingId));
    try {
      const authToken = localStorage.getItem("adminAuthToken") ?? "";
      const res = await fetch(`${API$2()}/api/admin/voice/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": authToken },
        body: JSON.stringify({ client_phone: phone, client_name: clientName ?? "", client_language: clientLanguage ?? "en", client_gender: clientGender })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      toast2({
        title: "📞 Ваш телефон сейчас зазвонит!",
        description: "Ответьте на звонок с номера (606) 660-6067 — система автоматически соединит вас с клиентом. Клиент увидит только (606), ваш номер скрыт.",
        duration: 14e3
      });
    } catch (err) {
      toast2({
        title: "Ошибка обратного звонка",
        description: err instanceof Error ? err.message : "Не удалось инициировать звонок",
        variant: "destructive",
        duration: 5e3
      });
    } finally {
      setCallbackLoading((prev) => {
        const s = new Set(prev);
        s.delete(bookingId);
        return s;
      });
    }
  }, [callbackLoading, toast2]);
  const [reviewLoading, setReviewLoading] = reactExports.useState(/* @__PURE__ */ new Set());
  const [adminEstimateTarget, setAdminEstimateTarget] = reactExports.useState(null);
  const [adminEstimateItems, setAdminEstimateItems] = reactExports.useState([]);
  const [adminEstimateNotes, setAdminEstimateNotes] = reactExports.useState("");
  const [adminEstimateNoTax, setAdminEstimateNoTax] = reactExports.useState(false);
  const [adminEstimateNotify, setAdminEstimateNotify] = reactExports.useState("email");
  const [adminEstimateSending, setAdminEstimateSending] = reactExports.useState(false);
  const [adminEstimateErr, setAdminEstimateErr] = reactExports.useState("");
  const [adminEstimateDone, setAdminEstimateDone] = reactExports.useState(false);
  const [adminEstimateHistory, setAdminEstimateHistory] = reactExports.useState({});
  const [adminEstimateIsEdit, setAdminEstimateIsEdit] = reactExports.useState(false);
  const handleSendReview = reactExports.useCallback(async (bookingId) => {
    if (reviewLoading.has(bookingId)) return;
    setReviewLoading((prev) => new Set(prev).add(bookingId));
    try {
      const authToken = localStorage.getItem("adminAuthToken") ?? "";
      const res = await fetch(`${API$2()}/api/admin/bookings/${bookingId}/send-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": authToken }
      });
      const d = await res.json().catch(() => ({}));
      if (d.ok) {
        toast2({ title: "✅ Ссылка на отзыв отправлена клиенту по SMS" });
      } else {
        toast2({ title: `Ошибка: ${d.error ?? res.status}`, variant: "destructive" });
      }
    } catch {
      toast2({ title: "Ошибка сети", variant: "destructive" });
    } finally {
      setReviewLoading((prev) => {
        const s = new Set(prev);
        s.delete(bookingId);
        return s;
      });
    }
  }, [reviewLoading, toast2]);
  const adminAuthH = reactExports.useCallback((extra) => {
    const base = extra ?? {};
    if (pin) return { ...base, "x-admin-pin": encodeURIComponent(pin) };
    if (adminBearer) return { ...base, "Authorization": `Bearer ${adminBearer}` };
    return base;
  }, [pin, adminBearer]);
  const loadAdminLastEstimate = reactExports.useCallback(async (bookingId) => {
    try {
      const r2 = await fetch(`${API$2()}/api/admin/bookings/${bookingId}/estimates`, { headers: adminAuthH(), cache: "no-store" });
      if (!r2.ok) return;
      const d = await r2.json();
      setAdminEstimateHistory((prev) => ({ ...prev, [bookingId]: d.estimates?.[0] ?? null }));
    } catch {
    }
  }, [adminAuthH]);
  const openAdminEstimate = (b, prev) => {
    setAdminEstimateTarget(b);
    setAdminEstimateIsEdit(!!prev);
    if (prev && prev.items.length > 0) {
      setAdminEstimateItems(prev.items);
      setAdminEstimateNotes(prev.notes ?? "");
      setAdminEstimateNoTax(prev.no_tax);
    } else {
      setAdminEstimateItems([{ description: "", category: "Labor", qty: 1, unit_price: "" }]);
      setAdminEstimateNotes("");
      setAdminEstimateNoTax(false);
    }
    const hasEmail = !!b.email?.trim();
    const hasPhone = !!b.phone?.trim();
    setAdminEstimateNotify(hasEmail && hasPhone ? "both" : hasEmail ? "email" : "sms");
    setAdminEstimateErr("");
    setAdminEstimateDone(false);
  };
  const handleAdminEstimate = reactExports.useCallback(async () => {
    if (!adminEstimateTarget) return;
    const validItems = adminEstimateItems.filter((i) => i.description.trim()).map((i) => ({ description: i.description.trim(), category: i.category, qty: Math.max(1, i.qty), unit_price: parseFloat(String(i.unit_price).replace(",", ".")) || 0 })).filter((i) => i.unit_price >= 0);
    if (!validItems.length) {
      setAdminEstimateErr(t.estimateItems + " — требуется хотя бы одна позиция");
      return;
    }
    setAdminEstimateSending(true);
    setAdminEstimateErr("");
    try {
      const res = await fetch(`${API$2()}/api/admin/bookings/${adminEstimateTarget.id}/estimate`, {
        method: "POST",
        headers: { ...adminAuthH(), "Content-Type": "application/json" },
        body: JSON.stringify({ items: validItems, notes: adminEstimateNotes.trim() || null, no_tax: adminEstimateNoTax, notify_via: adminEstimateNotify })
      });
      const d = await res.json().catch(() => ({}));
      if (d.ok) {
        setAdminEstimateDone(true);
        toast2({ title: `✅ ${t.estimateSuccess} ($${(d.total ?? 0).toFixed(2)})` });
        if (adminEstimateTarget) void loadAdminLastEstimate(adminEstimateTarget.id);
        setTimeout(() => setAdminEstimateTarget(null), 1800);
      } else {
        setAdminEstimateErr(d.error ?? t.estimateErr);
      }
    } catch {
      setAdminEstimateErr(t.estimateErr);
    } finally {
      setAdminEstimateSending(false);
    }
  }, [adminEstimateTarget, adminEstimateItems, adminEstimateNotes, adminEstimateNoTax, adminEstimateNotify, t, toast2, adminAuthH, loadAdminLastEstimate]);
  reactExports.useEffect(() => {
    const manifest = document.getElementById("pwa-manifest");
    const touchIcon = document.getElementById("pwa-touch-icon");
    const appTitle = document.getElementById("pwa-app-title");
    const theme = document.getElementById("pwa-theme");
    const prevManifest = manifest?.getAttribute("href") ?? "";
    const prevIcon = touchIcon?.getAttribute("href") ?? "";
    const prevAppTitle = appTitle?.getAttribute("content") ?? "";
    const prevTheme = theme?.getAttribute("content") ?? "";
    const prevTitle = document.title;
    manifest?.setAttribute("href", "/admin-manifest.json");
    touchIcon?.setAttribute("href", "/htr-admin-icon.png");
    appTitle?.setAttribute("content", "HTR Admin");
    theme?.setAttribute("content", "#0f172a");
    document.title = "✦ HTR ADMIN ✦";
    return () => {
      manifest?.setAttribute("href", prevManifest);
      touchIcon?.setAttribute("href", prevIcon === "/apple-touch-icon.png?v=3" ? "/icon-192.png?v=3" : prevIcon);
      appTitle?.setAttribute("content", prevAppTitle);
      theme?.setAttribute("content", prevTheme);
      document.title = prevTitle;
    };
  }, []);
  reactExports.useEffect(() => {
    if (sessionStorage.getItem("adminFidJustRegistered")) {
      sessionStorage.removeItem("adminFidJustRegistered");
      toast2({ title: t.fidRegisteredToast, description: t.fidDeviceAddedToast, duration: 3e3 });
    }
  }, [toast2]);
  reactExports.useEffect(() => {
    try {
      const authToken = sessionStorage.getItem("adminAuthToken") ?? localStorage.getItem("adminAuthToken");
      const authPin = sessionStorage.getItem("adminPin") ?? localStorage.getItem("adminPin");
      if (authToken && authPin) {
        setPin(authPin);
        setAuthed(true);
        return;
      }
      if (authToken) {
        setBearer(authToken);
        const sessionLabel = sessionStorage.getItem("adminFidLabel");
        if (sessionLabel) {
          setFidLabel(sessionLabel);
        } else {
          const credId = localStorage.getItem("htr_fid_cred_id");
          if (credId) {
            const persistedLabel = localStorage.getItem(`htr_fid_label_${credId}`);
            if (persistedLabel) setFidLabel(persistedLabel);
          }
        }
        setAuthed(true);
        return;
      }
      localStorage.removeItem("admin_session");
    } catch {
    }
  }, []);
  const initDate = getInitialHoustonDate();
  const [month, setMonth] = reactExports.useState(initDate.month);
  const [day, setDay] = reactExports.useState(initDate.day);
  const [year, setYear] = reactExports.useState(initDate.year);
  const checkedAdvance = reactExports.useRef(/* @__PURE__ */ new Set());
  const [bookedDetails, setBookedDetails] = reactExports.useState([]);
  const [blockedSlots, setBlockedSlots] = reactExports.useState([]);
  const [bufferSlots, setBufferSlots] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [allBookings, setAllBookings] = reactExports.useState([]);
  const [apiError, setApiError] = reactExports.useState(null);
  const [reason, setReason] = reactExports.useState("");
  const [actionSlot, setActionSlot] = reactExports.useState(null);
  const [mobileTab, setMobileTab] = reactExports.useState("slots");
  const [showCompleted, setShowCompleted] = reactExports.useState(true);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [bizFilter, setBizFilter] = reactExports.useState(ADMIN_SITE_CONFIG.defaultBizFilter);
  const [confirmCancel, setConfirmCancel] = reactExports.useState(null);
  const [confirmComplete, setConfirmComplete] = reactExports.useState(null);
  const [completePay, setCompletePay] = reactExports.useState({ method: "", amount: "", status: "" });
  const [confirmDelete, setConfirmDelete] = reactExports.useState(null);
  const [isDeleting, setIsDeleting] = reactExports.useState(false);
  const [deleteError, setDeleteError] = reactExports.useState(null);
  const [highlightBookingId, setHighlightBookingId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!highlightBookingId) return;
    const candidates = [
      document.getElementById(`booking-row-m-${highlightBookingId}`),
      document.getElementById(`booking-row-d-${highlightBookingId}`)
    ];
    const visible = candidates.find((el) => el && el.offsetParent !== null);
    (visible ?? candidates[0] ?? candidates[1])?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(() => setHighlightBookingId(null), 3e3);
    return () => clearTimeout(timer);
  }, [highlightBookingId]);
  const [selectedIds, setSelectedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = reactExports.useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = reactExports.useState(false);
  const [bulkDeleteError, setBulkDeleteError] = reactExports.useState(null);
  const [faceIdCredentials, setFaceIdCredentials] = reactExports.useState([]);
  const [loadingCredentials, setLoadingCredentials] = reactExports.useState(false);
  const [credentialsError, setCredentialsError] = reactExports.useState(null);
  const [removingCredentialId, setRemovingCredentialId] = reactExports.useState(null);
  const [confirmRemoveCredential, setConfirmRemoveCredential] = reactExports.useState(null);
  const [removeCredentialError, setRemoveCredentialError] = reactExports.useState(null);
  const [renamingCredentialId, setRenamingCredentialId] = reactExports.useState(null);
  const [renameLabel, setRenameLabel] = reactExports.useState("");
  const [renameSaving, setRenameSaving] = reactExports.useState(false);
  const [renameError, setRenameError] = reactExports.useState(null);
  const [renamedCredentialId, setRenamedCredentialId] = reactExports.useState(null);
  const renameSuccessTimerRef = reactExports.useRef(null);
  const [confirmRestore, setConfirmRestore] = reactExports.useState(null);
  const [restoreEditOpen, setRestoreEditOpen] = reactExports.useState(false);
  const [reeName, setReeName] = reactExports.useState("");
  const [reePhone, setReePhone] = reactExports.useState("");
  const [reeEmail, setReeEmail] = reactExports.useState("");
  const [reeAddr, setReeAddr] = reactExports.useState("");
  const [reeAppl, setReeAppl] = reactExports.useState("");
  const [reeMsg, setReeMsg] = reactExports.useState("");
  const [reeDate, setReeDate] = reactExports.useState("");
  const [reeTime, setReeTime] = reactExports.useState(TIME_SLOTS[0]);
  const [conflictInfo, setConflictInfo] = reactExports.useState(null);
  const [rescheduleDate, setRescheduleDate] = reactExports.useState("");
  const [rescheduleTime, setRescheduleTime] = reactExports.useState(TIME_SLOTS[0]);
  const [isRestoring, setIsRestoring] = reactExports.useState(false);
  const [restoreError, setRestoreError] = reactExports.useState(null);
  const [confirmReschedule, setConfirmReschedule] = reactExports.useState(null);
  const [rsDate, setRsDate] = reactExports.useState("");
  const [rsTime, setRsTime] = reactExports.useState(TIME_SLOTS[0]);
  const [isRescheduling, setIsRescheduling] = reactExports.useState(false);
  const [rsError, setRsError] = reactExports.useState(null);
  const [rsConflict, setRsConflict] = reactExports.useState(null);
  const [stripeModal, setStripeModal] = reactExports.useState(null);
  const [stripeLoading, setStripeLoading] = reactExports.useState(false);
  const [stripeLink, setStripeLink] = reactExports.useState(null);
  const [stripeErr, setStripeErr] = reactExports.useState(null);
  const [stripeCopied, setStripeCopied] = reactExports.useState(false);
  const [resendingId, setResendingId] = reactExports.useState(null);
  const [resendSentId, setResendSentId] = reactExports.useState(null);
  const [adminPhotosOpen, setAdminPhotosOpen] = reactExports.useState(/* @__PURE__ */ new Set());
  const [adminPhotosData, setAdminPhotosData] = reactExports.useState({});
  const [adminPhotosLoading, setAdminPhotosLoading] = reactExports.useState(/* @__PURE__ */ new Set());
  const [adminSigData, setAdminSigData] = reactExports.useState({});
  const [adminSigLoading, setAdminSigLoading] = reactExports.useState(/* @__PURE__ */ new Set());
  const [downloadingReceiptId, setDownloadingReceiptId] = reactExports.useState(null);
  const [resendingReceiptId, setResendingReceiptId] = reactExports.useState(null);
  const [resendReceiptSentId, setResendReceiptSentId] = reactExports.useState(null);
  const generatePaymentLink = async () => {
    if (!stripeModal) return;
    setStripeLoading(true);
    setStripeErr(null);
    setStripeLink(null);
    try {
      const r2 = await fetch(`${API$2()}/api/admin/bookings/${stripeModal.id}/payment-link`, {
        method: "POST",
        headers: { ...adminAuthH(), "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(stripeModal.amount) || 0 })
      });
      const d = await r2.json();
      if (!r2.ok || !d.ok) {
        if (d.stripe_configured === false) {
          setStripeErr(t.stripeNoKey);
        } else {
          setStripeErr(d.error ?? "Error");
        }
        return;
      }
      setStripeLink(d.url ?? null);
    } catch {
      setStripeErr("Connection error");
    } finally {
      setStripeLoading(false);
    }
  };
  const copyStripeLink = async () => {
    if (!stripeLink) return;
    await navigator.clipboard.writeText(stripeLink);
    setStripeCopied(true);
    setTimeout(() => setStripeCopied(false), 2e3);
  };
  const [manualSlot, setManualSlot] = reactExports.useState(null);
  const [mName, setMName] = reactExports.useState("");
  const [mPhone, setMPhone] = reactExports.useState("");
  const [mEmail, setMEmail] = reactExports.useState("");
  const [mAppl, setMAppl] = reactExports.useState("");
  const [mNote, setMNote] = reactExports.useState("");
  const [mAddr, setMAddr] = reactExports.useState("");
  const [mZip, setMZip] = reactExports.useState("");
  const [mError, setMError] = reactExports.useState("");
  const [mSaving, setMSaving] = reactExports.useState(false);
  const [editTarget, setEditTarget] = reactExports.useState(null);
  const [eName, setEName] = reactExports.useState("");
  const [ePhone, setEPhone] = reactExports.useState("");
  const [eEmail, setEEmail] = reactExports.useState("");
  const [eAddr, setEAddr] = reactExports.useState("");
  const [eAppl, setEAppl] = reactExports.useState("");
  const [eDate, setEDate] = reactExports.useState("");
  const [eTime, setETime] = reactExports.useState("");
  const [eNote, setENote] = reactExports.useState("");
  const [eError, setEError] = reactExports.useState("");
  const [eSaving, setESaving] = reactExports.useState(false);
  const dateStr = `${MONTHS_S[month - 1]} ${day}, ${year}`;
  const headers = adminAuthH({ "Content-Type": "application/json" });
  const resendPaymentLink = reactExports.useCallback(async (bookingId) => {
    setResendingId(bookingId);
    setResendSentId(null);
    try {
      const r2 = await fetch(`${API$2()}/api/admin/bookings/${bookingId}/resend-payment`, {
        method: "POST",
        headers: adminAuthH()
      });
      if (r2.ok) {
        setResendSentId(bookingId);
        setTimeout(() => setResendSentId(null), 3e3);
      }
    } catch {
    } finally {
      setResendingId(null);
    }
  }, [adminAuthH]);
  const [receiptHistory, setReceiptHistory] = reactExports.useState({});
  const [receiptHistoryOpen, setReceiptHistoryOpen] = reactExports.useState(/* @__PURE__ */ new Set());
  const [receiptHistoryLoading, setReceiptHistoryLoading] = reactExports.useState(/* @__PURE__ */ new Set());
  const [receiptHistoryError, setReceiptHistoryError] = reactExports.useState({});
  const [receiptHistoryFilters, setReceiptHistoryFilters] = reactExports.useState({});
  const [receiptHistoryExporting, setReceiptHistoryExporting] = reactExports.useState(/* @__PURE__ */ new Set());
  const [bookingCallsOpen, setBookingCallsOpen] = reactExports.useState(/* @__PURE__ */ new Set());
  const [bookingCallsData, setBookingCallsData] = reactExports.useState({});
  const [bookingCallsLoading, setBookingCallsLoading] = reactExports.useState(/* @__PURE__ */ new Set());
  const [bookingCallTranscript, setBookingCallTranscript] = reactExports.useState(null);
  const [bookingCallTranscriptLoading, setBookingCallTranscriptLoading] = reactExports.useState(false);
  const loadBookingCalls = reactExports.useCallback(async (bookingId) => {
    setBookingCallsLoading((prev) => {
      const n = new Set(prev);
      n.add(bookingId);
      return n;
    });
    try {
      const r2 = await fetch(`${API$2()}/api/admin/call-logs?booking_id=${encodeURIComponent(bookingId)}&limit=50`, {
        headers: adminAuthH(),
        cache: "no-store"
      });
      if (!r2.ok) throw new Error(String(r2.status));
      const d = await r2.json();
      setBookingCallsData((prev) => ({ ...prev, [bookingId]: d.logs ?? [] }));
    } catch {
      setBookingCallsData((prev) => ({ ...prev, [bookingId]: [] }));
    } finally {
      setBookingCallsLoading((prev) => {
        const n = new Set(prev);
        n.delete(bookingId);
        return n;
      });
    }
  }, [adminAuthH]);
  const toggleBookingCalls = reactExports.useCallback((bookingId) => {
    setBookingCallsOpen((prev) => {
      const n = new Set(prev);
      if (n.has(bookingId)) {
        n.delete(bookingId);
      } else {
        n.add(bookingId);
        void loadBookingCalls(bookingId);
      }
      return n;
    });
  }, [loadBookingCalls]);
  const openBookingCallTranscript = reactExports.useCallback(async (row) => {
    setBookingCallTranscriptLoading(true);
    setBookingCallTranscript(null);
    try {
      const r2 = await fetch(`${API$2()}/api/admin/call-logs/${row.id}`, { headers: adminAuthH() });
      const d = await r2.json();
      setBookingCallTranscript({
        id: row.id,
        phone: row.caller_phone,
        client_name: row.client_name,
        transcript: r2.ok && d.ok && d.log?.transcript ? d.log.transcript : ""
      });
    } catch {
      setBookingCallTranscript({ id: row.id, phone: row.caller_phone, client_name: row.client_name, transcript: "" });
    } finally {
      setBookingCallTranscriptLoading(false);
    }
  }, [adminAuthH]);
  const getReceiptHistoryFilters = reactExports.useCallback((bookingId) => {
    return receiptHistoryFilters[bookingId] ?? { from: "", to: "", actor: "", q: "" };
  }, [receiptHistoryFilters]);
  const buildReceiptHistoryQuery = (filters) => {
    const qs = new URLSearchParams();
    if (filters.from) qs.set("from", (/* @__PURE__ */ new Date(`${filters.from}T00:00:00`)).toISOString());
    if (filters.to) qs.set("to", (/* @__PURE__ */ new Date(`${filters.to}T23:59:59.999`)).toISOString());
    if (filters.actor) qs.set("actor", filters.actor);
    if (filters.q && filters.q.trim()) qs.set("q", filters.q.trim());
    return qs.toString();
  };
  const loadReceiptHistory = reactExports.useCallback(async (bookingId, filters) => {
    setReceiptHistoryLoading((prev) => {
      const n = new Set(prev);
      n.add(bookingId);
      return n;
    });
    setReceiptHistoryError((prev) => {
      if (!(bookingId in prev)) return prev;
      const n = { ...prev };
      delete n[bookingId];
      return n;
    });
    try {
      const qs = buildReceiptHistoryQuery(filters);
      const url = `${API$2()}/api/admin/bookings/${bookingId}/receipt-downloads${qs ? `?${qs}` : ""}`;
      const r2 = await fetch(url, { headers: adminAuthH(), cache: "no-store" });
      if (!r2.ok) throw new Error(String(r2.status));
      const d = await r2.json();
      setReceiptHistory((prev) => ({ ...prev, [bookingId]: d.downloads ?? [] }));
    } catch {
      setReceiptHistoryError((prev) => ({ ...prev, [bookingId]: t.receiptHistoryError }));
    } finally {
      setReceiptHistoryLoading((prev) => {
        const n = new Set(prev);
        n.delete(bookingId);
        return n;
      });
    }
  }, [adminAuthH, t.receiptHistoryError]);
  const toggleReceiptHistory = reactExports.useCallback((bookingId) => {
    setReceiptHistoryOpen((prev) => {
      const n = new Set(prev);
      if (n.has(bookingId)) {
        n.delete(bookingId);
      } else {
        n.add(bookingId);
        void loadReceiptHistory(bookingId, getReceiptHistoryFilters(bookingId));
      }
      return n;
    });
  }, [loadReceiptHistory, getReceiptHistoryFilters]);
  const updateReceiptHistoryFilters = reactExports.useCallback((bookingId, next) => {
    setReceiptHistoryFilters((prev) => ({ ...prev, [bookingId]: next }));
    void loadReceiptHistory(bookingId, next);
  }, [loadReceiptHistory]);
  const exportReceiptHistory = reactExports.useCallback(async (bookingId) => {
    setReceiptHistoryExporting((prev) => {
      const n = new Set(prev);
      n.add(bookingId);
      return n;
    });
    try {
      const filters = getReceiptHistoryFilters(bookingId);
      const qs = buildReceiptHistoryQuery(filters);
      const sep = qs ? "&" : "";
      const url = `${API$2()}/api/admin/bookings/${bookingId}/receipt-downloads?${qs}${sep}format=csv`;
      const r2 = await fetch(url, { headers: adminAuthH(), cache: "no-store" });
      if (!r2.ok) throw new Error(String(r2.status));
      const blob = await r2.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `receipt-downloads-${bookingId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setReceiptHistoryError((prev) => ({ ...prev, [bookingId]: t.receiptHistoryExportError }));
    } finally {
      setReceiptHistoryExporting((prev) => {
        const n = new Set(prev);
        n.delete(bookingId);
        return n;
      });
    }
  }, [adminAuthH, getReceiptHistoryFilters, t.receiptHistoryExportError]);
  const toggleAdminPhotos = reactExports.useCallback((bookingId) => {
    setAdminPhotosOpen((prev) => {
      const n = new Set(prev);
      if (n.has(bookingId)) {
        n.delete(bookingId);
      } else {
        n.add(bookingId);
        if (!adminPhotosData[bookingId]) {
          setAdminPhotosLoading((p) => {
            const s = new Set(p);
            s.add(bookingId);
            return s;
          });
          setAdminSigLoading((p) => {
            const s = new Set(p);
            s.add(bookingId);
            return s;
          });
          void Promise.all([
            fetch(`${API$2()}/api/admin/bookings/${bookingId}/photos`, { headers: adminAuthH(), cache: "no-store" }).then((r2) => r2.json()).then((d) => {
              setAdminPhotosData((prev2) => ({ ...prev2, [bookingId]: d.photos ?? [] }));
              setAdminPhotosLoading((p) => {
                const s = new Set(p);
                s.delete(bookingId);
                return s;
              });
            }).catch(() => setAdminPhotosLoading((p) => {
              const s = new Set(p);
              s.delete(bookingId);
              return s;
            })),
            fetch(`${API$2()}/api/admin/bookings/${bookingId}/signature`, { headers: adminAuthH(), cache: "no-store" }).then((r2) => r2.json()).then((d) => {
              setAdminSigData((prev2) => ({ ...prev2, [bookingId]: d.signature ?? null }));
              setAdminSigLoading((p) => {
                const s = new Set(p);
                s.delete(bookingId);
                return s;
              });
            }).catch(() => setAdminSigLoading((p) => {
              const s = new Set(p);
              s.delete(bookingId);
              return s;
            }))
          ]);
        }
      }
      return n;
    });
  }, [adminAuthH, adminPhotosData]);
  const downloadReceipt = reactExports.useCallback(async (b) => {
    if (downloadingReceiptId) return;
    setDownloadingReceiptId(b.id);
    try {
      const langOverride = b.payment_language === "es" || b.client_lang === "es" ? "es" : b.payment_language === "en" || b.client_lang === "en" ? "en" : null;
      const url = `${API$2()}/api/admin/bookings/${b.id}/invoice-html` + (langOverride ? `?lang=${langOverride}` : "");
      await downloadReceiptPdf({
        url,
        headers: adminAuthH(),
        filenameBase: `receipt-${b.id}`
      });
      void loadReceiptHistory(b.id, getReceiptHistoryFilters(b.id));
      setReceiptHistoryOpen((prev) => {
        if (prev.has(b.id)) return prev;
        const n = new Set(prev);
        n.add(b.id);
        return n;
      });
    } catch {
      window.alert(t.downloadReceiptError);
    } finally {
      setDownloadingReceiptId(null);
    }
  }, [adminAuthH, downloadingReceiptId, loadReceiptHistory, getReceiptHistoryFilters, t.downloadReceiptError]);
  const resendReceipt = reactExports.useCallback(async (b) => {
    if (resendingReceiptId) return;
    setResendingReceiptId(b.id);
    setResendReceiptSentId(null);
    try {
      const langOverride = b.payment_language === "es" || b.client_lang === "es" ? "es" : b.payment_language === "en" || b.client_lang === "en" ? "en" : null;
      const r2 = await fetch(`${API$2()}/api/admin/bookings/${b.id}/resend-receipt`, {
        method: "POST",
        headers: adminAuthH({ "Content-Type": "application/json" }),
        body: JSON.stringify(langOverride ? { lang: langOverride } : {})
      });
      if (!r2.ok) throw new Error("resend-failed");
      setResendReceiptSentId(b.id);
      setTimeout(() => setResendReceiptSentId(null), 3e3);
    } catch {
      window.alert(t.resendReceiptError);
    } finally {
      setResendingReceiptId(null);
    }
  }, [adminAuthH, resendingReceiptId, t.resendReceiptError]);
  const fetchSlots = reactExports.useCallback(async () => {
    try {
      const r2 = await fetch(
        `${API$2()}/api/availability?date=${encodeURIComponent(dateStr)}&_t=${Date.now()}`,
        { cache: "no-store" }
      );
      const d = await r2.json();
      setBookedDetails(d.bookedDetails ?? []);
      setBlockedSlots(d.blockedSlots ?? []);
      setBufferSlots(d.bufferSlots ?? []);
    } catch {
    }
  }, [dateStr]);
  const loadSlots = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      await fetchSlots();
    } finally {
      setLoading(false);
    }
  }, [fetchSlots]);
  const loadSchedule = reactExports.useCallback(async () => {
    try {
      await fetch(`${API$2()}/api/admin/hs-sync`, {
        method: "POST",
        headers: adminAuthH()
      }).catch(() => {
      });
      const from = "2020-01-01";
      const to = "2099-12-31";
      const r2 = await fetch(`${API$2()}/api/admin/schedule?from=${from}&to=${to}&_t=${Date.now()}`, { headers: adminAuthH(), cache: "no-store" });
      if (!r2.ok) {
        setApiError(`${t.errScheduleStatus}${r2.status}. ${t.errCheckPin}`);
        return;
      }
      const text = await r2.text();
      let d;
      try {
        d = JSON.parse(text);
      } catch {
        setApiError(t.errScheduleInvalid);
        return;
      }
      setApiError(null);
      setAllBookings(d.bookings ?? []);
      const nonCompleted = (d.bookings ?? []).filter((b) => b.status !== "completed");
      void Promise.all(nonCompleted.map((b) => loadAdminLastEstimate(b.id)));
    } catch (e) {
      setApiError(`${t.errConnectionPrefix}${e instanceof Error ? e.message : String(e)}`);
    }
  }, [adminAuthH, loadAdminLastEstimate]);
  const loadCredentials = reactExports.useCallback(async () => {
    setLoadingCredentials(true);
    setCredentialsError(null);
    try {
      const r2 = await fetch(`${API$2()}/api/auth/webauthn/credentials`, {
        headers: adminAuthH(),
        cache: "no-store"
      });
      if (!r2.ok) {
        const body = await r2.json().catch(() => ({}));
        setCredentialsError(body?.error ?? `Failed to load devices (${r2.status})`);
        return;
      }
      const data = await r2.json();
      setFaceIdCredentials(data.credentials ?? []);
    } catch {
      setCredentialsError(t.errNetwork);
    } finally {
      setLoadingCredentials(false);
    }
  }, [adminAuthH]);
  const loadEmployees = reactExports.useCallback(async () => {
    try {
      const r2 = await fetch(`${API$2()}/api/admin/employees`, { headers: adminAuthH(), cache: "no-store" });
      if (!r2.ok) return;
      const d = await r2.json();
      setEmployees(d.employees ?? []);
    } catch {
    }
  }, [adminAuthH]);
  const recallBooking = async (bookingId) => {
    if (!window.confirm(t.recallConfirm)) return;
    const r2 = await fetch(`${API$2()}/api/admin/recall-booking`, {
      method: "POST",
      headers: adminAuthH({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id: bookingId, note: "Повторный вызов" })
    });
    const d = await r2.json();
    if (d.ok) {
      setAllBookings((prev) => prev.map(
        (b) => b.id === bookingId ? { ...b, status: "approved", recall_note: "Повторный вызов" } : b
      ));
    }
  };
  const assignEmployee = reactExports.useCallback(async (bookingId, employeeId) => {
    setAllBookings((prev) => prev.map(
      (b) => b.id === bookingId ? { ...b, assigned_employee_id: employeeId } : b
    ));
    await fetch(`${API$2()}/api/admin/bookings/${bookingId}/assign`, {
      method: "POST",
      headers: adminAuthH({ "Content-Type": "application/json" }),
      body: JSON.stringify({ employee_id: employeeId || null })
    });
    void loadSchedule();
  }, [adminAuthH, loadSchedule]);
  reactExports.useEffect(() => {
    if (authed) {
      loadSlots();
      loadSchedule();
      loadCredentials();
      loadEmployees();
    }
  }, [authed, loadSlots, loadSchedule, loadCredentials, loadEmployees]);
  reactExports.useEffect(() => {
    if (!authed) return;
    fetch(`${API$2()}/api/admin/trash`, { headers: adminAuthH(), cache: "no-store" }).then((r2) => r2.ok ? r2.json() : null).then((d) => {
      if (d?.bookings) setTrashCount(d.bookings.length);
    }).catch(() => {
    });
  }, [authed, adminAuthH]);
  reactExports.useEffect(() => {
    if (!authed) return;
    const id2 = setInterval(() => {
      fetchSlots();
      loadSchedule();
    }, 5e3);
    return () => clearInterval(id2);
  }, [authed, fetchSlots, loadSchedule]);
  reactExports.useEffect(() => {
    if (!authed) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        fetchSlots();
        loadSchedule();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [authed, fetchSlots, loadSchedule]);
  reactExports.useEffect(() => {
    if (!authed) return;
    if (checkedAdvance.current.has(dateStr)) return;
    if (bookedDetails.length === 0 && blockedSlots.length === 0) return;
    checkedAdvance.current.add(dateStr);
    const takenTimes = /* @__PURE__ */ new Set([
      ...bookedDetails.map((b) => b.time),
      ...blockedSlots.map((b) => b.time),
      ...bufferSlots
    ]);
    const allFull = TIME_SLOTS.every((t22) => takenTimes.has(t22));
    if (!allFull) return;
    if (checkedAdvance.current.size > 30) return;
    const next = new Date(year, month - 1, day + 1);
    setMonth(next.getMonth() + 1);
    setDay(next.getDate());
    setYear(next.getFullYear());
  }, [authed, bookedDetails, blockedSlots, dateStr, day, month, year]);
  const blockSlot = async (time2) => {
    setActionSlot(time2);
    const currentReason = reason;
    setBlockedSlots((prev) => [...prev.filter((b) => b.time !== time2), { time: time2, reason: currentReason }]);
    setReason("");
    await fetch(`${API$2()}/api/admin/block`, {
      method: "POST",
      headers,
      body: JSON.stringify({ date: dateStr, time: time2, reason: currentReason }),
      cache: "no-store"
    });
    await loadSlots();
    setActionSlot(null);
  };
  const unblockSlot = async (time2) => {
    setActionSlot(time2);
    setBlockedSlots((prev) => prev.filter((b) => b.time !== time2));
    await fetch(`${API$2()}/api/admin/block`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ date: dateStr, time: time2 }),
      cache: "no-store"
    });
    await loadSlots();
    setActionSlot(null);
  };
  const cancelBooking = async () => {
    if (!confirmCancel) return;
    const { id: cid, time: ctime } = confirmCancel;
    setActionSlot(ctime);
    setConfirmCancel(null);
    setBookedDetails((prev) => prev.filter((b) => b.id !== cid));
    setAllBookings((prev) => prev.map((b) => b.id === cid ? { ...b, status: "cancelled" } : b));
    await fetch(`${API$2()}/api/admin/cancel-booking`, {
      method: "POST",
      headers,
      body: JSON.stringify({ id: cid })
    });
    await Promise.all([loadSlots(), loadSchedule()]);
    setActionSlot(null);
  };
  const completeBooking = async (id2) => {
    const payMethod = completePay.method.trim() || null;
    const payAmountRaw = completePay.amount.trim() ? parseFloat(completePay.amount) : null;
    const payAmount = payAmountRaw !== null && !isNaN(payAmountRaw) ? payAmountRaw : null;
    const payStatus = completePay.status.trim() || null;
    setBookedDetails((prev) => prev.filter((b) => b.id !== id2));
    setAllBookings((prev) => prev.map((b) => b.id === id2 ? { ...b, status: "completed", payment_method: payMethod ?? b.payment_method, payment_amount: payAmount ?? b.payment_amount, payment_status: payStatus ?? b.payment_status } : b));
    setConfirmComplete(null);
    setCompletePay({ method: "", amount: "", status: "" });
    await fetch(`${API$2()}/api/admin/complete-booking`, {
      method: "POST",
      headers,
      body: JSON.stringify({ id: id2, payment_method: payMethod, payment_amount: payAmount, payment_status: payStatus })
    });
    await Promise.all([loadSlots(), loadSchedule()]);
  };
  const approveBooking = async (id2) => {
    await fetch(`${API$2()}/api/admin/approve-booking`, {
      method: "POST",
      headers,
      body: JSON.stringify({ id: id2 })
    });
    await loadSlots();
    await loadSchedule();
  };
  const deleteBooking = async () => {
    if (!confirmDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`${API$2()}/api/admin/delete-booking`, {
        method: "POST",
        headers,
        body: JSON.stringify({ id: confirmDelete.id })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setDeleteError(body?.error ?? `${t.errServer} (${res.status})`);
        return;
      }
      setBookedDetails((prev) => prev.filter((b) => b.id !== confirmDelete.id));
      setAllBookings((prev) => prev.filter((b) => b.id !== confirmDelete.id));
      setConfirmDelete(null);
      setDeleteError(null);
      await Promise.all([loadSlots(), loadSchedule()]);
    } catch (e) {
      setDeleteError(t.errNoConnection);
    } finally {
      setIsDeleting(false);
    }
  };
  const toggleSelect = (id2) => setSelectedIds((prev) => {
    const next = new Set(prev);
    next.has(id2) ? next.delete(id2) : next.add(id2);
    return next;
  });
  const selectAll = () => setSelectedIds((prev) => /* @__PURE__ */ new Set([...prev, ...filteredBookings.map((b) => b.id)]));
  const deselectAll = () => setSelectedIds(/* @__PURE__ */ new Set());
  const bulkDeleteBookings = async () => {
    if (selectedIds.size === 0 || isBulkDeleting) return;
    setIsBulkDeleting(true);
    setBulkDeleteError(null);
    try {
      const res = await fetch(`${API$2()}/api/admin/bulk-delete-bookings`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ids: [...selectedIds] })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setBulkDeleteError(body?.error ?? `${t.errServer} (${res.status})`);
        return;
      }
      const deletedIds = /* @__PURE__ */ new Set([...selectedIds]);
      setBookedDetails((prev) => prev.filter((b) => !deletedIds.has(b.id)));
      setAllBookings((prev) => prev.filter((b) => !deletedIds.has(b.id)));
      setSelectedIds(/* @__PURE__ */ new Set());
      setConfirmBulkDelete(false);
      setBulkDeleteError(null);
      await Promise.all([loadSlots(), loadSchedule()]);
    } catch {
      setBulkDeleteError(t.errNoConnection);
    } finally {
      setIsBulkDeleting(false);
    }
  };
  const restoreBooking = async (overrideDate, overrideTime) => {
    const id2 = overrideDate ? conflictInfo?.id : confirmRestore?.id;
    const name = overrideDate ? conflictInfo?.name : confirmRestore?.name;
    if (!id2 || isRestoring) return;
    setIsRestoring(true);
    try {
      const body = { id: id2 };
      if (overrideDate) {
        body["newDate"] = overrideDate;
      } else if (restoreEditOpen && reeDate) {
        body["newDate"] = reeDate;
      }
      if (overrideTime) {
        body["newTime"] = overrideTime;
      } else if (restoreEditOpen && reeTime) {
        body["newTime"] = reeTime;
      }
      if (restoreEditOpen) {
        if (reeName.trim()) body["newName"] = reeName.trim();
        if (reePhone.trim()) body["newPhone"] = reePhone.trim();
        body["newEmail"] = reeEmail;
        body["newAddress"] = reeAddr;
        if (reeAppl.trim()) body["newAppliance"] = reeAppl.trim();
        body["newMessage"] = reeMsg;
      }
      const r2 = await fetch(`${API$2()}/api/admin/restore-booking`, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
      const data = await r2.json();
      if (!r2.ok || data.error) {
        setRestoreError(data.error ?? `${t.errServer} (${r2.status})`);
        return;
      }
      if (data.conflict && data.conflictWith) {
        setConfirmRestore(null);
        setRestoreError(null);
        const bizDays = getNextBusinessDays(14);
        setRescheduleDate(bizDays[0] ?? "");
        setRescheduleTime(TIME_SLOTS[0]);
        setConflictInfo({ id: id2, name: name ?? "", conflictWith: data.conflictWith });
        return;
      }
      setConfirmRestore(null);
      setConflictInfo(null);
      setRestoreError(null);
      await loadSlots();
      await loadSchedule();
    } catch {
      setRestoreError(t.errNetwork);
    } finally {
      setIsRestoring(false);
    }
  };
  const openRestoreModal = (b) => {
    const bizDays = getNextBusinessDays(14);
    setRestoreError(null);
    setRestoreEditOpen(false);
    setReeName(b.name ?? "");
    setReePhone(b.phone ?? "");
    setReeEmail(b.email ?? "");
    setReeAddr(b.address ?? "");
    setReeAppl(b.appliance ?? "");
    setReeMsg(b.message ?? "");
    setReeDate(bizDays[0] ?? b.preferred_date);
    setReeTime(b.preferred_time);
    setConfirmRestore({
      id: b.id,
      name: b.name,
      date: b.preferred_date,
      time: b.preferred_time,
      phone: b.phone ?? "",
      email: b.email ?? "",
      address: b.address ?? "",
      appliance: b.appliance ?? "",
      message: b.message ?? ""
    });
  };
  const openReschedule = (b) => {
    const bizDays = getNextBusinessDays(14);
    setRsDate(bizDays[0] ?? "");
    setRsTime(TIME_SLOTS[0]);
    setRsError(null);
    setRsConflict(null);
    setConfirmReschedule({ id: b.id, name: b.name, date: b.preferred_date, time: b.preferred_time });
  };
  const rescheduleBooking = async (forceDate, forceTime) => {
    if (!confirmReschedule || isRescheduling) return;
    const useDate = rsDate;
    const useTime = rsTime;
    setIsRescheduling(true);
    setRsError(null);
    setRsConflict(null);
    try {
      const r2 = await fetch(`${API$2()}/api/admin/reschedule-booking`, {
        method: "POST",
        headers,
        body: JSON.stringify({ id: confirmReschedule.id, newDate: useDate, newTime: useTime })
      });
      const data = await r2.json();
      if (data.conflict && data.conflictWith) {
        setRsConflict(data.conflictWith);
        return;
      }
      if (!r2.ok || data.error) {
        setRsError(data.error ?? `${t.errServer} (${r2.status})`);
        return;
      }
      setConfirmReschedule(null);
      setRsConflict(null);
      await loadSlots();
      await loadSchedule();
    } catch {
      setRsError(t.errNetwork);
    } finally {
      setIsRescheduling(false);
    }
  };
  const openEditModal = (b) => {
    setEditTarget({ id: b.id, status: b.status, client_lang: b.client_lang ?? null });
    setEName(b.name ?? "");
    setEPhone(b.phone ?? "");
    setEEmail(b.email ?? "");
    setEAddr(b.address ?? "");
    setEAppl(b.appliance ?? "");
    setEDate(b.preferred_date ?? "");
    setETime(b.preferred_time ?? "");
    setENote(b.message ?? "");
    setEError("");
  };
  const handleEdit = async () => {
    if (!editTarget) return;
    if (!eName.trim() || !ePhone.trim() || !eDate.trim() || !eTime.trim()) {
      setEError(t.errFillRequired);
      return;
    }
    setESaving(true);
    setEError("");
    try {
      const r2 = await fetch(`${API$2()}/api/admin/edit-booking`, {
        method: "POST",
        headers,
        body: JSON.stringify({ id: editTarget.id, name: eName, phone: ePhone, email: eEmail, address: eAddr, appliance: eAppl, date: eDate, time: eTime, message: eNote })
      });
      const d = await r2.json();
      if (d.error === "slot_taken") {
        setEError(t.errSlotTaken);
        return;
      }
      if (!r2.ok) {
        setEError(d.error ?? t.errServer);
        return;
      }
      setEditTarget(null);
      await loadSlots();
      await loadSchedule();
    } catch {
      setEError(t.errNetwork);
    } finally {
      setESaving(false);
    }
  };
  const byDateDesc = (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
  const activeBookings = allBookings.filter((b) => b.status === "pending" || b.status === "approved").sort(byDateDesc);
  const historyBookings = allBookings.filter((b) => b.status === "completed" || b.status === "cancelled").sort(byDateDesc);
  const visibleBookings = showCompleted ? [...activeBookings, ...historyBookings] : activeBookings;
  const filteredBookings = (() => {
    const sq = searchQuery.trim().toLowerCase();
    let result = visibleBookings;
    if (bizFilter !== "all") {
      result = result.filter((b) => resolveBookingBiz(b.business_type) === bizFilter);
    }
    if (empFilter) {
      result = result.filter((b) => b.assigned_employee_id === empFilter);
    }
    if (!sq) return result;
    return result.filter(
      (b) => (b.id ?? "").toLowerCase().includes(sq) || (b.name ?? "").toLowerCase().includes(sq) || (b.phone ?? "").toLowerCase().includes(sq) || (b.address ?? "").toLowerCase().includes(sq) || (b.preferred_date ?? "").toLowerCase().includes(sq) || (b.appliance ?? "").toLowerCase().includes(sq)
    );
  })();
  const allSelected = filteredBookings.length > 0 && filteredBookings.every((b) => selectedIds.has(b.id));
  const statusInfo = (status) => {
    if (status === "approved") return { cls: "bg-green-100 text-green-700", label: t.statusApproved };
    if (status === "completed") return { cls: "bg-blue-100 text-blue-700", label: t.statusCompleted };
    if (status === "cancelled") return { cls: "bg-red-100 text-red-500", label: t.statusCancelled };
    return { cls: "bg-amber-100 text-amber-700", label: t.statusPending };
  };
  const openManual = (time2) => {
    setManualSlot(time2);
    setMName("");
    setMPhone("");
    setMEmail("");
    setMAppl("");
    setMNote("");
    setMAddr("");
    setMZip("");
    setMError("");
  };
  const createManualBooking = async () => {
    if (!mName.trim() || !mPhone.trim()) {
      setMError(t.errEnterNamePhone);
      return;
    }
    setMSaving(true);
    setMError("");
    const r2 = await fetch(`${API$2()}/api/admin/booking`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: mName,
        phone: mPhone,
        email: mEmail,
        appliance: mAppl,
        address: mAddr,
        message: [mNote, mZip ? `ZIP: ${mZip}` : ""].filter(Boolean).join(" | "),
        date: dateStr,
        time: manualSlot,
        business_type: ADMIN_SITE_CONFIG.bookingBizFallback
      })
    });
    if (r2.status === 409) {
      setMError(t.errSlotTakenShort);
      setMSaving(false);
      return;
    }
    if (!r2.ok) {
      setMError(t.errServer);
      setMSaving(false);
      return;
    }
    setManualSlot(null);
    setMSaving(false);
    await loadSlots();
    await loadSchedule();
  };
  const startRename = (cred) => {
    setRenamingCredentialId(cred.id);
    setRenameLabel(cred.label || "Device");
    setRenameError(null);
    if (renameSuccessTimerRef.current) clearTimeout(renameSuccessTimerRef.current);
    setRenamedCredentialId(null);
  };
  const cancelRename = () => {
    setRenamingCredentialId(null);
    setRenameLabel("");
    setRenameError(null);
  };
  const saveRename = async (credId) => {
    const trimmed = renameLabel.trim();
    if (!trimmed) {
      setRenameError("Label cannot be empty");
      return;
    }
    setRenameSaving(true);
    setRenameError(null);
    try {
      const r2 = await fetch(`${API$2()}/api/auth/webauthn/credentials/${credId}`, {
        method: "PATCH",
        headers: adminAuthH({ "Content-Type": "application/json" }),
        body: JSON.stringify({ label: trimmed })
      });
      if (!r2.ok) {
        const body = await r2.json().catch(() => ({}));
        setRenameError(body?.error ?? `${t.errServer} (${r2.status})`);
        return;
      }
      setFaceIdCredentials((prev) => prev.map((c) => c.id === credId ? { ...c, label: trimmed } : c));
      const localCredId = localStorage.getItem("htr_fid_cred_id");
      const renamedCred = faceIdCredentials.find((c) => c.id === credId);
      if (localCredId && renamedCred && renamedCred.credential_id === localCredId) {
        setFidLabel(trimmed);
        sessionStorage.setItem("adminFidLabel", trimmed);
        localStorage.setItem(`htr_fid_label_${localCredId}`, trimmed);
      }
      setRenamingCredentialId(null);
      setRenameLabel("");
      if (renameSuccessTimerRef.current) clearTimeout(renameSuccessTimerRef.current);
      setRenamedCredentialId(credId);
      renameSuccessTimerRef.current = setTimeout(() => setRenamedCredentialId(null), 3e3);
      toast2({ title: "Device renamed", description: `"${trimmed}" saved successfully.`, duration: 3e3 });
      loadCredentials();
    } catch {
      setRenameError(t.errNetwork);
    } finally {
      setRenameSaving(false);
    }
  };
  const removeCredential = async () => {
    if (!confirmRemoveCredential || removingCredentialId !== null) return;
    const removedLabel = confirmRemoveCredential.label || "Device";
    setRemovingCredentialId(confirmRemoveCredential.id);
    setRemoveCredentialError(null);
    try {
      const r2 = await fetch(`${API$2()}/api/auth/webauthn/credentials/${confirmRemoveCredential.id}`, {
        method: "DELETE",
        headers: adminAuthH()
      });
      if (!r2.ok) {
        const body = await r2.json().catch(() => ({}));
        setRemoveCredentialError(body?.error ?? `${t.errServer} (${r2.status})`);
        return;
      }
      setFaceIdCredentials((prev) => prev.filter((c) => c.id !== confirmRemoveCredential.id));
      setConfirmRemoveCredential(null);
      toast2({
        title: "Device removed",
        description: `"${removedLabel}" has been removed successfully.`,
        duration: 3e3
      });
    } catch {
      setRemoveCredentialError(t.errNetwork);
    } finally {
      setRemovingCredentialId(null);
    }
  };
  const logout = () => {
    localStorage.removeItem("adminAuthToken");
    localStorage.removeItem("adminAuthTokenExp");
    localStorage.removeItem("adminPin");
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_pin");
    sessionStorage.removeItem("adminAuthToken");
    sessionStorage.removeItem("adminPin");
    sessionStorage.removeItem("adminFidLabel");
    window.location.reload();
  };
  if (!authed) return null;
  const closeManualModal = () => {
    setManualSlot(null);
    setMName("");
    setMPhone("");
    setMEmail("");
    setMAppl("");
    setMNote("");
    setMAddr("");
    setMZip("");
    setMError("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen", style: { background: PAGE_BG }, children: [
    confirmCancel && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-5 h-5 text-red-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-stone-800", children: t.cancelTitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-stone-600 mb-1", children: [
        t.clientLabel,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: confirmCancel.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-stone-600 mb-4", children: [
        t.cancelSlotWill,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: confirmCancel.time })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setConfirmCancel(null),
            className: "flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition",
            children: t.back
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: cancelBooking,
            className: "flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition",
            children: t.cancelBtnLabel
          }
        )
      ] })
    ] }) }),
    confirmComplete && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-blue-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-stone-800", children: t.completeTitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-stone-600 mb-1", children: [
        t.clientLabel,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: confirmComplete.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-stone-400 mb-3", children: t.completeDesc }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-stone-500 mb-2", children: t.completePaySection }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: completePay.method,
            onChange: (e) => setCompletePay((p) => ({ ...p, method: e.target.value })),
            placeholder: t.completeMethodPlaceholder,
            className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            value: completePay.amount,
            onChange: (e) => setCompletePay((p) => ({ ...p, amount: e.target.value })),
            placeholder: t.completeAmountLabel,
            min: "0",
            step: "0.01",
            className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: completePay.status,
            onChange: (e) => setCompletePay((p) => ({ ...p, status: e.target.value })),
            className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: t.payStatus }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "paid", children: t.payStatusPaid }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cash", children: t.payStatusCash }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "unpaid", children: t.payStatusUnpaid }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending", children: t.payStatusPending })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setConfirmComplete(null);
              setCompletePay({ method: "", amount: "", status: "" });
            },
            className: "flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition",
            children: t.back
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => completeBooking(confirmComplete.id),
            className: "flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition",
            children: t.completeBtnLabel
          }
        )
      ] })
    ] }) }),
    confirmBulkDelete && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-5 h-5 text-amber-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-stone-800", children: t.moveToTrashBulkTitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-stone-600 mb-1", children: [
        t.selected,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedIds.size })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 font-semibold mb-4", children: t.moveToTrashBulkMsg }),
      bulkDeleteError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700", children: [
        "❌ ",
        bulkDeleteError
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setConfirmBulkDelete(false);
              setBulkDeleteError(null);
            },
            disabled: isBulkDeleting,
            className: "flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-50",
            children: t.back
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: bulkDeleteBookings,
            disabled: isBulkDeleting,
            className: "flex-1 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50",
            children: isBulkDeleting ? t.deleting : `${t.moveToTrashBulkBtn} (${selectedIds.size})`
          }
        )
      ] })
    ] }) }),
    confirmDelete && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-5 h-5 text-amber-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-stone-800", children: t.moveToTrashSingleTitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-stone-600 mb-1", children: [
        t.clientLabel,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: confirmDelete.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 font-semibold mb-4", children: t.moveToTrashSingleMsg }),
      deleteError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700", children: [
        "❌ ",
        deleteError
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setConfirmDelete(null);
              setDeleteError(null);
            },
            disabled: isDeleting,
            className: "flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-50",
            children: t.back
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: deleteBooking,
            disabled: isDeleting,
            className: "flex-1 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50",
            children: isDeleting ? t.deleting : t.moveToTrashSingleBtn
          }
        )
      ] })
    ] }) }),
    confirmRestore && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm max-h-[92vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-5 h-5 text-orange-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-stone-800", children: t.restoreTitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-stone-600 mb-1", children: [
        t.clientLabel,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: confirmRestore.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-stone-600 mb-2", children: [
        t.dateShort,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: confirmRestore.date }),
        " · ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: confirmRestore.time })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setRestoreEditOpen((v) => !v),
          disabled: isRestoring,
          className: "w-full flex items-center justify-between px-3 py-2 mb-3 rounded-lg border text-xs font-semibold transition",
          style: { borderColor: restoreEditOpen ? ACCENT$4 : "#e7e5e4", color: restoreEditOpen ? ACCENT$4 : "#78716c", background: restoreEditOpen ? "#eff6ff" : "#fafaf9" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }),
              restoreEditOpen ? t.hideEdits : t.showEdits
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-none", children: restoreEditOpen ? "▲" : "▼" })
          ]
        }
      ),
      restoreEditOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 mb-3 p-3 bg-stone-50 rounded-xl border border-stone-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.fieldName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: reeName,
              onChange: (e) => setReeName(e.target.value),
              disabled: isRestoring,
              className: "w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50",
              style: { "--tw-ring-color": ACCENT$4 }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.fieldPhone }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: reePhone,
              onChange: (e) => setReePhone(e.target.value),
              disabled: isRestoring,
              className: "w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50",
              style: { "--tw-ring-color": ACCENT$4 }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.fieldEmail }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              value: reeEmail,
              onChange: (e) => setReeEmail(e.target.value),
              disabled: isRestoring,
              className: "w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50",
              style: { "--tw-ring-color": ACCENT$4 }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.fieldAddress }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: reeAddr,
              onChange: (e) => setReeAddr(e.target.value),
              disabled: isRestoring,
              className: "w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50",
              style: { "--tw-ring-color": ACCENT$4 }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.fieldAppliance }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: reeAppl,
              onChange: (e) => setReeAppl(e.target.value),
              disabled: isRestoring,
              className: "w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50",
              style: { "--tw-ring-color": ACCENT$4 }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.fieldIssue }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: reeMsg,
              onChange: (e) => setReeMsg(e.target.value),
              disabled: isRestoring,
              rows: 2,
              className: "w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 resize-none disabled:opacity-50",
              style: { "--tw-ring-color": ACCENT$4 }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.fieldNewDate }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: reeDate,
              onChange: (e) => setReeDate(e.target.value),
              disabled: isRestoring,
              className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:opacity-50",
              style: { "--tw-ring-color": ACCENT$4 },
              children: getNextBusinessDays(14).map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: d, children: d }, d))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.fieldNewTime }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: reeTime,
              onChange: (e) => setReeTime(e.target.value),
              disabled: isRestoring,
              className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:opacity-50",
              style: { "--tw-ring-color": ACCENT$4 },
              children: TIME_SLOTS.map((t22) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t22, children: t22 }, t22))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-stone-400 mb-3", children: t.restoreNote }),
      restoreError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium", children: [
        "⚠️ ",
        restoreError
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setConfirmRestore(null),
            disabled: isRestoring,
            className: "flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-40",
            children: t.back
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => restoreBooking(),
            disabled: isRestoring,
            className: "flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60",
            style: { background: "#f97316" },
            children: isRestoring ? t.restoring : t.restoreActionBtn
          }
        )
      ] })
    ] }) }),
    conflictInfo && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-5 h-5 text-red-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-stone-800", children: t.conflictTitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4 text-sm text-red-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: t.conflictTaken }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "👤 ",
          conflictInfo.conflictWith.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "📅 ",
          conflictInfo.conflictWith.date,
          " · ",
          conflictInfo.conflictWith.time
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-stone-600 mb-3", children: [
        t.conflictPickOther,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: conflictInfo.name }),
        ":"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.fieldNewDate }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: rescheduleDate,
              onChange: (e) => setRescheduleDate(e.target.value),
              className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2",
              style: { "--tw-ring-color": ACCENT$4 },
              children: getNextBusinessDays(14).map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: d, children: d }, d))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.fieldNewTime }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: rescheduleTime,
              onChange: (e) => setRescheduleTime(e.target.value),
              className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2",
              style: { "--tw-ring-color": ACCENT$4 },
              children: TIME_SLOTS.map((t22) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t22, children: t22 }, t22))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setConflictInfo(null),
            disabled: isRestoring,
            className: "flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-40",
            children: t.cancel
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => restoreBooking(rescheduleDate, rescheduleTime),
            disabled: isRestoring,
            className: "flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60",
            style: { background: "#f97316" },
            children: isRestoring ? t.restoring : t.restoreActionBtn
          }
        )
      ] })
    ] }) }),
    confirmReschedule && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-5 h-5 text-blue-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-stone-800", children: t.rescheduleBtn })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-stone-600 mb-1", children: [
        t.clientLabel,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: confirmReschedule.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-stone-500 mb-3 line-through text-xs", children: [
        confirmReschedule.date,
        " · ",
        confirmReschedule.time
      ] }),
      rsConflict && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold mb-0.5", children: [
          "⚠️ ",
          t.conflictTaken
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "👤 ",
          rsConflict.name,
          " · ",
          rsConflict.date,
          " · ",
          rsConflict.time
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-red-600", children: t.errSlotTaken })
      ] }),
      rsError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium", children: [
        "⚠️ ",
        rsError
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.fieldNewDate }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: rsDate,
              onChange: (e) => {
                setRsDate(e.target.value);
                setRsConflict(null);
              },
              className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2",
              style: { "--tw-ring-color": ACCENT$4 },
              children: getNextBusinessDays(14).map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: d, children: d }, d))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.fieldNewTime }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: rsTime,
              onChange: (e) => {
                setRsTime(e.target.value);
                setRsConflict(null);
              },
              className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2",
              style: { "--tw-ring-color": ACCENT$4 },
              children: TIME_SLOTS.map((t22) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t22, children: t22 }, t22))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setConfirmReschedule(null),
            disabled: isRescheduling,
            className: "flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-40",
            children: t.cancel
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => rescheduleBooking(),
            disabled: isRescheduling,
            className: "flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60",
            style: { background: ACCENT$4 },
            children: isRescheduling ? t.loading : `📅 ${t.rescheduleBtn}`
          }
        )
      ] })
    ] }) }),
    editTarget && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-5 h-5 text-violet-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-stone-800", children: t.editBookingTitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-stone-400 mb-4", children: [
        "ID: ",
        editTarget.id.slice(0, 8).toUpperCase(),
        " · ",
        t.labelStatus,
        " ",
        editTarget.status
      ] }),
      editTarget.client_lang && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-blue-700", children: t.clientLangLabel }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold uppercase tracking-wide text-blue-900", children: editTarget.client_lang === "es" ? t.clientLangEs : editTarget.client_lang === "en" ? t.clientLangEn : editTarget.client_lang })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminInput, { label: t.clientNameReq, value: eName, onChange: setEName, placeholder: "John Smith" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminInput, { label: t.phoneReq, value: ePhone, onChange: setEPhone, placeholder: "(346) 000-0000", type: "tel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminInput, { label: t.emailClient, value: eEmail, onChange: setEEmail, placeholder: "client@email.com", type: "email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminInput, { label: t.addressOptional, value: eAddr, onChange: setEAddr, placeholder: "123 Main St, Houston TX" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminInput, { label: t.applianceOptional, value: eAppl, onChange: setEAppl, placeholder: "Washer, Dryer, Fridge…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.dateReq }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: eDate,
              onChange: (e) => setEDate(e.target.value),
              placeholder: "Apr 25, 2026",
              className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 mt-0.5", children: t.dateFormatHint })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.timeReq }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: eTime,
              onChange: (e) => setETime(e.target.value),
              className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400",
              children: TIME_SLOTS.map((t22) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t22, children: t22 }, t22))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.noteOptional }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: eNote,
              onChange: (e) => setENote(e.target.value),
              rows: 2,
              placeholder: t.notePlaceholder,
              className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
            }
          )
        ] })
      ] }),
      eError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-500 mt-2", children: eError }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setEditTarget(null),
            className: "flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition",
            children: t.cancel
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleEdit,
            disabled: eSaving,
            className: "flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50",
            style: { background: "#7c3aed" },
            children: eSaving ? t.savingDots : t.saveEdits
          }
        )
      ] })
    ] }) }),
    manualSlot && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "w-5 h-5", style: { color: ACCENT$4 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-stone-800", children: t.createBookingTitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-stone-400 mb-4", children: [
        dateStr,
        " · ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: manualSlot })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminInput, { label: t.clientNameReq, value: mName, onChange: setMName, placeholder: "John Smith" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminInput, { label: t.phoneReq, value: mPhone, onChange: setMPhone, placeholder: "(346) 000-0000", type: "tel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminInput, { label: t.emailClient, value: mEmail, onChange: setMEmail, placeholder: "client@email.com", type: "email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminInput, { label: t.addressOptional, value: mAddr, onChange: setMAddr, placeholder: "123 Main St, Houston, TX" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminInput, { label: t.zipOptional, value: mZip, onChange: setMZip, placeholder: "77001" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdminInput, { label: t.applianceOptional, value: mAppl, onChange: setMAppl, placeholder: t.appliancePlaceholderRu }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.noteOptional }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: mNote,
              onChange: (e) => setMNote(e.target.value),
              placeholder: t.addlInfoPlaceholder,
              rows: 2,
              className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none",
              style: { "--tw-ring-color": ACCENT$4 }
            }
          )
        ] })
      ] }),
      mError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-500 mt-2", children: mError }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: closeManualModal,
            className: "flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition",
            children: t.cancel
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: createManualBooking,
            disabled: mSaving,
            className: "flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60",
            style: { background: ACCENT$4 },
            children: mSaving ? t.savingBook : t.bookBtn
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-stone-50 border-b border-stone-200 px-4 py-2 text-center space-y-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] leading-snug text-gray-500 max-w-3xl mx-auto", children: "All rights to the source code of this CRM system, including its development, architecture and software implementation, belong to Eivaz Rakhmanov and are protected as intellectual property." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] leading-snug text-gray-500 max-w-3xl mx-auto", children: "Все права на исходный код CRM-системы, включая разработку, архитектуру и программную реализацию проекта, принадлежат Эйвазу Рахманову и охраняются как объект интеллектуальной собственности." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-30 bg-white border-b shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex md:hidden items-center gap-2 px-3 h-14", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/htr-logo-nobg.png", alt: "HTR", style: { width: 80, height: 54, borderRadius: 8, objectFit: "contain", flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-stone-800 text-sm leading-tight truncate", children: "HTRGroupTX Admin" }),
          fidLabel ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs leading-tight truncate flex items-center gap-1", style: { color: ACCENT$4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Fingerprint, { className: "w-3 h-3 flex-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
              t.loggedFid,
              " ",
              fidLabel
            ] })
          ] }) : pin ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs leading-tight truncate flex items-center gap-1 text-stone-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3 h-3 flex-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: t.loggedPin })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-stone-400 leading-tight truncate", children: t.schedule })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: "/employee",
              target: "_blank",
              rel: "noreferrer",
              className: "md:hidden flex-none flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-[10px] font-bold leading-tight",
              title: lang === "ru" ? "Портал сотрудника" : "Employee Portal",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: lang === "ru" ? "Портал" : "Portal" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/pay", target: "_blank", rel: "noreferrer", className: "md:hidden flex-none flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold leading-tight", title: t.pay ?? "Pay", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.pay ?? "Pay" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setLang(lang === "ru" ? "en" : "ru"),
              className: "px-2 py-1 rounded-md text-xs font-bold border border-stone-200 hover:bg-stone-50 transition flex items-center gap-0.5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: lang === "ru" ? ACCENT$4 : "#a8a29e" }, children: "RU" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-stone-300 font-normal", children: "|" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: lang === "en" ? ACCENT$4 : "#a8a29e" }, children: "EN" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: logout, className: "flex items-center gap-1 text-xs text-stone-500 hover:text-red-500 transition px-2 py-1.5 rounded-lg hover:bg-red-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-3.5 h-3.5" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:grid px-4 h-14 items-center", style: { gridTemplateColumns: "1fr auto 1fr" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/htr-logo-nobg.png", alt: "HTR", style: { width: 80, height: 54, borderRadius: 8, objectFit: "contain" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-stone-800 leading-tight", children: t.schedule }),
            fidLabel ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs leading-tight flex items-center gap-1", style: { color: ACCENT$4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Fingerprint, { className: "w-3 h-3 flex-none" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                t.loggedFid,
                " ",
                fidLabel
              ] })
            ] }) : pin ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs leading-tight flex items-center gap-1 text-stone-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3 h-3 flex-none" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.loggedPin })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-stone-400 leading-tight", children: "HTRGroupTX" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center px-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold leading-tight", style: { color: "#dc2626" }, children: "Database developed by Eivaz Rakhmanov 2026" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold leading-tight", style: { color: "#16a34a" }, children: "База данных разработана Эйвазом Рахмановым в 2026 году" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: "/employee",
              target: "_blank",
              rel: "noreferrer",
              className: "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition",
              title: "Открыть портал сотрудника",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-3.5 h-3.5" }),
                lang === "ru" ? "Портал сотрудника" : "Employee Portal"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/pay", target: "_blank", rel: "noreferrer", className: "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition", title: t.pay ?? "Pay", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-3.5 h-3.5" }),
            t.pay ?? "Pay"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setLang(lang === "ru" ? "en" : "ru"),
              className: "px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold hover:bg-stone-50 transition flex items-center gap-0.5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: lang === "ru" ? ACCENT$4 : "#a8a29e" }, children: "RU" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-stone-300 font-normal mx-0.5", children: "|" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: lang === "en" ? ACCENT$4 : "#a8a29e" }, children: "EN" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: logout, className: "flex items-center gap-1.5 text-sm text-stone-500 hover:text-red-500 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-4 h-4" }),
            t.logout
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-14 z-20 bg-white border-b border-stone-200 shadow-sm overflow-x-auto", style: { scrollbarWidth: "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-w-max", children: [
      { key: "bookings", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3.5 h-3.5" }), label: t.tabBookings },
      { key: "employees", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5" }), label: t.tabEmployees },
      { key: "archive", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "w-3.5 h-3.5" }), label: t.tabArchive },
      { key: "blacklist", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldOff, { className: "w-3.5 h-3.5" }), label: t.tabBlacklist },
      { key: "payroll", icon: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "💰" }), label: t.tabPayroll },
      { key: "reports", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5" }), label: t.tabReports },
      { key: "pricebook", icon: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "🏷️" }), label: t.tabPricebook ?? "Прайс-лист" },
      { key: "photos", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-3.5 h-3.5" }), label: t.tabPhotos ?? "Фото" },
      { key: "settings", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-3.5 h-3.5" }), label: t.tabSettings },
      { key: "trash", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }), label: t.tabTrash, count: trashCount }
    ].map(({ key, icon, label, count: count2 }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setAdminTab(key),
        className: `flex items-center gap-1.5 px-4 md:px-5 py-2.5 text-sm font-semibold border-b-2 transition whitespace-nowrap ${adminTab === key ? "border-blue-600 text-blue-600" : "border-transparent text-stone-400 hover:text-stone-600"}`,
        children: [
          icon,
          label,
          count2 != null && count2 > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center min-w-[18px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none", children: count2 })
        ]
      },
      key
    )) }) }),
    adminTab === "bookings" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden sticky top-24 z-10 flex border-b border-stone-200 bg-white shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setMobileTab("slots"),
          className: `flex-1 py-3 text-sm font-semibold border-b-2 transition ${mobileTab === "slots" ? "border-blue-600 text-blue-600" : "border-transparent text-stone-400"}`,
          children: t.slotsTab
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setMobileTab("bookings"),
          className: `flex-1 py-3 text-sm font-semibold border-b-2 transition ${mobileTab === "bookings" ? "border-blue-600 text-blue-600" : "border-transparent text-stone-400"}`,
          children: [
            "📋 ",
            t.tabBookings,
            " (",
            allBookings.length,
            ")"
          ]
        }
      )
    ] }),
    adminTab === "employees" && /* @__PURE__ */ jsxRuntimeExports.jsx(EmployeesTab, { apiBase: API$2(), adminAuthH }),
    adminTab === "archive" && /* @__PURE__ */ jsxRuntimeExports.jsx(ArchiveTab, { apiBase: API$2(), adminAuthH }),
    adminTab === "blacklist" && /* @__PURE__ */ jsxRuntimeExports.jsx(BlacklistTab, { apiBase: API$2(), adminAuthH }),
    adminTab === "payroll" && /* @__PURE__ */ jsxRuntimeExports.jsx(PayrollTab, { apiBase: API$2(), adminAuthH }),
    adminTab === "reports" && /* @__PURE__ */ jsxRuntimeExports.jsx(ReportsTab, { apiBase: API$2(), adminAuthH, onOpenBooking: (id2) => {
      setAdminTab("bookings");
      setSearchQuery(id2);
      setHighlightBookingId(id2);
      setShowCompleted(true);
      setEmpFilter("");
      setMobileTab("bookings");
    } }),
    adminTab === "pricebook" && /* @__PURE__ */ jsxRuntimeExports.jsx(PricebookTab, { apiBase: API$2(), adminAuthH }),
    adminTab === "settings" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 pb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsTab, { apiBase: API$2(), adminAuthH }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl mx-auto px-4 space-y-4", children: ADMIN_SITE_CONFIG.visitFeeSites.map((site) => /* @__PURE__ */ jsxRuntimeExports.jsx(VisitFeeSettings, { apiBase: API$2(), adminAuthH, site }, site)) })
    ] }),
    adminTab === "trash" && /* @__PURE__ */ jsxRuntimeExports.jsx(TrashTab, { apiBase: API$2(), adminAuthH, onCountChange: setTrashCount }),
    adminTab === "photos" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full min-h-[calc(100dvh-7rem)]", style: { paddingBottom: "max(5rem, env(safe-area-inset-bottom))" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm p-5 border border-stone-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base font-bold text-stone-800 mb-1 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-5 h-5", style: { color: ACCENT$4 } }),
        t.tabPhotos ?? "Фото"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(GalleryPhotoManager, { adminPin: pin, adminBearer, defaultSite: ADMIN_SITE_CONFIG.defaultGallerySite })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex gap-0 md:overflow-hidden md:h-[calc(100vh-96px)] ${adminTab !== "bookings" ? "hidden" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `overflow-y-auto border-r border-stone-200 p-4 space-y-4 ${mobileTab !== "slots" ? "hidden md:block" : "block"} md:w-[300px] md:flex-none`,
          style: { background: PAGE_BG, paddingBottom: 80 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold text-stone-600 mb-3 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4" }),
                " ",
                t.selectDate
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "select",
                  {
                    value: month,
                    onChange: (e) => {
                      const m = +e.target.value;
                      setMonth(m);
                      if (day > new Date(year, m, 0).getDate()) setDay(1);
                    },
                    className: "border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 w-full",
                    style: { "--tw-ring-color": ACCENT$4 },
                    children: MONTHS.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: i + 1, children: m }, m))
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "select",
                    {
                      value: day,
                      onChange: (e) => setDay(+e.target.value),
                      className: "border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 flex-1",
                      style: { "--tw-ring-color": ACCENT$4 },
                      children: Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1).map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: d, children: d }, d))
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "select",
                    {
                      value: year,
                      onChange: (e) => setYear(+e.target.value),
                      className: "border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 flex-1",
                      style: { "--tw-ring-color": ACCENT$4 },
                      children: [(/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getFullYear() + 1].map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => {
                      loadSlots();
                      loadSchedule();
                    },
                    disabled: loading,
                    className: "flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition w-full",
                    style: { background: ACCENT$4, opacity: loading ? 0.7 : 1 },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-3.5 h-3.5 ${loading ? "animate-spin" : ""}` }),
                      t.refresh
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-stone-400 mt-2", children: [
                t.dateLabel,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-stone-600", children: dateStr })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold text-stone-600 mb-1 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
                " ",
                t.slotsFor,
                " ",
                dateStr
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 text-xs text-stone-500 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.slotFreeLabel }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.slotBlockedLabel }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.slotTakenLabel })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-stone-500 mb-1 block", children: t.blockReasonLabel }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: reason,
                    onChange: (e) => setReason(e.target.value),
                    placeholder: t.blockReasonPlaceholder,
                    className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2",
                    style: { "--tw-ring-color": ACCENT$4 }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: TIME_SLOTS.map((slot) => {
                const detail = bookedDetails.find((b) => b.time === slot);
                const blocked = blockedSlots.find((b) => b.time === slot);
                const busy = actionSlot === slot;
                if (detail) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border-2 p-2", style: { borderColor: "#dc2626", background: "#fef2f2" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-red-600", children: slot }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-red-500 mt-0.5 truncate", title: detail.name, children: [
                    "👤 ",
                    detail.name
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-red-400", children: detail.status === "approved" ? t.slotApproved : t.slotWaiting }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => setConfirmCancel({ id: detail.id, name: detail.name, time: slot }),
                      disabled: busy,
                      className: "mt-1 w-full flex items-center justify-center gap-1 text-[10px] font-semibold py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3 h-3" }),
                        busy ? "…" : t.slotFreeBtn
                      ]
                    }
                  )
                ] }, slot);
                if (blocked) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border-2 p-2", style: { borderColor: "#f97316", background: "#fff7ed" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-orange-600", children: slot }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-orange-500 mt-0.5 truncate", title: blocked.reason, children: blocked.reason ? `📝 ${blocked.reason}` : t.slotBlocked }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => unblockSlot(slot),
                      disabled: busy,
                      className: "mt-1 w-full flex items-center justify-center gap-1 text-[10px] font-semibold py-1 rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 transition disabled:opacity-50",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { className: "w-3 h-3" }),
                        busy ? "…" : t.slotUnblock
                      ]
                    }
                  )
                ] }, slot);
                const isBuffer = bufferSlots.includes(slot);
                if (isBuffer) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border-2 p-2", style: { borderColor: "#d97706", background: "#fffbeb" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-amber-600", children: slot }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-amber-500 mt-0.5", children: "⏱ 2h buffer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-amber-400 mt-0.5 leading-tight", children: lang === "ru" ? "Мин. 2 ч между заказами" : "Min. 2h between orders" })
                ] }, slot);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border-2 p-2", style: { borderColor: "#16a34a", background: "#f0fdf4" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-green-700", children: slot }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-green-500 mt-0.5", children: t.slotFreeLabel }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 mt-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        onClick: () => blockSlot(slot),
                        disabled: busy,
                        className: "flex-1 flex items-center justify-center gap-0.5 text-[10px] font-semibold py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition disabled:opacity-50",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-2.5 h-2.5" }),
                          busy ? "…" : t.slotBlockBtn
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        onClick: () => openManual(slot),
                        disabled: busy,
                        className: "flex-1 flex items-center justify-center gap-0.5 text-[10px] font-semibold py-1 rounded-md text-white transition disabled:opacity-50",
                        style: { background: ACCENT$4 },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "w-2.5 h-2.5" }),
                          t.slotBookBtn
                        ]
                      }
                    )
                  ] })
                ] }, slot);
              }) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `overflow-y-auto p-4 ${mobileTab !== "bookings" ? "hidden md:block" : "block"} flex-1`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm p-4 md:p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mb-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold text-stone-600 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-4 h-4" }),
            showCompleted ? t.allOrders : t.activeOrders,
            " (",
            visibleBookings.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex rounded-lg border border-stone-200 overflow-hidden text-[11px] font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setShowCompleted(false),
                className: `px-3 py-1.5 transition ${!showCompleted ? "bg-blue-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`,
                children: [
                  t.activeTab,
                  activeBookings.length > 0 ? ` (${activeBookings.length})` : ""
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setShowCompleted(true),
                className: `px-3 py-1.5 border-l border-stone-200 transition ${showCompleted ? "bg-blue-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`,
                children: [
                  t.allOrders,
                  historyBookings.length > 0 ? ` +${historyBookings.length}` : ""
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-semibold text-stone-500 whitespace-nowrap", children: [
            t.filterCategory,
            ":"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex rounded-lg border border-stone-200 overflow-hidden text-[11px] font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setBizFilter("all"),
                className: `px-3 py-1.5 transition ${bizFilter === "all" ? "bg-blue-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`,
                children: t.filterAll
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setBizFilter("appliance"),
                className: `px-3 py-1.5 border-l border-stone-200 transition ${bizFilter === "appliance" ? "bg-blue-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`,
                children: t.filterAppliance
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setBizFilter("dental"),
                className: `px-3 py-1.5 border-l border-stone-200 transition ${bizFilter === "dental" ? "bg-violet-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`,
                children: t.filterDental
              }
            )
          ] })
        ] }),
        employees.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-semibold text-stone-500 whitespace-nowrap", children: [
            t.filterEmployee,
            ":"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: empFilter,
              onChange: (e) => setEmpFilter(e.target.value),
              className: "flex-1 border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: t.allEmployees }),
                employees.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: e.id, children: e.name }, e.id))
              ]
            }
          ),
          empFilter && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEmpFilter(""), className: "text-xs text-stone-400 hover:text-stone-600 transition", children: "✕" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "search",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              placeholder: t.searchPlaceholder,
              className: "w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-stone-400"
            }
          ),
          searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setSearchQuery(""),
              className: "absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600",
              title: t.clearSearch,
              children: "✕"
            }
          )
        ] }),
        searchQuery.trim() && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-stone-400 mb-2 -mt-1", children: [
          t.found,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-stone-600", children: filteredBookings.length }),
          " ",
          t.of,
          " ",
          visibleBookings.length
        ] }),
        filteredBookings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: allSelected ? deselectAll : selectAll,
              className: "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition",
              style: allSelected ? { borderColor: "#1B6FE8", background: "#EFF6FF", color: "#1B6FE8" } : { borderColor: "#e2e8f0", background: "#fff", color: "#57534e" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    readOnly: true,
                    checked: allSelected,
                    className: "w-3.5 h-3.5 accent-blue-600 pointer-events-none"
                  }
                ),
                allSelected ? t.deselectAll : t.selectAll
              ]
            }
          ),
          selectedIds.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-stone-500", children: [
              t.selected,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedIds.size })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => {
                  setConfirmBulkDelete(true);
                  setBulkDeleteError(null);
                },
                className: "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-700 text-white hover:bg-red-800 transition",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }),
                  t.deleteSelected,
                  " (",
                  selectedIds.size,
                  ")"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: deselectAll,
                className: "text-xs text-stone-400 hover:text-stone-600 transition px-1",
                children: t.deselect
              }
            )
          ] })
        ] }),
        apiError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 mt-0.5", children: "⚠️" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: t.errorLoadTitle }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-red-600", children: apiError })
          ] })
        ] }),
        filteredBookings.length === 0 && !apiError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-stone-400 py-4 text-center", children: searchQuery.trim() ? t.nothingFound : t.noOrders }) : filteredBookings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden space-y-3", children: filteredBookings.map((b, idx) => {
            const isHistory = b.status === "completed" || b.status === "cancelled";
            const isWA = /AM–|PM–|AM-|PM-/.test(b.preferred_time ?? "");
            const { cls: statusCls2, label: statusLabel2 } = statusInfo(b.status);
            const createdStr = b.created_at ? new Date(b.created_at).toLocaleDateString(t.dateLocale, { day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "America/Chicago" }) : null;
            const prevIsActive = idx > 0 && (filteredBookings[idx - 1].status === "pending" || filteredBookings[idx - 1].status === "approved");
            const showSeparator = showCompleted && isHistory && (idx === 0 || prevIsActive);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
              showSeparator && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-stone-200" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-stone-400 uppercase tracking-wide", children: t.historyLabel }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-stone-200" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  id: `booking-row-m-${b.id}`,
                  className: `border rounded-xl p-3 transition ${highlightBookingId === b.id ? "ring-2 ring-amber-400 border-amber-300 bg-amber-50" : selectedIds.has(b.id) ? "ring-2 ring-blue-400 border-blue-300 bg-blue-50" : isHistory ? "border-stone-100 bg-stone-50 opacity-60" : "border-stone-200 bg-white"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "checkbox",
                            checked: selectedIds.has(b.id),
                            onChange: () => toggleSelect(b.id),
                            className: "mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-stone-700", children: b.preferred_date }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-stone-500 flex items-center gap-1", children: [
                            b.preferred_time,
                            isWA && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700", children: "WA" })
                          ] }),
                          createdStr && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-stone-400 mt-0.5", children: [
                            t.createdLabel,
                            " ",
                            createdStr
                          ] })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCls2}`, children: statusLabel2 })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3.5 h-3.5 text-stone-400 flex-shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-stone-800", children: b.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ${resolveBookingBiz(b.business_type) === "dental" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`, children: resolveBookingBiz(b.business_type) === "dental" ? t.bizDental : t.bizAppliance }),
                      b.is_remote && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-100 text-stone-500 leading-none", title: t.remoteBookingHint, children: "👁" }),
                      b.client_lang && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-700 leading-none uppercase",
                          title: b.client_lang === "es" ? t.clientLangEs : b.client_lang === "en" ? t.clientLangEn : b.client_lang,
                          children: b.client_lang
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-3.5 h-3.5 flex-shrink-0", style: { color: ACCENT$4 } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `tel:${b.phone}`, className: "text-sm font-medium", style: { color: ACCENT$4 }, children: b.phone }),
                      b.phone && (genderPickerId === b.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 ml-0.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: () => {
                              void handleCallback(b.phone, b.id, b.name, b.client_lang ?? "en", "male");
                              setGenderPickerId(null);
                            },
                            title: "Клиент — мужчина",
                            className: "text-xs px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold leading-none",
                            children: "♂"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: () => {
                              void handleCallback(b.phone, b.id, b.name, b.client_lang ?? "en", "female");
                              setGenderPickerId(null);
                            },
                            title: "Клиент — женщина",
                            className: "text-xs px-1.5 py-0.5 rounded bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold leading-none",
                            children: "♀"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: () => setGenderPickerId(null),
                            className: "text-[10px] text-stone-400 hover:text-stone-600 leading-none px-0.5",
                            children: "✕"
                          }
                        )
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => setGenderPickerId(b.id),
                          disabled: callbackLoading.has(b.id),
                          title: "Перезвонить клиенту — выберите пол",
                          className: "ml-0.5 p-0.5 rounded hover:bg-blue-50 transition-colors disabled:opacity-50",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneOutgoing, { className: "w-3.5 h-3.5", style: { color: ACCENT$4 } })
                        }
                      )),
                      b.status === "completed" && b.phone && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => void handleSendReview(b.id),
                          disabled: reviewLoading.has(b.id),
                          title: "Отправить ссылку на Google Review клиенту по SMS",
                          className: "ml-0.5 p-0.5 rounded hover:bg-yellow-50 transition-colors disabled:opacity-50",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-3.5 h-3.5", style: { color: reviewLoading.has(b.id) ? "#aaa" : "#f59e0b" } })
                        }
                      )
                    ] }),
                    b.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-3.5 h-3.5 text-stone-400 flex-shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${b.email}`, className: "text-xs text-stone-500 hover:text-blue-600 transition truncate max-w-[220px]", children: b.email })
                    ] }),
                    b.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3.5 h-3.5 text-stone-400 flex-shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-stone-500", children: b.address })
                    ] }),
                    b.appliance && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-3.5 h-3.5 text-stone-400 flex-shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-stone-600", children: b.appliance })
                    ] }),
                    (b.status === "pending" || b.status === "approved") && !b.is_remote && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5 mt-1", children: [
                      employees.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3.5 h-3.5 text-stone-400 flex-none" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "select",
                          {
                            value: b.assigned_employee_id ?? "",
                            onChange: (e) => assignEmployee(b.id, e.target.value || null),
                            className: "flex-1 border border-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: t.notAssigned }),
                              employees.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: e.id, children: e.name }, e.id))
                            ]
                          }
                        )
                      ] }),
                      b.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => approveBooking(b.id),
                          className: "w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition border border-green-100",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "w-3.5 h-3.5" }),
                            " ",
                            t.approveBtn
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => {
                            setStripeModal({ id: b.id, name: b.name, amount: String(b.payment_amount ?? "") });
                            setStripeLink(null);
                            setStripeErr(null);
                          },
                          className: "w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition border border-indigo-100",
                          children: [
                            "💳 ",
                            t.stripePayLink
                          ]
                        }
                      ),
                      adminEstimateHistory[b.id] && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs", children: [
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
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => openAdminEstimate({ id: b.id, name: b.name, email: b.email ?? "", phone: b.phone ?? "" }),
                          className: "w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition border border-teal-100",
                          children: [
                            "📋 ",
                            t.estimateBtn
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "button",
                          {
                            onClick: () => openEditModal(b),
                            className: "flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition border border-violet-100",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }),
                              " ",
                              t.editBtn
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "button",
                          {
                            onClick: () => setConfirmComplete({ id: b.id, name: b.name }),
                            className: "flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-100",
                            title: t.titleComplete,
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5" }),
                              " ",
                              t.completeBtn
                            ]
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "button",
                          {
                            onClick: () => openReschedule(b),
                            className: "flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-100",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-3.5 h-3.5" }),
                              " ",
                              t.rescheduleBtn
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "button",
                          {
                            onClick: () => setConfirmCancel({ id: b.id, name: b.name, time: b.preferred_time }),
                            className: "flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-100",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3.5 h-3.5" }),
                              " ",
                              t.cancelBtn
                            ]
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => setConfirmDelete({ id: b.id, name: b.name }),
                          className: "w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition border border-amber-200",
                          title: t.moveToTrashTitle,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }),
                            " ",
                            t.moveToTrashBtn
                          ]
                        }
                      )
                    ] }),
                    (b.status === "cancelled" || b.status === "completed") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 space-y-1.5", children: [
                      b.status === "completed" && (b.payment_method || b.payment_amount != null || b.payment_status) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] text-stone-500 bg-green-50 rounded-lg px-2 py-1 border border-green-100", children: [
                        b.payment_amount != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-green-700", children: [
                          "$",
                          b.payment_amount
                        ] }),
                        b.payment_status === "paid" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-green-700", children: t.payStatusPaid }),
                        b.payment_status === "unpaid" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-red-600", children: t.payStatusUnpaid }),
                        b.payment_status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-amber-600", children: t.payStatusPending }),
                        b.payment_status === "cash" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-stone-600", children: t.payStatusCash })
                      ] }),
                      b.status === "completed" && b.client_signed_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[10px] text-purple-700 font-semibold bg-purple-50 rounded-lg px-2 py-1 border border-purple-100", children: [
                        "✍️ ",
                        t.clientSigned
                      ] }),
                      b.status === "completed" && b.payment_status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          disabled: resendingId === b.id,
                          onClick: () => resendPaymentLink(b.id),
                          className: "w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition border border-amber-200 disabled:opacity-50",
                          children: [
                            "📧 ",
                            resendSentId === b.id ? t.resendPaymentSent : resendingId === b.id ? t.resendPaymentSending : t.resendPaymentBtn
                          ]
                        }
                      ),
                      b.status === "completed" && (b.payment_status === "paid" || b.stripe_paid) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          disabled: downloadingReceiptId === b.id,
                          onClick: () => downloadReceipt(b),
                          className: "w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200 disabled:opacity-50",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5" }),
                            downloadingReceiptId === b.id ? t.downloadReceiptDownloading : t.downloadReceiptBtn
                          ]
                        }
                      ),
                      b.status === "completed" && (b.payment_status === "paid" || b.stripe_paid) && b.email && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "button",
                          {
                            disabled: resendingReceiptId === b.id,
                            onClick: () => resendReceipt(b),
                            className: "w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200 disabled:opacity-50",
                            children: [
                              "📧 ",
                              resendReceiptSentId === b.id ? t.resendReceiptSent : resendingReceiptId === b.id ? t.resendReceiptSending : t.resendReceiptBtn
                            ]
                          }
                        ),
                        (b.receipt_resend_count ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-stone-500 text-center", children: [
                          t.receiptResentCount(b.receipt_resend_count ?? 0),
                          b.receipt_last_resent_at && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                            " · ",
                            t.receiptLastResentAt,
                            " ",
                            new Date(b.receipt_last_resent_at).toLocaleString(t.dateLocale, { dateStyle: "short", timeStyle: "short", timeZone: "America/Chicago" })
                          ] })
                        ] })
                      ] }),
                      b.status === "completed" && (b.payment_status === "paid" || b.stripe_paid) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-stone-200 bg-white", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "button",
                          {
                            type: "button",
                            onClick: () => toggleReceiptHistory(b.id),
                            className: "w-full flex items-center justify-between gap-2 px-2 py-1.5 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 rounded-lg",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                                "📜 ",
                                receiptHistoryOpen.has(b.id) ? t.receiptHistoryToggleHide : t.receiptHistoryToggleShow,
                                receiptHistory[b.id] && receiptHistory[b.id].length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center min-w-[1.25rem] px-1 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold", children: receiptHistory[b.id].length })
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `w-3.5 h-3.5 transition-transform ${receiptHistoryOpen.has(b.id) ? "rotate-180" : ""}` })
                            ]
                          }
                        ),
                        receiptHistoryOpen.has(b.id) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          ReceiptHistoryPanel,
                          {
                            rows: receiptHistory[b.id],
                            loading: receiptHistoryLoading.has(b.id),
                            error: receiptHistoryError[b.id],
                            t,
                            filters: getReceiptHistoryFilters(b.id),
                            onFiltersChange: (next) => updateReceiptHistoryFilters(b.id, next),
                            onExport: () => void exportReceiptHistory(b.id),
                            exporting: receiptHistoryExporting.has(b.id)
                          }
                        )
                      ] }),
                      b.assigned_employee_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-stone-400", children: [
                        "👤 ",
                        employees.find((e) => e.id === b.assigned_employee_id)?.name ?? b.assigned_employee_id.slice(0, 8)
                      ] }),
                      b.status === "completed" && b.assigned_employee_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => void recallBooking(b.id),
                          className: "w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition border border-purple-200",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5" }),
                            " ",
                            t.recallBtn
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "button",
                          {
                            onClick: () => openRestoreModal(b),
                            className: "flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all duration-150 hover:scale-105 border border-orange-100",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3.5 h-3.5" }),
                              " ",
                              t.restoreBtn2
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: () => setConfirmDelete({ id: b.id, name: b.name }),
                            className: "flex items-center justify-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition border border-red-200",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 rounded-lg border border-stone-200 bg-white", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => toggleAdminPhotos(b.id),
                          className: "w-full flex items-center justify-between gap-2 px-2 py-1.5 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 rounded-lg",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-3.5 h-3.5" }),
                              adminPhotosOpen.has(b.id) ? t.photosHide : t.photosShow,
                              adminPhotosData[b.id] && adminPhotosData[b.id].length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center min-w-[1.25rem] px-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold", children: adminPhotosData[b.id].length })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `w-3.5 h-3.5 transition-transform ${adminPhotosOpen.has(b.id) ? "rotate-180" : ""}` })
                          ]
                        }
                      ),
                      adminPhotosOpen.has(b.id) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 pb-3 space-y-2", children: [
                        adminPhotosLoading.has(b.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 italic px-1", children: t.loading }) : adminPhotosData[b.id]?.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 italic px-1", children: t.photosEmpty }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-1.5 mt-1", children: adminPhotosData[b.id]?.map((ph) => ph.url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "a",
                          {
                            href: ph.url,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "block aspect-square rounded-lg overflow-hidden border border-stone-200 hover:opacity-80 transition",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: ph.url, alt: "", className: "w-full h-full object-cover" })
                          },
                          ph.id
                        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-4 h-4 text-stone-300" }) }, ph.id)) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-stone-100 pt-2 mt-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold text-stone-500 mb-1", children: t.sigTitle }),
                          adminSigLoading.has(b.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 italic", children: t.loading }) : adminSigData[b.id] ? adminSigData[b.id].url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "a",
                            {
                              href: adminSigData[b.id].url,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              className: "block max-w-[180px] rounded-lg border border-stone-200 bg-white overflow-hidden hover:opacity-80 transition",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: adminSigData[b.id].url, alt: "signature", className: "w-full" })
                            }
                          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 italic", children: t.sigNone }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 italic", children: t.sigNone })
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 rounded-lg border border-stone-200 bg-white", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => toggleBookingCalls(b.id),
                          className: "w-full flex items-center justify-between gap-2 px-2 py-1.5 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 rounded-lg",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                              bookingCallsOpen.has(b.id) ? t.bookingCallsToggleHide : t.bookingCallsToggleShow,
                              bookingCallsData[b.id] && bookingCallsData[b.id].length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center min-w-[1.25rem] px-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold", children: bookingCallsData[b.id].length })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `w-3.5 h-3.5 transition-transform ${bookingCallsOpen.has(b.id) ? "rotate-180" : ""}` })
                          ]
                        }
                      ),
                      bookingCallsOpen.has(b.id) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 pb-2 space-y-1", children: [
                        bookingCallsLoading.has(b.id) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 italic px-1", children: t.bookingCallsLoading }),
                        !bookingCallsLoading.has(b.id) && (!bookingCallsData[b.id] || bookingCallsData[b.id].length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 italic px-1", children: t.bookingCallsEmpty }),
                        !bookingCallsLoading.has(b.id) && bookingCallsData[b.id]?.map((call) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 py-1.5 border-b border-stone-100 last:border-0", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-stone-500", children: [
                              new Date(call.created_at).toLocaleString(t.dateLocale, { dateStyle: "short", timeStyle: "short", timeZone: "America/Chicago" }),
                              call.duration_sec != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1", children: [
                                "· ",
                                call.duration_sec,
                                "s"
                              ] })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5", children: [
                              call.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-700", children: [
                                "✓ ",
                                t.callLogsStatusCompleted
                              ] }),
                              call.status === "no_booking" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-stone-100 text-stone-500", children: t.callLogsStatusNoBooking }),
                              call.status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-700", children: [
                                "⚠ ",
                                t.callLogsStatusError
                              ] })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "button",
                            {
                              type: "button",
                              onClick: () => void openBookingCallTranscript(call),
                              className: "flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 whitespace-nowrap flex-shrink-0",
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-2.5 h-2.5" }),
                                " ",
                                t.bookingCallsOpenTranscript
                              ]
                            }
                          )
                        ] }, String(call.id)))
                      ] })
                    ] })
                  ]
                }
              )
            ] }, b.id);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs border-collapse", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-stone-50 text-stone-500 border-b border-stone-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 w-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: allSelected,
                  readOnly: true,
                  onClick: allSelected ? deselectAll : selectAll,
                  className: "w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-semibold w-28", children: t.thVisitDate }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-left px-3 py-2 font-semibold", children: [
                t.thClient,
                " / ",
                t.thPhone
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-semibold w-32", children: t.thAppliance }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "text-left px-3 py-2 font-semibold w-40", children: [
                t.thStatus,
                employees.length > 0 ? ` / ${t.assignEmployee}` : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-semibold", children: t.thAction })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredBookings.map((b, i) => {
              const isHistory = b.status === "completed" || b.status === "cancelled";
              const isWA = /AM–|PM–|AM-|PM-/.test(b.preferred_time ?? "");
              const { cls: stCls, label: stLabel } = statusInfo(b.status);
              const createdStr = b.created_at ? new Date(b.created_at).toLocaleDateString(t.dateLocale, { day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "America/Chicago" }) : "—";
              const prevIsActive = i > 0 && (filteredBookings[i - 1].status === "pending" || filteredBookings[i - 1].status === "approved");
              const showSepRow = showCompleted && isHistory && (i === 0 || prevIsActive);
              const rowBg = highlightBookingId === b.id ? "bg-amber-50 ring-1 ring-inset ring-amber-300" : selectedIds.has(b.id) ? "bg-blue-50 ring-1 ring-inset ring-blue-300" : i % 2 === 0 ? "bg-white" : "bg-stone-50";
              const rowOpacity = isHistory && !selectedIds.has(b.id) && highlightBookingId !== b.id ? "opacity-50" : "";
              const detailBg = i % 2 === 0 ? "bg-white" : "bg-stone-50";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
                showSepRow && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-3 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-stone-200" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-stone-400 uppercase tracking-wide", children: t.historyLabel }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-stone-200" })
                ] }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { id: `booking-row-d-${b.id}`, className: `${rowBg} ${rowOpacity} hover:bg-blue-50 transition-colors cursor-default`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 pt-2 pb-1 align-top", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: selectedIds.has(b.id),
                      onChange: () => toggleSelect(b.id),
                      className: "w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 pt-2 pb-1 align-top", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-stone-700", children: b.preferred_date }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-stone-500 mt-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b.preferred_time }),
                      isWA && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700 leading-none", children: "WA" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 pt-2 pb-1 align-top", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 flex-wrap", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3 h-3 text-stone-400 shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-stone-700", children: b.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ${resolveBookingBiz(b.business_type) === "dental" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`, children: resolveBookingBiz(b.business_type) === "dental" ? t.bizDental : t.bizAppliance }),
                      b.is_remote && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-100 text-stone-500 leading-none", title: t.remoteBookingHint, children: "👁" }),
                      b.client_lang && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-700 leading-none uppercase",
                          title: b.client_lang === "es" ? t.clientLangEs : b.client_lang === "en" ? t.clientLangEn : b.client_lang,
                          children: b.client_lang
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `tel:${b.phone}`, className: "flex items-center gap-1", style: { color: ACCENT$4 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-3 h-3" }),
                        b.phone
                      ] }),
                      b.phone && (genderPickerId === b.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: () => {
                              void handleCallback(b.phone, b.id, b.name, b.client_lang ?? "en", "male");
                              setGenderPickerId(null);
                            },
                            title: "Клиент — мужчина",
                            className: "text-xs px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold leading-none",
                            children: "♂"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: () => {
                              void handleCallback(b.phone, b.id, b.name, b.client_lang ?? "en", "female");
                              setGenderPickerId(null);
                            },
                            title: "Клиент — женщина",
                            className: "text-xs px-1.5 py-0.5 rounded bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold leading-none",
                            children: "♀"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: () => setGenderPickerId(null),
                            className: "text-[10px] text-stone-400 hover:text-stone-600 leading-none px-0.5",
                            children: "✕"
                          }
                        )
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => setGenderPickerId(b.id),
                          disabled: callbackLoading.has(b.id),
                          title: "Перезвонить клиенту — выберите пол",
                          className: "p-0.5 rounded hover:bg-blue-50 transition-colors disabled:opacity-50",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneOutgoing, { className: "w-3 h-3", style: { color: ACCENT$4 } })
                        }
                      )),
                      b.status === "completed" && b.phone && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => void handleSendReview(b.id),
                          disabled: reviewLoading.has(b.id),
                          title: "Отправить ссылку на Google Review по SMS",
                          className: "p-0.5 rounded hover:bg-yellow-50 transition-colors disabled:opacity-50",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-3 h-3", style: { color: reviewLoading.has(b.id) ? "#aaa" : "#f59e0b" } })
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 pt-2 pb-1 align-top text-stone-600", children: b.appliance || "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 pt-2 pb-1 align-top", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${stCls}`, children: stLabel }),
                    employees.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: b.status === "pending" || b.status === "approved" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "select",
                      {
                        value: b.assigned_employee_id ?? "",
                        onChange: (e) => assignEmployee(b.id, e.target.value || null),
                        className: "border border-stone-200 rounded-lg px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white max-w-[130px]",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: t.notAssigned }),
                          employees.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: e.id, children: e.name }, e.id))
                        ]
                      }
                    ) : b.assigned_employee_id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-stone-500", children: [
                      "👤 ",
                      employees.find((e) => e.id === b.assigned_employee_id)?.name ?? "—"
                    ] }) : null })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 pt-2 pb-1 align-top", children: [
                    (b.status === "pending" || b.status === "approved") && !b.is_remote && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-2 gap-y-1 items-center text-xs", children: [
                      b.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => approveBooking(b.id),
                          className: "flex items-center gap-0.5 text-green-600 hover:text-green-800 font-semibold transition",
                          title: t.titleApprove,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "w-3 h-3" }),
                            " ",
                            t.approveBtn
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => openEditModal(b),
                          className: "flex items-center gap-0.5 text-violet-600 hover:text-violet-800 font-semibold transition",
                          title: t.titleEdit,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3 h-3" }),
                            " ",
                            t.editBtn
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => openReschedule(b),
                          className: "flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-semibold transition",
                          title: t.titleReschedule,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "w-3 h-3" }),
                            " ",
                            t.rescheduleBtn
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => setConfirmComplete({ id: b.id, name: b.name }),
                          className: "flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-semibold transition",
                          title: t.titleComplete,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
                            " ",
                            t.completeBtn
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => openAdminEstimate({ id: b.id, name: b.name, email: b.email ?? "", phone: b.phone ?? "" }),
                          className: "flex items-center gap-0.5 text-teal-600 hover:text-teal-800 font-semibold transition",
                          children: [
                            "📋 ",
                            t.estimateBtn
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => setConfirmCancel({ id: b.id, name: b.name, time: b.preferred_time }),
                          className: "flex items-center gap-0.5 text-red-500 hover:text-red-700 font-semibold transition",
                          title: t.titleCancel,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3 h-3" }),
                            " ",
                            t.cancelBtn
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => setConfirmDelete({ id: b.id, name: b.name }),
                          className: "flex items-center gap-0.5 text-amber-600 hover:text-amber-800 font-semibold transition",
                          title: t.moveToTrashTitle,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }),
                            " ",
                            t.moveToTrashBtn
                          ]
                        }
                      )
                    ] }),
                    (b.status === "cancelled" || b.status === "completed") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => openRestoreModal(b),
                          className: "flex items-center gap-1 font-semibold transition-all duration-150 hover:scale-110 origin-left",
                          style: { color: "#f97316" },
                          title: t.titleRestore,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3.5 h-3.5" }),
                            " ",
                            t.restoreBtn2
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-stone-300", children: "|" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          onClick: () => setConfirmDelete({ id: b.id, name: b.name }),
                          className: "flex items-center gap-1 text-amber-600 hover:text-amber-800 font-semibold transition",
                          title: t.moveToTrashTitle,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }),
                            " ",
                            t.moveToTrashBtn
                          ]
                        }
                      )
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `${detailBg} ${rowOpacity} border-b border-stone-100`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pb-2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "pb-2 text-[10px] text-stone-400 align-top pt-0.5", children: [
                    t.thCreated,
                    ": ",
                    createdStr
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, className: "pb-2 pr-3 align-top pt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-0.5", children: [
                    b.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 text-[10px] text-stone-400", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-2.5 h-2.5 shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: b.address, children: b.address })
                    ] }),
                    b.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-3 h-3 text-stone-400 flex-shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${b.email}`, className: "text-[11px] text-stone-500 hover:text-blue-600 transition", children: b.email })
                    ] }),
                    adminEstimateHistory[b.id] && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-blue-700 font-bold", children: [
                        "$",
                        Number(adminEstimateHistory[b.id].total).toFixed(2)
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => openAdminEstimate({ id: b.id, name: b.name, email: b.email ?? "", phone: b.phone ?? "" }, adminEstimateHistory[b.id]),
                          className: "text-[10px] font-bold text-blue-600 hover:underline whitespace-nowrap",
                          children: t.estimateEditBtn
                        }
                      )
                    ] }),
                    b.status === "completed" && (b.payment_method || b.payment_amount != null || b.payment_status) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-green-700 font-semibold flex items-center gap-1 flex-wrap", children: [
                      b.payment_amount != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "$",
                        b.payment_amount
                      ] }),
                      b.payment_status === "paid" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.payStatusPaid }),
                      b.payment_status === "unpaid" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600", children: t.payStatusUnpaid }),
                      b.payment_status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600", children: t.payStatusPending }),
                      b.payment_status === "cash" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-stone-600", children: t.payStatusCash })
                    ] }),
                    b.status === "completed" && b.client_signed_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-purple-700 font-semibold flex items-center gap-1", children: [
                      "✍️ ",
                      t.clientSigned
                    ] }),
                    b.status === "completed" && b.payment_status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        disabled: resendingId === b.id,
                        onClick: () => resendPaymentLink(b.id),
                        className: "flex items-center gap-1 text-[10px] font-semibold text-amber-700 hover:text-amber-900 transition disabled:opacity-50",
                        children: [
                          "📧 ",
                          resendSentId === b.id ? t.resendPaymentSent : resendingId === b.id ? t.resendPaymentSending : t.resendPaymentBtn
                        ]
                      }
                    ),
                    b.status === "completed" && (b.payment_status === "paid" || b.stripe_paid) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        disabled: downloadingReceiptId === b.id,
                        onClick: () => downloadReceipt(b),
                        className: "flex items-center gap-1 text-[10px] font-semibold text-blue-700 hover:text-blue-900 transition disabled:opacity-50",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3 h-3" }),
                          downloadingReceiptId === b.id ? t.downloadReceiptDownloading : t.downloadReceiptBtn
                        ]
                      }
                    ),
                    b.status === "completed" && (b.payment_status === "paid" || b.stripe_paid) && b.email && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          disabled: resendingReceiptId === b.id,
                          onClick: () => resendReceipt(b),
                          className: "flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 transition disabled:opacity-50",
                          children: [
                            "📧 ",
                            resendReceiptSentId === b.id ? t.resendReceiptSent : resendingReceiptId === b.id ? t.resendReceiptSending : t.resendReceiptBtn
                          ]
                        }
                      ),
                      (b.receipt_resend_count ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        {
                          className: "text-[10px] text-stone-500",
                          title: b.receipt_last_resent_at ? new Date(b.receipt_last_resent_at).toLocaleString(t.dateLocale, { timeZone: "America/Chicago" }) : void 0,
                          children: [
                            t.receiptResentCount(b.receipt_resend_count ?? 0),
                            b.receipt_last_resent_at && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                              " · ",
                              t.receiptLastResentAt,
                              " ",
                              new Date(b.receipt_last_resent_at).toLocaleString(t.dateLocale, { dateStyle: "short", timeStyle: "short", timeZone: "America/Chicago" })
                            ] })
                          ]
                        }
                      )
                    ] }),
                    b.status === "completed" && (b.payment_status === "paid" || b.stripe_paid) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => toggleReceiptHistory(b.id),
                          className: "flex items-center gap-1 text-[10px] font-semibold text-stone-600 hover:text-stone-900 transition",
                          children: [
                            "📜 ",
                            receiptHistoryOpen.has(b.id) ? t.receiptHistoryToggleHide : t.receiptHistoryToggleShow,
                            receiptHistory[b.id] && receiptHistory[b.id].length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center min-w-[1rem] px-1 rounded-full bg-stone-200 text-stone-700 text-[9px] font-bold", children: receiptHistory[b.id].length }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `w-3 h-3 transition-transform ${receiptHistoryOpen.has(b.id) ? "rotate-180" : ""}` })
                          ]
                        }
                      ),
                      receiptHistoryOpen.has(b.id) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 max-w-[360px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        ReceiptHistoryPanel,
                        {
                          rows: receiptHistory[b.id],
                          loading: receiptHistoryLoading.has(b.id),
                          error: receiptHistoryError[b.id],
                          t,
                          filters: getReceiptHistoryFilters(b.id),
                          onFiltersChange: (next) => updateReceiptHistoryFilters(b.id, next),
                          onExport: () => void exportReceiptHistory(b.id),
                          exporting: receiptHistoryExporting.has(b.id)
                        }
                      ) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => toggleAdminPhotos(b.id),
                          className: "flex items-center gap-1 text-[10px] font-semibold text-stone-600 hover:text-stone-900 transition",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-3 h-3" }),
                            adminPhotosOpen.has(b.id) ? t.photosHide : t.photosShow,
                            adminPhotosData[b.id] && adminPhotosData[b.id].length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center min-w-[1rem] px-1 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold", children: adminPhotosData[b.id].length }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `w-3 h-3 transition-transform ${adminPhotosOpen.has(b.id) ? "rotate-180" : ""}` })
                          ]
                        }
                      ),
                      adminPhotosOpen.has(b.id) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 max-w-[360px] space-y-2", children: [
                        adminPhotosLoading.has(b.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 italic", children: t.loading }) : adminPhotosData[b.id]?.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 italic", children: t.photosEmpty }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-1", children: adminPhotosData[b.id]?.map((ph) => ph.url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "a",
                          {
                            href: ph.url,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "block aspect-square rounded overflow-hidden border border-stone-200 hover:opacity-80 transition",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: ph.url, alt: "", className: "w-full h-full object-cover" })
                          },
                          ph.id
                        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded bg-stone-100 border border-stone-200 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-3 h-3 text-stone-300" }) }, ph.id)) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-stone-100 pt-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] font-semibold text-stone-500 mb-1", children: t.sigTitle }),
                          adminSigLoading.has(b.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 italic", children: t.loading }) : adminSigData[b.id] ? adminSigData[b.id].url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "a",
                            {
                              href: adminSigData[b.id].url,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              className: "block max-w-[160px] rounded border border-stone-200 bg-white overflow-hidden hover:opacity-80 transition",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: adminSigData[b.id].url, alt: "signature", className: "w-full" })
                            }
                          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 italic", children: t.sigNone }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 italic", children: t.sigNone })
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => toggleBookingCalls(b.id),
                          className: "flex items-center gap-1 text-[10px] font-semibold text-stone-600 hover:text-stone-900 transition",
                          children: [
                            "📞 ",
                            bookingCallsOpen.has(b.id) ? t.bookingCallsToggleHide : t.bookingCallsToggleShow,
                            bookingCallsData[b.id] && bookingCallsData[b.id].length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center min-w-[1rem] px-1 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold", children: bookingCallsData[b.id].length }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `w-3 h-3 transition-transform ${bookingCallsOpen.has(b.id) ? "rotate-180" : ""}` })
                          ]
                        }
                      ),
                      bookingCallsOpen.has(b.id) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 max-w-[360px] space-y-1", children: [
                        bookingCallsLoading.has(b.id) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 italic", children: t.bookingCallsLoading }),
                        !bookingCallsLoading.has(b.id) && (!bookingCallsData[b.id] || bookingCallsData[b.id].length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-stone-400 italic", children: t.bookingCallsEmpty }),
                        !bookingCallsLoading.has(b.id) && bookingCallsData[b.id]?.map((call) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 py-1 border-b border-stone-100 last:border-0", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-stone-500", children: [
                              new Date(call.created_at).toLocaleString(t.dateLocale, { dateStyle: "short", timeStyle: "short", timeZone: "America/Chicago" }),
                              call.duration_sec != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1", children: [
                                "· ",
                                call.duration_sec,
                                "s"
                              ] })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                              call.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-1 py-0.5 rounded-full text-[8px] font-bold bg-green-100 text-green-700", children: [
                                "✓ ",
                                t.callLogsStatusCompleted
                              ] }),
                              call.status === "no_booking" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-1 py-0.5 rounded-full text-[8px] font-bold bg-stone-100 text-stone-500", children: t.callLogsStatusNoBooking }),
                              call.status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-1 py-0.5 rounded-full text-[8px] font-bold bg-red-100 text-red-700", children: [
                                "⚠ ",
                                t.callLogsStatusError
                              ] })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            "button",
                            {
                              type: "button",
                              onClick: () => void openBookingCallTranscript(call),
                              className: "flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 whitespace-nowrap flex-shrink-0",
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-2 h-2" }),
                                " ",
                                t.bookingCallsOpenTranscript
                              ]
                            }
                          )
                        ] }, String(call.id)))
                      ] })
                    ] })
                  ] }) })
                ] })
              ] }, b.id);
            }) })
          ] }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-stone-100 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Fingerprint, { className: "w-5 h-5", style: { color: ACCENT$4 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-stone-800 text-base", children: t.fidSectionTitle })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: loadCredentials,
            disabled: loadingCredentials,
            className: "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-3.5 h-3.5 ${loadingCredentials ? "animate-spin" : ""}` }),
              t.fidRefreshBtn
            ]
          }
        )
      ] }),
      credentialsError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center py-8 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-500", children: credentialsError }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: loadCredentials, className: "text-xs font-semibold underline", style: { color: ACCENT$4 }, children: t.fidTryAgain })
      ] }) : loadingCredentials && faceIdCredentials.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-stone-400 py-4 text-center", children: t.fidLoading }) : faceIdCredentials.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center py-8 gap-2 text-stone-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Fingerprint, { className: "w-10 h-10 opacity-20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: t.fidEmpty })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-stone-100", children: faceIdCredentials.map((cred) => {
        const registeredDate = new Date(cred.created_at).toLocaleDateString(t.dateLocale, {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "America/Chicago"
        });
        const registeredTime = new Date(cred.created_at).toLocaleTimeString(t.dateLocale, {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/Chicago"
        });
        const isRenaming = renamingCredentialId === cred.id;
        const justRenamed = renamedCredentialId === cred.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", style: { background: "#EFF6FF" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Fingerprint, { className: "w-4 h-4", style: { color: ACCENT$4 } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-stone-800 truncate", children: cred.label || t.fidDevice }),
                  justRenamed && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full transition-opacity", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
                    t.fidRenamed
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-stone-400", children: [
                  registeredDate,
                  " ",
                  t.fidAt,
                  " ",
                  registeredTime
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => isRenaming ? cancelRename() : startRename(cred),
                  disabled: removingCredentialId === cred.id || renameSaving,
                  className: "flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-700 transition disabled:opacity-50 px-2 py-1 rounded-lg hover:bg-stone-50",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }),
                    isRenaming ? t.fidCancelBtn : t.fidRenameBtn
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => {
                    setRemoveCredentialError(null);
                    setConfirmRemoveCredential(cred);
                  },
                  disabled: removingCredentialId === cred.id || isRenaming,
                  className: "flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition disabled:opacity-50 px-2 py-1 rounded-lg hover:bg-red-50",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }),
                    t.fidRemoveBtn
                  ]
                }
              )
            ] })
          ] }),
          isRenaming && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 ml-11 flex flex-col gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: renameLabel,
                  onChange: (e) => setRenameLabel(e.target.value),
                  onKeyDown: (e) => {
                    if (e.key === "Enter") saveRename(cred.id);
                    if (e.key === "Escape") cancelRename();
                  },
                  autoFocus: true,
                  placeholder: t.fidDevicePlaceholder,
                  className: "flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2",
                  style: { "--tw-ring-color": ACCENT$4 }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => saveRename(cred.id),
                  disabled: renameSaving,
                  className: "flex items-center gap-1 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50",
                  style: { background: ACCENT$4 },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5" }),
                    renameSaving ? t.fidSaving : t.fidSave
                  ]
                }
              )
            ] }),
            renameError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-500", children: renameError })
          ] })
        ] }, cred.id);
      }) })
    ] }) }),
    confirmRemoveCredential && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Fingerprint, { className: "w-5 h-5 text-red-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-stone-800", children: t.fidRemoveTitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-stone-600 mb-1", children: [
        t.fidRemoveDevice,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: confirmRemoveCredential.label || t.fidDevice })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-stone-400 mb-4", children: t.fidRemoveInfo }),
      removeCredentialError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-500 mb-3", children: removeCredentialError }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setConfirmRemoveCredential(null);
              setRemoveCredentialError(null);
            },
            className: "flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition",
            children: t.fidCancelBtn
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: removeCredential,
            disabled: removingCredentialId !== null,
            className: "flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-60",
            children: removingCredentialId !== null ? t.fidRemoving : t.fidRemoveYes
          }
        )
      ] })
    ] }) }),
    stripeModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-stone-800 flex items-center gap-1.5", children: [
          "💳 ",
          t.stripePayLink
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setStripeModal(null);
              setStripeLink(null);
              setStripeErr(null);
            },
            className: "text-stone-400 hover:text-stone-600",
            children: "✕"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-stone-500 mb-3", children: stripeModal.name }),
      !stripeLink ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.stripeAmount }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            min: "0",
            step: "0.01",
            value: stripeModal.amount,
            onChange: (e) => setStripeModal((p) => p ? { ...p, amount: e.target.value } : null),
            placeholder: "0.00",
            className: "w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 mb-3",
            style: { "--tw-ring-color": ACCENT$4 }
          }
        ),
        stripeErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-500 mb-2", children: stripeErr }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: generatePaymentLink,
            disabled: stripeLoading || !stripeModal.amount,
            className: "w-full py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50",
            style: { background: ACCENT$4 },
            children: stripeLoading ? t.stripeGenerating : t.stripeGenLink
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-xl p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700 font-bold mb-1", children: [
            "✅ ",
            t.stripeSendLink
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-600 break-all", children: stripeLink })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: copyStripeLink,
            className: "w-full py-2.5 rounded-xl font-bold text-sm border",
            style: stripeCopied ? { background: "#16a34a", color: "white", borderColor: "#16a34a" } : { background: "white", color: ACCENT$4, borderColor: ACCENT$4 },
            children: stripeCopied ? t.stripeCopied : "📋 Copy Link"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: stripeLink,
            target: "_blank",
            rel: "noreferrer",
            className: "block w-full py-2.5 rounded-xl text-white font-bold text-sm text-center transition",
            style: { background: ACCENT$4 },
            children: "Open Link ↗"
          }
        )
      ] })
    ] }) }),
    (bookingCallTranscript || bookingCallTranscriptLoading) && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4",
        style: { background: "rgba(0,0,0,0.45)" },
        onClick: () => {
          if (!bookingCallTranscriptLoading) setBookingCallTranscript(null);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b border-stone-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-stone-800 text-sm", children: t.callLogsTranscriptTitle }),
                  bookingCallTranscript && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-stone-400 mt-0.5", children: [
                    bookingCallTranscript.phone ?? "—",
                    bookingCallTranscript.client_name ? ` · ${bookingCallTranscript.client_name}` : ""
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setBookingCallTranscript(null),
                    className: "p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-4 py-4 space-y-2", children: [
                bookingCallTranscriptLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-5 h-5 animate-spin text-stone-300" }) }),
                !bookingCallTranscriptLoading && bookingCallTranscript && (() => {
                  const lines = bookingCallTranscript.transcript.split("\n").map((l) => l.trim()).filter(Boolean);
                  if (lines.length === 0) {
                    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-stone-400 text-center py-8", children: t.callLogsTranscriptEmpty });
                  }
                  return lines.map((line, idx) => {
                    const isAgent = line.startsWith("Agent:");
                    const isCustomer = line.startsWith("Customer:");
                    const text = isAgent ? line.slice("Agent:".length).trim() : isCustomer ? line.slice("Customer:".length).trim() : line;
                    const label = isAgent ? t.callLogsTranscriptAgent : isCustomer ? t.callLogsTranscriptCustomer : null;
                    if (isAgent) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-start gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold", style: { background: ACCENT$4 }, children: "AI" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[80%]", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-stone-400 mb-0.5 font-semibold", children: label }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-50 text-stone-800 text-xs rounded-2xl rounded-tl-sm px-3 py-2 leading-relaxed", children: text })
                      ] })
                    ] }, idx);
                    if (isCustomer) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[80%] text-right", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-stone-400 mb-0.5 font-semibold", children: label }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-stone-100 text-stone-800 text-xs rounded-2xl rounded-tr-sm px-3 py-2 leading-relaxed", children: text })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-[9px] font-bold", children: "C" })
                    ] }, idx);
                    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[10px] text-stone-400 italic py-1", children: text }, idx);
                  });
                })()
              ] })
            ]
          }
        )
      }
    ),
    adminEstimateTarget && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-5 border-b border-stone-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-base text-stone-800", children: adminEstimateIsEdit ? t.estimateEditTitle : t.estimateTitle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setAdminEstimateTarget(null), className: "p-1.5 rounded-full hover:bg-stone-100 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-stone-500" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-5 space-y-4", children: adminEstimateDone ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl mb-3", children: "✅" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-green-700", children: t.estimateSuccess })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-stone-50 rounded-lg p-3 text-sm space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: adminEstimateTarget.name }),
          adminEstimateTarget.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-stone-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-3 h-3 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: adminEstimateTarget.email })
          ] }),
          adminEstimateTarget.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-stone-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-3 h-3 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: adminEstimateTarget.phone })
          ] }),
          !adminEstimateTarget.email && !adminEstimateTarget.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-red-600 mt-1", children: "⚠ Нет ни email, ни телефона — смету невозможно отправить. Добавьте контактные данные в заказ." }),
          !adminEstimateTarget.email && adminEstimateTarget.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-amber-600 mt-1", children: "⚠ Email не указан — отправка по email невозможна. Добавьте email в заказ." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-stone-500", children: t.estimateItems }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setAdminEstimateItems((prev) => [...prev, { description: "", category: "Labor", qty: 1, unit_price: "" }]),
                className: "text-xs font-bold text-blue-600 hover:text-blue-800",
                children: t.addItem
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: adminEstimateItems.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-stone-50 rounded-lg p-2.5 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: item.description,
                  onChange: (e) => setAdminEstimateItems((prev) => prev.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x)),
                  placeholder: t.itemDesc,
                  className: "flex-1 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setAdminEstimateItems((prev) => prev.filter((_, idx) => idx !== i)),
                  className: "px-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-xs font-bold",
                  children: "✕"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: item.category,
                  onChange: (e) => setAdminEstimateItems((prev) => prev.map((x, idx) => idx === i ? { ...x, category: e.target.value } : x)),
                  className: "border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Labor", children: "Labor" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Part", children: "Part" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Material", children: "Material" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  min: "1",
                  step: "1",
                  value: item.qty,
                  onChange: (e) => setAdminEstimateItems((prev) => prev.map((x, idx) => idx === i ? { ...x, qty: Math.max(1, parseInt(e.target.value) || 1) } : x)),
                  placeholder: t.itemQty,
                  className: "border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 top-2 text-stone-400 text-xs", children: "$" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    inputMode: "decimal",
                    value: item.unit_price,
                    placeholder: "0.00",
                    onChange: (e) => setAdminEstimateItems((prev) => prev.map((x, idx) => idx === i ? { ...x, unit_price: e.target.value.replace(/[^\d.,]/g, "") } : x)),
                    className: "w-full border border-stone-200 rounded-lg pl-5 pr-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                  }
                )
              ] })
            ] })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer select-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: adminEstimateNoTax, onChange: (e) => setAdminEstimateNoTax(e.target.checked), className: "w-4 h-4 accent-green-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-green-700", children: t.noTax })
        ] }),
        (() => {
          const labor = adminEstimateItems.filter((i) => i.category === "Labor").reduce((s, i) => s + i.qty * (parseFloat(String(i.unit_price).replace(",", ".")) || 0), 0);
          const parts = adminEstimateItems.filter((i) => i.category !== "Labor").reduce((s, i) => s + i.qty * (parseFloat(String(i.unit_price).replace(",", ".")) || 0), 0);
          const tax = adminEstimateNoTax ? 0 : (labor + parts) * 0.0825;
          const total = labor + parts + tax;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 rounded-lg p-3 space-y-1 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-stone-600", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.estimateSubtotal }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "$",
                (labor + parts).toFixed(2)
              ] })
            ] }),
            adminEstimateNoTax ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-semibold text-green-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.estimateTaxLine }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "$0.00 ✓" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-stone-600", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.estimateTaxLine }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "$",
                tax.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold text-blue-800 text-sm pt-1 border-t border-blue-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.estimateTotalLine }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "$",
                total.toFixed(2)
              ] })
            ] })
          ] });
        })(),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-1", children: t.estimateNotes }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: adminEstimateNotes,
              onChange: (e) => setAdminEstimateNotes(e.target.value),
              placeholder: t.estimateNotesPlaceholder,
              className: "w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none min-h-[60px]"
            }
          )
        ] }),
        (adminEstimateTarget.email || adminEstimateTarget.phone) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-stone-500 mb-2", children: t.notifyMethod ?? "Способ отправки" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: ["email", "sms", "both"].map((m) => {
            const disabled = (m === "email" || m === "both") && !adminEstimateTarget.email || m === "sms" && !adminEstimateTarget.phone;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => !disabled && setAdminEstimateNotify(m),
                disabled,
                className: `flex-1 py-2 rounded-lg text-xs font-bold transition border ${adminEstimateNotify === m ? "border-teal-500 bg-teal-50 text-teal-700" : disabled ? "border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed" : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50"}`,
                children: m === "email" ? "✉️ Email" : m === "sms" ? "📱 SMS" : "✉️+📱 " + (t.viaBoth ?? "Оба")
              },
              m
            );
          }) })
        ] }),
        adminEstimateErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 text-center", children: adminEstimateErr }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setAdminEstimateTarget(null),
              className: "flex-1 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition",
              children: t.cancel
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => void handleAdminEstimate(),
              disabled: adminEstimateSending || !adminEstimateTarget.email && !adminEstimateTarget.phone,
              title: !adminEstimateTarget.email && !adminEstimateTarget.phone ? "Добавьте email или телефон в заказ" : "",
              className: "flex-1 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition disabled:opacity-50",
              children: adminEstimateSending ? t.estimateSending : t.estimateSend
            }
          )
        ] })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 pb-8 text-center space-y-1 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", style: { color: "#dc2626" }, children: "Database developed by Eivaz Rakhmanov 2026" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", style: { color: "#16a34a" }, children: "База данных разработана Эйвазом Рахмановым в 2026 году" })
    ] })
  ] });
}
function AdminPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLangProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminDashboard, {}) });
}
const translations = {
  en: {
    title: "Technician Dashboard",
    phone: "Phone",
    pin: "PIN",
    signIn: "Sign In",
    signingIn: "Signing in...",
    invalidLogin: "Invalid phone or PIN",
    connError: "Connection error",
    hello: "Hello,",
    logout: "Logout",
    myJobs: "Dental Service Jobs",
    payroll: "Payroll",
    profile: "Profile",
    refresh: "Refresh",
    noJobs: "No assigned jobs yet",
    completed: "Completed",
    pending: "Pending",
    confirmed: "Confirmed",
    bizAppliance: "Appliance",
    bizDental: "Dental",
    done: "Done",
    paid: "Paid",
    cancelled: "Cancelled",
    period: "Period",
    jobsCount: "Jobs",
    gross: "Gross",
    deductions: "Deductions",
    net: "Net",
    noPayroll: "No payroll records yet",
    car: "Car",
    plate: "Plate",
    closeJob: "Close Job",
    downloadReceipt: "Download Receipt",
    generating: "Generating...",
    repairAmount: "Repair Amount ($)",
    workPerformed: "Work Performed",
    workPlaceholder: "Describe what was done...",
    partsReplaced: "Parts Replaced",
    addPart: "+ Add Part",
    paymentMethod: "Payment Method",
    cash: "Cash",
    zelle: "Zelle",
    tapToPay: "Tap to Pay",
    openStripeApp: "Open Stripe Dashboard",
    tapToPayInstruction: "Open the Stripe Dashboard app → create a payment → tap client's card",
    zelleInfo: "Send to: htrgroupllc@gmail.com",
    openPaymentLink: "Open Payment Link",
    online: "Online (Stripe)",
    clientReceiptLang: "Client Receipt Language",
    cancel: "Cancel",
    submit: "Submit",
    repairAmountReq: "Repair Amount is required",
    workPerformedReq: "Work Performed is required",
    errorClosing: "Error closing job",
    address: "Address",
    appliance: "Dental Equipment",
    brandModel: "Brand/Model",
    date: "Date",
    time: "Time",
    notes: "Notes",
    call: "Call",
    smsAction: "SMS",
    emailAction: "Email",
    navigate: "Navigate",
    receiptError: "Could not generate receipt. Please try again.",
    noProfile: "Loading profile...",
    estimateSent: "Estimate sent",
    estimateEdit: "Edit & Resend",
    estimateEditTitle: "Edit Estimate",
    sendEstimate: "Send Estimate",
    estimateTitle: "Create Estimate",
    estimateItems: "Service Items",
    addItem: "+ Add Item",
    itemDesc: "Description",
    itemCat: "Category",
    itemQty: "Qty",
    itemPrice: "Price ($)",
    estimateNotes: "Notes (optional)",
    estimateNotesPlaceholder: "Additional notes for the client...",
    estimateSend: "Send to Client",
    estimateSending: "Sending...",
    estimateSuccess: "Estimate sent!",
    estimateErr: "Error sending estimate",
    noTax: "No tax (discount)",
    estimateSubtotal: "Subtotal",
    estimateTaxLine: "Tax (8.25%)",
    estimateTotalLine: "Total",
    fromPricebook: "From Pricebook",
    customItem: "Custom",
    partsCost: "Parts Cost (actual, for reports $)",
    partsCostHint: "Internal only — not shown to client",
    searchJobs: "Search by name, phone, date, address…",
    searchClear: "Clear",
    tabActive: "Active",
    archiveJob: "Move to Archive",
    restore: "Restore",
    archived: "Archived",
    noArchived: "No archived jobs",
    archiving: "Archiving...",
    restoring: "Restoring...",
    sendReview: "⭐ Request Review",
    sendingReview: "Sending...",
    reviewSent: "Review link sent!",
    notifyMethod: "Send Payment Link Via",
    viaEmail: "Email",
    viaSMS: "SMS",
    viaBoth: "Both",
    clientContact: "Client Contact",
    noContactInfo: "No contact info on file",
    noNotificationWillBeSent: "no notification will be sent",
    statsClosed: "Total Closed",
    statsRevenue: "Total Revenue",
    statsMonth: "This Month",
    statsMonthRev: "This Month $",
    statsWeek: "This Week",
    statsWeekJobs: "jobs this week",
    statsWeekLabor: "Labor",
    statsWeekParts: "Parts",
    statsWeekTax: "Tax (8.25%)",
    statsWeekNet: "Your net",
    statsJobs: "jobs",
    statsTab: "Stats",
    faceIdFailed: "Face ID failed. Enter password.",
    faceIdRegFailed: "Could not enable Face ID",
    fidEnableTitle: "Enable Face ID?",
    fidEnableDesc: "Sign in with one touch, no password needed.\nYour face / fingerprint never leaves your device.",
    fidEnable: "Enable Face ID / Fingerprint",
    fidRegistering: "Registering...",
    fidSkip: "Skip",
    fidSignIn: "Sign in with Face ID",
    fidChecking: "Checking...",
    fidUsePassword: "Sign in with password",
    photosBtn: "📷 Photos",
    photoModal: "Job Photos",
    photoAdd: "Take Photo",
    photoGallery: "Choose from Gallery (up to 10)",
    photoLoading: "Loading...",
    photoNone: "No photos yet",
    photoDelete: "Delete",
    photoUploadFail: "Upload failed",
    sigTitle: "Client Signature",
    sigClear: "Clear",
    sigDraw: "Sign here (optional)",
    sigConsentText: "By signing, the client authorizes HTR Dental to perform the described repairs. Electronic signature valid under Texas law (TUETA).",
    sigOptional: "(optional)",
    editEmail: "Edit Email",
    emailSaved: "Email saved",
    emailSaveErr: "Error saving email",
    addEmail: "Add Email"
  },
  ru: {
    title: "Портал сотрудника",
    phone: "Телефон",
    pin: "ПИН-код",
    signIn: "Войти",
    signingIn: "Вход...",
    invalidLogin: "Неверный телефон или ПИН",
    connError: "Ошибка соединения",
    hello: "Привет,",
    logout: "Выйти",
    myJobs: "Мои заказы",
    payroll: "Зарплата",
    profile: "Профиль",
    refresh: "Обновить",
    noJobs: "Назначенных заказов пока нет",
    completed: "Завершено",
    pending: "Ожидает",
    confirmed: "Подтверждено",
    bizAppliance: "Appliance",
    bizDental: "Dental",
    done: "Готово",
    paid: "Оплачено",
    cancelled: "Отменено",
    period: "Период",
    jobsCount: "Заказов",
    gross: "Всего",
    deductions: "Вычеты",
    net: "К выплате",
    noPayroll: "Записей о зарплате пока нет",
    car: "Авто",
    plate: "Номер",
    closeJob: "Закрыть заказ",
    downloadReceipt: "Скачать чек",
    generating: "Создание...",
    repairAmount: "Сумма ремонта ($)",
    workPerformed: "Выполненная работа",
    workPlaceholder: "Опишите, что было сделано...",
    partsReplaced: "Замененные детали",
    addPart: "+ Добавить деталь",
    paymentMethod: "Способ оплаты",
    cash: "Наличные",
    zelle: "Zelle",
    tapToPay: "Tap to Pay",
    openStripeApp: "Открыть Stripe Dashboard",
    tapToPayInstruction: "Откройте Stripe Dashboard → создайте платёж → поднесите карту клиента",
    zelleInfo: "Отправить: htrgroupllc@gmail.com",
    openPaymentLink: "Открыть ссылку оплаты",
    online: "Онлайн (Stripe)",
    clientReceiptLang: "Язык чека клиента",
    cancel: "Отмена",
    submit: "Отправить",
    repairAmountReq: "Сумма ремонта обязательна",
    workPerformedReq: "Описание работы обязательно",
    errorClosing: "Ошибка при закрытии заказа",
    address: "Адрес",
    appliance: "Техника",
    brandModel: "Марка/Модель",
    date: "Дата",
    time: "Время",
    notes: "Заметки",
    call: "Позвонить",
    smsAction: "SMS",
    emailAction: "Email",
    navigate: "Маршрут",
    receiptError: "Не удалось создать чек. Попробуйте еще раз.",
    noProfile: "Загрузка профиля...",
    estimateSent: "Смета отправлена",
    estimateEdit: "Изменить и отправить",
    estimateEditTitle: "Редактировать смету",
    sendEstimate: "Отправить смету",
    estimateTitle: "Создать смету",
    estimateItems: "Позиции услуг",
    addItem: "+ Добавить позицию",
    itemDesc: "Описание",
    itemCat: "Категория",
    itemQty: "Кол-во",
    itemPrice: "Цена ($)",
    estimateNotes: "Заметки (необязательно)",
    estimateNotesPlaceholder: "Дополнительные заметки для клиента...",
    estimateSend: "Отправить клиенту",
    estimateSending: "Отправляем...",
    estimateSuccess: "Смета отправлена!",
    estimateErr: "Ошибка отправки сметы",
    noTax: "Без налога (скидка)",
    estimateSubtotal: "Подытог",
    estimateTaxLine: "Налог (8.25%)",
    estimateTotalLine: "Итого",
    fromPricebook: "Из прайс-листа",
    customItem: "Своё",
    partsCost: "Стоимость запчастей (факт., для отчётов $)",
    partsCostHint: "Только для внутреннего учёта — клиент не видит",
    searchJobs: "Поиск: имя, телефон, дата, адрес…",
    searchClear: "Сбросить",
    tabActive: "Активные",
    archiveJob: "В архив",
    restore: "Восстановить",
    archived: "Архив",
    noArchived: "Архив пуст",
    archiving: "Архивирование...",
    restoring: "Восстановление...",
    sendReview: "⭐ Запросить отзыв",
    sendingReview: "Отправляем...",
    reviewSent: "Ссылка на отзыв отправлена!",
    notifyMethod: "Отправить ссылку на оплату через",
    viaEmail: "Email",
    viaSMS: "SMS",
    viaBoth: "Оба",
    clientContact: "Контакты клиента",
    noContactInfo: "Контактных данных нет",
    noNotificationWillBeSent: "уведомление не будет отправлено",
    statsClosed: "Всего закрыто",
    statsRevenue: "Общая выручка",
    statsMonth: "Этот месяц",
    statsMonthRev: "Этот месяц $",
    statsWeek: "Эта неделя",
    statsWeekJobs: "заказов за неделю",
    statsWeekLabor: "Работа",
    statsWeekParts: "Запчасти",
    statsWeekTax: "Налог (8.25%)",
    statsWeekNet: "Ваша доля",
    statsJobs: "заказов",
    statsTab: "Статистика",
    faceIdFailed: "Face ID не прошёл. Введите пароль.",
    faceIdRegFailed: "Не удалось включить Face ID",
    fidEnableTitle: "Включить Face ID?",
    fidEnableDesc: "Вход одним касанием без пароля.\nВаше лицо / отпечаток не покидает устройство.",
    fidEnable: "Включить Face ID / Fingerprint",
    fidRegistering: "Регистрация...",
    fidSkip: "Пропустить",
    fidSignIn: "Войти через Face ID",
    fidChecking: "Проверка...",
    fidUsePassword: "Войти по паролю",
    photosBtn: "📷 Фото",
    photoModal: "Фото заказа",
    photoAdd: "Сделать фото",
    photoGallery: "Выбрать из галереи (до 10 фото)",
    photoLoading: "Загрузка...",
    photoNone: "Фото нет",
    photoDelete: "Удалить",
    photoUploadFail: "Ошибка загрузки",
    sigTitle: "Подпись клиента",
    sigClear: "Очистить",
    sigDraw: "Нарисуйте подпись (опционально)",
    sigConsentText: "Подписывая, клиент разрешает HTR Dental выполнить описанный ремонт. Электронная подпись действительна по законодательству Техаса (TUETA).",
    sigOptional: "(опционально)",
    editEmail: "Изменить Email",
    emailSaved: "Email сохранён",
    emailSaveErr: "Ошибка сохранения Email",
    addEmail: "Добавить Email"
  },
  es: {
    title: "Portal del empleado",
    phone: "Teléfono",
    pin: "PIN",
    signIn: "Iniciar sesión",
    signingIn: "Iniciando sesión...",
    invalidLogin: "Teléfono o PIN inválido",
    connError: "Error de conexión",
    hello: "Hola,",
    logout: "Cerrar sesión",
    myJobs: "Mis trabajos",
    payroll: "Nómina",
    profile: "Perfil",
    refresh: "Actualizar",
    noJobs: "Aún no hay trabajos asignados",
    completed: "Completado",
    pending: "Pendiente",
    confirmed: "Confirmado",
    bizAppliance: "Appliance",
    bizDental: "Dental",
    done: "Hecho",
    paid: "Pagado",
    cancelled: "Cancelado",
    period: "Período",
    jobsCount: "Trabajos",
    gross: "Bruto",
    deductions: "Deducciones",
    net: "Neto",
    noPayroll: "Aún no hay registros de nómina",
    car: "Coche",
    plate: "Placa",
    closeJob: "Cerrar trabajo",
    downloadReceipt: "Descargar recibo",
    generating: "Generando...",
    repairAmount: "Monto de reparación ($)",
    workPerformed: "Trabajo realizado",
    workPlaceholder: "Describe lo que se hizo...",
    partsReplaced: "Piezas reemplazadas",
    addPart: "+ Añadir pieza",
    paymentMethod: "Método de pago",
    cash: "Efectivo",
    zelle: "Zelle",
    tapToPay: "Tap to Pay",
    openStripeApp: "Abrir Stripe Dashboard",
    tapToPayInstruction: "Abre la app Stripe Dashboard → crea un pago → acerca la tarjeta del cliente",
    zelleInfo: "Enviar a: htrgroupllc@gmail.com",
    openPaymentLink: "Abrir enlace de pago",
    online: "En línea (Stripe)",
    clientReceiptLang: "Idioma del recibo del cliente",
    cancel: "Cancelar",
    submit: "Enviar",
    repairAmountReq: "El monto de la reparación es obligatorio",
    workPerformedReq: "El trabajo realizado es obligatorio",
    errorClosing: "Error al cerrar el trabajo",
    address: "Dirección",
    appliance: "Equipo dental",
    brandModel: "Marca/Modelo",
    date: "Fecha",
    time: "Hora",
    notes: "Notas",
    call: "Llamar",
    smsAction: "SMS",
    emailAction: "Email",
    navigate: "Navegar",
    receiptError: "No se pudo generar el recibo. Por favor, inténtelo de nuevo.",
    noProfile: "Cargando perfil...",
    estimateSent: "Presupuesto enviado",
    estimateEdit: "Editar y reenviar",
    estimateEditTitle: "Editar presupuesto",
    sendEstimate: "Enviar presupuesto",
    estimateTitle: "Crear presupuesto",
    estimateItems: "Servicios",
    addItem: "+ Agregar elemento",
    itemDesc: "Descripción",
    itemCat: "Categoría",
    itemQty: "Cant.",
    itemPrice: "Precio ($)",
    estimateNotes: "Notas (opcional)",
    estimateNotesPlaceholder: "Notas adicionales para el cliente...",
    estimateSend: "Enviar al cliente",
    estimateSending: "Enviando...",
    estimateSuccess: "¡Presupuesto enviado!",
    estimateErr: "Error al enviar presupuesto",
    noTax: "Sin impuesto (descuento)",
    estimateSubtotal: "Subtotal",
    estimateTaxLine: "Impuesto (8.25%)",
    estimateTotalLine: "Total",
    fromPricebook: "Del catálogo",
    customItem: "Personalizado",
    partsCost: "Costo de partes (real, para reportes $)",
    partsCostHint: "Solo interno — el cliente no lo ve",
    searchJobs: "Buscar: nombre, teléfono, fecha, dirección…",
    searchClear: "Limpiar",
    tabActive: "Activos",
    archiveJob: "Archivar",
    restore: "Restaurar",
    archived: "Archivados",
    noArchived: "No hay trabajos archivados",
    archiving: "Archivando...",
    restoring: "Restaurando...",
    sendReview: "⭐ Pedir reseña",
    sendingReview: "Enviando...",
    reviewSent: "¡Enlace de reseña enviado!",
    notifyMethod: "Enviar enlace de pago por",
    viaEmail: "Email",
    viaSMS: "SMS",
    viaBoth: "Ambos",
    clientContact: "Contacto del cliente",
    noContactInfo: "Sin información de contacto",
    noNotificationWillBeSent: "no se enviará notificación",
    statsClosed: "Total cerrado",
    statsRevenue: "Ingresos totales",
    statsMonth: "Este mes",
    statsMonthRev: "Este mes $",
    statsWeek: "Esta semana",
    statsWeekJobs: "trabajos esta semana",
    statsWeekLabor: "Mano de obra",
    statsWeekParts: "Refacciones",
    statsWeekTax: "Impuesto (8.25%)",
    statsWeekNet: "Tu parte neta",
    statsJobs: "trabajos",
    statsTab: "Estadísticas",
    faceIdFailed: "Face ID fallido. Ingrese contraseña.",
    faceIdRegFailed: "No se pudo activar Face ID",
    fidEnableTitle: "¿Activar Face ID?",
    fidEnableDesc: "Ingrese con un toque, sin contraseña.\nSu cara / huella nunca sale del dispositivo.",
    fidEnable: "Activar Face ID / Huella",
    fidRegistering: "Registrando...",
    fidSkip: "Omitir",
    fidSignIn: "Entrar con Face ID",
    fidChecking: "Verificando...",
    fidUsePassword: "Entrar con contraseña",
    photosBtn: "📷 Fotos",
    photoModal: "Fotos del trabajo",
    photoAdd: "Tomar foto",
    photoGallery: "Elegir de galería (hasta 10)",
    photoLoading: "Cargando...",
    photoNone: "Sin fotos aún",
    photoDelete: "Eliminar",
    photoUploadFail: "Error al subir",
    sigTitle: "Firma del cliente",
    sigClear: "Limpiar",
    sigDraw: "Firme aquí (opcional)",
    sigConsentText: "Al firmar, el cliente autoriza a HTR Dental a realizar las reparaciones descritas. Firma electrónica válida bajo la ley de Texas (TUETA).",
    sigOptional: "(opcional)",
    editEmail: "Editar Email",
    emailSaved: "Email guardado",
    emailSaveErr: "Error al guardar email",
    addEmail: "Agregar Email"
  },
  tr: {
    title: "Personel Portalı",
    phone: "Telefon",
    pin: "PIN",
    signIn: "Giriş Yap",
    signingIn: "Giriş yapılıyor...",
    invalidLogin: "Geçersiz telefon veya PIN",
    connError: "Bağlantı hatası",
    hello: "Merhaba,",
    logout: "Çıkış Yap",
    myJobs: "İşlerim",
    payroll: "Maaş",
    profile: "Profil",
    refresh: "Yenile",
    noJobs: "Henüz atanmış iş yok",
    completed: "Tamamlandı",
    pending: "Beklemede",
    confirmed: "Onaylandı",
    bizAppliance: "Appliance",
    bizDental: "Dental",
    done: "Bitti",
    paid: "Ödendi",
    cancelled: "İptal edildi",
    period: "Dönem",
    jobsCount: "İş sayısı",
    gross: "Brüt",
    deductions: "Kesintiler",
    net: "Net",
    noPayroll: "Henüz maaş kaydı yok",
    car: "Araç",
    plate: "Plaka",
    closeJob: "İşi Kapat",
    downloadReceipt: "Fişi İndir",
    generating: "Oluşturuluyor...",
    repairAmount: "Onarım Tutarı ($)",
    workPerformed: "Yapılan İş",
    workPlaceholder: "Ne yapıldığını açıklayın...",
    partsReplaced: "Değişen Parçalar",
    addPart: "+ Parça Ekle",
    paymentMethod: "Ödeme Yöntemi",
    cash: "Nakit",
    zelle: "Zelle",
    tapToPay: "Tap to Pay",
    openStripeApp: "Stripe Dashboard'u Aç",
    tapToPayInstruction: "Stripe Dashboard uygulamasını aç → ödeme oluştur → müşteri kartını yaklaştır",
    zelleInfo: "Gönder: htrgroupllc@gmail.com",
    openPaymentLink: "Ödeme Linkini Aç",
    online: "Çevrimiçi (Stripe)",
    clientReceiptLang: "Müşteri Fiş Dili",
    cancel: "İptal",
    submit: "Gönder",
    repairAmountReq: "Onarım tutarı gerekli",
    workPerformedReq: "Yapılan iş gerekli",
    errorClosing: "İş kapatılırken hata oluştu",
    address: "Adres",
    appliance: "Cihaz",
    brandModel: "Marka/Model",
    date: "Tarih",
    time: "Saat",
    notes: "Notlar",
    call: "Ara",
    navigate: "Yol Tarifi",
    receiptError: "Fiş oluşturulamadı. Lütfen tekrar deneyin.",
    noProfile: "Profil yükleniyor...",
    sendEstimate: "Teklif Gönder",
    estimateTitle: "Teklif Oluştur",
    estimateItems: "Hizmet Kalemleri",
    addItem: "+ Kalem Ekle",
    itemDesc: "Açıklama",
    itemCat: "Kategori",
    itemQty: "Adet",
    itemPrice: "Fiyat ($)",
    estimateNotes: "Notlar (isteğe bağlı)",
    estimateNotesPlaceholder: "Müşteri için ek notlar...",
    estimateSend: "Müşteriye Gönder",
    estimateSending: "Gönderiliyor...",
    estimateSuccess: "Teklif gönderildi!",
    estimateErr: "Teklif gönderme hatası",
    noTax: "Vergisiz (indirim)",
    estimateSubtotal: "Ara toplam",
    estimateTaxLine: "Vergi (8.25%)",
    estimateTotalLine: "Toplam",
    fromPricebook: "Fiyat listesinden",
    customItem: "Özel",
    partsCost: "Parça maliyeti (gerçek, raporlar için $)",
    partsCostHint: "Yalnızca dahili — müşteri görmez",
    searchJobs: "Ara: ad, telefon, tarih, adres…",
    searchClear: "Temizle",
    tabActive: "Aktif",
    archiveJob: "Arşivle",
    restore: "Geri Yükle",
    archived: "Arşiv",
    noArchived: "Arşivlenmiş iş yok",
    archiving: "Arşivleniyor...",
    restoring: "Geri yükleniyor...",
    sendReview: "⭐ Yorum İste",
    sendingReview: "Gönderiliyor...",
    reviewSent: "Yorum bağlantısı gönderildi!",
    notifyMethod: "Ödeme bağlantısını gönder",
    viaEmail: "E-posta",
    viaSMS: "SMS",
    viaBoth: "İkisi de",
    clientContact: "Müşteri iletişim bilgisi",
    noContactInfo: "İletişim bilgisi yok",
    noNotificationWillBeSent: "bildirim gönderilmeyecek",
    statsClosed: "Toplam Kapatılan",
    statsRevenue: "Toplam Gelir",
    statsMonth: "Bu Ay",
    statsMonthRev: "Bu Ay $",
    statsWeek: "Bu Hafta",
    statsWeekJobs: "bu haftaki iş",
    statsWeekLabor: "İşçilik",
    statsWeekParts: "Parçalar",
    statsWeekTax: "Vergi (8.25%)",
    statsWeekNet: "Net payınız",
    statsJobs: "iş",
    statsTab: "İstatistik",
    faceIdFailed: "Face ID başarısız. Şifre girin.",
    faceIdRegFailed: "Face ID etkinleştirilemedi",
    fidEnableTitle: "Face ID etkinleştirilsin mi?",
    fidEnableDesc: "Şifresiz tek dokunuşla giriş yapın.\nYüzünüz / parmak iziniz cihazdan çıkmaz.",
    fidEnable: "Face ID / Parmak İzi Etkinleştir",
    fidRegistering: "Kaydediliyor...",
    fidSkip: "Atla",
    fidSignIn: "Face ID ile Giriş",
    fidChecking: "Kontrol ediliyor...",
    fidUsePassword: "Şifre ile giriş",
    photosBtn: "📷 Fotoğraflar",
    photoModal: "İş Fotoğrafları",
    photoAdd: "Fotoğraf Çek",
    photoGallery: "Galeriden Seç (10'a kadar)",
    photoLoading: "Yükleniyor...",
    photoNone: "Henüz fotoğraf yok",
    photoDelete: "Sil",
    photoUploadFail: "Yükleme hatası",
    sigTitle: "Müşteri İmzası",
    sigClear: "Temizle",
    sigDraw: "Buraya imzalayın (isteğe bağlı)",
    sigConsentText: "İmzalayarak müşteri, HTR Dental'in açıklanan onarımları yapmasını onaylar. Texas hukukuna göre geçerli elektronik imza (TUETA).",
    sigOptional: "(isteğe bağlı)",
    editEmail: "E-posta Düzenle",
    emailSaved: "E-posta kaydedildi",
    emailSaveErr: "E-posta kaydetme hatası",
    addEmail: "E-posta Ekle"
  },
  az: {
    title: "İşçi Portalı",
    phone: "Telefon",
    pin: "PIN",
    signIn: "Daxil ol",
    signingIn: "Daxil olunur...",
    invalidLogin: "Yanlış telefon və ya PIN",
    connError: "Bağlantı xətası",
    hello: "Salam,",
    logout: "Çıxış",
    myJobs: "İşlərim",
    payroll: "Maaş",
    profile: "Profil",
    refresh: "Yenilə",
    noJobs: "Hələ təyin olunmuş iş yoxdur",
    completed: "Tamamlandı",
    pending: "Gözləyir",
    confirmed: "Təsdiqləndi",
    bizAppliance: "Appliance",
    bizDental: "Dental",
    done: "Hazırdır",
    paid: "Ödənildi",
    cancelled: "Ləğv edildi",
    period: "Dövr",
    jobsCount: "İşlər",
    gross: "Ümumi",
    deductions: "Tutulmalar",
    net: "Xalis",
    noPayroll: "Hələ maaş qeydi yoxdur",
    car: "Maşın",
    plate: "Nömrə",
    closeJob: "İşi Bağla",
    downloadReceipt: "Qəbzi Yüklə",
    generating: "Hazırlanır...",
    repairAmount: "Təmir Məbləği ($)",
    workPerformed: "Görülən İş",
    workPlaceholder: "Nə edildiyini təsvir edin...",
    partsReplaced: "Dəyişdirilmiş Hissələr",
    addPart: "+ Hissə Əlavə Et",
    paymentMethod: "Ödəniş Üsulu",
    cash: "Nağd",
    zelle: "Zelle",
    tapToPay: "Tap to Pay",
    openStripeApp: "Stripe Dashboard Aç",
    tapToPayInstruction: "Stripe Dashboard tətbiqini açın → ödəniş yaradın → müştəri kartını yaxınlaşdırın",
    zelleInfo: "Göndər: htrgroupllc@gmail.com",
    openPaymentLink: "Ödəniş Linkini Aç",
    online: "Onlayn (Stripe)",
    clientReceiptLang: "Müştəri Qəbz Dili",
    cancel: "Ləğv et",
    submit: "Göndər",
    repairAmountReq: "Təmir məbləği tələb olunur",
    workPerformedReq: "Görülən iş tələb olunur",
    errorClosing: "İşi bağlayarkən xəta",
    address: "Ünvan",
    appliance: "Avadanlıq",
    brandModel: "Marka/Model",
    date: "Tarix",
    time: "Saat",
    notes: "Qeydlər",
    call: "Zəng et",
    navigate: "Naviqasiya",
    receiptError: "Qəbz hazırlana bilmədi. Yenidən cəhd edin.",
    noProfile: "Profil yüklənir...",
    sendEstimate: "Smeta Göndər",
    estimateTitle: "Smeta Yarat",
    estimateItems: "Xidmət Maddələri",
    addItem: "+ Maddə Əlavə Et",
    itemDesc: "Təsvir",
    itemCat: "Kateqoriya",
    itemQty: "Say",
    itemPrice: "Qiymət ($)",
    estimateNotes: "Qeydlər (isteğe bağlı)",
    estimateNotesPlaceholder: "Müştəri üçün əlavə qeydlər...",
    estimateSend: "Müştəriyə Göndər",
    estimateSending: "Göndərilir...",
    estimateSuccess: "Smeta göndərildi!",
    estimateErr: "Smeta göndərmə xətası",
    noTax: "Vergisiz (endirim)",
    estimateSubtotal: "Aralıq cəm",
    estimateTaxLine: "Vergi (8.25%)",
    estimateTotalLine: "Cəmi",
    fromPricebook: "Qiymət siyahısından",
    customItem: "Xüsusi",
    partsCost: "Hissə dəyəri (faktiki, hesabatlar üçün $)",
    partsCostHint: "Yalnız daxili — müştəri görmür",
    searchJobs: "Axtar: ad, telefon, tarix, ünvan…",
    searchClear: "Təmizlə",
    tabActive: "Aktiv",
    archiveJob: "Arxivlə",
    restore: "Bərpa et",
    archived: "Arxiv",
    noArchived: "Arxivlənmiş iş yoxdur",
    archiving: "Arxivlənir...",
    restoring: "Bərpa edilir...",
    sendReview: "⭐ Rəy İstə",
    sendingReview: "Göndərilir...",
    reviewSent: "Rəy linki göndərildi!",
    notifyMethod: "Ödəniş linkini göndər",
    viaEmail: "E-poçt",
    viaSMS: "SMS",
    viaBoth: "Hər ikisi",
    clientContact: "Müştəri əlaqəsi",
    noContactInfo: "Əlaqə məlumatı yoxdur",
    noNotificationWillBeSent: "bildiriş göndərilməyəcək",
    statsClosed: "Cəmi Bağlandı",
    statsRevenue: "Ümumi Gəlir",
    statsMonth: "Bu Ay",
    statsMonthRev: "Bu Ay $",
    statsWeek: "Bu Həftə",
    statsWeekJobs: "bu həftəki iş",
    statsWeekLabor: "Əmək",
    statsWeekParts: "Hissələr",
    statsWeekTax: "Vergi (8.25%)",
    statsWeekNet: "Sizin payınız",
    statsJobs: "iş",
    statsTab: "Statistika",
    faceIdFailed: "Face ID uğursuz oldu. Şifrəni daxil edin.",
    faceIdRegFailed: "Face ID aktiv edilə bilmədi",
    fidEnableTitle: "Face ID aktiv edilsin?",
    fidEnableDesc: "Şifrəsiz bir toxunuşla daxil olun.\nÜzünüz / barmaq iziniz cihazdan çıxmır.",
    fidEnable: "Face ID / Barmaq İzi Aktiv Et",
    fidRegistering: "Qeyd edilir...",
    fidSkip: "Keç",
    fidSignIn: "Face ID ilə Daxil Ol",
    fidChecking: "Yoxlanılır...",
    fidUsePassword: "Şifrə ilə daxil ol",
    photosBtn: "📷 Şəkillər",
    photoModal: "İş Şəkilləri",
    photoAdd: "Şəkil çək",
    photoGallery: "Qalereyadan seç (10-a qədər)",
    photoLoading: "Yüklənir...",
    photoNone: "Hələ şəkil yoxdur",
    photoDelete: "Sil",
    photoUploadFail: "Yükləmə xətası",
    sigTitle: "Müştəri İmzası",
    sigClear: "Təmizlə",
    sigDraw: "Buraya imzalayın (ixtiyari)",
    sigConsentText: "İmzalayaraq müştəri HTR Dental-in təsvir olunan təmirləri etməsinə icazə verir. Texas qanunvericiliyinə əsasən etibarlı elektron imza (TUETA).",
    sigOptional: "(ixtiyari)",
    editEmail: "E-poçtu Yenilə",
    emailSaved: "E-poçt qeydə alındı",
    emailSaveErr: "E-poçt saxlama xətası",
    addEmail: "E-poçt Əlavə Et"
  },
  uk: {
    title: "Портал працівника",
    phone: "Телефон",
    pin: "ПІН-код",
    signIn: "Увійти",
    signingIn: "Вхід...",
    invalidLogin: "Невірний телефон або ПІН",
    connError: "Помилка з'єднання",
    hello: "Привіт,",
    logout: "Вийти",
    myJobs: "Мої роботи",
    payroll: "Зарплата",
    profile: "Профіль",
    refresh: "Оновити",
    noJobs: "Призначених робіт поки немає",
    completed: "Завершено",
    pending: "Очікує",
    confirmed: "Підтверджено",
    bizAppliance: "Appliance",
    bizDental: "Dental",
    done: "Готово",
    paid: "Оплачено",
    cancelled: "Скасовано",
    period: "Період",
    jobsCount: "Робіт",
    gross: "Разом",
    deductions: "Відрахування",
    net: "До виплати",
    noPayroll: "Записів про зарплату поки немає",
    car: "Авто",
    plate: "Номер",
    closeJob: "Закрити роботу",
    downloadReceipt: "Завантажити чек",
    generating: "Створення...",
    repairAmount: "Сума ремонту ($)",
    workPerformed: "Виконана робота",
    workPlaceholder: "Опишіть, що було зроблено...",
    partsReplaced: "Замінені деталі",
    addPart: "+ Додати деталь",
    paymentMethod: "Спосіб оплати",
    cash: "Готівка",
    zelle: "Zelle",
    tapToPay: "Tap to Pay",
    openStripeApp: "Відкрити Stripe Dashboard",
    tapToPayInstruction: "Відкрийте Stripe Dashboard → створіть платіж → піднесіть картку клієнта",
    zelleInfo: "Надіслати: htrgroupllc@gmail.com",
    openPaymentLink: "Відкрити посилання оплати",
    online: "Онлайн (Stripe)",
    clientReceiptLang: "Мова чека клієнта",
    cancel: "Скасувати",
    submit: "Надіслати",
    repairAmountReq: "Сума ремонту обов'язкова",
    workPerformedReq: "Опис роботи обов'язковий",
    errorClosing: "Помилка при закритті роботи",
    address: "Адреса",
    appliance: "Техніка",
    brandModel: "Марка/Модель",
    date: "Дата",
    time: "Час",
    notes: "Примітки",
    call: "Зателефонувати",
    navigate: "Маршрут",
    receiptError: "Не вдалося створити чек. Спробуйте ще раз.",
    noProfile: "Завантаження профілю...",
    sendEstimate: "Надіслати кошторис",
    estimateTitle: "Створити кошторис",
    estimateItems: "Послуги",
    addItem: "+ Додати позицію",
    itemDesc: "Опис",
    itemCat: "Категорія",
    itemQty: "К-сть",
    itemPrice: "Ціна ($)",
    estimateNotes: "Нотатки (необов'язково)",
    estimateNotesPlaceholder: "Додаткові нотатки для клієнта...",
    estimateSend: "Надіслати клієнту",
    estimateSending: "Надсилаємо...",
    estimateSuccess: "Кошторис надіслано!",
    estimateErr: "Помилка надсилання кошторису",
    noTax: "Без податку (знижка)",
    estimateSubtotal: "Підсумок",
    estimateTaxLine: "Податок (8.25%)",
    estimateTotalLine: "Разом",
    fromPricebook: "З прайс-листа",
    customItem: "Своє",
    partsCost: "Вартість деталей (факт., для звітів $)",
    partsCostHint: "Лише для внутрішнього обліку — клієнт не бачить",
    searchJobs: "Пошук: ім'я, телефон, дата, адреса…",
    searchClear: "Скинути",
    tabActive: "Активні",
    archiveJob: "В архів",
    restore: "Відновити",
    archived: "Архів",
    noArchived: "Архів порожній",
    archiving: "Архівування...",
    restoring: "Відновлення...",
    sendReview: "⭐ Запросити відгук",
    sendingReview: "Надсилаємо...",
    reviewSent: "Посилання на відгук надіслано!",
    notifyMethod: "Надіслати посилання на оплату через",
    viaEmail: "Email",
    viaSMS: "SMS",
    viaBoth: "Обидва",
    clientContact: "Контакти клієнта",
    noContactInfo: "Контактних даних немає",
    noNotificationWillBeSent: "повідомлення не буде надіслано",
    statsClosed: "Всього закрито",
    statsRevenue: "Загальна виручка",
    statsMonth: "Цей місяць",
    statsMonthRev: "Цей місяць $",
    statsWeek: "Цей тиждень",
    statsWeekJobs: "робіт за тиждень",
    statsWeekLabor: "Робота",
    statsWeekParts: "Запчастини",
    statsWeekTax: "Податок (8.25%)",
    statsWeekNet: "Ваша частка",
    statsJobs: "робіт",
    statsTab: "Статистика",
    faceIdFailed: "Face ID не пройшов. Введіть пароль.",
    faceIdRegFailed: "Не вдалося увімкнути Face ID",
    fidEnableTitle: "Увімкнути Face ID?",
    fidEnableDesc: "Вхід одним дотиком без пароля.\nВаше обличчя / відбиток не залишає пристрій.",
    fidEnable: "Увімкнути Face ID / Відбиток",
    fidRegistering: "Реєстрація...",
    fidSkip: "Пропустити",
    fidSignIn: "Увійти через Face ID",
    fidChecking: "Перевірка...",
    fidUsePassword: "Увійти за паролем",
    photosBtn: "📷 Фото",
    photoModal: "Фото замовлення",
    photoAdd: "Зробити фото",
    photoGallery: "Обрати з галереї (до 10 фото)",
    photoLoading: "Завантаження...",
    photoNone: "Фото відсутні",
    photoDelete: "Видалити",
    photoUploadFail: "Помилка завантаження",
    sigTitle: "Підпис клієнта",
    sigClear: "Очистити",
    sigDraw: "Намалюйте підпис (опціонально)",
    sigConsentText: "Підписуючи, клієнт дозволяє HTR Dental виконати описаний ремонт. Електронний підпис дійсний за законодавством Техасу (TUETA).",
    sigOptional: "(опціонально)",
    editEmail: "Оновити Email",
    emailSaved: "Email збережено",
    emailSaveErr: "Помилка збереження Email",
    addEmail: "Додати Email"
  }
};
const EmpLangContext = reactExports.createContext(void 0);
function EmpLangProvider({ children }) {
  const [lang, setLangState] = reactExports.useState(() => {
    const saved = localStorage.getItem("empUiLang");
    return saved || "en";
  });
  const setLang = reactExports.useCallback((newLang) => {
    setLangState(newLang);
    localStorage.setItem("empUiLang", newLang);
  }, []);
  const t = reactExports.useCallback((key) => {
    return translations[lang][key] || key;
  }, [lang]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(EmpLangContext.Provider, { value: { lang, setLang, t }, children });
}
function useEmpLang() {
  const context = reactExports.useContext(EmpLangContext);
  if (!context) throw new Error("useEmpLang must be used within EmpLangProvider");
  return context;
}
function bufferToBase64URLString(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const charCode of bytes) {
    str += String.fromCharCode(charCode);
  }
  const base64String = btoa(str);
  return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function base64URLStringToBuffer(base64URLString) {
  const base64 = base64URLString.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - base64.length % 4) % 4;
  const padded = base64.padEnd(base64.length + padLength, "=");
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}
function browserSupportsWebAuthn() {
  return _browserSupportsWebAuthnInternals.stubThis(globalThis?.PublicKeyCredential !== void 0 && typeof globalThis.PublicKeyCredential === "function");
}
const _browserSupportsWebAuthnInternals = {
  stubThis: (value) => value
};
function toPublicKeyCredentialDescriptor(descriptor) {
  const { id: id2 } = descriptor;
  return {
    ...descriptor,
    id: base64URLStringToBuffer(id2),
    /**
     * `descriptor.transports` is an array of our `AuthenticatorTransportFuture` that includes newer
     * transports that TypeScript's DOM lib is ignorant of. Convince TS that our list of transports
     * are fine to pass to WebAuthn since browsers will recognize the new value.
     */
    transports: descriptor.transports
  };
}
function isValidDomain(hostname) {
  return (
    // Consider localhost valid as well since it's okay wrt Secure Contexts
    hostname === "localhost" || // Support punycode (ACE) or ascii labels and domains
    /^((xn--[a-z0-9-]+|[a-z0-9]+(-[a-z0-9]+)*)\.)+([a-z]{2,}|xn--[a-z0-9-]+)$/i.test(hostname)
  );
}
class WebAuthnError extends Error {
  constructor({ message, code, cause, name }) {
    super(message, { cause });
    Object.defineProperty(this, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.name = name ?? cause.name;
    this.code = code;
  }
}
function identifyRegistrationError({ error, options }) {
  const { publicKey } = options;
  if (!publicKey) {
    throw Error("options was missing required publicKey property");
  }
  if (error.name === "AbortError") {
    if (options.signal instanceof AbortSignal) {
      return new WebAuthnError({
        message: "Registration ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: error
      });
    }
  } else if (error.name === "ConstraintError") {
    if (publicKey.authenticatorSelection?.requireResidentKey === true) {
      return new WebAuthnError({
        message: "Discoverable credentials were required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT",
        cause: error
      });
    } else if (
      // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
      options.mediation === "conditional" && publicKey.authenticatorSelection?.userVerification === "required"
    ) {
      return new WebAuthnError({
        message: "User verification was required during automatic registration but it could not be performed",
        code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE",
        cause: error
      });
    } else if (publicKey.authenticatorSelection?.userVerification === "required") {
      return new WebAuthnError({
        message: "User verification was required but no available authenticator supported it",
        code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT",
        cause: error
      });
    }
  } else if (error.name === "InvalidStateError") {
    return new WebAuthnError({
      message: "The authenticator was previously registered",
      code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
      cause: error
    });
  } else if (error.name === "NotAllowedError") {
    return new WebAuthnError({
      message: error.message,
      code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
      cause: error
    });
  } else if (error.name === "NotSupportedError") {
    const validPubKeyCredParams = publicKey.pubKeyCredParams.filter((param) => param.type === "public-key");
    if (validPubKeyCredParams.length === 0) {
      return new WebAuthnError({
        message: 'No entry in pubKeyCredParams was of type "public-key"',
        code: "ERROR_MALFORMED_PUBKEYCREDPARAMS",
        cause: error
      });
    }
    return new WebAuthnError({
      message: "No available authenticator supported any of the specified pubKeyCredParams algorithms",
      code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG",
      cause: error
    });
  } else if (error.name === "SecurityError") {
    const effectiveDomain = globalThis.location.hostname;
    if (!isValidDomain(effectiveDomain)) {
      return new WebAuthnError({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: error
      });
    } else if (publicKey.rp.id !== effectiveDomain) {
      return new WebAuthnError({
        message: `The RP ID "${publicKey.rp.id}" is invalid for this domain`,
        code: "ERROR_INVALID_RP_ID",
        cause: error
      });
    }
  } else if (error.name === "TypeError") {
    if (publicKey.user.id.byteLength < 1 || publicKey.user.id.byteLength > 64) {
      return new WebAuthnError({
        message: "User ID was not between 1 and 64 characters",
        code: "ERROR_INVALID_USER_ID_LENGTH",
        cause: error
      });
    }
  } else if (error.name === "UnknownError") {
    return new WebAuthnError({
      message: "The authenticator was unable to process the specified options, or could not create a new credential",
      code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
      cause: error
    });
  }
  return error;
}
class BaseWebAuthnAbortService {
  constructor() {
    Object.defineProperty(this, "controller", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
  }
  createNewAbortSignal() {
    if (this.controller) {
      const abortError = new Error("Cancelling existing WebAuthn API call for new one");
      abortError.name = "AbortError";
      this.controller.abort(abortError);
    }
    const newController = new AbortController();
    this.controller = newController;
    return newController.signal;
  }
  cancelCeremony() {
    if (this.controller) {
      const abortError = new Error("Manually cancelling existing WebAuthn API call");
      abortError.name = "AbortError";
      this.controller.abort(abortError);
      this.controller = void 0;
    }
  }
}
const WebAuthnAbortService = new BaseWebAuthnAbortService();
const attachments = ["cross-platform", "platform"];
function toAuthenticatorAttachment(attachment) {
  if (!attachment) {
    return;
  }
  if (attachments.indexOf(attachment) < 0) {
    return;
  }
  return attachment;
}
async function startRegistration(options) {
  if (!options.optionsJSON && options.challenge) {
    console.warn("startRegistration() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information.");
    options = { optionsJSON: options };
  }
  const { optionsJSON, useAutoRegister = false } = options;
  if (!browserSupportsWebAuthn()) {
    throw new Error("WebAuthn is not supported in this browser");
  }
  const publicKey = {
    ...optionsJSON,
    challenge: base64URLStringToBuffer(optionsJSON.challenge),
    user: {
      ...optionsJSON.user,
      id: base64URLStringToBuffer(optionsJSON.user.id)
    },
    excludeCredentials: optionsJSON.excludeCredentials?.map(toPublicKeyCredentialDescriptor)
  };
  const createOptions = {};
  if (useAutoRegister) {
    createOptions.mediation = "conditional";
  }
  createOptions.publicKey = publicKey;
  createOptions.signal = WebAuthnAbortService.createNewAbortSignal();
  let credential;
  try {
    credential = await navigator.credentials.create(createOptions);
  } catch (err) {
    throw identifyRegistrationError({ error: err, options: createOptions });
  }
  if (!credential) {
    throw new Error("Registration was not completed");
  }
  const { id: id2, rawId, response, type } = credential;
  let transports = void 0;
  if (typeof response.getTransports === "function") {
    transports = response.getTransports();
  }
  let responsePublicKeyAlgorithm = void 0;
  if (typeof response.getPublicKeyAlgorithm === "function") {
    try {
      responsePublicKeyAlgorithm = response.getPublicKeyAlgorithm();
    } catch (error) {
      warnOnBrokenImplementation("getPublicKeyAlgorithm()", error);
    }
  }
  let responsePublicKey = void 0;
  if (typeof response.getPublicKey === "function") {
    try {
      const _publicKey = response.getPublicKey();
      if (_publicKey !== null) {
        responsePublicKey = bufferToBase64URLString(_publicKey);
      }
    } catch (error) {
      warnOnBrokenImplementation("getPublicKey()", error);
    }
  }
  let responseAuthenticatorData;
  if (typeof response.getAuthenticatorData === "function") {
    try {
      responseAuthenticatorData = bufferToBase64URLString(response.getAuthenticatorData());
    } catch (error) {
      warnOnBrokenImplementation("getAuthenticatorData()", error);
    }
  }
  return {
    id: id2,
    rawId: bufferToBase64URLString(rawId),
    response: {
      attestationObject: bufferToBase64URLString(response.attestationObject),
      clientDataJSON: bufferToBase64URLString(response.clientDataJSON),
      transports,
      publicKeyAlgorithm: responsePublicKeyAlgorithm,
      publicKey: responsePublicKey,
      authenticatorData: responseAuthenticatorData
    },
    type,
    clientExtensionResults: credential.getClientExtensionResults(),
    authenticatorAttachment: toAuthenticatorAttachment(credential.authenticatorAttachment)
  };
}
function warnOnBrokenImplementation(methodName, cause) {
  console.warn(`The browser extension that intercepted this WebAuthn API call incorrectly implemented ${methodName}. You should report this error to them.
`, cause);
}
function browserSupportsWebAuthnAutofill() {
  if (!browserSupportsWebAuthn()) {
    return _browserSupportsWebAuthnAutofillInternals.stubThis(new Promise((resolve) => resolve(false)));
  }
  const globalPublicKeyCredential = globalThis.PublicKeyCredential;
  if (globalPublicKeyCredential?.isConditionalMediationAvailable === void 0) {
    return _browserSupportsWebAuthnAutofillInternals.stubThis(new Promise((resolve) => resolve(false)));
  }
  return _browserSupportsWebAuthnAutofillInternals.stubThis(globalPublicKeyCredential.isConditionalMediationAvailable());
}
const _browserSupportsWebAuthnAutofillInternals = {
  stubThis: (value) => value
};
function identifyAuthenticationError({ error, options }) {
  const { publicKey } = options;
  if (!publicKey) {
    throw Error("options was missing required publicKey property");
  }
  if (error.name === "AbortError") {
    if (options.signal instanceof AbortSignal) {
      return new WebAuthnError({
        message: "Authentication ceremony was sent an abort signal",
        code: "ERROR_CEREMONY_ABORTED",
        cause: error
      });
    }
  } else if (error.name === "NotAllowedError") {
    return new WebAuthnError({
      message: error.message,
      code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY",
      cause: error
    });
  } else if (error.name === "SecurityError") {
    const effectiveDomain = globalThis.location.hostname;
    if (!isValidDomain(effectiveDomain)) {
      return new WebAuthnError({
        message: `${globalThis.location.hostname} is an invalid domain`,
        code: "ERROR_INVALID_DOMAIN",
        cause: error
      });
    } else if (publicKey.rpId !== effectiveDomain) {
      return new WebAuthnError({
        message: `The RP ID "${publicKey.rpId}" is invalid for this domain`,
        code: "ERROR_INVALID_RP_ID",
        cause: error
      });
    }
  } else if (error.name === "UnknownError") {
    return new WebAuthnError({
      message: "The authenticator was unable to process the specified options, or could not create a new assertion signature",
      code: "ERROR_AUTHENTICATOR_GENERAL_ERROR",
      cause: error
    });
  }
  return error;
}
async function startAuthentication(options) {
  if (!options.optionsJSON && options.challenge) {
    console.warn("startAuthentication() was not called correctly. It will try to continue with the provided options, but this call should be refactored to use the expected call structure instead. See https://simplewebauthn.dev/docs/packages/browser#typeerror-cannot-read-properties-of-undefined-reading-challenge for more information.");
    options = { optionsJSON: options };
  }
  const { optionsJSON, useBrowserAutofill = false, verifyBrowserAutofillInput = true } = options;
  if (!browserSupportsWebAuthn()) {
    throw new Error("WebAuthn is not supported in this browser");
  }
  let allowCredentials;
  if (optionsJSON.allowCredentials?.length !== 0) {
    allowCredentials = optionsJSON.allowCredentials?.map(toPublicKeyCredentialDescriptor);
  }
  const publicKey = {
    ...optionsJSON,
    challenge: base64URLStringToBuffer(optionsJSON.challenge),
    allowCredentials
  };
  const getOptions = {};
  if (useBrowserAutofill) {
    if (!await browserSupportsWebAuthnAutofill()) {
      throw Error("Browser does not support WebAuthn autofill");
    }
    const eligibleInputs = document.querySelectorAll("input[autocomplete$='webauthn']");
    if (eligibleInputs.length < 1 && verifyBrowserAutofillInput) {
      throw Error('No <input> with "webauthn" as the only or last value in its `autocomplete` attribute was detected');
    }
    getOptions.mediation = "conditional";
    publicKey.allowCredentials = [];
  }
  getOptions.publicKey = publicKey;
  getOptions.signal = WebAuthnAbortService.createNewAbortSignal();
  let credential;
  try {
    credential = await navigator.credentials.get(getOptions);
  } catch (err) {
    throw identifyAuthenticationError({ error: err, options: getOptions });
  }
  if (!credential) {
    throw new Error("Authentication was not completed");
  }
  const { id: id2, rawId, response, type } = credential;
  let userHandle = void 0;
  if (response.userHandle) {
    userHandle = bufferToBase64URLString(response.userHandle);
  }
  return {
    id: id2,
    rawId: bufferToBase64URLString(rawId),
    response: {
      authenticatorData: bufferToBase64URLString(response.authenticatorData),
      clientDataJSON: bufferToBase64URLString(response.clientDataJSON),
      signature: bufferToBase64URLString(response.signature),
      userHandle
    },
    type,
    clientExtensionResults: credential.getClientExtensionResults(),
    authenticatorAttachment: toAuthenticatorAttachment(credential.authenticatorAttachment)
  };
}
const API$1 = () => "https://htr-group-llc-appliance-repair.replit.app".replace(/\/$/, "");
const ACCENT$3 = "#1B6FE8";
const SUCCESS = "#16a34a";
const STRIPE_DASHBOARD_MOBILE_URL = "https://dashboard.stripe.com/dashboard";
function stripeDashboardUrl() {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || /Android/.test(ua)) return STRIPE_DASHBOARD_MOBILE_URL;
  return "https://dashboard.stripe.com/terminal/payments/create";
}
function openStripeDashboardLink(e) {
  e.preventDefault();
  const url = stripeDashboardUrl();
  const isMobile = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
  if (isMobile) {
    window.location.assign(url);
    return;
  }
  window.open(url, "_blank", "noopener");
}
function openExternalLink(e) {
  const standalone = !!navigator.standalone || window.matchMedia("(display-mode: standalone)").matches;
  if (standalone) {
    e.preventDefault();
    window.location.assign(e.currentTarget.href);
  }
}
function statusLabel(s, t) {
  if (s === "pending") return `⏳ ${t("pending")}`;
  if (s === "approved") return `✅ ${t("confirmed")}`;
  if (s === "completed") return `✓ ${t("done")}`;
  return s;
}
function statusCls(s) {
  if (s === "completed") return "bg-green-100 text-green-700";
  if (s === "approved") return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
}
function payStatusLabel(s, t) {
  if (s === "paid") return `✅ ${t("paid")}`;
  if (s === "cancelled") return `❌ ${t("cancelled")}`;
  return `⏳ ${t("pending")}`;
}
function payStatusCls(s) {
  if (s === "paid") return "bg-green-100 text-green-700";
  if (s === "cancelled") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function mapsUrl(addr) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
}
function Btn({
  onClick,
  disabled,
  color: color2 = ACCENT$3,
  outline = false,
  children,
  full = true
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick,
      disabled,
      style: {
        minHeight: 44,
        width: full ? "100%" : void 0,
        padding: "0 16px",
        background: outline ? "transparent" : disabled ? "#cbd5e1" : color2,
        color: outline ? color2 : "#fff",
        border: outline ? `1.5px solid ${color2}` : "none",
        borderRadius: 12,
        fontSize: 15,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "opacity 0.15s",
        opacity: disabled ? 0.6 : 1,
        boxSizing: "border-box"
      },
      children
    }
  );
}
function EmployeePageWrapped() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(EmpLangProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmployeePage, {}) });
}
const EMP_TOKEN_KEY = "empToken";
const EMP_NAME_KEY = "empName";
const EMP_EXP_KEY = "empTokenExp";
const EMP_FID_KEY = "empFidCredId";
const EMP_LAST_SEEN_KEY = "empLastSeenAt";
const EMP_TOKEN_TTL = 7 * 24 * 60 * 60 * 1e3;
function clearAppBadge() {
  if ("clearAppBadge" in navigator) navigator.clearAppBadge().catch(() => {
  });
}
function notifySwBadgeInit(token) {
  try {
    const sw = navigator.serviceWorker?.controller;
    if (!sw) return;
    const lastSeenAt = localStorage.getItem(EMP_LAST_SEEN_KEY) ?? (/* @__PURE__ */ new Date()).toISOString();
    sw.postMessage({ type: "BADGE_INIT", token, apiBase: API$1(), lastSeenAt });
  } catch {
  }
}
function notifySwBadgeClear() {
  try {
    navigator.serviceWorker?.controller?.postMessage({ type: "BADGE_CLEAR" });
  } catch {
  }
}
function loadStoredToken() {
  try {
    const token = localStorage.getItem(EMP_TOKEN_KEY);
    const exp = localStorage.getItem(EMP_EXP_KEY);
    const name = localStorage.getItem(EMP_NAME_KEY) ?? "";
    if (!token || !exp || Date.now() > parseInt(exp, 10)) {
      localStorage.removeItem(EMP_TOKEN_KEY);
      localStorage.removeItem(EMP_EXP_KEY);
      localStorage.removeItem(EMP_NAME_KEY);
      return null;
    }
    return { token, name };
  } catch {
    return null;
  }
}
function saveEmpToken(token, name) {
  localStorage.setItem(EMP_TOKEN_KEY, token);
  localStorage.setItem(EMP_NAME_KEY, name);
  localStorage.setItem(EMP_EXP_KEY, String(Date.now() + EMP_TOKEN_TTL));
}
function clearEmpToken() {
  localStorage.removeItem(EMP_TOKEN_KEY);
  localStorage.removeItem(EMP_NAME_KEY);
  localStorage.removeItem(EMP_EXP_KEY);
}
async function hasPlatformBiometrics$1() {
  try {
    return !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
  } catch {
    return false;
  }
}
const TRANSLATOR_LANGS = [
  { code: "en-US", bcp: "en-US", flag: "🇺🇸", label: "English" },
  { code: "es-US", bcp: "es-ES", flag: "🇪🇸", label: "Español" },
  { code: "ru-RU", bcp: "ru-RU", flag: "🇷🇺", label: "Русский" },
  { code: "az-AZ", bcp: "az-AZ", flag: "🇦🇿", label: "Azərbaycanca" },
  { code: "tr-TR", bcp: "tr-TR", flag: "🇹🇷", label: "Türkçe" },
  { code: "uk-UA", bcp: "uk-UA", flag: "🇺🇦", label: "Українська" },
  { code: "uz-UZ", bcp: "uz-UZ", flag: "🇺🇿", label: "O'zbekcha" },
  { code: "ky-KG", bcp: "ky-KG", flag: "🇰🇬", label: "Кыргызча" },
  { code: "kk-KZ", bcp: "kk-KZ", flag: "🇰🇿", label: "Қазақша" },
  { code: "hy-AM", bcp: "hy-AM", flag: "🇦🇲", label: "Հայերեն" },
  { code: "ka-GE", bcp: "ka-GE", flag: "🇬🇪", label: "ქართული" },
  { code: "he-IL", bcp: "he-IL", flag: "🇮🇱", label: "עברית" },
  { code: "pt-BR", bcp: "pt-BR", flag: "🇧🇷", label: "Português" },
  { code: "zh-CN", bcp: "zh-CN", flag: "🇨🇳", label: "中文" },
  { code: "ko-KR", bcp: "ko-KR", flag: "🇰🇷", label: "한국어" },
  { code: "vi-VN", bcp: "vi-VN", flag: "🇻🇳", label: "Tiếng Việt" },
  { code: "pl-PL", bcp: "pl-PL", flag: "🇵🇱", label: "Polski" },
  { code: "de-DE", bcp: "de-DE", flag: "🇩🇪", label: "Deutsch" },
  { code: "fr-FR", bcp: "fr-FR", flag: "🇫🇷", label: "Français" },
  { code: "ar-SA", bcp: "ar-SA", flag: "🇸🇦", label: "العربية" },
  { code: "fa-IR", bcp: "fa-IR", flag: "🇮🇷", label: "فارسی" },
  { code: "ur-PK", bcp: "ur-PK", flag: "🇵🇰", label: "اردو" },
  { code: "ps-AF", bcp: "ps-AF", flag: "🇦🇫", label: "پښتو" },
  { code: "hi-IN", bcp: "hi-IN", flag: "🇮🇳", label: "हिंदी" },
  { code: "tl-PH", bcp: "tl-PH", flag: "🇵🇭", label: "Filipino" }
];
function EmployeePage() {
  const { lang, setLang, t } = useEmpLang();
  const [empScreen, setEmpScreen] = reactExports.useState("checking");
  const [token, setToken] = reactExports.useState(null);
  const [empName, setEmpName] = reactExports.useState("");
  const [hasBiometrics, setHasBio] = reactExports.useState(false);
  const [deviceHasFid, setDevFid] = reactExports.useState(false);
  const [showLoginForm, setShowLoginForm] = reactExports.useState(false);
  const autoTriggered = reactExports.useRef(false);
  const [phone, setPhone] = reactExports.useState("");
  const [pin, setPin] = reactExports.useState("");
  const [loginErr, setLoginErr] = reactExports.useState("");
  const [loggingIn, setLoggingIn] = reactExports.useState(false);
  const initLoginScreen = reactExports.useCallback(async () => {
    const stored = loadStoredToken();
    if (stored) {
      setToken(stored.token);
      setEmpName(stored.name);
      return;
    }
    const bio = await hasPlatformBiometrics$1();
    setHasBio(bio);
    const localCredId = localStorage.getItem(EMP_FID_KEY);
    const hasFid = bio && !!localCredId;
    setDevFid(hasFid);
    setShowLoginForm(!hasFid);
    setEmpScreen("login");
    if (hasFid && !autoTriggered.current) {
      autoTriggered.current = true;
      setTimeout(() => void triggerEmpFaceID(localCredId), 350);
    }
  }, []);
  reactExports.useEffect(() => {
    void initLoginScreen();
  }, [initLoginScreen]);
  async function triggerEmpFaceID(localCredId) {
    setLoggingIn(true);
    setLoginErr("");
    try {
      const optRes = await fetch(`${API$1()}/api/employee/webauthn/login-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId: localCredId })
      });
      if (!optRes.ok) throw new Error("Failed to get options");
      const { challengeId, ...optionsJSON } = await optRes.json();
      const credential = await startAuthentication({ optionsJSON });
      const verRes = await fetch(`${API$1()}/api/employee/webauthn/login-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: credential, challengeId })
      });
      if (!verRes.ok) throw new Error("Verification failed");
      const data = await verRes.json();
      if (!data.ok || !data.token) throw new Error("No token");
      saveEmpToken(data.token, data.name ?? "");
      setToken(data.token);
      setEmpName(data.name ?? "");
    } catch {
      setLoginErr(t("faceIdFailed"));
      setShowLoginForm(true);
    } finally {
      setLoggingIn(false);
    }
  }
  const login = async () => {
    setLoggingIn(true);
    setLoginErr("");
    try {
      const r2 = await fetch(`${API$1()}/api/employee/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), pin })
      });
      const d = await r2.json();
      if (!r2.ok || !d.ok) {
        setLoginErr(d.error ? d.error === "Invalid phone or PIN" ? t("invalidLogin") : d.error : t("invalidLogin"));
        return;
      }
      saveEmpToken(d.token, d.name);
      setToken(d.token);
      setEmpName(d.name);
      const ua = navigator.userAgent;
      const isMobile = /iPhone|iPad|Android/i.test(ua);
      if (hasBiometrics && !localStorage.getItem(EMP_FID_KEY) && isMobile) {
        setEmpScreen("register-fid");
      }
    } catch {
      setLoginErr(t("connError"));
    } finally {
      setLoggingIn(false);
    }
  };
  const handleRegisterFaceID = async () => {
    if (!token) return;
    setLoggingIn(true);
    setLoginErr("");
    try {
      const optRes = await fetch(`${API$1()}/api/employee/webauthn/register-options`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!optRes.ok) throw new Error("Failed to get options");
      const { challengeId, ...optionsJSON } = await optRes.json();
      const credential = await startRegistration({ optionsJSON });
      const verRes = await fetch(`${API$1()}/api/employee/webauthn/register-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ response: credential, label: /iPhone/.test(navigator.userAgent) ? "iPhone" : /iPad/.test(navigator.userAgent) ? "iPad" : "Android", challengeId })
      });
      if (!verRes.ok) throw new Error("Registration failed");
      const data = await verRes.json();
      if (data.credentialId) localStorage.setItem(EMP_FID_KEY, data.credentialId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("cancel") && !msg.includes("abort") && !msg.includes("NotAllowed")) {
        setLoginErr(t("faceIdRegFailed"));
      }
    } finally {
      setLoggingIn(false);
      setEmpScreen("checking");
    }
  };
  const logout = () => {
    clearEmpToken();
    setToken(null);
    setEmpName("");
    setLoginErr("");
    autoTriggered.current = false;
    void initLoginScreen();
  };
  const [tab, setTab] = reactExports.useState("jobs");
  const [bookings, setBookings] = reactExports.useState([]);
  const [payrollRecords, setPayrollRecords] = reactExports.useState([]);
  const [profile, setProfile] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [apiErr, setApiErr] = reactExports.useState("");
  const [empStats, setEmpStats] = reactExports.useState(null);
  const [justClosedId, setJustClosedId] = reactExports.useState(null);
  const [jobsTab, setJobsTab] = reactExports.useState("active");
  const [jobSearch, setJobSearch] = reactExports.useState("");
  const [sendingReviewId, setSendingReviewId] = reactExports.useState(null);
  const greenTimerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    return () => {
      if (greenTimerRef.current) clearTimeout(greenTimerRef.current);
    };
  }, []);
  const authH = reactExports.useCallback(() => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }), [token]);
  const [estimateHistory, setEstimateHistory] = reactExports.useState({});
  const loadLastEstimate = reactExports.useCallback(async (bookingId) => {
    if (!token) return;
    try {
      const r2 = await fetch(`${API$1()}/api/employee/bookings/${bookingId}/estimates`, { headers: authH(), cache: "no-store" });
      if (!r2.ok) return;
      const d = await r2.json();
      setEstimateHistory((prev) => ({ ...prev, [bookingId]: d.estimate ?? null }));
    } catch {
    }
  }, [token, authH]);
  const [downloadingReceiptId, setDownloadingReceiptId] = reactExports.useState(null);
  const downloadReceipt = reactExports.useCallback(async (b) => {
    if (!token || downloadingReceiptId) return;
    setDownloadingReceiptId(b.id);
    try {
      const langOverride = b.client_lang === "es" ? "es" : b.client_lang === "en" ? "en" : b.payment_language === "es" ? "es" : b.payment_language === "en" ? "en" : null;
      const url = `${API$1()}/api/employee/bookings/${b.id}/invoice-html` + (langOverride ? `?lang=${langOverride}` : "");
      await downloadReceiptPdf({
        url,
        headers: { "Authorization": `Bearer ${token}` },
        filenameBase: `receipt-${b.id}`
      });
    } catch {
      window.alert(t("receiptError"));
    } finally {
      setDownloadingReceiptId(null);
    }
  }, [token, downloadingReceiptId, t]);
  const loadBookings = reactExports.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r2 = await fetch(`${API$1()}/api/employee/bookings`, { headers: authH() });
      if (r2.status === 401) {
        logout();
        return;
      }
      const d = await r2.json();
      const bks = d.bookings ?? [];
      setBookings(bks);
      setApiErr("");
      const inlineEstimates = {};
      const needsFetch = [];
      for (const b of bks) {
        if (b.status === "completed" || b.employee_archived_at) continue;
        if (b.last_estimate_id != null) {
          inlineEstimates[b.id] = {
            id: b.last_estimate_id,
            total: b.last_estimate_total ?? 0,
            no_tax: b.last_estimate_no_tax ?? false,
            sent_at: b.last_estimate_sent_at ?? "",
            items: b.last_estimate_items ?? [],
            notes: b.last_estimate_notes ?? null
          };
        } else {
          needsFetch.push(b.id);
        }
      }
      if (Object.keys(inlineEstimates).length > 0) {
        setEstimateHistory((prev) => ({ ...prev, ...inlineEstimates }));
      }
      if (needsFetch.length > 0) {
        void Promise.all(needsFetch.map((id2) => loadLastEstimate(id2)));
      }
    } catch {
      setApiErr(t("connError"));
    } finally {
      setLoading(false);
    }
  }, [token, authH, t, loadLastEstimate]);
  const [archivingId, setArchivingId] = reactExports.useState(null);
  const archivingRef = reactExports.useRef(false);
  const archiveJob = reactExports.useCallback(async (id2) => {
    if (!token || archivingRef.current) return;
    archivingRef.current = true;
    setArchivingId(id2);
    try {
      const r2 = await fetch(`${API$1()}/api/employee/bookings/${id2}/archive`, {
        method: "POST",
        headers: authH()
      });
      if (r2.status === 401) {
        logout();
        return;
      }
      if (r2.ok) {
        setBookings((prev) => prev.map((b) => b.id === id2 ? { ...b, employee_archived_at: (/* @__PURE__ */ new Date()).toISOString() } : b));
      } else if (r2.status === 404) {
        setBookings((prev) => prev.filter((b) => b.id !== id2));
      } else {
        const d = await r2.json().catch(() => ({}));
        window.alert(d.error ?? `Error ${r2.status}`);
      }
    } catch (e) {
      window.alert("Network error");
      console.error("[archive]", e);
    } finally {
      archivingRef.current = false;
      setArchivingId(null);
    }
  }, [token, authH]);
  const restoreJob = reactExports.useCallback(async (id2) => {
    if (!token || archivingRef.current) return;
    archivingRef.current = true;
    setArchivingId(id2);
    try {
      const r2 = await fetch(`${API$1()}/api/employee/bookings/${id2}/unarchive`, {
        method: "POST",
        headers: authH()
      });
      if (r2.status === 401) {
        logout();
        return;
      }
      if (r2.ok) {
        setBookings((prev) => prev.map((b) => b.id === id2 ? { ...b, employee_archived_at: null } : b));
      } else if (r2.status === 404) {
        setBookings((prev) => prev.filter((b) => b.id !== id2));
      } else {
        const d = await r2.json().catch(() => ({}));
        window.alert(d.error ?? `Error ${r2.status}`);
      }
    } catch (e) {
      window.alert("Network error");
      console.error("[restore]", e);
    } finally {
      archivingRef.current = false;
      setArchivingId(null);
    }
  }, [token, authH]);
  const sendReviewSms = reactExports.useCallback(async (id2, tFn) => {
    if (!token || sendingReviewId) return;
    setSendingReviewId(id2);
    try {
      const r2 = await fetch(`${API$1()}/api/employee/bookings/${id2}/send-review`, {
        method: "POST",
        headers: authH()
      });
      if (r2.status === 401) {
        logout();
        return;
      }
      if (r2.ok) {
        window.alert(tFn("reviewSent"));
      } else {
        const d = await r2.json().catch(() => ({}));
        window.alert(d.error ?? `Error ${r2.status}`);
      }
    } catch {
      window.alert("Network error");
    } finally {
      setSendingReviewId(null);
    }
  }, [token, authH, sendingReviewId]);
  const loadPayroll = reactExports.useCallback(async () => {
    if (!token) return;
    try {
      const r2 = await fetch(`${API$1()}/api/employee/payroll`, { headers: authH() });
      const d = await r2.json();
      setPayrollRecords(d.records ?? []);
    } catch {
    }
  }, [token, authH]);
  const loadProfile = reactExports.useCallback(async () => {
    if (!token) return;
    try {
      const r2 = await fetch(`${API$1()}/api/employee/me`, { headers: authH() });
      const d = await r2.json();
      setProfile(d.employee ?? null);
    } catch {
    }
  }, [token, authH]);
  const loadStats = reactExports.useCallback(async () => {
    if (!token) return;
    try {
      const r2 = await fetch(`${API$1()}/api/employee/stats`, { headers: authH() });
      const d = await r2.json();
      if (d.ok && d.stats) setEmpStats(d.stats);
    } catch {
    }
  }, [token, authH]);
  const loadPhotos = reactExports.useCallback(async (bookingId) => {
    if (!token) return;
    setPhotosLoading(true);
    try {
      const r2 = await fetch(`${API$1()}/api/employee/bookings/${bookingId}/photos`, { headers: authH() });
      const d = await r2.json();
      if (r2.ok && d.photos) setBookingPhotos((prev) => ({ ...prev, [bookingId]: d.photos }));
    } catch {
    } finally {
      setPhotosLoading(false);
    }
  }, [token, authH]);
  const uploadPhotos = reactExports.useCallback(async (bookingId, files) => {
    if (!token || files.length === 0) return;
    const limited = files.slice(0, 10);
    setUploadProgress({ current: 0, total: limited.length });
    let failed = 0;
    try {
      for (let i = 0; i < limited.length; i++) {
        setUploadProgress({ current: i + 1, total: limited.length });
        try {
          const r1 = await fetch(`${API$1()}/api/employee/bookings/${bookingId}/photos/request-url`, { method: "POST", headers: authH() });
          const d1 = await r1.json();
          if (!r1.ok || !d1.signedUrl || !d1.objectKey) throw new Error(d1.error ?? "no url");
          await fetch(d1.signedUrl, { method: "PUT", headers: { "Content-Type": limited[i].type || "image/jpeg" }, body: limited[i] });
          const r2 = await fetch(`${API$1()}/api/employee/bookings/${bookingId}/photos`, {
            method: "POST",
            headers: authH(),
            body: JSON.stringify({ objectKey: d1.objectKey })
          });
          if (!r2.ok) throw new Error("register failed");
        } catch {
          failed++;
        }
      }
      await loadPhotos(bookingId);
      if (failed > 0) window.alert(`${t("photoUploadFail")}: ${failed}/${limited.length}`);
    } finally {
      setUploadProgress(null);
    }
  }, [token, authH, loadPhotos, t]);
  const deletePhoto = reactExports.useCallback(async (bookingId, photoId) => {
    if (!token) return;
    await fetch(`${API$1()}/api/employee/bookings/${bookingId}/photos/${photoId}`, { method: "DELETE", headers: authH() });
    setBookingPhotos((prev) => ({ ...prev, [bookingId]: (prev[bookingId] ?? []).filter((p) => p.id !== photoId) }));
  }, [token, authH]);
  const openPhotoModal = reactExports.useCallback((bookingId) => {
    setPhotoModalId(bookingId);
    void loadPhotos(bookingId);
  }, [loadPhotos]);
  reactExports.useEffect(() => {
    if (!token) return;
    clearAppBadge();
    notifySwBadgeClear();
    localStorage.setItem(EMP_LAST_SEEN_KEY, (/* @__PURE__ */ new Date()).toISOString());
    notifySwBadgeInit(token);
    loadBookings();
    loadPayroll();
    loadProfile();
    loadStats();
  }, [token, loadBookings, loadPayroll, loadProfile, loadStats]);
  reactExports.useEffect(() => {
    if (!token) return;
    const onVisChange = () => {
      if (!document.hidden) {
        clearAppBadge();
        notifySwBadgeClear();
        localStorage.setItem(EMP_LAST_SEEN_KEY, (/* @__PURE__ */ new Date()).toISOString());
        notifySwBadgeInit(token);
        void loadBookings();
      }
    };
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, [token, loadBookings]);
  const [empCallLoading, setEmpCallLoading] = reactExports.useState(/* @__PURE__ */ new Set());
  const handleEmpCallback = reactExports.useCallback(async (clientPhone, bookingId, clientName, clientLang, clientGender = "male") => {
    if (empCallLoading.has(bookingId)) return { ok: false, text: "Already loading" };
    setEmpCallLoading((prev) => new Set(prev).add(bookingId));
    try {
      const r2 = await fetch(`${API$1()}/api/employee/voice/callback`, {
        method: "POST",
        headers: { ...authH(), "Content-Type": "application/json" },
        body: JSON.stringify({ client_phone: clientPhone, client_name: clientName ?? "", client_language: clientLang ?? "en", client_gender: clientGender })
      });
      const d = await r2.json();
      if (!r2.ok) throw new Error(d.error ?? "Error");
      return { ok: true, text: "📞 Ваш телефон скоро зазвонит с номера (606). Ответьте — система соединит с клиентом." };
    } catch (err) {
      return { ok: false, text: err instanceof Error ? err.message : "Ошибка звонка" };
    } finally {
      setEmpCallLoading((prev) => {
        const s = new Set(prev);
        s.delete(bookingId);
        return s;
      });
    }
  }, [empCallLoading]);
  const isTokenExpired = reactExports.useCallback(() => {
    const stored = loadStoredToken();
    if (!stored) return true;
    try {
      const payload = JSON.parse(atob(stored.token.split(".")[1]));
      return typeof payload.exp === "number" && payload.exp * 1e3 < Date.now();
    } catch {
      return true;
    }
  }, []);
  const openTranslator = reactExports.useCallback(() => {
    if (isTokenExpired()) {
      logout();
      return;
    }
    setTranslatorOpen(true);
    setTranslatorResult(null);
    setTranslatorOrig("");
    setTranslatorError("");
  }, [isTokenExpired, logout]);
  const [translatorOpen, setTranslatorOpen] = reactExports.useState(false);
  const [translatorListening, setTranslatorListening] = reactExports.useState(false);
  const [translatorLang, setTranslatorLang] = reactExports.useState("ru-RU");
  const [translatorCustomerLang, setTranslatorCustomerLang] = reactExports.useState("en-US");
  const [translatorPickerFor, setTranslatorPickerFor] = reactExports.useState("me");
  const [translatorOrig, setTranslatorOrig] = reactExports.useState("");
  const [translatorResult, setTranslatorResult] = reactExports.useState(null);
  const [translatorLoading, setTranslatorLoading] = reactExports.useState(false);
  const [translatorError, setTranslatorError] = reactExports.useState("");
  const [translatorAudioUrl, setTranslatorAudioUrl] = reactExports.useState(null);
  const [translatorContinuous, setTranslatorContinuous] = reactExports.useState(false);
  const [translatorPhase, setTranslatorPhase] = reactExports.useState("idle");
  const continuousRef = reactExports.useRef(false);
  const recognitionRef = reactExports.useRef(null);
  const srTimeoutRef = reactExports.useRef(null);
  const clearSrTimeout = reactExports.useCallback(() => {
    if (srTimeoutRef.current) {
      clearTimeout(srTimeoutRef.current);
      srTimeoutRef.current = null;
    }
  }, []);
  const stopListening = reactExports.useCallback(() => {
    clearSrTimeout();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setTranslatorListening(false);
  }, [clearSrTimeout]);
  const startListening = reactExports.useCallback((myLang, customerLang) => {
    const w = window;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      setTranslatorError("Speech recognition not supported in this browser");
      return;
    }
    stopListening();
    const rec = new SR();
    rec.lang = myLang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;
    setTranslatorListening(true);
    setTranslatorPhase("listening");
    setTranslatorOrig("");
    setTranslatorResult(null);
    setTranslatorError("");
    srTimeoutRef.current = setTimeout(() => {
      rec.stop();
      setTranslatorListening(false);
      setTranslatorError("No speech detected — tap mic and try again");
    }, 2e4);
    const myInfo = TRANSLATOR_LANGS.find((l) => l.code === myLang) ?? TRANSLATOR_LANGS[0];
    const customerInfo = TRANSLATOR_LANGS.find((l) => l.code === customerLang) ?? TRANSLATOR_LANGS[1];
    rec.onresult = (event) => {
      clearSrTimeout();
      const text = event.results[0]?.[0]?.transcript ?? "";
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setTranslatorListening(false);
      setTranslatorOrig(text);
      if (!text) {
        if (continuousRef.current) setTimeout(() => startListening(myLang, customerLang), 500);
        else setTranslatorPhase("idle");
        return;
      }
      setTranslatorLoading(true);
      setTranslatorPhase("translating");
      fetch(`${API$1()}/api/employee/translate`, {
        method: "POST",
        headers: { ...authH(), "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          myLang: myInfo.label,
          myLangCode: myInfo.bcp.split("-")[0],
          customerLang: customerInfo.label,
          customerLangCode: customerInfo.bcp.split("-")[0]
        })
      }).then(async (r2) => {
        if (r2.status === 401 || r2.status === 403) {
          continuousRef.current = false;
          setTranslatorContinuous(false);
          logout();
          return null;
        }
        return r2.json();
      }).then((d) => {
        if (!d) return;
        if (d.ok && d.translation) {
          const result = { detected: d.detected, target: d.target, translation: d.translation };
          setTranslatorResult(result);
          setTranslatorPhase("speaking");
          const afterPlay = () => {
            if (continuousRef.current) {
              setTranslatorPhase("listening");
              setTimeout(() => startListening(myLang, customerLang), 400);
            } else {
              setTranslatorPhase("idle");
            }
          };
          fetch(`${API$1()}/api/employee/tts`, {
            method: "POST",
            headers: { ...authH(), "Content-Type": "application/json" },
            body: JSON.stringify({ text: result.translation, lang: result.target })
          }).then(async (ttsRes) => {
            if (!ttsRes.ok) throw new Error("TTS failed");
            const blob = await ttsRes.blob();
            const url = URL.createObjectURL(blob);
            setTranslatorAudioUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return url;
            });
            const audio = new Audio(url);
            audio.onended = afterPlay;
            audio.onerror = afterPlay;
            return audio.play();
          }).catch(() => {
            const utter = new SpeechSynthesisUtterance(result.translation);
            utter.lang = TRANSLATOR_LANGS.find((l) => l.bcp.startsWith(result.target + "-") || l.bcp === result.target)?.bcp ?? "en-US";
            utter.onend = afterPlay;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
          });
        } else {
          setTranslatorError(d.error ?? "Translation failed");
          setTranslatorPhase("idle");
          continuousRef.current = false;
          setTranslatorContinuous(false);
        }
      }).catch(() => {
        setTranslatorError("Network error — check your internet connection");
        setTranslatorPhase("idle");
        continuousRef.current = false;
        setTranslatorContinuous(false);
      }).finally(() => setTranslatorLoading(false));
    };
    rec.onerror = (e) => {
      clearSrTimeout();
      setTranslatorListening(false);
      setTranslatorPhase("idle");
      const code = e?.error ?? "";
      if (code === "aborted") {
        return;
      }
      continuousRef.current = false;
      setTranslatorContinuous(false);
      setTranslatorError(
        code === "not-allowed" ? "❌ Microphone blocked — go to Settings › Safari › Microphone and allow" : code === "no-speech" ? "No speech detected — tap mic and try again" : code === "language-not-supported" ? "This language is not supported by your browser for recording" : code === "network" ? "Network error — check your internet connection" : `Microphone error: ${code || "unknown"}`
      );
    };
    rec.onend = () => {
      clearSrTimeout();
      setTranslatorListening(false);
    };
    try {
      rec.start();
    } catch {
      clearSrTimeout();
      setTranslatorListening(false);
      setTranslatorError("Failed to start microphone — tap mic to try again");
    }
  }, [stopListening, clearSrTimeout, logout]);
  const toggleConversation = reactExports.useCallback((myLang, customerLang) => {
    if (continuousRef.current) {
      continuousRef.current = false;
      setTranslatorContinuous(false);
      setTranslatorPhase("idle");
      stopListening();
      window.speechSynthesis.cancel();
    } else {
      continuousRef.current = true;
      setTranslatorContinuous(true);
      setTranslatorError("");
      setTranslatorResult(null);
      setTranslatorOrig("");
      startListening(myLang, customerLang);
    }
  }, [startListening, stopListening]);
  const [emailEditId, setEmailEditId] = reactExports.useState(null);
  const [emailEditVal, setEmailEditVal] = reactExports.useState("");
  const [emailEditSaving, setEmailEditSaving] = reactExports.useState(false);
  const [emailEditMsg, setEmailEditMsg] = reactExports.useState(null);
  const saveClientEmail = async (bookingId) => {
    const val = emailEditVal.trim().toLowerCase();
    if (!val.includes("@") || !val.includes(".")) return;
    setEmailEditSaving(true);
    setEmailEditMsg(null);
    try {
      const r2 = await fetch(`${API$1()}/api/employee/bookings/${bookingId}/email`, {
        method: "PATCH",
        headers: { ...authH(), "Content-Type": "application/json" },
        body: JSON.stringify({ email: val })
      });
      const d = await r2.json();
      if (r2.ok && d.ok && d.email) {
        setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, email: d.email } : b));
        setEmailEditMsg({ ok: true, text: t("emailSaved") });
        setTimeout(() => {
          setEmailEditId(null);
          setEmailEditMsg(null);
        }, 1500);
      } else {
        setEmailEditMsg({ ok: false, text: d.error ?? t("emailSaveErr") });
      }
    } catch {
      setEmailEditMsg({ ok: false, text: t("emailSaveErr") });
    } finally {
      setEmailEditSaving(false);
    }
  };
  const [closeTarget, setCloseTarget] = reactExports.useState(null);
  const [closeAmount, setCloseAmount] = reactExports.useState("");
  const [closeWork, setCloseWork] = reactExports.useState("");
  const [closeParts, setCloseParts] = reactExports.useState([]);
  const [closePayment, setClosePayment] = reactExports.useState("cash");
  const [closeNotify, setCloseNotify] = reactExports.useState("email");
  const [closeLang, setCloseLang] = reactExports.useState("en");
  const [closing, setClosing] = reactExports.useState(false);
  const [closeErr, setCloseErr] = reactExports.useState("");
  const [closePartsCost, setClosePartsCost] = reactExports.useState("");
  const [closeTax, setCloseTax] = reactExports.useState(true);
  const [photoModalId, setPhotoModalId] = reactExports.useState(null);
  const [bookingPhotos, setBookingPhotos] = reactExports.useState({});
  const [photosLoading, setPhotosLoading] = reactExports.useState(false);
  const [uploadProgress, setUploadProgress] = reactExports.useState(null);
  const signatureRef = reactExports.useRef(null);
  const sigDrawingRef = reactExports.useRef(false);
  const [sigHasData, setSigHasData] = reactExports.useState(false);
  const [sigConsentGiven, setSigConsentGiven] = reactExports.useState(true);
  const [estimateTarget, setEstimateTarget] = reactExports.useState(null);
  const [estimateItems, setEstimateItems] = reactExports.useState([]);
  const [estimateNotes, setEstimateNotes] = reactExports.useState("");
  const [pricebook, setPricebook] = reactExports.useState([]);
  const [estimateNoTax, setEstimateNoTax] = reactExports.useState(false);
  const [estimateNotify, setEstimateNotify] = reactExports.useState("email");
  const [estimateSending, setEstimateSending] = reactExports.useState(false);
  const [estimateErr, setEstimateErr] = reactExports.useState("");
  const [estimateDone, setEstimateDone] = reactExports.useState(false);
  const [estimateIsEdit, setEstimateIsEdit] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const onEmployeeBack = () => {
      if (closeTarget) {
        setCloseTarget(null);
        return;
      }
      if (estimateTarget) {
        setEstimateTarget(null);
        return;
      }
      if (photoModalId) {
        setPhotoModalId(null);
        return;
      }
      if (translatorOpen) {
        setTranslatorOpen(false);
        stopListening();
        window.speechSynthesis.cancel();
        return;
      }
      window.history.back();
    };
    window.addEventListener("htr-employee-back", onEmployeeBack);
    return () => window.removeEventListener("htr-employee-back", onEmployeeBack);
  }, [closeTarget, estimateTarget, photoModalId, translatorOpen, stopListening]);
  const loadPricebook = reactExports.useCallback(async () => {
    if (!token) return;
    try {
      const r2 = await fetch(`${API$1()}/api/employee/pricebook`, { headers: authH() });
      const d = await r2.json();
      setPricebook(d.items ?? []);
    } catch {
    }
  }, [token, authH]);
  const openEstimateModal = (b, prev) => {
    setEstimateTarget(b);
    setEstimateIsEdit(!!prev);
    if (prev && prev.items.length > 0) {
      setEstimateItems(prev.items);
      setEstimateNotes(prev.notes ?? "");
      setEstimateNoTax(prev.no_tax);
    } else {
      setEstimateItems([{ description: "", category: "Labor", qty: 1, unit_price: 0 }]);
      setEstimateNotes("");
      setEstimateNoTax(false);
    }
    setEstimateErr("");
    setEstimateDone(false);
    const hasEmail = !!b.email?.trim();
    const hasPhone = !!b.phone?.trim();
    setEstimateNotify(hasEmail && hasPhone ? "both" : hasEmail ? "email" : "sms");
    void loadPricebook();
  };
  const addEstimateItem = () => setEstimateItems((prev) => [...prev, { description: "", category: "Labor", qty: 1, unit_price: 0 }]);
  const removeEstimateItem = (i) => setEstimateItems((prev) => prev.filter((_, idx) => idx !== i));
  const setEstimateItemField = (i, field, value) => setEstimateItems((prev) => prev.map(
    (item, idx) => idx === i ? { ...item, [field]: value } : item
  ));
  const addFromPricebook = (pb) => setEstimateItems((prev) => [...prev, {
    description: pb.name,
    category: pb.category,
    qty: 1,
    unit_price: Number(pb.unit_price)
  }]);
  const submitEstimate = async () => {
    if (!estimateTarget) return;
    const validItems = estimateItems.filter((i) => i.description.trim() && i.unit_price >= 0);
    if (!validItems.length) {
      setEstimateErr(t("estimateItems") + " required");
      return;
    }
    setEstimateSending(true);
    setEstimateErr("");
    try {
      const r2 = await fetch(`${API$1()}/api/employee/bookings/${estimateTarget.id}/estimate`, {
        method: "POST",
        headers: authH(),
        body: JSON.stringify({ items: validItems, notes: estimateNotes.trim() || null, no_tax: estimateNoTax, notify_via: estimateNotify })
      });
      const d = await r2.json();
      if (!r2.ok || !d.ok) {
        setEstimateErr(d.error ?? t("estimateErr"));
        return;
      }
      setEstimateDone(true);
      if (d.estimate_id != null && d.total != null) {
        const targetId = estimateTarget.id;
        setEstimateHistory((prev) => ({
          ...prev,
          [targetId]: {
            id: d.estimate_id,
            total: d.total,
            no_tax: estimateNoTax,
            sent_at: (/* @__PURE__ */ new Date()).toISOString(),
            items: validItems,
            notes: estimateNotes.trim() || null
          }
        }));
      } else {
        void loadLastEstimate(estimateTarget.id);
      }
      setTimeout(() => setEstimateTarget(null), 1800);
    } catch {
      setEstimateErr(t("estimateErr"));
    } finally {
      setEstimateSending(false);
    }
  };
  const openCloseModal = (b) => {
    setCloseTarget(b);
    setCloseAmount("");
    setCloseWork("");
    setCloseParts([]);
    setClosePayment("cash");
    setClosePartsCost("");
    setCloseTax(true);
    const hasEmail = !!b.email?.trim();
    const hasPhone = !!b.phone?.trim();
    setCloseNotify(hasEmail ? "email" : hasPhone ? "sms" : "email");
    const savedLang = b.client_lang === "es" ? "es" : b.client_lang === "en" ? "en" : b.payment_language === "es" ? "es" : b.payment_language === "en" ? "en" : "en";
    setCloseLang(savedLang);
    setCloseErr("");
    setSigHasData(false);
    setSigConsentGiven(true);
  };
  const addPart = () => setCloseParts((p) => [...p, ""]);
  const removePart = (i) => setCloseParts((p) => p.filter((_, idx) => idx !== i));
  const setPart = (i, v) => setCloseParts((p) => p.map((x, idx) => idx === i ? v : x));
  const getCanvasPt = (cv, cx2, cy) => {
    const r2 = cv.getBoundingClientRect();
    return { x: (cx2 - r2.left) * (cv.width / r2.width), y: (cy - r2.top) * (cv.height / r2.height) };
  };
  const sigStart = (e) => {
    const cv = signatureRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    sigDrawingRef.current = true;
    const p = getCanvasPt(cv, e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const sigMove = (e) => {
    if (!sigDrawingRef.current) return;
    const cv = signatureRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const p = getCanvasPt(cv, e.clientX, e.clientY);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    if (!sigHasData) setSigHasData(true);
  };
  const sigTouchStart = (e) => {
    e.preventDefault();
    const cv = signatureRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    sigDrawingRef.current = true;
    const t0 = e.touches[0];
    const p = getCanvasPt(cv, t0.clientX, t0.clientY);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const sigTouchMove = (e) => {
    e.preventDefault();
    if (!sigDrawingRef.current) return;
    const cv = signatureRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const t0 = e.touches[0];
    const p = getCanvasPt(cv, t0.clientX, t0.clientY);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    if (!sigHasData) setSigHasData(true);
  };
  const sigStop = () => {
    sigDrawingRef.current = false;
  };
  const clearSig = () => {
    const cv = signatureRef.current;
    if (cv) cv.getContext("2d")?.clearRect(0, 0, cv.width, cv.height);
    setSigHasData(false);
  };
  const submitClose = async () => {
    if (!closeTarget) return;
    const amount = parseFloat(closeAmount);
    if (!closeAmount || !Number.isFinite(amount)) {
      setCloseErr(t("repairAmountReq"));
      return;
    }
    if (!closeWork.trim()) {
      setCloseErr(t("workPerformedReq"));
      return;
    }
    setClosing(true);
    setCloseErr("");
    try {
      const capturedSig = sigHasData && signatureRef.current ? signatureRef.current.toDataURL("image/png") : null;
      const capturedConsent = sigConsentGiven;
      const partsCostVal = parseFloat(closePartsCost);
      const r2 = await fetch(`${API$1()}/api/employee/bookings/${closeTarget.id}/close`, {
        method: "POST",
        headers: authH(),
        body: JSON.stringify({
          payment_method: closePayment === "cash" ? "Cash" : closePayment === "zelle" ? "Zelle" : closePayment === "tap_to_pay" ? "Tap to Pay (Stripe)" : "Online (Stripe)",
          payment_amount: amount,
          work_description: closeWork.trim(),
          parts_replaced: closeParts.map((p) => p.trim()).filter(Boolean),
          suggest_review: true,
          lang: closeLang,
          parts_cost: Number.isFinite(partsCostVal) ? partsCostVal : null,
          notify_via: closePayment === "online" && (closeTarget?.email || closeTarget?.phone) ? closeNotify : void 0,
          no_tax: !closeTax,
          signature_data_url: capturedSig,
          signature_consent: capturedConsent
        })
      });
      const d = await r2.json();
      if (!r2.ok || !d.ok) {
        setCloseErr(d.error ?? t("errorClosing"));
        return;
      }
      const capturedAuthH = authH();
      const closedId = closeTarget.id;
      setCloseTarget(null);
      setSigHasData(false);
      setSigConsentGiven(true);
      if (capturedSig) {
        void fetch(`${API$1()}/api/employee/bookings/${closedId}/signature`, {
          method: "POST",
          headers: capturedAuthH,
          body: JSON.stringify({ imageData: capturedSig, consentGiven: capturedConsent })
        }).catch(() => {
        });
      }
      setJustClosedId(closedId);
      if (greenTimerRef.current) clearTimeout(greenTimerRef.current);
      greenTimerRef.current = setTimeout(async () => {
        setJustClosedId(null);
        await loadBookings();
        void loadStats();
      }, 2e3);
    } catch {
      setCloseErr(t("connError"));
    } finally {
      setClosing(false);
    }
  };
  const LangPicker = () => {
    const langs = [
      { code: "en", flag: "🇺🇸" },
      { code: "ru", flag: "🇷🇺" },
      { code: "es", flag: "🇪🇸" },
      { code: "tr", flag: "🇹🇷" },
      { code: "az", flag: "🇦🇿" },
      { code: "uk", flag: "🇺🇦" }
    ];
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 }, children: langs.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setLang(l.code),
        style: {
          padding: "4px 8px",
          borderRadius: 6,
          border: lang === l.code ? `1.5px solid ${ACCENT$3}` : "1.5px solid #e2e8f0",
          background: lang === l.code ? "#f0f7ff" : "#fff",
          fontSize: 12,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: l.flag }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: lang === l.code ? 700 : 400, textTransform: "uppercase" }, children: l.code })
        ]
      },
      l.code
    )) });
  };
  if (empScreen === "checking" && !token) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      position: "fixed",
      inset: 0,
      background: "#0f172a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        width: 40,
        height: 40,
        border: "3px solid #1B6FE8",
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `@keyframes spin { to { transform: rotate(360deg); } } @keyframes ping { 75%,100% { transform: scale(1.8); opacity: 0; } }` })
    ] });
  }
  if (empScreen === "register-fid" && token) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      position: "fixed",
      inset: 0,
      background: "#0f172a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999,
      padding: "20px"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      background: "#fff",
      borderRadius: 20,
      padding: "36px 28px",
      width: "min(380px, 100%)",
      textAlign: "center",
      boxShadow: "0 24px 80px rgba(0,0,0,0.4)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 52, marginBottom: 12 }, children: "🔒" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#0f172a" }, children: t("fidEnableTitle") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 24px", fontSize: 14, color: "#64748b", lineHeight: 1.5 }, children: t("fidEnableDesc") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => void handleRegisterFaceID(),
          disabled: loggingIn,
          style: {
            width: "100%",
            padding: "13px",
            marginBottom: 10,
            background: loggingIn ? "#93c5fd" : ACCENT$3,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: loggingIn ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 20 }, children: "👤" }),
            loggingIn ? t("fidRegistering") : t("fidEnable")
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setEmpScreen("checking"),
          disabled: loggingIn,
          style: {
            width: "100%",
            padding: "12px",
            background: "transparent",
            color: "#64748b",
            border: "1.5px solid #e2e8f0",
            borderRadius: 10,
            fontSize: 14,
            cursor: loggingIn ? "not-allowed" : "pointer"
          },
          children: t("fidSkip")
        }
      ),
      loginErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { marginTop: 10, color: "#ef4444", fontSize: 13 }, children: loginErr })
    ] }) });
  }
  if (!token) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      minHeight: "100dvh",
      background: "#f8fafc",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: "/htr-logo-nobg.png",
          alt: "",
          "aria-hidden": "true",
          className: "emp-side-logo emp-side-logo-left",
          style: {
            position: "absolute",
            left: 4,
            top: "50%",
            transform: "translateY(-50%)",
            objectFit: "contain",
            opacity: 0.75,
            pointerEvents: "none",
            userSelect: "none"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: "/htr-logo-nobg.png",
          alt: "",
          "aria-hidden": "true",
          className: "emp-side-logo emp-side-logo-right",
          style: {
            position: "absolute",
            right: 4,
            top: "50%",
            transform: "translateY(-50%)",
            objectFit: "contain",
            opacity: 0.75,
            pointerEvents: "none",
            userSelect: "none"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        width: "100%",
        maxWidth: 360,
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
        padding: "32px 24px",
        position: "relative",
        zIndex: 1
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", marginBottom: 28 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            width: 56,
            height: 56,
            borderRadius: 16,
            background: ACCENT$3,
            margin: "0 auto 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { style: { width: 28, height: 28, color: "#fff" } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 800, fontSize: 20, color: "#0f172a" }, children: "HTRGroup" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 13, color: "#64748b", marginTop: 4 }, children: t("title") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LangPicker, {}),
        deviceHasFid && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              const c = localStorage.getItem(EMP_FID_KEY) ?? "";
              void triggerEmpFaceID(c);
            },
            disabled: loggingIn,
            style: {
              width: "100%",
              padding: "16px",
              marginBottom: 8,
              background: loggingIn ? "#f1f5f9" : "#0f172a",
              color: loggingIn ? "#94a3b8" : "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: loggingIn ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 22 }, children: "👤" }),
              loggingIn ? t("fidChecking") : t("fidSignIn")
            ]
          }
        ),
        loginErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 10px", fontSize: 13, color: "#ef4444", textAlign: "center" }, children: loginErr }),
        deviceHasFid && !showLoginForm && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setShowLoginForm(true);
              setLoginErr("");
            },
            style: {
              width: "100%",
              padding: "10px",
              background: "transparent",
              color: "#64748b",
              border: "none",
              fontSize: 13,
              cursor: "pointer",
              textDecoration: "underline"
            },
            children: t("fidUsePassword")
          }
        ),
        showLoginForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginTop: deviceHasFid ? 8 : 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }, children: t("phone") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "tel",
                value: phone,
                onChange: (e) => setPhone(e.target.value),
                onKeyDown: (e) => e.key === "Enter" && void login(),
                placeholder: "(346) 000-0000",
                style: {
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: 15,
                  outline: "none"
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }, children: t("pin") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "password",
                value: pin,
                onChange: (e) => setPin(e.target.value),
                onKeyDown: (e) => e.key === "Enter" && void login(),
                placeholder: "••••••••",
                autoFocus: !deviceHasFid,
                style: {
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: 15,
                  outline: "none"
                }
              }
            )
          ] }),
          !deviceHasFid && loginErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: 13, color: "#ef4444", textAlign: "center" }, children: loginErr }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Btn, { onClick: () => void login(), disabled: loggingIn || !phone || !pin, children: loggingIn ? t("signingIn") : t("signIn") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { marginTop: 16, fontSize: 12, color: "#94a3b8", position: "relative", zIndex: 1, textAlign: "center" }, children: "HTRGroup CRM · hitechrepairgroup@gmail.com" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { marginTop: 6, fontSize: 11, color: "#cbd5e1", position: "relative", zIndex: 1, textAlign: "center" }, children: "Developed by Eivaz Rakhmanov" })
    ] });
  }
  const matchesSearch = (b, q) => {
    if (!q.trim()) return true;
    const lq = q.toLowerCase();
    return b.name.toLowerCase().includes(lq) || b.phone.toLowerCase().includes(lq) || b.address.toLowerCase().includes(lq) || b.preferred_date.includes(lq) || (b.appliance?.toLowerCase().includes(lq) ?? false) || (b.brand_model?.toLowerCase().includes(lq) ?? false);
  };
  const activeJobs = bookings.filter((b) => b.status !== "completed" && matchesSearch(b, jobSearch));
  const completedJobs = bookings.filter((b) => b.status === "completed" && !b.employee_archived_at && matchesSearch(b, jobSearch));
  const archivedJobs = bookings.filter((b) => b.status === "completed" && !!b.employee_archived_at && matchesSearch(b, jobSearch));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { height: "100dvh", background: "#f8fafc", position: "relative", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: "/htr-logo-nobg.png",
        alt: "",
        "aria-hidden": "true",
        className: "emp-side-logo emp-side-logo-left",
        style: {
          position: "absolute",
          left: 4,
          bottom: 80,
          objectFit: "contain",
          opacity: 0.75,
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: "/htr-logo-nobg.png",
        alt: "",
        "aria-hidden": "true",
        className: "emp-side-logo emp-side-logo-right",
        style: {
          position: "absolute",
          right: 4,
          bottom: 80,
          objectFit: "contain",
          opacity: 0.75,
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "emp-main-inner",
        style: {
          height: "100%",
          display: "flex",
          flexDirection: "column",
          maxWidth: 480,
          margin: "0 auto",
          position: "relative",
          zIndex: 1
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            background: "#0f172a",
            color: "#94a3b8",
            fontSize: 11,
            textAlign: "center",
            padding: "4px 12px",
            letterSpacing: "0.03em"
          }, children: [
            "Developed by ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#e2e8f0", fontWeight: 600 }, children: "Eivaz Rakhmanov" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { style: {
            background: "#fff",
            borderBottom: "1px solid #f1f5f9",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            zIndex: 10
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: "/htr-logo-nobg.png",
                  alt: "HTR Group TX",
                  style: { width: 72, height: 48, borderRadius: 8, objectFit: "contain" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginLeft: 2 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, color: "#94a3b8", lineHeight: 1 }, children: t("hello") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 700, fontSize: 15, color: "#0f172a" }, children: empName })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: lang,
                  onChange: (e) => setLang(e.target.value),
                  style: {
                    padding: "4px 8px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                    background: "#fff",
                    outline: "none",
                    cursor: "pointer"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "en", children: "🇺🇸 EN" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ru", children: "🇷🇺 RU" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "es", children: "🇪🇸 ES" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "tr", children: "🇹🇷 TR" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "az", children: "🇦🇿 AZ" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "uk", children: "🇺🇦 UK" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: openTranslator,
                  title: "AI Translator",
                  style: {
                    minHeight: 36,
                    padding: "0 10px",
                    background: "transparent",
                    border: "1px solid #c7d2fe",
                    borderRadius: 8,
                    color: "#4f46e5",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { style: { width: 15, height: 15 } })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: logout,
                  style: {
                    minHeight: 36,
                    padding: "0 12px",
                    background: "transparent",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    color: "#ef4444",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { style: { width: 14, height: 14 } }),
                    " ",
                    t("logout")
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            display: "flex",
            background: "#fff",
            borderBottom: "1px solid #f1f5f9"
          }, children: ["jobs", "stats", "payroll", "profile"].map((tb) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setTab(tb),
              style: {
                flex: 1,
                minHeight: 44,
                background: "transparent",
                border: "none",
                borderBottom: tab === tb ? `2.5px solid ${ACCENT$3}` : "2.5px solid transparent",
                color: tab === tb ? ACCENT$3 : "#94a3b8",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "color 0.15s"
              },
              children: tb === "jobs" ? t("myJobs") : tb === "stats" ? t("statsTab") : tb === "payroll" ? t("payroll") : t("profile")
            },
            tb
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, overflowY: "auto", padding: "12px", paddingBottom: 32 }, children: [
            tab === "jobs" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { style: {
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 14,
                  height: 14,
                  color: "#94a3b8",
                  pointerEvents: "none"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "search",
                    value: jobSearch,
                    onChange: (e) => setJobSearch(e.target.value),
                    placeholder: t("searchJobs"),
                    style: {
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "8px 32px 8px 30px",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 10,
                      fontSize: 13,
                      outline: "none",
                      background: "#fff",
                      color: "#0f172a"
                    }
                  }
                ),
                jobSearch && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setJobSearch(""),
                    style: {
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                      fontSize: 16,
                      lineHeight: 1,
                      padding: 2
                    },
                    children: "×"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                  display: "flex",
                  flex: 1,
                  background: "#f1f5f9",
                  borderRadius: 10,
                  padding: 3,
                  gap: 2
                }, children: ["active", "completed", "archived"].map((st) => {
                  const count2 = st === "active" ? activeJobs.length : st === "completed" ? completedJobs.length : archivedJobs.length;
                  const label = st === "active" ? t("tabActive") : st === "completed" ? t("completed") : t("archived");
                  const isActive = jobsTab === st;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => setJobsTab(st),
                      style: {
                        flex: 1,
                        minHeight: 30,
                        background: isActive ? "#fff" : "transparent",
                        border: "none",
                        borderRadius: 8,
                        boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
                        color: isActive ? ACCENT$3 : "#94a3b8",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4
                      },
                      children: [
                        st === "archived" && /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { style: { width: 10, height: 10 } }),
                        label,
                        count2 > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                          background: isActive ? ACCENT$3 : "#cbd5e1",
                          color: "#fff",
                          borderRadius: 10,
                          padding: "1px 5px",
                          fontSize: 10,
                          fontWeight: 700,
                          lineHeight: 1.4
                        }, children: count2 })
                      ]
                    },
                    st
                  );
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => void loadBookings(),
                    disabled: loading,
                    style: {
                      background: "transparent",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#64748b",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 8px",
                      borderRadius: 6,
                      flexShrink: 0
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { style: { width: 13, height: 13 }, className: loading ? "animate-spin" : "" }),
                      t("refresh")
                    ]
                  }
                )
              ] }),
              apiErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 12, color: "#ef4444", textAlign: "center" }, children: apiErr }),
              loading && bookings.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "center", padding: "40px 0" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { style: { width: 24, height: 24, color: "#cbd5e1" }, className: "animate-spin" }) }),
              jobsTab === "active" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                !loading && activeJobs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "48px 0",
                  gap: 8,
                  color: "#94a3b8"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { style: { width: 40, height: 40, opacity: 0.2 } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: 14 }, children: t("noJobs") })
                ] }),
                activeJobs.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  JobCard,
                  {
                    b,
                    justClosed: b.id === justClosedId,
                    isHighlighted: !!jobSearch.trim(),
                    onClose: () => openCloseModal(b),
                    onEstimate: () => openEstimateModal(b),
                    onEditEstimate: estimateHistory[b.id] ? () => openEstimateModal(b, estimateHistory[b.id]) : void 0,
                    lastEstimate: estimateHistory[b.id],
                    onPhotos: () => openPhotoModal(b.id),
                    photoCount: (bookingPhotos[b.id] ?? []).length,
                    onDownloadReceipt: () => downloadReceipt(b),
                    downloadingReceipt: downloadingReceiptId === b.id,
                    onEmpCallback: b.phone ? (gender) => handleEmpCallback(b.phone, b.id, b.name, b.client_lang ?? "en", gender) : void 0,
                    empCallLoading: empCallLoading.has(b.id),
                    emailEditId,
                    emailEditVal,
                    emailEditSaving,
                    emailEditMsg,
                    setEmailEditId,
                    setEmailEditVal,
                    setEmailEditMsg,
                    saveClientEmail,
                    empLang: lang,
                    authH,
                    t
                  },
                  b.id
                ))
              ] }),
              jobsTab === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                !loading && completedJobs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "48px 0",
                  gap: 8,
                  color: "#94a3b8"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { style: { width: 40, height: 40, opacity: 0.2 } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: 14 }, children: t("completed") })
                ] }),
                completedJobs.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  JobCard,
                  {
                    b,
                    justClosed: false,
                    isHighlighted: !!jobSearch.trim(),
                    onClose: void 0,
                    onArchive: () => void archiveJob(b.id),
                    archiving: archivingId === b.id,
                    onPhotos: () => openPhotoModal(b.id),
                    photoCount: (bookingPhotos[b.id] ?? []).length,
                    onDownloadReceipt: () => downloadReceipt(b),
                    downloadingReceipt: downloadingReceiptId === b.id,
                    onSendReview: () => void sendReviewSms(b.id, t),
                    sendingReview: sendingReviewId === b.id,
                    onEmpCallback: b.phone ? (gender) => handleEmpCallback(b.phone, b.id, b.name, b.client_lang ?? "en", gender) : void 0,
                    empCallLoading: empCallLoading.has(b.id),
                    emailEditId,
                    emailEditVal,
                    emailEditSaving,
                    emailEditMsg,
                    setEmailEditId,
                    setEmailEditVal,
                    setEmailEditMsg,
                    saveClientEmail,
                    empLang: lang,
                    authH,
                    t
                  },
                  b.id
                ))
              ] }),
              jobsTab === "archived" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                !loading && archivedJobs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "48px 0",
                  gap: 8,
                  color: "#94a3b8"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { style: { width: 40, height: 40, opacity: 0.2 } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: 14 }, children: t("noArchived") })
                ] }),
                archivedJobs.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  JobCard,
                  {
                    b,
                    justClosed: false,
                    isHighlighted: !!jobSearch.trim(),
                    onClose: void 0,
                    isArchived: true,
                    onRestore: () => void restoreJob(b.id),
                    archiving: archivingId === b.id,
                    onPhotos: () => openPhotoModal(b.id),
                    photoCount: (bookingPhotos[b.id] ?? []).length,
                    onDownloadReceipt: () => downloadReceipt(b),
                    downloadingReceipt: downloadingReceiptId === b.id,
                    onSendReview: () => void sendReviewSms(b.id, t),
                    sendingReview: sendingReviewId === b.id,
                    onEmpCallback: b.phone ? (gender) => handleEmpCallback(b.phone, b.id, b.name, b.client_lang ?? "en", gender) : void 0,
                    empCallLoading: empCallLoading.has(b.id),
                    emailEditId,
                    emailEditVal,
                    emailEditSaving,
                    emailEditMsg,
                    setEmailEditId,
                    setEmailEditVal,
                    setEmailEditMsg,
                    saveClientEmail,
                    empLang: lang,
                    authH,
                    t
                  },
                  b.id
                ))
              ] })
            ] }),
            tab === "stats" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase" }, children: t("statsTab") }),
              empStats ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  padding: 16
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }, children: "All Time" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 36, fontWeight: 800, color: "#0f172a", lineHeight: 1 }, children: empStats.closed_total }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 4 }, children: t("statsClosed") })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 36, fontWeight: 800, color: ACCENT$3, lineHeight: 1 }, children: [
                        "$",
                        Number(empStats.revenue_total).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 4 }, children: t("statsRevenue") })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  padding: 16
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }, children: t("statsMonth") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 36, fontWeight: 800, color: "#0f172a", lineHeight: 1 }, children: empStats.closed_month }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 4 }, children: t("statsClosed") })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 36, fontWeight: 800, color: "#16a34a", lineHeight: 1 }, children: [
                        "$",
                        Number(empStats.revenue_month).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 4 }, children: t("statsMonthRev") })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                  background: "linear-gradient(135deg, #1B6FE8 0%, #0d52c7 100%)",
                  borderRadius: 14,
                  boxShadow: "0 2px 10px rgba(27,111,232,0.3)",
                  padding: 16
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }, children: t("statsWeek") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: 10 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1 }, children: empStats.closed_week }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 }, children: t("statsWeekJobs") })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: 10 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }, children: [
                        "$",
                        (empStats.net_week ?? 0).toFixed(2)
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 }, children: [
                        t("statsWeekNet"),
                        " (",
                        empStats.emp_pct ?? 70,
                        "%)"
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: 8 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 13, fontWeight: 700, color: "#fff" }, children: [
                        "$",
                        (empStats.labor_week ?? 0).toFixed(2)
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2 }, children: t("statsWeekLabor") })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: 8 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 13, fontWeight: 700, color: "#fff" }, children: [
                        "$",
                        (empStats.parts_week ?? 0).toFixed(2)
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2 }, children: t("statsWeekParts") })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: 8 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 13, fontWeight: 700, color: "#fff" }, children: [
                        "$",
                        (empStats.tax_week ?? 0).toFixed(2)
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2 }, children: t("statsWeekTax") })
                    ] })
                  ] })
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "48px 0",
                gap: 8,
                color: "#94a3b8"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { style: { width: 40, height: 40, opacity: 0.2 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: 14 }, children: "No data yet" })
              ] })
            ] }),
            tab === "payroll" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase" }, children: t("payroll") }),
              payrollRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "48px 0",
                gap: 8,
                color: "#94a3b8"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { style: { width: 40, height: 40, opacity: 0.2 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: 0, fontSize: 14 }, children: t("noPayroll") })
              ] }) : payrollRecords.map((pr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                padding: 16
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 700, fontSize: 15, color: "#0f172a" }, children: pr.period_label }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 12, color: "#94a3b8" }, children: [
                      fmtDate(pr.period_start),
                      " – ",
                      fmtDate(pr.period_end)
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 20
                  }, className: payStatusCls(pr.status), children: payStatusLabel(pr.status, t) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 12 }, children: [
                  { label: t("jobsCount"), value: String(pr.jobs_count) },
                  { label: t("gross"), value: `$${Number(pr.gross_amount).toFixed(2)}` },
                  { label: t("deductions"), value: `$${Number(pr.deductions).toFixed(2)}` },
                  { label: t("net"), value: `$${Number(pr.net_amount).toFixed(2)}`, bold: true }
                ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 14, fontWeight: 700, color: item.bold ? SUCCESS : "#0f172a" }, children: item.value }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 10, color: "#94a3b8" }, children: item.label })
                ] }, item.label)) }),
                pr.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "8px 0 0", fontSize: 12, color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: 8 }, children: pr.notes })
              ] }, pr.id))
            ] }),
            tab === "profile" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: profile ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                padding: 16
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: ACCENT$3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 20,
                    fontWeight: 700
                  }, children: empName[0]?.toUpperCase() ?? "?" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 700, fontSize: 16, color: "#0f172a" }, children: profile.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { style: { width: 13, height: 13 } }),
                      profile.phone
                    ] })
                  ] })
                ] }),
                (profile.car_make || profile.car_plate) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f1f5f9", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }, children: [
                  profile.car_make && profile.car_model && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: 12, color: "#94a3b8", width: 70 }, children: [
                      t("car"),
                      ":"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 500 }, children: [
                      profile.car_make,
                      " ",
                      profile.car_model
                    ] })
                  ] }),
                  profile.car_plate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: 12, color: "#94a3b8", width: 70 }, children: [
                      t("plate"),
                      ":"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, fontFamily: "monospace" }, children: profile.car_plate })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Btn, { onClick: logout, outline: true, color: "#ef4444", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { style: { width: 16, height: 16 } }),
                " ",
                t("logout")
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "center", padding: "40px 0" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { style: { width: 24, height: 24, color: "#cbd5e1" }, className: "animate-spin" }) }) })
          ] }),
          closeTarget && reactDomExports.createPortal(
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(15,23,42,0.6)",
              display: "flex",
              alignItems: "flex-end"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              width: "100%",
              background: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "92dvh",
              overflowY: "auto",
              padding: "24px 20px 40px"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 800, fontSize: 18 }, children: t("closeJob") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCloseTarget(null), style: { border: "none", background: "#f1f5f9", padding: 6, borderRadius: "50%", cursor: "pointer" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { style: { width: 20, height: 20, color: "#64748b" } }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }, children: t("repairAmount") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", left: 14, top: 12, fontSize: 15, fontWeight: 600, color: "#64748b" }, children: "$" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "number",
                        step: "0.01",
                        value: closeAmount,
                        onChange: (e) => setCloseAmount(e.target.value),
                        placeholder: "0.00",
                        style: {
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "12px 14px 12px 28px",
                          borderRadius: 12,
                          border: "1.5px solid #e2e8f0",
                          fontSize: 15,
                          fontWeight: 700,
                          outline: "none"
                        }
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }, children: t("workPerformed") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      value: closeWork,
                      onChange: (e) => setCloseWork(e.target.value),
                      placeholder: t("workPlaceholder"),
                      style: {
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "12px 14px",
                        minHeight: 80,
                        borderRadius: 12,
                        border: "1.5px solid #e2e8f0",
                        fontSize: 14,
                        outline: "none",
                        resize: "none"
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: 12, fontWeight: 600, color: "#64748b" }, children: t("partsReplaced") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: addPart, style: { fontSize: 12, fontWeight: 700, color: ACCENT$3, background: "none", border: "none", cursor: "pointer" }, children: t("addPart") })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: closeParts.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        value: p,
                        onChange: (e) => setPart(i, e.target.value),
                        placeholder: "e.g. Heating Element",
                        style: { flex: 1, padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none" }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removePart(i), style: { padding: "0 10px", borderRadius: 10, border: "none", background: "#fee2e2", color: "#ef4444", cursor: "pointer" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { style: { width: 16, height: 16 } }) })
                  ] }, i)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }, children: t("partsCost") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 11, color: "#94a3b8", margin: "0 0 6px" }, children: t("partsCostHint") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", left: 14, top: 12, fontSize: 15, fontWeight: 600, color: "#64748b" }, children: "$" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "number",
                        step: "0.01",
                        min: "0",
                        value: closePartsCost,
                        onChange: (e) => setClosePartsCost(e.target.value),
                        placeholder: "0.00",
                        style: {
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "12px 14px 12px 28px",
                          borderRadius: 12,
                          border: "1.5px solid #e2e8f0",
                          fontSize: 14,
                          outline: "none"
                        }
                      }
                    )
                  ] })
                ] }),
                (() => {
                  const labor = parseFloat(closeAmount) || 0;
                  const parts = parseFloat(closePartsCost) || 0;
                  const taxAmt = closeTax ? (labor + parts) * 0.0825 : 0;
                  const total = labor + parts + taxAmt;
                  if (labor <= 0 && parts <= 0) return null;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0f7ff", borderRadius: 14, padding: "14px 16px", border: "1.5px solid #bfdbfe" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 12, fontWeight: 700, color: ACCENT$3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }, children: t("estimateTotalLine") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151" }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("repairAmount") }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "$",
                          labor.toFixed(2)
                        ] })
                      ] }),
                      parts > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151" }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("partsCost").split("(")[0].trim() }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "$",
                          parts.toFixed(2)
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, color: closeTax ? "#374151" : "#94a3b8" }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "checkbox",
                              checked: closeTax,
                              onChange: (e) => setCloseTax(e.target.checked),
                              style: { width: 15, height: 15, accentColor: ACCENT$3, cursor: "pointer" }
                            }
                          ),
                          t("estimateTaxLine")
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: closeTax ? `$${taxAmt.toFixed(2)}` : "$0.00 ✓" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: "#1a1a2e", borderTop: "1.5px solid #bfdbfe", paddingTop: 8, marginTop: 2 }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("estimateTotalLine") }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: ACCENT$3 }, children: [
                          "$",
                          total.toFixed(2)
                        ] })
                      ] })
                    ] })
                  ] });
                })(),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }, children: t("paymentMethod") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: ["cash", "zelle", "tap_to_pay", "online"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setClosePayment(m),
                      style: {
                        padding: "10px 6px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: closePayment === m ? `2px solid ${ACCENT$3}` : "1.5px solid #f1f5f9",
                        background: closePayment === m ? "#f0f7ff" : "#f8fafc",
                        color: closePayment === m ? ACCENT$3 : "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4
                      },
                      children: m === "cash" ? `💵 ${t("cash")}` : m === "zelle" ? `💚 ${t("zelle")}` : m === "tap_to_pay" ? `📱 ${t("tapToPay")}` : `🔗 ${t("online")}`
                    },
                    m
                  )) })
                ] }),
                closePayment === "zelle" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                  background: "#f0fdf4",
                  border: "1.5px solid #86efac",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: 13
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 700, color: "#15803d", marginBottom: 4 }, children: "💚 Zelle" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#166534" }, children: t("zelleInfo") })
                ] }),
                closePayment === "tap_to_pay" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                  background: "#eff6ff",
                  border: "1.5px solid #93c5fd",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 12, color: "#1d4ed8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }, children: "📱 Tap to Pay — Stripe" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 12, color: "#3b82f6" }, children: t("tapToPayInstruction") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "a",
                    {
                      href: stripeDashboardUrl(),
                      rel: "noopener noreferrer",
                      onClick: openStripeDashboardLink,
                      style: {
                        padding: "12px",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: "#635bff",
                        color: "#fff",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        textDecoration: "none"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 18 }, children: "⚡" }),
                        t("openStripeApp")
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "a",
                      {
                        href: "https://apps.apple.com/app/id978516833",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: openExternalLink,
                        style: { fontSize: 11, color: "#6366f1", textDecoration: "underline" },
                        children: "iOS App Store"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#cbd5e1", fontSize: 11 }, children: "·" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "a",
                      {
                        href: "https://play.google.com/store/apps/details?id=com.stripe.android.dashboard",
                        target: "_blank",
                        rel: "noreferrer",
                        style: { fontSize: 11, color: "#6366f1", textDecoration: "underline" },
                        children: "Google Play"
                      }
                    )
                  ] })
                ] }),
                closePayment === "online" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "a",
                    {
                      href: "/pay",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        background: "#635BFF",
                        color: "#fff",
                        borderRadius: 12,
                        padding: "13px 16px",
                        fontSize: 14,
                        fontWeight: 700,
                        textDecoration: "none",
                        letterSpacing: "0.01em"
                      },
                      children: [
                        "💳 ",
                        t("openPaymentLink")
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0f7ff", borderRadius: 12, padding: "10px 14px", fontSize: 13 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 700, color: "#1B6FE8", marginBottom: 6, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }, children: t("clientContact") }),
                    closeTarget?.email || closeTarget?.phone ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 3 }, children: [
                      closeTarget?.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#374151" }, children: [
                        "✉️ ",
                        closeTarget.email
                      ] }),
                      closeTarget?.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#374151" }, children: [
                        "📱 ",
                        closeTarget.phone
                      ] })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#94a3b8" }, children: t("noContactInfo") })
                  ] }),
                  closeTarget?.email || closeTarget?.phone ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }, children: t("notifyMethod") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 8 }, children: ["email", "sms", "both"].map((m) => {
                      const disabled = (m === "email" || m === "both") && !closeTarget?.email || m === "sms" && !closeTarget?.phone;
                      return /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => !disabled && setCloseNotify(m),
                          disabled,
                          style: {
                            flex: 1,
                            padding: "10px",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: disabled ? "not-allowed" : "pointer",
                            border: closeNotify === m ? `2px solid ${ACCENT$3}` : "1.5px solid #f1f5f9",
                            background: disabled ? "#f8fafc" : closeNotify === m ? "#f0f7ff" : "#f8fafc",
                            color: disabled ? "#cbd5e1" : closeNotify === m ? ACCENT$3 : "#64748b",
                            opacity: disabled ? 0.5 : 1
                          },
                          children: m === "email" ? t("viaEmail") : m === "sms" ? t("viaSMS") : t("viaBoth")
                        },
                        m
                      );
                    }) })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 12, color: "#94a3b8", padding: "8px 0" }, children: [
                    "ℹ️ ",
                    t("noContactInfo"),
                    " — ",
                    t("noNotificationWillBeSent") ?? "уведомление не будет отправлено"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }, children: t("clientReceiptLang") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 8 }, children: ["en", "es"].map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setCloseLang(l),
                      style: {
                        flex: 1,
                        padding: "10px",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: closeLang === l ? `2px solid ${ACCENT$3}` : "1.5px solid #f1f5f9",
                        background: closeLang === l ? "#f0f7ff" : "#f8fafc",
                        color: closeLang === l ? ACCENT$3 : "#64748b"
                      },
                      children: l === "en" ? "🇺🇸 English" : "🇪🇸 Español"
                    },
                    l
                  )) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { fontSize: 12, fontWeight: 600, color: "#64748b" }, children: [
                      t("sigTitle"),
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 400, color: "#94a3b8" }, children: t("sigOptional") })
                    ] }),
                    sigHasData && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: clearSig,
                        style: { fontSize: 12, fontWeight: 600, color: "#ef4444", background: "none", border: "none", cursor: "pointer" },
                        children: t("sigClear")
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { border: "1.5px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "#fafafa", touchAction: "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "canvas",
                    {
                      ref: signatureRef,
                      width: 335,
                      height: 130,
                      style: { display: "block", width: "100%", height: 130, cursor: "crosshair", touchAction: "none" },
                      onMouseDown: sigStart,
                      onMouseMove: sigMove,
                      onMouseUp: sigStop,
                      onMouseLeave: sigStop,
                      onTouchStart: sigTouchStart,
                      onTouchMove: sigTouchMove,
                      onTouchEnd: sigStop
                    }
                  ) }),
                  !sigHasData && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 11, color: "#94a3b8", margin: "4px 0 0", textAlign: "center" }, children: t("sigDraw") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "flex-start", gap: 8, marginTop: 8, cursor: "pointer" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: sigConsentGiven,
                        onChange: (e) => setSigConsentGiven(e.target.checked),
                        style: { marginTop: 2, width: 14, height: 14, accentColor: ACCENT$3 }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 11, color: "#64748b", lineHeight: 1.4 }, children: t("sigConsentText") })
                  ] })
                ] }),
                closeErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 13, color: "#ef4444", textAlign: "center", margin: 0 }, children: closeErr }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, marginTop: 8 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Btn, { outline: true, color: "#64748b", onClick: () => setCloseTarget(null), children: t("cancel") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Btn, { onClick: () => void submitClose(), disabled: closing, children: closing ? t("signingIn") : t("submit") })
                ] })
              ] })
            ] }) }),
            document.body
          ),
          photoModalId && reactDomExports.createPortal(
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              position: "fixed",
              inset: 0,
              zIndex: 110,
              background: "rgba(15,23,42,0.7)",
              display: "flex",
              alignItems: "flex-end"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              width: "100%",
              background: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "88dvh",
              display: "flex",
              flexDirection: "column"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: "1px solid #f1f5f9" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 800, fontSize: 18 }, children: t("photoModal") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setPhotoModalId(null),
                    style: { border: "none", background: "#f1f5f9", padding: 6, borderRadius: "50%", cursor: "pointer" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { style: { width: 20, height: 20, color: "#64748b" } })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowY: "auto", flex: 1, padding: 20 }, children: photosLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "32px 0", color: "#94a3b8" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { style: { width: 24, height: 24, margin: "0 auto", display: "block" }, className: "animate-spin" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { marginTop: 8, fontSize: 13 }, children: t("photoLoading") })
              ] }) : (bookingPhotos[photoModalId] ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "32px 0", color: "#94a3b8" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { style: { width: 40, height: 40, opacity: 0.2, margin: "0 auto 8px", display: "block" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 13, margin: 0 }, children: t("photoNone") })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }, children: (bookingPhotos[photoModalId] ?? []).map((photo) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1/1", background: "#f1f5f9" }, children: [
                photo.url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: photo.url, alt: "job photo", style: { width: "100%", height: "100%", objectFit: "cover" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 11, color: "#94a3b8" }, children: "unavailable" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => void deletePhoto(photoModalId, photo.id),
                    style: { position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", padding: 4, cursor: "pointer", display: "flex" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { style: { width: 14, height: 14, color: "#fff" } })
                  }
                )
              ] }, photo.id)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "16px 20px 36px", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 8 }, children: [
                uploadProgress && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: ACCENT$3 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      t("photoLoading"),
                      " ",
                      uploadProgress.current,
                      "/",
                      uploadProgress.total
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      Math.round(uploadProgress.current / uploadProgress.total * 100),
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 4, borderRadius: 4, background: "#e2e8f0", overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                    height: "100%",
                    borderRadius: 4,
                    background: ACCENT$3,
                    width: `${Math.round(uploadProgress.current / uploadProgress.total * 100)}%`,
                    transition: "width 0.3s ease"
                  } }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  minHeight: 46,
                  borderRadius: 12,
                  background: uploadProgress ? "#cbd5e1" : ACCENT$3,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: uploadProgress ? "not-allowed" : "pointer"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { style: { width: 18, height: 18 } }),
                  t("photoAdd"),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "file",
                      accept: "image/*",
                      capture: "environment",
                      style: { display: "none" },
                      disabled: !!uploadProgress,
                      onChange: (e) => {
                        const f = e.target.files?.[0];
                        if (f && photoModalId) void uploadPhotos(photoModalId, [f]);
                        e.target.value = "";
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  minHeight: 46,
                  borderRadius: 12,
                  background: uploadProgress ? "#cbd5e1" : "#f1f5f9",
                  color: uploadProgress ? "#94a3b8" : ACCENT$3,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: uploadProgress ? "not-allowed" : "pointer",
                  border: `1.5px solid ${uploadProgress ? "#cbd5e1" : ACCENT$3}`
                }, children: [
                  "🖼 ",
                  t("photoGallery"),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "file",
                      accept: "image/*",
                      multiple: true,
                      style: { display: "none" },
                      disabled: !!uploadProgress,
                      onChange: (e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (files.length > 0 && photoModalId) void uploadPhotos(photoModalId, files);
                        e.target.value = "";
                      }
                    }
                  )
                ] })
              ] })
            ] }) }),
            document.body
          ),
          estimateTarget && reactDomExports.createPortal(
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(15,23,42,0.6)",
              display: "flex",
              alignItems: "flex-end"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              width: "100%",
              background: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "94dvh",
              overflowY: "auto",
              padding: "24px 20px 40px"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 800, fontSize: 18 }, children: estimateIsEdit ? t("estimateEditTitle") : t("estimateTitle") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEstimateTarget(null), style: { border: "none", background: "#f1f5f9", padding: 6, borderRadius: "50%", cursor: "pointer" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { style: { width: 20, height: 20, color: "#64748b" } }) })
              ] }),
              estimateDone ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "40px 0", color: SUCCESS }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { style: { width: 48, height: 48, margin: "0 auto 12px" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 700, fontSize: 16 }, children: t("estimateSuccess") })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f8fafc", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#374151" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: estimateTarget.name }),
                  " · ",
                  estimateTarget.phone,
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: 12, color: "#94a3b8" }, children: [
                    estimateTarget.appliance,
                    estimateTarget.brand_model ? ` — ${estimateTarget.brand_model}` : ""
                  ] })
                ] }),
                pricebook.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }, children: t("fromPricebook") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: pricebook.map((pb) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => addFromPricebook(pb),
                      style: {
                        padding: "5px 10px",
                        borderRadius: 20,
                        border: "1.5px solid #e2e8f0",
                        background: "#fff",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        color: "#374151"
                      },
                      children: [
                        "+ ",
                        pb.name,
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: ACCENT$3 }, children: [
                          "$",
                          Number(pb.unit_price).toFixed(0)
                        ] })
                      ]
                    },
                    pb.id
                  )) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { fontSize: 12, fontWeight: 600, color: "#64748b" }, children: t("estimateItems") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: addEstimateItem, style: { fontSize: 12, fontWeight: 700, color: ACCENT$3, background: "none", border: "none", cursor: "pointer" }, children: t("addItem") })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: estimateItems.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, marginBottom: 6 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          value: item.description,
                          onChange: (e) => setEstimateItemField(i, "description", e.target.value),
                          placeholder: t("itemDesc"),
                          style: { flex: 1, padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none" }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeEstimateItem(i), style: { padding: "0 8px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#ef4444", cursor: "pointer" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { style: { width: 14, height: 14 } }) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 60px 80px", gap: 6 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "select",
                        {
                          value: item.category,
                          onChange: (e) => setEstimateItemField(i, "category", e.target.value),
                          style: { padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 12, outline: "none" },
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Labor", children: "Labor" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Part", children: "Part" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Material", children: "Material" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "number",
                          min: "1",
                          step: "1",
                          value: item.qty,
                          onChange: (e) => setEstimateItemField(i, "qty", Math.max(1, parseInt(e.target.value) || 1)),
                          placeholder: t("itemQty"),
                          style: { padding: "8px 6px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", textAlign: "center" }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { position: "absolute", left: 8, top: 9, fontSize: 13, color: "#94a3b8" }, children: "$" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "number",
                            min: "0",
                            step: "0.01",
                            value: item.unit_price === 0 ? "" : item.unit_price,
                            onChange: (e) => setEstimateItemField(i, "unit_price", parseFloat(e.target.value) || 0),
                            style: { width: "100%", boxSizing: "border-box", padding: "8px 6px 8px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none" }
                          }
                        )
                      ] })
                    ] })
                  ] }, i)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: estimateNoTax,
                      onChange: (e) => setEstimateNoTax(e.target.checked),
                      style: { width: 16, height: 16, accentColor: "#16a34a" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 13, fontWeight: 600, color: "#16a34a" }, children: t("noTax") })
                ] }),
                (() => {
                  const labor = estimateItems.filter((i) => i.category === "Labor").reduce((s, i) => s + i.qty * i.unit_price, 0);
                  const parts = estimateItems.filter((i) => i.category !== "Labor").reduce((s, i) => s + i.qty * i.unit_price, 0);
                  const tax = estimateNoTax ? 0 : (labor + parts) * 0.0825;
                  const total = labor + parts + tax;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0f7ff", borderRadius: 10, padding: "10px 14px" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569", paddingBottom: 4 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("estimateSubtotal") }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "$",
                        (labor + parts).toFixed(2)
                      ] })
                    ] }),
                    estimateNoTax ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#16a34a", paddingBottom: 4 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("estimateTaxLine") }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "$0.00 ✓" })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569", paddingBottom: 4 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("estimateTaxLine") }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "$",
                        tax.toFixed(2)
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: ACCENT$3, borderTop: "1px solid #bfdbfe", paddingTop: 6 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("estimateTotalLine") }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "$",
                        total.toFixed(2)
                      ] })
                    ] })
                  ] });
                })(),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }, children: t("estimateNotes") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      value: estimateNotes,
                      onChange: (e) => setEstimateNotes(e.target.value),
                      placeholder: t("estimateNotesPlaceholder"),
                      style: {
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px 12px",
                        minHeight: 70,
                        borderRadius: 12,
                        border: "1.5px solid #e2e8f0",
                        fontSize: 13,
                        outline: "none",
                        resize: "none"
                      }
                    }
                  )
                ] }),
                (estimateTarget?.email || estimateTarget?.phone) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }, children: t("notifyMethod") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 8 }, children: ["email", "sms", "both"].map((m) => {
                    const disabled = (m === "email" || m === "both") && !estimateTarget?.email || m === "sms" && !estimateTarget?.phone;
                    return /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => !disabled && setEstimateNotify(m),
                        disabled,
                        style: {
                          flex: 1,
                          padding: "10px",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: disabled ? "not-allowed" : "pointer",
                          border: estimateNotify === m ? `2px solid ${ACCENT$3}` : "1.5px solid #f1f5f9",
                          background: disabled ? "#f8fafc" : estimateNotify === m ? "#f0f7ff" : "#f8fafc",
                          color: disabled ? "#cbd5e1" : estimateNotify === m ? ACCENT$3 : "#64748b",
                          opacity: disabled ? 0.5 : 1
                        },
                        children: m === "email" ? t("viaEmail") : m === "sms" ? t("viaSMS") : t("viaBoth")
                      },
                      m
                    );
                  }) })
                ] }),
                estimateErr && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 13, color: "#ef4444", textAlign: "center", margin: 0 }, children: estimateErr }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Btn, { outline: true, color: "#64748b", onClick: () => setEstimateTarget(null), children: t("cancel") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Btn, { onClick: () => void submitEstimate(), disabled: estimateSending, color: ACCENT$3, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { style: { width: 16, height: 16 } }),
                    estimateSending ? t("estimateSending") : t("estimateSend")
                  ] })
                ] })
              ] })
            ] }) }),
            document.body
          ),
          translatorOpen && reactDomExports.createPortal(
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                style: {
                  position: "fixed",
                  inset: 0,
                  zIndex: 9999,
                  background: "rgba(0,0,0,0.55)",
                  display: "flex",
                  alignItems: "flex-end"
                },
                onClick: (e) => {
                  if (e.target === e.currentTarget) {
                    stopListening();
                    setTranslatorOpen(false);
                  }
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                  width: "100%",
                  maxWidth: 480,
                  margin: "0 auto",
                  background: "#fff",
                  borderRadius: "20px 20px 0 0",
                  padding: "20px 20px 32px",
                  boxShadow: "0 -4px 32px rgba(0,0,0,0.18)"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { style: { width: 20, height: 20, color: "#4f46e5" } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: 16, color: "#0f172a" }, children: "AI Translator" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => {
                          stopListening();
                          setTranslatorOpen(false);
                        },
                        style: { background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { style: { width: 20, height: 20 } })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "stretch", gap: 8, marginBottom: 10 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        onClick: () => setTranslatorPickerFor("me"),
                        style: {
                          flex: 1,
                          padding: "8px 6px",
                          borderRadius: 12,
                          cursor: "pointer",
                          border: translatorPickerFor === "me" ? `2px solid ${ACCENT$3}` : "1.5px solid #e2e8f0",
                          background: translatorPickerFor === "me" ? "#eff6ff" : "#f8fafc",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }, children: "🧑‍🔧 Я / Me" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 22 }, children: TRANSLATOR_LANGS.find((l) => l.code === translatorLang)?.flag ?? "🏳" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 11, fontWeight: 700, color: translatorPickerFor === "me" ? ACCENT$3 : "#334155" }, children: TRANSLATOR_LANGS.find((l) => l.code === translatorLang)?.label })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => {
                          const prev = translatorLang;
                          setTranslatorLang(translatorCustomerLang);
                          setTranslatorCustomerLang(prev);
                          setTranslatorResult(null);
                          setTranslatorOrig("");
                          setTranslatorError("");
                        },
                        style: {
                          width: 36,
                          flexShrink: 0,
                          borderRadius: "50%",
                          background: "#f1f5f9",
                          border: "1.5px solid #e2e8f0",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          color: "#64748b"
                        },
                        children: "⇄"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        onClick: () => setTranslatorPickerFor("customer"),
                        style: {
                          flex: 1,
                          padding: "8px 6px",
                          borderRadius: 12,
                          cursor: "pointer",
                          border: translatorPickerFor === "customer" ? "2px solid #10b981" : "1.5px solid #e2e8f0",
                          background: translatorPickerFor === "customer" ? "#ecfdf5" : "#f8fafc",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }, children: "👤 Клиент" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 22 }, children: TRANSLATOR_LANGS.find((l) => l.code === translatorCustomerLang)?.flag ?? "🏳" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 11, fontWeight: 700, color: translatorPickerFor === "customer" ? "#10b981" : "#334155" }, children: TRANSLATOR_LANGS.find((l) => l.code === translatorCustomerLang)?.label })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 6,
                    color: translatorPickerFor === "me" ? ACCENT$3 : "#10b981"
                  }, children: translatorPickerFor === "me" ? "🧑‍🔧 Выбери свой язык:" : "👤 Выбери язык клиента:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 7,
                    marginBottom: 14,
                    maxHeight: 174,
                    overflowY: "auto"
                  }, children: TRANSLATOR_LANGS.map((lng) => {
                    const isSelected = translatorPickerFor === "me" ? translatorLang === lng.code : translatorCustomerLang === lng.code;
                    const activeColor = translatorPickerFor === "me" ? ACCENT$3 : "#10b981";
                    const activeBg = translatorPickerFor === "me" ? "#eff6ff" : "#ecfdf5";
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        onClick: () => {
                          if (translatorPickerFor === "me") setTranslatorLang(lng.code);
                          else setTranslatorCustomerLang(lng.code);
                          setTranslatorResult(null);
                          setTranslatorOrig("");
                          setTranslatorError("");
                        },
                        style: {
                          padding: "8px 6px",
                          borderRadius: 10,
                          border: isSelected ? `2px solid ${activeColor}` : "1.5px solid #e2e8f0",
                          background: isSelected ? activeBg : "#f8fafc",
                          color: isSelected ? activeColor : "#64748b",
                          fontWeight: 600,
                          fontSize: 11,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                          lineHeight: 1.2
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 18 }, children: lng.flag }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 10, textAlign: "center" }, children: lng.label })
                        ]
                      },
                      lng.code
                    );
                  }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 10 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", marginBottom: 8 }, children: [
                      translatorListening && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                        position: "absolute",
                        inset: -12,
                        borderRadius: "50%",
                        background: "rgba(239,68,68,0.12)",
                        animation: "ping 1.2s cubic-bezier(0,0,0.2,1) infinite"
                      } }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => toggleConversation(translatorLang, translatorCustomerLang),
                          disabled: translatorPhase === "translating" || translatorPhase === "speaking",
                          style: {
                            width: 88,
                            height: 88,
                            borderRadius: "50%",
                            border: "none",
                            cursor: translatorPhase === "translating" || translatorPhase === "speaking" ? "default" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.25s",
                            background: translatorContinuous ? "linear-gradient(135deg, #ef4444, #b91c1c)" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                            boxShadow: translatorListening ? "0 0 0 6px rgba(239,68,68,0.2), 0 6px 24px rgba(239,68,68,0.4)" : translatorContinuous ? "0 6px 24px rgba(239,68,68,0.35)" : "0 6px 24px rgba(79,70,229,0.4)",
                            opacity: translatorPhase === "translating" || translatorPhase === "speaking" ? 0.6 : 1
                          },
                          children: translatorContinuous ? /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { style: { width: 36, height: 36, color: "#fff" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { style: { width: 36, height: 36, color: "#fff" } })
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                      fontSize: 13,
                      fontWeight: 600,
                      color: translatorPhase === "listening" ? "#ef4444" : translatorPhase === "translating" ? "#4f46e5" : translatorPhase === "speaking" ? "#10b981" : "#94a3b8",
                      minHeight: 20,
                      textAlign: "center"
                    }, children: [
                      translatorPhase === "idle" && !translatorContinuous && "Tap mic to start",
                      translatorPhase === "listening" && "🔴 Listening…",
                      translatorPhase === "translating" && "⏳ Translating…",
                      translatorPhase === "speaking" && "🔊 Playing…"
                    ] }),
                    translatorContinuous && translatorPhase === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, color: "#64748b", marginTop: 2 }, children: "Tap red mic to stop conversation" }),
                    translatorContinuous && translatorPhase !== "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, color: "#64748b", marginTop: 2 }, children: "Conversation active" })
                  ] }),
                  translatorLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", color: "#4f46e5", fontSize: 13, marginBottom: 10 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { style: { width: 14, height: 14, display: "inline", animation: "spin 1s linear infinite" } }),
                    " Translating…"
                  ] }),
                  translatorError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                    fontSize: 12,
                    color: "#dc2626",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 8
                  }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: translatorError }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: logout,
                        style: {
                          marginTop: 8,
                          padding: "5px 12px",
                          borderRadius: 8,
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer"
                        },
                        children: "→ Выйти и войти снова"
                      }
                    )
                  ] }),
                  translatorOrig && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 8
                  }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }, children: [
                      "Original (",
                      translatorResult?.detected ?? "…",
                      ")"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 14, color: "#334155" }, children: translatorOrig })
                  ] }),
                  translatorResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                    background: "#eff6ff",
                    border: `1.5px solid ${ACCENT$3}`,
                    borderRadius: 12,
                    padding: 12
                  }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 10, fontWeight: 700, color: ACCENT$3, textTransform: "uppercase", marginBottom: 4 }, children: [
                      "Translation (",
                      translatorResult.target,
                      ")"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 14, color: "#1e3a5f", fontWeight: 600 }, children: translatorResult.translation }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => {
                          if (translatorAudioUrl) {
                            const audio = new Audio(translatorAudioUrl);
                            audio.play().catch(() => {
                            });
                          } else {
                            const utter = new SpeechSynthesisUtterance(translatorResult.translation);
                            utter.lang = TRANSLATOR_LANGS.find((l) => l.bcp.startsWith(translatorResult.target + "-") || l.bcp === translatorResult.target)?.bcp ?? "en-US";
                            window.speechSynthesis.cancel();
                            window.speechSynthesis.speak(utter);
                          }
                        },
                        style: {
                          marginTop: 8,
                          padding: "4px 10px",
                          borderRadius: 8,
                          background: ACCENT$3,
                          color: "#fff",
                          border: "none",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        },
                        children: "🔊 Play again"
                      }
                    )
                  ] })
                ] })
              }
            ),
            document.body
          )
        ]
      }
    )
  ] });
}
const messageTranslationCache = /* @__PURE__ */ new Map();
const EMP_EMPLOYEE_LANG_MAP = {
  en: { label: "English", code: "en" },
  ru: { label: "Russian", code: "ru" },
  es: { label: "Spanish", code: "es" },
  tr: { label: "Turkish", code: "tr" },
  az: { label: "Azerbaijani", code: "az" },
  uk: { label: "Ukrainian", code: "uk" }
};
function ClientMessageBlock({
  message,
  empLang,
  authH,
  t
}) {
  const [translation, setTranslation] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [failed, setFailed] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (empLang === "en") {
      setTranslation(null);
      setFailed(false);
      setLoading(false);
      return;
    }
    const cacheKey = `${empLang}::${message}`;
    const cached = messageTranslationCache.get(cacheKey);
    if (cached) {
      setTranslation(cached);
      setFailed(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    const emp = EMP_EMPLOYEE_LANG_MAP[empLang];
    fetch(`${API$1()}/api/employee/translate`, {
      method: "POST",
      headers: authH(),
      body: JSON.stringify({
        text: message,
        myLang: emp.label,
        myLangCode: emp.code,
        customerLang: "English",
        customerLangCode: "en"
      })
    }).then((r2) => r2.json()).then((d) => {
      if (cancelled) return;
      if (d.translation) {
        messageTranslationCache.set(cacheKey, d.translation);
        setTranslation(d.translation);
      } else {
        setFailed(true);
      }
    }).catch(() => {
      if (!cancelled) setFailed(true);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [message, empLang, authH]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    fontSize: 12,
    color: "#64748b",
    background: "#f8fafc",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #e2e8f0"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }, children: t("clientMessageOriginal") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#374151", lineHeight: 1.55, whiteSpace: "pre-wrap" }, children: message }),
    empLang !== "en" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #e2e8f0", marginTop: 8, paddingTop: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 10, fontWeight: 700, color: ACCENT$3, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }, children: t("clientMessageTranslation") }),
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontStyle: "italic", color: "#94a3b8" }, children: t("translatingMessage") }),
      !loading && failed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#ef4444", fontSize: 11 }, children: t("translationFailed") }),
      !loading && translation && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#0f172a", lineHeight: 1.55, whiteSpace: "pre-wrap" }, children: translation })
    ] })
  ] });
}
function JobCard({
  b,
  justClosed,
  isHighlighted,
  onClose,
  onEstimate,
  onEditEstimate,
  lastEstimate,
  onArchive,
  onRestore,
  isArchived,
  archiving,
  onPhotos,
  photoCount,
  onDownloadReceipt,
  downloadingReceipt,
  onSendReview,
  sendingReview,
  onEmpCallback,
  empCallLoading,
  emailEditId,
  emailEditVal,
  emailEditSaving,
  emailEditMsg,
  setEmailEditId,
  setEmailEditVal,
  setEmailEditMsg,
  saveClientEmail,
  empLang,
  authH,
  t
}) {
  const [genderPickOpen, setGenderPickOpen] = reactExports.useState(false);
  const [callMsg, setCallMsg] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
    background: justClosed ? "#dcfce7" : "#fff",
    borderRadius: 14,
    border: `2px solid ${justClosed ? SUCCESS : isHighlighted ? ACCENT$3 : "#f1f5f9"}`,
    boxShadow: isHighlighted ? `0 0 0 3px ${ACCENT$3}22` : "0 1px 4px rgba(0,0,0,0.05)",
    overflow: "hidden",
    transition: "border-color 0.2s, box-shadow 0.2s"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: 16 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 700, fontSize: 16, color: "#0f172a" }, children: b.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { style: { width: 13, height: 13 } }),
          b.preferred_date,
          " • ",
          b.preferred_time
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          fontSize: 10,
          fontWeight: 700,
          padding: "2px 8px",
          borderRadius: 20
        }, className: statusCls(b.status), children: statusLabel(b.status, t) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          fontSize: 10,
          fontWeight: 700,
          padding: "2px 8px",
          borderRadius: 20,
          background: resolveBookingBiz(b.business_type) === "dental" ? "#ede9fe" : "#dbeafe",
          color: resolveBookingBiz(b.business_type) === "dental" ? "#6d28d9" : "#1d4ed8"
        }, children: resolveBookingBiz(b.business_type) === "dental" ? t("bizDental") : t("bizAppliance") })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#374151" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { style: { width: 14, height: 14, flexShrink: 0, marginTop: 2, color: "#94a3b8" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
          b.address,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 6 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: mapsUrl(b.address), target: "_blank", rel: "noreferrer", style: {
            fontSize: 12,
            fontWeight: 700,
            color: ACCENT$3,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "#f0f7ff",
            padding: "4px 10px",
            borderRadius: 6,
            textDecoration: "none"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { style: { width: 12, height: 12 } }),
            " ",
            t("navigate")
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { style: { width: 14, height: 14, flexShrink: 0, color: "#94a3b8" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { flex: 1, fontWeight: 500 }, children: b.phone }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `tel:${b.phone}`, style: {
            fontSize: 11,
            fontWeight: 700,
            color: ACCENT$3,
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            background: "#f0f7ff",
            padding: "3px 8px",
            borderRadius: 6,
            textDecoration: "none"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { style: { width: 11, height: 11 } }),
            " ",
            t("call")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `sms:${b.phone}`, style: {
            fontSize: 11,
            fontWeight: 700,
            color: "#7c3aed",
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            background: "#f5f3ff",
            padding: "3px 8px",
            borderRadius: 6,
            textDecoration: "none"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { style: { width: 11, height: 11 } }),
            " ",
            t("smsAction")
          ] }),
          onEmpCallback && (genderPickOpen ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  setGenderPickOpen(false);
                  void onEmpCallback("male").then((msg) => {
                    setCallMsg(msg);
                    setTimeout(() => setCallMsg(null), 12e3);
                  });
                },
                title: "Client is male",
                style: { fontSize: 12, padding: "3px 8px", borderRadius: 6, background: "#dbeafe", border: "none", color: "#1d4ed8", fontWeight: 700, cursor: "pointer" },
                children: "♂"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  setGenderPickOpen(false);
                  void onEmpCallback("female").then((msg) => {
                    setCallMsg(msg);
                    setTimeout(() => setCallMsg(null), 12e3);
                  });
                },
                title: "Client is female",
                style: { fontSize: 12, padding: "3px 8px", borderRadius: 6, background: "#fce7f3", border: "none", color: "#be185d", fontWeight: 700, cursor: "pointer" },
                children: "♀"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setGenderPickOpen(false),
                style: { fontSize: 11, padding: "2px 4px", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" },
                children: "✕"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setGenderPickOpen(true),
              disabled: !!empCallLoading,
              title: "Call client via AI agent (606, masked)",
              style: {
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                fontSize: 11,
                fontWeight: 700,
                color: "#0369a1",
                background: "#e0f2fe",
                border: "none",
                padding: "3px 8px",
                borderRadius: 6,
                cursor: "pointer",
                opacity: empCallLoading ? 0.5 : 1
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneOutgoing, { style: { width: 11, height: 11 } }),
                " 606"
              ]
            }
          ))
        ] })
      ] }),
      callMsg && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        fontSize: 11,
        padding: "6px 10px",
        borderRadius: 8,
        marginTop: 4,
        background: callMsg.ok ? "#f0fdf4" : "#fef2f2",
        color: callMsg.ok ? "#15803d" : "#dc2626",
        border: `1px solid ${callMsg.ok ? "#bbf7d0" : "#fecaca"}`
      }, children: callMsg.text }),
      emailEditId === b.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { style: { width: 14, height: 14, flexShrink: 0, color: "#94a3b8" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              value: emailEditVal,
              onChange: (e) => setEmailEditVal(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") void saveClientEmail(b.id);
                if (e.key === "Escape") {
                  setEmailEditId(null);
                  setEmailEditMsg(null);
                }
              },
              placeholder: "email@example.com",
              autoFocus: true,
              style: {
                flex: 1,
                fontSize: 12,
                padding: "5px 8px",
                borderRadius: 6,
                border: "1.5px solid #1B6FE8",
                outline: "none",
                minWidth: 0
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => void saveClientEmail(b.id),
              disabled: emailEditSaving,
              style: {
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                background: emailEditSaving ? "#94a3b8" : "#1B6FE8",
                border: "none",
                padding: "5px 10px",
                borderRadius: 6,
                cursor: "pointer",
                flexShrink: 0
              },
              children: emailEditSaving ? "..." : "✓"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setEmailEditId(null);
                setEmailEditMsg(null);
              },
              style: {
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                background: "#f1f5f9",
                border: "none",
                padding: "5px 8px",
                borderRadius: 6,
                cursor: "pointer"
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { style: { width: 12, height: 12 } })
            }
          )
        ] }),
        emailEditMsg && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, paddingLeft: 22, color: emailEditMsg.ok ? "#059669" : "#dc2626", fontWeight: 600 }, children: emailEditMsg.text })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { style: { width: 14, height: 14, flexShrink: 0, color: "#94a3b8" } }),
        b.email ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { flex: 1, fontWeight: 500, fontSize: 12, wordBreak: "break-all" }, children: b.email }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { flex: 1, fontSize: 12, color: "#94a3b8", fontStyle: "italic" }, children: t("addEmail") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4, flexShrink: 0 }, children: [
          b.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `mailto:${b.email}`, style: {
            fontSize: 11,
            fontWeight: 700,
            color: "#059669",
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            background: "#ecfdf5",
            padding: "3px 8px",
            borderRadius: 6,
            textDecoration: "none"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { style: { width: 11, height: 11 } }),
            " ",
            t("emailAction")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setEmailEditId(b.id);
                setEmailEditVal(b.email ?? "");
                setEmailEditMsg(null);
              },
              title: t("editEmail"),
              style: {
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                background: "#f1f5f9",
                border: "none",
                padding: "3px 8px",
                borderRadius: 6,
                cursor: "pointer"
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { style: { width: 11, height: 11 } })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { style: { width: 14, height: 14, color: "#94a3b8" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 500 }, children: b.appliance }),
        b.brand_model && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#94a3b8" }, children: [
          "• ",
          b.brand_model
        ] })
      ] }),
      b.recall_note && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", padding: "6px 10px", borderRadius: 8, border: "1px solid #ede9fe" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { style: { width: 13, height: 13, flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b.recall_note })
      ] }),
      b.message && /* @__PURE__ */ jsxRuntimeExports.jsx(ClientMessageBlock, { message: b.message, empLang, authH, t }),
      b.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { borderTop: "1px solid #f1f5f9", marginTop: 4, paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: 12, fontWeight: 700, color: SUCCESS }, children: [
            "$",
            Number(b.payment_amount).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, color: "#94a3b8" }, children: b.payment_method })
        ] }),
        b.work_description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: "#374151" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { style: { width: 13, height: 13, flexShrink: 0, marginTop: 1, color: "#94a3b8" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b.work_description })
        ] }),
        b.parts_replaced && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: "#374151" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { style: { width: 13, height: 13, flexShrink: 0, marginTop: 1, color: "#94a3b8" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b.parts_replaced })
        ] })
      ] })
    ] }),
    lastEstimate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
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
            border: `1px solid ${ACCENT$3}`,
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
    onPhotos && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onPhotos, style: {
      width: "100%",
      minHeight: 40,
      background: "#fff",
      color: "#64748b",
      border: "1.5px solid #e2e8f0",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { style: { width: 15, height: 15 } }),
      t("photosBtn"),
      photoCount ? ` (${photoCount})` : ""
    ] }) }),
    b.status !== "completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }, children: [
      onEstimate && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: onEstimate,
          style: {
            width: "100%",
            minHeight: 40,
            background: "#fff",
            color: ACCENT$3,
            border: `1.5px solid ${ACCENT$3}`,
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { style: { width: 15, height: 15 } }),
            t("sendEstimate")
          ]
        }
      ),
      onClose && /* @__PURE__ */ jsxRuntimeExports.jsxs(Btn, { onClick: onClose, color: SUCCESS, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { style: { width: 18, height: 18 } }),
        t("closeJob")
      ] })
    ] }),
    onDownloadReceipt && b.status === "completed" && (b.payment_status === "paid" || b.stripe_paid) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: onDownloadReceipt,
        disabled: downloadingReceipt,
        style: {
          width: "100%",
          minHeight: 44,
          background: "#fff",
          color: ACCENT$3,
          border: `1.5px solid ${ACCENT$3}`,
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          cursor: downloadingReceipt ? "wait" : "pointer",
          opacity: downloadingReceipt ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { style: { width: 15, height: 15 } }),
          downloadingReceipt ? t("generating") : t("downloadReceipt")
        ]
      }
    ) }),
    b.status === "completed" && b.phone && onSendReview && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: onSendReview,
        disabled: sendingReview,
        style: {
          width: "100%",
          minHeight: 40,
          background: "#fffbeb",
          color: "#b45309",
          border: "1.5px solid #fcd34d",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          cursor: sendingReview ? "wait" : "pointer",
          opacity: sendingReview ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { style: { width: 15, height: 15 } }),
          sendingReview ? t("sendingReview") : t("sendReview")
        ]
      }
    ) }),
    b.status === "completed" && !isArchived && onArchive && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: onArchive,
        disabled: archiving,
        style: {
          width: "100%",
          minHeight: 40,
          background: "#f8fafc",
          color: "#64748b",
          border: "1.5px solid #e2e8f0",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          cursor: archiving ? "wait" : "pointer",
          opacity: archiving ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { style: { width: 14, height: 14 } }),
          archiving ? t("archiving") : t("archiveJob")
        ]
      }
    ) }),
    isArchived && onRestore && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: onRestore,
        disabled: archiving,
        style: {
          width: "100%",
          minHeight: 40,
          background: "#eff6ff",
          color: ACCENT$3,
          border: `1.5px solid ${ACCENT$3}`,
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          cursor: archiving ? "wait" : "pointer",
          opacity: archiving ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArchiveRestore, { style: { width: 14, height: 14 } }),
          archiving ? t("restoring") : t("restore")
        ]
      }
    ) })
  ] }) });
}
const ACCENT$2 = "#1B6FE8";
function formatDate(iso, locale) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}
function PaymentSuccess() {
  const [lang, setLang] = reactExports.useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get("lang");
    if (urlLang === "es" || urlLang === "en") return urlLang;
    const s = localStorage.getItem("lang");
    return s === "es" ? "es" : "en";
  });
  const [summary, setSummary] = reactExports.useState(null);
  const [loadState, setLoadState] = reactExports.useState("loading");
  const [downloading, setDownloading] = reactExports.useState(false);
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id") ?? "";
  reactExports.useEffect(() => {
    if (!sessionId) {
      setLoadState("done");
      return;
    }
    const base = "https://htr-group-llc-appliance-repair.replit.app".replace(/\/$/, "");
    fetch(`${base}/api/public/payment-confirmation?session_id=${encodeURIComponent(sessionId)}`).then((r2) => r2.json()).then((data) => {
      if (data.ok) setSummary(data);
      setLoadState("done");
    }).catch(() => setLoadState("done"));
  }, [sessionId]);
  const t = {
    en: {
      title: "Payment Received!",
      subtitle: "Thank you for paying online.",
      body: "Your payment has been processed. Our team will confirm your appointment shortly.",
      home: "Back to Home",
      invoiceLabel: "Invoice #",
      sessionLabel: "Session ref:",
      summary: "Service Summary",
      client: "Client",
      appliance: "Appliance",
      address: "Address",
      amount: "Amount Paid",
      date: "Service Date",
      work: "Work Performed",
      help: "Questions? Call us anytime:",
      download: "Download Receipt",
      downloading: "Generating PDF…",
      downloadError: "Could not generate receipt. Please try again."
    },
    es: {
      title: "¡Pago recibido!",
      subtitle: "Gracias por pagar en línea.",
      body: "Su pago ha sido procesado. Nuestro equipo confirmará su cita en breve.",
      home: "Volver al inicio",
      invoiceLabel: "Factura #",
      sessionLabel: "Referencia:",
      summary: "Resumen del servicio",
      client: "Cliente",
      appliance: "Electrodoméstico",
      address: "Dirección",
      amount: "Monto pagado",
      date: "Fecha de servicio",
      work: "Trabajo realizado",
      help: "¿Preguntas? Llámenos cuando quiera:",
      download: "Descargar recibo",
      downloading: "Generando PDF…",
      downloadError: "No se pudo generar el recibo. Inténtelo de nuevo."
    }
  }[lang];
  const invoiceNumber = summary?.invoice_number ?? null;
  const sessionRef = sessionId ? sessionId.slice(0, 24) + "…" : null;
  async function handleDownloadReceipt() {
    if (!sessionId || downloading) return;
    setDownloading(true);
    try {
      const base = "https://htr-group-llc-appliance-repair.replit.app".replace(/\/$/, "");
      const url = `${base}/api/public/invoice-html?session_id=${encodeURIComponent(sessionId)}&lang=${lang}`;
      const filenameBase = invoiceNumber ? `receipt-${invoiceNumber}` : "receipt";
      await downloadReceiptPdf({ url, filenameBase });
    } catch {
      window.alert(t.downloadError);
    } finally {
      setDownloading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-stone-50 flex flex-col items-center justify-center px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full bg-green-100 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-12 h-12 text-green-500" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-xl flex items-center justify-center", style: { background: ACCENT$2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-4 h-4 text-white" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-stone-700", children: "HTRGroup" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-stone-800 mb-2", children: t.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-stone-500 text-base mb-2", children: t.subtitle }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-stone-600 text-sm mb-5", children: t.body }),
    loadState === "loading" && sessionId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-stone-400 text-sm mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: lang === "en" ? "Loading your details…" : "Cargando sus detalles…" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mb-5 bg-stone-100 rounded-xl px-4 py-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-4 h-4 text-stone-400 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono text-stone-500", children: invoiceNumber ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        t.invoiceLabel,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-stone-700", children: invoiceNumber })
      ] }) : sessionRef ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        t.sessionLabel,
        " ",
        sessionRef
      ] }) : null })
    ] }),
    loadState === "done" && summary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl border border-stone-100 shadow-sm text-left px-5 py-4 mb-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-bold text-stone-400 uppercase tracking-wider mb-3", children: t.summary }),
      summary.client_name && /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-3.5 h-3.5 text-blue-500" }), label: t.client, value: summary.client_name }),
      summary.appliance && /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-3.5 h-3.5 text-blue-500" }), label: t.appliance, value: summary.appliance }),
      summary.amount != null && /* @__PURE__ */ jsxRuntimeExports.jsx(
        SummaryRow,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "w-3.5 h-3.5 text-green-600" }),
          label: t.amount,
          value: `$${summary.amount.toFixed(2)}`,
          valueClass: "font-bold text-green-700"
        }
      ),
      summary.preferred_date && /* @__PURE__ */ jsxRuntimeExports.jsx(
        SummaryRow,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3.5 h-3.5 text-blue-500" }),
          label: t.date,
          value: formatDate(summary.preferred_date, lang === "en" ? "en-US" : "es-MX")
        }
      ),
      summary.address && /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3.5 h-3.5 text-blue-500" }), label: t.address, value: summary.address }),
      summary.work_description && /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryRow, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-3.5 h-3.5 text-stone-400" }), label: t.work, value: summary.work_description })
    ] }),
    loadState === "done" && summary && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: handleDownloadReceipt,
        disabled: downloading,
        className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 font-bold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed",
        style: { borderColor: ACCENT$2, color: ACCENT$2, background: "white" },
        children: downloading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
          " ",
          t.downloading
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
          " ",
          t.download
        ] })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: "/",
          className: "flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition",
          style: { background: ACCENT$2 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "w-4 h-4" }),
            " ",
            t.home
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: "tel:+16066606067",
          className: "flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-stone-200 text-stone-700 font-bold text-sm hover:bg-stone-50 transition",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-4 h-4" }),
            " (606) 660-6067"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-stone-400 mt-8", children: [
      t.help,
      " (606) 660-6067"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setLang((l) => l === "en" ? "es" : "en"),
        className: "mt-4 text-xs text-stone-400 hover:text-stone-600 transition underline",
        children: lang === "en" ? "Español" : "English"
      }
    )
  ] }) });
}
function SummaryRow({
  icon,
  label,
  value,
  valueClass = "text-stone-800"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-lg bg-stone-50 flex items-center justify-center shrink-0 mt-0.5", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-stone-400", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-semibold leading-snug ${valueClass}`, children: value })
    ] })
  ] });
}
var RELEASE_TRAIN = "dahlia";
var ORIGIN = "https://js.stripe.com";
var STRIPE_JS_URL = "".concat(ORIGIN, "/").concat(RELEASE_TRAIN, "/stripe.js");
var V3_URL_REGEX = /^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/;
var STRIPE_JS_URL_REGEX = /^https:\/\/js\.stripe\.com\/(v3|[a-z]+)\/stripe\.js(\?.*)?$/;
var EXISTING_SCRIPT_MESSAGE = "loadStripe.setLoadParameters was called but an existing Stripe.js script already exists in the document; existing script parameters will be used";
var isStripeJSURL = function isStripeJSURL2(url) {
  return V3_URL_REGEX.test(url) || STRIPE_JS_URL_REGEX.test(url);
};
var findScript = function findScript2() {
  var scripts = document.querySelectorAll('script[src^="'.concat(ORIGIN, '"]'));
  for (var i = 0; i < scripts.length; i++) {
    var script = scripts[i];
    if (!isStripeJSURL(script.src)) {
      continue;
    }
    return script;
  }
  return null;
};
var injectScript = function injectScript2(params) {
  var queryString = "";
  var script = document.createElement("script");
  script.src = "".concat(STRIPE_JS_URL).concat(queryString);
  var headOrBody = document.head || document.body;
  if (!headOrBody) {
    throw new Error("Expected document.body not to be null. Stripe.js requires a <body> element.");
  }
  headOrBody.appendChild(script);
  return script;
};
var stripePromise$1 = null;
var onErrorListener = null;
var onLoadListener = null;
var onError = function onError2(reject) {
  return function(cause) {
    reject(new Error("Failed to load Stripe.js", {
      cause
    }));
  };
};
var onLoad = function onLoad2(resolve, reject) {
  return function() {
    if (window.Stripe) {
      resolve(window.Stripe);
    } else {
      reject(new Error("Stripe.js not available"));
    }
  };
};
var loadScript = function loadScript2(params) {
  if (stripePromise$1 !== null) {
    return stripePromise$1;
  }
  stripePromise$1 = new Promise(function(resolve, reject) {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(null);
      return;
    }
    if (window.Stripe) {
      resolve(window.Stripe);
      return;
    }
    try {
      var script = findScript();
      if (script && params) ;
      else if (!script) {
        script = injectScript(params);
      } else if (script && onLoadListener !== null && onErrorListener !== null) {
        var _script$parentNode;
        script.removeEventListener("load", onLoadListener);
        script.removeEventListener("error", onErrorListener);
        (_script$parentNode = script.parentNode) === null || _script$parentNode === void 0 ? void 0 : _script$parentNode.removeChild(script);
        script = injectScript(params);
      }
      onLoadListener = onLoad(resolve, reject);
      onErrorListener = onError(reject);
      script.addEventListener("load", onLoadListener);
      script.addEventListener("error", onErrorListener);
    } catch (error) {
      reject(error);
      return;
    }
  });
  return stripePromise$1["catch"](function(error) {
    stripePromise$1 = null;
    return Promise.reject(error);
  });
};
var stripePromise;
var getStripePromise = function getStripePromise2() {
  if (stripePromise) {
    return stripePromise;
  }
  stripePromise = loadScript(null)["catch"](function(error) {
    stripePromise = null;
    return Promise.reject(error);
  });
  return stripePromise;
};
Promise.resolve().then(function() {
  return getStripePromise();
})["catch"](function(error) {
  {
    console.warn(error);
  }
});
var propTypes = { exports: {} };
var ReactPropTypesSecret_1;
var hasRequiredReactPropTypesSecret;
function requireReactPropTypesSecret() {
  if (hasRequiredReactPropTypesSecret) return ReactPropTypesSecret_1;
  hasRequiredReactPropTypesSecret = 1;
  var ReactPropTypesSecret = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  ReactPropTypesSecret_1 = ReactPropTypesSecret;
  return ReactPropTypesSecret_1;
}
var factoryWithThrowingShims;
var hasRequiredFactoryWithThrowingShims;
function requireFactoryWithThrowingShims() {
  if (hasRequiredFactoryWithThrowingShims) return factoryWithThrowingShims;
  hasRequiredFactoryWithThrowingShims = 1;
  var ReactPropTypesSecret = /* @__PURE__ */ requireReactPropTypesSecret();
  function emptyFunction() {
  }
  function emptyFunctionWithReset() {
  }
  emptyFunctionWithReset.resetWarningCache = emptyFunction;
  factoryWithThrowingShims = function() {
    function shim2(props, propName, componentName, location2, propFullName, secret) {
      if (secret === ReactPropTypesSecret) {
        return;
      }
      var err = new Error(
        "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
      );
      err.name = "Invariant Violation";
      throw err;
    }
    shim2.isRequired = shim2;
    function getShim() {
      return shim2;
    }
    var ReactPropTypes = {
      array: shim2,
      bigint: shim2,
      bool: shim2,
      func: shim2,
      number: shim2,
      object: shim2,
      string: shim2,
      symbol: shim2,
      any: shim2,
      arrayOf: getShim,
      element: shim2,
      elementType: shim2,
      instanceOf: getShim,
      node: shim2,
      objectOf: getShim,
      oneOf: getShim,
      oneOfType: getShim,
      shape: getShim,
      exact: getShim,
      checkPropTypes: emptyFunctionWithReset,
      resetWarningCache: emptyFunction
    };
    ReactPropTypes.PropTypes = ReactPropTypes;
    return ReactPropTypes;
  };
  return factoryWithThrowingShims;
}
var hasRequiredPropTypes;
function requirePropTypes() {
  if (hasRequiredPropTypes) return propTypes.exports;
  hasRequiredPropTypes = 1;
  {
    propTypes.exports = /* @__PURE__ */ requireFactoryWithThrowingShims()();
  }
  return propTypes.exports;
}
var propTypesExports = /* @__PURE__ */ requirePropTypes();
const PropTypes = /* @__PURE__ */ getDefaultExportFromCjs(propTypesExports);
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) {
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof = function(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof(obj);
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function _iterableToArrayLimit(arr, i) {
  var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);
  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
var useAttachEvent = function useAttachEvent2(element, event, cb) {
  var cbDefined = !!cb;
  var cbRef = React.useRef(cb);
  React.useEffect(function() {
    cbRef.current = cb;
  }, [cb]);
  React.useEffect(function() {
    if (!cbDefined || !element) {
      return function() {
      };
    }
    var decoratedCb = function decoratedCb2() {
      if (cbRef.current) {
        cbRef.current.apply(cbRef, arguments);
      }
    };
    element.on(event, decoratedCb);
    return function() {
      element.off(event, decoratedCb);
    };
  }, [cbDefined, event, element, cbRef]);
};
var usePrevious = function usePrevious2(value) {
  var ref = React.useRef(value);
  React.useEffect(function() {
    ref.current = value;
  }, [value]);
  return ref.current;
};
var isUnknownObject = function isUnknownObject2(raw) {
  return raw !== null && _typeof(raw) === "object";
};
var PLAIN_OBJECT_STR = "[object Object]";
var isEqual = function isEqual2(left, right) {
  if (!isUnknownObject(left) || !isUnknownObject(right)) {
    return left === right;
  }
  var leftArray = Array.isArray(left);
  var rightArray = Array.isArray(right);
  if (leftArray !== rightArray) return false;
  var leftPlainObject = Object.prototype.toString.call(left) === PLAIN_OBJECT_STR;
  var rightPlainObject = Object.prototype.toString.call(right) === PLAIN_OBJECT_STR;
  if (leftPlainObject !== rightPlainObject) return false;
  if (!leftPlainObject && !leftArray) return left === right;
  var leftKeys = Object.keys(left);
  var rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  var keySet = {};
  for (var i = 0; i < leftKeys.length; i += 1) {
    keySet[leftKeys[i]] = true;
  }
  for (var _i = 0; _i < rightKeys.length; _i += 1) {
    keySet[rightKeys[_i]] = true;
  }
  var allKeys = Object.keys(keySet);
  if (allKeys.length !== leftKeys.length) {
    return false;
  }
  var l = left;
  var r2 = right;
  var pred = function pred2(key) {
    return isEqual2(l[key], r2[key]);
  };
  return allKeys.every(pred);
};
var extractAllowedOptionsUpdates = function extractAllowedOptionsUpdates2(options, prevOptions, immutableKeys) {
  if (!isUnknownObject(options)) {
    return null;
  }
  return Object.keys(options).reduce(function(newOptions, key) {
    var isUpdated = !isUnknownObject(prevOptions) || !isEqual(options[key], prevOptions[key]);
    if (immutableKeys.includes(key)) {
      if (isUpdated) {
        console.warn("Unsupported prop change: options.".concat(key, " is not a mutable property."));
      }
      return newOptions;
    }
    if (!isUpdated) {
      return newOptions;
    }
    return _objectSpread2(_objectSpread2({}, newOptions || {}), {}, _defineProperty({}, key, options[key]));
  }, null);
};
var ElementsContext = /* @__PURE__ */ React.createContext(null);
ElementsContext.displayName = "ElementsContext";
var parseElementsContext = function parseElementsContext2(ctx, useCase) {
  if (!ctx) {
    throw new Error("Could not find Elements context; You need to wrap the part of your app that ".concat(useCase, " in an <Elements> provider."));
  }
  return ctx;
};
({
  stripe: PropTypes.any,
  options: PropTypes.object
});
({
  children: PropTypes.func.isRequired
});
var CheckoutContext = /* @__PURE__ */ React.createContext(null);
CheckoutContext.displayName = "CheckoutContext";
var useElementsOrCheckoutContextWithUseCase = function useElementsOrCheckoutContextWithUseCase2(useCaseString) {
  var checkout = React.useContext(CheckoutContext);
  var elements = React.useContext(ElementsContext);
  if (checkout) {
    if (elements) {
      throw new Error("You cannot wrap the part of your app that ".concat(useCaseString, " in both a checkout provider and <Elements> provider."));
    } else {
      return checkout;
    }
  } else {
    return parseElementsContext(elements, useCaseString);
  }
};
var _excluded = ["mode"];
var capitalized = function capitalized2(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
var createElementComponent = function createElementComponent2(type, isServer2, customDisplayName) {
  var displayName = "".concat(capitalized(type), "Element");
  var ClientElement = function ClientElement2(_ref) {
    var id2 = _ref.id, className = _ref.className, _ref$options = _ref.options, options = _ref$options === void 0 ? {} : _ref$options, onBlur = _ref.onBlur, onFocus = _ref.onFocus, onReady = _ref.onReady, onChange = _ref.onChange, onEscape = _ref.onEscape, onClick = _ref.onClick, onLoadError = _ref.onLoadError, onLoaderStart = _ref.onLoaderStart, onNetworksChange = _ref.onNetworksChange, onConfirm = _ref.onConfirm, onCancel = _ref.onCancel, onShippingAddressChange = _ref.onShippingAddressChange, onShippingRateChange = _ref.onShippingRateChange, onSavedPaymentMethodRemove = _ref.onSavedPaymentMethodRemove, onSavedPaymentMethodUpdate = _ref.onSavedPaymentMethodUpdate;
    var ctx = useElementsOrCheckoutContextWithUseCase("mounts <".concat(displayName, ">"));
    var elements = "elements" in ctx ? ctx.elements : null;
    var checkoutState = "checkoutState" in ctx ? ctx.checkoutState : null;
    var checkoutSdk = (checkoutState === null || checkoutState === void 0 ? void 0 : checkoutState.type) === "success" || (checkoutState === null || checkoutState === void 0 ? void 0 : checkoutState.type) === "loading" ? checkoutState.sdk : null;
    var _React$useState = React.useState(null), _React$useState2 = _slicedToArray(_React$useState, 2), element = _React$useState2[0], setElement = _React$useState2[1];
    var elementRef = React.useRef(null);
    var domNode = React.useRef(null);
    useAttachEvent(element, "blur", onBlur);
    useAttachEvent(element, "focus", onFocus);
    useAttachEvent(element, "escape", onEscape);
    useAttachEvent(element, "click", onClick);
    useAttachEvent(element, "loaderror", onLoadError);
    useAttachEvent(element, "loaderstart", onLoaderStart);
    useAttachEvent(element, "networkschange", onNetworksChange);
    useAttachEvent(element, "confirm", onConfirm);
    useAttachEvent(element, "cancel", onCancel);
    useAttachEvent(element, "shippingaddresschange", onShippingAddressChange);
    useAttachEvent(element, "shippingratechange", onShippingRateChange);
    useAttachEvent(element, "savedpaymentmethodremove", onSavedPaymentMethodRemove);
    useAttachEvent(element, "savedpaymentmethodupdate", onSavedPaymentMethodUpdate);
    useAttachEvent(element, "change", onChange);
    var readyCallback;
    if (onReady) {
      if (type === "expressCheckout") {
        readyCallback = onReady;
      } else {
        readyCallback = function readyCallback2() {
          onReady(element);
        };
      }
    }
    useAttachEvent(element, "ready", readyCallback);
    React.useLayoutEffect(function() {
      if (elementRef.current === null && domNode.current !== null && (elements || checkoutSdk)) {
        var newElement = null;
        if (checkoutSdk) {
          var elementsSdk = checkoutSdk;
          var formSdk = checkoutSdk;
          switch (type) {
            case "paymentForm":
              newElement = formSdk.createForm(options);
              break;
            case "payment":
              newElement = elementsSdk.createPaymentElement(options);
              break;
            case "address":
              if ("mode" in options) {
                var mode = options.mode, restOptions = _objectWithoutProperties(options, _excluded);
                if (mode === "shipping") {
                  newElement = elementsSdk.createShippingAddressElement(restOptions);
                } else if (mode === "billing") {
                  newElement = elementsSdk.createBillingAddressElement(restOptions);
                } else {
                  throw new Error("Invalid options.mode. mode must be 'billing' or 'shipping'.");
                }
              } else {
                throw new Error("You must supply options.mode. mode must be 'billing' or 'shipping'.");
              }
              break;
            case "expressCheckout":
              newElement = elementsSdk.createExpressCheckoutElement(options);
              break;
            case "currencySelector":
              newElement = checkoutSdk.createCurrencySelectorElement();
              break;
            case "taxId":
              newElement = elementsSdk.createTaxIdElement(options);
              break;
            case "contactDetails":
              newElement = elementsSdk.createContactDetailsElement();
              break;
            default:
              throw new Error("<".concat(displayName, "> is not supported inside a checkout provider. Use an <Elements> provider instead."));
          }
        } else if (elements) {
          newElement = elements.create(type, options);
        }
        elementRef.current = newElement;
        setElement(newElement);
        if (newElement) {
          newElement.mount(domNode.current);
        }
      }
    }, [elements, checkoutSdk, options]);
    var prevOptions = usePrevious(options);
    React.useEffect(function() {
      if (!elementRef.current) {
        return;
      }
      var updates = extractAllowedOptionsUpdates(options, prevOptions, ["paymentRequest"]);
      if (updates && "update" in elementRef.current) {
        elementRef.current.update(updates);
      }
    }, [options, prevOptions]);
    React.useLayoutEffect(function() {
      return function() {
        if (elementRef.current && typeof elementRef.current.destroy === "function") {
          try {
            elementRef.current.destroy();
            elementRef.current = null;
          } catch (error) {
          }
        }
      };
    }, []);
    return /* @__PURE__ */ React.createElement("div", {
      id: id2,
      className,
      ref: domNode
    });
  };
  var ServerElement = function ServerElement2(props) {
    useElementsOrCheckoutContextWithUseCase("mounts <".concat(displayName, ">"));
    var id2 = props.id, className = props.className;
    return /* @__PURE__ */ React.createElement("div", {
      id: id2,
      className
    });
  };
  var Element2 = isServer2 ? ServerElement : ClientElement;
  Element2.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    onReady: PropTypes.func,
    onEscape: PropTypes.func,
    onClick: PropTypes.func,
    onLoadError: PropTypes.func,
    onLoaderStart: PropTypes.func,
    onNetworksChange: PropTypes.func,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    onShippingAddressChange: PropTypes.func,
    onShippingRateChange: PropTypes.func,
    onSavedPaymentMethodRemove: PropTypes.func,
    onSavedPaymentMethodUpdate: PropTypes.func,
    options: PropTypes.object
  };
  Element2.displayName = displayName;
  Element2.__elementType = type;
  return Element2;
};
var isServer = typeof window === "undefined";
var EmbeddedCheckoutContext = /* @__PURE__ */ React.createContext(null);
EmbeddedCheckoutContext.displayName = "EmbeddedCheckoutProviderContext";
createElementComponent("auBankAccount", isServer);
createElementComponent("card", isServer);
createElementComponent("cardNumber", isServer);
createElementComponent("cardExpiry", isServer);
createElementComponent("cardCvc", isServer);
createElementComponent("iban", isServer);
createElementComponent("payment", isServer);
createElementComponent("expressCheckout", isServer);
createElementComponent("paymentRequestButton", isServer);
createElementComponent("linkAuthentication", isServer);
createElementComponent("contactDetails", isServer);
createElementComponent("address", isServer);
createElementComponent("shippingAddress", isServer);
createElementComponent("paymentMethodMessaging", isServer);
createElementComponent("taxId", isServer);
createElementComponent("issuingCardNumberDisplay", isServer);
createElementComponent("issuingCardCvcDisplay", isServer);
createElementComponent("issuingCardExpiryDisplay", isServer);
createElementComponent("issuingCardPinDisplay", isServer);
createElementComponent("issuingCardCopyButton", isServer);
const ACCENT$1 = "#1B6FE8";
const API_BASE$2 = "https://htr-group-llc-appliance-repair.replit.app".replace(/\/$/, "");
const stripePromiseEn = null;
const stripePromiseEs = null;
const T = {
  en: {
    title: "Pay for Your Repair",
    subtitle: "Hi-Tech Repair Group",
    amountLabel: "Amount (USD)",
    amountPlh: "e.g. 150",
    nameLabel: "Your Name (optional)",
    namePlh: "John Smith",
    nextBtn: "Continue to Payment",
    payBtn: "Pay Now",
    processing: "Processing…",
    errEmpty: "Please enter an amount",
    errMin: "Minimum amount is $1",
    errMax: "Maximum amount is $50,000",
    errServer: "Payment error. Please try again.",
    cancelled: "Payment was cancelled. You can try again.",
    secure: "Secured by Stripe",
    paying: "Paying",
    change: "Change amount",
    successTitle: "Payment Successful!",
    successMsg: "Thank you! Your payment has been received.",
    cardTitle: "Payment Details",
    doneBtn: "Done"
  },
  es: {
    title: "Pagar su Reparación",
    subtitle: "Hi-Tech Repair Group",
    amountLabel: "Monto (USD)",
    amountPlh: "ej. 150",
    nameLabel: "Su Nombre (opcional)",
    namePlh: "Juan García",
    nextBtn: "Continuar al Pago",
    payBtn: "Pagar Ahora",
    processing: "Procesando…",
    errEmpty: "Por favor ingrese un monto",
    errMin: "El monto mínimo es $1",
    errMax: "El monto máximo es $50,000",
    errServer: "Error de pago. Intente de nuevo.",
    cancelled: "El pago fue cancelado. Puede intentar de nuevo.",
    secure: "Protegido por Stripe",
    paying: "Pagando",
    change: "Cambiar monto",
    successTitle: "¡Pago Exitoso!",
    successMsg: "¡Gracias! Su pago ha sido recibido.",
    cardTitle: "Datos de Pago",
    doneBtn: "Listo"
  }
};
function PayPage() {
  const params = new URLSearchParams(window.location.search);
  const initLang = params.get("lang") === "es" ? "es" : "en";
  const cancelled = params.get("cancelled") === "1";
  const [lang, setLang] = reactExports.useState(initLang);
  const [amount, setAmount] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [clientSecret, setClientSecret] = reactExports.useState(null);
  const [loadingIntent, setLoadingIntent] = reactExports.useState(false);
  const [confirmedAmount, setConfirmedAmount] = reactExports.useState(0);
  const t = T[lang];
  reactExports.useEffect(() => {
    const prev = document.querySelector("link[rel='manifest']");
    if (prev) document.head.removeChild(prev);
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = "/pay-manifest.json";
    document.head.appendChild(link);
    const setMeta = (name2, content) => {
      let el = document.querySelector(`meta[name="${name2}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name2);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta("apple-mobile-web-app-capable", "yes");
    setMeta("apple-mobile-web-app-status-bar-style", "default");
    setMeta("apple-mobile-web-app-title", "HTR Pay");
    setMeta("theme-color", "#1B6FE8");
    const appleIcon = document.createElement("link");
    appleIcon.rel = "apple-touch-icon";
    appleIcon.href = "/icon-192.png";
    document.head.appendChild(appleIcon);
    return () => {
      if (link.parentNode) document.head.removeChild(link);
      if (appleIcon.parentNode) document.head.removeChild(appleIcon);
      if (prev) document.head.appendChild(prev);
    };
  }, []);
  async function handleContinue() {
    setError("");
    const parsed = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (!amount.trim() || isNaN(parsed)) {
      setError(t.errEmpty);
      return;
    }
    if (parsed < 1) {
      setError(t.errMin);
      return;
    }
    if (parsed > 5e4) {
      setError(t.errMax);
      return;
    }
    setLoadingIntent(true);
    try {
      const resp = await fetch(`${API_BASE$2}/api/public/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsed, name, lang })
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok || !data.clientSecret) {
        setError(data.error ?? t.errServer);
        setLoadingIntent(false);
        return;
      }
      setConfirmedAmount(parsed);
      setClientSecret(data.clientSecret);
    } catch {
      setError(t.errServer);
    }
    setLoadingIntent(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    minHeight: "100dvh",
    background: "linear-gradient(135deg, #f0f6ff 0%, #e8f0fe 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'Inter', system-ui, sans-serif"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      width: "100%",
      maxWidth: 440,
      background: "#fff",
      borderRadius: 20,
      boxShadow: "0 8px 40px rgba(27,111,232,0.12)",
      padding: "32px 28px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 19, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }, children: t.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 12, color: "#64748b", marginTop: 3 }, children: t.subtitle })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 6 }, children: ["en", "es"].map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setLang(l),
            style: {
              padding: "5px 10px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              background: lang === l ? ACCENT$1 : "#f1f5f9",
              color: lang === l ? "#fff" : "#64748b"
            },
            children: l === "en" ? "EN" : "ES"
          },
          l
        )) })
      ] }),
      !clientSecret && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        cancelled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          background: "#fef3c7",
          border: "1px solid #fcd34d",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 13,
          color: "#92400e",
          marginBottom: 18
        }, children: [
          "⚠️ ",
          t.cancelled
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }, children: t.amountLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18,
              fontWeight: 700,
              color: "#374151"
            }, children: "$" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                inputMode: "decimal",
                min: "1",
                step: "1",
                value: amount,
                onChange: (e) => {
                  setAmount(e.target.value);
                  setError("");
                },
                onKeyDown: (e) => {
                  if (e.key === "Enter") handleContinue();
                },
                placeholder: t.amountPlh,
                style: {
                  width: "100%",
                  padding: "14px 14px 14px 32px",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#0f172a",
                  border: error ? "2px solid #ef4444" : "2px solid #e2e8f0",
                  borderRadius: 12,
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#f8fafc"
                },
                onFocus: (e) => {
                  e.currentTarget.style.borderColor = ACCENT$1;
                },
                onBlur: (e) => {
                  e.currentTarget.style.borderColor = error ? "#ef4444" : "#e2e8f0";
                }
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: 22 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }, children: t.nameLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: name,
              onChange: (e) => setName(e.target.value),
              placeholder: t.namePlh,
              style: {
                width: "100%",
                padding: "12px 14px",
                fontSize: 15,
                color: "#0f172a",
                border: "2px solid #e2e8f0",
                borderRadius: 12,
                outline: "none",
                boxSizing: "border-box",
                background: "#f8fafc"
              },
              onFocus: (e) => {
                e.currentTarget.style.borderColor = ACCENT$1;
              },
              onBlur: (e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
              }
            }
          )
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 13,
          color: "#b91c1c",
          marginBottom: 16
        }, children: [
          "❌ ",
          error
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleContinue,
            disabled: loadingIntent,
            style: {
              width: "100%",
              padding: "16px",
              background: loadingIntent ? "#94a3b8" : ACCENT$1,
              color: "#fff",
              borderRadius: 12,
              border: "none",
              fontSize: 16,
              fontWeight: 800,
              cursor: loadingIntent ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.2s"
            },
            children: loadingIntent ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                width: 18,
                height: 18,
                border: "2.5px solid rgba(255,255,255,0.4)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.7s linear infinite"
              } }),
              t.processing
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: t.nextBtn })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          marginTop: 14,
          textAlign: "center",
          fontSize: 11,
          color: "#94a3b8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "#94a3b8", strokeWidth: "2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
          ] }),
          t.secure,
          " · Google Pay · Apple Pay · Card"
        ] })
      ] }),
      clientSecret && (lang === "es" ? stripePromiseEs : stripePromiseEn),
      clientSecret && !stripePromiseEn && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { color: "#b91c1c", fontSize: 14, textAlign: "center" }, children: "Stripe is not configured. Please contact support." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      ` })
  ] });
}
const API_BASE$1 = "https://htr-group-llc-appliance-repair.replit.app".replace(/\/$/, "");
function VoiceBookCallPage() {
  const [, params] = useRoute("/book-call/:token");
  const token = params?.token ?? "";
  reactExports.useEffect(() => {
    if (!token) return;
    window.location.replace(`${API_BASE$1}/api/intake-form/${encodeURIComponent(token)}`);
  }, [token]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-[#EFF6FF]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-[#1B6FE8]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-stone-600 mt-3 text-sm", children: "Opening your appointment form…" }),
    token ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-stone-400 mt-4 text-center max-w-xs", children: [
      "If nothing happens,",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: `${API_BASE$1}/api/intake-form/${encodeURIComponent(token)}`,
          className: "text-[#1B6FE8] font-semibold underline",
          children: "tap here"
        }
      ),
      "."
    ] }) : null
  ] });
}
function BackButton() {
  const [location2] = useLocation();
  if (location2 === "/" || location2 === "" || location2.startsWith("/admin")) return null;
  const goBack = () => {
    if (location2.startsWith("/employee")) {
      window.dispatchEvent(new CustomEvent("htr-employee-back"));
      return;
    }
    window.history.back();
  };
  const button = /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: goBack,
      "aria-label": "Go back",
      style: {
        position: "fixed",
        left: "12px",
        bottom: "24px",
        zIndex: 999999,
        background: "rgba(11,26,63,0.45)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: "9999px",
        padding: "8px 14px",
        fontSize: "13px",
        fontWeight: 600,
        color: "white",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        cursor: "pointer",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        letterSpacing: "0.01em",
        opacity: 0.75,
        transition: "opacity 0.2s"
      },
      onMouseEnter: (e) => e.currentTarget.style.opacity = "1",
      onMouseLeave: (e) => e.currentTarget.style.opacity = "0.75",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 14 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Back" })
      ]
    }
  );
  return reactDomExports.createPortal(button, document.body);
}
const STORAGE_KEY$1 = "htr_promo_shown";
const DELAY_MS = 1e3;
const EXCLUDED_PATHS = ["/admin", "/gallery", "/book-call", "/intake", "/form", "/pay", "/payment-success"];
function makeTranslations(fee) {
  const n = Number(fee);
  const isFree = Number.isFinite(n) && n === 0;
  const feeLabel = isFree ? "Free" : `$${fee}`;
  const feeLabelEs = isFree ? "Gratis" : `$${fee}`;
  return {
    en: {
      badge: "Limited Offer",
      title: isFree ? "Free Diagnostic Visit!" : `$${fee} Diagnostic Visit!`,
      sub: isFree ? "Not sure what's wrong with your appliance? Our technician comes to you and diagnoses the problem — completely free." : `Not sure what's wrong with your appliance? Our technician comes to you and diagnoses the problem for only $${fee} — applied toward your repair.`,
      cta: isFree ? "Book Free Visit" : `Book for ${feeLabel}`,
      dismiss: "No thanks"
    },
    es: {
      badge: "Oferta Limitada",
      title: isFree ? "¡Visita de Diagnóstico Gratis!" : `¡Visita de Diagnóstico por ${feeLabelEs}!`,
      sub: isFree ? "¿No sabe qué le pasa a su electrodoméstico? Nuestro técnico va a su casa y diagnostica el problema — completamente gratis." : `¿No sabe qué le pasa a su electrodoméstico? Nuestro técnico va a su casa y diagnostica el problema por solo ${feeLabelEs} — aplicado al costo de la reparación.`,
      cta: isFree ? "Reservar Visita Gratis" : `Reservar por ${feeLabelEs}`,
      dismiss: "No, gracias"
    }
  };
}
function safeStorage(type) {
  try {
    const s = type === "local" ? localStorage : sessionStorage;
    s.setItem("__test__", "1");
    s.removeItem("__test__");
    return s;
  } catch {
    return null;
  }
}
const API_BASE = "https://htr-group-llc-appliance-repair.replit.app".replace(/\/$/, "");
function PromoPopup() {
  const [visible, setVisible] = reactExports.useState(false);
  const [fee, setFee] = reactExports.useState(null);
  const lang = (() => {
    try {
      return localStorage.getItem("lang") ?? "en";
    } catch {
      return "en";
    }
  })();
  reactExports.useEffect(() => {
    const base = "/".replace(/\/$/, "") || "";
    const p = window.location.pathname.replace(base, "") || "/";
    if (EXCLUDED_PATHS.some((ep) => p === ep || p.startsWith(ep + "/"))) return;
    const ss = safeStorage("session");
    if (ss?.getItem(STORAGE_KEY$1)) return;
    fetch(`${API_BASE}/api/settings/visit-fee?site=appliance`).then((r2) => r2.json()).then((d) => setFee(d.fee ?? "0")).catch(() => setFee("0"));
    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
  function close() {
    try {
      sessionStorage.setItem(STORAGE_KEY$1, "1");
    } catch {
    }
    setVisible(false);
  }
  function bookNow() {
    close();
    setTimeout(() => {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  }
  if (!visible || fee === null) return null;
  const TR2 = makeTranslations(fee);
  const T2 = TR2[lang] ?? TR2.en;
  const modal = /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 999998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(11,26,63,0.65)",
        backdropFilter: "blur(4px)"
      },
      onClick: close,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: (e) => e.stopPropagation(),
          style: {
            background: "white",
            borderRadius: "20px",
            maxWidth: "420px",
            width: "100%",
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
            animation: "htr-popup-in 0.35s cubic-bezier(0.34,1.56,0.64,1)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
          @keyframes htr-popup-in {
            from { opacity: 0; transform: scale(0.85) translateY(20px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        ` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              background: "linear-gradient(135deg,#0B1A3F,#1B6FE8)",
              padding: "28px 24px 20px",
              position: "relative",
              textAlign: "center"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: close,
                  "aria-label": "Close",
                  style: {
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    borderRadius: "9999px",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white"
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                display: "inline-block",
                background: "#F59E0B",
                color: "#1a1a1a",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: "9999px",
                marginBottom: "12px"
              }, children: T2.badge }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                width: "56px",
                height: "56px",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "9999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { size: 28, color: "white" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: {
                color: "white",
                fontSize: "22px",
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.2
              }, children: T2.title })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "20px 24px 24px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
                color: "#4b5563",
                fontSize: "14px",
                lineHeight: 1.6,
                margin: "0 0 20px",
                textAlign: "center"
              }, children: T2.sub }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: bookNow,
                  style: {
                    width: "100%",
                    padding: "14px",
                    background: "linear-gradient(135deg,#1B6FE8,#0D47B0)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "15px",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(27,111,232,0.4)"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { size: 18 }),
                    T2.cta
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: close,
                  style: {
                    width: "100%",
                    marginTop: "10px",
                    padding: "10px",
                    background: "transparent",
                    border: "none",
                    color: "#9ca3af",
                    fontSize: "13px",
                    cursor: "pointer",
                    textDecoration: "underline"
                  },
                  children: T2.dismiss
                }
              )
            ] })
          ]
        }
      )
    }
  );
  return reactDomExports.createPortal(modal, document.body);
}
const STORAGE_KEY = "admin_ui_lang";
function readAdminUiLang() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "en" ? "en" : "ru";
  } catch {
    return "ru";
  }
}
function writeAdminUiLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
  }
}
function AdminLangToggle({ lang, onChange, accent, compact = false }) {
  const wrapCls = compact ? "inline-flex items-center gap-0.5 rounded-md border border-stone-200 bg-white p-0.5" : "inline-flex items-center gap-0.5 rounded-lg border border-stone-200 bg-white p-0.5";
  const btnCls = compact ? "px-2 py-1 rounded text-xs font-bold transition" : "px-2.5 py-1 rounded-md text-xs font-bold transition";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: wrapCls, role: "group", "aria-label": "Admin language", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange("ru"),
        className: btnCls,
        style: {
          color: lang === "ru" ? "#fff" : "#a8a29e",
          backgroundColor: lang === "ru" ? accent : "transparent"
        },
        children: "RU"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange("en"),
        className: btnCls,
        style: {
          color: lang === "en" ? "#fff" : "#a8a29e",
          backgroundColor: lang === "en" ? accent : "transparent"
        },
        children: "EN"
      }
    )
  ] });
}
const RU = {
  scheduleMgmt: "Управление расписанием",
  protectedSection: "Защищённый раздел",
  logout: "Выйти",
  photoTab: "Фото",
  photoUploadTitle: "Загрузка фото на сайт",
  photoUploadDesc: "Раздел Our Work / Gallery — выберите Dental или Appliance перед загрузкой.",
  settingsTab: "Настройки",
  settingsDesc: "Всплывающее окно при первом заходе на сайт. Цены для Appliance и Dental задаются отдельно.",
  employeePortal: "Портал сотрудника",
  pay: "Оплата",
  tabSlots: "Слоты",
  tabBookings: "Заявки",
  tabPhotos: "Фото",
  tabSettings: "Настройки",
  pickDate: "Выберите дату",
  refresh: "Обновить",
  dateLabel: "Дата",
  slotsOn: "Слоты на",
  legendFree: "🟢 Свободен",
  legendBlocked: "🟠 Заблок.",
  legendBusy: "🔴 Занят",
  blockReason: "Причина блокировки:",
  blockReasonPh: "Повторный вызов...",
  statusApproved: "✅ Подтверждён",
  statusPending: "⏳ Ожидает",
  statusCompleted: "✓ Завершён",
  statusCancelled: "❌ Отменён",
  slotFree: "🟢 Свободен",
  slotBlocked: "🔒 Заблокирован",
  releaseSlot: "Освободить",
  unblock: "Разблокировать",
  block: "Блок",
  book: "Бронь",
  allBookings: "Все заявки",
  activeBookings: "Активные заявки",
  activeOnly: "Активные",
  allWithHistory: "Все заявки",
  category: "Категория:",
  filterAll: "Все",
  searchPh: "Поиск по имени, телефону, адресу, дате, оборудованию…",
  clearSearch: "Очистить",
  foundCount: "Найдено",
  selectAll: "Выбрать всё",
  deselectAll: "Снять всё",
  selected: "Выбрано",
  deleteSelected: "Удалить выбранные",
  resetSelection: "× Сбросить",
  loadErrorTitle: "Ошибка загрузки заявок",
  noSearchResults: "Ничего не найдено — попробуйте другой запрос",
  noBookings: "Заявок пока нет",
  history: "История",
  colCreated: "Создано",
  colVisitDate: "Дата визита",
  colTime: "Время",
  colClient: "Клиент",
  colPhone: "Телефон",
  colEquipment: "Оборудование",
  colStatus: "Статус",
  colAction: "Действие",
  approve: "Одобрить",
  edit: "Изменить",
  reschedule: "Перенести",
  complete: "Завершить",
  cancel: "Отменить",
  deleteForever: "Удалить",
  restore: "Восстановить",
  cancelBookingTitle: "Отменить бронирование?",
  cancelBookingClient: "Клиент",
  cancelBookingTime: "Время",
  cancelBookingHint: "Слот снова станет доступным для новых бронирований.",
  back: "Назад",
  yesRelease: "Да, освободить",
  completeTitle: "Отметить как завершённое?",
  completeHint: "Нажмите только после того как ремонт фактически выполнен. Бронь переместится в историю.",
  completeConfirm: "✓ Завершить",
  bulkDeleteTitle: "Удалить выбранные заявки?",
  bulkDeleteCount: "Количество",
  bulkDeleteWarn: "⚠️ Действие необратимо. Все выбранные заявки будут удалены из базы данных навсегда.",
  deleting: "Удаляем...",
  deleteConfirm: "🗑️ Удалить навсегда",
  deleteTitle: "Удалить заявку навсегда?",
  deleteWarn: "⚠️ Это действие необратимо. Заявка будет удалена из базы данных без возможности восстановления.",
  restoreTitle: "Восстановить заявку?",
  restoreClient: "Клиент",
  restoreDate: "Дата",
  hideEdits: "Скрыть изменения",
  showEdits: "✏️ Внести изменения в заявку",
  clientName: "Имя клиента",
  phone: "Телефон",
  email: "Email",
  address: "Адрес",
  equipment: "Оборудование",
  note: "Заметка",
  newDate: "Новая дата",
  newTime: "Новое время",
  rescheduling: "⏳ Переносим...",
  rescheduleBtn: "📅 Перенести",
  editBookingTitle: "Изменить бронирование",
  dateRequired: "Дата *",
  dateFormatHint: "Формат: Apr 25, 2026",
  timeRequired: "Время *",
  saving: "Сохранение…",
  saveChanges: "Сохранить изменения",
  manualBookingTitle: "Создать бронирование",
  zipOptional: "ZIP-код (необязательно)",
  booking: "Забронировать",
  pinLabel: "PIN-код",
  pinPh: "Введите PIN",
  pinWrong: "Неверный PIN-код",
  login: "Войти",
  dbDevEn: "Database developed by Eivaz Rakhmanov 2026",
  dbDevRu: "База данных разработана Эйвазом Рахмановым в 2026 году"
};
const EN = {
  scheduleMgmt: "Schedule management",
  protectedSection: "Protected area",
  logout: "Log out",
  photoTab: "Photos",
  photoUploadTitle: "Upload photos to site",
  photoUploadDesc: "Our Work / Gallery — choose Dental or Appliance before uploading.",
  settingsTab: "Settings",
  settingsDesc: "First-visit popup. Appliance and Dental prices are set separately.",
  employeePortal: "Employee Portal",
  pay: "Pay",
  tabSlots: "Slots",
  tabBookings: "Bookings",
  tabPhotos: "Photos",
  tabSettings: "Settings",
  pickDate: "Select date",
  refresh: "Refresh",
  dateLabel: "Date",
  slotsOn: "Slots for",
  legendFree: "🟢 Free",
  legendBlocked: "🟠 Blocked",
  legendBusy: "🔴 Booked",
  blockReason: "Block reason:",
  blockReasonPh: "Follow-up visit...",
  statusApproved: "✅ Approved",
  statusPending: "⏳ Pending",
  statusCompleted: "✓ Completed",
  statusCancelled: "❌ Cancelled",
  slotFree: "🟢 Free",
  slotBlocked: "🔒 Blocked",
  releaseSlot: "Release",
  unblock: "Unblock",
  block: "Block",
  book: "Book",
  allBookings: "All bookings",
  activeBookings: "Active bookings",
  activeOnly: "Active",
  allWithHistory: "All bookings",
  category: "Category:",
  filterAll: "All",
  searchPh: "Search by name, phone, address, date, equipment…",
  clearSearch: "Clear",
  foundCount: "Found",
  selectAll: "Select all",
  deselectAll: "Deselect all",
  selected: "Selected",
  deleteSelected: "Delete selected",
  resetSelection: "× Reset",
  loadErrorTitle: "Failed to load bookings",
  noSearchResults: "Nothing found — try another query",
  noBookings: "No bookings yet",
  history: "History",
  colCreated: "Created",
  colVisitDate: "Visit date",
  colTime: "Time",
  colClient: "Client",
  colPhone: "Phone",
  colEquipment: "Equipment",
  colStatus: "Status",
  colAction: "Action",
  approve: "Approve",
  edit: "Edit",
  reschedule: "Reschedule",
  complete: "Complete",
  cancel: "Cancel",
  deleteForever: "Delete",
  restore: "Restore",
  cancelBookingTitle: "Cancel booking?",
  cancelBookingClient: "Client",
  cancelBookingTime: "Time",
  cancelBookingHint: "The slot will become available for new bookings.",
  back: "Back",
  yesRelease: "Yes, release",
  completeTitle: "Mark as completed?",
  completeHint: "Click only after the repair is actually done. The booking moves to history.",
  completeConfirm: "✓ Complete",
  bulkDeleteTitle: "Delete selected bookings?",
  bulkDeleteCount: "Count",
  bulkDeleteWarn: "⚠️ This cannot be undone. All selected bookings will be permanently deleted.",
  deleting: "Deleting...",
  deleteConfirm: "🗑️ Delete forever",
  deleteTitle: "Delete booking forever?",
  deleteWarn: "⚠️ This cannot be undone. The booking will be permanently removed from the database.",
  restoreTitle: "Restore booking?",
  restoreClient: "Client",
  restoreDate: "Date",
  hideEdits: "Hide edits",
  showEdits: "✏️ Edit booking before restore",
  clientName: "Client name",
  phone: "Phone",
  email: "Email",
  address: "Address",
  equipment: "Equipment",
  note: "Note",
  newDate: "New date",
  newTime: "New time",
  rescheduling: "⏳ Rescheduling...",
  rescheduleBtn: "📅 Reschedule",
  editBookingTitle: "Edit booking",
  dateRequired: "Date *",
  dateFormatHint: "Format: Apr 25, 2026",
  timeRequired: "Time *",
  saving: "Saving…",
  saveChanges: "Save changes",
  manualBookingTitle: "Create booking",
  zipOptional: "ZIP code (optional)",
  booking: "Book",
  pinLabel: "PIN code",
  pinPh: "Enter PIN",
  pinWrong: "Wrong PIN",
  login: "Sign in",
  dbDevEn: "Database developed by Eivaz Rakhmanov 2026",
  dbDevRu: "Database developed by Eivaz Rakhmanov in 2026"
};
const ADMIN_UI = { ru: RU, en: EN };
function getAdminUi(lang) {
  return ADMIN_UI[lang];
}
const ACCENT = "#6B7280";
const API = "https://htr-group-llc-appliance-repair.replit.app".replace(/\/$/, "") || "https://htr-group-llc-appliance-repair.replit.app";
const TOKEN_KEY = "adminAuthToken";
const FID_KEY = "htr_fid_cred_id";
function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
}
function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_KEY, token);
}
function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
function getLocalCredId() {
  return localStorage.getItem(FID_KEY);
}
function saveLocalCredId(id2) {
  localStorage.setItem(FID_KEY, id2);
}
async function isTokenValid(token) {
  try {
    const res = await fetch(`${API}/api/auth/webauthn/credentials`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  } catch {
    return false;
  }
}
async function hasPlatformBiometrics() {
  try {
    return !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
  } catch {
    return false;
  }
}
function AuthGate({ children, title = "HTRGroup Admin" }) {
  const [screen, setScreen] = reactExports.useState("checking");
  const [pin, setPin] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [hasBiometrics, setHasBio] = reactExports.useState(false);
  const [deviceHasFid, setDevFid] = reactExports.useState(false);
  const [adminLang, setAdminLangState] = reactExports.useState(() => readAdminUiLang());
  const ui = getAdminUi(adminLang);
  const setAdminLang = reactExports.useCallback((lang) => {
    setAdminLangState(lang);
    writeAdminUiLang(lang);
  }, []);
  reactExports.useEffect(() => {
    async function init() {
      const token = getToken();
      if (token && await isTokenValid(token)) {
        setScreen("authenticated");
        return;
      }
      clearToken();
      const [bio] = await Promise.all([hasPlatformBiometrics()]);
      setHasBio(bio);
      const localCredId = getLocalCredId();
      setDevFid(bio && !!localCredId);
      setScreen("login");
    }
    void init();
  }, []);
  const handlePin = reactExports.useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin.trim() })
      });
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("application/json")) {
        setError("Сайт не подключён к API (VITE_API_BASE). Подождите деплой Cloudflare или проверьте Secrets.");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === "admin_pin_missing") {
          setError("На сервере не задан ADMIN_PIN. Replit → Secrets → ADMIN_PIN → Publish.");
        } else if (data.code === "session_secret_missing") {
          setError("На сервере не задан SESSION_SECRET. Replit → Secrets → Publish.");
        } else if (data.code === "pin_invalid" || res.status === 401) {
          setError(ui.pinWrong);
        } else if (res.status >= 500) {
          setError(data.error ?? "Ошибка сервера. Проверьте Replit Secrets.");
        } else {
          setError(data.error ?? "Ошибка входа. Проверьте подключение к API.");
        }
        return;
      }
      if (!data.token) {
        setError("Ошибка сервера: нет токена");
        return;
      }
      saveToken(data.token);
      const trimmed = pin.trim();
      sessionStorage.setItem("adminPin", trimmed);
      localStorage.setItem("adminPin", trimmed);
      if (hasBiometrics && !getLocalCredId()) {
        setScreen("register-fid");
      } else {
        setScreen("authenticated");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  }, [pin, hasBiometrics, ui.pinWrong]);
  const handleFaceID = reactExports.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const localCredId = getLocalCredId();
      const optRes = await fetch(`${API}/api/auth/webauthn/login-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localCredId ? { credentialId: localCredId } : {})
      });
      if (!optRes.ok) throw new Error("Failed to get options");
      const { challengeId, ...optionsJSON } = await optRes.json();
      const credential = await startAuthentication({ optionsJSON });
      const verRes = await fetch(`${API}/api/auth/webauthn/login-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: credential, challengeId })
      });
      if (!verRes.ok) throw new Error("Verification failed");
      const data = await verRes.json();
      saveToken(data.token);
      setScreen("authenticated");
    } catch {
      setError("Face ID не прошёл. Попробуйте пароль.");
    } finally {
      setLoading(false);
    }
  }, []);
  const handleRegisterFaceID = reactExports.useCallback(async () => {
    setLoading(true);
    setError("");
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const optRes = await fetch(`${API}/api/auth/webauthn/register-options`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!optRes.ok) throw new Error("Failed to get options");
      const { challengeId, ...optionsJSON } = await optRes.json();
      const credential = await startRegistration({ optionsJSON });
      const deviceLabel = /iPhone|iPad/.test(navigator.userAgent) ? "iPhone" : /Android/.test(navigator.userAgent) ? "Android" : "Desktop";
      const verRes = await fetch(`${API}/api/auth/webauthn/register-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ response: credential, label: deviceLabel, challengeId })
      });
      if (!verRes.ok) throw new Error("Registration failed");
      const data = await verRes.json();
      if (data.credentialId) saveLocalCredId(data.credentialId);
      setScreen("authenticated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("cancel") || msg.includes("abort") || msg.includes("NotAllowed")) ;
      else {
        setError("Не удалось зарегистрировать Face ID");
      }
      setScreen("authenticated");
    } finally {
      setLoading(false);
    }
  }, []);
  if (screen === "checking") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      position: "fixed",
      inset: 0,
      background: "#1F2937",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        width: 40,
        height: 40,
        border: "3px solid #6B7280",
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `@keyframes spin { to { transform: rotate(360deg); } }` })
    ] });
  }
  if (screen === "authenticated") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
  }
  if (screen === "register-fid") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      position: "fixed",
      inset: 0,
      background: "#1F2937",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999,
      padding: "20px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", top: 16, right: 16 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLangToggle, { lang: adminLang, onChange: setAdminLang, accent: ACCENT, compact: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        background: "#fff",
        borderRadius: "20px",
        padding: "36px 28px",
        width: "min(380px, 100%)",
        textAlign: "center",
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 52, marginBottom: 12 }, children: "🔒" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#1F2937" }, children: "Включить Face ID?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: "0 0 28px", fontSize: 14, color: "#64748b", lineHeight: 1.5 }, children: [
          "Вход одним касанием без пароля.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "Ваше лицо / отпечаток не покидает устройство."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => void handleRegisterFaceID(),
            disabled: loading,
            style: {
              width: "100%",
              padding: "13px",
              marginBottom: 10,
              background: loading ? "#CBD5E1" : "#6B7280",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 20 }, children: "👤" }),
              loading ? "Регистрация..." : "Включить Face ID / Fingerprint"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setScreen("authenticated"),
            disabled: loading,
            style: {
              width: "100%",
              padding: "12px",
              background: "transparent",
              color: "#64748b",
              border: "1.5px solid #e2e8f0",
              borderRadius: 10,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer"
            },
            children: "Пропустить"
          }
        ),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { marginTop: 10, color: "#ef4444", fontSize: 13 }, children: error })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    position: "fixed",
    inset: 0,
    background: "#1F2937",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "20px"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", top: 16, right: 16 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLangToggle, { lang: adminLang, onChange: setAdminLang, accent: ACCENT, compact: true }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      background: "#fff",
      borderRadius: "20px",
      padding: "36px 28px",
      width: "min(380px, 100%)",
      boxShadow: "0 24px 80px rgba(0,0,0,0.4)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", marginBottom: 24 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 44, marginBottom: 8 }, children: "🔐" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#1F2937" }, children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { margin: 0, fontSize: 13, color: "#64748b" }, children: [
          "HTRGroup · ",
          ui.protectedSection
        ] })
      ] }),
      deviceHasFid && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => void handleFaceID(),
          disabled: loading,
          style: {
            width: "100%",
            padding: "13px",
            marginBottom: 16,
            background: loading ? "#f1f5f9" : "#1F2937",
            color: loading ? "#94a3b8" : "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 20 }, children: "👤" }),
            loading ? "Проверка..." : "Войти через Face ID"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => void handlePin(e), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "password",
            placeholder: ui.pinPh,
            value: pin,
            autoFocus: !deviceHasFid,
            onChange: (e) => {
              setPin(e.target.value);
              setError("");
            },
            style: {
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 14px",
              borderRadius: 10,
              border: error ? "1.5px solid #ef4444" : "1.5px solid #cbd5e1",
              fontSize: 15,
              outline: "none"
            }
          }
        ) }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { margin: "0 0 8px", fontSize: 13, color: "#ef4444" }, children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: loading || !pin,
            style: {
              width: "100%",
              padding: "12px",
              background: loading || !pin ? "#CBD5E1" : "#6B7280",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading || !pin ? "not-allowed" : "pointer"
            },
            children: loading ? "…" : ui.login
          }
        )
      ] })
    ] })
  ] });
}
class ErrorBoundary extends reactExports.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: 40, fontFamily: "sans-serif", textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { color: "#c00" }, children: "Something went wrong" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { style: { fontSize: 12, color: "#555", whiteSpace: "pre-wrap" }, children: this.state.error.message }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => window.location.reload(), style: { marginTop: 16, padding: "8px 20px" }, children: "Reload page" })
      ] });
    }
    return this.props.children;
  }
}
const queryClient = new QueryClient();
const WA_ICON = /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 32 32", width: "26", height: "26", fill: "white", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M16 2C8.268 2 2 8.268 2 16c0 2.49.648 4.83 1.78 6.867L2 30l7.363-1.754A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 0 1-5.89-1.607l-.422-.25-4.37 1.042 1.072-4.26-.276-.438A11.554 11.554 0 0 1 4.4 16C4.4 9.594 9.594 4.4 16 4.4S27.6 9.594 27.6 16 22.406 27.6 16 27.6zm6.34-8.674c-.348-.174-2.058-1.016-2.378-1.131-.32-.116-.552-.174-.785.174-.232.348-.9 1.131-1.102 1.363-.203.232-.406.26-.754.086-.348-.174-1.47-.542-2.8-1.726-1.034-.924-1.733-2.065-1.936-2.413-.203-.348-.022-.536.152-.71.157-.156.348-.406.522-.61.174-.202.232-.348.348-.58.116-.232.058-.434-.029-.61-.087-.174-.785-1.893-1.075-2.59-.283-.681-.57-.588-.785-.6-.203-.01-.435-.012-.667-.012s-.61.087-.928.434c-.32.348-1.218 1.19-1.218 2.9s1.247 3.365 1.421 3.597c.174.232 2.453 3.745 5.942 5.25.831.358 1.48.572 1.986.732.834.265 1.594.228 2.194.138.669-.1 2.058-.841 2.348-1.654.29-.812.29-1.508.203-1.654-.087-.145-.32-.232-.667-.406z" }) });
function Router() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Switch, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/", component: Home }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/gallery", component: Gallery }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/blog", component: Blog }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/blog/:slug", component: BlogPost }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/admin", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthGate, { title: "HTRGroup Admin", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPage, {}) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/employee", component: EmployeePageWrapped }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/payment-success", component: PaymentSuccess }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/pay", component: PayPage }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/book-call/:token", component: VoiceBookCallPage }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/intake/:token", component: VoiceBookCallPage }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/form/:token", component: VoiceBookCallPage }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { component: NotFound })
  ] });
}
const WA_HREF = "https://wa.me/15559554342?text=Hello%21%20I%20need%20appliance%20repair%20help.";
const WA_HREF_ES = "https://wa.me/15559554342?text=%C2%A1Hola%21%20Necesito%20ayuda%20con%20reparaci%C3%B3n%20de%20electrodom%C3%A9sticos.";
function GlobalUI() {
  const [location2] = useLocation();
  const isAdmin = location2 === "/admin";
  const isGallery = location2 === "/gallery";
  const isEmployee = location2 === "/employee";
  const isPay = location2 === "/pay" || location2 === "/payment-success";
  const isBookCall = location2.startsWith("/book-call/") || location2.startsWith("/intake/") || location2.startsWith("/form/");
  const [bubbleVisible, setBubbleVisible] = reactExports.useState(false);
  const [hovered, setHovered] = reactExports.useState(false);
  const [isMobile, setIsMobile] = reactExports.useState(window.innerWidth < 768);
  const isEs = typeof window !== "undefined" && (document.documentElement.lang === "es" || localStorage.getItem("lang") === "es");
  const waHref = isEs ? WA_HREF_ES : WA_HREF;
  const bubbleLine1 = isEs ? "¡Escríbenos en WhatsApp!" : "Chat with us on WhatsApp!";
  const bubbleLine2 = isEs ? "Toca Enviar → reserva al instante" : "Tap Send → instant booking";
  reactExports.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  reactExports.useEffect(() => {
    if (isAdmin || isGallery || isBookCall || isEmployee || isPay) return;
    const t = setTimeout(() => setBubbleVisible(true), 3e3);
    const t22 = setTimeout(() => setBubbleVisible(false), 1e4);
    return () => {
      clearTimeout(t);
      clearTimeout(t22);
    };
  }, [isAdmin, isGallery, isBookCall, isEmployee, isPay]);
  if (isAdmin || isGallery || isBookCall || isEmployee || isPay) return null;
  const waBottom = isMobile ? "24px" : "160px";
  const waRight = "24px";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes wa-bubble-in {
          from { opacity:0; transform:translateY(8px) scale(0.92); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes wa-pulse {
          0%,100% { box-shadow: 0 4px 16px rgba(37,211,102,0.5); }
          50%      { box-shadow: 0 4px 24px rgba(37,211,102,0.9), 0 0 0 8px rgba(37,211,102,0.15); }
        }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "fixed", bottom: waBottom, right: waRight, zIndex: 60, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }, children: [
      (bubbleVisible || hovered) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: () => setBubbleVisible(false),
          style: {
            background: "white",
            borderRadius: "12px",
            padding: "10px 14px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            maxWidth: "220px",
            animation: "wa-bubble-in 0.25s ease",
            cursor: "pointer",
            position: "relative"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 700, fontSize: "13px", color: "#111", marginBottom: "3px" }, children: bubbleLine1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "12px", color: "#444" }, children: bubbleLine2 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              position: "absolute",
              bottom: "-7px",
              right: "20px",
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid white"
            } })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: waHref,
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": "Chat on WhatsApp",
          onMouseEnter: () => {
            if (!isMobile) {
              setHovered(true);
              setBubbleVisible(true);
            }
          },
          onMouseLeave: () => {
            if (!isMobile) setHovered(false);
          },
          onClick: () => setBubbleVisible(false),
          style: {
            width: "54px",
            height: "54px",
            borderRadius: "9999px",
            background: "#25D366",
            animation: bubbleVisible ? "wa-pulse 1.8s ease-in-out infinite" : "none",
            boxShadow: "0 4px 16px rgba(37,211,102,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            transition: "transform 0.2s"
          },
          children: WA_ICON
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PromoPopup, {})
  ] });
}