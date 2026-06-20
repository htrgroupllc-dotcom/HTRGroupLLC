import React, { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X } from "lucide-react";

const API = (import.meta.env.VITE_API_BASE as string | undefined ?? "https://htr-group-llc-appliance-repair.replit.app").replace(/\/$/, "");

export type GalleryUploadSite = "appliance" | "dental";

const SITE_META: Record<GalleryUploadSite, { label: string; website: string; accent: string }> = {
  appliance: { label: "Appliance", website: "htrgrouptx.com", accent: "#1B6FE8" },
  dental:    { label: "Dental", website: "dentalfixpro.com", accent: "#6B7280" },
};

export interface DynamicPhoto {
  id: number;
  filename: string;
  caption_en: string;
  caption_es: string;
  site?: string;
}

function authHeaders(pin: string, bearer: string | null, extra?: Record<string, string>): Record<string, string> {
  const base = extra ?? {};
  if (pin) return { ...base, "x-admin-pin": encodeURIComponent(pin) };
  if (bearer) return { ...base, Authorization: `Bearer ${bearer}` };
  return base;
}

interface Props {
  adminPin: string;
  adminBearer?: string | null;
  compact?: boolean;
  onPhotosChange?: () => void;
  /** Which gallery is selected first (admin on dental → dental, etc.) */
  defaultSite?: GalleryUploadSite;
  /** Show Dental / Appliance toggle (admin + secret gallery panel) */
  showSiteSelector?: boolean;
}

