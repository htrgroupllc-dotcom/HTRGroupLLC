import React, { useState, useEffect, useCallback } from "react";
import { DollarSign, Plus, Trash2, CheckCircle2, ChevronDown, ChevronUp, Calculator, RefreshCw, X } from "lucide-react";
import { useAdminLang } from "../../context/AdminLangContext";

const ACCENT = "#1B6FE8";

interface Employee {
  id: string;
  name: string;
  phone: string;
  is_active: boolean;
}

interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_phone: string;
  period_label: string;
  period_start: string;
  period_end: string;
  jobs_count: number;
  gross_amount: number;
  deductions: number;
  net_amount: number;
  status: string;
  notes?: string;
  created_at: string;
}

interface Props {
  apiBase: string;
  adminAuthH: () => Record<string, string>;
}

export default function PayrollTab({ apiBase, adminAuthH }: Props) {
  const { t } = useAdminLang();

  const [records, setRecords]       = useState<PayrollRecord[]>([]);
  const [employees, setEmployees]   = useState<Employee[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [filterEmp, setFilterEmp]   = useState("");
  const [showCalc, setShowCalc]     = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    employee_id: "",
    period_label: "",
    period_start: "",
    period_end: "",
    commission_pct: "",
    flat_rate: "",
    deductions: "",
    notes: "",
  });
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcErr, setCalcErr]         = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = filterEmp
        ? `${apiBase}/api/admin/payroll?employee_id=${filterEmp}`
        : `${apiBase}/api/admin/payroll`;
      const r = await fetch(url, { headers: adminAuthH() });
      const d = await r.json() as { ok?: boolean; records?: PayrollRecord[] };
      setRecords(d.records ?? []);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }, [apiBase, adminAuthH, filterEmp]);

  const loadEmployees = useCallback(async () => {
    try {
      const r = await fetch(`${apiBase}/api/admin/employees`, { headers: adminAuthH() });
      const d = await r.json() as { employees?: Employee[] };
      setEmployees(d.employees?.filter(e => e.is_active) ?? []);
    } catch { /* silent */ }
  }, [apiBase, adminAuthH]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const handleCalculate = async () => {
    if (!form.employee_id || !form.period_start || !form.period_end) {
      setCalcErr("Employee, start and end date are required");
      return;
    }
    setCalcLoading(true);
    setCalcErr("");
    try {
      const r = await fetch(`${apiBase}/api/admin/payroll/calculate`, {
        method: "POST",
        headers: { ...adminAuthH(), "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id:    form.employee_id,
          period_label:   form.period_label || undefined,
          period_start:   form.period_start,
          period_end:     form.period_end,
          commission_pct: parseFloat(form.commission_pct) || 0,
          flat_rate:      parseFloat(form.flat_rate)      || 0,
          deductions:     parseFloat(form.deductions)     || 0,
          notes:          form.notes || undefined,
        }),
      });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (!r.ok || !d.ok) { setCalcErr(d.error ?? "Error"); return; }
      setShowCalc(false);
      setForm({ employee_id: "", period_label: "", period_start: "", period_end: "", commission_pct: "", flat_rate: "", deductions: "", notes: "" });
      await load();
    } catch {
      setCalcErr("Connection error");
    } finally {
      setCalcLoading(false);
    }
  };

  const markPaid = async (id: string) => {
    await fetch(`${apiBase}/api/admin/payroll/${id}/status`, {
      method: "PATCH",
      headers: { ...adminAuthH(), "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });
    await load();
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("Delete this payroll record?")) return;
    await fetch(`${apiBase}/api/admin/payroll/${id}`, {
      method: "DELETE",
      headers: adminAuthH(),
    });
    await load();
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(t.dateLocale, { day: "2-digit", month: "2-digit", year: "numeric" });

  const statusLabel = (s: string) => {
    if (s === "paid")      return t.payrollStatusPaid;
    if (s === "cancelled") return t.payrollStatusCancelled;
    return t.payrollStatusPending;
  };
  const statusCls = (s: string) =>
    s === "paid"      ? "bg-green-100 text-green-700" :
    s === "cancelled" ? "bg-red-100 text-red-700"   :
                        "bg-amber-100 text-amber-700";

  // Summary stats
  const totalGross  = records.reduce((sum, r) => sum + Number(r.gross_amount), 0);
  const totalNet    = records.reduce((sum, r) => sum + Number(r.net_amount), 0);
  const paidCount   = records.filter(r => r.status === "paid").length;

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h2 className="font-bold text-stone-800 flex items-center gap-2">
          <DollarSign className="w-5 h-5" style={{ color: ACCENT }} />
          {t.tabPayroll}
          {records.length > 0 && <span className="text-xs text-stone-400 font-normal">({records.length})</span>}
        </h2>
        <div className="flex items-center gap-2">
          {/* Employee filter */}
          <select
            value={filterEmp}
            onChange={e => setFilterEmp(e.target.value)}
            className="border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-stone-700 focus:outline-none focus:ring-1"
            style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
          >
            <option value="">{t.payrollAll}</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <button onClick={load} disabled={loading}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCalc(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition"
            style={{ background: ACCENT }}
          >
            <Calculator className="w-3.5 h-3.5" />
            {t.payrollCalculate}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t.payrollGross, value: `$${totalGross.toFixed(2)}`, cls: "text-stone-700" },
            { label: t.payrollNet,   value: `$${totalNet.toFixed(2)}`,   cls: "text-green-600 font-bold" },
            { label: t.payrollStatusPaid, value: `${paidCount} / ${records.length}`, cls: "text-blue-600" },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-stone-100 shadow-sm p-3 text-center">
              <div className={`text-lg font-bold ${c.cls}`}>{c.value}</div>
              <div className="text-[10px] text-stone-400 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Calculate form */}
      {showCalc && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-stone-800 flex items-center gap-1.5">
              <Calculator className="w-4 h-4" style={{ color: ACCENT }} />
              {t.payrollCalculate}
            </h3>
            <button onClick={() => setShowCalc(false)} className="text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-500 mb-1">{t.payrollEmployee} *</label>
              <select
                value={form.employee_id}
                onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
              >
                <option value="">— {t.payrollEmployee} —</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.phone})</option>
                ))}
              </select>
            </div>

            {[
              { key: "period_label", label: t.payrollPeriodLabel,    type: "text",   placeholder: "April 2026", span: "sm:col-span-2" },
              { key: "period_start", label: `${t.payrollPeriodStart} *`, type: "date", span: "" },
              { key: "period_end",   label: `${t.payrollPeriodEnd} *`,   type: "date", span: "" },
              { key: "flat_rate",    label: t.payrollFlatRate,        type: "number", placeholder: "0", span: "" },
              { key: "commission_pct", label: t.payrollCommissionPct, type: "number", placeholder: "0", span: "" },
              { key: "deductions",   label: t.payrollDeductionsInput, type: "number", placeholder: "0", span: "" },
            ].map(f => (
              <div key={f.key} className={f.span}>
                <label className="block text-xs font-semibold text-stone-500 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={(f as { placeholder?: string }).placeholder}
                  step="0.01" min="0"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-500 mb-1">{t.payrollNotes}</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={2}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
              />
            </div>
          </div>

          {calcErr && <p className="text-xs text-red-500 mt-2">{calcErr}</p>}

          <button
            onClick={handleCalculate}
            disabled={calcLoading}
            className="w-full mt-3 py-2.5 rounded-xl text-white font-bold text-sm transition disabled:opacity-50"
            style={{ background: ACCENT }}
          >
            {calcLoading ? "..." : t.payrollSubmit}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      {/* Records list */}
      {loading && records.length === 0 ? (
        <div className="flex justify-center py-10">
          <RefreshCw className="w-6 h-6 animate-spin text-stone-300" />
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-2 text-stone-400">
          <DollarSign className="w-10 h-10 opacity-20" />
          <p className="text-sm">{t.payrollNoRecords}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(rec => (
            <div key={rec.id} className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedId(id => id === rec.id ? null : rec.id)}
                className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-stone-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-stone-800 text-sm">{rec.employee_name}</span>
                    <span className="text-xs text-stone-400">·</span>
                    <span className="text-xs text-stone-500">{rec.period_label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCls(rec.status)}`}>
                      {statusLabel(rec.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-0.5 text-xs text-stone-400">
                    <span>{fmtDate(rec.period_start)} – {fmtDate(rec.period_end)}</span>
                    <span className="font-semibold text-green-600">${Number(rec.net_amount).toFixed(2)}</span>
                    <span>{rec.jobs_count} jobs</span>
                  </div>
                </div>
                {expandedId === rec.id
                  ? <ChevronUp className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0" />}
              </button>

              {expandedId === rec.id && (
                <div className="px-4 pb-4 border-t border-stone-100 pt-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {[
                      { label: t.payrollJobs,       value: String(rec.jobs_count) },
                      { label: t.payrollGross,       value: `$${Number(rec.gross_amount).toFixed(2)}` },
                      { label: t.payrollDeductions,  value: `$${Number(rec.deductions).toFixed(2)}` },
                      { label: t.payrollNet,         value: `$${Number(rec.net_amount).toFixed(2)}`, bold: true },
                    ].map(item => (
                      <div key={item.label} className="bg-stone-50 rounded-lg p-2 text-center">
                        <div className={`font-bold text-sm ${(item as { bold?: boolean }).bold ? "text-green-600" : "text-stone-700"}`}>
                          {item.value}
                        </div>
                        <div className="text-[10px] text-stone-400">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {rec.notes && (
                    <p className="text-xs text-stone-500 mb-3 bg-stone-50 rounded-lg px-3 py-2">{rec.notes}</p>
                  )}

                  <div className="flex gap-2">
                    {rec.status !== "paid" && (
                      <button
                        onClick={() => markPaid(rec.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-white text-xs font-bold transition"
                        style={{ background: "#16a34a" }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t.payrollMarkPaid}
                      </button>
                    )}
                    <button
                      onClick={() => deleteRecord(rec.id)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
