import React from "react";

export type AdminUiLang = "ru" | "en";

const STORAGE_KEY = "admin_ui_lang";

export function readAdminUiLang(): AdminUiLang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "en" ? "en" : "ru";
  } catch {
    return "ru";
  }
}

export function writeAdminUiLang(lang: AdminUiLang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
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

export default function AdminLangToggle({ lang, onChange, accent, compact = false }: Props) {
  const cls = compact
    ? "px-2 py-1 rounded-md text-xs font-bold border border-stone-200 hover:bg-stone-50 transition flex items-center gap-0.5"
    : "px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold hover:bg-stone-50 transition flex items-center gap-0.5";

  return (
    <button
      type="button"
      onClick={() => onChange(lang === "ru" ? "en" : "ru")}
      className={cls}
      aria-label="Admin language"
    >
      <span style={{ color: lang === "ru" ? accent : "#a8a29e" }}>RU</span>
      <span className="text-stone-300 font-normal mx-0.5">|</span>
      <span style={{ color: lang === "en" ? accent : "#a8a29e" }}>EN</span>
    </button>
  );
}
