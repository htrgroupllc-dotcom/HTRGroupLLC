import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { useAdminLang } from "../../context/AdminLangContext";

const ACCENT = "#1B6FE8";

interface FiredEmployee {
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
  fired_at: string;
  created_at: string;
}

interface Warning {
  id: string;
  text: string;
  severity: "low" | "medium" | "high";
  created_at: string;
}

interface BookingRow {
  id: string;
  name: string;
  appliance: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  payment_method?: string;
  payment_amount?: number;
  assigned_employee_id?: string | null;
}

const SEV_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  low:    { bg: "#fefce8", text: "#854d0e", border: "#fde047" },
  medium: { bg: "#fff7ed", text: "#9a3412", border: "#fb923c" },
  high:   { bg: "#fef2f2", text: "#991b1b", border: "#f87171" },
};

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-stone-400 min-w-[100px] shrink-0">{label}</span>
      <span className="text-stone-700 font-medium break-all">{value}</span>
    </div>
  );
}

export default function ArchiveTab({
  apiBase, adminAuthH,
}: {
  apiBase: string;
  adminAuthH: (extra?: Record<string, string>) => Record<string, string>;
}) {
  const { t } = useAdminLang();

  const [employees, setEmployees] = useState<FiredEmployee[]>([]);
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState<string | null>(null);

  // Profile modal
  const [profile, setProfile]           = useState<FiredEmployee | null>(null);
  const [profileWarnings, setProfileWarnings] = useState<Warning[]>([]);
  const [profileJobs, setProfileJobs]   = useState<BookingRow[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${apiBase}/api/admin/employees?archived=true`, {
        headers: adminAuthH(), cache: "no-store",
      });
      if (!r.ok) { setErr(`Server error ${r.status}`); return; }
      const d = await r.json() as { employees?: FiredEmployee[] };
      setEmployees(d.employees ?? []);
    } catch { setErr("Connection error"); }
    finally { setLoading(false); }
  }, [apiBase, adminAuthH]);

  useEffect(() => { load(); }, [load]);

  const openProfile = async (emp: FiredEmployee) => {
    setProfile(emp);
    setProfileLoading(true);
    setProfileWarnings([]);
    setProfileJobs([]);
    try {
      const [wR, bR] = await Promise.all([
        fetch(`${apiBase}/api/admin/employees/${emp.id}/warnings`, { headers: adminAuthH(), cache: "no-store" }),
        fetch(`${apiBase}/api/admin/schedule?from=2020-01-01&to=2099-12-31`, { headers: adminAuthH(), cache: "no-store" }),
      ]);
      if (wR.ok) {
        const wd = await wR.json() as { warnings?: Warning[] };
        setProfileWarnings(wd.warnings ?? []);
      }
      if (bR.ok) {
        const bd = await bR.json() as { bookings?: BookingRow[] };
        const jobs = (bd.bookings ?? []).filter(b =>
          (b.status === "completed" || b.status === "cancelled") &&
          b.assigned_employee_id === emp.id,
        );
        setProfileJobs(jobs);
      }
    } catch {}
    finally { setProfileLoading(false); }
  };

  const sevLabel = (s: string) => {
    if (s === "high")   return t.warnHigh;
    if (s === "medium") return t.warnMedium;
    return t.warnLow;
  };

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString(t.dateLocale, { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch { return d; }
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      {/* ── Profile modal ── */}
      {profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="font-bold text-stone-800">{t.archReadOnly}</h3>
                <p className="text-sm text-red-500 font-semibold mt-0.5">{profile.name}</p>
              </div>
              <button onClick={() => setProfile(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
              {profileLoading ? (
                <p className="text-sm text-stone-400 text-center py-8">{t.loading}</p>
              ) : (
                <>
                  {/* Basic info */}
                  <div className="bg-stone-50 rounded-xl p-4 space-y-2">
                    <InfoRow label={t.empPhone} value={profile.phone} />
                    <InfoRow label={t.empAddress} value={profile.address} />
                    <InfoRow label={t.empBankName} value={profile.bank_name} />
                    <InfoRow label={t.empBankAccount} value={profile.bank_account} />
                    <InfoRow label={t.empBankRouting} value={profile.bank_routing} />
                    <InfoRow label={t.empCarMake} value={profile.car_make} />
                    <InfoRow label={t.empCarModel} value={profile.car_model} />
                    <InfoRow label={t.empPlate} value={profile.car_plate} />
                    <InfoRow label={t.archFiredAt} value={fmtDate(profile.fired_at)} />
                  </div>

                  {/* Warnings */}
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">{t.archWarnings}</p>
                    {profileWarnings.length === 0 ? (
                      <p className="text-sm text-stone-400">{t.warnNone}</p>
                    ) : (
                      <div className="space-y-2">
                        {profileWarnings.map(w => {
                          const col = SEV_COLORS[w.severity] ?? SEV_COLORS["low"];
                          return (
                            <div key={w.id} className="rounded-xl border p-3" style={{ background: col.bg, borderColor: col.border }}>
                              <div className="text-xs font-bold mb-0.5" style={{ color: col.text }}>{sevLabel(w.severity)}</div>
                              <p className="text-sm text-stone-700 break-words">{w.text}</p>
                              <p className="text-[10px] text-stone-400 mt-1">{fmtDate(w.created_at)}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Job history */}
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">
                      {t.archHistory} ({profileJobs.length})
                    </p>
                    {profileJobs.length === 0 ? (
                      <p className="text-sm text-stone-400">{t.archNoHistory}</p>
                    ) : (
                      <div className="space-y-2">
                        {profileJobs.map(b => (
                          <div key={b.id} className="bg-stone-50 rounded-xl border border-stone-100 px-4 py-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-stone-700">{b.name}</p>
                                <p className="text-xs text-stone-500">{b.preferred_date} · {b.preferred_time}</p>
                                {b.appliance && <p className="text-xs text-stone-400">{b.appliance}</p>}
                              </div>
                              <div className="text-right">
                                {b.status === "completed" ? (
                                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">{t.statusCompleted}</span>
                                ) : (
                                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-500">{t.statusCancelled}</span>
                                )}
                                {b.payment_amount != null && (
                                  <p className="text-xs font-semibold text-stone-600 mt-0.5">${b.payment_amount}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ── */}
      <h2 className="text-lg font-bold text-stone-800">{t.archTitle}</h2>

      {err && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{err}</div>
      )}

      {loading ? (
        <p className="text-sm text-stone-400 py-8 text-center">{t.loading}</p>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-stone-400 text-sm">{t.archNoFired}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="text-left px-4 py-3 font-semibold text-stone-500">{t.archName}</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-500">{t.empPhone}</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-500">{t.archFiredAt}</th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-500">{t.empActions}</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => (
                  <tr key={emp.id} className={i % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                    <td className="px-4 py-3 font-semibold text-stone-500">{emp.name}</td>
                    <td className="px-4 py-3 text-stone-500">{emp.phone}</td>
                    <td className="px-4 py-3 text-stone-400 text-[11px]">{fmtDate(emp.fired_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openProfile(emp)}
                        className="flex items-center gap-1 ml-auto font-semibold transition"
                        style={{ color: ACCENT }}>
                        {t.archViewProfile} <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-stone-100">
            {employees.map(emp => (
              <button
                key={emp.id}
                onClick={() => openProfile(emp)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition">
                <div className="text-left">
                  <p className="text-sm font-semibold text-stone-500">{emp.name}</p>
                  <p className="text-xs text-stone-400">{fmtDate(emp.fired_at)}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
