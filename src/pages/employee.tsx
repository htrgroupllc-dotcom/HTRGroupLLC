import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Wrench, LogOut, CheckCircle2, Phone, MapPin,
  Package, DollarSign, ChevronRight, CalendarDays,
  RefreshCw, X, Banknote, Navigation, Download, FileText, Plus, Minus,
  Archive, ArchiveRestore, TrendingUp, Search, Star, Mail, MessageSquare, Camera, Pencil,
  PhoneOutgoing, Mic, MicOff, Languages,
} from "lucide-react";
import { downloadReceiptPdf } from "@/lib/downloadReceipt";
import { EmpLangProvider, useEmpLang, EmpLang } from "@/context/EmpLangContext";
import { resolveBookingBiz } from "@/lib/adminSiteConfig";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
type RegistrationOptionsJSON   = Parameters<typeof startRegistration>[0]["optionsJSON"];
type AuthenticationOptionsJSON = Parameters<typeof startAuthentication>[0]["optionsJSON"];
type EmpRegisterOptionsResponse = RegistrationOptionsJSON   & { challengeId: string };
type EmpLoginOptionsResponse    = AuthenticationOptionsJSON & { challengeId: string };

const API = () => (import.meta.env.VITE_API_BASE as string ?? "").replace(/\/$/, "");

const ACCENT  = "#1B6FE8";
const SUCCESS = "#16a34a";

interface Booking {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address: string;
  appliance: string;
  brand_model?: string;
  business_type?: string | null;
  preferred_date: string;
  preferred_time: string;
  message?: string;
  status: string;
  payment_method?: string;
  payment_amount?: number;
  payment_status?: string | null;
  payment_language?: string | null;
  client_lang?: string | null;
  stripe_paid?: boolean | null;
  parts_replaced?: string;
  work_description?: string;
  recall_note?: string | null;
  closed_at?: string;
  employee_archived_at?: string | null;
  created_at: string;
  // Embedded estimate fields (returned by GET /employee/bookings)
  last_estimate_id?: number | null;
  last_estimate_total?: number | null;
  last_estimate_no_tax?: boolean | null;
  last_estimate_sent_at?: string | null;
  last_estimate_items?: EstimateLineItem[] | null;
  last_estimate_notes?: string | null;
}

interface PricebookItem {
  id: number;
  name: string;
  description: string | null;
  category: string;
  unit_price: number;
}

interface EstimateLineItem {
  description: string;
  category: string;
  qty: number;
  unit_price: number;
}

interface EstimateRecord {
  id: number;
  total: number;
  items: EstimateLineItem[];
  notes: string | null;
  no_tax: boolean;
  sent_at: string;
}

interface EmpStats {
  closed_total:  number;
  revenue_total: number;
  closed_month:  number;
  revenue_month: number;
  closed_week:   number;
  labor_week:    number;
  parts_week:    number;
  tax_week:      number;
  net_week:      number;
  emp_pct:       number;
}

interface PayrollRecord {
  id: string;
  period_label: string;
  period_start: string;
  period_end: string;
  jobs_count: number;
  gross_amount: number;
  deductions: number;
  net_amount: number;
  status: string;
  notes?: string;
}

interface EmployeeProfile {
  id: string;
  name: string;
  phone: string;
  car_plate?: string;
  car_make?: string;
  car_model?: string;
}

type Tab = "jobs" | "stats" | "payroll" | "profile";

// ── Helpers ────────────────────────────────────────────────────────────────────
function statusLabel(s: string, t: (k: string) => string): string {
  if (s === "pending")   return `⏳ ${t("pending")}`;
  if (s === "approved")  return `✅ ${t("confirmed")}`;
  if (s === "completed") return `✓ ${t("done")}`;
  return s;
}
function statusCls(s: string): string {
  if (s === "completed") return "bg-green-100 text-green-700";
  if (s === "approved")  return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
}
function payStatusLabel(s: string, t: (k: string) => string): string {
  if (s === "paid")      return `✅ ${t("paid")}`;
  if (s === "cancelled") return `❌ ${t("cancelled")}`;
  return `⏳ ${t("pending")}`;
}
function payStatusCls(s: string): string {
  if (s === "paid")      return "bg-green-100 text-green-700";
  if (s === "cancelled") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}
function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}
function mapsUrl(addr: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
}

// ── Btn component ──────────────────────────────────────────────────────────────
function Btn({
  onClick, disabled, color = ACCENT, outline = false, children, full = true,
}: {
  onClick?: () => void;
  disabled?: boolean;
  color?: string;
  outline?: boolean;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: 44,
        width: full ? "100%" : undefined,
        padding: "0 16px",
        background: outline ? "transparent" : disabled ? "#cbd5e1" : color,
        color: outline ? color : "#fff",
        border: outline ? `1.5px solid ${color}` : "none",
        borderRadius: 12,
        fontSize: 15,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "opacity 0.15s",
        opacity: disabled ? 0.6 : 1,
        boxSizing: "border-box",
      }}
    >
      {children}
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function EmployeePageWrapped() {
  return (
    <EmpLangProvider>
      <EmployeePage />
    </EmpLangProvider>
  );
}

// ── localStorage helpers ───────────────────────────────────────────────────────
const EMP_TOKEN_KEY     = "empToken";
const EMP_NAME_KEY      = "empName";
const EMP_EXP_KEY       = "empTokenExp";
const EMP_FID_KEY       = "empFidCredId";
const EMP_LAST_SEEN_KEY = "empLastSeenAt";
const EMP_TOKEN_TTL     = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── PWA Badge helpers ──────────────────────────────────────────────────────────
function clearAppBadge() {
  if ("clearAppBadge" in navigator) (navigator as { clearAppBadge(): Promise<void> }).clearAppBadge().catch(() => {});
}
function setAppBadgeCount(count: number) {
  if (count > 0 && "setAppBadge" in navigator) {
    (navigator as { setAppBadge(n: number): Promise<void> }).setAppBadge(count).catch(() => {});
  } else {
    clearAppBadge();
  }
}
function notifySwBadgeInit(token: string) {
  try {
    const sw = navigator.serviceWorker?.controller;
    if (!sw) return;
    const lastSeenAt = localStorage.getItem(EMP_LAST_SEEN_KEY) ?? new Date().toISOString();
    sw.postMessage({ type: "BADGE_INIT", token, apiBase: API(), lastSeenAt });
  } catch { /* ignore */ }
}
function notifySwBadgeClear() {
  try {
    navigator.serviceWorker?.controller?.postMessage({ type: "BADGE_CLEAR" });
  } catch { /* ignore */ }
}

function loadStoredToken(): { token: string; name: string } | null {
  try {
    const token = localStorage.getItem(EMP_TOKEN_KEY);
    const exp   = localStorage.getItem(EMP_EXP_KEY);
    const name  = localStorage.getItem(EMP_NAME_KEY) ?? "";
    if (!token || !exp || Date.now() > parseInt(exp, 10)) {
      localStorage.removeItem(EMP_TOKEN_KEY);
      localStorage.removeItem(EMP_EXP_KEY);
      localStorage.removeItem(EMP_NAME_KEY);
      return null;
    }
    return { token, name };
  } catch { return null; }
}
function saveEmpToken(token: string, name: string) {
  localStorage.setItem(EMP_TOKEN_KEY, token);
  localStorage.setItem(EMP_NAME_KEY, name);
  localStorage.setItem(EMP_EXP_KEY, String(Date.now() + EMP_TOKEN_TTL));
}
function clearEmpToken() {
  localStorage.removeItem(EMP_TOKEN_KEY);
  localStorage.removeItem(EMP_NAME_KEY);
  localStorage.removeItem(EMP_EXP_KEY);
}
async function hasPlatformBiometrics(): Promise<boolean> {
  try {
    return !!(
      window.PublicKeyCredential &&
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    );
  } catch { return false; }
}

const TRANSLATOR_LANGS = [
  { code: "en-US", bcp: "en-US", flag: "🇺🇸", label: "English"        },
  { code: "es-US", bcp: "es-ES", flag: "🇪🇸", label: "Español"        },
  { code: "ru-RU", bcp: "ru-RU", flag: "🇷🇺", label: "Русский"        },
  { code: "az-AZ", bcp: "az-AZ", flag: "🇦🇿", label: "Azərbaycanca"   },
  { code: "tr-TR", bcp: "tr-TR", flag: "🇹🇷", label: "Türkçe"         },
  { code: "uk-UA", bcp: "uk-UA", flag: "🇺🇦", label: "Українська"     },
  { code: "uz-UZ", bcp: "uz-UZ", flag: "🇺🇿", label: "O'zbekcha"      },
  { code: "ky-KG", bcp: "ky-KG", flag: "🇰🇬", label: "Кыргызча"       },
  { code: "kk-KZ", bcp: "kk-KZ", flag: "🇰🇿", label: "Қазақша"        },
  { code: "hy-AM", bcp: "hy-AM", flag: "🇦🇲", label: "Հայերեն"        },
  { code: "ka-GE", bcp: "ka-GE", flag: "🇬🇪", label: "ქართული"       },
  { code: "he-IL", bcp: "he-IL", flag: "🇮🇱", label: "עברית"          },
  { code: "pt-BR", bcp: "pt-BR", flag: "🇧🇷", label: "Português"      },
  { code: "zh-CN", bcp: "zh-CN", flag: "🇨🇳", label: "中文"            },
  { code: "ko-KR", bcp: "ko-KR", flag: "🇰🇷", label: "한국어"          },
  { code: "vi-VN", bcp: "vi-VN", flag: "🇻🇳", label: "Tiếng Việt"    },
  { code: "pl-PL", bcp: "pl-PL", flag: "🇵🇱", label: "Polski"         },
  { code: "de-DE", bcp: "de-DE", flag: "🇩🇪", label: "Deutsch"        },
  { code: "fr-FR", bcp: "fr-FR", flag: "🇫🇷", label: "Français"       },
  { code: "ar-SA", bcp: "ar-SA", flag: "🇸🇦", label: "العربية"        },
  { code: "fa-IR", bcp: "fa-IR", flag: "🇮🇷", label: "فارسی"          },
  { code: "ur-PK", bcp: "ur-PK", flag: "🇵🇰", label: "اردو"           },
  { code: "ps-AF", bcp: "ps-AF", flag: "🇦🇫", label: "پښتو"           },
  { code: "hi-IN", bcp: "hi-IN", flag: "🇮🇳", label: "हिंदी"          },
  { code: "tl-PH", bcp: "tl-PH", flag: "🇵🇭", label: "Filipino"       },
];

