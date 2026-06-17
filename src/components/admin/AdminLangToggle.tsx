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
  const wrapCls = compact
    ? "inline-flex items-center gap-0.5 rounded-md border border-stone-200 bg-white p-0.5"
    : "inline-flex items-center gap-0.5 rounded-lg border border-stone-200 bg-white p-0.5";
  const btnCls = compact
    ? "px-2 py-1 rounded text-xs font-bold transition"
    : "px-2.5 py-1 rounded-md text-xs font-bold transition";

  return (
    <div className={wrapCls} role="group" aria-label="Admin language">
      <button
        type="button"
        onClick={() => onChange("ru")}
        className={btnCls}
        style={{
          color: lang === "ru" ? "#fff" : "#a8a29e",
          backgroundColor: lang === "ru" ? accent : "transparent",
        }}
      >
        RU
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        className={btnCls}
        style={{
          color: lang === "en" ? "#fff" : "#a8a29e",
          backgroundColor: lang === "en" ? accent : "transparent",
        }}
      >
        EN
      </button>
    </div>
  );
}
