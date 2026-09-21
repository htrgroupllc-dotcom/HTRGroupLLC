import React from "react";

export type AdminUiLang = "ru" | "en" | "az";

const STORAGE_KEY = "admin_ui_lang";
const CRM_KEY = "adminLang";

export function readAdminUiLang(): AdminUiLang {
  try {
    const v = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(CRM_KEY);
    if (v === "en" || v === "az" || v === "ru") return v;
    return "ru";
  } catch {
    return "ru";
  }
}

export function writeAdminUiLang(lang: AdminUiLang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
    localStorage.setItem(CRM_KEY, lang);
  } catch {
    /* ignore */
  }
}

interface Props {
  lang: AdminUiLang;
  onChange: (lang: AdminUiLang) => void;
  accent: string;
  compact?: boolean;
}

const LANGS: { code: AdminUiLang; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
  { code: "az", label: "AZ" },
];

export default function AdminLangToggle({ lang, onChange, accent, compact = false }: Props) {
  const wrapCls = compact
    ? "inline-flex items-center gap-0.5 rounded-md border border-stone-200 bg-white p-0.5 max-w-full"
    : "inline-flex items-center gap-0.5 rounded-lg border border-stone-200 bg-white p-0.5 max-w-full";
  const btnCls = compact
    ? "px-2 py-1 rounded text-xs font-bold transition"
    : "px-2.5 py-1 rounded-md text-xs font-bold transition";

  return (
    <div className={wrapCls} role="group" aria-label="Admin language">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => onChange(l.code)}
          className={btnCls}
          style={{
            color: lang === l.code ? "#fff" : "#a8a29e",
            backgroundColor: lang === l.code ? accent : "transparent",
          }}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
