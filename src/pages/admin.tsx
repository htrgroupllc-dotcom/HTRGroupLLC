import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Lock, Unlock, Calendar, RefreshCw, LogOut, ShieldCheck,
  Clock, User, Phone, Wrench, XCircle, PlusCircle, CheckCircle2, ThumbsUp, Pencil, RotateCcw, CalendarDays, Trash2, Search, Camera, Settings,
} from "lucide-react";
import GalleryPhotoManager from "@/components/GalleryPhotoManager";
import VisitFeeSettings from "@/components/admin/VisitFeeSettings";

const ACCENT    = "#1B6FE8";
const TIME_SLOTS = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM"];
const MONTHS    = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_S  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const API = () => (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

/** Returns current date in Houston (CDT/CST). If after 17:00 → returns tomorrow. */
function getInitialHoustonDate(): { month: number; day: number; year: number } {
  const houstonStr = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  const d = new Date(houstonStr);
  if (d.getHours() >= 17) d.setDate(d.getDate() + 1);
  return { month: d.getMonth() + 1, day: d.getDate(), year: d.getFullYear() };
}

function getDeviceFingerprint(): string {
  const parts = [
    navigator.userAgent,
    navigator.language,
    (navigator as any).platform ?? "",
    `${screen.width}x${screen.height}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");
  let h = 0;
  for (let i = 0; i < parts.length; i++) {
    h = Math.imul(31, h) + parts.charCodeAt(i);
    h |= 0;
  }
  return h.toString(36);
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

interface BookingRow {
  id: string;
  name: string;
  phone: string;
  address?: string;
  appliance: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  created_at?: string;
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

export default function AdminPage() {
  const [pin, setPin]             = useState("");
  const [adminBearer, setBearer]  = useState<string | null>(null);
  const [authed, setAuthed]       = useState(false);
  const [pinInput, setPinInput]   = useState("");
  const [pinError, setPinError]   = useState("");

  // Auto-login: AuthGate session token (PIN or biometric), then legacy localStorage session
  useEffect(() => {
    try {
      const authToken =
        sessionStorage.getItem("adminAuthToken") ?? localStorage.getItem("adminAuthToken");
      const authPin =
        sessionStorage.getItem("adminPin") ?? localStorage.getItem("adminPin");
      if (authToken) {
        setBearer(authToken);
        if (authPin) setPin(authPin);
        setAuthed(true);
        return;
      }
      // Legacy localStorage session (fallback)
      const raw = localStorage.getItem("admin_session");
      if (!raw) return;
      const { fingerprint, pin: storedPin } = JSON.parse(raw) as { fingerprint: string; pin: string };
      if (fingerprint === getDeviceFingerprint() && storedPin) {
        setPin(storedPin);
        setAuthed(true);
      }
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
  const [loading,       setLoading]       = useState(false);
  const [allBookings,   setAllBookings]   = useState<BookingRow[]>([]);
  const [apiError,      setApiError]      = useState<string | null>(null);
  const [reason,        setReason]        = useState("");
  const [actionSlot,    setActionSlot]    = useState<string | null>(null);
  const [mobileTab,      setMobileTab]      = useState<"slots"|"bookings"|"photos"|"settings">("slots");
  const [showCompleted,  setShowCompleted]  = useState(true);
  const [searchQuery,    setSearchQuery]    = useState("");

  // Cancel client booking modal
  const [confirmCancel, setConfirmCancel] = useState<{ id: string; name: string; time: string } | null>(null);

  // Complete booking confirmation modal
  const [confirmComplete, setConfirmComplete] = useState<{ id: string; name: string } | null>(null);

  // Permanent delete booking confirmation modal
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Multi-select + bulk delete
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

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
  const [editTarget, setEditTarget] = useState<null | { id: string; status: string }>(null);
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
  const adminAuthH = useCallback((extra?: Record<string, string>): Record<string, string> => {
    const base = extra ?? {};
    const h: Record<string, string> = { ...base };
    const token =
      adminBearer
      ?? sessionStorage.getItem("adminAuthToken")
      ?? localStorage.getItem("adminAuthToken")
      ?? "";
    if (token) h["Authorization"] = `Bearer ${token}`;
    if (pin) h["x-admin-pin"] = encodeURIComponent(pin);
    return h;
  }, [pin, adminBearer]);
  const headers = adminAuthH({ "Content-Type": "application/json" });

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
      if (!r.ok) { setApiError(`Сервер вернул ошибку ${r.status}. Проверьте PIN и попробуйте снова.`); return; }
      const text = await r.text();
      let d: { bookings?: BookingRow[] };
      try { d = JSON.parse(text); } catch {
        setApiError("API вернул неверный ответ. Возможно, вы используете устаревшую версию сайта. Откройте панель администратора через правильный URL.");
        return;
      }
      setApiError(null);
      setAllBookings(d.bookings ?? []);
    } catch (e: unknown) {
      setApiError(`Ошибка подключения к серверу: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, [adminAuthH]);

  // Initial load + re-load whenever selected date changes
  useEffect(() => { if (authed) { loadSlots(); loadSchedule(); } }, [authed, loadSlots, loadSchedule]);

  // Auto-refresh slot availability + all bookings every 30 s (silent — no spinner)
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

  const tryLogin = async () => {
    setPinError("");
    const r = await fetch(`${API()}/api/admin/schedule?from=2020-01-01&to=2099-12-31`, {
      headers: { "x-admin-pin": encodeURIComponent(pinInput) },
    });
    if (r.status === 401) { setPinError("Неверный PIN-код"); return; }
    setPin(pinInput);
    localStorage.setItem("admin_session", JSON.stringify({
      fingerprint: getDeviceFingerprint(),
      pin: pinInput,
    }));
    setAuthed(true);
  };

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
    // Optimistic: free the slot immediately
    setBookedDetails(prev => prev.filter(b => b.id !== id));
    setAllBookings(prev => prev.map(b => b.id === id ? { ...b, status: "completed" } : b));
    setConfirmComplete(null);
    await fetch(`${API()}/api/admin/complete-booking`, {
      method: "POST", headers,
      body: JSON.stringify({ id }),
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
        setDeleteError(body?.error ?? `Ошибка сервера (${res.status}). Возможно, бэкенд не задеплоен.`);
        return;
      }
      // Optimistic: free the slot immediately
      setBookedDetails(prev => prev.filter(b => b.id !== confirmDelete.id));
      setAllBookings(prev => prev.filter(b => b.id !== confirmDelete.id));
      setConfirmDelete(null);
      setDeleteError(null);
      await Promise.all([loadSlots(), loadSchedule()]);
    } catch (e) {
      setDeleteError("Нет соединения с сервером. Проверьте сеть или задеплойте бэкенд.");
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
        setBulkDeleteError(body?.error ?? `Ошибка сервера (${res.status}). Убедитесь что бэкенд задеплоен.`);
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
      setBulkDeleteError("Нет соединения с сервером.");
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
        setRestoreError(data.error ?? `Ошибка сервера ${r.status}`);
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
      setRestoreError("Ошибка соединения с сервером");
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
        setRsError(data.error ?? `Ошибка сервера ${r.status}`);
        return;
      }
      setConfirmReschedule(null);
      setRsConflict(null);
      await loadSlots();
      await loadSchedule();
    } catch {
      setRsError("Ошибка соединения с сервером");
    } finally {
      setIsRescheduling(false);
    }
  };

  // Open edit modal pre-filled with current booking data
  const openEditModal = (b: { id: string; status: string; name: string; phone: string; email?: string; address?: string; appliance?: string; preferred_date: string; preferred_time: string; message?: string }) => {
    setEditTarget({ id: b.id, status: b.status });
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
      setEError("Заполните обязательные поля: имя, телефон, дата, время");
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
      if (d.error === "slot_taken") { setEError("Этот слот уже занят. Выберите другое время."); return; }
      if (!r.ok) { setEError(d.error ?? "Ошибка сохранения"); return; }
      setEditTarget(null);
      await loadSlots();
      await loadSchedule();
    } catch { setEError("Ошибка сети"); }
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
  const visibleBookings = showCompleted
    ? [...activeBookings, ...historyBookings]
    : activeBookings;

  const filteredBookings = (() => {
    const sq = searchQuery.trim().toLowerCase();
    if (!sq) return visibleBookings;
    return visibleBookings.filter(b =>
      (b.name           ?? "").toLowerCase().includes(sq) ||
      (b.phone          ?? "").toLowerCase().includes(sq) ||
      (b.address        ?? "").toLowerCase().includes(sq) ||
      (b.preferred_date ?? "").toLowerCase().includes(sq) ||
      (b.appliance      ?? "").toLowerCase().includes(sq)
    );
  })();

  const allSelected = filteredBookings.length > 0 && filteredBookings.every(b => selectedIds.has(b.id));

  const statusInfo = (status: string) => {
    if (status === "approved")   return { cls: "bg-green-100 text-green-700",   label: "✅ Подтверждён" };
    if (status === "completed")  return { cls: "bg-blue-100 text-blue-700",     label: "✓ Завершён" };
    if (status === "cancelled")  return { cls: "bg-red-100 text-red-500",       label: "❌ Отменён" };
    return                              { cls: "bg-amber-100 text-amber-700",   label: "⏳ Ожидает" };
  };

  const openManual = (time: string) => {
    setManualSlot(time);
    setMName(""); setMPhone(""); setMEmail(""); setMAppl(""); setMNote(""); setMAddr(""); setMZip(""); setMError("");
  };

  const createManualBooking = async () => {
    if (!mName.trim() || !mPhone.trim()) { setMError("Введите имя и телефон"); return; }
    setMSaving(true); setMError("");
    const r = await fetch(`${API()}/api/admin/booking`, {
      method: "POST", headers,
      body: JSON.stringify({ name: mName, phone: mPhone, email: mEmail, appliance: mAppl, address: mAddr, message: [mNote, mZip ? `ZIP: ${mZip}` : ""].filter(Boolean).join(" | "), date: dateStr, time: manualSlot }),
    });
    if (r.status === 409) { setMError("Этот слот уже занят"); setMSaving(false); return; }
    if (!r.ok) { setMError("Ошибка сервера"); setMSaving(false); return; }
    setManualSlot(null);
    setMSaving(false);
    await loadSlots();
    await loadSchedule();
  };

  const logout = () => {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_pin");
    setPin("");
    setAuthed(false);
    setPinInput("");
  };

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#EFF6FF" }}>
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: ACCENT }}>
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-stone-800">Admin Panel</h1>
            <p className="text-sm text-stone-500 mt-1">HTRGroupTX · Управление расписанием</p>
          </div>
          <label className="block text-sm font-semibold text-stone-600 mb-1">PIN-код</label>
          <input type="password" value={pinInput} onChange={e => setPinInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && tryLogin()}
            placeholder="Введите PIN"
            className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} autoFocus />
          {pinError && <p className="text-xs text-red-500 mb-3">{pinError}</p>}
          <button onClick={tryLogin} className="w-full py-2.5 rounded-lg text-white font-semibold text-sm"
            style={{ background: ACCENT }}>Войти</button>
        </div>
        <div className="text-center space-y-1">
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

  // ── Helpers ───────────────────────────────────────────────────────────────
  const closeManualModal = () => {
    setManualSlot(null);
    setMName(""); setMPhone(""); setMEmail(""); setMAppl(""); setMNote(""); setMAddr(""); setMZip(""); setMError("");
  };

  return (
    <div className="min-h-screen" style={{ background: "#EFF6FF" }}>

      {/* ── Cancel booking modal ── */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-stone-800">Отменить бронирование?</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1">Клиент: <strong>{confirmCancel.name}</strong></p>
            <p className="text-sm text-stone-600 mb-4">Время: <strong>{confirmCancel.time}</strong> · <strong>{dateStr}</strong></p>
            <p className="text-xs text-stone-400 mb-4">Слот снова станет доступным для новых бронирований.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmCancel(null)}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition">
                Назад
              </button>
              <button onClick={cancelBooking}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">
                Да, освободить
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
              <h3 className="font-bold text-stone-800">Отметить как завершённое?</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1">Клиент: <strong>{confirmComplete.name}</strong></p>
            <p className="text-xs text-stone-400 mb-4">Нажмите только после того как ремонт фактически выполнен. Бронь переместится в историю.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmComplete(null)}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition">
                Назад
              </button>
              <button onClick={() => completeBooking(confirmComplete.id)}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">
                ✓ Завершить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk delete confirmation modal ── */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-red-700" />
              <h3 className="font-bold text-stone-800">Удалить выбранные заявки?</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1">
              Количество: <strong>{selectedIds.size}</strong> {selectedIds.size === 1 ? "заявка" : selectedIds.size < 5 ? "заявки" : "заявок"}
            </p>
            <p className="text-xs text-red-500 font-semibold mb-4">⚠️ Действие необратимо. Все выбранные заявки будут удалены из базы данных навсегда.</p>
            {bulkDeleteError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                ❌ {bulkDeleteError}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setConfirmBulkDelete(false); setBulkDeleteError(null); }} disabled={isBulkDeleting}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-50">
                Назад
              </button>
              <button onClick={bulkDeleteBookings} disabled={isBulkDeleting}
                className="flex-1 py-2 rounded-lg bg-red-700 text-white text-sm font-semibold hover:bg-red-800 transition disabled:opacity-50">
                {isBulkDeleting ? "Удаляем..." : `🗑️ Удалить (${selectedIds.size})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Permanent delete booking confirmation modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-red-700" />
              <h3 className="font-bold text-stone-800">Удалить заявку навсегда?</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1">Клиент: <strong>{confirmDelete.name}</strong></p>
            <p className="text-xs text-red-500 font-semibold mb-4">⚠️ Это действие необратимо. Заявка будет удалена из базы данных без возможности восстановления.</p>
            {deleteError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                ❌ {deleteError}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setConfirmDelete(null); setDeleteError(null); }} disabled={isDeleting}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-50">
                Назад
              </button>
              <button onClick={deleteBooking} disabled={isDeleting}
                className="flex-1 py-2 rounded-lg bg-red-700 text-white text-sm font-semibold hover:bg-red-800 transition disabled:opacity-50">
                {isDeleting ? "Удаляем..." : "🗑️ Удалить навсегда"}
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
              <h3 className="font-bold text-stone-800">Восстановить заявку?</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1">Клиент: <strong>{confirmRestore.name}</strong></p>
            <p className="text-sm text-stone-600 mb-2">Дата: <strong>{confirmRestore.date}</strong> · <strong>{confirmRestore.time}</strong></p>

            {/* ── Toggle: edit fields before restore ── */}
            <button
              onClick={() => setRestoreEditOpen(v => !v)}
              disabled={isRestoring}
              className="w-full flex items-center justify-between px-3 py-2 mb-3 rounded-lg border text-xs font-semibold transition"
              style={{ borderColor: restoreEditOpen ? ACCENT : "#e7e5e4", color: restoreEditOpen ? ACCENT : "#78716c", background: restoreEditOpen ? "#eff6ff" : "#fafaf9" }}>
              <span className="flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5" />
                {restoreEditOpen ? "Скрыть изменения" : "✏️ Внести изменения в заявку"}
              </span>
              <span className="text-base leading-none">{restoreEditOpen ? "▲" : "▼"}</span>
            </button>

            {restoreEditOpen && (
              <div className="flex flex-col gap-2 mb-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">Имя клиента</label>
                  <input value={reeName} onChange={e => setReeName(e.target.value)} disabled={isRestoring}
                    className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">Телефон</label>
                  <input value={reePhone} onChange={e => setReePhone(e.target.value)} disabled={isRestoring}
                    className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">Email</label>
                  <input type="email" value={reeEmail} onChange={e => setReeEmail(e.target.value)} disabled={isRestoring}
                    className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">Адрес</label>
                  <input value={reeAddr} onChange={e => setReeAddr(e.target.value)} disabled={isRestoring}
                    className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">Техника</label>
                  <input value={reeAppl} onChange={e => setReeAppl(e.target.value)} disabled={isRestoring}
                    className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">Описание поломки</label>
                  <textarea value={reeMsg} onChange={e => setReeMsg(e.target.value)} disabled={isRestoring} rows={2}
                    className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 resize-none disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">Новая дата</label>
                  <select value={reeDate} onChange={e => setReeDate(e.target.value)} disabled={isRestoring}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
                    {getNextBusinessDays(14).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">Новое время</label>
                  <select value={reeTime} onChange={e => setReeTime(e.target.value)} disabled={isRestoring}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                    style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            )}

            <p className="text-xs text-stone-400 mb-3">Заявка вернётся в раздел активных со статусом «Ожидает». HubSpot-сделка будет создана заново.</p>
            {restoreError && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                ⚠️ {restoreError}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setConfirmRestore(null)} disabled={isRestoring}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition disabled:opacity-40">
                Назад
              </button>
              <button onClick={() => restoreBooking()} disabled={isRestoring}
                className="flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60"
                style={{ background: "#f97316" }}>
                {isRestoring ? "⏳ Восстанавливаем..." : "♻️ Восстановить"}
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
              <h3 className="font-bold text-stone-800">Конфликт расписания!</h3>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4 text-sm text-red-700">
              <p className="font-semibold mb-1">Это время уже занято:</p>
              <p>👤 {conflictInfo.conflictWith.name}</p>
              <p>📅 {conflictInfo.conflictWith.date} · {conflictInfo.conflictWith.time}</p>
            </div>
            <p className="text-sm text-stone-600 mb-3">
              Выберите другую дату и время для заявки <strong>{conflictInfo.name}</strong>:
            </p>
            <div className="flex flex-col gap-2 mb-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Новая дата</label>
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
                <label className="block text-xs font-semibold text-stone-500 mb-1">Новое время</label>
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
                Отмена
              </button>
              <button
                onClick={() => restoreBooking(rescheduleDate, rescheduleTime)} disabled={isRestoring}
                className="flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60"
                style={{ background: "#f97316" }}>
                {isRestoring ? "⏳ Восстанавливаем..." : "♻️ Восстановить с новым временем"}
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
              <h3 className="font-bold text-stone-800">Перенести заявку</h3>
            </div>
            <p className="text-sm text-stone-600 mb-1">Клиент: <strong>{confirmReschedule.name}</strong></p>
            <p className="text-sm text-stone-500 mb-3 line-through text-xs">
              Текущее: {confirmReschedule.date} · {confirmReschedule.time}
            </p>

            {rsConflict && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                <p className="font-semibold mb-0.5">⚠️ Слот занят:</p>
                <p>👤 {rsConflict.name} · {rsConflict.date} · {rsConflict.time}</p>
                <p className="mt-1 text-red-600">Выберите другое время.</p>
              </div>
            )}
            {rsError && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                ⚠️ {rsError}
              </div>
            )}

            <div className="flex flex-col gap-2 mb-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Новая дата</label>
                <select value={rsDate} onChange={e => { setRsDate(e.target.value); setRsConflict(null); }}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}>
                  {getNextBusinessDays(14).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Новое время</label>
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
                Отмена
              </button>
              <button onClick={() => rescheduleBooking()} disabled={isRescheduling}
                className="flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60"
                style={{ background: ACCENT }}>
                {isRescheduling ? "⏳ Переносим..." : "📅 Перенести"}
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
              <h3 className="font-bold text-stone-800">Изменить бронирование</h3>
            </div>
            <p className="text-xs text-stone-400 mb-4">ID: {editTarget.id.slice(0, 8).toUpperCase()} · Статус: {editTarget.status}</p>
            <div className="space-y-3">
              <AdminInput label="Имя клиента *" value={eName} onChange={setEName} placeholder="John Smith" />
              <AdminInput label="Телефон *" value={ePhone} onChange={setEPhone} placeholder="(346) 000-0000" type="tel" />
              <AdminInput label="Email клиента" value={eEmail} onChange={setEEmail} placeholder="client@email.com" type="email" />
              <AdminInput label="Адрес (необязательно)" value={eAddr} onChange={setEAddr} placeholder="123 Main St, Houston TX" />
              <AdminInput label="Техника (необязательно)" value={eAppl} onChange={setEAppl} placeholder="Washer, Dryer, Fridge…" />
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Дата *</label>
                <input type="text" value={eDate} onChange={e => setEDate(e.target.value)} placeholder="Apr 25, 2026"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
                <p className="text-[10px] text-stone-400 mt-0.5">Формат: Apr 25, 2026</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Время *</label>
                <select value={eTime} onChange={e => setETime(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400">
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Заметка (необязательно)</label>
                <textarea value={eNote} onChange={e => setENote(e.target.value)} rows={2} placeholder="Дополнительная информация…"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none" />
              </div>
            </div>
            {eError && <p className="text-xs text-red-500 mt-2">{eError}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditTarget(null)}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition">
                Отмена
              </button>
              <button onClick={handleEdit} disabled={eSaving}
                className="flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-50"
                style={{ background: "#7c3aed" }}>
                {eSaving ? "Сохранение…" : "Сохранить изменения"}
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
              <h3 className="font-bold text-stone-800">Создать бронирование</h3>
            </div>
            <p className="text-xs text-stone-400 mb-4">
              {dateStr} · <strong>{manualSlot}</strong>
            </p>
            <div className="space-y-3">
              <AdminInput label="Имя клиента *" value={mName} onChange={setMName} placeholder="John Smith" />
              <AdminInput label="Телефон *" value={mPhone} onChange={setMPhone} placeholder="(346) 000-0000" type="tel" />
              <AdminInput label="Email клиента" value={mEmail} onChange={setMEmail} placeholder="client@email.com" type="email" />
              <AdminInput label="Адрес (необязательно)" value={mAddr} onChange={setMAddr} placeholder="123 Main St, Houston, TX" />
              <AdminInput label="ZIP-код (необязательно)" value={mZip} onChange={setMZip} placeholder="77001" />
              <AdminInput label="Техника (необязательно)" value={mAppl} onChange={setMAppl} placeholder="Холодильник, стиральная машина..." />
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Заметка (необязательно)</label>
                <textarea value={mNote} onChange={e => setMNote(e.target.value)} placeholder="Доп. информация..."
                  rows={2}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                  style={{ "--tw-ring-color": ACCENT } as React.CSSProperties} />
              </div>
            </div>
            {mError && <p className="text-xs text-red-500 mt-2">{mError}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={closeManualModal}
                className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition">
                Отмена
              </button>
              <button onClick={createManualBooking} disabled={mSaving}
                className="flex-1 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60"
                style={{ background: ACCENT }}>
                {mSaving ? "Сохраняю…" : "Забронировать"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header (sticky) ── */}
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
        {/* ── Mobile header: compact 1-row ── */}
        <div className="flex md:hidden items-center gap-2 px-3 h-14">
          <div className="w-8 h-8 rounded-lg flex-none flex items-center justify-center" style={{ background: ACCENT }}>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-stone-800 text-sm leading-tight truncate">HTRGroupTX Admin</div>
            <div className="text-xs text-stone-400 leading-tight truncate">
              {mobileTab === "photos" ? "Загрузка фото на сайт" : mobileTab === "settings" ? "Настройки popup" : "Управление расписанием"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileTab("photos")}
            className={`md:hidden flex-none flex flex-col items-center justify-center gap-0.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold leading-tight transition ${
              mobileTab === "photos"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-stone-200 bg-stone-50 text-stone-600"
            }`}
            aria-label="Фото на сайт"
          >
            <Camera className="w-4 h-4" />
            <span>Фото</span>
          </button>
          <button onClick={logout} className="flex-none flex items-center gap-1 text-xs text-stone-500 hover:text-red-500 transition px-2 py-1.5 rounded-lg hover:bg-red-50">
            <LogOut className="w-3.5 h-3.5" />
            <span>Выйти</span>
          </button>
        </div>

        {/* ── Desktop header: full 3-column ── */}
        <div className="hidden md:grid px-4 h-14 items-center" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-stone-800 leading-tight">Управление расписанием</div>
              <div className="text-xs text-stone-400 leading-tight">HTRGroupTX</div>
            </div>
          </div>
          <div className="text-center px-3">
            <div className="text-xs font-semibold leading-tight" style={{ color: "#dc2626" }}>Database developed by Eivaz Rakhmanov 2026</div>
            <div className="text-xs font-semibold leading-tight" style={{ color: "#16a34a" }}>База данных разработана Эйвазом Рахмановым в 2026 году</div>
          </div>
          <div className="flex justify-end">
            <button onClick={logout} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-red-500 transition">
              <LogOut className="w-4 h-4" />Выйти
            </button>
          </div>
        </div>
      </header>

      {/* ── Tab bar (mobile + desktop) — scroll on narrow screens ── */}
      <div className="sticky top-14 z-20 border-b border-stone-200 bg-white shadow-sm">
        <div className="flex w-full overflow-x-auto overscroll-x-contain">
          <button
            type="button"
            onClick={() => setMobileTab("slots")}
            className={`flex-none min-w-[5.5rem] flex-1 px-2 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              mobileTab === "slots" ? "border-blue-600 text-blue-600" : "border-transparent text-stone-400"
            }`}
          >
            <span className="sm:hidden">📅</span>
            <span className="hidden sm:inline">📅 </span>Слоты
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("bookings")}
            className={`flex-none min-w-[5.5rem] flex-1 px-2 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              mobileTab === "bookings" ? "border-blue-600 text-blue-600" : "border-transparent text-stone-400"
            }`}
          >
            <span className="sm:hidden">📋 {allBookings.length}</span>
            <span className="hidden sm:inline">📋 Заявки ({allBookings.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("photos")}
            className={`flex-none min-w-[5.5rem] flex-1 px-2 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center justify-center gap-1 ${
              mobileTab === "photos" ? "border-blue-600 text-blue-600" : "border-transparent text-stone-400"
            }`}
          >
            <Camera className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Фото</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("settings")}
            className={`flex-none min-w-[5.5rem] flex-1 px-2 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap flex items-center justify-center gap-1 ${
              mobileTab === "settings" ? "border-blue-600 text-blue-600" : "border-transparent text-stone-400"
            }`}
          >
            <Settings className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Настройки</span>
          </button>
        </div>
      </div>

      {/* ── Popup settings (appliance + dental, separate prices) ── */}
      {mobileTab === "settings" && (
        <div
          className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full min-h-[calc(100dvh-7rem)]"
          style={{ paddingBottom: "max(5rem, env(safe-area-inset-bottom))" }}
        >
          <p className="text-sm text-stone-600 mb-4">
            Всплывающее окно при первом заходе на сайт. Цены для Appliance и Dental задаются отдельно.
          </p>
          <div className="space-y-4">
            <VisitFeeSettings apiBase={API()} adminAuthH={adminAuthH} site="appliance" />
            <VisitFeeSettings apiBase={API()} adminAuthH={adminAuthH} site="dental" />
          </div>
        </div>
      )}

      {/* ── Gallery photos tab ── */}
      {mobileTab === "photos" && (
        <div
          className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full min-h-[calc(100dvh-7rem)]"
          style={{ paddingBottom: "max(5rem, env(safe-area-inset-bottom))" }}
        >
          <div className="bg-white rounded-xl shadow-sm p-5 border border-stone-100">
            <h2 className="text-base font-bold text-stone-800 mb-1 flex items-center gap-2">
              <Camera className="w-5 h-5" style={{ color: ACCENT }} />
              Загрузка фото на сайт
            </h2>
            <p className="text-xs text-stone-500 mb-4">
              Раздел Our Work / Gallery — выберите Appliance или Dental перед загрузкой.
            </p>
            <GalleryPhotoManager adminPin={pin} adminBearer={adminBearer} defaultSite="appliance" />
          </div>
        </div>
      )}

      {/* ── Two-panel layout (desktop) / Tab content (mobile) ── */}
      <div className={`flex gap-0 md:overflow-hidden md:h-[calc(100vh-56px)] ${mobileTab === "photos" || mobileTab === "settings" ? "hidden" : ""}`}>

        {/* ═══ LEFT PANEL / Слоты tab ═══ */}
        <div className={`overflow-y-auto border-r border-stone-200 p-4 space-y-4 ${mobileTab !== "slots" ? "hidden md:block" : "block"} md:w-[300px] md:flex-none`}
          style={{ background: "#EFF6FF", paddingBottom: 80 }}>

          {/* Date selector */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-stone-600 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Выберите дату
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
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />Обновить
              </button>
            </div>
            <p className="text-xs text-stone-400 mt-2">Дата: <strong className="text-stone-600">{dateStr}</strong></p>
          </div>

          {/* Slot grid */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-bold text-stone-600 mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Слоты на {dateStr}
            </h2>
            <div className="flex flex-wrap gap-2 text-xs text-stone-500 mb-3">
              <span>🟢 Свободен</span>
              <span>🟠 Заблок.</span>
              <span>🔴 Занят</span>
            </div>

            {/* Block reason */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Причина блокировки:</label>
              <input type="text" value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Повторный вызов..."
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
                      {detail.status === "approved" ? "✅ Подтверждён" : "⏳ Ожидает"}
                    </div>
                    <button onClick={() => setConfirmCancel({ id: detail.id, name: detail.name, time: slot })}
                      disabled={busy}
                      className="mt-1 w-full flex items-center justify-center gap-1 text-[10px] font-semibold py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50">
                      <XCircle className="w-3 h-3" />{busy ? "…" : "Освободить"}
                    </button>
                  </div>
                );

                /* 🟠 Blocked by admin */
                if (blocked) return (
                  <div key={slot} className="rounded-lg border-2 p-2" style={{ borderColor: "#f97316", background: "#fff7ed" }}>
                    <div className="text-xs font-bold text-orange-600">{slot}</div>
                    <div className="text-[10px] text-orange-500 mt-0.5 truncate" title={blocked.reason}>
                      {blocked.reason ? `📝 ${blocked.reason}` : "🔒 Заблокирован"}
                    </div>
                    <button onClick={() => unblockSlot(slot)} disabled={busy}
                      className="mt-1 w-full flex items-center justify-center gap-1 text-[10px] font-semibold py-1 rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 transition disabled:opacity-50">
                      <Unlock className="w-3 h-3" />{busy ? "…" : "Разблокировать"}
                    </button>
                  </div>
                );

                /* 🟢 Free */
                return (
                  <div key={slot} className="rounded-lg border-2 p-2" style={{ borderColor: "#16a34a", background: "#f0fdf4" }}>
                    <div className="text-xs font-bold text-green-700">{slot}</div>
                    <div className="text-[10px] text-green-500 mt-0.5">🟢 Свободен</div>
                    <div className="flex gap-1 mt-1">
                      <button onClick={() => blockSlot(slot)} disabled={busy}
                        className="flex-1 flex items-center justify-center gap-0.5 text-[10px] font-semibold py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition disabled:opacity-50">
                        <Lock className="w-2.5 h-2.5" />{busy ? "…" : "Блок"}
                      </button>
                      <button onClick={() => openManual(slot)} disabled={busy}
                        className="flex-1 flex items-center justify-center gap-0.5 text-[10px] font-semibold py-1 rounded-md text-white transition disabled:opacity-50"
                        style={{ background: ACCENT }}>
                        <PlusCircle className="w-2.5 h-2.5" />Бронь
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL / Заявки tab ═══ */}
        <div className={`overflow-y-auto p-4 ${mobileTab !== "bookings" ? "hidden md:block" : "block"} flex-1`}>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-5">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <h2 className="text-sm font-bold text-stone-600 flex items-center gap-1.5">
              <Wrench className="w-4 h-4" />
              {showCompleted ? "Все заявки" : "Активные заявки"} ({visibleBookings.length})
            </h2>
            <div className="flex rounded-lg border border-stone-200 overflow-hidden text-[11px] font-semibold">
              <button onClick={() => setShowCompleted(false)}
                className={`px-3 py-1.5 transition ${!showCompleted ? "bg-blue-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}>
                Активные{activeBookings.length > 0 ? ` (${activeBookings.length})` : ""}
              </button>
              <button onClick={() => setShowCompleted(true)}
                className={`px-3 py-1.5 border-l border-stone-200 transition ${showCompleted ? "bg-blue-600 text-white" : "bg-white text-stone-500 hover:bg-stone-50"}`}>
                Все заявки{historyBookings.length > 0 ? ` +${historyBookings.length}` : ""}
              </button>
            </div>
          </div>
          {/* ── Search bar ── */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени, телефону, адресу, дате (ГГГГ-ММ-ДД), технике…"
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                title="Очистить">
                ✕
              </button>
            )}
          </div>
          {searchQuery.trim() && (
            <p className="text-[11px] text-stone-400 mb-2 -mt-1">
              Найдено: <strong className="text-stone-600">{filteredBookings.length}</strong> из {visibleBookings.length}
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
                {allSelected ? "Снять всё" : "Выбрать всё"}
              </button>

              {selectedIds.size > 0 && (
                <>
                  <span className="text-xs text-stone-500">Выбрано: <strong>{selectedIds.size}</strong></span>
                  <button
                    onClick={() => { setConfirmBulkDelete(true); setBulkDeleteError(null); }}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-700 text-white hover:bg-red-800 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                    Удалить выбранные ({selectedIds.size})
                  </button>
                  <button
                    onClick={deselectAll}
                    className="text-xs text-stone-400 hover:text-stone-600 transition px-1">
                    × Сбросить
                  </button>
                </>
              )}
            </div>
          )}

          {apiError && (
            <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <div>
                <p className="font-semibold">Ошибка загрузки заявок</p>
                <p className="mt-0.5 text-red-600">{apiError}</p>
              </div>
            </div>
          )}
          {!apiError && filteredBookings.length === 0 ? (
            <p className="text-sm text-stone-400 py-4 text-center">
              {searchQuery.trim() ? "Ничего не найдено — попробуйте другой запрос" : "Заявок пока нет"}
            </p>
          ) : !apiError && (<>
            {/* ── Mobile: card layout ── */}
            <div className="md:hidden space-y-3">
              {filteredBookings.map((b, idx) => {
                const isHistory = b.status === "completed" || b.status === "cancelled";
                const isWA = /AM–|PM–|AM-|PM-/.test(b.preferred_time ?? "");
                const { cls: statusCls, label: statusLabel } = statusInfo(b.status);
                const createdStr = b.created_at ? new Date(b.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" }) : null;
                // Show separator before first history item
                const prevIsActive = idx > 0 && (filteredBookings[idx - 1].status === "pending" || filteredBookings[idx - 1].status === "approved");
                const showSeparator = showCompleted && isHistory && (idx === 0 || prevIsActive);
                return (
                  <React.Fragment key={b.id}>
                    {showSeparator && (
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex-1 h-px bg-stone-200" />
                        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">История</span>
                        <div className="flex-1 h-px bg-stone-200" />
                      </div>
                    )}
                    <div
                      className={`border rounded-xl p-3 transition ${selectedIds.has(b.id) ? "ring-2 ring-blue-400 border-blue-300 bg-blue-50" : isHistory ? "border-stone-100 bg-stone-50 opacity-60" : "border-stone-200 bg-white"}`}>
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
                            {createdStr && <div className="text-[10px] text-stone-400 mt-0.5">Создано: {createdStr}</div>}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCls}`}>{statusLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <User className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-stone-800">{b.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ACCENT }} />
                        <a href={`tel:${b.phone}`} className="text-sm font-medium" style={{ color: ACCENT }}>{b.phone}</a>
                      </div>
                      {b.appliance && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Wrench className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <span className="text-xs text-stone-600">{b.appliance}</span>
                        </div>
                      )}
                      {(b.status === "pending" || b.status === "approved") && (
                        <div className="flex flex-col gap-1.5 mt-1">
                          {b.status === "pending" && (
                            <button onClick={() => approveBooking(b.id)}
                              className="w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition border border-green-100">
                              <ThumbsUp className="w-3.5 h-3.5" /> Одобрить
                            </button>
                          )}
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal(b)}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition border border-violet-100">
                              <Pencil className="w-3.5 h-3.5" /> Изменить
                            </button>
                            <button onClick={() => setConfirmComplete({ id: b.id, name: b.name })}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-100"
                              title="Отметить как выполнено (после фактического ремонта)">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Завершить
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => openReschedule(b)}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-100">
                              <CalendarDays className="w-3.5 h-3.5" /> Перенести
                            </button>
                            <button onClick={() => setConfirmCancel({ id: b.id, name: b.name, time: b.preferred_time })}
                              className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-100">
                              <XCircle className="w-3.5 h-3.5" /> Отменить
                            </button>
                          </div>
                          <button onClick={() => setConfirmDelete({ id: b.id, name: b.name })}
                            className="w-full flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition border border-red-200">
                            <Trash2 className="w-3.5 h-3.5" /> Удалить навсегда
                          </button>
                        </div>
                      )}
                      {(b.status === "cancelled" || b.status === "completed") && (
                        <div className="mt-1 flex gap-2">
                          <button
                            onClick={() => openRestoreModal(b)}
                            className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all duration-150 hover:scale-105 border border-orange-100">
                            <RotateCcw className="w-3.5 h-3.5" /> Восстановить
                          </button>
                          <button onClick={() => setConfirmDelete({ id: b.id, name: b.name })}
                            className="flex items-center justify-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition border border-red-200">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* ── Desktop: table layout ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-stone-500">
                    <th className="px-3 py-2 w-8">
                      <input
                        type="checkbox" checked={allSelected} readOnly
                        onClick={allSelected ? deselectAll : selectAll}
                        className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                      />
                    </th>
                    <th className="text-left px-3 py-2 font-semibold">Создано</th>
                    <th className="text-left px-3 py-2 font-semibold">Дата визита</th>
                    <th className="text-left px-3 py-2 font-semibold">Время</th>
                    <th className="text-left px-3 py-2 font-semibold">Клиент</th>
                    <th className="text-left px-3 py-2 font-semibold">Телефон</th>
                    <th className="text-left px-3 py-2 font-semibold">Техника</th>
                    <th className="text-left px-3 py-2 font-semibold">Статус</th>
                    <th className="text-left px-3 py-2 font-semibold">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b, i) => {
                    const isHistory = b.status === "completed" || b.status === "cancelled";
                    const isWA = /AM–|PM–|AM-|PM-/.test(b.preferred_time ?? "");
                    const { cls: stCls, label: stLabel } = statusInfo(b.status);
                    const createdStr = b.created_at
                      ? new Date(b.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" })
                      : "—";
                    // Separator row before first history item
                    const prevIsActive = i > 0 && (filteredBookings[i - 1].status === "pending" || filteredBookings[i - 1].status === "approved");
                    const showSepRow = showCompleted && isHistory && (i === 0 || prevIsActive);
                    return (
                      <React.Fragment key={b.id}>
                        {showSepRow && (
                          <tr>
                            <td colSpan={9} className="px-3 py-1.5">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-px bg-stone-200" />
                                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">История</span>
                                <div className="flex-1 h-px bg-stone-200" />
                              </div>
                            </td>
                          </tr>
                        )}
                        <tr className={`${selectedIds.has(b.id) ? "bg-blue-50 ring-1 ring-inset ring-blue-300" : i % 2 === 0 ? "bg-white" : "bg-stone-50"} ${isHistory && !selectedIds.has(b.id) ? "opacity-50" : ""} hover:bg-blue-50 transition-colors cursor-default`}>
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(b.id)}
                              onChange={() => toggleSelect(b.id)}
                              className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-2 text-stone-400 whitespace-nowrap">{createdStr}</td>
                          <td className="px-3 py-2 font-semibold text-stone-700 whitespace-nowrap">{b.preferred_date}</td>
                          <td className="px-3 py-2 text-stone-600">
                            <div className="flex items-center gap-1 flex-wrap">
                              {b.preferred_time}
                              {isWA && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700 leading-none">
                                  WA
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-stone-700">
                            <span className="flex items-center gap-1"><User className="w-3 h-3 text-stone-400" />{b.name}</span>
                          </td>
                          <td className="px-3 py-2">
                            <a href={`tel:${b.phone}`} className="flex items-center gap-1" style={{ color: ACCENT }}>
                              <Phone className="w-3 h-3" />{b.phone}
                            </a>
                          </td>
                          <td className="px-3 py-2 text-stone-600">{b.appliance || "—"}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${stCls}`}>
                              {stLabel}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {(b.status === "pending" || b.status === "approved") && (
                              <div className="flex items-center gap-2 flex-wrap">
                                {b.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => approveBooking(b.id)}
                                      className="flex items-center gap-1 text-green-600 hover:text-green-800 font-semibold transition"
                                      title="Одобрить бронирование и отправить email клиенту">
                                      <ThumbsUp className="w-3.5 h-3.5" /> Одобрить
                                    </button>
                                    <span className="text-stone-300">|</span>
                                  </>
                                )}
                                <button
                                  onClick={() => openEditModal(b)}
                                  className="flex items-center gap-1 text-violet-600 hover:text-violet-800 font-semibold transition"
                                  title="Изменить данные бронирования">
                                  <Pencil className="w-3.5 h-3.5" /> Изменить
                                </button>
                                <span className="text-stone-300">|</span>
                                <button
                                  onClick={() => openReschedule(b)}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold transition"
                                  title="Перенести на другую дату/время">
                                  <CalendarDays className="w-3.5 h-3.5" /> Перенести
                                </button>
                                <span className="text-stone-300">|</span>
                                <button
                                  onClick={() => setConfirmComplete({ id: b.id, name: b.name })}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold transition"
                                  title="Отметить как выполнено (после фактического ремонта)">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Завершить
                                </button>
                                <span className="text-stone-300">|</span>
                                <button
                                  onClick={() => setConfirmCancel({ id: b.id, name: b.name, time: b.preferred_time })}
                                  className="flex items-center gap-1 text-red-500 hover:text-red-700 font-semibold transition"
                                  title="Отменить бронирование">
                                  <XCircle className="w-3.5 h-3.5" /> Отменить
                                </button>
                                <span className="text-stone-300">|</span>
                                <button
                                  onClick={() => setConfirmDelete({ id: b.id, name: b.name })}
                                  className="flex items-center gap-1 text-red-700 hover:text-red-900 font-semibold transition"
                                  title="Удалить заявку навсегда из базы данных">
                                  <Trash2 className="w-3.5 h-3.5" /> Удалить
                                </button>
                              </div>
                            )}
                            {(b.status === "cancelled" || b.status === "completed") && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openRestoreModal(b)}
                                  className="flex items-center gap-1 font-semibold transition-all duration-150 hover:scale-110 origin-left"
                                  style={{ color: "#f97316" }}
                                  title="Восстановить заявку в активные">
                                  <RotateCcw className="w-3.5 h-3.5" /> Восстановить
                                </button>
                                <span className="text-stone-300">|</span>
                                <button
                                  onClick={() => setConfirmDelete({ id: b.id, name: b.name })}
                                  className="flex items-center gap-1 text-red-700 hover:text-red-900 font-semibold transition"
                                  title="Удалить заявку навсегда из базы данных">
                                  <Trash2 className="w-3.5 h-3.5" /> Удалить
                                </button>
                              </div>
                            )}
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

      {/* ── Developer footer ── */}
      <div className="mt-6 pb-8 text-center space-y-1">
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
