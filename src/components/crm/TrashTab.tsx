import React, { useState, useEffect, useCallback } from "react";
import { Trash2, RotateCcw, X, AlertTriangle } from "lucide-react";
import { useAdminLang } from "../../context/AdminLangContext";

const ACCENT = "#1B6FE8";

interface TrashedBooking {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  appliance?: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  created_at?: string;
  deleted_at: string;
  payment_method?: string;
  payment_amount?: number;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "#fef9c3", text: "#854d0e" },
  approved:  { bg: "#dcfce7", text: "#166534" },
  completed: { bg: "#dbeafe", text: "#1e40af" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

export default function TrashTab({
  apiBase,
  adminAuthH,
  onCountChange,
}: {
  apiBase: string;
  adminAuthH: (extra?: Record<string, string>) => Record<string, string>;
  onCountChange?: (count: number) => void;
}) {
  const { t } = useAdminLang();

  const [bookings, setBookings] = useState<TrashedBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Restore state
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Permanent delete confirm modal
  const [confirmPerm, setConfirmPerm] = useState<TrashedBooking | null>(null);
  const [permDeleting, setPermDeleting] = useState(false);
  const [permErr, setPermErr] = useState<string | null>(null);

  // Bulk permanent delete confirm modal
  const [confirmBulkPerm, setConfirmBulkPerm] = useState<string[] | null>(null);

  // Empty trash confirm modal
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [emptying, setEmptying] = useState(false);
  const [emptyErr, setEmptyErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${apiBase}/api/admin/trash`, {
        headers: adminAuthH(),
        cache: "no-store",
      });
      if (!r.ok) { setErr(`Server error ${r.status}`); return; }
      const d = await r.json() as { bookings?: TrashedBooking[] };
      const list = d.bookings ?? [];
      setBookings(list);
      onCountChange?.(list.length);
    } catch {
      setErr("Connection error");
    } finally {
      setLoading(false);
    }
  }, [apiBase, adminAuthH, onCountChange]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setSelectedIds(prev => {
      const valid = new Set(bookings.map(b => b.id));
      const next = new Set([...prev].filter(id => valid.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [bookings]);

  const allSelected = bookings.length > 0 && selectedIds.size === bookings.length;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(bookings.map(b => b.id)));
  };

  const restoreBooking = async (id: string) => {
    setRestoringId(id);
    try {
      const r = await fetch(`${apiBase}/api/admin/restore-from-trash`, {
        method: "POST",
        headers: adminAuthH({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id }),
      });
      if (r.ok) {
        setBookings(prev => {
          const next = prev.filter(b => b.id !== id);
          onCountChange?.(next.length);
          return next;
        });
        setSelectedIds(prev => {
          if (!prev.has(id)) return prev;
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        const d = await r.json().catch(() => ({})) as { error?: string };
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
      const r = await fetch(`${apiBase}/api/admin/permanent-delete`, {
        method: "POST",
        headers: adminAuthH({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: confirmPerm.id }),
      });
      if (r.ok) {
        setBookings(prev => {
          const next = prev.filter(b => b.id !== confirmPerm.id);
          onCountChange?.(next.length);
          return next;
        });
        setSelectedIds(prev => {
          if (!prev.has(confirmPerm.id)) return prev;
          const next = new Set(prev);
          next.delete(confirmPerm.id);
          return next;
        });
        setConfirmPerm(null);
      } else {
        const d = await r.json().catch(() => ({})) as { error?: string };
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
      const r = await fetch(`${apiBase}/api/admin/permanent-delete-bulk`, {
        method: "POST",
        headers: adminAuthH({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ids: confirmBulkPerm }),
      });
      if (r.ok) {
        const deleted = new Set(confirmBulkPerm);
        setBookings(prev => {
          const next = prev.filter(b => !deleted.has(b.id));
          onCountChange?.(next.length);
          return next;
        });
        setSelectedIds(new Set());
        setConfirmBulkPerm(null);
      } else {
        const d = await r.json().catch(() => ({})) as { error?: string };
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
      const r = await fetch(`${apiBase}/api/admin/empty-trash`, {
        method: "POST",
        headers: adminAuthH({ "Content-Type": "application/json" }),
      });
      if (r.ok) {
        setBookings([]);
        setSelectedIds(new Set());
        onCountChange?.(0);
        setConfirmEmpty(false);
      } else {
        const d = await r.json().catch(() => ({})) as { error?: string };
        setEmptyErr(d.error ?? "Error");
      }
    } catch {
      setEmptyErr("Connection error");
    } finally {
      setEmptying(false);
    }
  };

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleString(t.dateLocale, {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return d; }
  };

  const statusLabel = (s: string) => {
    if (s === "pending")   return t.statusPending;
    if (s === "approved")  return t.statusApproved;
    if (s === "completed") return t.statusCompleted;
    if (s === "cancelled") return t.statusCancelled;
    return s;
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">

      {/* ── Permanent delete confirm modal ── */}
      {confirmPerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-stone-800">{t.trashPermanentConfirmTitle}</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1 font-semibold">{confirmPerm.name}</p>
            <p className="text-xs text-red-500 mb-4">{t.trashPermanentConfirmMsg}</p>
            {permErr && <p className="text-xs text-red-600 mb-2">{permErr}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setConfirmPerm(null); setPermErr(null); }}
                disabled={permDeleting}
                className="flex-1 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={permanentDelete}
                disabled={permDeleting}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                {permDeleting ? t.trashDeleting : t.trashPermanentConfirmYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk permanent delete confirm modal ── */}
      {confirmBulkPerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-stone-800">{t.trashBulkDeleteTitle}</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1 font-semibold">{t.trashSelected(confirmBulkPerm.length)}</p>
            <p className="text-xs text-red-500 mb-4">{t.trashBulkDeleteMsg(confirmBulkPerm.length)}</p>
            {permErr && <p className="text-xs text-red-600 mb-2">{permErr}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setConfirmBulkPerm(null); setPermErr(null); }}
                disabled={permDeleting}
                className="flex-1 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={permanentDeleteBulk}
                disabled={permDeleting}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                {permDeleting ? t.trashDeleting : t.trashBulkDeleteYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty trash confirm modal ── */}
      {confirmEmpty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-stone-800">{t.trashEmptyConfirmTitle}</h3>
            </div>
            <p className="text-sm text-red-500 font-semibold mb-4">{t.trashEmptyConfirmMsg}</p>
            {emptyErr && <p className="text-xs text-red-600 mb-2">{emptyErr}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setConfirmEmpty(false); setEmptyErr(null); }}
                disabled={emptying}
                className="flex-1 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={emptyTrash}
                disabled={emptying}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                {emptying ? t.trashEmptying : t.trashEmptyConfirmYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-stone-400" />
            {t.trashTitle}
            {bookings.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-5 rounded-full bg-red-100 text-red-600 text-[11px] font-bold px-1.5">
                {bookings.length}
              </span>
            )}
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">{t.trashNote}</p>
        </div>
        {bookings.length > 0 && (
          <button
            onClick={() => setConfirmEmpty(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.trashEmptyBtn}
          </button>
        )}
      </div>

      {bookings.length > 0 && (
        <div className="flex items-center justify-between gap-2 flex-wrap bg-white rounded-xl border border-stone-100 px-3 py-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-stone-300"
            />
            {t.trashSelectAll}
            {selectedIds.size > 0 && (
              <span className="text-stone-400 font-normal">· {t.trashSelected(selectedIds.size)}</span>
            )}
          </label>
          {selectedIds.size > 0 && (
            <button
              onClick={() => { setConfirmBulkPerm([...selectedIds]); setPermErr(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t.trashBulkDeleteBtn(selectedIds.size)}
            </button>
          )}
        </div>
      )}

      {err && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{err}</div>
      )}

      {loading ? (
        <p className="text-sm text-stone-400 py-8 text-center">{t.loading}</p>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
          <Trash2 className="w-10 h-10 text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">{t.trashEmpty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => {
            const col = STATUS_COLORS[b.status] ?? { bg: "#f3f4f6", text: "#374151" };
            const checked = selectedIds.has(b.id);
            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl shadow-sm border p-4 ${checked ? "border-red-300 ring-1 ring-red-100" : "border-stone-100"}`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <label className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(b.id)}
                      className="w-4 h-4 mt-1 rounded border-stone-300 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-stone-700 text-sm">{b.name}</p>
                        <span
                          className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: col.bg, color: col.text }}
                        >
                          {statusLabel(b.status)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{b.phone}</p>
                      {b.appliance && <p className="text-xs text-stone-400">{b.appliance}</p>}
                      <p className="text-xs text-stone-400">{b.preferred_date} · {b.preferred_time}</p>
                      {b.address && <p className="text-xs text-stone-400 truncate">{b.address}</p>}
                      <p className="text-[10px] text-stone-300 mt-1">
                        {t.trashDeletedAt} {fmtDate(b.deleted_at)}
                      </p>
                    </div>
                  </label>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => restoreBooking(b.id)}
                      disabled={restoringId === b.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition disabled:opacity-50"
                      style={{ borderColor: ACCENT, color: ACCENT }}
                      title={t.trashRestoreBtn}
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${restoringId === b.id ? "animate-spin" : ""}`} />
                      {restoringId === b.id ? t.trashRestoring : t.trashRestoreBtn}
                    </button>
                    <button
                      onClick={() => { setConfirmPerm(b); setPermErr(null); }}
                      disabled={restoringId === b.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                      title={t.trashPermanentBtn}
                    >
                      <X className="w-3.5 h-3.5" />
                      {t.trashPermanentBtn}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