function EmployeePage() {
  const { lang, setLang, t } = useEmpLang();

  // Auth state
  type EmpScreen = "checking" | "login" | "register-fid";
  const [empScreen, setEmpScreen]   = useState<EmpScreen>("checking");
  const [token, setToken]           = useState<string | null>(null);
  const [empName, setEmpName]       = useState("");
  const [hasBiometrics, setHasBio]  = useState(false);
  const [deviceHasFid, setDevFid]   = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const autoTriggered = useRef(false);

  // Login form
  const [phone, setPhone]       = useState("");
  const [pin, setPin]           = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Shared init: checks stored token or prepares login screen with FID auto-trigger
  const initLoginScreen = useCallback(async () => {
    const stored = loadStoredToken();
    if (stored) {
      setToken(stored.token);
      setEmpName(stored.name);
      return;
    }
    const bio = await hasPlatformBiometrics();
    setHasBio(bio);
    const localCredId = localStorage.getItem(EMP_FID_KEY);
    const hasFid = bio && !!localCredId;
    setDevFid(hasFid);
    setShowLoginForm(!hasFid);
    setEmpScreen("login");
    if (hasFid && !autoTriggered.current) {
      autoTriggered.current = true;
      setTimeout(() => void triggerEmpFaceID(localCredId!), 350);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { void initLoginScreen(); }, [initLoginScreen]);

  async function triggerEmpFaceID(localCredId: string) {
    setLoggingIn(true);
    setLoginErr("");
    try {
      const optRes = await fetch(`${API()}/api/employee/webauthn/login-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId: localCredId }),
      });
      if (!optRes.ok) throw new Error("Failed to get options");
      const { challengeId, ...optionsJSON } = await optRes.json() as EmpLoginOptionsResponse;
      const credential = await startAuthentication({ optionsJSON });
      const verRes = await fetch(`${API()}/api/employee/webauthn/login-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: credential, challengeId }),
      });
      if (!verRes.ok) throw new Error("Verification failed");
      const data = await verRes.json() as { ok?: boolean; token?: string; name?: string };
      if (!data.ok || !data.token) throw new Error("No token");
      saveEmpToken(data.token, data.name ?? "");
      setToken(data.token);
      setEmpName(data.name ?? "");
    } catch {
      setLoginErr(t("faceIdFailed"));
      setShowLoginForm(true);
    } finally {
      setLoggingIn(false);
    }
  }

  const login = async () => {
    setLoggingIn(true);
    setLoginErr("");
    try {
      const r = await fetch(`${API()}/api/employee/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), pin }),
      });
      const d = await r.json() as { ok?: boolean; token?: string; name?: string; error?: string };
      if (!r.ok || !d.ok) { setLoginErr(d.error ? (d.error === "Invalid phone or PIN" ? t("invalidLogin") : d.error) : t("invalidLogin")); return; }
      saveEmpToken(d.token!, d.name!);
      setToken(d.token!);
      setEmpName(d.name!);
      // Offer Face ID registration on mobile if not yet registered
      const ua = navigator.userAgent;
      const isMobile = /iPhone|iPad|Android/i.test(ua);
      if (hasBiometrics && !localStorage.getItem(EMP_FID_KEY) && isMobile) {
        setEmpScreen("register-fid");
      }
    } catch {
      setLoginErr(t("connError"));
    } finally {
      setLoggingIn(false);
    }
  };

  const handleRegisterFaceID = async () => {
    if (!token) return;
    setLoggingIn(true);
    setLoginErr("");
    try {
      const optRes = await fetch(`${API()}/api/employee/webauthn/register-options`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!optRes.ok) throw new Error("Failed to get options");
      const { challengeId, ...optionsJSON } = await optRes.json() as EmpRegisterOptionsResponse;
      const credential = await startRegistration({ optionsJSON });
      const verRes = await fetch(`${API()}/api/employee/webauthn/register-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ response: credential, label: /iPhone/.test(navigator.userAgent) ? "iPhone" : /iPad/.test(navigator.userAgent) ? "iPad" : "Android", challengeId }),
      });
      if (!verRes.ok) throw new Error("Registration failed");
      const data = await verRes.json() as { credentialId?: string };
      if (data.credentialId) localStorage.setItem(EMP_FID_KEY, data.credentialId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("cancel") && !msg.includes("abort") && !msg.includes("NotAllowed")) {
        setLoginErr(t("faceIdRegFailed"));
      }
    } finally {
      setLoggingIn(false);
      setEmpScreen("checking"); // force re-render to portal
    }
  };

  const logout = () => {
    clearEmpToken();
    setToken(null);
    setEmpName("");
    setLoginErr("");
    autoTriggered.current = false;
    void initLoginScreen();
  };

  // ── Data ───────────────────────────────────────────────────────────────────
  const [tab, setTab]                     = useState<Tab>("jobs");
  const [bookings, setBookings]           = useState<Booking[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [profile, setProfile]             = useState<EmployeeProfile | null>(null);
  const [loading, setLoading]             = useState(false);
  const [apiErr, setApiErr]               = useState("");
  const [empStats, setEmpStats]           = useState<EmpStats | null>(null);
  const [justClosedId, setJustClosedId]   = useState<string | null>(null);
  const [jobsTab, setJobsTab]             = useState<"active" | "completed" | "archived">("active");
  const [jobSearch, setJobSearch]         = useState("");
  const [sendingReviewId, setSendingReviewId] = useState<string | null>(null);
  const greenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (greenTimerRef.current) clearTimeout(greenTimerRef.current);
    };
  }, []);

  const authH = useCallback(() => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  }), [token]);

  const [estimateHistory, setEstimateHistory] = useState<Record<string, EstimateRecord | null>>({});

  const loadLastEstimate = useCallback(async (bookingId: string) => {
    if (!token) return;
    try {
      const r = await fetch(`${API()}/api/employee/bookings/${bookingId}/estimates`, { headers: authH(), cache: "no-store" });
      if (!r.ok) return;
      const d = await r.json() as { ok?: boolean; estimate?: EstimateRecord | null };
      setEstimateHistory(prev => ({ ...prev, [bookingId]: d.estimate ?? null }));
    } catch { /* silent */ }
  }, [token, authH]);

  // Receipt download (employees can grab the same PDF the client got)
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);
  const downloadReceipt = useCallback(async (b: Booking) => {
    if (!token || downloadingReceiptId) return;
    setDownloadingReceiptId(b.id);
    try {
      // Only force ?lang when we actually know the client's language;
      // otherwise let the backend fall back to payment_language → language
      // so the PDF stays in the client's language for older bookings too.
      const langOverride: "en" | "es" | null =
        b.client_lang === "es" ? "es"
        : b.client_lang === "en" ? "en"
        : b.payment_language === "es" ? "es"
        : b.payment_language === "en" ? "en"
        : null;
      const url = `${API()}/api/employee/bookings/${b.id}/invoice-html`
        + (langOverride ? `?lang=${langOverride}` : "");
      await downloadReceiptPdf({
        url,
        headers: { "Authorization": `Bearer ${token}` },
        filenameBase: `receipt-${b.id}`,
      });
    } catch {
      window.alert(t("receiptError"));
    } finally {
      setDownloadingReceiptId(null);
    }
  }, [token, downloadingReceiptId, t]);

  const loadBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetch(`${API()}/api/employee/bookings`, { headers: authH() });
      if (r.status === 401) { logout(); return; }
      const d = await r.json() as { ok?: boolean; bookings?: Booking[] };
      const bks = d.bookings ?? [];
      setBookings(bks);
      setApiErr("");
      // Pre-populate estimate history from embedded fields (new API)
      // then fallback to individual GET calls for bookings without embedded data
      const inlineEstimates: Record<string, EstimateRecord | null> = {};
      const needsFetch: string[] = [];
      for (const b of bks) {
        if (b.status === "completed" || b.employee_archived_at) continue;
        if (b.last_estimate_id != null) {
          inlineEstimates[b.id] = {
            id: b.last_estimate_id,
            total: b.last_estimate_total ?? 0,
            no_tax: b.last_estimate_no_tax ?? false,
            sent_at: b.last_estimate_sent_at ?? "",
            items: b.last_estimate_items ?? [],
            notes: b.last_estimate_notes ?? null,
          };
        } else {
          needsFetch.push(b.id);
        }
      }
      if (Object.keys(inlineEstimates).length > 0) {
        setEstimateHistory(prev => ({ ...prev, ...inlineEstimates }));
      }
      // Only call separate GET for bookings not covered by inline data
      if (needsFetch.length > 0) {
        void Promise.all(needsFetch.map(id => loadLastEstimate(id)));
      }
    } catch { setApiErr(t("connError")); }
    finally { setLoading(false); }
  }, [token, authH, t, loadLastEstimate]);

  const [archivingId, setArchivingId] = useState<string | null>(null);
  const archivingRef = useRef(false);

  const archiveJob = useCallback(async (id: string) => {
    if (!token || archivingRef.current) return;
    archivingRef.current = true;
    setArchivingId(id);
    try {
      const r = await fetch(`${API()}/api/employee/bookings/${id}/archive`, {
        method: "POST", headers: authH(),
      });
      if (r.status === 401) { logout(); return; }
      if (r.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, employee_archived_at: new Date().toISOString() } : b));
      } else if (r.status === 404) {
        // Booking was deleted by admin — remove from local list silently
        setBookings(prev => prev.filter(b => b.id !== id));
      } else {
        const d = await r.json().catch(() => ({})) as { error?: string };
        window.alert(d.error ?? `Error ${r.status}`);
      }
    } catch (e) {
      window.alert("Network error");
      console.error("[archive]", e);
    } finally {
      archivingRef.current = false;
      setArchivingId(null);
    }
  }, [token, authH]);

  const restoreJob = useCallback(async (id: string) => {
    if (!token || archivingRef.current) return;
    archivingRef.current = true;
    setArchivingId(id);
    try {
      const r = await fetch(`${API()}/api/employee/bookings/${id}/unarchive`, {
        method: "POST", headers: authH(),
      });
      if (r.status === 401) { logout(); return; }
      if (r.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, employee_archived_at: null } : b));
      } else if (r.status === 404) {
        setBookings(prev => prev.filter(b => b.id !== id));
      } else {
        const d = await r.json().catch(() => ({})) as { error?: string };
        window.alert(d.error ?? `Error ${r.status}`);
      }
    } catch (e) {
      window.alert("Network error");
      console.error("[restore]", e);
    } finally {
      archivingRef.current = false;
      setArchivingId(null);
    }
  }, [token, authH]);

  const sendReviewSms = useCallback(async (id: string, tFn: (k: string) => string) => {
    if (!token || sendingReviewId) return;
    setSendingReviewId(id);
    try {
      const r = await fetch(`${API()}/api/employee/bookings/${id}/send-review`, {
        method: "POST", headers: authH(),
      });
      if (r.status === 401) { logout(); return; }
      if (r.ok) {
        window.alert(tFn("reviewSent"));
      } else {
        const d = await r.json().catch(() => ({})) as { error?: string };
        window.alert(d.error ?? `Error ${r.status}`);
      }
    } catch {
      window.alert("Network error");
    } finally {
      setSendingReviewId(null);
    }
  }, [token, authH, sendingReviewId]);

  const loadPayroll = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch(`${API()}/api/employee/payroll`, { headers: authH() });
      const d = await r.json() as { ok?: boolean; records?: PayrollRecord[] };
      setPayrollRecords(d.records ?? []);
    } catch { /* silent */ }
  }, [token, authH]);

  const loadProfile = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch(`${API()}/api/employee/me`, { headers: authH() });
      const d = await r.json() as { ok?: boolean; employee?: EmployeeProfile };
      setProfile(d.employee ?? null);
    } catch { /* silent */ }
  }, [token, authH]);

  const loadStats = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch(`${API()}/api/employee/stats`, { headers: authH() });
      const d = await r.json() as { ok?: boolean; stats?: EmpStats };
      if (d.ok && d.stats) setEmpStats(d.stats);
    } catch { /* silent */ }
  }, [token, authH]);

  const loadPhotos = useCallback(async (bookingId: string) => {
    if (!token) return;
    setPhotosLoading(true);
    try {
      const r = await fetch(`${API()}/api/employee/bookings/${bookingId}/photos`, { headers: authH() });
      const d = await r.json() as { ok?: boolean; photos?: Array<{ id: number; url: string | null; created_at: string }> };
      if (r.ok && d.photos) setBookingPhotos(prev => ({ ...prev, [bookingId]: d.photos! }));
    } catch { /* silent */ }
    finally { setPhotosLoading(false); }
  }, [token, authH]);

  const uploadPhotos = useCallback(async (bookingId: string, files: File[]) => {
    if (!token || files.length === 0) return;
    const limited = files.slice(0, 10);
    setUploadProgress({ current: 0, total: limited.length });
    let failed = 0;
    try {
      for (let i = 0; i < limited.length; i++) {
        setUploadProgress({ current: i + 1, total: limited.length });
        try {
          const r1 = await fetch(`${API()}/api/employee/bookings/${bookingId}/photos/request-url`, { method: "POST", headers: authH() });
          const d1 = await r1.json() as { ok?: boolean; signedUrl?: string; objectKey?: string; error?: string };
          if (!r1.ok || !d1.signedUrl || !d1.objectKey) throw new Error(d1.error ?? "no url");
          await fetch(d1.signedUrl, { method: "PUT", headers: { "Content-Type": limited[i].type || "image/jpeg" }, body: limited[i] });
          const r2 = await fetch(`${API()}/api/employee/bookings/${bookingId}/photos`, {
            method: "POST", headers: authH(), body: JSON.stringify({ objectKey: d1.objectKey }),
          });
          if (!r2.ok) throw new Error("register failed");
        } catch { failed++; }
      }
      await loadPhotos(bookingId);
      if (failed > 0) window.alert(`${t("photoUploadFail")}: ${failed}/${limited.length}`);
    } finally {
      setUploadProgress(null);
    }
  }, [token, authH, loadPhotos, t]);

  const deletePhoto = useCallback(async (bookingId: string, photoId: number) => {
    if (!token) return;
    await fetch(`${API()}/api/employee/bookings/${bookingId}/photos/${photoId}`, { method: "DELETE", headers: authH() });
    setBookingPhotos(prev => ({ ...prev, [bookingId]: (prev[bookingId] ?? []).filter(p => p.id !== photoId) }));
  }, [token, authH]);

  const openPhotoModal = useCallback((bookingId: string) => {
    setPhotoModalId(bookingId);
    void loadPhotos(bookingId);
  }, [loadPhotos]);

  useEffect(() => {
    if (!token) return;
    // Clear badge and record the current time as "seen" timestamp
    clearAppBadge();
    notifySwBadgeClear();
    localStorage.setItem(EMP_LAST_SEEN_KEY, new Date().toISOString());
    // Sync new lastSeenAt to SW so background sync uses the fresh value
    notifySwBadgeInit(token);
    loadBookings();
    loadPayroll();
    loadProfile();
    loadStats();
  }, [token, loadBookings, loadPayroll, loadProfile, loadStats]);

  // Clear badge and reload when employee returns to the app after minimising
  useEffect(() => {
    if (!token) return;
    const onVisChange = () => {
      if (!document.hidden) {
        clearAppBadge();
        notifySwBadgeClear();
        localStorage.setItem(EMP_LAST_SEEN_KEY, new Date().toISOString());
        notifySwBadgeInit(token);
        void loadBookings();
      }
    };
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, [token, loadBookings]);

  // ── Masked Call (employee → client via 606) ────────────────────────────────
  const [empCallLoading, setEmpCallLoading] = useState<Set<string>>(new Set());

  const handleEmpCallback = useCallback(async (
    clientPhone: string, bookingId: string,
    clientName?: string, clientLang?: string,
    clientGender: "male" | "female" = "male",
  ): Promise<{ ok: boolean; text: string }> => {
    if (empCallLoading.has(bookingId)) return { ok: false, text: "Already loading" };
    setEmpCallLoading(prev => new Set(prev).add(bookingId));
    try {
      const r = await fetch(`${API()}/api/employee/voice/callback`, {
        method: "POST",
        headers: { ...authH(), "Content-Type": "application/json" },
        body: JSON.stringify({ client_phone: clientPhone, client_name: clientName ?? "", client_language: clientLang ?? "en", client_gender: clientGender }),
      });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (!r.ok) throw new Error(d.error ?? "Error");
      return { ok: true, text: "📞 Ваш телефон скоро зазвонит с номера (606). Ответьте — система соединит с клиентом." };
    } catch (err) {
      return { ok: false, text: err instanceof Error ? err.message : "Ошибка звонка" };
    } finally {
      setEmpCallLoading(prev => { const s = new Set(prev); s.delete(bookingId); return s; });
    }
  }, [empCallLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── AI Translator ──────────────────────────────────────────────────────────
  const isTokenExpired = useCallback((): boolean => {
    const stored = loadStoredToken();
    if (!stored) return true;
    try {
      const payload = JSON.parse(atob(stored.token.split(".")[1])) as { exp?: number };
      return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
    } catch { return true; }
  }, []);

  const openTranslator = useCallback(() => {
    if (isTokenExpired()) {
      logout();
      return;
    }
    setTranslatorOpen(true);
    setTranslatorResult(null);
    setTranslatorOrig("");
    setTranslatorError("");
  }, [isTokenExpired, logout]);

  const [translatorOpen,      setTranslatorOpen]      = useState(false);
  const [translatorListening, setTranslatorListening] = useState(false);
  const [translatorLang,         setTranslatorLang]         = useState("ru-RU");
  const [translatorCustomerLang, setTranslatorCustomerLang] = useState("en-US");
  const [translatorPickerFor,    setTranslatorPickerFor]    = useState<"me" | "customer">("me");
  const [translatorOrig,         setTranslatorOrig]         = useState("");
  const [translatorResult,    setTranslatorResult]    = useState<{ detected: string; target: string; translation: string } | null>(null);
  const [translatorLoading,   setTranslatorLoading]   = useState(false);
  const [translatorError,     setTranslatorError]     = useState("");
  const [translatorAudioUrl,  setTranslatorAudioUrl]  = useState<string | null>(null);
  const [translatorContinuous, setTranslatorContinuous] = useState(false);
  const [translatorPhase, setTranslatorPhase] = useState<"idle" | "listening" | "translating" | "speaking">("idle");
  const continuousRef = useRef(false);
  type SRInstance = {
    lang: string; interimResults: boolean; maxAlternatives: number;
    start(): void; stop(): void;
    onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
    onerror: ((e: { error?: string }) => void) | null;
    onend: (() => void) | null;
  };
  const recognitionRef  = useRef<SRInstance | null>(null);
  const srTimeoutRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSrTimeout = useCallback(() => {
    if (srTimeoutRef.current) { clearTimeout(srTimeoutRef.current); srTimeoutRef.current = null; }
  }, []);

  const stopListening = useCallback(() => {
    clearSrTimeout();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setTranslatorListening(false);
  }, [clearSrTimeout]);

  const startListening = useCallback((myLang: string, customerLang: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as (new() => SRInstance) | undefined;
    if (!SR) { setTranslatorError("Speech recognition not supported in this browser"); return; }
    stopListening();
    const rec = new SR();
    rec.lang = myLang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;
    setTranslatorListening(true);
    setTranslatorPhase("listening");
    setTranslatorOrig("");
    setTranslatorResult(null);
    setTranslatorError("");

    // Auto-stop after 20 s to prevent freezing
    srTimeoutRef.current = setTimeout(() => {
      rec.stop();
      setTranslatorListening(false);
      setTranslatorError("No speech detected — tap mic and try again");
    }, 20000);

    const myInfo       = TRANSLATOR_LANGS.find(l => l.code === myLang)       ?? TRANSLATOR_LANGS[0];
    const customerInfo = TRANSLATOR_LANGS.find(l => l.code === customerLang) ?? TRANSLATOR_LANGS[1];

    rec.onresult = (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
      clearSrTimeout();
      const text = (event.results[0] as ArrayLike<{ transcript: string }>)?.[0]?.transcript ?? "";
      // Stop mic IMMEDIATELY so TTS plays through speaker (not earpiece)
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setTranslatorListening(false);
      setTranslatorOrig(text);
      if (!text) {
        if (continuousRef.current) setTimeout(() => startListening(myLang, customerLang), 500);
        else setTranslatorPhase("idle");
        return;
      }
      setTranslatorLoading(true);
      setTranslatorPhase("translating");
      fetch(`${API()}/api/employee/translate`, {
        method: "POST",
        headers: { ...authH(), "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          myLang:          myInfo.label,
          myLangCode:      myInfo.bcp.split("-")[0],
          customerLang:    customerInfo.label,
          customerLangCode: customerInfo.bcp.split("-")[0],
        }),
      })
        .then(async r => {
          if (r.status === 401 || r.status === 403) {
            continuousRef.current = false; setTranslatorContinuous(false);
            logout(); return null;
          }
          return r.json() as Promise<{ ok?: boolean; detected?: string; target?: string; translation?: string; error?: string }>;
        })
        .then(d => {
          if (!d) return;
          if (d.ok && d.translation) {
            const result = { detected: d.detected!, target: d.target!, translation: d.translation };
            setTranslatorResult(result);
            setTranslatorPhase("speaking");
            const afterPlay = () => {
              if (continuousRef.current) {
                setTranslatorPhase("listening");
                setTimeout(() => startListening(myLang, customerLang), 400);
              } else {
                setTranslatorPhase("idle");
              }
            };
            // OpenAI TTS → <audio> element → always plays through speaker on iOS
            fetch(`${API()}/api/employee/tts`, {
              method: "POST",
              headers: { ...authH(), "Content-Type": "application/json" },
              body: JSON.stringify({ text: result.translation, lang: result.target }),
            })
              .then(async ttsRes => {
                if (!ttsRes.ok) throw new Error("TTS failed");
                const blob = await ttsRes.blob();
                const url = URL.createObjectURL(blob);
                setTranslatorAudioUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
                const audio = new Audio(url);
                audio.onended = afterPlay;
                audio.onerror = afterPlay;
                return audio.play();
              })
              .catch(() => {
                const utter = new SpeechSynthesisUtterance(result.translation);
                utter.lang = TRANSLATOR_LANGS.find(l => l.bcp.startsWith(result.target + "-") || l.bcp === result.target)?.bcp ?? "en-US";
                utter.onend = afterPlay;
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utter);
              });
          } else {
            setTranslatorError(d.error ?? "Translation failed");
            setTranslatorPhase("idle");
            continuousRef.current = false; setTranslatorContinuous(false);
          }
        })
        .catch(() => {
          setTranslatorError("Network error — check your internet connection");
          setTranslatorPhase("idle");
          continuousRef.current = false; setTranslatorContinuous(false);
        })
        .finally(() => setTranslatorLoading(false));
    };

    rec.onerror = (e: { error?: string }) => {
      clearSrTimeout();
      setTranslatorListening(false);
      setTranslatorPhase("idle");
      const code = e?.error ?? "";
      if (code === "aborted") {
        // intentional stop — don't show error, don't break continuous
        return;
      }
      continuousRef.current = false; setTranslatorContinuous(false);
      setTranslatorError(
        code === "not-allowed"            ? "❌ Microphone blocked — go to Settings › Safari › Microphone and allow" :
        code === "no-speech"              ? "No speech detected — tap mic and try again" :
        code === "language-not-supported" ? "This language is not supported by your browser for recording" :
        code === "network"                ? "Network error — check your internet connection" :
        `Microphone error: ${code || "unknown"}`
      );
    };

    rec.onend = () => { clearSrTimeout(); setTranslatorListening(false); };

    try {
      rec.start();
    } catch {
      clearSrTimeout();
      setTranslatorListening(false);
      setTranslatorError("Failed to start microphone — tap mic to try again");
    }
  }, [stopListening, clearSrTimeout, logout]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleConversation = useCallback((myLang: string, customerLang: string) => {
    if (continuousRef.current) {
      // STOP conversation
      continuousRef.current = false;
      setTranslatorContinuous(false);
      setTranslatorPhase("idle");
      stopListening();
      window.speechSynthesis.cancel();
    } else {
      // START conversation
      continuousRef.current = true;
      setTranslatorContinuous(true);
      setTranslatorError("");
      setTranslatorResult(null);
      setTranslatorOrig("");
      startListening(myLang, customerLang);
    }
  }, [startListening, stopListening]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Email Edit ─────────────────────────────────────────────────────────────
  const [emailEditId,    setEmailEditId]    = useState<string | null>(null);
  const [emailEditVal,   setEmailEditVal]   = useState("");
  const [emailEditSaving, setEmailEditSaving] = useState(false);
  const [emailEditMsg,   setEmailEditMsg]   = useState<{ ok: boolean; text: string } | null>(null);

  const saveClientEmail = async (bookingId: string) => {
    const val = emailEditVal.trim().toLowerCase();
    if (!val.includes("@") || !val.includes(".")) return;
    setEmailEditSaving(true);
    setEmailEditMsg(null);
    try {
      const r = await fetch(`${API()}/api/employee/bookings/${bookingId}/email`, {
        method: "PATCH",
        headers: { ...authH(), "Content-Type": "application/json" },
        body: JSON.stringify({ email: val }),
      });
      const d = await r.json() as { ok?: boolean; email?: string; error?: string };
      if (r.ok && d.ok && d.email) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, email: d.email! } : b));
        setEmailEditMsg({ ok: true, text: t("emailSaved") });
        setTimeout(() => { setEmailEditId(null); setEmailEditMsg(null); }, 1500);
      } else {
        setEmailEditMsg({ ok: false, text: d.error ?? t("emailSaveErr") });
      }
    } catch {
      setEmailEditMsg({ ok: false, text: t("emailSaveErr") });
    } finally {
      setEmailEditSaving(false);
    }
  };

  // ── Close Job Modal ────────────────────────────────────────────────────────
  const [closeTarget, setCloseTarget] = useState<Booking | null>(null);
  const [closeAmount, setCloseAmount] = useState("");
  const [closeWork,   setCloseWork]   = useState("");
  const [closeParts,  setCloseParts]  = useState<string[]>([]);
  const [closePayment, setClosePayment] = useState<"cash" | "zelle" | "tap_to_pay" | "online">("cash");
  const [closeNotify, setCloseNotify] = useState<"email" | "sms" | "both">("email");
  const [closeLang,   setCloseLang]   = useState<"en" | "es">("en");
  const [closing,     setClosing]     = useState(false);
  const [closeErr,    setCloseErr]    = useState("");
  const [closePartsCost, setClosePartsCost] = useState("");
  const [closeTax,       setCloseTax]       = useState(true);

  // ── Photo Upload State ─────────────────────────────────────────────────────
  const [photoModalId,    setPhotoModalId]    = useState<string | null>(null);
  const [bookingPhotos,   setBookingPhotos]   = useState<Record<string, Array<{ id: number; url: string | null; created_at: string }>>>({});
  const [photosLoading,   setPhotosLoading]   = useState(false);
  const [uploadProgress,  setUploadProgress]  = useState<{ current: number; total: number } | null>(null);

  // ── Signature State ────────────────────────────────────────────────────────
  const signatureRef    = useRef<HTMLCanvasElement>(null);
  const sigDrawingRef   = useRef(false);
  const [sigHasData,      setSigHasData]      = useState(false);
  const [sigConsentGiven, setSigConsentGiven] = useState(true);

  // ── Estimate Modal ─────────────────────────────────────────────────────────
  const [estimateTarget,  setEstimateTarget]  = useState<Booking | null>(null);
  const [estimateItems,   setEstimateItems]   = useState<EstimateLineItem[]>([]);
  const [estimateNotes,   setEstimateNotes]   = useState("");
  const [pricebook,       setPricebook]       = useState<PricebookItem[]>([]);
  const [estimateNoTax,   setEstimateNoTax]   = useState(false);
  const [estimateNotify,  setEstimateNotify]  = useState<"email" | "sms" | "both">("email");
  const [estimateSending, setEstimateSending] = useState(false);
  const [estimateErr,     setEstimateErr]     = useState("");
  const [estimateDone,    setEstimateDone]    = useState(false);
  const [estimateIsEdit,  setEstimateIsEdit]  = useState(false);

  const loadPricebook = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch(`${API()}/api/employee/pricebook`, { headers: authH() });
      const d = await r.json() as { ok?: boolean; items?: PricebookItem[] };
      setPricebook(d.items ?? []);
    } catch { /* silent */ }
  }, [token, authH]);

  const openEstimateModal = (b: Booking, prev?: EstimateRecord) => {
    setEstimateTarget(b);
    setEstimateIsEdit(!!prev);
    if (prev && prev.items.length > 0) {
      setEstimateItems(prev.items);
      setEstimateNotes(prev.notes ?? "");
      setEstimateNoTax(prev.no_tax);
    } else {
      setEstimateItems([{ description: "", category: "Labor", qty: 1, unit_price: 0 }]);
      setEstimateNotes("");
      setEstimateNoTax(false);
    }
    setEstimateErr("");
    setEstimateDone(false);
    const hasEmail = !!b.email?.trim();
    const hasPhone = !!b.phone?.trim();
    setEstimateNotify(hasEmail && hasPhone ? "both" : hasEmail ? "email" : "sms");
    void loadPricebook();
  };

  const addEstimateItem = () =>
    setEstimateItems(prev => [...prev, { description: "", category: "Labor", qty: 1, unit_price: 0 }]);

  const removeEstimateItem = (i: number) =>
    setEstimateItems(prev => prev.filter((_, idx) => idx !== i));

  const setEstimateItemField = (i: number, field: keyof EstimateLineItem, value: string | number) =>
    setEstimateItems(prev => prev.map((item, idx) =>
      idx === i ? { ...item, [field]: value } : item,
    ));

  const addFromPricebook = (pb: PricebookItem) =>
    setEstimateItems(prev => [...prev, {
      description: pb.name,
      category:    pb.category,
      qty:         1,
      unit_price:  Number(pb.unit_price),
    }]);

  const submitEstimate = async () => {
    if (!estimateTarget) return;
    const validItems = estimateItems.filter(i => i.description.trim() && i.unit_price >= 0);
    if (!validItems.length) { setEstimateErr(t("estimateItems") + " required"); return; }
    setEstimateSending(true);
    setEstimateErr("");
    try {
      const r = await fetch(`${API()}/api/employee/bookings/${estimateTarget.id}/estimate`, {
        method: "POST",
        headers: authH(),
        body: JSON.stringify({ items: validItems, notes: estimateNotes.trim() || null, no_tax: estimateNoTax, notify_via: estimateNotify }),
      });
      const d = await r.json() as { ok?: boolean; error?: string; estimate_id?: number; total?: number };
      if (!r.ok || !d.ok) { setEstimateErr(d.error ?? t("estimateErr")); return; }
      setEstimateDone(true);
      // Update badge directly from POST response — works even if GET /estimates returns 404
      if (d.estimate_id != null && d.total != null) {
        const targetId = estimateTarget.id;
        setEstimateHistory(prev => ({
          ...prev,
          [targetId]: {
            id: d.estimate_id!,
            total: d.total!,
            no_tax: estimateNoTax,
            sent_at: new Date().toISOString(),
            items: validItems,
            notes: estimateNotes.trim() || null,
          },
        }));
      } else {
        void loadLastEstimate(estimateTarget.id);
      }
      setTimeout(() => setEstimateTarget(null), 1800);
    } catch {
      setEstimateErr(t("estimateErr"));
    } finally {
      setEstimateSending(false);
    }
  };

  const openCloseModal = (b: Booking) => {
    setCloseTarget(b);
    setCloseAmount("");
    setCloseWork("");
    setCloseParts([]);
    setClosePayment("cash");
    setClosePartsCost("");
    setCloseTax(true);
    // Default notify method: email if available, else sms
    const hasEmail = !!b.email?.trim();
    const hasPhone = !!b.phone?.trim();
    setCloseNotify(hasEmail ? "email" : hasPhone ? "sms" : "email");
    // Default the language toggle to the client's saved preference
    // (falling back to payment_language for older bookings, then English).
    const savedLang: "en" | "es" =
      b.client_lang === "es" ? "es"
      : b.client_lang === "en" ? "en"
      : b.payment_language === "es" ? "es"
      : b.payment_language === "en" ? "en"
      : "en";
    setCloseLang(savedLang);
    setCloseErr("");
    setSigHasData(false);
    setSigConsentGiven(true);
  };

  const addPart = () => setCloseParts(p => [...p, ""]);
  const removePart = (i: number) => setCloseParts(p => p.filter((_, idx) => idx !== i));
  const setPart = (i: number, v: string) =>
    setCloseParts(p => p.map((x, idx) => idx === i ? v : x));

  // ── Signature canvas drawing ───────────────────────────────────────────────
  const getCanvasPt = (cv: HTMLCanvasElement, cx: number, cy: number) => {
    const r = cv.getBoundingClientRect();
    return { x: (cx - r.left) * (cv.width / r.width), y: (cy - r.top) * (cv.height / r.height) };
  };
  const sigStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cv = signatureRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    sigDrawingRef.current = true;
    const p = getCanvasPt(cv, e.clientX, e.clientY);
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
  };
  const sigMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!sigDrawingRef.current) return;
    const cv = signatureRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const p = getCanvasPt(cv, e.clientX, e.clientY);
    ctx.lineTo(p.x, p.y); ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke();
    if (!sigHasData) setSigHasData(true);
  };
  const sigTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const cv = signatureRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    sigDrawingRef.current = true;
    const t0 = e.touches[0];
    const p = getCanvasPt(cv, t0.clientX, t0.clientY);
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
  };
  const sigTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!sigDrawingRef.current) return;
    const cv = signatureRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const t0 = e.touches[0];
    const p = getCanvasPt(cv, t0.clientX, t0.clientY);
    ctx.lineTo(p.x, p.y); ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke();
    if (!sigHasData) setSigHasData(true);
  };
  const sigStop = () => { sigDrawingRef.current = false; };
  const clearSig = () => {
    const cv = signatureRef.current;
    if (cv) cv.getContext("2d")?.clearRect(0, 0, cv.width, cv.height);
    setSigHasData(false);
  };

  const submitClose = async () => {
    if (!closeTarget) return;
    const amount = parseFloat(closeAmount);
    if (!closeAmount || !Number.isFinite(amount)) { setCloseErr(t("repairAmountReq")); return; }
    if (!closeWork.trim()) { setCloseErr(t("workPerformedReq")); return; }

    setClosing(true);
    setCloseErr("");
    try {
      // Capture signature BEFORE sending close request (canvas still mounted here)
      const capturedSig     = sigHasData && signatureRef.current ? signatureRef.current.toDataURL("image/png") : null;
      const capturedConsent = sigConsentGiven;

      const partsCostVal = parseFloat(closePartsCost);
      const r = await fetch(`${API()}/api/employee/bookings/${closeTarget.id}/close`, {
        method: "POST",
        headers: authH(),
        body: JSON.stringify({
          payment_method:  closePayment === "cash" ? "Cash" : closePayment === "zelle" ? "Zelle" : closePayment === "tap_to_pay" ? "Tap to Pay (Stripe)" : "Online (Stripe)",
          payment_amount:  amount,
          work_description: closeWork.trim(),
          parts_replaced:  closeParts.map(p => p.trim()).filter(Boolean),
          suggest_review:  true,
          lang:            closeLang,
          parts_cost:      Number.isFinite(partsCostVal) ? partsCostVal : null,
          notify_via:      closePayment === "online" && (closeTarget?.email || closeTarget?.phone) ? closeNotify : undefined,
          no_tax:             !closeTax,
          signature_data_url: capturedSig,
          signature_consent:  capturedConsent,
        }),
      });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (!r.ok || !d.ok) { setCloseErr(d.error ?? t("errorClosing")); return; }

      const capturedAuthH   = authH();
      const closedId = closeTarget.id;
      setCloseTarget(null);
      setSigHasData(false);
      setSigConsentGiven(true);

      // Save signature to storage (non-blocking, for DB record)
      if (capturedSig) {
        void fetch(`${API()}/api/employee/bookings/${closedId}/signature`, {
          method: "POST", headers: capturedAuthH,
          body: JSON.stringify({ imageData: capturedSig, consentGiven: capturedConsent }),
        }).catch(() => {});
      }

      // Card goes green for 2s then reloads
      setJustClosedId(closedId);
      if (greenTimerRef.current) clearTimeout(greenTimerRef.current);
      greenTimerRef.current = setTimeout(async () => {
        setJustClosedId(null);
        await loadBookings();
        void loadStats();
      }, 2000);

    } catch {
      setCloseErr(t("connError"));
    } finally {
      setClosing(false);
    }
  };

  const LangPicker = () => {
    const langs: {code: EmpLang, flag: string}[] = [
      {code: "en", flag: "🇺🇸"},
      {code: "ru", flag: "🇷🇺"},
      {code: "es", flag: "🇪🇸"},
      {code: "tr", flag: "🇹🇷"},
      {code: "az", flag: "🇦🇿"},
      {code: "uk", flag: "🇺🇦"},
    ];
    return (
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 }}>
        {langs.map(l => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: lang === l.code ? `1.5px solid ${ACCENT}` : "1.5px solid #e2e8f0",
              background: lang === l.code ? "#f0f7ff" : "#fff",
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>{l.flag}</span>
            <span style={{ fontWeight: lang === l.code ? 700 : 400, textTransform: "uppercase" }}>{l.code}</span>
          </button>
        ))}
      </div>
    );
  };

  // ── Checking spinner ────────────────────────────────────────────────────────
  if (empScreen === "checking" && !token) {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "#0f172a",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999,
      }}>
        <div style={{
          width: 40, height: 40, border: "3px solid #1B6FE8",
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes ping { 75%,100% { transform: scale(1.8); opacity: 0; } }`}</style>
      </div>
    );
  }

  // ── Register Face ID screen (shown after password login on mobile) ──────────
  if (empScreen === "register-fid" && token) {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "#0f172a",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 99999, padding: "20px",
      }}>
        <div style={{
          background: "#fff", borderRadius: 20, padding: "36px 28px",
          width: "min(380px, 100%)", textAlign: "center",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🔒</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
            {t("fidEnableTitle")}
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>
            {t("fidEnableDesc")}
          </p>
          <button
            onClick={() => void handleRegisterFaceID()}
            disabled={loggingIn}
            style={{
              width: "100%", padding: "13px", marginBottom: 10,
              background: loggingIn ? "#93c5fd" : ACCENT,
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: 15, fontWeight: 600,
              cursor: loggingIn ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <span style={{ fontSize: 20 }}>👤</span>
            {loggingIn ? t("fidRegistering") : t("fidEnable")}
          </button>
          <button
            onClick={() => setEmpScreen("checking")}
            disabled={loggingIn}
            style={{
              width: "100%", padding: "12px",
              background: "transparent", color: "#64748b",
              border: "1.5px solid #e2e8f0", borderRadius: 10,
              fontSize: 14, cursor: loggingIn ? "not-allowed" : "pointer",
            }}
          >
            {t("fidSkip")}
          </button>
          {loginErr && <p style={{ marginTop: 10, color: "#ef4444", fontSize: 13 }}>{loginErr}</p>}
        </div>
      </div>
    );
  }

  // ── Login screen ───────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div style={{
        minHeight: "100dvh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Side logos — left */}
        <img
          src="/htr-logo-nobg.png"
          alt=""
          aria-hidden="true"
          className="emp-side-logo emp-side-logo-left"
          style={{
            position: "absolute",
            left: 4,
            top: "50%",
            transform: "translateY(-50%)",
            objectFit: "contain",
            opacity: 0.75,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
        {/* Side logos — right */}
        <img
          src="/htr-logo-nobg.png"
          alt=""
          aria-hidden="true"
          className="emp-side-logo emp-side-logo-right"
          style={{
            position: "absolute",
            right: 4,
            top: "50%",
            transform: "translateY(-50%)",
            objectFit: "contain",
            opacity: 0.75,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
        <div style={{
          width: "100%",
          maxWidth: 360,
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
          padding: "32px 24px",
          position: "relative",
          zIndex: 1,
        }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: ACCENT, margin: "0 auto 12px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Wrench style={{ width: 28, height: 28, color: "#fff" }} />
            </div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>HTRGroup</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{t("title")}</div>
          </div>

          <LangPicker />

          {/* Face ID button — shown when this device has a registered credential */}
          {deviceHasFid && (
            <button
              onClick={() => { const c = localStorage.getItem(EMP_FID_KEY) ?? ""; void triggerEmpFaceID(c); }}
              disabled={loggingIn}
              style={{
                width: "100%", padding: "16px", marginBottom: 8,
                background: loggingIn ? "#f1f5f9" : "#0f172a",
                color: loggingIn ? "#94a3b8" : "#fff",
                border: "none", borderRadius: 12,
                fontSize: 16, fontWeight: 700,
                cursor: loggingIn ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
            >
              <span style={{ fontSize: 22 }}>👤</span>
              {loggingIn ? t("fidChecking") : t("fidSignIn")}
            </button>
          )}

          {loginErr && (
            <p style={{ margin: "0 0 10px", fontSize: 13, color: "#ef4444", textAlign: "center" }}>{loginErr}</p>
          )}

          {/* "Login with password" link when Face ID is available */}
          {deviceHasFid && !showLoginForm && (
            <button
              onClick={() => { setShowLoginForm(true); setLoginErr(""); }}
              style={{
                width: "100%", padding: "10px",
                background: "transparent", color: "#64748b",
                border: "none", fontSize: 13,
                cursor: "pointer", textDecoration: "underline",
              }}
            >
              {t("fidUsePassword")}
            </button>
          )}

          {/* Password login form */}
          {showLoginForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: deviceHasFid ? 8 : 0 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                  {t("phone")}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && void login()}
                  placeholder="(346) 000-0000"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 10, padding: "12px 14px",
                    fontSize: 15, outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                  {t("pin")}
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && void login()}
                  placeholder="••••••••"
                  autoFocus={!deviceHasFid}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 10, padding: "12px 14px",
                    fontSize: 15, outline: "none",
                  }}
                />
              </div>
              {!deviceHasFid && loginErr && (
                <p style={{ margin: 0, fontSize: 13, color: "#ef4444", textAlign: "center" }}>{loginErr}</p>
              )}
              <Btn onClick={() => void login()} disabled={loggingIn || !phone || !pin}>
                {loggingIn ? t("signingIn") : t("signIn")}
              </Btn>
            </div>
          )}
        </div>
        <p style={{ marginTop: 16, fontSize: 12, color: "#94a3b8", position: "relative", zIndex: 1, textAlign: "center" }}>HTRGroup CRM · hitechrepairgroup@gmail.com</p>
        <p style={{ marginTop: 6, fontSize: 11, color: "#cbd5e1", position: "relative", zIndex: 1, textAlign: "center" }}>Developed by Eivaz Rakhmanov</p>
      </div>
    );
  }

  // ── Main portal ─────────────────────────────────────────────────────────────
  const matchesSearch = (b: Booking, q: string): boolean => {
    if (!q.trim()) return true;
    const lq = q.toLowerCase();
    return (
      b.name.toLowerCase().includes(lq) ||
      b.phone.toLowerCase().includes(lq) ||
      b.address.toLowerCase().includes(lq) ||
      b.preferred_date.includes(lq) ||
      (b.appliance?.toLowerCase().includes(lq) ?? false) ||
      (b.brand_model?.toLowerCase().includes(lq) ?? false)
    );
  };
  const activeJobs    = bookings.filter(b => b.status !== "completed" && matchesSearch(b, jobSearch));
  const completedJobs = bookings.filter(b => b.status === "completed" && !b.employee_archived_at && matchesSearch(b, jobSearch));
  const archivedJobs  = bookings.filter(b => b.status === "completed" && !!b.employee_archived_at && matchesSearch(b, jobSearch));

  return (
    <div style={{ height: "100dvh", background: "#f8fafc", position: "relative", overflow: "hidden" }}>
      {/* Side logos — left */}
      <img
        src="/htr-logo-nobg.png"
        alt=""
        aria-hidden="true"
        className="emp-side-logo emp-side-logo-left"
        style={{
          position: "absolute",
          left: 4,
          bottom: 80,
          objectFit: "contain",
          opacity: 0.75,
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}
      />
      {/* Side logos — right */}
      <img
        src="/htr-logo-nobg.png"
        alt=""
        aria-hidden="true"
        className="emp-side-logo emp-side-logo-right"
        style={{
          position: "absolute",
          right: 4,
          bottom: 80,
          objectFit: "contain",
          opacity: 0.75,
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}
      />
      <div
        className="emp-main-inner"
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          maxWidth: 480,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
      {/* Developer credit */}
      <div style={{
        background: "#0f172a",
        color: "#94a3b8",
        fontSize: 11,
        textAlign: "center",
        padding: "4px 12px",
        letterSpacing: "0.03em",
      }}>
        Developed by <span style={{ color: "#e2e8f0", fontWeight: 600 }}>Eivaz Rakhmanov</span>
      </div>

      {/* Header */}
      <header style={{
        background: "#fff",
        borderBottom: "1px solid #f1f5f9",
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <img
            src="/htr-logo-nobg.png"
            alt="HTR Group TX"
            style={{ width: 72, height: 48, borderRadius: 8, objectFit: "contain" }}
          />
          <div style={{ marginLeft: 2 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1 }}>{t("hello")}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{empName}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as EmpLang)}
            style={{
              padding: "4px 8px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
              background: "#fff",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="en">🇺🇸 EN</option>
            <option value="ru">🇷🇺 RU</option>
            <option value="es">🇪🇸 ES</option>
            <option value="tr">🇹🇷 TR</option>
            <option value="az">🇦🇿 AZ</option>
            <option value="uk">🇺🇦 UK</option>
          </select>

          {/* AI Translator button */}
          <button
            onClick={openTranslator}
            title="AI Translator"
            style={{
              minHeight: 36, padding: "0 10px",
              background: "transparent", border: "1px solid #c7d2fe",
              borderRadius: 8, color: "#4f46e5",
              fontSize: 13, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <Languages style={{ width: 15, height: 15 }} />
          </button>

          <button
            onClick={logout}
            style={{
              minHeight: 36, padding: "0 12px",
              background: "transparent", border: "1px solid #fecaca",
              borderRadius: 8, color: "#ef4444",
              fontSize: 13, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <LogOut style={{ width: 14, height: 14 }} /> {t("logout")}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{
        display: "flex",
        background: "#fff",
        borderBottom: "1px solid #f1f5f9",
      }}>
        {(["jobs", "stats", "payroll", "profile"] as Tab[]).map(tb => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            style={{
              flex: 1, minHeight: 44,
              background: "transparent", border: "none",
              borderBottom: tab === tb ? `2.5px solid ${ACCENT}` : "2.5px solid transparent",
              color: tab === tb ? ACCENT : "#94a3b8",
              fontSize: 12, fontWeight: 700,
              cursor: "pointer", transition: "color 0.15s",
            }}
          >
            {tb === "jobs" ? t("myJobs")
              : tb === "stats" ? t("statsTab")
              : tb === "payroll" ? t("payroll")
              : t("profile")}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", paddingBottom: 32 }}>

        {/* ── JOBS TAB ── */}
        {tab === "jobs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Search bar */}
            <div style={{ position: "relative" }}>
              <Search style={{
                position: "absolute", left: 10, top: "50%",
                transform: "translateY(-50%)",
                width: 14, height: 14, color: "#94a3b8", pointerEvents: "none",
              }} />
              <input
                type="search"
                value={jobSearch}
                onChange={e => setJobSearch(e.target.value)}
                placeholder={t("searchJobs")}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "8px 32px 8px 30px",
                  border: "1.5px solid #e2e8f0", borderRadius: 10,
                  fontSize: 13, outline: "none", background: "#fff",
                  color: "#0f172a",
                }}
              />
              {jobSearch && (
                <button
                  onClick={() => setJobSearch("")}
                  style={{
                    position: "absolute", right: 8, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#94a3b8", fontSize: 16, lineHeight: 1, padding: 2,
                  }}
                >×</button>
              )}
            </div>

            {/* Sub-tab bar + refresh */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Sub-tabs */}
              <div style={{
                display: "flex", flex: 1,
                background: "#f1f5f9", borderRadius: 10, padding: 3, gap: 2,
              }}>
                {(["active", "completed", "archived"] as const).map(st => {
                  const count = st === "active" ? activeJobs.length : st === "completed" ? completedJobs.length : archivedJobs.length;
                  const label = st === "active" ? t("tabActive") : st === "completed" ? t("completed") : t("archived");
                  const isActive = jobsTab === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setJobsTab(st)}
                      style={{
                        flex: 1, minHeight: 30,
                        background: isActive ? "#fff" : "transparent",
                        border: "none",
                        borderRadius: 8,
                        boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
                        color: isActive ? ACCENT : "#94a3b8",
                        fontSize: 11, fontWeight: 700,
                        cursor: "pointer", transition: "all 0.15s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                      }}
                    >
                      {st === "archived" && <Archive style={{ width: 10, height: 10 }} />}
                      {label}
                      {count > 0 && (
                        <span style={{
                          background: isActive ? ACCENT : "#cbd5e1",
                          color: "#fff",
                          borderRadius: 10, padding: "1px 5px",
                          fontSize: 10, fontWeight: 700, lineHeight: 1.4,
                        }}>{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Refresh */}
              <button
                onClick={() => void loadBookings()}
                disabled={loading}
                style={{
                  background: "transparent", border: "none",
                  fontSize: 12, fontWeight: 600, color: "#64748b",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                  padding: "4px 8px", borderRadius: 6, flexShrink: 0,
                }}
              >
                <RefreshCw style={{ width: 13, height: 13 }} className={loading ? "animate-spin" : ""} />
                {t("refresh")}
              </button>
            </div>

            {apiErr && <p style={{ fontSize: 12, color: "#ef4444", textAlign: "center" }}>{apiErr}</p>}

            {loading && bookings.length === 0 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <RefreshCw style={{ width: 24, height: 24, color: "#cbd5e1" }} className="animate-spin" />
              </div>
            )}

            {/* Active jobs sub-tab */}
            {jobsTab === "active" && (
              <>
                {!loading && activeJobs.length === 0 && (
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "48px 0", gap: 8, color: "#94a3b8",
                  }}>
                    <Wrench style={{ width: 40, height: 40, opacity: 0.2 }} />
                    <p style={{ margin: 0, fontSize: 14 }}>{t("noJobs")}</p>
                  </div>
                )}
                {activeJobs.map(b => (
                  <JobCard
                    key={b.id}
                    b={b}
                    justClosed={b.id === justClosedId}
                    isHighlighted={!!jobSearch.trim()}
                    onClose={() => openCloseModal(b)}
                    onEstimate={() => openEstimateModal(b)}
                    onEditEstimate={estimateHistory[b.id] ? () => openEstimateModal(b, estimateHistory[b.id]!) : undefined}
                    lastEstimate={estimateHistory[b.id]}
                    onPhotos={() => openPhotoModal(b.id)}
                    photoCount={(bookingPhotos[b.id] ?? []).length}
                    onDownloadReceipt={() => downloadReceipt(b)}
                    downloadingReceipt={downloadingReceiptId === b.id}
                    onEmpCallback={b.phone ? (gender) => handleEmpCallback(b.phone!, b.id, b.name, b.client_lang ?? "en", gender) : undefined}
                    empCallLoading={empCallLoading.has(b.id)}
                    emailEditId={emailEditId}
                    emailEditVal={emailEditVal}
                    emailEditSaving={emailEditSaving}
                    emailEditMsg={emailEditMsg}
                    setEmailEditId={setEmailEditId}
                    setEmailEditVal={setEmailEditVal}
                    setEmailEditMsg={setEmailEditMsg}
                    saveClientEmail={saveClientEmail}
                    empLang={lang}
                    authH={authH}
                    t={t}
                  />
                ))}
              </>
            )}

            {/* Completed jobs sub-tab */}
            {jobsTab === "completed" && (
              <>
                {!loading && completedJobs.length === 0 && (
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "48px 0", gap: 8, color: "#94a3b8",
                  }}>
                    <CheckCircle2 style={{ width: 40, height: 40, opacity: 0.2 }} />
                    <p style={{ margin: 0, fontSize: 14 }}>{t("completed")}</p>
                  </div>
                )}
                {completedJobs.map(b => (
                  <JobCard
                    key={b.id}
                    b={b}
                    justClosed={false}
                    isHighlighted={!!jobSearch.trim()}
                    onClose={undefined}
                    onArchive={() => void archiveJob(b.id)}
                    archiving={archivingId === b.id}
                    onPhotos={() => openPhotoModal(b.id)}
                    photoCount={(bookingPhotos[b.id] ?? []).length}
                    onDownloadReceipt={() => downloadReceipt(b)}
                    downloadingReceipt={downloadingReceiptId === b.id}
                    onSendReview={() => void sendReviewSms(b.id, t)}
                    sendingReview={sendingReviewId === b.id}
                    onEmpCallback={b.phone ? (gender) => handleEmpCallback(b.phone!, b.id, b.name, b.client_lang ?? "en", gender) : undefined}
                    empCallLoading={empCallLoading.has(b.id)}
                    emailEditId={emailEditId}
                    emailEditVal={emailEditVal}
                    emailEditSaving={emailEditSaving}
                    emailEditMsg={emailEditMsg}
                    setEmailEditId={setEmailEditId}
                    setEmailEditVal={setEmailEditVal}
                    setEmailEditMsg={setEmailEditMsg}
                    saveClientEmail={saveClientEmail}
                    empLang={lang}
                    authH={authH}
                    t={t}
                  />
                ))}
              </>
            )}

            {/* Archived jobs sub-tab */}
            {jobsTab === "archived" && (
              <>
                {!loading && archivedJobs.length === 0 && (
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "48px 0", gap: 8, color: "#94a3b8",
                  }}>
                    <Archive style={{ width: 40, height: 40, opacity: 0.2 }} />
                    <p style={{ margin: 0, fontSize: 14 }}>{t("noArchived")}</p>
                  </div>
                )}
                {archivedJobs.map(b => (
                  <JobCard
                    key={b.id}
                    b={b}
                    justClosed={false}
                    isHighlighted={!!jobSearch.trim()}
                    onClose={undefined}
                    isArchived
                    onRestore={() => void restoreJob(b.id)}
                    archiving={archivingId === b.id}
                    onPhotos={() => openPhotoModal(b.id)}
                    photoCount={(bookingPhotos[b.id] ?? []).length}
                    onDownloadReceipt={() => downloadReceipt(b)}
                    downloadingReceipt={downloadingReceiptId === b.id}
                    onSendReview={() => void sendReviewSms(b.id, t)}
                    sendingReview={sendingReviewId === b.id}
                    onEmpCallback={b.phone ? (gender) => handleEmpCallback(b.phone!, b.id, b.name, b.client_lang ?? "en", gender) : undefined}
                    empCallLoading={empCallLoading.has(b.id)}
                    emailEditId={emailEditId}
                    emailEditVal={emailEditVal}
                    emailEditSaving={emailEditSaving}
                    emailEditMsg={emailEditMsg}
                    setEmailEditId={setEmailEditId}
                    setEmailEditVal={setEmailEditVal}
                    setEmailEditMsg={setEmailEditMsg}
                    saveClientEmail={saveClientEmail}
                    empLang={lang}
                    authH={authH}
                    t={t}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* ── STATS TAB ── */}
        {tab === "stats" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              {t("statsTab")}
            </div>

            {empStats ? (
              <>
                {/* All time */}
                <div style={{
                  background: "#fff", borderRadius: 14,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  padding: 16,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                    All Time
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                        {empStats.closed_total}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{t("statsClosed")}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 36, fontWeight: 800, color: ACCENT, lineHeight: 1 }}>
                        ${Number(empStats.revenue_total).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{t("statsRevenue")}</div>
                    </div>
                  </div>
                </div>

                {/* This month */}
                <div style={{
                  background: "#fff", borderRadius: 14,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  padding: 16,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                    {t("statsMonth")}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                        {empStats.closed_month}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{t("statsClosed")}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 36, fontWeight: 800, color: "#16a34a", lineHeight: 1 }}>
                        ${Number(empStats.revenue_month).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{t("statsMonthRev")}</div>
                    </div>
                  </div>
                </div>

                {/* This week */}
                <div style={{
                  background: "linear-gradient(135deg, #1B6FE8 0%, #0d52c7 100%)",
                  borderRadius: 14,
                  boxShadow: "0 2px 10px rgba(27,111,232,0.3)",
                  padding: 16,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                    {t("statsWeek")}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div style={{ textAlign: "center", background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                        {empStats.closed_week}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>{t("statsWeekJobs")}</div>
                    </div>
                    <div style={{ textAlign: "center", background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                        ${(empStats.net_week ?? 0).toFixed(2)}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>{t("statsWeekNet")} ({empStats.emp_pct ?? 70}%)</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    <div style={{ textAlign: "center", background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>${(empStats.labor_week ?? 0).toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{t("statsWeekLabor")}</div>
                    </div>
                    <div style={{ textAlign: "center", background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>${(empStats.parts_week ?? 0).toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{t("statsWeekParts")}</div>
                    </div>
                    <div style={{ textAlign: "center", background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>${(empStats.tax_week ?? 0).toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{t("statsWeekTax")}</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "48px 0", gap: 8, color: "#94a3b8",
              }}>
                <TrendingUp style={{ width: 40, height: 40, opacity: 0.2 }} />
                <p style={{ margin: 0, fontSize: 14 }}>No data yet</p>
              </div>
            )}
          </div>
        )}

        {tab === "payroll" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              {t("payroll")}
            </div>
            {payrollRecords.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "48px 0", gap: 8, color: "#94a3b8",
              }}>
                <Banknote style={{ width: 40, height: 40, opacity: 0.2 }} />
                <p style={{ margin: 0, fontSize: 14 }}>{t("noPayroll")}</p>
              </div>
            ) : (
              payrollRecords.map(pr => (
                <div key={pr.id} style={{
                  background: "#fff", borderRadius: 14,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  padding: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{pr.period_label}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{fmtDate(pr.period_start)} – {fmtDate(pr.period_end)}</div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: "2px 8px", borderRadius: 20,
                    }} className={payStatusCls(pr.status)}>
                      {payStatusLabel(pr.status, t)}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 12 }}>
                    {[
                      { label: t("jobsCount"), value: String(pr.jobs_count) },
                      { label: t("gross"),     value: `$${Number(pr.gross_amount).toFixed(2)}` },
                      { label: t("deductions"), value: `$${Number(pr.deductions).toFixed(2)}` },
                      { label: t("net"),       value: `$${Number(pr.net_amount).toFixed(2)}`, bold: true },
                    ].map(item => (
                      <div key={item.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: item.bold ? SUCCESS : "#0f172a" }}>{item.value}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                  {pr.notes && (
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>
                      {pr.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {profile ? (
              <>
                <div style={{
                  background: "#fff", borderRadius: 14,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  padding: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: "50%",
                      background: ACCENT,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 20, fontWeight: 700,
                    }}>
                      {empName[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{profile.name}</div>
                      <div style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                        <Phone style={{ width: 13, height: 13 }} />{profile.phone}
                      </div>
                    </div>
                  </div>
                  {(profile.car_make || profile.car_plate) && (
                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                      {profile.car_make && profile.car_model && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                          <span style={{ fontSize: 12, color: "#94a3b8", width: 70 }}>{t("car")}:</span>
                          <span style={{ fontWeight: 500 }}>{profile.car_make} {profile.car_model}</span>
                        </div>
                      )}
                      {profile.car_plate && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                          <span style={{ fontSize: 12, color: "#94a3b8", width: 70 }}>{t("plate")}:</span>
                          <span style={{ fontWeight: 600, fontFamily: "monospace" }}>{profile.car_plate}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Btn onClick={logout} outline color="#ef4444">
                  <LogOut style={{ width: 16, height: 16 }} /> {t("logout")}
                </Btn>
              </>
            ) : (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <RefreshCw style={{ width: 24, height: 24, color: "#cbd5e1" }} className="animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Close Job Modal ── */}
      {closeTarget && createPortal(
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(15,23,42,0.6)",
          display: "flex", alignItems: "flex-end",
        }}>
          <div style={{
            width: "100%", background: "#fff",
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            maxHeight: "92dvh", overflowY: "auto",
            padding: "24px 20px 40px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{t("closeJob")}</div>
              <button onClick={() => setCloseTarget(null)} style={{ border: "none", background: "#f1f5f9", padding: 6, borderRadius: "50%", cursor: "pointer" }}>
                <X style={{ width: 20, height: 20, color: "#64748b" }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>{t("repairAmount")}</label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 14, top: 12, fontSize: 15, fontWeight: 600, color: "#64748b" }}>$</div>
                  <input
                    type="number"
                    step="0.01"
                    value={closeAmount}
                    onChange={e => setCloseAmount(e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "12px 14px 12px 28px",
                      borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 15, fontWeight: 700, outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>{t("workPerformed")}</label>
                <textarea
                  value={closeWork}
                  onChange={e => setCloseWork(e.target.value)}
                  placeholder={t("workPlaceholder")}
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "12px 14px", minHeight: 80,
                    borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", resize: "none",
                  }}
                />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>{t("partsReplaced")}</label>
                  <button onClick={addPart} style={{ fontSize: 12, fontWeight: 700, color: ACCENT, background: "none", border: "none", cursor: "pointer" }}>
                    {t("addPart")}
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {closeParts.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 8 }}>
                      <input
                        value={p}
                        onChange={e => setPart(i, e.target.value)}
                        placeholder="e.g. Heating Element"
                        style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none" }}
                      />
                      <button onClick={() => removePart(i)} style={{ padding: "0 10px", borderRadius: 10, border: "none", background: "#fee2e2", color: "#ef4444", cursor: "pointer" }}>
                        <X style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>{t("partsCost")}</label>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 6px" }}>{t("partsCostHint")}</p>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 14, top: 12, fontSize: 15, fontWeight: 600, color: "#64748b" }}>$</div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={closePartsCost}
                    onChange={e => setClosePartsCost(e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "12px 14px 12px 28px",
                      borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* ── Order Total Summary ── */}
              {(() => {
                const labor = parseFloat(closeAmount) || 0;
                const parts = parseFloat(closePartsCost) || 0;
                const taxAmt = closeTax ? (labor + parts) * 0.0825 : 0;
                const total = labor + parts + taxAmt;
                if (labor <= 0 && parts <= 0) return null;
                return (
                  <div style={{ background: "#f0f7ff", borderRadius: 14, padding: "14px 16px", border: "1.5px solid #bfdbfe" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                      {t("estimateTotalLine")}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151" }}>
                        <span>{t("repairAmount")}</span>
                        <span>${labor.toFixed(2)}</span>
                      </div>
                      {parts > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151" }}>
                          <span>{t("partsCost").split("(")[0].trim()}</span>
                          <span>${parts.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: closeTax ? "#374151" : "#94a3b8" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input
                            type="checkbox"
                            checked={closeTax}
                            onChange={e => setCloseTax(e.target.checked)}
                            style={{ width: 15, height: 15, accentColor: ACCENT, cursor: "pointer" }}
                          />
                          {t("estimateTaxLine")}
                        </span>
                        <span>{closeTax ? `$${taxAmt.toFixed(2)}` : "$0.00 ✓"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: "#1a1a2e", borderTop: "1.5px solid #bfdbfe", paddingTop: 8, marginTop: 2 }}>
                        <span>{t("estimateTotalLine")}</span>
                        <span style={{ color: ACCENT }}>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>{t("paymentMethod")}</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["cash", "zelle", "tap_to_pay", "online"] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setClosePayment(m)}
                      style={{
                        padding: "10px 6px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                        border: closePayment === m ? `2px solid ${ACCENT}` : "1.5px solid #f1f5f9",
                        background: closePayment === m ? "#f0f7ff" : "#f8fafc",
                        color: closePayment === m ? ACCENT : "#64748b",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                      }}
                    >
                      {m === "cash" ? `💵 ${t("cash")}` : m === "zelle" ? `💚 ${t("zelle")}` : m === "tap_to_pay" ? `📱 ${t("tapToPay")}` : `🔗 ${t("online")}`}
                    </button>
                  ))}
                </div>
              </div>

              {closePayment === "zelle" && (
                <div style={{
                  background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12,
                  padding: "12px 16px", fontSize: 13,
                }}>
                  <div style={{ fontWeight: 700, color: "#15803d", marginBottom: 4 }}>💚 Zelle</div>
                  <div style={{ color: "#166534" }}>{t("zelleInfo")}</div>
                </div>
              )}

              {closePayment === "tap_to_pay" && (
                <div style={{
                  background: "#eff6ff", border: "1.5px solid #93c5fd", borderRadius: 12,
                  padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10,
                }}>
                  <div style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    📱 Tap to Pay — Stripe
                  </div>
                  <div style={{ fontSize: 12, color: "#3b82f6" }}>
                    {t("tapToPayInstruction")}
                  </div>
                  <button
                    onClick={() => {
                      const ua = navigator.userAgent;
                      const isIOS = /iPad|iPhone|iPod/.test(ua);
                      const isAndroid = /Android/.test(ua);
                      const url = isIOS
                        ? "https://apps.apple.com/app/stripe-dashboard/id978516833"
                        : isAndroid
                          ? "https://play.google.com/store/apps/details?id=com.stripe.android.dashboard"
                          : "https://dashboard.stripe.com/terminal/payments/create";
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    style={{
                      padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                      background: "#635bff", color: "#fff", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>⚡</span>
                    {t("openStripeApp")}
                  </button>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
                    <a
                      href="https://apps.apple.com/app/stripe-dashboard/id978516833"
                      target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, color: "#6366f1", textDecoration: "underline" }}
                    >
                       iOS App Store
                    </a>
                    <span style={{ color: "#cbd5e1", fontSize: 11 }}>·</span>
                    <a
                      href="https://play.google.com/store/apps/details?id=com.stripe.android.dashboard"
                      target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, color: "#6366f1", textDecoration: "underline" }}
                    >
                       Google Play
                    </a>
                  </div>
                </div>
              )}

              {closePayment === "online" && (
                <>
                  <a
                    href="/pay"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      background: "#635BFF", color: "#fff", borderRadius: 12,
                      padding: "13px 16px", fontSize: 14, fontWeight: 700,
                      textDecoration: "none", letterSpacing: "0.01em",
                    }}
                  >
                    💳 {t("openPaymentLink")}
                  </a>

                  <div style={{ background: "#f0f7ff", borderRadius: 12, padding: "10px 14px", fontSize: 13 }}>
                    <div style={{ fontWeight: 700, color: "#1B6FE8", marginBottom: 6, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("clientContact")}</div>
                    {closeTarget?.email || closeTarget?.phone ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {closeTarget?.email && <span style={{ color: "#374151" }}>✉️ {closeTarget.email}</span>}
                        {closeTarget?.phone && <span style={{ color: "#374151" }}>📱 {closeTarget.phone}</span>}
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>{t("noContactInfo")}</span>
                    )}
                  </div>

                  {(closeTarget?.email || closeTarget?.phone) ? (
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>{t("notifyMethod")}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["email", "sms", "both"] as const).map(m => {
                        const disabled =
                          ((m === "email" || m === "both") && !closeTarget?.email) ||
                          (m === "sms" && !closeTarget?.phone);
                        return (
                          <button
                            key={m}
                            onClick={() => !disabled && setCloseNotify(m)}
                            disabled={disabled}
                            style={{
                              flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                              cursor: disabled ? "not-allowed" : "pointer",
                              border: closeNotify === m ? `2px solid ${ACCENT}` : "1.5px solid #f1f5f9",
                              background: disabled ? "#f8fafc" : closeNotify === m ? "#f0f7ff" : "#f8fafc",
                              color: disabled ? "#cbd5e1" : closeNotify === m ? ACCENT : "#64748b",
                              opacity: disabled ? 0.5 : 1,
                            }}
                          >
                            {m === "email" ? t("viaEmail") : m === "sms" ? t("viaSMS") : t("viaBoth")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "#94a3b8", padding: "8px 0" }}>
                      ℹ️ {t("noContactInfo")} — {t("noNotificationWillBeSent") ?? "уведомление не будет отправлено"}
                    </div>
                  )}
                </>
              )}

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>{t("clientReceiptLang")}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["en", "es"] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => setCloseLang(l)}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                        border: closeLang === l ? `2px solid ${ACCENT}` : "1.5px solid #f1f5f9",
                        background: closeLang === l ? "#f0f7ff" : "#f8fafc",
                        color: closeLang === l ? ACCENT : "#64748b",
                      }}
                    >
                      {l === "en" ? "🇺🇸 English" : "🇪🇸 Español"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Client Signature ── */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                    {t("sigTitle")} <span style={{ fontWeight: 400, color: "#94a3b8" }}>{t("sigOptional")}</span>
                  </label>
                  {sigHasData && (
                    <button type="button" onClick={clearSig}
                      style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>
                      {t("sigClear")}
                    </button>
                  )}
                </div>
                <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "#fafafa", touchAction: "none" }}>
                  <canvas
                    ref={signatureRef}
                    width={335} height={130}
                    style={{ display: "block", width: "100%", height: 130, cursor: "crosshair", touchAction: "none" }}
                    onMouseDown={sigStart} onMouseMove={sigMove} onMouseUp={sigStop} onMouseLeave={sigStop}
                    onTouchStart={sigTouchStart} onTouchMove={sigTouchMove} onTouchEnd={sigStop}
                  />
                </div>
                {!sigHasData && (
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0", textAlign: "center" }}>{t("sigDraw")}</p>
                )}
                <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={sigConsentGiven} onChange={e => setSigConsentGiven(e.target.checked)}
                    style={{ marginTop: 2, width: 14, height: 14, accentColor: ACCENT }} />
                  <span style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{t("sigConsentText")}</span>
                </label>
              </div>

              {closeErr && <p style={{ fontSize: 13, color: "#ef4444", textAlign: "center", margin: 0 }}>{closeErr}</p>}

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <Btn outline color="#64748b" onClick={() => setCloseTarget(null)}>{t("cancel")}</Btn>
                <Btn onClick={() => void submitClose()} disabled={closing}>{closing ? t("signingIn") : t("submit")}</Btn>
              </div>
            </div>
          </div>
        </div>
      , document.body)}

      {/* ── Photo Modal ── */}
      {photoModalId && createPortal(
        <div style={{
          position: "fixed", inset: 0, zIndex: 110,
          background: "rgba(15,23,42,0.7)",
          display: "flex", alignItems: "flex-end",
        }}>
          <div style={{
            width: "100%", background: "#fff",
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            maxHeight: "88dvh", display: "flex", flexDirection: "column",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{t("photoModal")}</div>
              <button onClick={() => setPhotoModalId(null)}
                style={{ border: "none", background: "#f1f5f9", padding: 6, borderRadius: "50%", cursor: "pointer" }}>
                <X style={{ width: 20, height: 20, color: "#64748b" }} />
              </button>
            </div>
            {/* Grid */}
            <div style={{ overflowY: "auto", flex: 1, padding: 20 }}>
              {photosLoading ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
                  <RefreshCw style={{ width: 24, height: 24, margin: "0 auto", display: "block" }} className="animate-spin" />
                  <p style={{ marginTop: 8, fontSize: 13 }}>{t("photoLoading")}</p>
                </div>
              ) : (bookingPhotos[photoModalId] ?? []).length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
                  <Camera style={{ width: 40, height: 40, opacity: 0.2, margin: "0 auto 8px", display: "block" }} />
                  <p style={{ fontSize: 13, margin: 0 }}>{t("photoNone")}</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  {(bookingPhotos[photoModalId] ?? []).map(photo => (
                    <div key={photo.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1/1", background: "#f1f5f9" }}>
                      {photo.url
                        ? <img src={photo.url} alt="job photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 11, color: "#94a3b8" }}>unavailable</div>}
                      <button type="button"
                        onClick={() => void deletePhoto(photoModalId, photo.id)}
                        style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", padding: 4, cursor: "pointer", display: "flex" }}>
                        <X style={{ width: 14, height: 14, color: "#fff" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Upload */}
            <div style={{ padding: "16px 20px 36px", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 8 }}>
              {uploadProgress && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: ACCENT }}>
                    <span>{t("photoLoading")} {uploadProgress.current}/{uploadProgress.total}</span>
                    <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 4, background: "#e2e8f0", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 4, background: ACCENT,
                      width: `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%`,
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                </div>
              )}
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", minHeight: 46, borderRadius: 12,
                background: uploadProgress ? "#cbd5e1" : ACCENT,
                color: "#fff", fontSize: 14, fontWeight: 700,
                cursor: uploadProgress ? "not-allowed" : "pointer",
              }}>
                <Camera style={{ width: 18, height: 18 }} />
                {t("photoAdd")}
                <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                  disabled={!!uploadProgress}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f && photoModalId) void uploadPhotos(photoModalId, [f]);
                    e.target.value = "";
                  }}
                />
              </label>
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", minHeight: 46, borderRadius: 12,
                background: uploadProgress ? "#cbd5e1" : "#f1f5f9",
                color: uploadProgress ? "#94a3b8" : ACCENT,
                fontSize: 13, fontWeight: 700,
                cursor: uploadProgress ? "not-allowed" : "pointer",
                border: `1.5px solid ${uploadProgress ? "#cbd5e1" : ACCENT}`,
              }}>
                🖼 {t("photoGallery")}
                <input type="file" accept="image/*" multiple style={{ display: "none" }}
                  disabled={!!uploadProgress}
                  onChange={e => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length > 0 && photoModalId) void uploadPhotos(photoModalId, files);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      , document.body)}

      {/* ── Estimate Modal ── */}
      {estimateTarget && createPortal(
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(15,23,42,0.6)",
          display: "flex", alignItems: "flex-end",
        }}>
          <div style={{
            width: "100%", background: "#fff",
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            maxHeight: "94dvh", overflowY: "auto",
            padding: "24px 20px 40px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{estimateIsEdit ? t("estimateEditTitle") : t("estimateTitle")}</div>
              <button onClick={() => setEstimateTarget(null)} style={{ border: "none", background: "#f1f5f9", padding: 6, borderRadius: "50%", cursor: "pointer" }}>
                <X style={{ width: 20, height: 20, color: "#64748b" }} />
              </button>
            </div>

            {estimateDone ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: SUCCESS }}>
                <CheckCircle2 style={{ width: 48, height: 48, margin: "0 auto 12px" }} />
                <div style={{ fontWeight: 700, fontSize: 16 }}>{t("estimateSuccess")}</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Client info */}
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#374151" }}>
                  <strong>{estimateTarget.name}</strong> · {estimateTarget.phone}<br />
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{estimateTarget.appliance}{estimateTarget.brand_model ? ` — ${estimateTarget.brand_model}` : ""}</span>
                </div>

                {/* Pricebook quick-add */}
                {pricebook.length > 0 && (
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>{t("fromPricebook")}</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {pricebook.map(pb => (
                        <button
                          key={pb.id}
                          onClick={() => addFromPricebook(pb)}
                          style={{
                            padding: "5px 10px", borderRadius: 20, border: "1.5px solid #e2e8f0",
                            background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                            color: "#374151",
                          }}
                        >
                          + {pb.name} <span style={{ color: ACCENT }}>${Number(pb.unit_price).toFixed(0)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Line items */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>{t("estimateItems")}</label>
                    <button onClick={addEstimateItem} style={{ fontSize: 12, fontWeight: 700, color: ACCENT, background: "none", border: "none", cursor: "pointer" }}>
                      {t("addItem")}
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {estimateItems.map((item, i) => (
                      <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                          <input
                            value={item.description}
                            onChange={e => setEstimateItemField(i, "description", e.target.value)}
                            placeholder={t("itemDesc")}
                            style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none" }}
                          />
                          <button onClick={() => removeEstimateItem(i)} style={{ padding: "0 8px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#ef4444", cursor: "pointer" }}>
                            <Minus style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 80px", gap: 6 }}>
                          <select
                            value={item.category}
                            onChange={e => setEstimateItemField(i, "category", e.target.value)}
                            style={{ padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 12, outline: "none" }}
                          >
                            <option value="Labor">Labor</option>
                            <option value="Part">Part</option>
                            <option value="Material">Material</option>
                          </select>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.qty}
                            onChange={e => setEstimateItemField(i, "qty", Math.max(1, parseInt(e.target.value) || 1))}
                            placeholder={t("itemQty")}
                            style={{ padding: "8px 6px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", textAlign: "center" }}
                          />
                          <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 8, top: 9, fontSize: 13, color: "#94a3b8" }}>$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price === 0 ? "" : item.unit_price}
                              onChange={e => setEstimateItemField(i, "unit_price", parseFloat(e.target.value) || 0)}
                              style={{ width: "100%", boxSizing: "border-box", padding: "8px 6px 8px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none" }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* No-tax toggle */}
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                  <input
                    type="checkbox"
                    checked={estimateNoTax}
                    onChange={e => setEstimateNoTax(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#16a34a" }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>{t("noTax")}</span>
                </label>

                {/* Total breakdown */}
                {(() => {
                  const labor = estimateItems.filter(i => i.category === "Labor").reduce((s, i) => s + i.qty * i.unit_price, 0);
                  const parts = estimateItems.filter(i => i.category !== "Labor").reduce((s, i) => s + i.qty * i.unit_price, 0);
                  const tax = estimateNoTax ? 0 : (labor + parts) * 0.0825;
                  const total = labor + parts + tax;
                  return (
                    <div style={{ background: "#f0f7ff", borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569", paddingBottom: 4 }}>
                        <span>{t("estimateSubtotal")}</span><span>${(labor + parts).toFixed(2)}</span>
                      </div>
                      {estimateNoTax ? (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#16a34a", paddingBottom: 4 }}>
                          <span>{t("estimateTaxLine")}</span><span>$0.00 ✓</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569", paddingBottom: 4 }}>
                          <span>{t("estimateTaxLine")}</span><span>${tax.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: ACCENT, borderTop: "1px solid #bfdbfe", paddingTop: 6 }}>
                        <span>{t("estimateTotalLine")}</span><span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Notes */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>{t("estimateNotes")}</label>
                  <textarea
                    value={estimateNotes}
                    onChange={e => setEstimateNotes(e.target.value)}
                    placeholder={t("estimateNotesPlaceholder")}
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "10px 12px", minHeight: 70,
                      borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", resize: "none",
                    }}
                  />
                </div>

                {/* Notify method */}
                {(estimateTarget?.email || estimateTarget?.phone) && (
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>{t("notifyMethod")}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["email", "sms", "both"] as const).map(m => {
                        const disabled =
                          ((m === "email" || m === "both") && !estimateTarget?.email) ||
                          (m === "sms" && !estimateTarget?.phone);
                        return (
                          <button
                            key={m}
                            onClick={() => !disabled && setEstimateNotify(m)}
                            disabled={disabled}
                            style={{
                              flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                              cursor: disabled ? "not-allowed" : "pointer",
                              border: estimateNotify === m ? `2px solid ${ACCENT}` : "1.5px solid #f1f5f9",
                              background: disabled ? "#f8fafc" : estimateNotify === m ? "#f0f7ff" : "#f8fafc",
                              color: disabled ? "#cbd5e1" : estimateNotify === m ? ACCENT : "#64748b",
                              opacity: disabled ? 0.5 : 1,
                            }}
                          >
                            {m === "email" ? t("viaEmail") : m === "sms" ? t("viaSMS") : t("viaBoth")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {estimateErr && <p style={{ fontSize: 13, color: "#ef4444", textAlign: "center", margin: 0 }}>{estimateErr}</p>}

                <div style={{ display: "flex", gap: 10 }}>
                  <Btn outline color="#64748b" onClick={() => setEstimateTarget(null)}>{t("cancel")}</Btn>
                  <Btn onClick={() => void submitEstimate()} disabled={estimateSending} color={ACCENT}>
                    <FileText style={{ width: 16, height: 16 }} />
                    {estimateSending ? t("estimateSending") : t("estimateSend")}
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      , document.body)}

      {/* ── AI Translator Modal ── */}
      {translatorOpen && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end",
          }}
          onClick={e => { if (e.target === e.currentTarget) { stopListening(); setTranslatorOpen(false); } }}
        >
          <div style={{
            width: "100%", maxWidth: 480, margin: "0 auto",
            background: "#fff", borderRadius: "20px 20px 0 0",
            padding: "20px 20px 32px",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.18)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Languages style={{ width: 20, height: 20, color: "#4f46e5" }} />
                <span style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>AI Translator</span>
              </div>
              <button
                onClick={() => { stopListening(); setTranslatorOpen(false); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>
            {/* ── Picker row: Me ↔ Customer ── */}
            <div style={{ display: "flex", alignItems: "stretch", gap: 8, marginBottom: 10 }}>
              <button
                onClick={() => setTranslatorPickerFor("me")}
                style={{
                  flex: 1, padding: "8px 6px", borderRadius: 12, cursor: "pointer",
                  border: translatorPickerFor === "me" ? `2px solid ${ACCENT}` : "1.5px solid #e2e8f0",
                  background: translatorPickerFor === "me" ? "#eff6ff" : "#f8fafc",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                }}
              >
                <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>🧑‍🔧 Я / Me</span>
                <span style={{ fontSize: 22 }}>{TRANSLATOR_LANGS.find(l => l.code === translatorLang)?.flag ?? "🏳"}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: translatorPickerFor === "me" ? ACCENT : "#334155" }}>
                  {TRANSLATOR_LANGS.find(l => l.code === translatorLang)?.label}
                </span>
              </button>
              <button
                onClick={() => {
                  const prev = translatorLang;
                  setTranslatorLang(translatorCustomerLang);
                  setTranslatorCustomerLang(prev);
                  setTranslatorResult(null); setTranslatorOrig(""); setTranslatorError("");
                }}
                style={{
                  width: 36, flexShrink: 0, borderRadius: "50%",
                  background: "#f1f5f9", border: "1.5px solid #e2e8f0", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, color: "#64748b",
                }}
              >⇄</button>
              <button
                onClick={() => setTranslatorPickerFor("customer")}
                style={{
                  flex: 1, padding: "8px 6px", borderRadius: 12, cursor: "pointer",
                  border: translatorPickerFor === "customer" ? "2px solid #10b981" : "1.5px solid #e2e8f0",
                  background: translatorPickerFor === "customer" ? "#ecfdf5" : "#f8fafc",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                }}
              >
                <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>👤 Клиент</span>
                <span style={{ fontSize: 22 }}>{TRANSLATOR_LANGS.find(l => l.code === translatorCustomerLang)?.flag ?? "🏳"}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: translatorPickerFor === "customer" ? "#10b981" : "#334155" }}>
                  {TRANSLATOR_LANGS.find(l => l.code === translatorCustomerLang)?.label}
                </span>
              </button>
            </div>
            {/* ── Grid label ── */}
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6,
              color: translatorPickerFor === "me" ? ACCENT : "#10b981",
            }}>
              {translatorPickerFor === "me" ? "🧑‍🔧 Выбери свой язык:" : "👤 Выбери язык клиента:"}
            </div>
            {/* ── Language grid ── */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, marginBottom: 14,
              maxHeight: 174, overflowY: "auto",
            }}>
              {TRANSLATOR_LANGS.map(lng => {
                const isSelected = translatorPickerFor === "me"
                  ? translatorLang === lng.code
                  : translatorCustomerLang === lng.code;
                const activeColor = translatorPickerFor === "me" ? ACCENT : "#10b981";
                const activeBg    = translatorPickerFor === "me" ? "#eff6ff" : "#ecfdf5";
                return (
                  <button
                    key={lng.code}
                    onClick={() => {
                      if (translatorPickerFor === "me") setTranslatorLang(lng.code);
                      else setTranslatorCustomerLang(lng.code);
                      setTranslatorResult(null); setTranslatorOrig(""); setTranslatorError("");
                    }}
                    style={{
                      padding: "8px 6px", borderRadius: 10,
                      border: isSelected ? `2px solid ${activeColor}` : "1.5px solid #e2e8f0",
                      background: isSelected ? activeBg : "#f8fafc",
                      color: isSelected ? activeColor : "#64748b",
                      fontWeight: 600, fontSize: 11, cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                      lineHeight: 1.2,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{lng.flag}</span>
                    <span style={{ fontSize: 10, textAlign: "center" }}>{lng.label}</span>
                  </button>
                );
              })}
            </div>
            {/* ── Conversation mode toggle ── */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 10 }}>
              {/* Big mic / stop button */}
              <div style={{ position: "relative", marginBottom: 8 }}>
                {/* Pulse ring when listening */}
                {translatorListening && (
                  <div style={{
                    position: "absolute", inset: -12,
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.12)",
                    animation: "ping 1.2s cubic-bezier(0,0,0.2,1) infinite",
                  }} />
                )}
                <button
                  onClick={() => toggleConversation(translatorLang, translatorCustomerLang)}
                  disabled={translatorPhase === "translating" || translatorPhase === "speaking"}
                  style={{
                    width: 88, height: 88, borderRadius: "50%", border: "none",
                    cursor: (translatorPhase === "translating" || translatorPhase === "speaking") ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.25s",
                    background:
                      translatorContinuous
                        ? "linear-gradient(135deg, #ef4444, #b91c1c)"
                        : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    boxShadow:
                      translatorListening
                        ? "0 0 0 6px rgba(239,68,68,0.2), 0 6px 24px rgba(239,68,68,0.4)"
                        : translatorContinuous
                          ? "0 6px 24px rgba(239,68,68,0.35)"
                          : "0 6px 24px rgba(79,70,229,0.4)",
                    opacity: (translatorPhase === "translating" || translatorPhase === "speaking") ? 0.6 : 1,
                  }}
                >
                  {translatorContinuous
                    ? <MicOff style={{ width: 36, height: 36, color: "#fff" }} />
                    : <Mic   style={{ width: 36, height: 36, color: "#fff" }} />}
                </button>
              </div>

              {/* Phase status label */}
              <div style={{ fontSize: 13, fontWeight: 600, color:
                translatorPhase === "listening"   ? "#ef4444" :
                translatorPhase === "translating" ? "#4f46e5" :
                translatorPhase === "speaking"    ? "#10b981" :
                "#94a3b8",
                minHeight: 20, textAlign: "center",
              }}>
                {translatorPhase === "idle"        && !translatorContinuous && "Tap mic to start"}
                {translatorPhase === "listening"   && "🔴 Listening…"}
                {translatorPhase === "translating" && "⏳ Translating…"}
                {translatorPhase === "speaking"    && "🔊 Playing…"}
              </div>

              {/* Continuous mode active banner */}
              {translatorContinuous && translatorPhase === "idle" && (
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Tap red mic to stop conversation</div>
              )}
              {translatorContinuous && translatorPhase !== "idle" && (
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Conversation active</div>
              )}
            </div>

            {translatorLoading && (
              <div style={{ textAlign: "center", color: "#4f46e5", fontSize: 13, marginBottom: 10 }}>
                <RefreshCw style={{ width: 14, height: 14, display: "inline", animation: "spin 1s linear infinite" }} /> Translating…
              </div>
            )}
            {translatorError && (
              <div style={{
                fontSize: 12, color: "#dc2626", background: "#fef2f2",
                border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", marginBottom: 8,
              }}>
                <div>{translatorError}</div>
                <button
                  onClick={logout}
                  style={{
                    marginTop: 8, padding: "5px 12px", borderRadius: 8,
                    background: "#dc2626", color: "#fff", border: "none",
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  → Выйти и войти снова
                </button>
              </div>
            )}
            {translatorOrig && (
              <div style={{
                background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12,
                padding: 12, marginBottom: 8,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }}>
                  Original ({translatorResult?.detected ?? "…"})
                </div>
                <div style={{ fontSize: 14, color: "#334155" }}>{translatorOrig}</div>
              </div>
            )}
            {translatorResult && (
              <div style={{
                background: "#eff6ff", border: `1.5px solid ${ACCENT}`, borderRadius: 12,
                padding: 12,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: "uppercase", marginBottom: 4 }}>
                  Translation ({translatorResult.target})
                </div>
                <div style={{ fontSize: 14, color: "#1e3a5f", fontWeight: 600 }}>{translatorResult.translation}</div>
                <button
                  onClick={() => {
                    if (translatorAudioUrl) {
                      const audio = new Audio(translatorAudioUrl);
                      audio.play().catch(() => {});
                    } else {
                      const utter = new SpeechSynthesisUtterance(translatorResult.translation);
                      utter.lang = TRANSLATOR_LANGS.find(l => l.bcp.startsWith(translatorResult.target + "-") || l.bcp === translatorResult.target)?.bcp ?? "en-US";
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(utter);
                    }
                  }}
                  style={{
                    marginTop: 8, padding: "4px 10px", borderRadius: 8,
                    background: ACCENT, color: "#fff", border: "none",
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}
                >
                  🔊 Play again
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
      </div>
    </div>
  );
}

// ── Client message + translation ───────────────────────────────────────────
const messageTranslationCache = new Map<string, string>();

const EMP_EMPLOYEE_LANG_MAP: Record<EmpLang, { label: string; code: string }> = {
  en: { label: "English", code: "en" },
  ru: { label: "Russian", code: "ru" },
  es: { label: "Spanish", code: "es" },
  tr: { label: "Turkish", code: "tr" },
  az: { label: "Azerbaijani", code: "az" },
  uk: { label: "Ukrainian", code: "uk" },
};

function ClientMessageBlock({
  message,
  empLang,
  authH,
  t,
}: {
  message: string;
  empLang: EmpLang;
  authH: () => Record<string, string>;
  t: (k: string) => string;
}) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (empLang === "en") {
      setTranslation(null);
      setFailed(false);
      setLoading(false);
      return;
    }
    const cacheKey = `${empLang}::${message}`;
    const cached = messageTranslationCache.get(cacheKey);
    if (cached) {
      setTranslation(cached);
      setFailed(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFailed(false);
    const emp = EMP_EMPLOYEE_LANG_MAP[empLang];
    fetch(`${API()}/api/employee/translate`, {
      method: "POST",
      headers: authH(),
      body: JSON.stringify({
        text: message,
        myLang: emp.label,
        myLangCode: emp.code,
        customerLang: "English",
        customerLangCode: "en",
      }),
    })
      .then(r => r.json())
      .then((d: { translation?: string }) => {
        if (cancelled) return;
        if (d.translation) {
          messageTranslationCache.set(cacheKey, d.translation);
          setTranslation(d.translation);
        } else {
          setFailed(true);
        }
      })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [message, empLang, authH]);

  return (
    <div style={{
      fontSize: 12,
      color: "#64748b",
      background: "#f8fafc",
      padding: 10,
      borderRadius: 8,
      border: "1px solid #e2e8f0",
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {t("clientMessageOriginal")}
      </div>
      <div style={{ color: "#374151", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{message}</div>
      {empLang !== "en" && (
        <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 8, paddingTop: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: ACCENT, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {t("clientMessageTranslation")}
          </div>
          {loading && <div style={{ fontStyle: "italic", color: "#94a3b8" }}>{t("translatingMessage")}</div>}
          {!loading && failed && <div style={{ color: "#ef4444", fontSize: 11 }}>{t("translationFailed")}</div>}
          {!loading && translation && (
            <div style={{ color: "#0f172a", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{translation}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Job Card ───────────────────────────────────────────────────────────────
function JobCard({
  b, justClosed, isHighlighted, onClose, onEstimate, onEditEstimate, lastEstimate, onArchive, onRestore, isArchived,
  archiving, onPhotos, photoCount, onDownloadReceipt, downloadingReceipt, onSendReview, sendingReview,
  onEmpCallback, empCallLoading,
  emailEditId, emailEditVal, emailEditSaving, emailEditMsg,
  setEmailEditId, setEmailEditVal, setEmailEditMsg, saveClientEmail,
  empLang, authH,
  t,
}: {
  b: Booking;
  justClosed: boolean;
  isHighlighted?: boolean;
  onClose?: () => void;
  onEstimate?: () => void;
  onEditEstimate?: () => void;
  lastEstimate?: EstimateRecord | null;
  onArchive?: () => void;
  onRestore?: () => void;
  isArchived?: boolean;
  archiving?: boolean;
  onPhotos?: () => void;
  photoCount?: number;
  onDownloadReceipt: () => void;
  downloadingReceipt: boolean;
  onSendReview?: () => void;
  sendingReview?: boolean;
  onEmpCallback?: (gender: "male" | "female") => Promise<{ ok: boolean; text: string }>;
  empCallLoading?: boolean;
  emailEditId: string | null;
  emailEditVal: string;
  emailEditSaving: boolean;
  emailEditMsg: { ok: boolean; text: string } | null;
  setEmailEditId: (id: string | null) => void;
  setEmailEditVal: (val: string) => void;
  setEmailEditMsg: (msg: { ok: boolean; text: string } | null) => void;
  saveClientEmail: (id: string) => Promise<void>;
  empLang: EmpLang;
  authH: () => Record<string, string>;
  t: (k: string) => string;
}) {
  const [genderPickOpen, setGenderPickOpen] = useState(false);
  const [callMsg, setCallMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <div style={{
      background: justClosed ? "#dcfce7" : "#fff",
      borderRadius: 14,
      border: `2px solid ${justClosed ? SUCCESS : isHighlighted ? ACCENT : "#f1f5f9"}`,
      boxShadow: isHighlighted ? `0 0 0 3px ${ACCENT}22` : "0 1px 4px rgba(0,0,0,0.05)",
      overflow: "hidden",
      transition: "border-color 0.2s, box-shadow 0.2s",
    }}>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{b.name}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <CalendarDays style={{ width: 13, height: 13 }} />
              {b.preferred_date} • {b.preferred_time}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 700,
              padding: "2px 8px", borderRadius: 20,
            }} className={statusCls(b.status)}>
              {statusLabel(b.status, t)}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700,
              padding: "2px 8px", borderRadius: 20,
              background: resolveBookingBiz(b.business_type) === "dental" ? "#ede9fe" : "#dbeafe",
              color: resolveBookingBiz(b.business_type) === "dental" ? "#6d28d9" : "#1d4ed8",
            }}>
              {resolveBookingBiz(b.business_type) === "dental" ? t("bizDental") : t("bizAppliance")}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Address + navigate */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#374151" }}>
            <MapPin style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2, color: "#94a3b8" }} />
            <div style={{ flex: 1 }}>
              {b.address}
              <div style={{ marginTop: 6 }}>
                <a href={mapsUrl(b.address)} target="_blank" rel="noreferrer" style={{
                  fontSize: 12, fontWeight: 700, color: ACCENT,
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: "#f0f7ff", padding: "4px 10px", borderRadius: 6,
                  textDecoration: "none",
                }}>
                  <Navigation style={{ width: 12, height: 12 }} /> {t("navigate")}
                </a>
              </div>
            </div>
          </div>

          {/* Phone contacts */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
            <Phone style={{ width: 14, height: 14, flexShrink: 0, color: "#94a3b8" }} />
            <span style={{ flex: 1, fontWeight: 500 }}>{b.phone}</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <a href={`tel:${b.phone}`} style={{
                fontSize: 11, fontWeight: 700, color: ACCENT,
                display: "inline-flex", alignItems: "center", gap: 3,
                background: "#f0f7ff", padding: "3px 8px", borderRadius: 6,
                textDecoration: "none",
              }}>
                <Phone style={{ width: 11, height: 11 }} /> {t("call")}
              </a>
              <a href={`sms:${b.phone}`} style={{
                fontSize: 11, fontWeight: 700, color: "#7c3aed",
                display: "inline-flex", alignItems: "center", gap: 3,
                background: "#f5f3ff", padding: "3px 8px", borderRadius: 6,
                textDecoration: "none",
              }}>
                <MessageSquare style={{ width: 11, height: 11 }} /> {t("smsAction")}
              </a>
              {/* AI masked call via 606 */}
              {onEmpCallback && (
                genderPickOpen ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                      onClick={() => { setGenderPickOpen(false); void onEmpCallback("male").then(msg => { setCallMsg(msg); setTimeout(() => setCallMsg(null), 12000); }); }}
                      title="Client is male"
                      style={{ fontSize: 12, padding: "3px 8px", borderRadius: 6, background: "#dbeafe", border: "none", color: "#1d4ed8", fontWeight: 700, cursor: "pointer" }}
                    >♂</button>
                    <button
                      onClick={() => { setGenderPickOpen(false); void onEmpCallback("female").then(msg => { setCallMsg(msg); setTimeout(() => setCallMsg(null), 12000); }); }}
                      title="Client is female"
                      style={{ fontSize: 12, padding: "3px 8px", borderRadius: 6, background: "#fce7f3", border: "none", color: "#be185d", fontWeight: 700, cursor: "pointer" }}
                    >♀</button>
                    <button
                      onClick={() => setGenderPickOpen(false)}
                      style={{ fontSize: 11, padding: "2px 4px", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                    >✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setGenderPickOpen(true)}
                    disabled={!!empCallLoading}
                    title="Call client via AI agent (606, masked)"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 3,
                      fontSize: 11, fontWeight: 700, color: "#0369a1",
                      background: "#e0f2fe", border: "none",
                      padding: "3px 8px", borderRadius: 6, cursor: "pointer",
                      opacity: empCallLoading ? 0.5 : 1,
                    }}
                  >
                    <PhoneOutgoing style={{ width: 11, height: 11 }} /> 606
                  </button>
                )
              )}
            </div>
          </div>
          {/* Call status message */}
          {callMsg && (
            <div style={{
              fontSize: 11, padding: "6px 10px", borderRadius: 8, marginTop: 4,
              background: callMsg.ok ? "#f0fdf4" : "#fef2f2",
              color: callMsg.ok ? "#15803d" : "#dc2626",
              border: `1px solid ${callMsg.ok ? "#bbf7d0" : "#fecaca"}`,
            }}>
              {callMsg.text}
            </div>
          )}

          {/* Email contacts */}
          {emailEditId === b.id ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Mail style={{ width: 14, height: 14, flexShrink: 0, color: "#94a3b8" }} />
                <input
                  type="email"
                  value={emailEditVal}
                  onChange={e => setEmailEditVal(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") void saveClientEmail(b.id); if (e.key === "Escape") { setEmailEditId(null); setEmailEditMsg(null); } }}
                  placeholder="email@example.com"
                  autoFocus
                  style={{
                    flex: 1, fontSize: 12, padding: "5px 8px", borderRadius: 6,
                    border: "1.5px solid #1B6FE8", outline: "none", minWidth: 0,
                  }}
                />
                <button
                  onClick={() => void saveClientEmail(b.id)}
                  disabled={emailEditSaving}
                  style={{
                    fontSize: 11, fontWeight: 700, color: "#fff",
                    background: emailEditSaving ? "#94a3b8" : "#1B6FE8",
                    border: "none", padding: "5px 10px", borderRadius: 6, cursor: "pointer", flexShrink: 0,
                  }}
                >{emailEditSaving ? "..." : "✓"}</button>
                <button
                  onClick={() => { setEmailEditId(null); setEmailEditMsg(null); }}
                  style={{
                    fontSize: 11, fontWeight: 700, color: "#64748b",
                    background: "#f1f5f9", border: "none", padding: "5px 8px", borderRadius: 6, cursor: "pointer",
                  }}
                ><X style={{ width: 12, height: 12 }} /></button>
              </div>
              {emailEditMsg && (
                <div style={{ fontSize: 11, paddingLeft: 22, color: emailEditMsg.ok ? "#059669" : "#dc2626", fontWeight: 600 }}>
                  {emailEditMsg.text}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
              <Mail style={{ width: 14, height: 14, flexShrink: 0, color: "#94a3b8" }} />
              {b.email ? (
                <span style={{ flex: 1, fontWeight: 500, fontSize: 12, wordBreak: "break-all" }}>{b.email}</span>
              ) : (
                <span style={{ flex: 1, fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>{t("addEmail")}</span>
              )}
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {b.email && (
                  <a href={`mailto:${b.email}`} style={{
                    fontSize: 11, fontWeight: 700, color: "#059669",
                    display: "inline-flex", alignItems: "center", gap: 3,
                    background: "#ecfdf5", padding: "3px 8px", borderRadius: 6,
                    textDecoration: "none",
                  }}>
                    <Mail style={{ width: 11, height: 11 }} /> {t("emailAction")}
                  </a>
                )}
                <button
                  onClick={() => { setEmailEditId(b.id); setEmailEditVal(b.email ?? ""); setEmailEditMsg(null); }}
                  title={t("editEmail")}
                  style={{
                    fontSize: 11, fontWeight: 700, color: "#64748b",
                    display: "inline-flex", alignItems: "center", gap: 3,
                    background: "#f1f5f9", border: "none", padding: "3px 8px", borderRadius: 6, cursor: "pointer",
                  }}
                >
                  <Pencil style={{ width: 11, height: 11 }} />
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
            <Package style={{ width: 14, height: 14, color: "#94a3b8" }} />
            <span style={{ fontWeight: 500 }}>{b.appliance}</span>
            {b.brand_model && <span style={{ color: "#94a3b8" }}>• {b.brand_model}</span>}
          </div>

          {b.recall_note && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", padding: "6px 10px", borderRadius: 8, border: "1px solid #ede9fe" }}>
              <RefreshCw style={{ width: 13, height: 13, flexShrink: 0 }} />
              <span>{b.recall_note}</span>
            </div>
          )}

          {b.message && (
            <ClientMessageBlock message={b.message} empLang={empLang} authH={authH} t={t} />
          )}

          {b.status === "completed" && (
            <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 4, paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: SUCCESS }}>${Number(b.payment_amount).toFixed(2)}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{b.payment_method}</div>
              </div>
              {b.work_description && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: "#374151" }}>
                  <Wrench style={{ width: 13, height: 13, flexShrink: 0, marginTop: 1, color: "#94a3b8" }} />
                  <span>{b.work_description}</span>
                </div>
              )}
              {b.parts_replaced && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: "#374151" }}>
                  <Package style={{ width: 13, height: 13, flexShrink: 0, marginTop: 1, color: "#94a3b8" }} />
                  <span>{b.parts_replaced}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Last estimate badge */}
        {lastEstimate && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8,
            padding: "8px 12px", marginTop: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <FileText style={{ width: 14, height: 14, color: ACCENT, flexShrink: 0 }} />
              <span style={{ color: "#64748b" }}>{t("estimateSent")}:</span>
              <span style={{ fontWeight: 800, color: ACCENT }}>${Number(lastEstimate.total).toFixed(2)}</span>
            </div>
            {onEditEstimate && (
              <button
                type="button"
                onClick={onEditEstimate}
                style={{
                  background: "none", border: `1px solid ${ACCENT}`, cursor: "pointer",
                  fontSize: 11, fontWeight: 700, color: ACCENT,
                  padding: "3px 8px", borderRadius: 6,
                }}
              >
                {t("estimateEdit")}
              </button>
            )}
          </div>
        )}

        {/* Photos button — all statuses */}
        {onPhotos && (
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={onPhotos} style={{
              width: "100%", minHeight: 40,
              background: "#fff", color: "#64748b",
              border: "1.5px solid #e2e8f0", borderRadius: 10,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Camera style={{ width: 15, height: 15 }} />
              {t("photosBtn")}{photoCount ? ` (${photoCount})` : ""}
            </button>
          </div>
        )}

        {/* Estimate + Close Job buttons */}
        {b.status !== "completed" && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {onEstimate && (
              <button
                type="button"
                onClick={onEstimate}
                style={{
                  width: "100%", minHeight: 40,
                  background: "#fff", color: ACCENT,
                  border: `1.5px solid ${ACCENT}`, borderRadius: 10,
                  fontSize: 13, fontWeight: 700,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <FileText style={{ width: 15, height: 15 }} />
                {t("sendEstimate")}
              </button>
            )}
            {onClose && (
              <Btn onClick={onClose} color={SUCCESS}>
                <CheckCircle2 style={{ width: 18, height: 18 }} />
                {t("closeJob")}
              </Btn>
            )}
          </div>
        )}

        {/* Download Receipt — only for paid bookings */}
        {onDownloadReceipt && b.status === "completed"
          && (b.payment_status === "paid" || b.stripe_paid) && (
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={onDownloadReceipt}
              disabled={downloadingReceipt}
              style={{
                width: "100%", minHeight: 44,
                background: "#fff", color: ACCENT,
                border: `1.5px solid ${ACCENT}`, borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                cursor: downloadingReceipt ? "wait" : "pointer",
                opacity: downloadingReceipt ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Download style={{ width: 15, height: 15 }} />
              {downloadingReceipt ? t("generating") : t("downloadReceipt")}
            </button>
          </div>
        )}

        {/* Send Review button — completed jobs with phone */}
        {b.status === "completed" && b.phone && onSendReview && (
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={onSendReview}
              disabled={sendingReview}
              style={{
                width: "100%", minHeight: 40,
                background: "#fffbeb", color: "#b45309",
                border: "1.5px solid #fcd34d", borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                cursor: sendingReview ? "wait" : "pointer",
                opacity: sendingReview ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Star style={{ width: 15, height: 15 }} />
              {sendingReview ? t("sendingReview") : t("sendReview")}
            </button>
          </div>
        )}

        {/* Archive button — completed, not archived */}
        {b.status === "completed" && !isArchived && onArchive && (
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={onArchive}
              disabled={archiving}
              style={{
                width: "100%", minHeight: 40,
                background: "#f8fafc", color: "#64748b",
                border: "1.5px solid #e2e8f0", borderRadius: 10,
                fontSize: 13, fontWeight: 600,
                cursor: archiving ? "wait" : "pointer",
                opacity: archiving ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Archive style={{ width: 14, height: 14 }} />
              {archiving ? t("archiving") : t("archiveJob")}
            </button>
          </div>
        )}

        {/* Restore button — archived jobs */}
        {isArchived && onRestore && (
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={onRestore}
              disabled={archiving}
              style={{
                width: "100%", minHeight: 40,
                background: "#eff6ff", color: ACCENT,
                border: `1.5px solid ${ACCENT}`, borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                cursor: archiving ? "wait" : "pointer",
                opacity: archiving ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <ArchiveRestore style={{ width: 14, height: 14 }} />
              {archiving ? t("restoring") : t("restore")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
