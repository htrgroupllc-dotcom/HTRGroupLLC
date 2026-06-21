import { useCallback, useEffect, useState } from "react";
import {
  PAGE_BG_CHANGED_EVENT,
  applyPageBgToDocument,
  getStoredPageBg,
  setStoredPageBg,
} from "@/lib/pageBgPreference";

export function usePageBg(defaultBg: string) {
  const [pageBg, setPageBgState] = useState(() => getStoredPageBg(defaultBg));

  useEffect(() => {
    applyPageBgToDocument(pageBg);
    const sync = () => setPageBgState(getStoredPageBg(defaultBg));
    window.addEventListener(PAGE_BG_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PAGE_BG_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [defaultBg, pageBg]);

  const setPageBg = useCallback((color: string) => {
    setStoredPageBg(color);
    setPageBgState(color);
    applyPageBgToDocument(color);
    window.dispatchEvent(new Event(PAGE_BG_CHANGED_EVENT));
  }, []);

  return [pageBg, setPageBg] as const;
}
