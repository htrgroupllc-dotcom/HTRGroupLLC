import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Lock, Unlock, Calendar, RefreshCw, LogOut,
  Clock, User, Phone, Wrench, XCircle, PlusCircle, CheckCircle2, ThumbsUp, Pencil, RotateCcw, CalendarDays, Trash2, Search, Fingerprint, Users, Archive, ArchiveRestore, ShieldOff, ChevronDown, BarChart3, Settings, Download, MessageSquare, X, PhoneOutgoing, MapPin, Star, Mail, Camera, ShieldCheck, ArrowLeftRight, ChevronLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminLangProvider, useAdminLang } from "@/context/AdminLangContext";
import { downloadBinaryPdf, downloadReceiptPdf, openHtmlDocument } from "@/lib/downloadReceipt";
import EmployeesTab from "@/components/crm/EmployeesTab";
import ArchiveTab from "@/components/crm/ArchiveTab";
import BlacklistTab from "@/components/crm/BlacklistTab";
import PayrollTab from "@/components/crm/PayrollTab";
import SettingsTab from "@/components/crm/SettingsTab";
import ReportsTab from "@/components/crm/ReportsTab";
import TrashTab from "@/components/crm/TrashTab";
import PricebookTab from "@/components/crm/PricebookTab";
import GalleryPhotoManager from "@/components/GalleryPhotoManager";
import VisitFeeSettings from "@/components/admin/VisitFeeSettings";
import CalendarTab from "@/components/calendar/CalendarTab";
import { ADMIN_SITE_CONFIG, resolveBookingBiz } from "@/lib/adminSiteConfig";

const ACCENT = ADMIN_SITE_CONFIG.accent;
const PAGE_BG = ADMIN_SITE_CONFIG.pageBg;
const TIME_SLOTS = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM"];
const MONTHS    = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_S  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const DEFAULT_API_BASE = "https://htr-group-llc-appliance-repair.replit.app";
const API = () =>
  ((import.meta.env.VITE_API_BASE as string | undefined) ?? "").replace(/\/$/, "") || DEFAULT_API_BASE;

function readStoredAdminSession(): {
  authed: boolean;
  pin: string;
  bearer: string | null;
  fidLabel: string | null;
} {
  try {
    const authToken =
      sessionStorage.getItem("adminAuthToken") ?? localStorage.getItem("adminAuthToken");
    const authPin = sessionStorage.getItem("adminPin") ?? localStorage.getItem("adminPin");
    if (authToken && authPin) {
      return { authed: true, pin: authPin, bearer: null, fidLabel: null };
    }
    if (authToken) {
      const sessionLabel = sessionStorage.getItem("adminFidLabel");
      const credId = localStorage.getItem("htr_fid_cred_id");
      const fidLabel =
        sessionLabel ??
        (credId ? localStorage.getItem(`htr_fid_label_${credId}`) : null);
      return { authed: true, pin: "", bearer: authToken, fidLabel };
    }
  } catch {
    /* private mode / blocked storage */
  }
  return { authed: false, pin: "", bearer: null, fidLabel: null };
}

/** Returns current date in Houston (CDT/CST). If after 17:00 → returns tomorrow. */
function getInitialHoustonDate(): { month: number; day: number; year: number } {
  const houstonStr = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  const d = new Date(houstonStr);
  if (d.getHours() >= 17) d.setDate(d.getDate() + 1);
  return { month: d.getMonth() + 1, day: d.getDate(), year: d.getFullYear() };
}

/** Returns next N business days (Mon–Fri, Houston time) as "Mon DD, YYYY" strings */
function getNextBusinessDays(n: number): string[] {
  const days: string[] = [];
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
  d.setDate(d.getDate() + 1);
  while (days.length < n) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push(`${MONTHS_S[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`);
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

// ── Defined OUTSIDE component to prevent focus loss on re-render ─────────────
function AdminInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
        style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
    </div>
  );
}

type AdminT = ReturnType<typeof useAdminLang>["t"];

interface ReceiptHistoryFilters { from: string; to: string; actor: string; q: string }

function highlightText(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm">{part}</mark>
    ) : part
  );
}

