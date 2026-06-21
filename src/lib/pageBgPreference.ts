export const PAGE_BG_STORAGE_KEY = "htr-portal-page-bg";
export const PAGE_BG_CHANGED_EVENT = "htr-portal-page-bg-changed";

export const PAGE_BG_PRESETS = [
  { id: "cool-gray", color: "#E5E7EB", labelRu: "Серо-голубой", labelEn: "Cool gray" },
  { id: "warm-sand", color: "#E8E0D4", labelRu: "Тёплый песок", labelEn: "Warm sand" },
  { id: "sage", color: "#DCE5DC", labelRu: "Шалфей", labelEn: "Sage" },
  { id: "soft-blue", color: "#D8E4EF", labelRu: "Мягкий синий", labelEn: "Soft blue" },
  { id: "lavender", color: "#E4DEED", labelRu: "Лаванда", labelEn: "Lavender" },
  { id: "cream", color: "#EDE6D6", labelRu: "Кремовый", labelEn: "Cream" },
  { id: "slate", color: "#CBD5E1", labelRu: "Сланец", labelEn: "Slate" },
  { id: "mist", color: "#F3F4F6", labelRu: "Стандарт", labelEn: "Default" },
] as const;

function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function getStoredPageBg(fallback: string): string {
  try {
    const stored = localStorage.getItem(PAGE_BG_STORAGE_KEY);
    if (stored && isValidHexColor(stored)) return stored;
  } catch {
    /* ignore */
  }
  return fallback;
}

export function setStoredPageBg(color: string): void {
  try {
    localStorage.setItem(PAGE_BG_STORAGE_KEY, color);
  } catch {
    /* ignore */
  }
}

export function applyPageBgToDocument(color: string): void {
  document.documentElement.style.setProperty("--htr-page-bg", color);
}
