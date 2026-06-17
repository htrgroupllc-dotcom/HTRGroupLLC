import React, { useState, useEffect, useCallback } from "react";
import { DollarSign, RefreshCw, Save } from "lucide-react";

type VisitFeeSite = "appliance" | "dental";

const SITE_META: Record<VisitFeeSite, { label: string; website: string; accent: string }> = {
  appliance: {
    label: "Appliance",
    website: "htrgrouptx.com",
    accent: "#1B6FE8",
  },
  dental: {
    label: "Dental",
    website: "dentequmentfix.com",
    accent: "#6B7280",
  },
};

interface Props {
  apiBase: string;
  adminAuthH: (extra?: Record<string, string>) => Record<string, string>;
  site: VisitFeeSite;
}

export default function VisitFeeSettings({ apiBase, adminAuthH, site }: Props) {
  const meta = SITE_META[site];
  const settingsKey = site === "dental" ? "visit_fee_dental" : "visit_fee_appliance";

  const [visitFee, setVisitFee] = useState("50");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      const pub = await fetch(`${apiBase}/api/settings/visit-fee?site=${site}`, { cache: "no-store" });
      const pd = await pub.json() as { fee?: string; site?: string };
      if (pd.fee != null) {
        setVisitFee(pd.fee);
        return;
      }
      const r = await fetch(`${apiBase}/api/admin/settings`, { headers: adminAuthH() });
      const d = await r.json() as { ok?: boolean; settings?: Record<string, string> };
      const fee = d.settings?.[settingsKey];
      if (d.ok && fee) setVisitFee(fee);
    } catch {
      setMsg({ ok: false, text: "Ошибка загрузки настроек" });
    } finally {
      setLoading(false);
    }
  }, [apiBase, adminAuthH, settingsKey, site]);

  useEffect(() => { load(); }, [load]);

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
      const r = await fetch(`${apiBase}/api/settings/visit-fee`, {
        method: "POST",
        headers: { ...adminAuthH(), "Content-Type": "application/json" },
        body: JSON.stringify({ fee: String(Math.round(num)), site }),
      });
      const d = await r.json() as { ok?: boolean; fee?: string; error?: string };
      if (!r.ok || !d.ok) {
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

  return (
    <div className="bg-white rounded-xl border-2 shadow-sm p-5 space-y-4" style={{ borderColor: meta.accent }}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-stone-800 flex items-center gap-2">
          <DollarSign className="w-5 h-5" style={{ color: meta.accent }} />
          {meta.label} — popup при входе на сайт
        </h2>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition"
          aria-label="Обновить"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <p className="text-xs text-stone-500 leading-relaxed">
        Цена диагностики во всплывающем окне на {meta.website} (EN/ES). 0 = «Free» / «Gratis».
        Не влияет на другой сайт.
      </p>

      <div>
        <label className="block text-xs font-semibold text-stone-500 mb-1">Цена диагностики ($)</label>
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">$</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={visitFee}
            onChange={e => setVisitFee(e.target.value)}
            placeholder="50"
            className="w-full border border-stone-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": meta.accent } as React.CSSProperties}
          />
        </div>
      </div>

      {msg && (
        <p className={`text-xs font-medium ${msg.ok ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50"
        style={{ backgroundColor: meta.accent }}
      >
        <Save className="w-4 h-4" />
        {saving ? "Сохранение…" : `Сохранить (${meta.label})`}
      </button>
    </div>
  );
}