function ReceiptHistoryPanel({ rows, loading, error, t, filters, onFiltersChange, onExport, exporting }: {
  rows: ReceiptDownloadRow[] | undefined;
  loading: boolean;
  error: string | undefined;
  t: AdminT;
  filters: ReceiptHistoryFilters;
  onFiltersChange: (next: ReceiptHistoryFilters) => void;
  onExport: () => void;
  exporting: boolean;
}) {
  const actorLabel = (row: ReceiptDownloadRow): string => {
    const type = (row.actor_type ?? "").toLowerCase();
    const base =
      type === "admin"    ? t.receiptHistoryActorAdmin
    : type === "employee" ? t.receiptHistoryActorEmployee
    : type === "client"   ? t.receiptHistoryActorClient
    : t.receiptHistoryActorUnknown;
    return row.actor_name ? `${base} · ${row.actor_name}` : base;
  };
  const hl = (text: string) => highlightText(text, filters.q ?? "");
  const updateFilter = (patch: Partial<ReceiptHistoryFilters>) =>
    onFiltersChange({ ...filters, ...patch });
  return (
    <div className="px-2 pb-2 pt-1 text-[10px] text-stone-700">
      <div className="flex flex-wrap items-end gap-1.5 mb-2 pb-2 border-b border-stone-100">
        <label className="flex flex-col">
          <span className="text-[9px] font-semibold text-stone-500 uppercase tracking-wide">{t.receiptHistoryFilterFrom}</span>
          <input
            type="date"
            value={filters.from}
            onChange={e => updateFilter({ from: e.target.value })}
            className="border border-stone-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </label>
        <label className="flex flex-col">
          <span className="text-[9px] font-semibold text-stone-500 uppercase tracking-wide">{t.receiptHistoryFilterTo}</span>
          <input
            type="date"
            value={filters.to}
            onChange={e => updateFilter({ to: e.target.value })}
            className="border border-stone-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </label>
        <label className="flex flex-col">
          <span className="text-[9px] font-semibold text-stone-500 uppercase tracking-wide">{t.receiptHistoryFilterActor}</span>
          <select
            value={filters.actor}
            onChange={e => updateFilter({ actor: e.target.value })}
            className="border border-stone-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          >
            <option value="">{t.receiptHistoryFilterActorAll}</option>
            <option value="admin">{t.receiptHistoryActorAdmin}</option>
            <option value="employee">{t.receiptHistoryActorEmployee}</option>
            <option value="client">{t.receiptHistoryActorClient}</option>
          </select>
        </label>
        <label className="flex flex-col">
          <span className="text-[9px] font-semibold text-stone-500 uppercase tracking-wide">{t.receiptHistoryFilterSearch}</span>
          <input
            type="search"
            value={filters.q}
            onChange={e => updateFilter({ q: e.target.value })}
            placeholder={t.receiptHistoryFilterSearchPlaceholder}
            className="border border-stone-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </label>
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="ml-auto px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[10px] font-semibold disabled:opacity-50"
        >
          ⬇ {t.receiptHistoryExportCsv}
        </button>
      </div>
      {loading && <div className="text-stone-500 italic">{t.receiptHistoryLoading}</div>}
      {error && !loading && <div className="text-red-600">{error}</div>}
      {!loading && !error && rows && rows.length === 0 && (
        <div className="text-stone-400 italic">{t.receiptHistoryEmpty}</div>
      )}
      {!loading && !error && rows && rows.length > 0 && (
        <ul className="space-y-1.5">
          {rows.map(row => (
            <li key={row.id} className={`border-l-2 pl-2 ${row.suspicious ? "border-red-400 bg-red-50/50" : "border-stone-200"}`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-semibold text-stone-700 flex items-center gap-2">
                  {hl(actorLabel(row))}
                  {row.suspicious && (
                    <span
                      className="inline-flex items-center rounded-full bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 text-xs font-semibold"
                      title={row.suspicious_reason ?? undefined}
                    >
                      ⚠ {t.receiptHistorySuspicious}
                    </span>
                  )}
                </span>
                <span className="text-stone-500">
                  {new Date(row.downloaded_at).toLocaleString(t.dateLocale, { dateStyle: "short", timeStyle: "short", timeZone: "America/Chicago" })}
                </span>
              </div>
              <div className="text-stone-500 flex items-center gap-2 flex-wrap">
                {row.lang && (
                  <span className="uppercase">
                    {t.receiptHistoryLang}: <span className="font-semibold">{row.lang}</span>
                  </span>
                )}
                {row.ip_address && (
                  <span>
                    {t.receiptHistoryIp}: <span className="font-mono">{hl(row.ip_address)}</span>
                  </span>
                )}
                {row.location && (
                  <span>
                    {t.receiptHistoryLocation}: <span className="font-semibold">{row.location}</span>
                  </span>
                )}
              </div>
              {row.user_agent && (
                <div className="text-stone-400 truncate" title={row.user_agent}>
                  {t.receiptHistoryUserAgent}: {hl(row.user_agent)}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface FaceIdCredential { id: number; credential_id: string; label: string; created_at: string; }

interface EmployeeLight { id: string; name: string; phone: string; }

interface BookingRow {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  appliance: string;
  message?: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  created_at?: string;
  // CRM fields
  assigned_employee_id?: string | null;
  payment_method?: string | null;
  payment_amount?: number | null;
  payment_status?: string | null;
  payment_language?: string | null;
  stripe_paid?: boolean | null;
  client_lang?: string | null;
  receipt_resend_count?: number | null;
  receipt_last_resent_at?: string | null;
  recall_note?: string | null;
  client_signed_at?: string | null;
  business_type?: "appliance" | "dental" | string;
  is_remote?: boolean;
}
interface AdminEstimateRecord {
  id: number;
  total: number;
  items: { description: string; category: string; qty: number; unit_price: number }[];
  notes: string | null;
  no_tax: boolean;
  sent_at: string;
}
interface ReceiptDownloadRow {
  id: number;
  booking_id: string;
  downloaded_at: string;
  actor_type: string | null;
  actor_id: string | null;
  actor_name: string | null;
  actor_auth: string | null;
  ip_address: string | null;
  location: string | null;
  user_agent: string | null;
  lang: string | null;
  suspicious?: boolean;
  suspicious_reason?: string | null;
}
interface BookingCallLogRow {
  id: number | string;
  created_at: string;
  caller_phone: string | null;
  status: "completed" | "no_booking" | "error";
  duration_sec: number | null;
  booking_id: string | null;
  client_name: string | null;
}
interface BookedDetail {
  time: string;
  id: string;
  name: string;
  status: string;
}
interface BlockedRow {
  time: string;
  reason: string;
}

function AdminDashboard() {
  const { lang, setLang, t } = useAdminLang();
  const { toast } = useToast();
  const storedSession = readStoredAdminSession();
  const [pin, setPin]             = useState(storedSession.pin);
  const [adminBearer, setBearer]  = useState<string | null>(storedSession.bearer);
  const [authed, setAuthed]       = useState(storedSession.authed);
  const [fidLabel, setFidLabel]   = useState<string | null>(storedSession.fidLabel);

  // CRM: top-level tab navigation
  const [adminTab, setAdminTab]   = useState<"bookings"|"calendar"|"jobsArchive"|"employees"|"archive"|"blacklist"|"payroll"|"reports"|"settings"|"trash"|"pricebook"|"photos">("bookings");
  const [trashCount, setTrashCount] = useState<number>(0);
  // CRM: active employees list for assignment dropdown
  const [employees, setEmployees] = useState<EmployeeLight[]>([]);
  // CRM: employee filter for bookings table
  const [empFilter, setEmpFilter] = useState<string>("");

  // Callback bridge: tracks which bookingId is currently initiating a call
  const [callbackLoading, setCallbackLoading] = useState<Set<string>>(new Set());
  // Gender picker: which bookingId is showing the ♂/♀ selector
  const [genderPickerId, setGenderPickerId] = useState<string | null>(null);

  const handleCallback = useCallback(async (phone: string, bookingId: string, clientName?: string, clientLanguage?: string, clientGender: "male" | "female" = "male") => {
    if (callbackLoading.has(bookingId)) return;
    setCallbackLoading(prev => new Set(prev).add(bookingId));
    try {
      const authToken = localStorage.getItem("adminAuthToken") ?? "";
      const res = await fetch(`${API()}/api/admin/voice/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": authToken },
        body: JSON.stringify({ client_phone: phone, client_name: clientName ?? "", client_language: clientLanguage ?? "en", client_gender: clientGender }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      toast({
        title: "📞 Ваш телефон сейчас зазвонит!",
        description: "Ответьте на звонок с номера (606) 660-6067 — система автоматически соединит вас с клиентом. Клиент увидит только (606), ваш номер скрыт.",
        duration: 14000,
      });
    } catch (err) {
      toast({
        title: "Ошибка обратного звонка",
        description: err instanceof Error ? err.message : "Не удалось инициировать звонок",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setCallbackLoading(prev => { const s = new Set(prev); s.delete(bookingId); return s; });
    }
  }, [callbackLoading, toast]);

  const [reviewLoading, setReviewLoading] = useState<Set<string>>(new Set());
  const [moveBizLoading, setMoveBizLoading] = useState<Set<string>>(new Set());

  // ── Admin Estimate Modal ──────────────────────────────────────────────────
  const [adminEstimateTarget, setAdminEstimateTarget] = useState<{ id: string; name: string; email: string; phone: string } | null>(null);
  const [adminEstimateItems, setAdminEstimateItems] = useState<{ description: string; category: string; qty: number; unit_price: number }[]>([]);
  const [adminEstimateNotes, setAdminEstimateNotes] = useState("");
  const [adminEstimateNoTax, setAdminEstimateNoTax] = useState(false);
  const [adminEstimateNotify, setAdminEstimateNotify] = useState<"email" | "sms" | "both">("email");
  const [adminEstimateSending, setAdminEstimateSending] = useState(false);
  const [adminEstimateErr, setAdminEstimateErr] = useState("");
  const [adminEstimateDone, setAdminEstimateDone] = useState(false);
  const [adminEstimateHistory, setAdminEstimateHistory] = useState<Record<string, AdminEstimateRecord | null>>({});
  const [adminEstimateIsEdit, setAdminEstimateIsEdit] = useState(false);

  const handleSendReview = useCallback(async (bookingId: string) => {
    if (reviewLoading.has(bookingId)) return;
    setReviewLoading(prev => new Set(prev).add(bookingId));
    try {
      const authToken = localStorage.getItem("adminAuthToken") ?? "";
      const res = await fetch(`${API()}/api/admin/bookings/${bookingId}/send-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": authToken },
      });
      const d = await res.json().catch(() => ({})) as { ok?: boolean; error?: string };
      if (d.ok) {
        toast({ title: "✅ Ссылка на отзыв отправлена клиенту по SMS" });
      } else {
        toast({ title: `Ошибка: ${d.error ?? res.status}`, variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка сети", variant: "destructive" });
    } finally {
      setReviewLoading(prev => { const s = new Set(prev); s.delete(bookingId); return s; });
    }
  }, [reviewLoading, toast]);

  // Returns admin auth headers: Bearer token if biometric auth, PIN otherwise
  const adminAuthH = useCallback((extra?: Record<string, string>): Record<string, string> => {
    const base = extra ?? {};
    const pinValue =
      pin ||
      sessionStorage.getItem("adminPin") ||
      localStorage.getItem("adminPin") ||
      "";
    if (pinValue) return { ...base, "x-admin-pin": encodeURIComponent(pinValue) };
    const bearer =
      adminBearer ??
      sessionStorage.getItem("adminAuthToken") ??
      localStorage.getItem("adminAuthToken");
    if (bearer) return { ...base, Authorization: `Bearer ${bearer}` };
    return base;
  }, [pin, adminBearer]);

  const loadAdminLastEstimate = useCallback(async (bookingId: string) => {
    try {
      const r = await fetch(`${API()}/api/admin/bookings/${bookingId}/estimates`, { headers: adminAuthH(), cache: "no-store" });
      if (!r.ok) return;
      const d = await r.json() as { ok?: boolean; estimates?: AdminEstimateRecord[] };
      setAdminEstimateHistory(prev => ({ ...prev, [bookingId]: d.estimates?.[0] ?? null }));
    } catch { /* silent */ }
  }, [adminAuthH]);

  const openAdminEstimate = (b: { id: string; name: string; email: string; phone: string }, prev?: AdminEstimateRecord) => {
    setAdminEstimateTarget(b);
    setAdminEstimateIsEdit(!!prev);
    if (prev && prev.items.length > 0) {
      setAdminEstimateItems(prev.items);
      setAdminEstimateNotes(prev.notes ?? "");
      setAdminEstimateNoTax(prev.no_tax);
    } else {
      setAdminEstimateItems([{ description: "", category: "Labor", qty: 1, unit_price: 0 }]);
      setAdminEstimateNotes("");
      setAdminEstimateNoTax(false);
    }
    // Auto-select notify method based on available contacts
    const hasEmail = !!b.email?.trim();
    const hasPhone = !!b.phone?.trim();
    setAdminEstimateNotify(hasEmail && hasPhone ? "both" : hasEmail ? "email" : "sms");
    setAdminEstimateErr("");
    setAdminEstimateDone(false);
  };

  const handleAdminEstimate = useCallback(async () => {
    if (!adminEstimateTarget) return;
    const validItems = adminEstimateItems.filter(i => i.description.trim() && i.unit_price >= 0);
    if (!validItems.length) { setAdminEstimateErr(t.estimateItems + " — требуется хотя бы одна позиция"); return; }
    setAdminEstimateSending(true);
    setAdminEstimateErr("");
    try {
      const res = await fetch(`${API()}/api/admin/bookings/${adminEstimateTarget.id}/estimate`, {
        method: "POST",
        headers: { ...adminAuthH(), "Content-Type": "application/json" },
        body: JSON.stringify({ items: validItems, notes: adminEstimateNotes.trim() || null, no_tax: adminEstimateNoTax, notify_via: adminEstimateNotify }),
      });
      const d = await res.json().catch(() => ({})) as {
        ok?: boolean; error?: string; total?: number; estimate_id?: number;
      };
      if (d.ok) {
        setAdminEstimateDone(true);
        toast({ title: `✅ ${t.estimateSuccess} ($${(d.total ?? 0).toFixed(2)})` });
        if (adminEstimateTarget && d.estimate_id != null && d.total != null) {
          const targetId = adminEstimateTarget.id;
          setAdminEstimateHistory(prev => ({
            ...prev,
            [targetId]: {
              id: d.estimate_id!,
              total: d.total!,
              items: validItems,
              notes: adminEstimateNotes.trim() || null,
              no_tax: adminEstimateNoTax,
              sent_at: new Date().toISOString(),
            },
          }));
        } else if (adminEstimateTarget) {
          void loadAdminLastEstimate(adminEstimateTarget.id);
        }
        setTimeout(() => setAdminEstimateTarget(null), 1800);
      } else {
        setAdminEstimateErr(d.error ?? t.estimateErr);
      }
    } catch {
      setAdminEstimateErr(t.estimateErr);
    } finally {
      setAdminEstimateSending(false);
    }
  }, [adminEstimateTarget, adminEstimateItems, adminEstimateNotes, adminEstimateNoTax, adminEstimateNotify, t, toast, adminAuthH, loadAdminLastEstimate]);

  // Switch PWA icons to admin versions while on /admin
  useEffect(() => {
    const manifest  = document.getElementById("pwa-manifest")  as HTMLLinkElement | null;
    const touchIcon = document.getElementById("pwa-touch-icon") as HTMLLinkElement | null;
    const appTitle  = document.getElementById("pwa-app-title")  as HTMLMetaElement | null;
    const theme     = document.getElementById("pwa-theme")       as HTMLMetaElement | null;
    const prevManifest  = manifest?.getAttribute("href")  ?? "";
    const prevIcon      = touchIcon?.getAttribute("href") ?? "";
    const prevAppTitle  = appTitle?.getAttribute("content") ?? "";
    const prevTheme     = theme?.getAttribute("content") ?? "";
    const prevTitle     = document.title;
    manifest?.setAttribute("href",    "/admin-manifest.json");
    touchIcon?.setAttribute("href",   "/htr-admin-icon.png");
    appTitle?.setAttribute("content", "HTR Admin");
    theme?.setAttribute("content",    "#0f172a");
    document.title = "✦ HTR ADMIN ✦";
    return () => {
      manifest?.setAttribute("href",    prevManifest);
      touchIcon?.setAttribute("href",   prevIcon === "/apple-touch-icon.png?v=3" ? "/icon-192.png?v=3" : prevIcon);
      appTitle?.setAttribute("content", prevAppTitle);
      theme?.setAttribute("content",    prevTheme);
      document.title = prevTitle;
    };
  }, []);

  // Toast when a new Face ID device was just registered
  useEffect(() => {
    if (sessionStorage.getItem("adminFidJustRegistered")) {
      sessionStorage.removeItem("adminFidJustRegistered");
      toast({ title: t.fidRegisteredToast, description: t.fidDeviceAddedToast, duration: 3000 });
    }
  }, [toast]);

  // Auto-login: AuthGate session token (PIN or biometric)
  // AuthGate saves to localStorage; also check sessionStorage for legacy compat
  useEffect(() => {
    try {
      const authToken = sessionStorage.getItem("adminAuthToken") ?? localStorage.getItem("adminAuthToken");
      const authPin   = sessionStorage.getItem("adminPin")       ?? localStorage.getItem("adminPin");
      if (authToken && authPin) {
        setPin(authPin);
        setAuthed(true);
        return;
      }
      // Biometric auth: valid token exists but no PIN — use Bearer token for API calls
      if (authToken) {
        setBearer(authToken);
        // Prefer sessionStorage label (set on this login), fall back to localStorage (persisted across refreshes)
        const sessionLabel = sessionStorage.getItem("adminFidLabel");
        if (sessionLabel) {
          setFidLabel(sessionLabel);
        } else {
          const credId = localStorage.getItem("htr_fid_cred_id");
          if (credId) {
            const persistedLabel = localStorage.getItem(`htr_fid_label_${credId}`);
            if (persistedLabel) setFidLabel(persistedLabel);
          }
        }
        setAuthed(true);
        return;
      }
      // No valid session found — clean up any stale legacy key and let AuthGate handle re-login
      localStorage.removeItem("admin_session");
    } catch {}
  }, []);

  const initDate = getInitialHoustonDate();
  const [month, setMonth] = useState(initDate.month);
  const [day,   setDay]   = useState(initDate.day);
  const [year,  setYear]  = useState(initDate.year);
  // Tracks which dates we've already checked for auto-advance (avoid infinite loop)
  const checkedAdvance = useRef<Set<string>>(new Set());

  const [bookedDetails, setBookedDetails] = useState<BookedDetail[]>([]);
  const [blockedSlots,  setBlockedSlots]  = useState<BlockedRow[]>([]);
  const [bufferSlots,   setBufferSlots]   = useState<string[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [allBookings,   setAllBookings]   = useState<BookingRow[]>([]);
  const [apiError,      setApiError]      = useState<string | null>(null);
  const [reason,        setReason]        = useState("");
  const [actionSlot,    setActionSlot]    = useState<string | null>(null);
  const [mobileTab,      setMobileTab]      = useState<"slots"|"bookings">("slots");
  const [showCompleted,  setShowCompleted]  = useState(false);
  const [bizFilter,      setBizFilter]      = useState<"all" | "appliance" | "dental">(ADMIN_SITE_CONFIG.defaultBizFilter);

  // Cancel client booking modal
  const [confirmCancel, setConfirmCancel] = useState<{ id: string; name: string; time: string } | null>(null);

  // Complete booking confirmation modal
  const [confirmComplete, setConfirmComplete] = useState<{ id: string; name: string } | null>(null);
  const [completePay, setCompletePay] = useState({ method: "", amount: "", status: "" });

  // Permanent delete booking confirmation modal
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Highlight booking (navigated from Downloads report)
  const [highlightBookingId, setHighlightBookingId] = useState<string | null>(null);
  const [bookingFromCalendar, setBookingFromCalendar] = useState(false);

  useEffect(() => {
    if (!highlightBookingId) return;
    const candidates = [
      document.getElementById(`booking-row-m-${highlightBookingId}`),
      document.getElementById(`booking-row-d-${highlightBookingId}`),
    ];
    const visible = candidates.find(el => el && el.offsetParent !== null);
    (visible ?? candidates[0] ?? candidates[1])?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(() => setHighlightBookingId(null), 3000);
    return () => clearTimeout(timer);
  }, [highlightBookingId]);

  // Multi-select + bulk delete
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  // Face ID credentials management
  const [faceIdCredentials, setFaceIdCredentials] = useState<FaceIdCredential[]>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const [removingCredentialId, setRemovingCredentialId] = useState<number | null>(null);
  const [confirmRemoveCredential, setConfirmRemoveCredential] = useState<FaceIdCredential | null>(null);
  const [removeCredentialError, setRemoveCredentialError] = useState<string | null>(null);
  const [renamingCredentialId, setRenamingCredentialId] = useState<number | null>(null);
  const [renameLabel, setRenameLabel] = useState("");
  const [renameSaving, setRenameSaving] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renamedCredentialId, setRenamedCredentialId] = useState<number | null>(null);
  const renameSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore cancelled booking modal
  const [confirmRestore, setConfirmRestore] = useState<{
    id: string; name: string; date: string; time: string;
    phone: string; email: string; address: string; appliance: string; message: string;
  } | null>(null);
  const [restoreEditOpen, setRestoreEditOpen] = useState(false);
  const [reeName, setReeName]   = useState("");
  const [reePhone, setReePhone] = useState("");
  const [reeEmail, setReeEmail] = useState("");
  const [reeAddr, setReeAddr]   = useState("");
  const [reeAppl, setReeAppl]   = useState("");
  const [reeMsg, setReeMsg]     = useState("");
  const [reeDate, setReeDate]   = useState("");
  const [reeTime, setReeTime]   = useState(TIME_SLOTS[0]);

  // Conflict modal: shown when restore slot is already taken
  const [conflictInfo, setConflictInfo] = useState<{
    id: string; name: string;
    conflictWith: { name: string; date: string; time: string };
  } | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState(TIME_SLOTS[0]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Reschedule active booking modal
  const [confirmReschedule, setConfirmReschedule] = useState<{ id: string; name: string; date: string; time: string } | null>(null);
  const [rsDate, setRsDate] = useState("");
  const [rsTime, setRsTime] = useState(TIME_SLOTS[0]);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rsError, setRsError] = useState<string | null>(null);
  const [rsConflict, setRsConflict] = useState<{ name: string; date: string; time: string } | null>(null);

  // Stripe payment link modal
  const [stripeModal, setStripeModal] = useState<{ id: string; name: string; amount: string } | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeLink, setStripeLink]     = useState<string | null>(null);
  const [stripeErr, setStripeErr]       = useState<string | null>(null);
  const [stripeCopied, setStripeCopied] = useState(false);

  // Resend payment link
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendSentId, setResendSentId] = useState<string | null>(null);
  // Photos & Signature viewer (admin)
  const [adminPhotosOpen,    setAdminPhotosOpen]    = useState<Set<string>>(new Set());
  const [adminPhotosData,    setAdminPhotosData]    = useState<Record<string, { id: string; url: string | null; employee_name: string | null; created_at: string }[]>>({});
  const [adminPhotosLoading, setAdminPhotosLoading] = useState<Set<string>>(new Set());
  const [adminSigData,       setAdminSigData]       = useState<Record<string, { url: string | null; consent_given: boolean } | null>>({});
  const [adminSigLoading,    setAdminSigLoading]    = useState<Set<string>>(new Set());

  // Download receipt PDF
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);
  const [downloadingEstimateId, setDownloadingEstimateId] = useState<string | null>(null);
  // Resend paid receipt email (HTML + PDF attachment)
  const [resendingReceiptId, setResendingReceiptId] = useState<string | null>(null);
  const [resendReceiptSentId, setResendReceiptSentId] = useState<string | null>(null);
  // Note: resendPaymentLink and downloadReceipt are defined further below
  // (after `adminAuthH`) because they depend on it.

  const generatePaymentLink = async () => {
    if (!stripeModal) return;
    setStripeLoading(true);
    setStripeErr(null);
    setStripeLink(null);
    try {
      const r = await fetch(`${API()}/api/admin/bookings/${stripeModal.id}/payment-link`, {
        method: "POST",
        headers: { ...adminAuthH(), "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(stripeModal.amount) || 0 }),
      });
      const d = await r.json() as { ok?: boolean; url?: string; error?: string; stripe_configured?: boolean };
      if (!r.ok || !d.ok) {
        if (d.stripe_configured === false) {
          setStripeErr(t.stripeNoKey);
        } else {
          setStripeErr(d.error ?? "Error");
        }
        return;
      }
      setStripeLink(d.url ?? null);
    } catch {
      setStripeErr("Connection error");
    } finally {
      setStripeLoading(false);
    }
  };

  const copyStripeLink = async () => {
    if (!stripeLink) return;
    await navigator.clipboard.writeText(stripeLink);
    setStripeCopied(true);
    setTimeout(() => setStripeCopied(false), 2000);
  };

  // Manual booking modal
  const [manualSlot, setManualSlot] = useState<string | null>(null);
  const [mName,  setMName]     = useState("");
  const [mPhone, setMPhone]    = useState("");
  const [mEmail, setMEmail]    = useState("");
  const [mAppl,  setMAppl]     = useState("");
  const [mNote,  setMNote]     = useState("");
  const [mAddr,  setMAddr]     = useState("");
  const [mZip,   setMZip]      = useState("");
  const [mError, setMError]    = useState("");
  const [mSaving, setMSaving]  = useState(false);

  // Edit booking modal
  const [editTarget, setEditTarget] = useState<null | { id: string; status: string; client_lang?: string | null }>(null);
  const [eName,  setEName]   = useState("");
  const [ePhone, setEPhone]  = useState("");
  const [eEmail, setEEmail]  = useState("");
  const [eAddr,  setEAddr]   = useState("");
  const [eAppl,  setEAppl]   = useState("");
  const [eDate,  setEDate]   = useState("");
  const [eTime,  setETime]   = useState("");
  const [eNote,  setENote]   = useState("");
  const [eError, setEError]  = useState("");
  const [eSaving, setESaving] = useState(false);

  const dateStr = `${MONTHS_S[month-1]} ${day}, ${year}`;
  const headers = adminAuthH({ "Content-Type": "application/json" });

  const resendPaymentLink = useCallback(async (bookingId: string) => {
    setResendingId(bookingId);
    setResendSentId(null);
    try {
      const r = await fetch(`${API()}/api/admin/bookings/${bookingId}/resend-payment`, {
        method: "POST",
        headers: adminAuthH(),
      });
      if (r.ok) {
        setResendSentId(bookingId);
        setTimeout(() => setResendSentId(null), 3000);
      }
    } catch { /* non-fatal */ }
    finally { setResendingId(null); }
  }, [adminAuthH]);

  // Receipt download history (audit log) — lazy-loaded per booking
  const [receiptHistory, setReceiptHistory] = useState<Record<string, ReceiptDownloadRow[]>>({});
  const [receiptHistoryOpen, setReceiptHistoryOpen] = useState<Set<string>>(new Set());
  const [receiptHistoryLoading, setReceiptHistoryLoading] = useState<Set<string>>(new Set());
  const [receiptHistoryError, setReceiptHistoryError] = useState<Record<string, string>>({});
  const [receiptHistoryFilters, setReceiptHistoryFilters] = useState<Record<string, ReceiptHistoryFilters>>({});
  const [receiptHistoryExporting, setReceiptHistoryExporting] = useState<Set<string>>(new Set());

  // Booking-level call history — lazy-loaded per booking
  const [bookingCallsOpen, setBookingCallsOpen] = useState<Set<string>>(new Set());
  const [bookingCallsData, setBookingCallsData] = useState<Record<string, BookingCallLogRow[]>>({});
  const [bookingCallsLoading, setBookingCallsLoading] = useState<Set<string>>(new Set());
  const [bookingCallTranscript, setBookingCallTranscript] = useState<{
    id: string | number; phone: string | null; client_name: string | null; transcript: string;
  } | null>(null);
  const [bookingCallTranscriptLoading, setBookingCallTranscriptLoading] = useState(false);

  const loadBookingCalls = useCallback(async (bookingId: string) => {
    setBookingCallsLoading(prev => { const n = new Set(prev); n.add(bookingId); return n; });
    try {
      const r = await fetch(`${API()}/api/admin/call-logs?booking_id=${encodeURIComponent(bookingId)}&limit=50`, {
        headers: adminAuthH(), cache: "no-store",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = await r.json() as { ok?: boolean; logs?: BookingCallLogRow[] };
      setBookingCallsData(prev => ({ ...prev, [bookingId]: d.logs ?? [] }));
    } catch {
      setBookingCallsData(prev => ({ ...prev, [bookingId]: [] }));
    } finally {
      setBookingCallsLoading(prev => { const n = new Set(prev); n.delete(bookingId); return n; });
    }
  }, [adminAuthH]);

  const toggleBookingCalls = useCallback((bookingId: string) => {
    setBookingCallsOpen(prev => {
      const n = new Set(prev);
      if (n.has(bookingId)) {
        n.delete(bookingId);
      } else {
        n.add(bookingId);
        void loadBookingCalls(bookingId);
      }
      return n;
    });
  }, [loadBookingCalls]);

  const openBookingCallTranscript = useCallback(async (row: BookingCallLogRow) => {
    setBookingCallTranscriptLoading(true);
    setBookingCallTranscript(null);
    try {
      const r = await fetch(`${API()}/api/admin/call-logs/${row.id}`, { headers: adminAuthH() });
      const d = await r.json() as { ok?: boolean; log?: { transcript: string } };
      setBookingCallTranscript({
        id: row.id,
        phone: row.caller_phone,
        client_name: row.client_name,
        transcript: (r.ok && d.ok && d.log?.transcript) ? d.log.transcript : "",
      });
    } catch {
      setBookingCallTranscript({ id: row.id, phone: row.caller_phone, client_name: row.client_name, transcript: "" });
    } finally {
      setBookingCallTranscriptLoading(false);
    }
  }, [adminAuthH]);

  const getReceiptHistoryFilters = useCallback((bookingId: string): ReceiptHistoryFilters => {
    return receiptHistoryFilters[bookingId] ?? { from: "", to: "", actor: "", q: "" };
  }, [receiptHistoryFilters]);

  const buildReceiptHistoryQuery = (filters: ReceiptHistoryFilters): string => {
    const qs = new URLSearchParams();
    // Convert local YYYY-MM-DD inputs into a full-day range so admins
    // get an inclusive date filter.
    if (filters.from) qs.set("from", new Date(`${filters.from}T00:00:00`).toISOString());
    if (filters.to)   qs.set("to",   new Date(`${filters.to}T23:59:59.999`).toISOString());
    if (filters.actor) qs.set("actor", filters.actor);
    if (filters.q && filters.q.trim()) qs.set("q", filters.q.trim());
    return qs.toString();
  };

  const loadReceiptHistory = useCallback(async (bookingId: string, filters: ReceiptHistoryFilters) => {
    setReceiptHistoryLoading(prev => { const n = new Set(prev); n.add(bookingId); return n; });
    setReceiptHistoryError(prev => {
      if (!(bookingId in prev)) return prev;
      const n = { ...prev }; delete n[bookingId]; return n;
    });
    try {
      const qs = buildReceiptHistoryQuery(filters);
      const url = `${API()}/api/admin/bookings/${bookingId}/receipt-downloads${qs ? `?${qs}` : ""}`;
      const r = await fetch(url, { headers: adminAuthH(), cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const d = await r.json() as { downloads?: ReceiptDownloadRow[] };
      setReceiptHistory(prev => ({ ...prev, [bookingId]: d.downloads ?? [] }));
    } catch {
      setReceiptHistoryError(prev => ({ ...prev, [bookingId]: t.receiptHistoryError }));
    } finally {
      setReceiptHistoryLoading(prev => { const n = new Set(prev); n.delete(bookingId); return n; });
    }
  }, [adminAuthH, t.receiptHistoryError]);

  const toggleReceiptHistory = useCallback((bookingId: string) => {
    setReceiptHistoryOpen(prev => {
      const n = new Set(prev);
      if (n.has(bookingId)) {
        n.delete(bookingId);
      } else {
        n.add(bookingId);
        void loadReceiptHistory(bookingId, getReceiptHistoryFilters(bookingId));
      }
      return n;
    });
  }, [loadReceiptHistory, getReceiptHistoryFilters]);

  const updateReceiptHistoryFilters = useCallback((bookingId: string, next: ReceiptHistoryFilters) => {
    setReceiptHistoryFilters(prev => ({ ...prev, [bookingId]: next }));
    void loadReceiptHistory(bookingId, next);
  }, [loadReceiptHistory]);

  const exportReceiptHistory = useCallback(async (bookingId: string) => {
    setReceiptHistoryExporting(prev => { const n = new Set(prev); n.add(bookingId); return n; });
    try {
      const filters = getReceiptHistoryFilters(bookingId);
      const qs = buildReceiptHistoryQuery(filters);
      const sep = qs ? "&" : "";
      const url = `${API()}/api/admin/bookings/${bookingId}/receipt-downloads?${qs}${sep}format=csv`;
      const r = await fetch(url, { headers: adminAuthH(), cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const blob = await r.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `receipt-downloads-${bookingId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setReceiptHistoryError(prev => ({ ...prev, [bookingId]: t.receiptHistoryExportError }));
    } finally {
      setReceiptHistoryExporting(prev => { const n = new Set(prev); n.delete(bookingId); return n; });
    }
  }, [adminAuthH, getReceiptHistoryFilters, t.receiptHistoryExportError]);

  const toggleAdminPhotos = useCallback((bookingId: string) => {
    setAdminPhotosOpen(prev => {
      const n = new Set(prev);
      if (n.has(bookingId)) {
        n.delete(bookingId);
      } else {
        n.add(bookingId);
        // Load photos if not yet loaded
        if (!adminPhotosData[bookingId]) {
          setAdminPhotosLoading(p => { const s = new Set(p); s.add(bookingId); return s; });
          setAdminSigLoading(p => { const s = new Set(p); s.add(bookingId); return s; });
          void Promise.all([
            fetch(`${API()}/api/admin/bookings/${bookingId}/photos`, { headers: adminAuthH(), cache: "no-store" })
              .then(r => r.json() as Promise<{ photos?: typeof adminPhotosData[string] }>)
              .then(d => {
                setAdminPhotosData(prev2 => ({ ...prev2, [bookingId]: d.photos ?? [] }));
                setAdminPhotosLoading(p => { const s = new Set(p); s.delete(bookingId); return s; });
              })
              .catch(() => setAdminPhotosLoading(p => { const s = new Set(p); s.delete(bookingId); return s; })),
            fetch(`${API()}/api/admin/bookings/${bookingId}/signature`, { headers: adminAuthH(), cache: "no-store" })
              .then(r => r.json() as Promise<{ signature?: { url: string | null; consent_given: boolean } | null }>)
              .then(d => {
                setAdminSigData(prev2 => ({ ...prev2, [bookingId]: d.signature ?? null }));
                setAdminSigLoading(p => { const s = new Set(p); s.delete(bookingId); return s; });
              })
              .catch(() => setAdminSigLoading(p => { const s = new Set(p); s.delete(bookingId); return s; })),
          ]);
        }
      }
      return n;
    });
  }, [adminAuthH, adminPhotosData]);

  const downloadReceipt = useCallback(async (b: BookingRow) => {
    if (downloadingReceiptId) return;
    setDownloadingReceiptId(b.id);
    try {
      // Render the receipt in the booking's preferred language. Only force
      // an explicit ?lang when the client UI has a strong signal — otherwise
      // let the backend fall back to payment_language → language so older
      // bookings (where payment_language/client_lang are null) still come
      // out in the correct language.
      const langOverride: "en" | "es" | null =
        b.payment_language === "es" || b.client_lang === "es" ? "es"
        : b.payment_language === "en" || b.client_lang === "en" ? "en"
        : null;
      const url = `${API()}/api/admin/bookings/${b.id}/invoice-pdf`
        + (langOverride ? `?lang=${langOverride}` : "");
      await downloadBinaryPdf({
        url,
        headers: adminAuthH(),
        filenameBase: `receipt-${b.id.slice(0, 8)}`,
      });
      // The download is logged server-side. If the admin already has the
      // history panel open for this booking, refresh it so the new row shows
      // up immediately. Otherwise just open + load it on demand.
      void loadReceiptHistory(b.id, getReceiptHistoryFilters(b.id));
      setReceiptHistoryOpen(prev => {
        if (prev.has(b.id)) return prev;
        const n = new Set(prev); n.add(b.id); return n;
      });
    } catch {
      window.alert(t.downloadReceiptError);
    } finally {
      setDownloadingReceiptId(null);
    }
  }, [adminAuthH, downloadingReceiptId, loadReceiptHistory, getReceiptHistoryFilters, t.downloadReceiptError]);

  const viewEstimate = useCallback(async (b: BookingRow, estimateId?: number) => {
    try {
      const url = `${API()}/api/admin/bookings/${b.id}/estimate-html`
        + (estimateId ? `?estimate_id=${estimateId}` : "");
      await openHtmlDocument({ url, headers: adminAuthH() });
    } catch {
      window.alert(t.estimateViewError);
    }
  }, [adminAuthH, t.estimateViewError]);

  const downloadEstimate = useCallback(async (b: BookingRow, estimateId?: number) => {
    if (downloadingEstimateId) return;
    setDownloadingEstimateId(b.id);
    try {
      const url = `${API()}/api/admin/bookings/${b.id}/estimate-html`
        + (estimateId ? `?estimate_id=${estimateId}` : "");
      await downloadReceiptPdf({
        url,
        headers: adminAuthH(),
        filenameBase: `estimate-${b.id.slice(0, 8)}`,
      });
    } catch {
      window.alert(t.estimateViewError);
    } finally {
      setDownloadingEstimateId(null);
    }
  }, [adminAuthH, downloadingEstimateId, t.estimateViewError]);

  const resendReceipt = useCallback(async (b: BookingRow) => {
    if (resendingReceiptId) return;
    setResendingReceiptId(b.id);
    setResendReceiptSentId(null);
    try {
      const langOverride: "en" | "es" | null =
        b.payment_language === "es" || b.client_lang === "es" ? "es"
        : b.payment_language === "en" || b.client_lang === "en" ? "en"
        : null;
      const r = await fetch(`${API()}/api/admin/bookings/${b.id}/resend-receipt`, {
        method: "POST",
        headers: adminAuthH({ "Content-Type": "application/json" }),
        body: JSON.stringify(langOverride ? { lang: langOverride } : {}),
      });
      if (!r.ok) throw new Error("resend-failed");
      setResendReceiptSentId(b.id);
      setTimeout(() => setResendReceiptSentId(null), 3000);
    } catch {
      window.alert(t.resendReceiptError);
    } finally {
      setResendingReceiptId(null);
    }
  }, [adminAuthH, resendingReceiptId, t.resendReceiptError]);

  // Silent fetch — no loading spinner (used by auto-refresh)
  const fetchSlots = useCallback(async () => {
    try {
      const r = await fetch(
        `${API()}/api/availability?date=${encodeURIComponent(dateStr)}&_t=${Date.now()}`,
        { cache: "no-store" },
      );
      const d = await r.json();
      setBookedDetails(d.bookedDetails ?? []);
      setBlockedSlots(d.blockedSlots ?? []);
      setBufferSlots(d.bufferSlots ?? []);
    } catch {}
  }, [dateStr]);

  // Manual refresh — shows spinner on the "Обновить" button
  const loadSlots = useCallback(async () => {
    setLoading(true);
    try { await fetchSlots(); }
    finally { setLoading(false); }
  }, [fetchSlots]);

  const loadSchedule = useCallback(async () => {
    try {
      // Silently sync HubSpot deal status before loading — catches deals deleted in HubSpot directly
      await fetch(`${API()}/api/admin/hs-sync`, {
        method: "POST",
        headers: adminAuthH(),
      }).catch(() => { /* non-fatal */ });

      const from = "2020-01-01";
      const to   = "2099-12-31";
      const r = await fetch(`${API()}/api/admin/schedule?from=${from}&to=${to}&_t=${Date.now()}`, { headers: adminAuthH(), cache: "no-store" });
      if (!r.ok) { setApiError(`${t.errScheduleStatus}${r.status}. ${t.errCheckPin}`); return; }
      const text = await r.text();
      let d: { bookings?: BookingRow[] };
      try { d = JSON.parse(text); } catch {
        setApiError(t.errScheduleInvalid);
        return;
      }
      setApiError(null);
      setAllBookings(d.bookings ?? []);
      void Promise.all((d.bookings ?? []).map(b => loadAdminLastEstimate(b.id)));
    } catch (e: unknown) {
      setApiError(`${t.errConnectionPrefix}${e instanceof Error ? e.message : String(e)}`);
    }
  }, [adminAuthH, loadAdminLastEstimate]);

  const loadCredentials = useCallback(async () => {
    setLoadingCredentials(true);
    setCredentialsError(null);
    try {
      const r = await fetch(`${API()}/api/auth/webauthn/credentials`, {
        headers: adminAuthH(),
        cache: "no-store",
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({})) as { error?: string };
        setCredentialsError(body?.error ?? `Failed to load devices (${r.status})`);
        return;
      }
      const data = await r.json() as { credentials: FaceIdCredential[] };
      setFaceIdCredentials(data.credentials ?? []);
    } catch {
      setCredentialsError(t.errNetwork);
    } finally { setLoadingCredentials(false); }
  }, [adminAuthH]);

  // CRM: load active employees for assignment dropdown
  const loadEmployees = useCallback(async () => {
    try {
      const r = await fetch(`${API()}/api/admin/employees`, { headers: adminAuthH(), cache: "no-store" });
      if (!r.ok) return;
      const d = await r.json() as { employees?: EmployeeLight[] };
      setEmployees(d.employees ?? []);
    } catch {}
  }, [adminAuthH]);

  // CRM: assign employee to booking
  const recallBooking = async (bookingId: string) => {
    if (!window.confirm(t.recallConfirm)) return;
    const r = await fetch(`${API()}/api/admin/recall-booking`, {
      method: "POST",
      headers: adminAuthH({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id: bookingId, note: "Повторный вызов" }),
    });
    const d = await r.json() as { ok?: boolean; error?: string };
    if (d.ok) {
      setAllBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: "approved", recall_note: "Повторный вызов" } : b,
      ));
    }
  };

  const assignEmployee = useCallback(async (bookingId: string, employeeId: string | null) => {
    setAllBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, assigned_employee_id: employeeId } : b,
    ));
    await fetch(`${API()}/api/admin/bookings/${bookingId}/assign`, {
      method: "POST",
      headers: adminAuthH({ "Content-Type": "application/json" }),
      body: JSON.stringify({ employee_id: employeeId || null }),
    });
    void loadSchedule();
  }, [adminAuthH, loadSchedule]);

  // Initial load + re-load whenever selected date changes
  useEffect(() => { if (authed) { loadSlots(); loadSchedule(); loadCredentials(); loadEmployees(); } }, [authed, loadSlots, loadSchedule, loadCredentials, loadEmployees]);

  // Load trash count on login (so badge shows immediately)
  useEffect(() => {
    if (!authed) return;
    fetch(`${API()}/api/admin/trash`, { headers: adminAuthH(), cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then((d: { bookings?: unknown[] } | null) => { if (d?.bookings) setTrashCount(d.bookings.length); })
      .catch(() => {});
  }, [authed, adminAuthH]);

  // Auto-refresh slot availability + all bookings every 5 s (silent — no spinner)
  useEffect(() => {
    if (!authed) return;
    const id = setInterval(() => { fetchSlots(); loadSchedule(); }, 5_000);
    return () => clearInterval(id);
  }, [authed, fetchSlots, loadSchedule]);

  // Also refresh silently when the browser tab becomes visible again
  useEffect(() => {
    if (!authed) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") { fetchSlots(); loadSchedule(); }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [authed, fetchSlots, loadSchedule]);

  // Auto-advance to next available date if ALL slots are booked/blocked (max 30 days)
  useEffect(() => {
    if (!authed) return;
    // Only check once per date to avoid infinite loops
    if (checkedAdvance.current.has(dateStr)) return;
    // Wait until we have actual data (avoid false positives on initial empty state)
    if (bookedDetails.length === 0 && blockedSlots.length === 0) return;
    checkedAdvance.current.add(dateStr);
    const takenTimes = new Set([
      ...bookedDetails.map(b => b.time),
      ...blockedSlots.map(b => b.time),
      ...bufferSlots,
    ]);
    const allFull = TIME_SLOTS.every(t => takenTimes.has(t));
    if (!allFull) return;
    // All slots taken — advance to next day (limit 30 days)
    if (checkedAdvance.current.size > 30) return;
    const next = new Date(year, month - 1, day + 1);
    setMonth(next.getMonth() + 1);
    setDay(next.getDate());
    setYear(next.getFullYear());
  }, [authed, bookedDetails, blockedSlots, dateStr, day, month, year]);


  const blockSlot = async (time: string) => {
    setActionSlot(time);
    // Optimistic update — turn orange immediately
    const currentReason = reason;
    setBlockedSlots(prev => [...prev.filter(b => b.time !== time), { time, reason: currentReason }]);
    setReason("");
    await fetch(`${API()}/api/admin/block`, {
      method: "POST", headers,
      body: JSON.stringify({ date: dateStr, time, reason: currentReason }),
      cache: "no-store",
    });
    // Sync with server for consistency
    await loadSlots();
    setActionSlot(null);
  };

  const unblockSlot = async (time: string) => {
    setActionSlot(time);
    // Optimistic update — turn green immediately
    setBlockedSlots(prev => prev.filter(b => b.time !== time));
    await fetch(`${API()}/api/admin/block`, {
      method: "DELETE", headers,
      body: JSON.stringify({ date: dateStr, time }),
      cache: "no-store",
    });
    // Sync with server for consistency
    await loadSlots();
    setActionSlot(null);
  };

  const cancelBooking = async () => {
    if (!confirmCancel) return;
    const { id: cid, time: ctime } = confirmCancel;
    setActionSlot(ctime);
    setConfirmCancel(null);
    // Optimistic: free the slot immediately
    setBookedDetails(prev => prev.filter(b => b.id !== cid));
    setAllBookings(prev => prev.map(b => b.id === cid ? { ...b, status: "cancelled" } : b));
    await fetch(`${API()}/api/admin/cancel-booking`, {
      method: "POST", headers,
      body: JSON.stringify({ id: cid }),
    });
    await Promise.all([loadSlots(), loadSchedule()]);
    setActionSlot(null);
  };

  const completeBooking = async (id: string) => {
    const payMethod = completePay.method.trim() || null;
    const payAmountRaw = completePay.amount.trim() ? parseFloat(completePay.amount) : null;
    const payAmount = payAmountRaw !== null && !isNaN(payAmountRaw) ? payAmountRaw : null;
    const payStatus = completePay.status.trim() || null;
    // Optimistic: update status and payment fields immediately
    setBookedDetails(prev => prev.filter(b => b.id !== id));
    setAllBookings(prev => prev.map(b => b.id === id
      ? { ...b, status: "completed", payment_method: payMethod ?? b.payment_method, payment_amount: payAmount ?? b.payment_amount, payment_status: payStatus ?? b.payment_status }
      : b));
    setConfirmComplete(null);
    setCompletePay({ method: "", amount: "", status: "" });
    await fetch(`${API()}/api/admin/complete-booking`, {
      method: "POST", headers,
      body: JSON.stringify({ id, payment_method: payMethod, payment_amount: payAmount, payment_status: payStatus }),
    });
    await Promise.all([loadSlots(), loadSchedule()]);
  };

  const approveBooking = async (id: string) => {
    await fetch(`${API()}/api/admin/approve-booking`, {
      method: "POST", headers,
      body: JSON.stringify({ id }),
    });
    await loadSlots();
    await loadSchedule();
  };

  const moveBookingBiz = async (bookingId: string, target: "appliance" | "dental") => {
    if (moveBizLoading.has(bookingId)) return;
    setMoveBizLoading(prev => new Set(prev).add(bookingId));
    try {
      const res = await fetch(`${API()}/api/admin/set-business-type`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, business_type: target }),
      });
      const d = await res.json().catch(() => ({})) as { ok?: boolean; error?: string };
      if (!res.ok || !d.ok) throw new Error(d.error ?? String(res.status));
      toast({
        title: target === "dental" ? `✅ ${t.moveToDentalSuccess}` : `✅ ${t.moveToApplianceSuccess}`,
      });
      await loadSchedule();
    } catch {
      toast({ title: t.moveBizError, variant: "destructive" });
    } finally {
      setMoveBizLoading(prev => { const s = new Set(prev); s.delete(bookingId); return s; });
    }
  };

  const MoveBizButton = ({ b, className }: { b: BookingRow; className?: string }) => {
    const current = resolveBookingBiz(b.business_type);
    const target: "appliance" | "dental" = current === "dental" ? "appliance" : "dental";
    const loading = moveBizLoading.has(b.id);
    const btnClass = className ?? (
      "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold leading-none border transition disabled:opacity-50 " +
      (target === "dental"
        ? "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100"
        : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100")
    );
    return (
      <button
        type="button"
        disabled={loading}
        onClick={() => void moveBookingBiz(b.id, target)}
        className={btnClass}
        title={target === "dental" ? t.moveToDentalTitle : t.moveToApplianceTitle}
      >
        <ArrowLeftRight className="w-2.5 h-2.5" />
        {loading ? "…" : (target === "dental" ? t.moveToDentalBtn : t.moveToApplianceBtn)}
      </button>
    );
  };

  const deleteBooking = async () => {
    if (!confirmDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`${API()}/api/admin/delete-booking`, {
        method: "POST", headers,
        body: JSON.stringify({ id: confirmDelete.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setDeleteError(body?.error ?? `${t.errServer} (${res.status})`);
        return;
      }
      // Optimistic: free the slot immediately
      setBookedDetails(prev => prev.filter(b => b.id !== confirmDelete.id));
      setAllBookings(prev => prev.filter(b => b.id !== confirmDelete.id));
      setConfirmDelete(null);
      setDeleteError(null);
      await Promise.all([loadSlots(), loadSchedule()]);
    } catch (e) {
      setDeleteError(t.errNoConnection);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Multi-select helpers ─────────────────────────────────────────────────
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAll = () =>
    setSelectedIds(prev => new Set([...prev, ...filteredBookings.map(b => b.id)]));

  const deselectAll = () => setSelectedIds(new Set());

  const bulkDeleteBookings = async () => {
    if (selectedIds.size === 0 || isBulkDeleting) return;
    setIsBulkDeleting(true);
    setBulkDeleteError(null);
    try {
      const res = await fetch(`${API()}/api/admin/bulk-delete-bookings`, {
        method: "POST", headers,
        body: JSON.stringify({ ids: [...selectedIds] }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setBulkDeleteError(body?.error ?? `${t.errServer} (${res.status})`);
        return;
      }
      // Optimistic: free slots immediately
      const deletedIds = new Set([...selectedIds]);
      setBookedDetails(prev => prev.filter(b => !deletedIds.has(b.id)));
      setAllBookings(prev => prev.filter(b => !deletedIds.has(b.id)));
      setSelectedIds(new Set());
      setConfirmBulkDelete(false);
      setBulkDeleteError(null);
      await Promise.all([loadSlots(), loadSchedule()]);
    } catch {
      setBulkDeleteError(t.errNoConnection);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const restoreBooking = async (overrideDate?: string, overrideTime?: string) => {
    const id   = overrideDate ? conflictInfo?.id   : confirmRestore?.id;
    const name = overrideDate ? conflictInfo?.name : confirmRestore?.name;
    if (!id || isRestoring) return;

    setIsRestoring(true);
    try {
      const body: Record<string, string> = { id };
      if (overrideDate) {
        body["newDate"] = overrideDate;
      } else if (restoreEditOpen && reeDate) {
        body["newDate"] = reeDate;
      }
      if (overrideTime) {
        body["newTime"] = overrideTime;
      } else if (restoreEditOpen && reeTime) {
        body["newTime"] = reeTime;
      }
      if (restoreEditOpen) {
        if (reeName.trim())  body["newName"]     = reeName.trim();
        if (reePhone.trim()) body["newPhone"]    = reePhone.trim();
        body["newEmail"]   = reeEmail;
        body["newAddress"] = reeAddr;
        if (reeAppl.trim()) body["newAppliance"] = reeAppl.trim();
        body["newMessage"] = reeMsg;
      }

      const r = await fetch(`${API()}/api/admin/restore-booking`, {
        method: "POST", headers,
        body: JSON.stringify(body),
      });
      const data = await r.json() as { ok?: boolean; error?: string; conflict?: boolean; conflictWith?: { name: string; date: string; time: string } };

      if (!r.ok || data.error) {
        setRestoreError(data.error ?? `${t.errServer} (${r.status})`);
        return;
      }

      if (data.conflict && data.conflictWith) {
        setConfirmRestore(null);
        setRestoreError(null);
        const bizDays = getNextBusinessDays(14);
        setRescheduleDate(bizDays[0] ?? "");
        setRescheduleTime(TIME_SLOTS[0]);
        setConflictInfo({ id, name: name ?? "", conflictWith: data.conflictWith });
        return;
      }

      setConfirmRestore(null);
      setConflictInfo(null);
      setRestoreError(null);
      await loadSlots();
      await loadSchedule();
    } catch {
      setRestoreError(t.errNetwork);
    } finally {
      setIsRestoring(false);
    }
  };

  const openRestoreModal = (b: { id: string; name: string; phone: string; email?: string; address?: string; appliance?: string; message?: string; preferred_date: string; preferred_time: string }) => {
    const bizDays = getNextBusinessDays(14);
    setRestoreError(null);
    setRestoreEditOpen(false);
    setReeName(b.name ?? "");
    setReePhone(b.phone ?? "");
    setReeEmail(b.email ?? "");
    setReeAddr(b.address ?? "");
    setReeAppl(b.appliance ?? "");
    setReeMsg(b.message ?? "");
    setReeDate(bizDays[0] ?? b.preferred_date);
    setReeTime(b.preferred_time);
    setConfirmRestore({
      id: b.id, name: b.name, date: b.preferred_date, time: b.preferred_time,
      phone: b.phone ?? "", email: b.email ?? "", address: b.address ?? "",
      appliance: b.appliance ?? "", message: b.message ?? "",
    });
  };

  const openReschedule = (b: { id: string; name: string; preferred_date: string; preferred_time: string }) => {
    const bizDays = getNextBusinessDays(14);
    setRsDate(bizDays[0] ?? "");
    setRsTime(TIME_SLOTS[0]);
    setRsError(null);
    setRsConflict(null);
    setConfirmReschedule({ id: b.id, name: b.name, date: b.preferred_date, time: b.preferred_time });
  };

  const rescheduleBooking = async (forceDate?: string, forceTime?: string) => {
    if (!confirmReschedule || isRescheduling) return;
    const useDate = forceDate ?? rsDate;
    const useTime = forceTime ?? rsTime;
    setIsRescheduling(true);
    setRsError(null);
    setRsConflict(null);
    try {
      const r = await fetch(`${API()}/api/admin/reschedule-booking`, {
        method: "POST", headers,
        body: JSON.stringify({ id: confirmReschedule.id, newDate: useDate, newTime: useTime }),
      });
      const data = await r.json() as { ok?: boolean; error?: string; conflict?: boolean; conflictWith?: { name: string; date: string; time: string } };
      if (data.conflict && data.conflictWith) {
        setRsConflict(data.conflictWith);
        return;
      }
      if (!r.ok || data.error) {
        setRsError(data.error ?? `${t.errServer} (${r.status})`);
        return;
      }
      setConfirmReschedule(null);
      setRsConflict(null);
      await loadSlots();
      await loadSchedule();
    } catch {
      setRsError(t.errNetwork);
    } finally {
      setIsRescheduling(false);
    }
  };

  // Open edit modal pre-filled with current booking data
  const openEditModal = (b: { id: string; status: string; name: string; phone: string; email?: string; address?: string; appliance?: string; preferred_date: string; preferred_time: string; message?: string; client_lang?: string | null }) => {
    setEditTarget({ id: b.id, status: b.status, client_lang: b.client_lang ?? null });
    setEName(b.name ?? "");
    setEPhone(b.phone ?? "");
    setEEmail(b.email ?? "");
    setEAddr(b.address ?? "");
    setEAppl(b.appliance ?? "");
    setEDate(b.preferred_date ?? "");
    setETime(b.preferred_time ?? "");
    setENote(b.message ?? "");
    setEError("");
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    if (!eName.trim() || !ePhone.trim() || !eDate.trim() || !eTime.trim()) {
      setEError(t.errFillRequired);
      return;
    }
    setESaving(true);
    setEError("");
    try {
      const r = await fetch(`${API()}/api/admin/edit-booking`, {
        method: "POST", headers,
        body: JSON.stringify({ id: editTarget.id, name: eName, phone: ePhone, email: eEmail, address: eAddr, appliance: eAppl, date: eDate, time: eTime, message: eNote }),
      });
      const d = await r.json();
      if (d.error === "slot_taken") { setEError(t.errSlotTaken); return; }
      if (!r.ok) { setEError(d.error ?? t.errServer); return; }
      setEditTarget(null);
      await loadSlots();
      await loadSchedule();
    } catch { setEError(t.errNetwork); }
    finally { setESaving(false); }
  };

  // Sort: active first (pending → approved) newest first, then history newest first
  const byDateDesc = (a: BookingRow, b: BookingRow) =>
    new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
  const activeBookings  = allBookings
    .filter(b => b.status === "pending" || b.status === "approved")
    .sort(byDateDesc);
  const historyBookings = allBookings
    .filter(b => b.status === "completed" || b.status === "cancelled")
    .sort(byDateDesc);
  const isJobsArchiveTab = adminTab === "jobsArchive";
  const listBookings = isJobsArchiveTab ? historyBookings : activeBookings;

  const filteredBookings = (() => {
    const sq = searchQuery.trim().toLowerCase();
    let result = listBookings;
    if (bizFilter !== "all") {
      result = result.filter(b => resolveBookingBiz(b.business_type) === bizFilter);
    }
    if (empFilter) {
      result = result.filter(b => b.assigned_employee_id === empFilter);
    }
    if (!sq) return result;
    return result.filter(b =>
      (b.id             ?? "").toLowerCase().includes(sq) ||
      (b.name           ?? "").toLowerCase().includes(sq) ||
      (b.phone          ?? "").toLowerCase().includes(sq) ||
      (b.address        ?? "").toLowerCase().includes(sq) ||
      (b.preferred_date ?? "").toLowerCase().includes(sq) ||
      (b.appliance      ?? "").toLowerCase().includes(sq)
    );
  })();

  const allSelected = filteredBookings.length > 0 && filteredBookings.every(b => selectedIds.has(b.id));

  const statusInfo = (status: string) => {
    if (status === "approved")   return { cls: "bg-green-100 text-green-700",   label: t.statusApproved };
    if (status === "completed")  return { cls: "bg-blue-100 text-blue-700",     label: t.statusCompleted };
    if (status === "cancelled")  return { cls: "bg-red-100 text-red-500",       label: t.statusCancelled };
    return                              { cls: "bg-amber-100 text-amber-700",   label: t.statusPending };
  };

  const openManual = (time: string) => {
    setManualSlot(time);
    setMName(""); setMPhone(""); setMEmail(""); setMAppl(""); setMNote(""); setMAddr(""); setMZip(""); setMError("");
  };

  const createManualBooking = async () => {
    if (!mName.trim() || !mPhone.trim()) { setMError(t.errEnterNamePhone); return; }
    setMSaving(true); setMError("");
    const r = await fetch(`${API()}/api/admin/booking`, {
      method: "POST", headers,
      body: JSON.stringify({
        name: mName, phone: mPhone, email: mEmail, appliance: mAppl, address: mAddr,
        message: [mNote, mZip ? `ZIP: ${mZip}` : ""].filter(Boolean).join(" | "),
        date: dateStr, time: manualSlot,
        business_type: ADMIN_SITE_CONFIG.bookingBizFallback,
      }),
    });
    if (r.status === 409) { setMError(t.errSlotTakenShort); setMSaving(false); return; }
    if (!r.ok) { setMError(t.errServer); setMSaving(false); return; }
    setManualSlot(null);
    setMSaving(false);
    await loadSlots();
    await loadSchedule();
  };

  const startRename = (cred: FaceIdCredential) => {
    setRenamingCredentialId(cred.id);
    setRenameLabel(cred.label || "Device");
    setRenameError(null);
    if (renameSuccessTimerRef.current) clearTimeout(renameSuccessTimerRef.current);
    setRenamedCredentialId(null);
  };

  const cancelRename = () => {
    setRenamingCredentialId(null);
    setRenameLabel("");
    setRenameError(null);
  };

  const saveRename = async (credId: number) => {
    const trimmed = renameLabel.trim();
    if (!trimmed) { setRenameError("Label cannot be empty"); return; }
    setRenameSaving(true);
    setRenameError(null);
    try {
      const r = await fetch(`${API()}/api/auth/webauthn/credentials/${credId}`, {
        method: "PATCH",
        headers: adminAuthH({ "Content-Type": "application/json" }),
        body: JSON.stringify({ label: trimmed }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({})) as { error?: string };
        setRenameError(body?.error ?? `${t.errServer} (${r.status})`);
        return;
      }
      setFaceIdCredentials(prev => prev.map(c => c.id === credId ? { ...c, label: trimmed } : c));

      // If the renamed credential matches the currently logged-in Face ID device, sync the header
      const localCredId = localStorage.getItem("htr_fid_cred_id");
      const renamedCred = faceIdCredentials.find(c => c.id === credId);
      if (localCredId && renamedCred && renamedCred.credential_id === localCredId) {
        setFidLabel(trimmed);
        sessionStorage.setItem("adminFidLabel", trimmed);
        localStorage.setItem(`htr_fid_label_${localCredId}`, trimmed);
      }

      setRenamingCredentialId(null);
      setRenameLabel("");
      if (renameSuccessTimerRef.current) clearTimeout(renameSuccessTimerRef.current);
      setRenamedCredentialId(credId);
      renameSuccessTimerRef.current = setTimeout(() => setRenamedCredentialId(null), 3000);
      toast({ title: "Device renamed", description: `"${trimmed}" saved successfully.`, duration: 3000 });
      loadCredentials();
    } catch {
      setRenameError(t.errNetwork);
    } finally {
      setRenameSaving(false);
    }
  };

  const removeCredential = async () => {
    if (!confirmRemoveCredential || removingCredentialId !== null) return;
    const removedLabel = confirmRemoveCredential.label || "Device";
    setRemovingCredentialId(confirmRemoveCredential.id);
    setRemoveCredentialError(null);
    try {
      const r = await fetch(`${API()}/api/auth/webauthn/credentials/${confirmRemoveCredential.id}`, {
        method: "DELETE",
        headers: adminAuthH(),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({})) as { error?: string };
        setRemoveCredentialError(body?.error ?? `${t.errServer} (${r.status})`);
        return;
      }
      setFaceIdCredentials(prev => prev.filter(c => c.id !== confirmRemoveCredential.id));
      setConfirmRemoveCredential(null);
      toast({
        title: "Device removed",
        description: `"${removedLabel}" has been removed successfully.`,
        duration: 3000,
      });
    } catch {
      setRemoveCredentialError(t.errNetwork);
    } finally {
      setRemovingCredentialId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminAuthToken");
    localStorage.removeItem("adminAuthTokenExp");
    localStorage.removeItem("adminPin");
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_pin");
    sessionStorage.removeItem("adminAuthToken");
    sessionStorage.removeItem("adminPin");
    sessionStorage.removeItem("adminFidLabel");
    window.location.reload();
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PAGE_BG }}>
        <RefreshCw className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const closeManualModal = () => {
    setManualSlot(null);
    setMName(""); setMPhone(""); setMEmail(""); setMAppl(""); setMNote(""); setMAddr(""); setMZip(""); setMError("");
  };

  return (
    <div className="min-h-screen" style={{ background: PAGE_BG }}>

      {/* ── Cancel booking modal ── */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-stone-800">{t.cancelTitle}</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1">{t.clientLabel} <strong>{confirmCancel.name}</strong></p>
            <p className="text-sm text-stone-600 mb-4">{t.cancelSlotWill} <strong>{confirmCancel.time}</strong></p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmCancel(null)}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition">
                {t.back}
              </button>
              <button onClick={cancelBooking}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">
                {t.cancelBtnLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Complete booking confirmation modal ── */}
      {confirmComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-stone-800">{t.completeTitle}</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1">{t.clientLabel} <strong>{confirmComplete.name}</strong></p>
            <p className="text-xs text-stone-400 mb-3">{t.completeDesc}</p>
            <p className="text-xs font-semibold text-stone-500 mb-2">{t.completePaySection}</p>
            <div className="flex flex-col gap-2 mb-4">
              <input
                type="text"
                value={completePay.method}
                onChange={e => setCompletePay(p => ({ ...p, method: e.target.value }))}
                placeholder={t.completeMethodPlaceholder}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
              <input
                type="number"
                value={completePay.amount}
                onChange={e => setCompletePay(p => ({ ...p, amount: e.target.value }))}
                placeholder={t.completeAmountLabel}
                min="0" step="0.01"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
              <select
                value={completePay.status}
                onChange={e => setCompletePay(p => ({ ...p, status: e.target.value }))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white"
              >
                <option value="">{t.payStatus}</option>
                <option value="paid">{t.payStatusPaid}</option>
                <option value="cash">{t.payStatusCash}</option>
                <option value="unpaid">{t.payStatusUnpaid}</option>
                <option value="pending">{t.payStatusPending}</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setConfirmComplete(null); setCompletePay({ method: "", amount: "", status: "" }); }}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition">
                {t.back}
              </button>
              <button onClick={() => completeBooking(confirmComplete.id)}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">
                {t.completeBtnLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk move-to-trash confirmation modal ── */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-stone-800">{t.moveToTrashBulkTitle}</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1">
              {t.selected} <strong>{selectedIds.size}</strong>
            </p>
            <p className="text-xs text-amber-600 font-semibold mb-4">{t.moveToTrashBulkMsg}</p>
            {bulkDeleteError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                ❌ {bulkDeleteError}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setConfirmBulkDelete(false); setBulkDeleteError(null); }} disabled={isBulkDeleting}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-50">
                {t.back}
              </button>
              <button onClick={bulkDeleteBookings} disabled={isBulkDeleting}
                className="flex-1 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50">
                {isBulkDeleting ? t.deleting : `${t.moveToTrashBulkBtn} (${selectedIds.size})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Move to trash confirmation modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-stone-800">{t.moveToTrashSingleTitle}</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1">{t.clientLabel} <strong>{confirmDelete.name}</strong></p>
            <p className="text-xs text-amber-600 font-semibold mb-4">{t.moveToTrashSingleMsg}</p>
            {deleteError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                ❌ {deleteError}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setConfirmDelete(null); setDeleteError(null); }} disabled={isDeleting}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-50">
                {t.back}
              </button>
              <button onClick={deleteBooking} disabled={isDeleting}
                className="flex-1 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50">
                {isDeleting ? t.deleting : t.moveToTrashSingleBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Restore cancelled booking confirmation modal ── */}
      {confirmRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm max-h-[92vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-stone-800">{t.restoreTitle}</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1">{t.clientLabel} <strong>{confirmRestore.name}</strong></p>
            <p className="text-sm text-stone-600 mb-2">{t.dateShort} <strong>{confirmRestore.date}</strong> · <strong>{confirmRestore.time}</strong></p>

            {/* ── Toggle: edit fields before restore ── */}
            <button
              onClick={() => setRestoreEditOpen(v => !v)}
              disabled={isRestoring}
              className="w-full flex items-center justify-between px-3 py-2 mb-3 rounded-lg border text-xs font-semibold transition"
              style={{ borderColor: restoreEditOpen ? ACCENT : "#e7e5e4", color: restoreEditOpen ? ACCENT : "#78716c", background: restoreEditOpen ? "#eff6ff" : "#fafaf9" }}>
              <span className="flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5" />
                {restoreEditOpen ? t.hideEdits : t.showEdits}
              </span>
              <span className="text-base leading-none">{restoreEditOpen ? "▲" : "▼"}</span>
            </button>

            {restoreEditOpen && (
              <div className="flex flex-col gap-2 mb-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">{t.fieldName}</label>
                  <input value={reeName} onChange={e => setReeName(e.target.value)} disabled={isRestoring}
                    className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">{t.fieldPhone}</label>
                  <input value={reePhone} onChange={e => setReePhone(e.target.value)} disabled={isRestoring}
                    className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">{t.fieldEmail}</label>
                  <input type="email" value={reeEmail} onChange={e => setReeEmail(e.target.value)} disabled={isRestoring}
                    className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">{t.fieldAddress}</label>
                  <input value={reeAddr} onChange={e => setReeAddr(e.target.value)} disabled={isRestoring}
                    className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">{t.fieldAppliance}</label>
                  <input value={reeAppl} onChange={e => setReeAppl(e.target.value)} disabled={isRestoring}
                    className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">{t.fieldIssue}</label>
                  <textarea value={reeMsg} onChange={e => setReeMsg(e.target.value)} disabled={isRestoring} rows={2}
                    className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 resize-none disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">{t.fieldNewDate}</label>
                  <select value={reeDate} onChange={e => setReeDate(e.target.value)} disabled={isRestoring}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
                    {getNextBusinessDays(14).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">{t.fieldNewTime}</label>
                  <select value={reeTime} onChange={e => setReeTime(e.target.value)} disabled={isRestoring}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            )}

            <p className="text-xs text-stone-400 mb-3">{t.restoreNote}</p>
            {restoreError && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                ⚠️ {restoreError}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setConfirmRestore(null)} disabled={isRestoring}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-40">
                {t.back}
              </button>
              <button onClick={() => restoreBooking()} disabled={isRestoring}
                className="flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60"
                style={{ background: "#f97316" }}>
                {isRestoring ? t.restoring : t.restoreActionBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Conflict modal: slot already taken, suggest reschedule ── */}
      {conflictInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-stone-800">{t.conflictTitle}</h3>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4 text-sm text-red-700">
              <p className="font-semibold mb-1">{t.conflictTaken}</p>
              <p>👤 {conflictInfo.conflictWith.name}</p>
              <p>📅 {conflictInfo.conflictWith.date} · {conflictInfo.conflictWith.time}</p>
            </div>
            <p className="text-sm text-stone-600 mb-3">
              {t.conflictPickOther} <strong>{conflictInfo.name}</strong>:
            </p>
            <div className="flex flex-col gap-2 mb-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">{t.fieldNewDate}</label>
                <select
                  value={rescheduleDate}
                  onChange={e => setRescheduleDate(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
                  {getNextBusinessDays(14).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">{t.fieldNewTime}</label>
                <select
                  value={rescheduleTime}
                  onChange={e => setRescheduleTime(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
                  {TIME_SLOTS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConflictInfo(null)} disabled={isRestoring}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-40">
                {t.cancel}
              </button>
              <button
                onClick={() => restoreBooking(rescheduleDate, rescheduleTime)} disabled={isRestoring}
                className="flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60"
                style={{ background: "#f97316" }}>
                {isRestoring ? t.restoring : t.restoreActionBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reschedule active booking modal ── */}
      {confirmReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-stone-800">{t.rescheduleBtn}</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1">{t.clientLabel} <strong>{confirmReschedule.name}</strong></p>
            <p className="text-sm text-stone-500 mb-3 line-through text-xs">
              {confirmReschedule.date} · {confirmReschedule.time}
            </p>

            {rsConflict && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                <p className="font-semibold mb-0.5">⚠️ {t.conflictTaken}</p>
                <p>👤 {rsConflict.name} · {rsConflict.date} · {rsConflict.time}</p>
                <p className="mt-1 text-red-600">{t.errSlotTaken}</p>
              </div>
            )}
            {rsError && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                ⚠️ {rsError}
              </div>
            )}

            <div className="flex flex-col gap-2 mb-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">{t.fieldNewDate}</label>
                <select value={rsDate} onChange={e => { setRsDate(e.target.value); setRsConflict(null); }}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
                  {getNextBusinessDays(14).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">{t.fieldNewTime}</label>
                <select value={rsTime} onChange={e => { setRsTime(e.target.value); setRsConflict(null); }}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setConfirmReschedule(null)} disabled={isRescheduling}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-40">
                {t.cancel}
              </button>
              <button onClick={() => rescheduleBooking()} disabled={isRescheduling}
                className="flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60"
                style={{ background: ACCENT }}>
                {isRescheduling ? t.loading : `📅 ${t.rescheduleBtn}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit booking modal ── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-1">
              <Pencil className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-stone-800">{t.editBookingTitle}</h3>
            </div>
            <p className="text-xs text-stone-400 mb-4">ID: {editTarget.id.slice(0, 8).toUpperCase()} · {t.labelStatus} {editTarget.status}</p>
            {editTarget.client_lang && (
              <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                <span className="text-xs font-semibold text-blue-700">{t.clientLangLabel}</span>
                <span className="text-xs font-bold uppercase tracking-wide text-blue-900">
                  {editTarget.client_lang === "es" ? t.clientLangEs : editTarget.client_lang === "en" ? t.clientLangEn : editTarget.client_lang}
                </span>
              </div>
            )}
            <div className="space-y-3">
              <AdminInput label={t.clientNameReq} value={eName} onChange={setEName} placeholder="John Smith" />
              <AdminInput label={t.phoneReq} value={ePhone} onChange={setEPhone} placeholder="(346) 000-0000" type="tel" />
              <AdminInput label={t.emailClient} value={eEmail} onChange={setEEmail} placeholder="client@email.com" type="email" />
              <AdminInput label={t.addressOptional} value={eAddr} onChange={setEAddr} placeholder="123 Main St, Houston TX" />
              <AdminInput label={t.applianceOptional} value={eAppl} onChange={setEAppl} placeholder="Washer, Dryer, Fridge…" />
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">{t.dateReq}</label>
                <input type="text" value={eDate} onChange={e => setEDate(e.target.value)} placeholder="Apr 25, 2026"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
                <p className="text-[10px] text-stone-400 mt-0.5">{t.dateFormatHint}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">{t.timeReq}</label>
                <select value={eTime} onChange={e => setETime(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">{t.noteOptional}</label>
                <textarea value={eNote} onChange={e => setENote(e.target.value)} rows={2} placeholder={t.notePlaceholder}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" />
              </div>
            </div>
            {eError && <p className="text-xs text-red-500 mt-2">{eError}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditTarget(null)}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition">
                {t.cancel}
              </button>
              <button onClick={handleEdit} disabled={eSaving}
                className="flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50"
                style={{ background: "#7c3aed" }}>
                {eSaving ? t.savingDots : t.saveEdits}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manual booking modal ── */}
      {manualSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-1">
              <PlusCircle className="w-5 h-5" style={{ color: ACCENT }} />
              <h3 className="font-bold text-stone-800">{t.createBookingTitle}</h3>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              {dateStr} · <strong>{manualSlot}</strong>
            </p>
            <div className="space-y-3">
              <AdminInput label={t.clientNameReq} value={mName} onChange={setMName} placeholder="John Smith" />
              <AdminInput label={t.phoneReq} value={mPhone} onChange={setMPhone} placeholder="(346) 000-0000" type="tel" />
              <AdminInput label={t.emailClient} value={mEmail} onChange={setMEmail} placeholder="client@email.com" type="email" />
              <AdminInput label={t.addressOptional} value={mAddr} onChange={setMAddr} placeholder="123 Main St, Houston, TX" />
              <AdminInput label={t.zipOptional} value={mZip} onChange={setMZip} placeholder="77001" />
              <AdminInput label={t.applianceOptional} value={mAppl} onChange={setMAppl} placeholder={t.appliancePlaceholderRu} />
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">{t.noteOptional}</label>
                <textarea value={mNote} onChange={e => setMNote(e.target.value)} placeholder={t.addlInfoPlaceholder}
                  rows={2}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                  style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
              </div>
            </div>
            {mError && <p className="text-xs text-red-500 mt-2">{mError}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={closeManualModal}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition">
                {t.cancel}
              </button>
              <button onClick={createManualBooking} disabled={mSaving}
                className="flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60"
                style={{ background: ACCENT }}>
                {mSaving ? t.savingBook : t.bookBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Copyright notice (top) ── */}
      <div className="bg-stone-50 border-b border-stone-200 px-4 py-2 text-center space-y-0.5">
        <p className="text-[10px] leading-snug text-gray-500 max-w-3xl mx-auto">
          All rights to the source code of this CRM system, including its development, architecture and software implementation, belong to Eivaz Rakhmanov and are protected as intellectual property.
        </p>
        <p className="text-[10px] leading-snug text-gray-500 max-w-3xl mx-auto">
          Все права на исходный код CRM-системы, включая разработку, архитектуру и программную реализацию проекта, принадлежат Эйвазу Рахманову и охраняются как объект интеллектуальной собственности.
        </p>
      </div>

      {/* ── Header (sticky) ── */}
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
        {/* ── Mobile header: compact 1-row ── */}
        <div className="flex md:hidden items-center gap-2 px-3 h-14">
          <img src="/htr-logo-nobg.png" alt="HTR" style={{ width: 80, height: 54, borderRadius: 8, objectFit: "contain", flexShrink: 0 }} />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-stone-800 text-sm leading-tight truncate">HTRGroupTX Admin</div>
            {fidLabel ? (
              <div className="text-xs leading-tight truncate flex items-center gap-1" style={{ color: ACCENT }}>
                <Fingerprint className="w-3 h-3 flex-none" />
                <span className="truncate">{t.loggedFid} {fidLabel}</span>
              </div>
            ) : pin ? (
              <div className="text-xs leading-tight truncate flex items-center gap-1 text-stone-500">
                <Lock className="w-3 h-3 flex-none" />
                <span className="truncate">{t.loggedPin}</span>
              </div>
            ) : (
              <div className="text-xs text-stone-400 leading-tight truncate">{t.schedule}</div>
            )}
          </div>
          <div className="flex items-center gap-1 flex-none">
            <a
              href="/employee"
              target="_blank"
              rel="noreferrer"
              className="md:hidden flex-none flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-[10px] font-bold leading-tight"
              title={lang === "ru" ? "Портал сотрудника" : "Employee Portal"}
            >
              <Wrench className="w-4 h-4" />
              <span>{lang === "ru" ? "Портал" : "Portal"}</span>
            </a>
            <a href="/pay" target="_blank" rel="noreferrer" className="md:hidden flex-none flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold leading-tight" title={t.pay ?? "Pay"}>
              <ShieldCheck className="w-4 h-4" />
              <span>{t.pay ?? "Pay"}</span>
            </a>
            <button
              onClick={() => setLang(lang === "ru" ? "en" : "ru")}
              className="px-2 py-1 rounded-md text-xs font-bold border border-stone-200 hover:bg-stone-50 transition flex items-center gap-0.5">
              <span style={{ color: lang === "ru" ? ACCENT : "#a8a29e" }}>RU</span>
              <span className="text-stone-300 font-normal">|</span>
              <span style={{ color: lang === "en" ? ACCENT : "#a8a29e" }}>EN</span>
            </button>
            <button onClick={logout} className="flex items-center gap-1 text-xs text-stone-500 hover:text-red-500 transition px-2 py-1.5 rounded-lg hover:bg-red-50">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Desktop header: full 3-column ── */}
        <div className="hidden md:grid px-4 h-14 items-center" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
          <div className="flex items-center gap-2">
            <img src="/htr-logo-nobg.png" alt="HTR" style={{ width: 80, height: 54, borderRadius: 8, objectFit: "contain" }} />
            <div>
              <div className="font-bold text-stone-800 leading-tight">{t.schedule}</div>
              {fidLabel ? (
                <div className="text-xs leading-tight flex items-center gap-1" style={{ color: ACCENT }}>
                  <Fingerprint className="w-3 h-3 flex-none" />
                  <span>{t.loggedFid} {fidLabel}</span>
                </div>
              ) : pin ? (
                <div className="text-xs leading-tight flex items-center gap-1 text-stone-500">
                  <Lock className="w-3 h-3 flex-none" />
                  <span>{t.loggedPin}</span>
                </div>
              ) : (
                <div className="text-xs text-stone-400 leading-tight">HTRGroupTX</div>
              )}
            </div>
          </div>
          <div className="text-center px-3">
            <div className="text-xs font-semibold leading-tight" style={{ color: "#dc2626" }}>Database developed by Eivaz Rakhmanov 2026</div>
            <div className="text-xs font-semibold leading-tight" style={{ color: "#16a34a" }}>База данных разработана Эйвазом Рахмановым в 2026 году</div>
          </div>
          <div className="flex justify-end items-center gap-2">
            <a
              href="/employee"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition"
              title="Открыть портал сотрудника"
            >
              <Wrench className="w-3.5 h-3.5" />
              {lang === "ru" ? "Портал сотрудника" : "Employee Portal"}
            </a>
            <a href="/pay" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition" title={t.pay ?? "Pay"}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.pay ?? "Pay"}
            </a>
            <button
              onClick={() => setLang(lang === "ru" ? "en" : "ru")}
              className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold hover:bg-stone-50 transition flex items-center gap-0.5">
              <span style={{ color: lang === "ru" ? ACCENT : "#a8a29e" }}>RU</span>
              <span className="text-stone-300 font-normal mx-0.5">|</span>
              <span style={{ color: lang === "en" ? ACCENT : "#a8a29e" }}>EN</span>
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-red-500 transition">
              <LogOut className="w-4 h-4" />{t.logout}
            </button>
          </div>
        </div>
      </header>

      {/* ── CRM top-level tab bar ── */}
      <div className="sticky top-14 z-20 bg-white border-b border-stone-200 shadow-sm overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <div className="flex min-w-max">
          {([
            { key: "bookings",   icon: <Calendar className="w-3.5 h-3.5" />,  label: t.tabBookings   },
            { key: "calendar",   icon: <CalendarDays className="w-3.5 h-3.5" />, label: t.tabCalendar },
            { key: "jobsArchive", icon: <Archive className="w-3.5 h-3.5" />, label: t.tabJobsArchive, count: historyBookings.length || undefined },
            { key: "employees",  icon: <Users className="w-3.5 h-3.5" />,     label: t.tabEmployees  },
            { key: "archive",    icon: <ArchiveRestore className="w-3.5 h-3.5" />, label: t.tabArchive },
            { key: "blacklist",  icon: <ShieldOff className="w-3.5 h-3.5" />, label: t.tabBlacklist  },
            { key: "payroll",    icon: <span className="text-sm">💰</span>,   label: t.tabPayroll    },
            { key: "reports",    icon: <BarChart3 className="w-3.5 h-3.5" />, label: t.tabReports    },
            { key: "pricebook",  icon: <span className="text-sm">🏷️</span>,   label: t.tabPricebook ?? "Прайс-лист" },
            { key: "photos", icon: <Camera className="w-3.5 h-3.5" />, label: t.tabPhotos ?? "Фото" },
            { key: "settings",   icon: <Settings className="w-3.5 h-3.5" />,  label: t.tabSettings   },
            { key: "trash",      icon: <Trash2 className="w-3.5 h-3.5" />,    label: t.tabTrash, count: trashCount },
          ] as { key: "bookings"|"calendar"|"jobsArchive"|"employees"|"archive"|"blacklist"|"payroll"|"reports"|"settings"|"trash"|"pricebook"|"photos"; icon: React.ReactNode; label: string; count?: number }[]).map(({ key, icon, label, count }) => (
            <button
              key={key}
              onClick={() => setAdminTab(key)}
              className={`flex items-center gap-1.5 px-4 md:px-5 py-2.5 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                adminTab === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}>
              {icon}{label}
              {count != null && count > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mobile slots/bookings sub-tab bar (only on "bookings" CRM tab) ── */}
      {adminTab === "bookings" && (
        <div className="md:hidden sticky top-24 z-10 flex border-b border-stone-200 bg-white shadow-sm">
          <button onClick={() => setMobileTab("slots")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition ${mobileTab === "slots" ? "border-blue-600 text-blue-600" : "border-transparent text-stone-400"}`}>
            {t.slotsTab}
          </button>
          <button onClick={() => setMobileTab("bookings")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition ${mobileTab === "bookings" ? "border-blue-600 text-blue-600" : "border-transparent text-stone-400"}`}>
            📋 {t.tabBookings} ({activeBookings.length})
          </button>
        </div>
      )}

      {/* ── Non-bookings CRM tabs ── */}
      {adminTab === "employees" && <EmployeesTab apiBase={API()} adminAuthH={adminAuthH} />}
      {adminTab === "calendar" && (
        <CalendarTab
          apiBase={API()}
          authHeaders={adminAuthH}
          mode="admin"
          locale={lang === "ru" ? "ru-RU" : "en-US"}
          labels={{
            title: t.calTitle,
            week: t.calWeek,
            month: t.calMonth,
            year: t.calYear,
            today: t.calToday,
            refresh: t.refresh,
            allEmployees: t.calAllEmployees,
            noEvents: t.calNoEvents,
            loading: t.calLoading,
            dragHint: t.calDragHint,
            serialNumber: t.calSerial,
            technician: t.calTechnician,
            statusCompleted: t.statusCompleted,
            statusApproved: t.statusApproved,
            statusPending: t.statusPending,
            overdue: t.calOverdue,
            rescheduleOk: t.calRescheduleOk,
            rescheduleErr: t.calRescheduleErr,
            bizAll: t.calBizAll,
            bizAppliance: t.calBizAppliance,
            bizDental: t.calBizDental,
            tapHint: t.calTapHint,
            moveJob: t.calMoveJob,
            pickTime: t.calPickTime,
            openCrm: t.calOpenCrm,
          }}
          onOpenBooking={(id) => {
            const b = allBookings.find(x => x.id === id);
            const closed = !!b && (b.status === "completed" || b.status === "cancelled");
            setBookingFromCalendar(true);
            setAdminTab(closed ? "jobsArchive" : "bookings");
            setSearchQuery(id);
            setHighlightBookingId(id);
            setShowCompleted(false);
            setEmpFilter("");
            setMobileTab("bookings");
          }}
        />
      )}
      {adminTab === "archive"   && <ArchiveTab   apiBase={API()} adminAuthH={adminAuthH} />}
      {adminTab === "blacklist" && <BlacklistTab  apiBase={API()} adminAuthH={adminAuthH} />}
      {adminTab === "payroll"   && <PayrollTab    apiBase={API()} adminAuthH={adminAuthH} />}
      {adminTab === "reports"   && <ReportsTab    apiBase={API()} adminAuthH={adminAuthH} onOpenBooking={id => {
        const b = allBookings.find(x => x.id === id);
        const closed = !!b && (b.status === "completed" || b.status === "cancelled");
        setAdminTab(closed ? "jobsArchive" : "bookings");
        setSearchQuery(id);
        setHighlightBookingId(id);
        setShowCompleted(false);
        setEmpFilter("");
        setMobileTab("bookings");
      }} />}
      {adminTab === "pricebook" && <PricebookTab  apiBase={API()} adminAuthH={adminAuthH} />}
      {adminTab === "settings" && (
        <div className="space-y-6 pb-8">
          <SettingsTab apiBase={API()} adminAuthH={adminAuthH} />
          <div className="max-w-2xl mx-auto px-4 space-y-4">
            {ADMIN_SITE_CONFIG.visitFeeSites.map(site => (
              <VisitFeeSettings key={site} apiBase={API()} adminAuthH={adminAuthH} site={site} />
            ))}
          </div>
        </div>
      )}
      {adminTab === "trash"     && <TrashTab      apiBase={API()} adminAuthH={adminAuthH} onCountChange={setTrashCount} />}
      {adminTab === "photos" && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full min-h-[calc(100dvh-7rem)]" style={{ paddingBottom: "max(5rem, env(safe-area-inset-bottom))" }}>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-stone-100">
            <h2 className="text-base font-bold text-stone-800 mb-1 flex items-center gap-2">
              <Camera className="w-5 h-5" style={{ color: ACCENT }} />
              {t.tabPhotos ?? "Фото"}
            </h2>
            <GalleryPhotoManager adminPin={pin} adminBearer={adminBearer} defaultSite={ADMIN_SITE_CONFIG.defaultGallerySite} />
          </div>
        </div>
      )}

      {/* ── Two-panel layout (desktop) / Tab content (mobile) — bookings tab only ── */}
      <div className={`flex gap-0 md:overflow-hidden md:h-[calc(100vh-96px)] ${adminTab !== "bookings" && adminTab !== "jobsArchive" ? "hidden" : ""}`}>

        {/* ═══ LEFT PANEL / Слоты tab ═══ */}
        {adminTab === "bookings" && (
        <div className={`overflow-y-auto border-r border-stone-200 p-4 space-y-4 ${mobileTab !== "slots" ? "hidden md:block" : "block"} md:w-[300px] md:flex-none`}
          style={{ background: PAGE_BG, paddingBottom: 80 }}>

          {/* Date selector */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-stone-600 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {t.selectDate}
            </h2>
            <div className="flex flex-col gap-2">
              <select value={month}
                onChange={e => { const m = +e.target.value; setMonth(m); if (day > new Date(year, m, 0).getDate()) setDay(1); }}
                className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 w-full"
                style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
                {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
              <div className="flex gap-2">
                <select value={day} onChange={e => setDay(+e.target.value)}
                  className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 flex-1"
                  style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
                  {Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i+1).map(d =>
                    <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={year} onChange={e => setYear(+e.target.value)}
                  className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 flex-1"
                  style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
                  {[new Date().getFullYear(), new Date().getFullYear()+1].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <button onClick={() => { loadSlots(); loadSchedule(); }} disabled={loading}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition w-full"
                style={{ background: ACCENT, opacity: loading ? 0.7 : 1 }}>
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />{t.refresh}
              </button>
            </div>
            <p className="text-xs text-stone-400 mt-2">{t.dateLabel} <strong className="text-stone-600">{dateStr}</strong></p>
          </div>

          {/* Slot grid */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-stone-600 mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {t.slotsFor} {dateStr}
            </h2>
            <div className="flex flex-wrap gap-2 text-xs text-stone-500 mb-3">
              <span>{t.slotFreeLabel}</span>
              <span>{t.slotBlockedLabel}</span>
              <span>{t.slotTakenLabel}</span>
            </div>

            {/* Block reason */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-stone-500 mb-1 block">{t.blockReasonLabel}</label>
              <input type="text" value={reason} onChange={e => setReason(e.target.value)}
                placeholder={t.blockReasonPlaceholder}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map(slot => {
                const detail   = bookedDetails.find(b => b.time === slot);
                const blocked  = blockedSlots.find(b => b.time === slot);
                const busy     = actionSlot === slot;

                /* 🔴 Booked by client */
                if (detail) return (
                  <div key={slot} className="rounded-lg border-2 p-2" style={{ borderColor: "#dc2626", background: "#fef2f2" }}>
                    <div className="text-xs font-bold text-red-600">{slot}</div>
                    <div className="text-[10px] text-red-500 mt-0.5 truncate" title={detail.name}>👤 {detail.name}</div>
                    <div className="text-[10px] text-red-400">
                      {detail.status === "approved" ? t.slotApproved : t.slotWaiting}
                    </div>
                    <button onClick={() => setConfirmCancel({ id: detail.id, name: detail.name, time: slot })}
                      disabled={busy}
                      className="mt-1 w-full flex items-center justify-center gap-1 text-[10px] font-semibold py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50">
                      <XCircle className="w-3 h-3" />{busy ? "…" : t.slotFreeBtn}
                    </button>
                  </div>
                );

                /* 🟠 Blocked by admin */
                if (blocked) return (
                  <div key={slot} className="rounded-lg border-2 p-2" style={{ borderColor: "#f97316", background: "#fff7ed" }}>
                    <div className="text-xs font-bold text-orange-600">{slot}</div>
                    <div className="text-[10px] text-orange-500 mt-0.5 truncate" title={blocked.reason}>
                      {blocked.reason ? `📝 ${blocked.reason}` : t.slotBlocked}
                    </div>
                    <button onClick={() => unblockSlot(slot)} disabled={busy}
                      className="mt-1 w-full flex items-center justify-center gap-1 text-[10px] font-semibold py-1 rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 transition disabled:opacity-50">
                      <Unlock className="w-3 h-3" />{busy ? "…" : t.slotUnblock}
                    </button>
                  </div>
                );

                /* 🟡 2-hour buffer */
                const isBuffer = bufferSlots.includes(slot);
                if (isBuffer) return (
                  <div key={slot} className="rounded-lg border-2 p-2" style={{ borderColor: "#d97706", background: "#fffbeb" }}>
                    <div className="text-xs font-bold text-amber-600">{slot}</div>
                    <div className="text-[10px] text-amber-500 mt-0.5">⏱ 2h buffer</div>
                    <div className="text-[9px] text-amber-400 mt-0.5 leading-tight">{lang === "ru" ? "Мин. 2 ч между заказами" : "Min. 2h between orders"}</div>
                  </div>
                );

                /* 🟢 Free */
                return (
                  <div key={slot} className="rounded-lg border-2 p-2" style={{ borderColor: "#16a34a", background: "#f0fdf4" }}>
                    <div className="text-xs font-bold text-green-700">{slot}</div>
                    <div className="text-[10px] text-green-500 mt-0.5">{t.slotFreeLabel}</div>
                    <div className="flex gap-1 mt-1">
                      <button onClick={() => blockSlot(slot)} disabled={busy}
                        className="flex-1 flex items-center justify-center gap-0.5 text-[10px] font-semibold py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition disabled:opacity-50">
                        <Lock className="w-2.5 h-2.5" />{busy ? "…" : t.slotBlockBtn}
                      </button>
                      <button onClick={() => openManual(slot)} disabled={busy}
                        className="flex-1 flex items-center justify-center gap-0.5 text-[10px] font-semibold py-1 rounded-md text-white transition disabled:opacity-50"
                        style={{ background: ACCENT }}>
                        <PlusCircle className="w-2.5 h-2.5" />{t.slotBookBtn}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}

        {/* ═══ RIGHT PANEL / Заявки tab ═══ */}
        <div className={`overflow-y-auto p-4 ${adminTab === "jobsArchive" ? "block" : mobileTab !== "bookings" ? "hidden md:block" : "block"} flex-1`}>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
          {bookingFromCalendar && (adminTab === "bookings" || adminTab === "jobsArchive") && (
            <button
              type="button"
              onClick={() => {
                setAdminTab("calendar");
                setSearchQuery("");
                setHighlightBookingId(null);
                setBookingFromCalendar(false);
              }}
              className="mb-3 w-full min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg border-2 text-sm font-semibold touch-manipulation"
              style={{ borderColor: ACCENT, color: ACCENT, background: "#eff6ff" }}
            >
              <ChevronLeft className="w-4 h-4" />
              {t.calBackToCalendar}
            </button>
          )}
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <h2 className="text-sm font-bold text-stone-600 flex items-center gap-1.5">
              <Wrench className="w-4 h-4" />
              {isJobsArchiveTab ? t.jobsArchiveTitle : t.activeOrders} ({listBookings.length})
            </h2>
            {isJobsArchiveTab && (
              <span className="text-[11px] text-stone-400">{t.restoreBtn2}</span>
            )}
          </div>
          {/* ── Business category filter ── */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <label className="text-xs font-semibold text-stone-500 whitespace-nowrap">{t.filterCategory}:</label>
            <div className="flex rounded-lg border border-stone-200 overflow-x-auto max-w-full text-[11px] font-semibold">
              <button onClick={() => setBizFilter("all")}
                className={`px-3 py-1.5 shrink-0 transition ${bizFilter === "all" ? "bg-blue-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}>
                {t.filterAll}
              </button>
              <button onClick={() => setBizFilter("appliance")}
                className={`px-3 py-1.5 shrink-0 border-l border-stone-200 transition ${bizFilter === "appliance" ? "bg-blue-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}>
                {t.filterAppliance}
              </button>
              <button onClick={() => setBizFilter("dental")}
                className={`px-3 py-1.5 shrink-0 border-l border-stone-200 transition ${bizFilter === "dental" ? "bg-violet-100 text-violet-800" : "bg-white text-stone-500 hover:bg-stone-50"}`}>
                {t.filterDental}
              </button>
            </div>
          </div>
          {/* ── Employee filter ── */}
          {employees.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <label className="text-xs font-semibold text-stone-500 whitespace-nowrap">{t.filterEmployee}:</label>
              <select
                value={empFilter}
                onChange={e => setEmpFilter(e.target.value)}
                className="flex-1 border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                <option value="">{t.allEmployees}</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              {empFilter && (
                <button onClick={() => setEmpFilter("")} className="text-xs text-stone-400 hover:text-stone-600 transition">✕</button>
              )}
            </div>
          )}

          {/* ── Search bar ── */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                title={t.clearSearch}>
                ✕
              </button>
            )}
          </div>
          {searchQuery.trim() && (
            <p className="text-[11px] text-stone-400 mb-2 -mt-1">
              {t.found} <strong className="text-stone-600">{filteredBookings.length}</strong> {t.of} {listBookings.length}
            </p>
          )}

          {/* ── Multi-select toolbar ── */}
          {filteredBookings.length > 0 && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <button
                onClick={allSelected ? deselectAll : selectAll}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition"
                style={allSelected
                  ? { borderColor: "#1B6FE8", background: "#EFF6FF", color: "#1B6FE8" }
                  : { borderColor: "#e2e8f0", background: "#fff", color: "#57534e" }
                }>
                <input
                  type="checkbox" readOnly checked={allSelected}
                  className="w-3.5 h-3.5 accent-blue-600 pointer-events-none"
                />
                {allSelected ? t.deselectAll : t.selectAll}
              </button>

              {selectedIds.size > 0 && (
                <>
                  <span className="text-xs text-stone-500">{t.selected} <strong>{selectedIds.size}</strong></span>
                  <button
                    onClick={() => { setConfirmBulkDelete(true); setBulkDeleteError(null); }}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-700 text-white hover:bg-red-800 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                    {t.deleteSelected} ({selectedIds.size})
                  </button>
                  <button
                    onClick={deselectAll}
                    className="text-xs text-stone-400 hover:text-stone-600 transition px-1">
                    {t.deselect}
                  </button>
                </>
              )}
            </div>
          )}

          {apiError && (
            <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <div>
                <p className="font-semibold">{t.errorLoadTitle}</p>
                <p className="mt-0.5 text-red-600">{apiError}</p>
              </div>
            </div>
          )}
          {filteredBookings.length === 0 && !apiError ? (
            <p className="text-sm text-stone-400 py-4 text-center">
              {searchQuery.trim() ? t.nothingFound : isJobsArchiveTab ? t.noArchivedJobs : t.noOrders}
            </p>
          ) : filteredBookings.length > 0 && (<>
            {/* ── Mobile: card layout ── */}
            <div className="md:hidden space-y-3">
              {filteredBookings.map((b, idx) => {
                const isHistory = b.status === "completed" || b.status === "cancelled";
                const isWA = /AM–|PM–|AM-|PM-/.test(b.preferred_time ?? "");
                const { cls: statusCls, label: statusLabel } = statusInfo(b.status);
                const createdStr = b.created_at ? new Date(b.created_at).toLocaleDateString(t.dateLocale, { day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "America/Chicago" }) : null;
                // Show separator before first history item
                const prevIsActive = idx > 0 && (filteredBookings[idx - 1].status === "pending" || filteredBookings[idx - 1].status === "approved");
                const showSeparator = !isJobsArchiveTab && showCompleted && isHistory && (idx === 0 || prevIsActive);
                return (
                  <React.Fragment key={b.id}>
                    {showSeparator && (
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex-1 h-px bg-stone-200" />
                        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">{t.historyLabel}</span>
                        <div className="flex-1 h-px bg-stone-200" />
                      </div>
                    )}
                    <div
                      id={`booking-row-m-${b.id}`}
                      className={`border rounded-xl p-3 transition ${highlightBookingId === b.id ? "ring-2 ring-amber-400 border-amber-300 bg-amber-50" : selectedIds.has(b.id) ? "ring-2 ring-blue-400 border-blue-300 bg-blue-50" : isHistory ? "border-stone-100 bg-stone-50 opacity-60" : "border-stone-200 bg-white"}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(b.id)}
                            onChange={() => toggleSelect(b.id)}
                            className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
                          />
                          <div>
                            <div className="text-xs font-bold text-stone-700">{b.preferred_date}</div>
                            <div className="text-xs text-stone-500 flex items-center gap-1">
                              {b.preferred_time}
                              {isWA && <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700">WA</span>}
                            </div>
                            {createdStr && <div className="text-[10px] text-stone-400 mt-0.5">{t.createdLabel} {createdStr}</div>}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCls}`}>{statusLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <User className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-stone-800">{b.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ${resolveBookingBiz(b.business_type) === "dental" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                          {resolveBookingBiz(b.business_type) === "dental" ? t.bizDental : t.bizAppliance}
                        </span>
                        <MoveBizButton b={b} />
                        {b.is_remote && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-100 text-stone-500 leading-none" title={t.remoteBookingHint}>👁</span>
                        )}
                        {b.client_lang && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-700 leading-none uppercase"
                            title={b.client_lang === "es" ? t.clientLangEs : b.client_lang === "en" ? t.clientLangEn : b.client_lang}>
                            {b.client_lang}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ACCENT }} />
                        <a href={`tel:${b.phone}`} className="text-sm font-medium" style={{ color: ACCENT }}>{b.phone}</a>
                        {b.phone && (
                          genderPickerId === b.id ? (
                            <div className="flex items-center gap-1 ml-0.5">
                              <button
                                onClick={() => { void handleCallback(b.phone!, b.id, b.name, b.client_lang ?? "en", "male"); setGenderPickerId(null); }}
                                title="Клиент — мужчина"
                                className="text-xs px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold leading-none"
                              >♂</button>
                              <button
                                onClick={() => { void handleCallback(b.phone!, b.id, b.name, b.client_lang ?? "en", "female"); setGenderPickerId(null); }}
                                title="Клиент — женщина"
                                className="text-xs px-1.5 py-0.5 rounded bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold leading-none"
                              >♀</button>
                              <button
                                onClick={() => setGenderPickerId(null)}
                                className="text-[10px] text-stone-400 hover:text-stone-600 leading-none px-0.5"
                              >✕</button>
                            </div>
                          ) : (
                          <button
                            onClick={() => setGenderPickerId(b.id)}
                            disabled={callbackLoading.has(b.id)}
                            title="Перезвонить клиенту — выберите пол"
                            className="ml-0.5 p-0.5 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
                          >
                            <PhoneOutgoing className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                          </button>
                          )
                        )}
                        {b.status === "completed" && b.phone && (
                          <button
                            onClick={() => void handleSendReview(b.id)}
                            disabled={reviewLoading.has(b.id)}
                            title="Отправить ссылку на Google Review клиенту по SMS"
                            className="ml-0.5 p-0.5 rounded hover:bg-yellow-50 transition-colors disabled:opacity-50"
                          >
                            <Star className="w-3.5 h-3.5" style={{ color: reviewLoading.has(b.id) ? "#aaa" : "#f59e0b" }} />
                          </button>
                        )}
                      </div>
                      {b.email && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Mail className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <a href={`mailto:${b.email}`} className="text-xs text-stone-500 hover:text-blue-600 transition truncate max-w-[220px]">{b.email}</a>
                        </div>
                      )}
                      {b.address && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <span className="text-xs text-stone-500">{b.address}</span>
                        </div>
                      )}
                      {b.appliance && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Wrench className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <span className="text-xs text-stone-600">{b.appliance}</span>
                        </div>
                      )}
                      {(b.status === "pending" || b.status === "approved") && !b.is_remote && (
                        <div className="flex flex-col gap-1.5 mt-1">
                          {/* CRM: employee assignment dropdown */}
                          {employees.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-stone-400 flex-none" />
                              <select
                                value={b.assigned_employee_id ?? ""}
                                onChange={e => assignEmployee(b.id, e.target.value || null)}
                                className="flex-1 border border-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white">
                                <option value="">{t.notAssigned}</option>
                                {employees.map(e => (
                                  <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          {b.status === "pending" && (
                            <button onClick={() => approveBooking(b.id)}
                              className="w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition border border-green-100">
                              <ThumbsUp className="w-3.5 h-3.5" /> {t.approveBtn}
                            </button>
                          )}
                          <button
                            onClick={() => { setStripeModal({ id: b.id, name: b.name, amount: String(b.payment_amount ?? "") }); setStripeLink(null); setStripeErr(null); }}
                            className="w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition border border-indigo-100">
                            💳 {t.stripePayLink}
                          </button>
                          {adminEstimateHistory[b.id] && (
                            <div className="flex flex-col gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-blue-500">📋</span>
                                  <span className="text-slate-500">{t.estimateSentBadge}:</span>
                                  <span className="font-bold text-blue-700">${Number(adminEstimateHistory[b.id]!.total).toFixed(2)}</span>
                                </div>
                                <button
                                  onClick={() => openAdminEstimate({ id: b.id, name: b.name, email: b.email ?? "", phone: b.phone ?? "" }, adminEstimateHistory[b.id]!)}
                                  className="font-bold text-blue-700 border border-blue-300 rounded px-2 py-0.5 hover:bg-blue-100 transition">
                                  {t.estimateEditBtn}
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => void viewEstimate(b, adminEstimateHistory[b.id]!.id)}
                                  className="flex-1 font-bold text-blue-700 border border-blue-300 rounded px-2 py-1 hover:bg-blue-100 transition">
                                  {t.estimateViewBtn}
                                </button>
                                <button
                                  disabled={downloadingEstimateId === b.id}
                                  onClick={() => void downloadEstimate(b, adminEstimateHistory[b.id]!.id)}
                                  className="flex-1 font-bold text-blue-700 border border-blue-300 rounded px-2 py-1 hover:bg-blue-100 transition disabled:opacity-50">
                                  {downloadingEstimateId === b.id ? t.downloadReceiptDownloading : t.estimateDownloadBtn}
                                </button>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => openAdminEstimate({ id: b.id, name: b.name, email: b.email ?? "", phone: b.phone ?? "" })}
                            className="w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition border border-teal-100">
                            📋 {t.estimateBtn}
                          </button>
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal(b)}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition border border-violet-100">
                              <Pencil className="w-3.5 h-3.5" /> {t.editBtn}
                            </button>
                            <button onClick={() => setConfirmComplete({ id: b.id, name: b.name })}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-100"
                              title={t.titleComplete}>
                              <CheckCircle2 className="w-3.5 h-3.5" /> {t.completeBtn}
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => openReschedule(b)}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-100">
                              <CalendarDays className="w-3.5 h-3.5" /> {t.rescheduleBtn}
                            </button>
                            <button onClick={() => setConfirmCancel({ id: b.id, name: b.name, time: b.preferred_time })}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-100">
                              <XCircle className="w-3.5 h-3.5" /> {t.cancelBtn}
                            </button>
                          </div>
                          <button onClick={() => setConfirmDelete({ id: b.id, name: b.name })}
                            className="w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition border border-amber-200"
                            title={t.moveToTrashTitle}>
                            <Trash2 className="w-3.5 h-3.5" /> {t.moveToTrashBtn}
                          </button>
                        </div>
                      )}
                      {(b.status === "cancelled" || b.status === "completed") && (
                        <div className="mt-1 space-y-1.5">
                          {/* CRM: payment info on completed bookings */}
                          {b.status === "completed" && (b.payment_method || b.payment_amount != null || b.payment_status) && (
                            <div className="flex items-center gap-2 text-[10px] text-stone-500 bg-green-50 rounded-lg px-2 py-1 border border-green-100">
                              {b.payment_amount != null && <span className="font-bold text-green-700">${b.payment_amount}</span>}
                              {b.payment_status === "paid" && <span className="font-bold text-green-700">{t.payStatusPaid}</span>}
                              {b.payment_status === "unpaid" && <span className="font-bold text-red-600">{t.payStatusUnpaid}</span>}
                              {b.payment_status === "pending" && <span className="font-bold text-amber-600">{t.payStatusPending}</span>}
                              {b.payment_status === "cash" && <span className="font-bold text-stone-600">{t.payStatusCash}</span>}
                            </div>
                          )}
                          {b.status === "completed" && b.client_signed_at && (
                            <div className="flex items-center gap-1 text-[10px] text-purple-700 font-semibold bg-purple-50 rounded-lg px-2 py-1 border border-purple-100">
                              ✍️ {t.clientSigned}
                            </div>
                          )}
                          {adminEstimateHistory[b.id] && (
                            <div className="flex flex-col gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-blue-500">📋</span>
                                  <span className="text-slate-500">{t.estimateSentBadge}:</span>
                                  <span className="font-bold text-blue-700">${Number(adminEstimateHistory[b.id]!.total).toFixed(2)}</span>
                                </div>
                                <button
                                  onClick={() => openAdminEstimate({ id: b.id, name: b.name, email: b.email ?? "", phone: b.phone ?? "" }, adminEstimateHistory[b.id]!)}
                                  className="font-bold text-blue-700 border border-blue-300 rounded px-2 py-0.5 hover:bg-blue-100 transition">
                                  {t.estimateEditBtn}
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => void viewEstimate(b, adminEstimateHistory[b.id]!.id)}
                                  className="flex-1 font-bold text-blue-700 border border-blue-300 rounded px-2 py-1 hover:bg-blue-100 transition">
                                  {t.estimateViewBtn}
                                </button>
                                <button
                                  disabled={downloadingEstimateId === b.id}
                                  onClick={() => void downloadEstimate(b, adminEstimateHistory[b.id]!.id)}
                                  className="flex-1 font-bold text-blue-700 border border-blue-300 rounded px-2 py-1 hover:bg-blue-100 transition disabled:opacity-50">
                                  {downloadingEstimateId === b.id ? t.downloadReceiptDownloading : t.estimateDownloadBtn}
                                </button>
                              </div>
                            </div>
                          )}
                          {/* Resend payment link if pending */}
                          {b.status === "completed" && b.payment_status === "pending" && (
                            <button
                              disabled={resendingId === b.id}
                              onClick={() => resendPaymentLink(b.id)}
                              className="w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition border border-amber-200 disabled:opacity-50">
                              📧 {resendSentId === b.id ? t.resendPaymentSent : resendingId === b.id ? t.resendPaymentSending : t.resendPaymentBtn}
                            </button>
                          )}
                          {/* Download receipt for paid bookings */}
                          {b.status === "completed" && (b.payment_status === "paid" || b.stripe_paid) && (
                            <button
                              disabled={downloadingReceiptId === b.id}
                              onClick={() => downloadReceipt(b)}
                              className="w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200 disabled:opacity-50">
                              <Download className="w-3.5 h-3.5" />
                              {downloadingReceiptId === b.id ? t.downloadReceiptDownloading : t.downloadReceiptBtn}
                            </button>
                          )}
                          {/* Resend receipt email (HTML + PDF) for paid bookings */}
                          {b.status === "completed" && (b.payment_status === "paid" || b.stripe_paid) && b.email && (
                            <>
                              <button
                                disabled={resendingReceiptId === b.id}
                                onClick={() => resendReceipt(b)}
                                className="w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200 disabled:opacity-50">
                                📧 {resendReceiptSentId === b.id ? t.resendReceiptSent : resendingReceiptId === b.id ? t.resendReceiptSending : t.resendReceiptBtn}
                              </button>
                              {(b.receipt_resend_count ?? 0) > 0 && (
                                <div className="text-[10px] text-stone-500 text-center">
                                  {t.receiptResentCount(b.receipt_resend_count ?? 0)}
                                  {b.receipt_last_resent_at && (
                                    <> · {t.receiptLastResentAt} {new Date(b.receipt_last_resent_at).toLocaleString(t.dateLocale, { dateStyle: "short", timeStyle: "short", timeZone: "America/Chicago" })}</>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                          {/* Receipt download history (audit log) */}
                          {b.status === "completed" && (b.payment_status === "paid" || b.stripe_paid) && (
                            <div className="rounded-lg border border-stone-200 bg-white">
                              <button
                                type="button"
                                onClick={() => toggleReceiptHistory(b.id)}
                                className="w-full flex items-center justify-between gap-2 px-2 py-1.5 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 rounded-lg"
                              >
                                <span className="flex items-center gap-1">
                                  📜 {receiptHistoryOpen.has(b.id) ? t.receiptHistoryToggleHide : t.receiptHistoryToggleShow}
                                  {receiptHistory[b.id] && receiptHistory[b.id].length > 0 && (
                                    <span className="inline-flex items-center justify-center min-w-[1.25rem] px-1 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold">
                                      {receiptHistory[b.id].length}
                                    </span>
                                  )}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${receiptHistoryOpen.has(b.id) ? "rotate-180" : ""}`} />
                              </button>
                              {receiptHistoryOpen.has(b.id) && (
                                <ReceiptHistoryPanel
                                  rows={receiptHistory[b.id]}
                                  loading={receiptHistoryLoading.has(b.id)}
                                  error={receiptHistoryError[b.id]}
                                  t={t}
                                  filters={getReceiptHistoryFilters(b.id)}
                                  onFiltersChange={next => updateReceiptHistoryFilters(b.id, next)}
                                  onExport={() => void exportReceiptHistory(b.id)}
                                  exporting={receiptHistoryExporting.has(b.id)}
                                />
                              )}
                            </div>
                          )}
                          {/* CRM: who was assigned */}
                          {b.assigned_employee_id && (
                            <div className="text-[10px] text-stone-400">
                              👤 {employees.find(e => e.id === b.assigned_employee_id)?.name ?? b.assigned_employee_id.slice(0, 8)}
                            </div>
                          )}
                          {/* Recall button — only for completed bookings with assigned employee */}
                          {b.status === "completed" && b.assigned_employee_id && (
                            <button
                              onClick={() => void recallBooking(b.id)}
                              className="w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition border border-purple-200">
                              <RefreshCw className="w-3.5 h-3.5" /> {t.recallBtn}
                            </button>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => openRestoreModal(b)}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all duration-150 hover:scale-105 border border-orange-100">
                              <RotateCcw className="w-3.5 h-3.5" /> {t.restoreBtn2}
                            </button>
                            <button onClick={() => setConfirmDelete({ id: b.id, name: b.name })}
                              className="flex items-center justify-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition border border-red-200">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                      {/* ── Photos & Signature section (mobile) ── */}
                      <div className="mt-1.5 rounded-lg border border-stone-200 bg-white">
                        <button
                          type="button"
                          onClick={() => toggleAdminPhotos(b.id)}
                          className="w-full flex items-center justify-between gap-2 px-2 py-1.5 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 rounded-lg"
                        >
                          <span className="flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5" />
                            {adminPhotosOpen.has(b.id) ? t.photosHide : t.photosShow}
                            {adminPhotosData[b.id] && adminPhotosData[b.id].length > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[1.25rem] px-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                                {adminPhotosData[b.id].length}
                              </span>
                            )}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${adminPhotosOpen.has(b.id) ? "rotate-180" : ""}`} />
                        </button>
                        {adminPhotosOpen.has(b.id) && (
                          <div className="px-2 pb-3 space-y-2">
                            {adminPhotosLoading.has(b.id) ? (
                              <p className="text-[10px] text-stone-400 italic px-1">{t.loading}</p>
                            ) : adminPhotosData[b.id]?.length === 0 ? (
                              <p className="text-[10px] text-stone-400 italic px-1">{t.photosEmpty}</p>
                            ) : (
                              <div className="grid grid-cols-3 gap-1.5 mt-1">
                                {adminPhotosData[b.id]?.map(ph => (
                                  ph.url ? (
                                    <a key={ph.id} href={ph.url} target="_blank" rel="noopener noreferrer"
                                      className="block aspect-square rounded-lg overflow-hidden border border-stone-200 hover:opacity-80 transition">
                                      <img src={ph.url} alt="" className="w-full h-full object-cover" />
                                    </a>
                                  ) : (
                                    <div key={ph.id} className="aspect-square rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center">
                                      <Camera className="w-4 h-4 text-stone-300" />
                                    </div>
                                  )
                                ))}
                              </div>
                            )}
                            {/* Signature */}
                            <div className="border-t border-stone-100 pt-2 mt-1">
                              <p className="text-[10px] font-semibold text-stone-500 mb-1">{t.sigTitle}</p>
                              {adminSigLoading.has(b.id) ? (
                                <p className="text-[10px] text-stone-400 italic">{t.loading}</p>
                              ) : adminSigData[b.id] ? (
                                adminSigData[b.id]!.url ? (
                                  <a href={adminSigData[b.id]!.url!} target="_blank" rel="noopener noreferrer"
                                    className="block max-w-[180px] rounded-lg border border-stone-200 bg-white overflow-hidden hover:opacity-80 transition">
                                    <img src={adminSigData[b.id]!.url!} alt="signature" className="w-full" />
                                  </a>
                                ) : <p className="text-[10px] text-stone-400 italic">{t.sigNone}</p>
                              ) : (
                                <p className="text-[10px] text-stone-400 italic">{t.sigNone}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ── Call history section (all booking statuses) ── */}
                      <div className="mt-1.5 rounded-lg border border-stone-200 bg-white">
                        <button
                          type="button"
                          onClick={() => toggleBookingCalls(b.id)}
                          className="w-full flex items-center justify-between gap-2 px-2 py-1.5 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 rounded-lg"
                        >
                          <span className="flex items-center gap-1">
                            {bookingCallsOpen.has(b.id) ? t.bookingCallsToggleHide : t.bookingCallsToggleShow}
                            {bookingCallsData[b.id] && bookingCallsData[b.id].length > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[1.25rem] px-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                                {bookingCallsData[b.id].length}
                              </span>
                            )}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${bookingCallsOpen.has(b.id) ? "rotate-180" : ""}`} />
                        </button>
                        {bookingCallsOpen.has(b.id) && (
                          <div className="px-2 pb-2 space-y-1">
                            {bookingCallsLoading.has(b.id) && (
                              <p className="text-[10px] text-stone-400 italic px-1">{t.bookingCallsLoading}</p>
                            )}
                            {!bookingCallsLoading.has(b.id) && (!bookingCallsData[b.id] || bookingCallsData[b.id].length === 0) && (
                              <p className="text-[10px] text-stone-400 italic px-1">{t.bookingCallsEmpty}</p>
                            )}
                            {!bookingCallsLoading.has(b.id) && bookingCallsData[b.id]?.map(call => (
                              <div key={String(call.id)} className="flex items-center justify-between gap-2 py-1.5 border-b border-stone-100 last:border-0">
                                <div className="min-w-0">
                                  <div className="text-[10px] text-stone-500">
                                    {new Date(call.created_at).toLocaleString(t.dateLocale, { dateStyle: "short", timeStyle: "short", timeZone: "America/Chicago" })}
                                    {call.duration_sec != null && <span className="ml-1">· {call.duration_sec}s</span>}
                                  </div>
                                  <div className="mt-0.5">
                                    {call.status === "completed" && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-700">✓ {t.callLogsStatusCompleted}</span>
                                    )}
                                    {call.status === "no_booking" && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-stone-100 text-stone-500">{t.callLogsStatusNoBooking}</span>
                                    )}
                                    {call.status === "error" && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-700">⚠ {t.callLogsStatusError}</span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => void openBookingCallTranscript(call)}
                                  className="flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 whitespace-nowrap flex-shrink-0"
                                >
                                  <MessageSquare className="w-2.5 h-2.5" /> {t.bookingCallsOpenTranscript}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* ── Desktop: table layout ── */}
            <div className="hidden md:block">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 border-b border-stone-200">
                    <th className="px-3 py-2 w-8">
                      <input
                        type="checkbox" checked={allSelected} readOnly
                        onClick={allSelected ? deselectAll : selectAll}
                        className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                      />
                    </th>
                    <th className="text-left px-3 py-2 font-semibold w-28">{t.thVisitDate}</th>
                    <th className="text-left px-3 py-2 font-semibold">{t.thClient} / {t.thPhone}</th>
                    <th className="text-left px-3 py-2 font-semibold w-32">{t.thAppliance}</th>
                    <th className="text-left px-3 py-2 font-semibold w-40">{t.thStatus}{employees.length > 0 ? ` / ${t.assignEmployee}` : ""}</th>
                    <th className="text-left px-3 py-2 font-semibold">{t.thAction}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b, i) => {
                    const isHistory = b.status === "completed" || b.status === "cancelled";
                    const isWA = /AM–|PM–|AM-|PM-/.test(b.preferred_time ?? "");
                    const { cls: stCls, label: stLabel } = statusInfo(b.status);
                    const createdStr = b.created_at
                      ? new Date(b.created_at).toLocaleDateString(t.dateLocale, { day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "America/Chicago" })
                      : "—";
                    const prevIsActive = i > 0 && (filteredBookings[i - 1].status === "pending" || filteredBookings[i - 1].status === "approved");
                    const showSepRow = !isJobsArchiveTab && showCompleted && isHistory && (i === 0 || prevIsActive);
                    const rowBg = highlightBookingId === b.id ? "bg-amber-50 ring-1 ring-inset ring-amber-300" : selectedIds.has(b.id) ? "bg-blue-50 ring-1 ring-inset ring-blue-300" : i % 2 === 0 ? "bg-white" : "bg-stone-50";
                    const rowOpacity = isHistory && !selectedIds.has(b.id) && highlightBookingId !== b.id ? "opacity-50" : "";
                    const detailBg = i % 2 === 0 ? "bg-white" : "bg-stone-50";
                    return (
                      <React.Fragment key={b.id}>
                        {showSepRow && (
                          <tr>
                            <td colSpan={6} className="px-3 py-1.5">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-px bg-stone-200" />
                                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">{t.historyLabel}</span>
                                <div className="flex-1 h-px bg-stone-200" />
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* ── ROW 1: основные данные ── */}
                        <tr id={`booking-row-d-${b.id}`} className={`${rowBg} ${rowOpacity} hover:bg-blue-50 transition-colors cursor-default`}>
                          {/* Чекбокс */}
                          <td className="px-3 pt-2 pb-1 align-top">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(b.id)}
                              onChange={() => toggleSelect(b.id)}
                              className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                            />
                          </td>

                          {/* Дата визита + время */}
                          <td className="px-3 pt-2 pb-1 align-top">
                            <div className="font-semibold text-stone-700">{b.preferred_date}</div>
                            <div className="flex items-center gap-1 text-stone-500 mt-0.5">
                              <span>{b.preferred_time}</span>
                              {isWA && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700 leading-none">WA</span>
                              )}
                            </div>
                          </td>

                          {/* Клиент + телефон */}
                          <td className="px-3 pt-2 pb-1 align-top">
                            <span className="flex items-center gap-1 flex-wrap">
                              <User className="w-3 h-3 text-stone-400 shrink-0" />
                              <span className="font-medium text-stone-700">{b.name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold leading-none ${resolveBookingBiz(b.business_type) === "dental" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                                {resolveBookingBiz(b.business_type) === "dental" ? t.bizDental : t.bizAppliance}
                              </span>
                              <MoveBizButton b={b} />
                              {b.is_remote && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-100 text-stone-500 leading-none" title={t.remoteBookingHint}>👁</span>
                              )}
                              {b.client_lang && (
                                <span
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-700 leading-none uppercase"
                                  title={b.client_lang === "es" ? t.clientLangEs : b.client_lang === "en" ? t.clientLangEn : b.client_lang}>
                                  {b.client_lang}
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <a href={`tel:${b.phone}`} className="flex items-center gap-1" style={{ color: ACCENT }}>
                                <Phone className="w-3 h-3" />{b.phone}
                              </a>
                              {b.phone && (
                                genderPickerId === b.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => { void handleCallback(b.phone!, b.id, b.name, b.client_lang ?? "en", "male"); setGenderPickerId(null); }}
                                      title="Клиент — мужчина"
                                      className="text-xs px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold leading-none"
                                    >♂</button>
                                    <button
                                      onClick={() => { void handleCallback(b.phone!, b.id, b.name, b.client_lang ?? "en", "female"); setGenderPickerId(null); }}
                                      title="Клиент — женщина"
                                      className="text-xs px-1.5 py-0.5 rounded bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold leading-none"
                                    >♀</button>
                                    <button
                                      onClick={() => setGenderPickerId(null)}
                                      className="text-[10px] text-stone-400 hover:text-stone-600 leading-none px-0.5"
                                    >✕</button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setGenderPickerId(b.id)}
                                    disabled={callbackLoading.has(b.id)}
                                    title="Перезвонить клиенту — выберите пол"
                                    className="p-0.5 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
                                  >
                                    <PhoneOutgoing className="w-3 h-3" style={{ color: ACCENT }} />
                                  </button>
                                )
                              )}
                              {b.status === "completed" && b.phone && (
                                <button
                                  onClick={() => void handleSendReview(b.id)}
                                  disabled={reviewLoading.has(b.id)}
                                  title="Отправить ссылку на Google Review по SMS"
                                  className="p-0.5 rounded hover:bg-yellow-50 transition-colors disabled:opacity-50"
                                >
                                  <Star className="w-3 h-3" style={{ color: reviewLoading.has(b.id) ? "#aaa" : "#f59e0b" }} />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Прибор */}
                          <td className="px-3 pt-2 pb-1 align-top text-stone-600">{b.appliance || "—"}</td>

                          {/* Статус + сотрудник */}
                          <td className="px-3 pt-2 pb-1 align-top">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${stCls}`}>
                              {stLabel}
                            </span>
                            {employees.length > 0 && (
                              <div className="mt-1">
                                {(b.status === "pending" || b.status === "approved") ? (
                                  <select
                                    value={b.assigned_employee_id ?? ""}
                                    onChange={e => assignEmployee(b.id, e.target.value || null)}
                                    className="border border-stone-200 rounded-lg px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white max-w-[130px]">
                                    <option value="">{t.notAssigned}</option>
                                    {employees.map(e => (
                                      <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                  </select>
                                ) : b.assigned_employee_id ? (
                                  <span className="text-[11px] text-stone-500">👤 {employees.find(e => e.id === b.assigned_employee_id)?.name ?? "—"}</span>
                                ) : null}
                              </div>
                            )}
                          </td>

                          {/* Действия */}
                          <td className="px-3 pt-2 pb-1 align-top">
                            {(b.status === "pending" || b.status === "approved") && !b.is_remote && (
                              <div className="flex flex-wrap gap-x-2 gap-y-1 items-center text-xs">
                                {b.status === "pending" && (
                                  <button
                                    onClick={() => approveBooking(b.id)}
                                    className="flex items-center gap-0.5 text-green-600 hover:text-green-800 font-semibold transition"
                                    title={t.titleApprove}>
                                    <ThumbsUp className="w-3 h-3" /> {t.approveBtn}
                                  </button>
                                )}
                                <button
                                  onClick={() => openEditModal(b)}
                                  className="flex items-center gap-0.5 text-violet-600 hover:text-violet-800 font-semibold transition"
                                  title={t.titleEdit}>
                                  <Pencil className="w-3 h-3" /> {t.editBtn}
                                </button>
                                <button
                                  onClick={() => openReschedule(b)}
                                  className="flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-semibold transition"
                                  title={t.titleReschedule}>
                                  <CalendarDays className="w-3 h-3" /> {t.rescheduleBtn}
                                </button>
                                <button
                                  onClick={() => setConfirmComplete({ id: b.id, name: b.name })}
                                  className="flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-semibold transition"
                                  title={t.titleComplete}>
                                  <CheckCircle2 className="w-3 h-3" /> {t.completeBtn}
                                </button>
                                <button
                                  onClick={() => openAdminEstimate({ id: b.id, name: b.name, email: b.email ?? "", phone: b.phone ?? "" })}
                                  className="flex items-center gap-0.5 text-teal-600 hover:text-teal-800 font-semibold transition">
                                  📋 {t.estimateBtn}
                                </button>
                                <button
                                  onClick={() => setConfirmCancel({ id: b.id, name: b.name, time: b.preferred_time })}
                                  className="flex items-center gap-0.5 text-red-500 hover:text-red-700 font-semibold transition"
                                  title={t.titleCancel}>
                                  <XCircle className="w-3 h-3" /> {t.cancelBtn}
                                </button>
                                <button
                                  onClick={() => setConfirmDelete({ id: b.id, name: b.name })}
                                  className="flex items-center gap-0.5 text-amber-600 hover:text-amber-800 font-semibold transition"
                                  title={t.moveToTrashTitle}>
                                  <Trash2 className="w-3 h-3" /> {t.moveToTrashBtn}
                                </button>
                              </div>
                            )}
                            {(b.status === "cancelled" || b.status === "completed") && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openRestoreModal(b)}
                                  className="flex items-center gap-1 font-semibold transition-all duration-150 hover:scale-110 origin-left"
                                  style={{ color: "#f97316" }}
                                  title={t.titleRestore}>
                                  <RotateCcw className="w-3.5 h-3.5" /> {t.restoreBtn2}
                                </button>
                                <span className="text-stone-300">|</span>
                                <button
                                  onClick={() => setConfirmDelete({ id: b.id, name: b.name })}
                                  className="flex items-center gap-1 text-amber-600 hover:text-amber-800 font-semibold transition"
                                  title={t.moveToTrashTitle}>
                                  <Trash2 className="w-3.5 h-3.5" /> {t.moveToTrashBtn}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>

                        {/* ── ROW 2: детали клиента ── */}
                        <tr className={`${detailBg} ${rowOpacity} border-b border-stone-100`}>
                          <td className="pb-2" />
                          {/* Дата создания */}
                          <td className="pb-2 text-[10px] text-stone-400 align-top pt-0.5">
                            {t.thCreated}: {createdStr}
                          </td>
                          {/* Вся вторичная информация */}
                          <td colSpan={4} className="pb-2 pr-3 align-top pt-0.5">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
                              {b.address && (
                                <div className="flex items-center gap-0.5 text-[10px] text-stone-400">
                                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                                  <span title={b.address}>{b.address}</span>
                                </div>
                              )}
                              {b.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-stone-400 flex-shrink-0" />
                                  <a href={`mailto:${b.email}`} className="text-[11px] text-stone-500 hover:text-blue-600 transition">{b.email}</a>
                                </div>
                              )}
                              {/* Смета */}
                              {adminEstimateHistory[b.id] && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="text-[11px] text-blue-700 font-bold">${Number(adminEstimateHistory[b.id]!.total).toFixed(2)}</span>
                                  <button
                                    onClick={() => void viewEstimate(b, adminEstimateHistory[b.id]!.id)}
                                    className="text-[10px] font-bold text-blue-600 hover:underline whitespace-nowrap">
                                    {t.estimateViewBtn}
                                  </button>
                                  <button
                                    disabled={downloadingEstimateId === b.id}
                                    onClick={() => void downloadEstimate(b, adminEstimateHistory[b.id]!.id)}
                                    className="text-[10px] font-bold text-blue-600 hover:underline whitespace-nowrap disabled:opacity-50">
                                    {downloadingEstimateId === b.id ? "…" : t.estimateDownloadBtn}
                                  </button>
                                  <button
                                    onClick={() => openAdminEstimate({ id: b.id, name: b.name, email: b.email ?? "", phone: b.phone ?? "" }, adminEstimateHistory[b.id]!)}
                                    className="text-[10px] font-bold text-blue-600 hover:underline whitespace-nowrap">
                                    {t.estimateEditBtn}
                                  </button>
                                </div>
                              )}
                              {/* Оплата */}
                              {b.status === "completed" && (b.payment_method || b.payment_amount != null || b.payment_status) && (
                                <div className="text-[10px] text-green-700 font-semibold flex items-center gap-1 flex-wrap">
                                  {b.payment_amount != null && <span>${b.payment_amount}</span>}
                                  {b.payment_status === "paid" && <span>{t.payStatusPaid}</span>}
                                  {b.payment_status === "unpaid" && <span className="text-red-600">{t.payStatusUnpaid}</span>}
                                  {b.payment_status === "pending" && <span className="text-amber-600">{t.payStatusPending}</span>}
                                  {b.payment_status === "cash" && <span className="text-stone-600">{t.payStatusCash}</span>}
                                </div>
                              )}
                              {b.status === "completed" && b.client_signed_at && (
                                <div className="text-[10px] text-purple-700 font-semibold flex items-center gap-1">
                                  ✍️ {t.clientSigned}
                                </div>
                              )}
                              {/* Переотправить ссылку оплаты */}
                              {b.status === "completed" && b.payment_status === "pending" && (
                                <button
                                  disabled={resendingId === b.id}
                                  onClick={() => resendPaymentLink(b.id)}
                                  className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 hover:text-amber-900 transition disabled:opacity-50">
                                  📧 {resendSentId === b.id ? t.resendPaymentSent : resendingId === b.id ? t.resendPaymentSending : t.resendPaymentBtn}
                                </button>
                              )}
                              {/* Скачать чек */}
                              {b.status === "completed" && (b.payment_status === "paid" || b.stripe_paid) && (
                                <button
                                  disabled={downloadingReceiptId === b.id}
                                  onClick={() => downloadReceipt(b)}
                                  className="flex items-center gap-1 text-[10px] font-semibold text-blue-700 hover:text-blue-900 transition disabled:opacity-50">
                                  <Download className="w-3 h-3" />
                                  {downloadingReceiptId === b.id ? t.downloadReceiptDownloading : t.downloadReceiptBtn}
                                </button>
                              )}
                              {/* Переотправить чек на email */}
                              {b.status === "completed" && (b.payment_status === "paid" || b.stripe_paid) && b.email && (
                                <>
                                  <button
                                    disabled={resendingReceiptId === b.id}
                                    onClick={() => resendReceipt(b)}
                                    className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 transition disabled:opacity-50">
                                    📧 {resendReceiptSentId === b.id ? t.resendReceiptSent : resendingReceiptId === b.id ? t.resendReceiptSending : t.resendReceiptBtn}
                                  </button>
                                  {(b.receipt_resend_count ?? 0) > 0 && (
                                    <div
                                      className="text-[10px] text-stone-500"
                                      title={b.receipt_last_resent_at ? new Date(b.receipt_last_resent_at).toLocaleString(t.dateLocale, { timeZone: "America/Chicago" }) : undefined}
                                    >
                                      {t.receiptResentCount(b.receipt_resend_count ?? 0)}
                                      {b.receipt_last_resent_at && (
                                        <> · {t.receiptLastResentAt} {new Date(b.receipt_last_resent_at).toLocaleString(t.dateLocale, { dateStyle: "short", timeStyle: "short", timeZone: "America/Chicago" })}</>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                              {/* История скачиваний чека */}
                              {b.status === "completed" && (b.payment_status === "paid" || b.stripe_paid) && (
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => toggleReceiptHistory(b.id)}
                                    className="flex items-center gap-1 text-[10px] font-semibold text-stone-600 hover:text-stone-900 transition"
                                  >
                                    📜 {receiptHistoryOpen.has(b.id) ? t.receiptHistoryToggleHide : t.receiptHistoryToggleShow}
                                    {receiptHistory[b.id] && receiptHistory[b.id].length > 0 && (
                                      <span className="inline-flex items-center justify-center min-w-[1rem] px-1 rounded-full bg-stone-200 text-stone-700 text-[9px] font-bold">
                                        {receiptHistory[b.id].length}
                                      </span>
                                    )}
                                    <ChevronDown className={`w-3 h-3 transition-transform ${receiptHistoryOpen.has(b.id) ? "rotate-180" : ""}`} />
                                  </button>
                                  {receiptHistoryOpen.has(b.id) && (
                                    <div className="mt-1 max-w-[360px]">
                                      <ReceiptHistoryPanel
                                        rows={receiptHistory[b.id]}
                                        loading={receiptHistoryLoading.has(b.id)}
                                        error={receiptHistoryError[b.id]}
                                        t={t}
                                        filters={getReceiptHistoryFilters(b.id)}
                                        onFiltersChange={next => updateReceiptHistoryFilters(b.id, next)}
                                        onExport={() => void exportReceiptHistory(b.id)}
                                        exporting={receiptHistoryExporting.has(b.id)}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                              {/* Фото и подпись (desktop) */}
                              <div>
                                <button
                                  type="button"
                                  onClick={() => toggleAdminPhotos(b.id)}
                                  className="flex items-center gap-1 text-[10px] font-semibold text-stone-600 hover:text-stone-900 transition"
                                >
                                  <Camera className="w-3 h-3" />
                                  {adminPhotosOpen.has(b.id) ? t.photosHide : t.photosShow}
                                  {adminPhotosData[b.id] && adminPhotosData[b.id].length > 0 && (
                                    <span className="inline-flex items-center justify-center min-w-[1rem] px-1 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold">
                                      {adminPhotosData[b.id].length}
                                    </span>
                                  )}
                                  <ChevronDown className={`w-3 h-3 transition-transform ${adminPhotosOpen.has(b.id) ? "rotate-180" : ""}`} />
                                </button>
                                {adminPhotosOpen.has(b.id) && (
                                  <div className="mt-1 max-w-[360px] space-y-2">
                                    {adminPhotosLoading.has(b.id) ? (
                                      <p className="text-[10px] text-stone-400 italic">{t.loading}</p>
                                    ) : adminPhotosData[b.id]?.length === 0 ? (
                                      <p className="text-[10px] text-stone-400 italic">{t.photosEmpty}</p>
                                    ) : (
                                      <div className="grid grid-cols-4 gap-1">
                                        {adminPhotosData[b.id]?.map(ph => (
                                          ph.url ? (
                                            <a key={ph.id} href={ph.url} target="_blank" rel="noopener noreferrer"
                                              className="block aspect-square rounded overflow-hidden border border-stone-200 hover:opacity-80 transition">
                                              <img src={ph.url} alt="" className="w-full h-full object-cover" />
                                            </a>
                                          ) : (
                                            <div key={ph.id} className="aspect-square rounded bg-stone-100 border border-stone-200 flex items-center justify-center">
                                              <Camera className="w-3 h-3 text-stone-300" />
                                            </div>
                                          )
                                        ))}
                                      </div>
                                    )}
                                    <div className="border-t border-stone-100 pt-1">
                                      <p className="text-[9px] font-semibold text-stone-500 mb-1">{t.sigTitle}</p>
                                      {adminSigLoading.has(b.id) ? (
                                        <p className="text-[10px] text-stone-400 italic">{t.loading}</p>
                                      ) : adminSigData[b.id] ? (
                                        adminSigData[b.id]!.url ? (
                                          <a href={adminSigData[b.id]!.url!} target="_blank" rel="noopener noreferrer"
                                            className="block max-w-[160px] rounded border border-stone-200 bg-white overflow-hidden hover:opacity-80 transition">
                                            <img src={adminSigData[b.id]!.url!} alt="signature" className="w-full" />
                                          </a>
                                        ) : <p className="text-[10px] text-stone-400 italic">{t.sigNone}</p>
                                      ) : (
                                        <p className="text-[10px] text-stone-400 italic">{t.sigNone}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* История звонков */}
                              <div>
                                <button
                                  type="button"
                                  onClick={() => toggleBookingCalls(b.id)}
                                  className="flex items-center gap-1 text-[10px] font-semibold text-stone-600 hover:text-stone-900 transition"
                                >
                                  📞 {bookingCallsOpen.has(b.id) ? t.bookingCallsToggleHide : t.bookingCallsToggleShow}
                                  {bookingCallsData[b.id] && bookingCallsData[b.id].length > 0 && (
                                    <span className="inline-flex items-center justify-center min-w-[1rem] px-1 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold">
                                      {bookingCallsData[b.id].length}
                                    </span>
                                  )}
                                  <ChevronDown className={`w-3 h-3 transition-transform ${bookingCallsOpen.has(b.id) ? "rotate-180" : ""}`} />
                                </button>
                                {bookingCallsOpen.has(b.id) && (
                                  <div className="mt-1 max-w-[360px] space-y-1">
                                    {bookingCallsLoading.has(b.id) && (
                                      <p className="text-[10px] text-stone-400 italic">{t.bookingCallsLoading}</p>
                                    )}
                                    {!bookingCallsLoading.has(b.id) && (!bookingCallsData[b.id] || bookingCallsData[b.id].length === 0) && (
                                      <p className="text-[10px] text-stone-400 italic">{t.bookingCallsEmpty}</p>
                                    )}
                                    {!bookingCallsLoading.has(b.id) && bookingCallsData[b.id]?.map(call => (
                                      <div key={String(call.id)} className="flex items-center justify-between gap-2 py-1 border-b border-stone-100 last:border-0">
                                        <div className="min-w-0">
                                          <div className="text-[9px] text-stone-500">
                                            {new Date(call.created_at).toLocaleString(t.dateLocale, { dateStyle: "short", timeStyle: "short", timeZone: "America/Chicago" })}
                                            {call.duration_sec != null && <span className="ml-1">· {call.duration_sec}s</span>}
                                          </div>
                                          <div>
                                            {call.status === "completed" && (
                                              <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[8px] font-bold bg-green-100 text-green-700">✓ {t.callLogsStatusCompleted}</span>
                                            )}
                                            {call.status === "no_booking" && (
                                              <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[8px] font-bold bg-stone-100 text-stone-500">{t.callLogsStatusNoBooking}</span>
                                            )}
                                            {call.status === "error" && (
                                              <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[8px] font-bold bg-red-100 text-red-700">⚠ {t.callLogsStatusError}</span>
                                            )}
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => void openBookingCallTranscript(call)}
                                          className="flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 whitespace-nowrap flex-shrink-0"
                                        >
                                          <MessageSquare className="w-2 h-2" /> {t.bookingCallsOpenTranscript}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>)}
        </div>
        </div>
      </div>

      {/* ── Face ID credentials management section ── */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5" style={{ color: ACCENT }} />
              <h2 className="font-bold text-stone-800 text-base">{t.fidSectionTitle}</h2>
            </div>
            <button
              onClick={loadCredentials}
              disabled={loadingCredentials}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCredentials ? "animate-spin" : ""}`} />
              {t.fidRefreshBtn}
            </button>
          </div>

          {credentialsError ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <p className="text-sm text-red-500">{credentialsError}</p>
              <button onClick={loadCredentials} className="text-xs font-semibold underline" style={{ color: ACCENT }}>{t.fidTryAgain}</button>
            </div>
          ) : loadingCredentials && faceIdCredentials.length === 0 ? (
            <p className="text-sm text-stone-400 py-4 text-center">{t.fidLoading}</p>
          ) : faceIdCredentials.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2 text-stone-400">
              <Fingerprint className="w-10 h-10 opacity-20" />
              <p className="text-sm">{t.fidEmpty}</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {faceIdCredentials.map(cred => {
                const registeredDate = new Date(cred.created_at).toLocaleDateString(t.dateLocale, {
                  year: "numeric", month: "short", day: "numeric", timeZone: "America/Chicago",
                });
                const registeredTime = new Date(cred.created_at).toLocaleTimeString(t.dateLocale, {
                  hour: "numeric", minute: "2-digit", timeZone: "America/Chicago",
                });
                const isRenaming = renamingCredentialId === cred.id;
                const justRenamed = renamedCredentialId === cred.id;
                return (
                  <div key={cred.id} className="py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#EFF6FF" }}>
                          <Fingerprint className="w-4 h-4" style={{ color: ACCENT }} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-stone-800 truncate">{cred.label || t.fidDevice}</p>
                            {justRenamed && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full transition-opacity">
                                <CheckCircle2 className="w-3 h-3" />
                                {t.fidRenamed}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-400">{registeredDate} {t.fidAt} {registeredTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => isRenaming ? cancelRename() : startRename(cred)}
                          disabled={removingCredentialId === cred.id || renameSaving}
                          className="flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-700 transition disabled:opacity-50 px-2 py-1 rounded-lg hover:bg-stone-50"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          {isRenaming ? t.fidCancelBtn : t.fidRenameBtn}
                        </button>
                        <button
                          onClick={() => { setRemoveCredentialError(null); setConfirmRemoveCredential(cred); }}
                          disabled={removingCredentialId === cred.id || isRenaming}
                          className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition disabled:opacity-50 px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {t.fidRemoveBtn}
                        </button>
                      </div>
                    </div>
                    {isRenaming && (
                      <div className="mt-2 ml-11 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={renameLabel}
                            onChange={e => setRenameLabel(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") saveRename(cred.id); if (e.key === "Escape") cancelRename(); }}
                            autoFocus
                            placeholder={t.fidDevicePlaceholder}
                            className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
                            style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
                          />
                          <button
                            onClick={() => saveRename(cred.id)}
                            disabled={renameSaving}
                            className="flex items-center gap-1 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                            style={{ background: ACCENT }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {renameSaving ? t.fidSaving : t.fidSave}
                          </button>
                        </div>
                        {renameError && <p className="text-xs text-red-500">{renameError}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm remove Face ID credential modal ── */}
      {confirmRemoveCredential && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <Fingerprint className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-stone-800">{t.fidRemoveTitle}</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1">
              {t.fidRemoveDevice} <strong>{confirmRemoveCredential.label || t.fidDevice}</strong>
            </p>
            <p className="text-xs text-stone-400 mb-4">
              {t.fidRemoveInfo}
            </p>
            {removeCredentialError && (
              <p className="text-xs text-red-500 mb-3">{removeCredentialError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setConfirmRemoveCredential(null); setRemoveCredentialError(null); }}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition"
              >
                {t.fidCancelBtn}
              </button>
              <button
                onClick={removeCredential}
                disabled={removingCredentialId !== null}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-60"
              >
                {removingCredentialId !== null ? t.fidRemoving : t.fidRemoveYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stripe Payment Link Modal ── */}
      {stripeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-stone-800 flex items-center gap-1.5">
                💳 {t.stripePayLink}
              </h3>
              <button onClick={() => { setStripeModal(null); setStripeLink(null); setStripeErr(null); }}
                className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-3">{stripeModal.name}</p>

            {!stripeLink ? (
              <>
                <label className="block text-xs font-semibold text-stone-500 mb-1">{t.stripeAmount}</label>
                <input
                  type="number" min="0" step="0.01"
                  value={stripeModal.amount}
                  onChange={e => setStripeModal(p => p ? { ...p, amount: e.target.value } : null)}
                  placeholder="0.00"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 mb-3"
                  style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
                />
                {stripeErr && <p className="text-xs text-red-500 mb-2">{stripeErr}</p>}
                <button
                  onClick={generatePaymentLink}
                  disabled={stripeLoading || !stripeModal.amount}
                  className="w-full py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                  style={{ background: ACCENT }}
                >
                  {stripeLoading ? t.stripeGenerating : t.stripeGenLink}
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <p className="text-xs text-green-700 font-bold mb-1">✅ {t.stripeSendLink}</p>
                  <p className="text-xs text-green-600 break-all">{stripeLink}</p>
                </div>
                <button
                  onClick={copyStripeLink}
                  className="w-full py-2.5 rounded-xl font-bold text-sm border"
                  style={stripeCopied ? { background: "#16a34a", color: "white", borderColor: "#16a34a" } : { background: "white", color: ACCENT, borderColor: ACCENT }}
                >
                  {stripeCopied ? t.stripeCopied : "📋 Copy Link"}
                </button>
                <a href={stripeLink} target="_blank" rel="noreferrer"
                  className="block w-full py-2.5 rounded-xl text-white font-bold text-sm text-center transition"
                  style={{ background: ACCENT }}>
                  Open Link ↗
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Booking call transcript modal ── */}
      {(bookingCallTranscript || bookingCallTranscriptLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => { if (!bookingCallTranscriptLoading) setBookingCallTranscript(null); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-800 text-sm">{t.callLogsTranscriptTitle}</h3>
                {bookingCallTranscript && (
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {bookingCallTranscript.phone ?? "—"}
                    {bookingCallTranscript.client_name ? ` · ${bookingCallTranscript.client_name}` : ""}
                  </p>
                )}
              </div>
              <button
                onClick={() => setBookingCallTranscript(null)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {bookingCallTranscriptLoading && (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin text-stone-300" />
                </div>
              )}
              {!bookingCallTranscriptLoading && bookingCallTranscript && (() => {
                const lines = bookingCallTranscript.transcript
                  .split("\n").map(l => l.trim()).filter(Boolean);
                if (lines.length === 0) {
                  return <p className="text-xs text-stone-400 text-center py-8">{t.callLogsTranscriptEmpty}</p>;
                }
                return lines.map((line, idx) => {
                  const isAgent    = line.startsWith("Agent:");
                  const isCustomer = line.startsWith("Customer:");
                  const text  = isAgent ? line.slice("Agent:".length).trim()
                              : isCustomer ? line.slice("Customer:".length).trim() : line;
                  const label = isAgent ? t.callLogsTranscriptAgent
                              : isCustomer ? t.callLogsTranscriptCustomer : null;
                  if (isAgent) return (
                    <div key={idx} className="flex justify-start gap-2">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: ACCENT }}>AI</div>
                      <div className="max-w-[80%]">
                        <div className="text-[9px] text-stone-400 mb-0.5 font-semibold">{label}</div>
                        <div className="bg-blue-50 text-stone-800 text-xs rounded-2xl rounded-tl-sm px-3 py-2 leading-relaxed">{text}</div>
                      </div>
                    </div>
                  );
                  if (isCustomer) return (
                    <div key={idx} className="flex justify-end gap-2">
                      <div className="max-w-[80%] text-right">
                        <div className="text-[9px] text-stone-400 mb-0.5 font-semibold">{label}</div>
                        <div className="bg-stone-100 text-stone-800 text-xs rounded-2xl rounded-tr-sm px-3 py-2 leading-relaxed">{text}</div>
                      </div>
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-[9px] font-bold">C</div>
                    </div>
                  );
                  return <div key={idx} className="text-center text-[10px] text-stone-400 italic py-1">{text}</div>;
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Estimate Modal ── */}
      {adminEstimateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <div className="font-bold text-base text-stone-800">{adminEstimateIsEdit ? t.estimateEditTitle : t.estimateTitle}</div>
              <button onClick={() => setAdminEstimateTarget(null)} className="p-1.5 rounded-full hover:bg-stone-100 transition">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {adminEstimateDone ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">✅</div>
                  <div className="font-bold text-green-700">{t.estimateSuccess}</div>
                </div>
              ) : (
                <>
                  <div className="bg-stone-50 rounded-lg p-3 text-sm space-y-1">
                    <strong>{adminEstimateTarget.name}</strong>
                    {adminEstimateTarget.email && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span>{adminEstimateTarget.email}</span>
                      </div>
                    )}
                    {adminEstimateTarget.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span>{adminEstimateTarget.phone}</span>
                      </div>
                    )}
                    {!adminEstimateTarget.email && !adminEstimateTarget.phone && (
                      <div className="text-xs font-semibold text-red-600 mt-1">
                        ⚠ Нет ни email, ни телефона — смету невозможно отправить. Добавьте контактные данные в заказ.
                      </div>
                    )}
                    {!adminEstimateTarget.email && adminEstimateTarget.phone && (
                      <div className="text-xs font-semibold text-amber-600 mt-1">
                        ⚠ Email не указан — отправка по email невозможна. Добавьте email в заказ.
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-stone-500">{t.estimateItems}</label>
                      <button
                        onClick={() => setAdminEstimateItems(prev => [...prev, { description: "", category: "Labor", qty: 1, unit_price: 0 }])}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800">{t.addItem}</button>
                    </div>
                    <div className="space-y-2">
                      {adminEstimateItems.map((item, i) => (
                        <div key={i} className="bg-stone-50 rounded-lg p-2.5 space-y-2">
                          <div className="flex gap-2">
                            <input
                              value={item.description}
                              onChange={e => setAdminEstimateItems(prev => prev.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))}
                              placeholder={t.itemDesc}
                              className="flex-1 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />
                            <button
                              onClick={() => setAdminEstimateItems(prev => prev.filter((_, idx) => idx !== i))}
                              className="px-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-xs font-bold">✕</button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <select
                              value={item.category}
                              onChange={e => setAdminEstimateItems(prev => prev.map((x, idx) => idx === i ? { ...x, category: e.target.value } : x))}
                              className="border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400">
                              <option value="Labor">Labor</option>
                              <option value="Part">Part</option>
                              <option value="Material">Material</option>
                            </select>
                            <input
                              type="number" min="1" step="1"
                              value={item.qty}
                              onChange={e => setAdminEstimateItems(prev => prev.map((x, idx) => idx === i ? { ...x, qty: Math.max(1, parseInt(e.target.value) || 1) } : x))}
                              placeholder={t.itemQty}
                              className="border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-stone-400 text-xs">$</span>
                              <input
                                type="number" min="0" step="0.01"
                                value={item.unit_price === 0 ? "" : item.unit_price}
                                onChange={e => setAdminEstimateItems(prev => prev.map((x, idx) => idx === i ? { ...x, unit_price: parseFloat(e.target.value) || 0 } : x))}
                                className="w-full border border-stone-200 rounded-lg pl-5 pr-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={adminEstimateNoTax} onChange={e => setAdminEstimateNoTax(e.target.checked)} className="w-4 h-4 accent-green-600" />
                    <span className="text-xs font-semibold text-green-700">{t.noTax}</span>
                  </label>

                  {(() => {
                    const labor = adminEstimateItems.filter(i => i.category === "Labor").reduce((s, i) => s + i.qty * i.unit_price, 0);
                    const parts = adminEstimateItems.filter(i => i.category !== "Labor").reduce((s, i) => s + i.qty * i.unit_price, 0);
                    const tax = adminEstimateNoTax ? 0 : (labor + parts) * 0.0825;
                    const total = labor + parts + tax;
                    return (
                      <div className="bg-blue-50 rounded-lg p-3 space-y-1 text-xs">
                        <div className="flex justify-between text-stone-600"><span>{t.estimateSubtotal}</span><span>${(labor + parts).toFixed(2)}</span></div>
                        {adminEstimateNoTax
                          ? <div className="flex justify-between font-semibold text-green-700"><span>{t.estimateTaxLine}</span><span>$0.00 ✓</span></div>
                          : <div className="flex justify-between text-stone-600"><span>{t.estimateTaxLine}</span><span>${tax.toFixed(2)}</span></div>}
                        <div className="flex justify-between font-bold text-blue-800 text-sm pt-1 border-t border-blue-200"><span>{t.estimateTotalLine}</span><span>${total.toFixed(2)}</span></div>
                      </div>
                    );
                  })()}

                  <div>
                    <label className="block text-xs font-semibold text-stone-500 mb-1">{t.estimateNotes}</label>
                    <textarea
                      value={adminEstimateNotes}
                      onChange={e => setAdminEstimateNotes(e.target.value)}
                      placeholder={t.estimateNotesPlaceholder}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none min-h-[60px]"
                    />
                  </div>

                  {/* Notify method selector */}
                  {(adminEstimateTarget.email || adminEstimateTarget.phone) && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-500 mb-2">{t.notifyMethod ?? "Способ отправки"}</label>
                      <div className="flex gap-2">
                        {(["email", "sms", "both"] as const).map(m => {
                          const disabled =
                            ((m === "email" || m === "both") && !adminEstimateTarget.email) ||
                            (m === "sms" && !adminEstimateTarget.phone);
                          return (
                            <button
                              key={m}
                              onClick={() => !disabled && setAdminEstimateNotify(m)}
                              disabled={disabled}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition border ${
                                adminEstimateNotify === m
                                  ? "border-teal-500 bg-teal-50 text-teal-700"
                                  : disabled
                                  ? "border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed"
                                  : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50"
                              }`}
                            >
                              {m === "email" ? "✉️ Email" : m === "sms" ? "📱 SMS" : "✉️+📱 " + (t.viaBoth ?? "Оба")}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {adminEstimateErr && <p className="text-xs text-red-600 text-center">{adminEstimateErr}</p>}

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setAdminEstimateTarget(null)}
                      className="flex-1 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition"
                    >{t.cancel}</button>
                    <button
                      onClick={() => void handleAdminEstimate()}
                      disabled={adminEstimateSending || (!adminEstimateTarget.email && !adminEstimateTarget.phone)}
                      title={(!adminEstimateTarget.email && !adminEstimateTarget.phone) ? "Добавьте email или телефон в заказ" : ""}
                      className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition disabled:opacity-50"
                    >{adminEstimateSending ? t.estimateSending : t.estimateSend}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Developer footer ── */}
      <div className="mt-6 pb-8 text-center space-y-1 px-4">
        <p className="text-sm font-semibold" style={{ color: "#dc2626" }}>
          Database developed by Eivaz Rakhmanov 2026
        </p>
        <p className="text-sm font-semibold" style={{ color: "#16a34a" }}>
          База данных разработана Эйвазом Рахмановым в 2026 году
        </p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminLangProvider>
      <AdminDashboard />
    </AdminLangProvider>
  );
}
