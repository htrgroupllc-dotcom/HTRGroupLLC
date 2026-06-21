import React, { useEffect, useRef, useState } from "react";
import { Palette } from "lucide-react";
import { PAGE_BG_PRESETS } from "@/lib/pageBgPreference";

interface Props {
  value: string;
  onChange: (color: string) => void;
  lang?: string;
  compact?: boolean;
}

export default function PageBgPicker({ value, onChange, lang = "en", compact = false }: Props) {
  const ru = lang.startsWith("ru");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={
          compact
            ? "flex items-center justify-center gap-1 min-h-[36px] min-w-[36px] px-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition"
            : "flex items-center gap-1.5 px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition text-xs font-semibold text-stone-600"
        }
        title={ru ? "Цвет фона страницы" : "Page background color"}
        aria-label={ru ? "Цвет фона страницы" : "Page background color"}
        aria-expanded={open}
      >
        <Palette className={compact ? "w-4 h-4 text-stone-500" : "w-3.5 h-3.5 text-stone-500"} />
        {!compact && <span className="hidden sm:inline">{ru ? "Фон" : "Bg"}</span>}
        <span
          className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0"
          style={{ background: value }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-[220px] rounded-xl border border-stone-200 bg-white shadow-lg p-3"
          role="dialog"
          aria-label={ru ? "Выбор цвета фона" : "Background color picker"}
        >
          <p className="text-[11px] font-semibold text-stone-500 mb-2">
            {ru ? "Фон страницы (для глаз)" : "Page background (easy on eyes)"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {PAGE_BG_PRESETS.map(preset => {
              const active = preset.color.toLowerCase() === value.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={ru ? preset.labelRu : preset.labelEn}
                  aria-label={ru ? preset.labelRu : preset.labelEn}
                  onClick={() => {
                    onChange(preset.color);
                    setOpen(false);
                  }}
                  className={`h-9 w-full rounded-lg border-2 transition ${active ? "border-blue-600 ring-2 ring-blue-100" : "border-stone-200 hover:border-stone-300"}`}
                  style={{ background: preset.color }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
