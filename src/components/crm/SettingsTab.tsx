import React, { useState, useEffect, useCallback } from "react";
import { Settings, Save, RefreshCw, Building2, DollarSign, ToggleLeft, ToggleRight, MessageSquare } from "lucide-react";

const ACCENT = "#1B6FE8";

interface Props {
  apiBase: string;
  adminAuthH: () => Record<string, string>;
}

interface SettingsData {
  company_outgoing_bank_name:    string;
  company_outgoing_bank_account: string;
  company_outgoing_bank_routing: string;
  company_incoming_bank_name:    string;
  company_incoming_bank_account: string;
  company_incoming_bank_routing: string;
  auto_payroll_enabled:          string;
  payroll_split_employee:        string;
  payroll_split_company:         string;
  owner_whatsapp_number:         string;
}

const DEFAULTS: SettingsData = {
  company_outgoing_bank_name:    "",
  company_outgoing_bank_account: "",
  company_outgoing_bank_routing: "",
  company_incoming_bank_name:    "",
  company_incoming_bank_account: "",
  company_incoming_bank_routing: "",
  auto_payroll_enabled:          "false",
  payroll_split_employee:        "70",
  payroll_split_company:         "30",
  owner_whatsapp_number:         "+13466968751",
};

export default function SettingsTab({ apiBase, adminAuthH }: Props) {
  const [data, setData]         = useState<SettingsData>(DEFAULTS);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      const r = await fetch(`${apiBase}/api/admin/settings`, { headers: adminAuthH() });
      const d = await r.json() as { ok?: boolean; settings?: Partial<SettingsData> };
      if (d.ok && d.settings) {
        setData({ ...DEFAULTS, ...d.settings });
      }
    } catch {
      setMsg({ ok: false, text: "Connection error" });
    } finally {
      setLoading(false);
    }
  }, [apiBase, adminAuthH]);

  useEffect(() => { load(); }, [load]);

  const set = (key: keyof SettingsData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData(p => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const r = await fetch(`${apiBase}/api/admin/settings`, {
        method:  "POST",
        headers: { ...adminAuthH(), "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (!r.ok || !d.ok) {
        setMsg({ ok: false, text: d.error ?? "Error saving" });
      } else {
        setMsg({ ok: true, text: "Settings saved!" });
      }
    } catch {
      setMsg({ ok: false, text: "Connection error" });
    } finally {
      setSaving(false);
    }
  };

  const autoEnabled = data.auto_payroll_enabled === "true";
  const empPct = Number(data.payroll_split_employee) || 70;
  const cmpPct = 100 - empPct;

  const inputCls = "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";

  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-stone-800 flex items-center gap-2">
          <Settings className="w-5 h-5" style={{ color: ACCENT }} />
          Settings
        </h2>
        <button onClick={load} disabled={loading} className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 transition">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
{/* Outgoing bank */}
      <section className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 space-y-3">
        <h3 className="font-semibold text-stone-700 flex items-center gap-2 text-sm">
          <Building2 className="w-4 h-4" style={{ color: ACCENT }} />
          Outgoing Bank (Payroll Payments)
        </h3>
        {([
          { key: "company_outgoing_bank_name",    label: "Bank Name",       placeholder: "e.g. Chase" },
          { key: "company_outgoing_bank_account", label: "Account Number",  placeholder: "••••1234" },
          { key: "company_outgoing_bank_routing", label: "Routing Number",  placeholder: "021000021" },
        ] as { key: keyof SettingsData; label: string; placeholder: string }[]).map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-stone-500 mb-1">{f.label}</label>
            <input type="text" value={data[f.key]} onChange={set(f.key)} placeholder={f.placeholder} className={inputCls} />
          </div>
        ))}
      </section>

      {/* Incoming bank */}
      <section className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 space-y-3">
        <h3 className="font-semibold text-stone-700 flex items-center gap-2 text-sm">
          <Building2 className="w-4 h-4 text-green-600" />
          Incoming Bank (Revenue Deposits)
        </h3>
        {([
          { key: "company_incoming_bank_name",    label: "Bank Name",       placeholder: "e.g. Bank of America" },
          { key: "company_incoming_bank_account", label: "Account Number",  placeholder: "••••5678" },
          { key: "company_incoming_bank_routing", label: "Routing Number",  placeholder: "026009593" },
        ] as { key: keyof SettingsData; label: string; placeholder: string }[]).map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-stone-500 mb-1">{f.label}</label>
            <input type="text" value={data[f.key]} onChange={set(f.key)} placeholder={f.placeholder} className={inputCls} />
          </div>
        ))}
      </section>

      {/* Payroll split */}
      <section className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 space-y-3">
        <h3 className="font-semibold text-stone-700 flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4" style={{ color: ACCENT }} />
          Revenue Split
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-stone-500 mb-1">Employee %</label>
            <input
              type="number" min="0" max="100" step="1"
              value={data.payroll_split_employee}
              onChange={e => {
                const v = Math.min(100, Math.max(0, Number(e.target.value)));
                setData(p => ({
                  ...p,
                  payroll_split_employee: String(v),
                  payroll_split_company:  String(100 - v),
                }));
              }}
              className={inputCls}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-stone-500 mb-1">Company %</label>
            <input
              type="number" min="0" max="100" step="1"
              value={cmpPct}
              onChange={e => {
                const v = Math.min(100, Math.max(0, Number(e.target.value)));
                setData(p => ({
                  ...p,
                  payroll_split_company:  String(v),
                  payroll_split_employee: String(100 - v),
                }));
              }}
              className={inputCls}
            />
          </div>
        </div>
        {/* Visual bar */}
        <div className="h-3 rounded-full overflow-hidden flex">
          <div className="h-full transition-all duration-300" style={{ width: `${empPct}%`, background: ACCENT }} />
          <div className="h-full flex-1 bg-stone-200" />
        </div>
        <div className="flex text-[10px] text-stone-400 justify-between">
          <span>Employee: {empPct}%</span>
          <span>Company: {cmpPct}%</span>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 space-y-3">
        <h3 className="font-semibold text-stone-700 flex items-center gap-2 text-sm">
          <MessageSquare className="w-4 h-4" style={{ color: ACCENT }} />
          WhatsApp Notifications
        </h3>
        <div>
          <label className="block text-xs font-semibold text-stone-500 mb-1">
            Owner WhatsApp Number
          </label>
          <input
            type="tel"
            value={data.owner_whatsapp_number}
            onChange={set("owner_whatsapp_number")}
            placeholder="+13466968751"
            className={inputCls}
          />
          <p className="text-[10px] text-stone-400 mt-1">
            Enter in +1XXXXXXXXXX format. All booking notifications will be sent here. Takes effect immediately without restart.
          </p>
        </div>
      </section>

      {/* Auto payroll */}
      <section className="bg-white rounded-xl border border-stone-100 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-stone-700 text-sm">Automatic Weekly Payroll</h3>
            <p className="text-xs text-stone-400 mt-0.5">Calculate payroll every Monday 8:00 AM CT and send email report</p>
          </div>
          <button
            onClick={() => setData(p => ({ ...p, auto_payroll_enabled: p.auto_payroll_enabled === "true" ? "false" : "true" }))}
            className="flex items-center gap-1.5 transition"
            style={{ color: autoEnabled ? "#16a34a" : "#9ca3af" }}
          >
            {autoEnabled
              ? <ToggleRight className="w-8 h-8" />
              : <ToggleLeft  className="w-8 h-8" />}
            <span className="text-xs font-semibold">{autoEnabled ? "ON" : "OFF"}</span>
          </button>
        </div>
      </section>

      {/* Feedback */}
      {msg && (
        <p className={`text-sm font-semibold text-center py-2 rounded-lg ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </p>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition"
        style={{ background: ACCENT }}
      >
        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