export default function GalleryPhotoManager({
  adminPin,
  adminBearer = null,
  compact = false,
  onPhotosChange,
  defaultSite = "appliance",
  showSiteSelector = true,
}: Props) {
  const [gallerySite, setGallerySite] = useState<GalleryUploadSite>(defaultSite);
  const [dynPhotos, setDynPhotos] = useState<DynamicPhoto[]>([]);
  const [upFiles, setUpFiles] = useState<File[]>([]);
  const [upLoading, setUpLoading] = useState(false);
  const [upError, setUpError] = useState("");
  const [upProgress, setUpProgress] = useState<{ done: number; total: number } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const meta = SITE_META[gallerySite];
  const ACCENT = meta.accent;

  const pinHeaders = useCallback(
    (extra?: Record<string, string>) => authHeaders(adminPin, adminBearer, extra),
    [adminPin, adminBearer],
  );

  const loadDynPhotos = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/gallery/photos?site=${gallerySite}`, { cache: "no-store" });
      if (r.ok) {
        setDynPhotos((await r.json()) as DynamicPhoto[]);
        setSelectedIds(new Set());
      }
    } catch {
      /* non-fatal */
    }
  }, [gallerySite]);

  useEffect(() => {
    void loadDynPhotos();
  }, [loadDynPhotos]);

  const handleUploadMany = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (upFiles.length === 0) {
        setUpError("Выберите хотя бы один файл");
        return;
      }
      setUpLoading(true);
      setUpError("");
      setUpProgress({ done: 0, total: upFiles.length });
      let failed = 0;
      for (let i = 0; i < upFiles.length; i++) {
        const file = upFiles[i]!;
        setUpProgress({ done: i, total: upFiles.length });
        try {
          const fd = new FormData();
          fd.append("photo", file);
          fd.append("site", gallerySite);
          const r = await fetch(`${API}/api/gallery/upload`, {
            method: "POST",
            headers: pinHeaders(),
            body: fd,
          });
          if (!r.ok) failed++;
        } catch {
          failed++;
        }
      }
      setUpProgress({ done: upFiles.length, total: upFiles.length });
      if (failed > 0) setUpError(`${failed} файл(ов) не удалось загрузить`);
      setUpFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadDynPhotos();
      onPhotosChange?.();
      setTimeout(() => {
        setUpLoading(false);
        setUpProgress(null);
      }, 800);
    },
    [upFiles, pinHeaders, loadDynPhotos, onPhotosChange, gallerySite],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("Удалить это фото из галереи на сайте?")) return;
      try {
        await fetch(`${API}/api/gallery/photo/${id}`, {
          method: "DELETE",
          headers: pinHeaders(),
        });
        setSelectedIds(prev => {
          const n = new Set(prev);
          n.delete(id);
          return n;
        });
        await loadDynPhotos();
        onPhotosChange?.();
      } catch {
        /* non-fatal */
      }
    },
    [pinHeaders, loadDynPhotos, onPhotosChange],
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Удалить ${selectedIds.size} фото с сайта ${meta.website}?`)) return;
    setIsBulkDeleting(true);
    setBulkDeleteError("");
    try {
      const r = await fetch(`${API}/api/gallery/bulk-delete`, {
        method: "POST",
        headers: pinHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ids: [...selectedIds] }),
      });
      const data = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || data.error) setBulkDeleteError(data.error ?? `Ошибка ${r.status}`);
      else {
        setSelectedIds(new Set());
        await loadDynPhotos();
        onPhotosChange?.();
      }
    } catch {
      setBulkDeleteError("Ошибка соединения");
    }
    setIsBulkDeleting(false);
  }, [selectedIds, pinHeaders, loadDynPhotos, onPhotosChange, meta.website]);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      {showSiteSelector && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-2">
          <p className="text-xs font-bold text-stone-600 uppercase tracking-wide">Галерея для сайта</p>
          <div className="flex flex-col sm:flex-row gap-2">
            {(["appliance", "dental"] as const).map(site => {
              const m = SITE_META[site];
              const active = gallerySite === site;
              return (
                <button
                  key={site}
                  type="button"
                  onClick={() => setGallerySite(site)}
                  className="flex-1 rounded-lg border-2 px-3 py-2.5 text-left transition touch-manipulation"
                  style={{
                    borderColor: active ? m.accent : "#e5e7eb",
                    background: active ? `${m.accent}14` : "#fff",
                  }}
                >
                  <span className="block text-sm font-bold text-stone-800">{m.label}</span>
                  <span className="block text-[11px] text-stone-500">{m.website}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <form onSubmit={e => void handleUploadMany(e)}>
        <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" />
          {meta.label} · Our Work ({meta.website}) · до 50 за раз
        </p>

        <div
          className="border-2 border-dashed rounded-xl p-5 sm:p-4 text-center cursor-pointer active:bg-stone-100 hover:bg-stone-50 transition mb-3 min-h-[120px] flex flex-col items-center justify-center touch-manipulation"
          style={{ borderColor: upFiles.length > 0 ? ACCENT : "#cbd5e1" }}
          onClick={() => fileInputRef.current?.click()}
        >
          {upFiles.length > 0 ? (
            <div>
              <p className="text-sm font-bold" style={{ color: ACCENT }}>
                Выбрано: {upFiles.length} фото
              </p>
              <p className="text-xs text-stone-400 mt-1 underline">Нажмите, чтобы изменить</p>
            </div>
          ) : (
            <div>
              <p className="text-2xl mb-1">📷</p>
              <p className="text-sm font-semibold text-stone-600">Выбрать фото для загрузки</p>
              <p className="text-xs text-stone-400 mt-1">JPG / PNG / WebP · до 15 МБ · до 50 шт.</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => {
              setUpFiles(Array.from(e.target.files ?? []).slice(0, 50));
              setUpError("");
            }}
          />
        </div>

        {upProgress && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-stone-500 mb-1">
              <span>Загрузка…</span>
              <span>
                {upProgress.done} / {upProgress.total}
              </span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${(upProgress.done / upProgress.total) * 100}%`,
                  background: ACCENT,
                }}
              />
            </div>
          </div>
        )}

        {upError && <p className="text-xs text-red-500 mb-2">{upError}</p>}

        <button
          type="submit"
          disabled={upLoading || upFiles.length === 0}
          className="w-full py-3.5 sm:py-2.5 rounded-xl text-white font-bold text-sm transition disabled:opacity-40 touch-manipulation"
          style={{ background: ACCENT }}
        >
          {upLoading
            ? `Загружаем ${upProgress ? `${upProgress.done}/${upProgress.total}` : ""}…`
            : `Загрузить на ${meta.website}${upFiles.length > 0 ? ` (${upFiles.length})` : ""}`}
        </button>
      </form>

      {dynPhotos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">
              На {meta.website} ({dynPhotos.length})
            </p>
            <button
              type="button"
              onClick={() => {
                if (selectedIds.size === dynPhotos.length) setSelectedIds(new Set());
                else setSelectedIds(new Set(dynPhotos.map(p => p.id)));
              }}
              className="text-xs font-semibold underline text-stone-400"
            >
              {selectedIds.size === dynPhotos.length ? "Снять всё" : "Выбрать всё"}
            </button>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-red-50 rounded-xl border border-red-100">
              <span className="text-xs font-semibold text-red-700 flex-1">
                Выбрано: {selectedIds.size}
              </span>
              <button
                type="button"
                onClick={() => void handleBulkDelete()}
                disabled={isBulkDeleting}
                className="text-xs font-bold text-red-600 px-3 py-1 rounded-lg bg-white border border-red-200"
              >
                {isBulkDeleting ? "…" : "Удалить"}
              </button>
            </div>
          )}
          {bulkDeleteError && <p className="text-xs text-red-500 mb-2">{bulkDeleteError}</p>}

          <div
            className={`grid gap-2 max-h-[50vh] sm:max-h-64 overflow-y-auto grid-cols-2 sm:grid-cols-3 ${compact ? "md:grid-cols-3" : "md:grid-cols-4"}`}
          >
            {dynPhotos.map(p => (
              <div key={p.id} className="relative group rounded-lg overflow-hidden aspect-square bg-stone-100">
                <img
                  src={`${API}/api/gallery/file/${p.filename}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => toggleSelect(p.id)}
                  className="absolute top-1 left-1 w-5 h-5 rounded border-2 bg-white/90 flex items-center justify-center text-[10px]"
                  style={{
                    borderColor: selectedIds.has(p.id) ? ACCENT : "#cbd5e1",
                    background: selectedIds.has(p.id) ? ACCENT : "rgba(255,255,255,0.9)",
                    color: selectedIds.has(p.id) ? "#fff" : "transparent",
                  }}
                >
                  {selectedIds.has(p.id) ? "✓" : ""}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(p.id)}
                  className="absolute top-1 right-1 p-1 rounded bg-red-600 text-white opacity-90 hover:opacity-100"
                  aria-label="Удалить"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {dynPhotos.length === 0 && !upLoading && (
        <p className="text-xs text-stone-400 text-center py-2">
          Нет загруженных фото для {meta.label} ({meta.website}).
        </p>
      )}
    </div>
  );
}
