import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { useAdminLang } from "../../context/AdminLangContext";

const ACCENT = "#1B6FE8";

interface BlacklistEntry {
  id: string;
  client_name: string;
  client_phone: string;
  client_address: string;
  reason: string;
  notes: string;
  added_at: string;
  updated_at: string;
}

const EMPTY: Omit<BlacklistEntry, "id" | "added_at" | "updated_at"> = {
  client_name: "", client_phone: "", client_address: "", reason: "", notes: "",
};

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 mb-1">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
        style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
      />
    </div>
  );
}

export default function BlacklistTab({
  apiBase, adminAuthH,
}: {
  apiBase: string;
  adminAuthH: (extra?: Record<string, string>) => Record<string, string>;
}) {
  const { t } = useAdminLang();

  const [entries, setEntries]     = useState<BlacklistEntry[]>([]);
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const searchTimer               = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form modal
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [formErr, setFormErr]     = useState<string | null>(null);

  // Delete confirmation
  const [confirmDel, setConfirmDel] = useState<BlacklistEntry | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const headers = adminAuthH({ "Content-Type": "application/json" });

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    setErr(null);
    try {
      const qs = q ? `?q=${encodeURIComponent(q)}` : "";
      const r = await fetch(`${apiBase}/api/admin/blacklist${qs}`, {
        headers: adminAuthH(), cache: "no-store",
      });
      if (!r.ok) { setErr(`Server error ${r.status}`); return; }
      const d = await r.json() as { blacklist?: BlacklistEntry[] };
      setEntries(d.blacklist ?? []);
    } catch { setErr("Connection error"); }
    finally { setLoading(false); }
  }, [apiBase, adminAuthH]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (v: string) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(v), 400);
  };

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY);
    setFormErr(null);
    setShowForm(true);
  };

  const openEdit = (e: BlacklistEntry) => {
    setEditId(e.id);
    setForm({
      client_name: e.client_name, client_phone: e.client_phone,
      client_address: e.client_address, reason: e.reason, notes: e.notes,
    });
    setFormErr(null);
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    setFormErr(null);
    try {
      const url    = editId != null ? `${apiBase}/api/admin/blacklist/${editId}` : `${apiBase}/api/admin/blacklist`;
      const method = editId != null ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const d = await r.json() as { error?: string };
      if (!r.ok) { setFormErr(d.error ?? `${t.errServer} (${r.status})`); return; }
      setShowForm(false);
      load(search);
    } catch { setFormErr(t.errNetwork); }
    finally { setSaving(false); }
  };

  const deleteEntry = async () => {
    if (!confirmDel || deleting) return;
    setDeleting(true);
    try {
      await fetch(`${apiBase}/api/admin/blacklist/${confirmDel.id}`, {
        method: "DELETE", headers: adminAuthH(),
      });
      setConfirmDel(null);
      load(search);
    } catch {}
    finally { setDeleting(false); }
  };

  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString(t.dateLocale, { day: "2-digit", month: "2-digit", year: "numeric" }); }
    catch { return d; }
  };

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* ── Form modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b sticky top-0 bg-white z-10">
              <h3 className="font-bold text-stone-800">
                {editId != null ? t.blEdit : t.blAdd}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <Field label={t.blName} value={form.client_name}    onChange={v => setForm(f => ({ ...f, client_name: v }))} />
              <Field label={t.blPhone} value={form.client_phone}  onChange={v => setForm(f => ({ ...f, client_phone: v }))} type="tel" />
              <Field label={t.blAddress} value={form.client_address} onChange={v => setForm(f => ({ ...f, client_address: v }))} />
              <Field label={t.blReason} value={form.reason}       onChange={v => setForm(f => ({ ...f, reason: v }))} />
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">{t.blNotes}</label>
                <textarea
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3} placeholder="..."
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                  style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
                />
              </div>
            </div>
            {formErr && (
              <div className="mx-5 mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">❌ {formErr}</div>
            )}
            <div className="flex gap-2 px-5 pb-5">
              <button onClick={() => setShowForm(false)} disabled={saving}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-50">
                {t.blCancel}
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50"
                style={{ background: ACCENT }}>
                {saving ? "..." : t.blSave}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-stone-800">{t.blDeleteConfirm}</h3>
            </div>
            <p className="text-sm font-semibold text-stone-700 mb-1">{confirmDel.client_name || t.blEmpty}</p>
            <p className="text-xs text-stone-500 mb-4">{confirmDel.reason || t.blEmpty}</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDel(null)} disabled={deleting}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-50">
                {t.blCancel}
              </button>
              <button onClick={deleteEntry} disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50">
                {deleting ? "..." : t.blDeleteYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-stone-800">{t.blTitle}</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          style={{ background: "#dc2626" }}>
          <Plus className="w-4 h-4" />{t.blAdd}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        <input
          type="search" value={search} onChange={e => handleSearch(e.target.value)}
          placeholder={t.blSearch}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 placeholder-stone-400"
          style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
        />
      </div>

      {err && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{err}</div>
      )}

      {loading ? (
        <p className="text-sm text-stone-400 py-8 text-center">{t.loading}</p>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-stone-400 text-sm">{search ? t.noData : t.blNoResults}</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="text-left px-4 py-3 font-semibold text-stone-500">{t.blName}</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-500">{t.blPhone}</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-500">{t.blAddress}</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-500">{t.blReason}</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-500">{t.blDate}</th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-500">{t.empActions}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={e.id} className={i % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                    <td className="px-4 py-3 font-semibold text-stone-800">{e.client_name || "—"}</td>
                    <td className="px-4 py-3 text-stone-600">{e.client_phone || "—"}</td>
                    <td className="px-4 py-3 text-stone-500 max-w-[180px] truncate">{e.client_address || "—"}</td>
                    <td className="px-4 py-3 text-red-700 font-medium max-w-[200px]">
                      <span className="truncate block">{e.reason || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-stone-400 whitespace-nowrap">{fmtDate(e.added_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => openEdit(e)}
                          className="flex items-center gap-1 text-violet-600 hover:text-violet-800 font-semibold transition">
                          <Pencil className="w-3.5 h-3.5" />{t.blEdit}
                        </button>
                        <button onClick={() => setConfirmDel(e)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold transition">
                          <Trash2 className="w-3.5 h-3.5" />{t.blDelete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {entries.map(e => (
              <div key={e.id} className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-stone-800 text-sm">{e.client_name || "—"}</p>
                    {e.client_phone && <p className="text-sm text-stone-600">{e.client_phone}</p>}
                    {e.client_address && <p className="text-xs text-stone-400">{e.client_address}</p>}
                  </div>
                  <span className="text-[10px] text-stone-400 whitespace-nowrap">{fmtDate(e.added_at)}</span>
                </div>
                {e.reason && (
                  <p className="text-xs font-medium text-red-700 bg-red-50 rounded-lg px-2 py-1 mb-2">{e.reason}</p>
                )}
                {e.notes && <p className="text-xs text-stone-500 mb-3">{e.notes}</p>}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(e)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-100">
                    <Pencil className="w-3.5 h-3.5" />{t.blEdit}
                  </button>
                  <button onClick={() => setConfirmDel(e)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
                    <Trash2 className="w-3.5 h-3.5" />{t.blDelete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
