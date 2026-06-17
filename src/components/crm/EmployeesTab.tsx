import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, Pencil, AlertTriangle, UserX, X, ChevronDown, ChevronUp, Briefcase, CheckCircle2, Plus, Minus } from "lucide-react";
import { useAdminLang } from "../../context/AdminLangContext";

const ACCENT = "#1B6FE8";

const EMP_LANGS: { code: string; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "es", label: "ES" },
  { code: "tr", label: "TR" },
  { code: "az", label: "AZ" },
  { code: "uk", label: "UK" },
];

interface Employee {
  id: string;
  name: string;
  phone: string;
  address: string;
  bank_account: string;
  bank_routing: string;
  bank_name: string;
  car_plate: string;
  car_make: string;
  car_model: string;
  ui_language: string;
  pin_plain: string | null;
  is_active: boolean;
  created_at: string;
  closed_count: number;
  total_revenue: number;
}

interface Warning {
  id: string;
  employee_id: string;
  text: string;
  severity: "low" | "medium" | "high";
  created_at: string;
}

interface CabinetBooking {
  id: string;
  name: string;
  phone: string;
  address: string;
  appliance: string;
  brand_model: string | null;
  preferred_date: string;
  preferred_time: string;
  status: string;
  message: string | null;
  payment_amount: string | null;
  payment_method: string | null;
  work_description: string | null;
}

const EMPTY_EMP = {
  name: "", phone: "", address: "",
  bank_account: "", bank_routing: "", bank_name: "",
  car_plate: "", car_make: "", car_model: "",
  ui_language: "en", pin: "",
};

type SevColor = { bg: string; text: string; border: string };
const SEV_COLORS: Record<string, SevColor> = {
  low:    { bg: "#fefce8", text: "#854d0e", border: "#fde047" },
  medium: { bg: "#fff7ed", text: "#9a3412", border: "#fb923c" },
  high:   { bg: "#fef2f2", text: "#991b1b", border: "#f87171" },
};

function Field({ label, value, onChange, type = "text", placeholder, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 mb-1">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
        style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
      />
    </div>
  );
}

export default function EmployeesTab({
  apiBase, adminAuthH,
}: {
  apiBase: string;
  adminAuthH: (extra?: Record<string, string>) => Record<string, string>;
}) {
  const { t } = useAdminLang();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState<string | null>(null);

  // Add / Edit form
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState(EMPTY_EMP);
  const [saving, setSaving]       = useState(false);
  const [formErr, setFormErr]     = useState<string | null>(null);

  // Warnings modal
  const [warningsEmpId, setWarningsEmpId]   = useState<string | null>(null);
  const [warningsEmpName, setWarningsEmpName] = useState("");
  const [warnings, setWarnings]             = useState<Warning[]>([]);
  const [warnLoading, setWarnLoading]       = useState(false);
  const [warnText, setWarnText]             = useState("");
  const [warnSev, setWarnSev]               = useState<"low"|"medium"|"high">("low");
  const [warnSaving, setWarnSaving]         = useState(false);
  const [confirmDelWarn, setConfirmDelWarn] = useState<Warning | null>(null);

  // Fire confirmation
  const [confirmFire, setConfirmFire] = useState<Employee | null>(null);
  const [firing, setFiring]           = useState(false);

  // Cabinet (view employee jobs + close-as-employee)
  const [cabinetEmpId,       setCabinetEmpId]       = useState<string | null>(null);
  const [cabinetEmpName,     setCabinetEmpName]      = useState("");
  const [cabinetBookings,    setCabinetBookings]     = useState<CabinetBooking[]>([]);
  const [cabinetLoading,     setCabinetLoading]      = useState(false);
  const [cabinetCloseId,     setCabinetCloseId]      = useState<string | null>(null);
  const [cabinetCloseAmount, setCabinetCloseAmount]  = useState("");
  const [cabinetCloseWork,   setCabinetCloseWork]    = useState("");
  const [cabinetCloseParts,  setCabinetCloseParts]   = useState<string[]>([]);
  const [cabinetClosePayment,setCabinetClosePayment] = useState<"cash"|"online">("cash");
  const [cabinetClosePartsCost, setCabinetClosePartsCost] = useState("");
  const [cabinetClosing,     setCabinetClosing]      = useState(false);
  const [cabinetCloseErr,    setCabinetCloseErr]     = useState("");

  const headers = adminAuthH({ "Content-Type": "application/json" });

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${apiBase}/api/admin/employees`, {
        headers: adminAuthH(), cache: "no-store",
      });
      if (!r.ok) { setErr(`Server error ${r.status}`); return; }
      const d = await r.json() as { employees?: Employee[] };
      setEmployees(d.employees ?? []);
    } catch { setErr("Connection error"); }
    finally { setLoading(false); }
  }, [apiBase, adminAuthH]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_EMP);
    setFormErr(null);
    setShowForm(true);
  };

  const openEdit = (emp: Employee) => {
    setEditId(emp.id);
    setForm({
      name: emp.name, phone: emp.phone, address: emp.address,
      bank_account: emp.bank_account, bank_routing: emp.bank_routing, bank_name: emp.bank_name,
      car_plate: emp.car_plate, car_make: emp.car_make, car_model: emp.car_model,
      ui_language: emp.ui_language, pin: "",
    });
    setFormErr(null);
    setShowForm(true);
  };

  const saveEmp = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setFormErr(t.errNamePhoneRequired);
      return;
    }
    if (!editId && form.pin.length < 8) {
      setFormErr(t.errPinTooShort);
      return;
    }
    setSaving(true);
    setFormErr(null);
    try {
      const body: Record<string, string> = {
        name: form.name, phone: form.phone, address: form.address,
        bank_account: form.bank_account, bank_routing: form.bank_routing, bank_name: form.bank_name,
        car_plate: form.car_plate, car_make: form.car_make, car_model: form.car_model,
        ui_language: form.ui_language,
      };
      if (!editId || form.pin) body["pin"] = form.pin;

      const url    = editId ? `${apiBase}/api/admin/employees/${editId}` : `${apiBase}/api/admin/employees`;
      const method = editId ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const d = await r.json() as { error?: string };
      if (!r.ok) { setFormErr(d.error ?? `${t.errServer} (${r.status})`); return; }
      setShowForm(false);
      load();
    } catch { setFormErr(t.errNetwork); }
    finally { setSaving(false); }
  };

  const quickSetLang = async (empId: string, lang: string) => {
    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, ui_language: lang } : e));
    try {
      await fetch(`${apiBase}/api/admin/employees/${empId}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ ui_language: lang }),
      });
    } catch {
      load();
    }
  };

  const fireEmployee = async () => {
    if (!confirmFire || firing) return;
    setFiring(true);
    try {
      await fetch(`${apiBase}/api/admin/employees/${confirmFire.id}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ fire: true }),
      });
      setConfirmFire(null);
      load();
    } catch {}
    finally { setFiring(false); }
  };

  const openWarnings = async (emp: Employee) => {
    setWarningsEmpId(emp.id);
    setWarningsEmpName(emp.name);
    setWarnText("");
    setWarnSev("low");
    setWarnLoading(true);
    try {
      const r = await fetch(`${apiBase}/api/admin/employees/${emp.id}/warnings`, {
        headers: adminAuthH(), cache: "no-store",
      });
      const d = await r.json() as { warnings?: Warning[] };
      setWarnings(d.warnings ?? []);
    } catch {}
    finally { setWarnLoading(false); }
  };

  const addWarning = async () => {
    if (!warnText.trim() || !warningsEmpId || warnSaving) return;
    setWarnSaving(true);
    try {
      const r = await fetch(`${apiBase}/api/admin/employees/${warningsEmpId}/warnings`, {
        method: "POST", headers,
        body: JSON.stringify({ text: warnText, severity: warnSev }),
      });
      if (r.ok) {
        setWarnText("");
        setWarnSev("low");
        const d2 = await fetch(`${apiBase}/api/admin/employees/${warningsEmpId}/warnings`, {
          headers: adminAuthH(), cache: "no-store",
        });
        const d = await d2.json() as { warnings?: Warning[] };
        setWarnings(d.warnings ?? []);
      }
    } catch {}
    finally { setWarnSaving(false); }
  };

  const deleteWarning = async (w: Warning) => {
    if (!warningsEmpId) return;
    await fetch(`${apiBase}/api/admin/employees/${warningsEmpId}/warnings/${w.id}`, {
      method: "DELETE", headers: adminAuthH(),
    });
    setConfirmDelWarn(null);
    setWarnings(prev => prev.filter(x => x.id !== w.id));
  };

  const sevLabel = (s: string) => {
    if (s === "high")   return t.warnHigh;
    if (s === "medium") return t.warnMedium;
    return t.warnLow;
  };

  const openCabinet = async (emp: Employee) => {
    setCabinetEmpId(emp.id);
    setCabinetEmpName(emp.name);
    setCabinetBookings([]);
    setCabinetLoading(true);
    setCabinetCloseId(null);
    setCabinetCloseErr("");
    try {
      const r = await fetch(`${apiBase}/api/admin/employee-cabinet/${emp.id}/bookings`, {
        headers: adminAuthH(), cache: "no-store",
      });
      const d = await r.json() as { bookings?: CabinetBooking[] };
      setCabinetBookings(d.bookings ?? []);
    } catch {}
    finally { setCabinetLoading(false); }
  };

  const openCabinetClose = (bookingId: string) => {
    setCabinetCloseId(bookingId);
    setCabinetCloseAmount("");
    setCabinetCloseWork("");
    setCabinetCloseParts([]);
    setCabinetClosePayment("cash");
    setCabinetClosePartsCost("");
    setCabinetCloseErr("");
  };

  const cabinetSubmitClose = async () => {
    if (!cabinetEmpId || !cabinetCloseId) return;
    const amount = parseFloat(cabinetCloseAmount);
    if (!cabinetCloseAmount || !Number.isFinite(amount)) {
      setCabinetCloseErr("Укажите сумму"); return;
    }
    if (!cabinetCloseWork.trim()) {
      setCabinetCloseErr("Укажите выполненную работу"); return;
    }
    setCabinetClosing(true);
    setCabinetCloseErr("");
    try {
      const partsCostVal = parseFloat(cabinetClosePartsCost);
      const r = await fetch(`${apiBase}/api/admin/bookings/${cabinetCloseId}/close-as-employee`, {
        method: "POST", headers,
        body: JSON.stringify({
          payment_method: cabinetClosePayment === "cash" ? "Cash" : "Online (Stripe)",
          payment_amount: amount,
          work_description: cabinetCloseWork.trim(),
          parts_replaced: cabinetCloseParts.map(p => p.trim()).filter(Boolean),
          parts_cost: Number.isFinite(partsCostVal) ? partsCostVal : null,
        }),
      });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (!r.ok || !d.ok) { setCabinetCloseErr(d.error ?? "Ошибка"); return; }
      setCabinetCloseId(null);
      // Refresh booking list
      const r2 = await fetch(`${apiBase}/api/admin/employee-cabinet/${cabinetEmpId}/bookings`, {
        headers: adminAuthH(), cache: "no-store",
      });
      const d2 = await r2.json() as { bookings?: CabinetBooking[] };
      setCabinetBookings(d2.bookings ?? []);
      load();
    } catch { setCabinetCloseErr("Ошибка соединения"); }
    finally { setCabinetClosing(false); }
  };

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">

      {/* ── Cabinet modal ── */}
      {cabinetEmpId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white w-full max-w-2xl rounded-t-3xl max-h-[92dvh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
              <div>
                <h3 className="font-bold text-stone-800">{t.cabinetTitle}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{cabinetEmpName}</p>
              </div>
              <button onClick={() => { setCabinetEmpId(null); setCabinetCloseId(null); }}
                className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Close-as-employee inline form */}
            {cabinetCloseId && (
              <div className="border-b border-blue-100 bg-blue-50 px-5 py-4 flex-shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-blue-800">{t.cabinetCloseTitle}</p>
                  <button onClick={() => setCabinetCloseId(null)} className="text-stone-400 hover:text-stone-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 mb-1">Сумма $</label>
                    <input type="number" step="0.01" value={cabinetCloseAmount}
                      onChange={e => setCabinetCloseAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 mb-1">Способ оплаты</label>
                    <div className="flex gap-2">
                      {(["cash","online"] as const).map(m => (
                        <button key={m} type="button" onClick={() => setCabinetClosePayment(m)}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold border transition"
                          style={{
                            background: cabinetClosePayment === m ? ACCENT : "#fff",
                            color: cabinetClosePayment === m ? "#fff" : "#64748b",
                            borderColor: cabinetClosePayment === m ? ACCENT : "#e2e8f0",
                          }}>
                          {m === "cash" ? "Нал." : "Онлайн"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Work */}
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">Выполненная работа</label>
                  <textarea value={cabinetCloseWork} onChange={e => setCabinetCloseWork(e.target.value)}
                    rows={2} placeholder="Описание..."
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
                  />
                </div>
                {/* Parts cost */}
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">Стоимость запчастей $</label>
                  <input type="number" step="0.01" value={cabinetClosePartsCost}
                    onChange={e => setCabinetClosePartsCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
                  />
                </div>
                {/* Parts list */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-500">Замененные детали</label>
                    <button type="button" onClick={() => setCabinetCloseParts(p => [...p, ""])}
                      className="text-xs font-bold flex items-center gap-1" style={{ color: ACCENT }}>
                      <Plus className="w-3 h-3" /> Добавить
                    </button>
                  </div>
                  {cabinetCloseParts.map((part, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={part} onChange={e => setCabinetCloseParts(prev => prev.map((x, idx) => idx === i ? e.target.value : x))}
                        placeholder="Деталь..."
                        className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                      />
                      <button type="button" onClick={() => setCabinetCloseParts(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-red-400 hover:text-red-600">
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {cabinetCloseErr && <p className="text-xs text-red-600 text-center">{cabinetCloseErr}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setCabinetCloseId(null)} disabled={cabinetClosing}
                    className="flex-1 py-2 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-50 transition">
                    Отмена
                  </button>
                  <button onClick={() => void cabinetSubmitClose()} disabled={cabinetClosing}
                    className="flex-1 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition"
                    style={{ background: "#16a34a" }}>
                    {cabinetClosing ? "..." : t.cabinetCloseJob}
                  </button>
                </div>
              </div>
            )}

            {/* Bookings list */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
              {cabinetLoading ? (
                <p className="text-sm text-stone-400 text-center py-8">{t.loading}</p>
              ) : cabinetBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-10 h-10 text-stone-200 mx-auto mb-2" />
                  <p className="text-sm text-stone-400">{t.cabinetNoBookings}</p>
                </div>
              ) : cabinetBookings.map(b => (
                <div key={b.id} className="bg-stone-50 rounded-xl border border-stone-100 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-semibold text-stone-800 text-sm">{b.name}</div>
                      <div className="text-xs text-stone-500">{b.preferred_date} · {b.preferred_time}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {b.status === "completed" ? "Закрыто" : "Активно"}
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 space-y-0.5">
                    <div>{b.address}</div>
                    <div>{b.appliance}{b.brand_model ? ` · ${b.brand_model}` : ""}</div>
                    {b.status === "completed" && b.payment_amount && (
                      <div className="font-semibold text-green-700">${Number(b.payment_amount).toFixed(2)} · {b.payment_method}</div>
                    )}
                    {b.status === "completed" && b.work_description && (
                      <div className="text-stone-500">{b.work_description}</div>
                    )}
                  </div>
                  {b.status !== "completed" && cabinetCloseId !== b.id && (
                    <button onClick={() => openCabinetClose(b.id)}
                      className="mt-3 w-full py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
                      style={{ background: "#16a34a" }}>
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                      {t.cabinetCloseJob}
                    </button>
                  )}
                  {cabinetCloseId === b.id && (
                    <div className="mt-2 text-xs text-blue-600 font-semibold text-center">▲ Форма закрытия выше</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Warnings modal ── */}
      {warningsEmpId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h3 className="font-bold text-stone-800">{t.warnTitle}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{warningsEmpName}</p>
              </div>
              <button onClick={() => setWarningsEmpId(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
              {warnLoading ? (
                <p className="text-sm text-stone-400 text-center py-4">{t.loading}</p>
              ) : warnings.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-4">{t.warnNone}</p>
              ) : warnings.map(w => {
                const col = SEV_COLORS[w.severity] ?? SEV_COLORS["low"];
                return (
                  <div key={w.id} className="rounded-xl border p-3" style={{ background: col.bg, borderColor: col.border }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold mb-0.5" style={{ color: col.text }}>
                          {sevLabel(w.severity)}
                        </div>
                        <p className="text-sm text-stone-700 break-words">{w.text}</p>
                        <p className="text-[10px] text-stone-400 mt-1">
                          {new Date(w.created_at).toLocaleDateString(t.dateLocale, { day: "2-digit", month: "2-digit", year: "2-digit" })}
                        </p>
                      </div>
                      <button
                        onClick={() => setConfirmDelWarn(w)}
                        className="text-stone-400 hover:text-red-500 transition flex-none"
                        title={t.warnDelete}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Add warning form */}
            <div className="border-t px-5 py-4 space-y-3">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">{t.warnAdd}</p>
              <textarea
                value={warnText} onChange={e => setWarnText(e.target.value)}
                placeholder={t.warnText} rows={2}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
              />
              <div className="flex gap-2">
                <select
                  value={warnSev}
                  onChange={e => setWarnSev(e.target.value as "low"|"medium"|"high")}
                  className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="low">{t.warnLow}</option>
                  <option value="medium">{t.warnMedium}</option>
                  <option value="high">{t.warnHigh}</option>
                </select>
                <button
                  onClick={addWarning} disabled={warnSaving || !warnText.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50"
                  style={{ background: ACCENT }}>
                  {warnSaving ? "..." : t.empAdd}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete warning ── */}
      {confirmDelWarn && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-stone-800 mb-2">{t.warnDeleteConfirm}</h3>
            <p className="text-sm text-stone-600 mb-4 break-words">{confirmDelWarn.text}</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelWarn(null)}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition">
                {t.empCancel}
              </button>
              <button onClick={() => deleteWarning(confirmDelWarn)}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">
                {t.warnDeleteYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fire confirmation modal ── */}
      {confirmFire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <UserX className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-stone-800">{t.empFireConfirm}</h3>
            </div>
            <p className="text-sm font-semibold text-stone-700 mb-1">{confirmFire.name}</p>
            <p className="text-xs text-stone-500 mb-4">{t.empFireMsg}</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmFire(null)} disabled={firing}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-50">
                {t.empCancel}
              </button>
              <button onClick={fireEmployee} disabled={firing}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50">
                {firing ? "..." : t.empFireYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit form ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b sticky top-0 bg-white z-10">
              <h3 className="font-bold text-stone-800">
                {editId ? t.empEdit : t.empAddBtn}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              {/* Basic info */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={`${t.empName} *`} value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
                <Field label={`${t.empPhone} *`} value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} type="tel" />
              </div>
              <Field label={t.empAddress} value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
              {/* PIN */}
              <Field
                label={editId ? t.empPinNew : `${t.empPin} *`}
                value={form.pin} onChange={v => setForm(f => ({ ...f, pin: v }))}
                type="password" placeholder={editId ? "••••" : ""}
              />
              {/* Bank */}
              <div className="pt-1 border-t border-stone-100">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">{t.sectionBank}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label={t.empBankName} value={form.bank_name} onChange={v => setForm(f => ({ ...f, bank_name: v }))} />
                  <Field label={t.empBankAccount} value={form.bank_account} onChange={v => setForm(f => ({ ...f, bank_account: v }))} />
                  <Field label={t.empBankRouting} value={form.bank_routing} onChange={v => setForm(f => ({ ...f, bank_routing: v }))} />
                </div>
              </div>
              {/* Vehicle */}
              <div className="pt-1 border-t border-stone-100">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">{t.sectionVehicle}</p>
                <div className="grid grid-cols-3 gap-3">
                  <Field label={t.empPlate} value={form.car_plate} onChange={v => setForm(f => ({ ...f, car_plate: v }))} />
                  <Field label={t.empCarMake} value={form.car_make} onChange={v => setForm(f => ({ ...f, car_make: v }))} />
                  <Field label={t.empCarModel} value={form.car_model} onChange={v => setForm(f => ({ ...f, car_model: v }))} />
                </div>
              </div>
              {/* UI Language */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">{t.empLang}</label>
                <select
                  value={form.ui_language}
                  onChange={e => setForm(f => ({ ...f, ui_language: e.target.value }))}
                  className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 w-full"
                  style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="es">Español</option>
                  <option value="tr">Türkçe</option>
                  <option value="az">Azərbaycanca</option>
                  <option value="uk">Українська</option>
                </select>
              </div>
            </div>
            {formErr && (
              <div className="mx-5 mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                ❌ {formErr}
              </div>
            )}
            <div className="flex gap-2 px-5 pb-5">
              <button onClick={() => setShowForm(false)} disabled={saving}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-50">
                {t.empCancel}
              </button>
              <button onClick={saveEmp} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50"
                style={{ background: ACCENT }}>
                {saving ? t.loading : t.empSave}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-stone-800">{t.empTitle}</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          style={{ background: ACCENT }}>
          <UserPlus className="w-4 h-4" />
          {t.empAddBtn}
        </button>
      </div>

      {err && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{err}</div>
      )}

      {loading ? (
        <p className="text-sm text-stone-400 py-8 text-center">{t.loading}</p>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-stone-400 text-sm">{t.empNoActive}</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="text-left px-4 py-3 font-semibold text-stone-500">{t.empName}</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-500">{t.empPhone}</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-500">{t.empCar}</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-500">{t.empPlate}</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-500">PIN</th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-500">Закрыто</th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-500">Выручка</th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-500">{t.empActions}</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => (
                  <tr key={emp.id} className={i % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                    <td className="px-4 py-3 font-semibold text-stone-800">{emp.name}</td>
                    <td className="px-4 py-3">
                      <a href={`tel:${emp.phone}`} className="font-medium" style={{ color: ACCENT }}>{emp.phone}</a>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {[emp.car_make, emp.car_model].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-stone-600">{emp.car_plate || "—"}</td>
                    <td className="px-4 py-3 font-mono text-sm tracking-wider text-stone-700">
                      {emp.pin_plain || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-stone-700">
                      {emp.closed_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: "#1B6FE8" }}>
                      ${Number(emp.total_revenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <select
                          value={emp.ui_language || "en"}
                          onChange={e => quickSetLang(emp.id, e.target.value)}
                          title={t.empLang}
                          className="border border-stone-200 rounded-lg px-2 py-1 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2"
                          style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
                          {EMP_LANGS.map(l => (
                            <option key={l.code} value={l.code}>{l.label}</option>
                          ))}
                        </select>
                        <button onClick={() => void openCabinet(emp)}
                          className="flex items-center gap-1 font-semibold transition" style={{ color: "#16a34a" }}>
                          <Briefcase className="w-3.5 h-3.5" />{t.cabinetBtn}
                        </button>
                        <button onClick={() => openEdit(emp)}
                          className="flex items-center gap-1 text-violet-600 hover:text-violet-800 font-semibold transition">
                          <Pencil className="w-3.5 h-3.5" />{t.empEdit}
                        </button>
                        <button onClick={() => openWarnings(emp)}
                          className="flex items-center gap-1 text-amber-600 hover:text-amber-800 font-semibold transition">
                          <AlertTriangle className="w-3.5 h-3.5" />{t.empWarnings}
                        </button>
                        <button onClick={() => setConfirmFire(emp)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold transition">
                          <UserX className="w-3.5 h-3.5" />{t.empFire}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ── */}
          <div className="md:hidden space-y-3">
            {employees.map(emp => (
              <EmployeeCard
                key={emp.id}
                emp={emp}
                t={t}
                onEdit={() => openEdit(emp)}
                onWarnings={() => openWarnings(emp)}
                onFire={() => setConfirmFire(emp)}
                onLangChange={(lang) => quickSetLang(emp.id, lang)}
                onCabinet={() => void openCabinet(emp)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmployeeCard({ emp, t, onEdit, onWarnings, onFire, onLangChange, onCabinet }: {
  emp: Employee;
  t: ReturnType<typeof useAdminLang>["t"];
  onEdit: () => void;
  onWarnings: () => void;
  onFire: () => void;
  onLangChange: (lang: string) => void;
  onCabinet: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <div className="font-bold text-stone-800">{emp.name}</div>
          <div className="text-sm" style={{ color: "#1B6FE8" }}>{emp.phone}</div>
          {(emp.car_make || emp.car_model) && (
            <div className="text-xs text-stone-500 mt-0.5">
              {[emp.car_make, emp.car_model].filter(Boolean).join(" ")}
              {emp.car_plate && ` · ${emp.car_plate}`}
            </div>
          )}
          <div className="flex gap-3 mt-1">
            <span className="text-xs text-stone-500">Закрыто: <span className="font-semibold text-stone-700">{emp.closed_count ?? 0}</span></span>
            <span className="text-xs text-stone-500">Выручка: <span className="font-semibold" style={{ color: "#1B6FE8" }}>${Number(emp.total_revenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></span>
          </div>
        </div>
        <button onClick={() => setExpanded(v => !v)} className="text-stone-400 p-1">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-stone-100 px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-stone-500">PIN</span>
            <span className="font-mono text-sm tracking-wider text-stone-700">
              {emp.pin_plain || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-stone-500">{t.empLang}</span>
            <select
              value={emp.ui_language || "en"}
              onChange={e => onLangChange(e.target.value)}
              className="border border-stone-200 rounded-lg px-2 py-1 text-sm font-semibold text-stone-700 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
              {EMP_LANGS.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
          <button onClick={onCabinet}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold border transition"
            style={{ background: "#f0fdf4", color: "#16a34a", borderColor: "#bbf7d0" }}>
            <Briefcase className="w-4 h-4" />{t.cabinetBtn}
          </button>
          <button onClick={onEdit}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-50 text-violet-700 text-sm font-semibold border border-violet-100 hover:bg-violet-100 transition">
            <Pencil className="w-4 h-4" />{t.empEdit}
          </button>
          <button onClick={onWarnings}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm font-semibold border border-amber-100 hover:bg-amber-100 transition">
            <AlertTriangle className="w-4 h-4" />{t.empWarnings}
          </button>
          <button onClick={onFire}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold border border-red-100 hover:bg-red-100 transition">
            <UserX className="w-4 h-4" />{t.empFire}
          </button>
        </div>
      )}
    </div>
  );
}
