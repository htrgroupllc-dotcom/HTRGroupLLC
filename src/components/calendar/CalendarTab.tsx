import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ChevronLeft, ChevronRight, RefreshCw, CalendarDays, GripVertical, X, Clock,
} from "lucide-react";
import { resolveBookingBiz } from "@/lib/adminSiteConfig";
import {
  type CalendarView,
  houstonNow,
  startOfWeek,
  addDays,
  addMonths,
  formatWeekRange,
  formatMonthYear,
  formatYear,
  formatDayHeader,
  formatTime,
  isoRangeForView,
  slotIndexFromIso,
  isoFromDaySlot,
  eventColor,
  SLOT_START_HOUR,
  SLOT_END_HOUR,
  SLOT_STEP_MINS,
  DEFAULT_DURATION_MINS,
  MONTHS_LONG,
  WEEKDAYS_SHORT,
  getMonthGrid,
  isSameDay,
  isSameMonth,
  isPastDay,
  isToday,
} from "@/lib/calendarUtils";

const ACCENT = "#1B6FE8";

export interface CalendarEvent {
  id: string;
  title: string;
  client_name: string;
  phone?: string;
  address?: string;
  appliance?: string;
  brand_model?: string;
  status: string;
  business_type?: string;
  serial_number?: string | null;
  preferred_date?: string;
  preferred_time?: string;
  start_at: string;
  end_at: string;
  duration_minutes: number;
  assigned_employee_id?: string | null;
  employee_name?: string | null;
  is_overdue?: boolean;
  is_remote?: boolean;
}

interface EmployeeOpt { id: string; name: string; phone?: string }

interface Labels {
  title: string;
  week: string;
  month: string;
  year: string;
  today: string;
  refresh: string;
  allEmployees: string;
  bizAll: string;
  bizAppliance: string;
  bizDental: string;
  noEvents: string;
  loading: string;
  dragHint: string;
  tapHint: string;
  serialNumber: string;
  technician: string;
  statusCompleted: string;
  statusApproved: string;
  statusPending: string;
  overdue: string;
  rescheduleOk: string;
  rescheduleErr: string;
  moveJob: string;
  pickTime: string;
  openCrm: string;
}

interface Props {
  apiBase: string;
  authHeaders: () => Record<string, string>;
  mode: "admin" | "employee";
  labels: Labels;
  locale?: string;
  onOpenBooking?: (id: string) => void;
}

const TIME_SLOTS: string[] = [];
for (let h = SLOT_START_HOUR; h <= SLOT_END_HOUR; h++) {
  for (let m = 0; m < 60; m += SLOT_STEP_MINS) {
    if (h === SLOT_END_HOUR && m > 0) break;
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    TIME_SLOTS.push(`${hour12}:${String(m).padStart(2, "0")} ${ampm}`);
  }
}

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const fn = () => setMobile(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return mobile;
}

export default function CalendarTab({
  apiBase, authHeaders, mode, labels, locale = "en-US", onOpenBooking,
}: Props) {
  const isMobile = useIsMobile();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [view, setView] = useState<CalendarView>("week");
  const [anchor, setAnchor] = useState(() => houstonNow());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOpt[]>([]);
  const [empFilter, setEmpFilter] = useState("");
  const [bizFilter, setBizFilter] = useState<"all" | "appliance" | "dental">("all");
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveTargetDay, setMoveTargetDay] = useState<Date>(() => houstonNow());
  const [dragId, setDragId] = useState<string | null>(null);
  const [touchDragId, setTouchDragId] = useState<string | null>(null);
  const [dropHoverDay, setDropHoverDay] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileDay, setMobileDay] = useState(() => houstonNow());

  const today = useMemo(() => houstonNow(), [anchor, view]);
  const weekStart = useMemo(() => startOfWeek(anchor), [anchor]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const loadEmployees = useCallback(async () => {
    if (mode !== "admin") return;
    try {
      const r = await fetch(`${apiBase}/api/calendar/employees`, { headers: authHeaders() });
      const d = await r.json() as { employees?: EmployeeOpt[] };
      setEmployees(d.employees ?? []);
    } catch { /* ignore */ }
  }, [apiBase, authHeaders, mode]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = isoRangeForView(view, anchor);
      const q = new URLSearchParams({ from, to });
      if (empFilter) q.set("employee_id", empFilter);
      if (bizFilter !== "all") q.set("business_type", bizFilter);
      const r = await fetch(`${apiBase}/api/calendar/events?${q}`, {
        headers: authHeaders(),
        cache: "no-store",
      });
      const d = await r.json() as { events?: CalendarEvent[] };
      setEvents(d.events ?? []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, authHeaders, view, anchor, empFilter, bizFilter]);

  useEffect(() => { void loadEmployees(); }, [loadEmployees]);
  useEffect(() => { void loadEvents(); }, [loadEvents]);
  useEffect(() => { setMobileDay(anchor); }, [weekStart, anchor]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const navigate = (dir: -1 | 1) => {
    if (view === "week") setAnchor((a) => addDays(a, dir * 7));
    else if (view === "month") setAnchor((a) => addMonths(a, dir));
    else setAnchor((a) => new Date(a.getFullYear() + dir, a.getMonth(), a.getDate()));
  };

  const goToday = () => {
    const now = houstonNow();
    setAnchor(now);
    setMobileDay(now);
  };

  const selectDay = (day: Date) => {
    setAnchor(day);
    setMobileDay(day);
  };

  const headerTitle = view === "week"
    ? formatWeekRange(weekStart, locale)
    : view === "month"
      ? formatMonthYear(anchor, locale)
      : formatYear(anchor);

  const canReschedule = (ev: CalendarEvent) =>
    ev.status !== "completed" && ev.status !== "cancelled";

  const reschedule = async (eventId: string, start_at: string) => {
    try {
      const end = new Date(new Date(start_at).getTime() + DEFAULT_DURATION_MINS * 60_000).toISOString();
      const r = await fetch(`${apiBase}/api/calendar/events/${eventId}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ start_at, end_at: end }),
      });
      const d = await r.json() as { error?: string; message?: string };
      if (!r.ok) throw new Error(d.message ?? d.error ?? "Error");
      showToast(labels.rescheduleOk);
      setMoveOpen(false);
      setSelected(null);
      setTouchDragId(null);
      setDragId(null);
      setDropHoverDay(null);
      void loadEvents();
    } catch (e) {
      showToast(e instanceof Error ? e.message : labels.rescheduleErr);
    }
  };

  const slotForEvent = (ev: CalendarEvent) => {
    const s = slotIndexFromIso(ev.start_at);
    return s >= 0 && s < TIME_SLOTS.length ? s : 2;
  };

  const onDropDay = (targetDay: Date) => {
    const id = dragId ?? touchDragId;
    if (!id) return;
    const ev = events.find((e) => e.id === id);
    if (!ev) return;
    void reschedule(id, isoFromDaySlot(targetDay, slotForEvent(ev)));
    setDragId(null);
    setTouchDragId(null);
    setDropHoverDay(null);
  };

  const eventsForDay = (day: Date) =>
    events.filter((ev) => {
      const d = new Date(ev.start_at);
      return isSameDay(
        new Date(d.toLocaleString("en-US", { timeZone: "America/Chicago" })),
        day,
      );
    });

  const statusLabel = (s: string) => {
    if (s === "completed") return labels.statusCompleted;
    if (s === "approved") return labels.statusApproved;
    return labels.statusPending;
  };

  const bizBadge = (ev: CalendarEvent) => {
    const b = resolveBookingBiz(ev.business_type);
    return (
      <span className={`text-xs px-1.5 py-0.5 rounded ${b === "appliance" ? "bg-sky-100 text-sky-700" : "bg-violet-100 text-violet-700"}`}>
        {b === "appliance" ? labels.bizAppliance : labels.bizDental}
      </span>
    );
  };

  const dayChipClass = (day: Date, active: boolean) => {
    const past = isPastDay(day, today);
    const todayMark = isToday(day, today);
    if (active) return "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200";
    if (todayMark) return "border-blue-400 bg-blue-50/60 text-blue-700";
    if (past) return "border-stone-300 bg-stone-50 text-stone-700 active:bg-stone-100";
    return "border-stone-200 bg-white text-stone-600 active:bg-stone-50";
  };

  const dayKey = (day: Date) => `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleEventTouchStart = (ev: CalendarEvent) => (e: React.TouchEvent) => {
    if (!canReschedule(ev)) return;
    clearLongPress();
    longPressTimer.current = setTimeout(() => {
      setTouchDragId(ev.id);
      setSelected(null);
      if (navigator.vibrate) navigator.vibrate(20);
    }, 280);
    e.stopPropagation();
  };

  const handleDayClick = (day: Date, inMonth: boolean) => {
    if (touchDragId) {
      onDropDay(day);
      return;
    }
    selectDay(day);
    if (view === "month" && inMonth) setView("week");
  };

  const EventChip = ({
    ev, size = "md", inDragMode,
  }: { ev: CalendarEvent; size?: "sm" | "md"; inDragMode?: boolean }) => {
    const dragging = dragId === ev.id || touchDragId === ev.id;
    const color = eventColor(ev.status, !!ev.is_overdue);
    const textSize = size === "sm" ? "text-[7px] leading-tight" : "text-[9px] leading-tight";
    const pad = size === "sm" ? "px-0.5 py-px" : "px-1 py-0.5";

    return (
      <div
        draggable={canReschedule(ev) && !isMobile}
        onDragStart={(e) => {
          if (!canReschedule(ev)) return;
          setDragId(ev.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => setDragId(null)}
        onTouchStart={handleEventTouchStart(ev)}
        onTouchEnd={() => clearLongPress()}
        onClick={(e) => {
          e.stopPropagation();
          if (inDragMode) return;
          if (!touchDragId) {
            setSelected(ev);
            setMoveOpen(false);
            setMoveTargetDay(mobileDay);
          }
        }}
        className={`${textSize} ${pad} rounded text-white truncate w-full text-left touch-manipulation flex items-center gap-0.5 ${
          canReschedule(ev) ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
        } ${dragging ? "opacity-50 ring-2 ring-white/80 scale-95" : ""}`}
        style={{ background: color }}
        title={`${formatTime(ev.start_at, locale)} ${ev.client_name}`}
      >
        {canReschedule(ev) && size !== "sm" && (
          <GripVertical className="w-2 h-2 shrink-0 opacity-70" />
        )}
        <span className="truncate">
          {size === "sm" ? ev.client_name.split(" ")[0] : `${formatTime(ev.start_at, locale)} ${ev.client_name}`}
        </span>
      </div>
    );
  };

  const DaySquare = ({
    day,
    inMonth = true,
    size = "md",
    showWeekday = false,
  }: {
    day: Date;
    inMonth?: boolean;
    size?: "sm" | "md";
    showWeekday?: boolean;
  }) => {
    const dayEvents = eventsForDay(day);
    const past = isPastDay(day, today);
    const todayMark = isToday(day, today);
    const key = dayKey(day);
    const isDropHover = dropHoverDay === key;
    const isDragging = !!(dragId || touchDragId);
    const maxEvents = size === "sm" ? 2 : isMobile ? 3 : 5;

    return (
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") handleDayClick(day, inMonth); }}
        onClick={() => handleDayClick(day, inMonth)}
        onDragOver={(e) => {
          e.preventDefault();
          setDropHoverDay(key);
        }}
        onDragLeave={() => setDropHoverDay((k) => (k === key ? null : k))}
        onDrop={(e) => {
          e.preventDefault();
          onDropDay(day);
        }}
        className={`
          aspect-square border rounded-md flex flex-col overflow-hidden touch-manipulation transition
          ${size === "sm" ? "p-0.5" : "p-1"}
          ${!inMonth ? "bg-stone-50/90 border-stone-100 opacity-60" : past ? "bg-stone-50 border-stone-200" : "bg-white border-stone-200"}
          ${todayMark ? "ring-2 ring-blue-500 ring-inset bg-blue-50/40" : ""}
          ${isDropHover && isDragging ? "bg-blue-100 border-blue-400 scale-[1.02] shadow-md" : ""}
          ${isDragging && inMonth ? "hover:bg-blue-50" : "active:bg-blue-50/60"}
        `}
      >
        <div className={`flex items-center justify-between shrink-0 ${size === "sm" ? "mb-0.5" : "mb-1"}`}>
          {showWeekday && (
            <span className={`font-semibold uppercase ${size === "sm" ? "text-[7px]" : "text-[8px]"} text-stone-400`}>
              {WEEKDAYS_SHORT[day.getDay()]}
            </span>
          )}
          <span className={`font-bold ml-auto leading-none ${
            size === "sm" ? "text-[9px]" : "text-[11px]"
          } ${
            todayMark
              ? "bg-blue-600 text-white rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[9px]"
              : !inMonth ? "text-stone-300" : past ? "text-stone-500" : "text-stone-700"
          }`}>
            {day.getDate()}
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5" style={{ scrollbarWidth: "none" }}>
          {dayEvents.slice(0, maxEvents).map((ev) => (
            <EventChip key={ev.id} ev={ev} size={size} inDragMode={!!touchDragId} />
          ))}
          {dayEvents.length > maxEvents && (
            <div className={`text-stone-500 font-semibold ${size === "sm" ? "text-[7px]" : "text-[8px]"}`}>
              +{dayEvents.length - maxEvents}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col h-full min-h-[calc(100dvh-56px)] md:min-h-[calc(100vh-120px)] bg-stone-50"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      {/* Toolbar */}
      <div className="sticky top-14 md:top-28 z-10 bg-white border-b border-stone-200 px-2 md:px-3 py-2 flex flex-col gap-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600 shrink-0 hidden sm:block" />
          <span className="font-bold text-stone-700 text-sm">{labels.title}</span>

          <div className="flex rounded-lg border border-stone-200 overflow-hidden text-xs font-semibold shrink-0">
            {(["week", "month", "year"] as CalendarView[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`min-h-[44px] md:min-h-0 px-3 py-2 md:py-1.5 transition touch-manipulation ${view === v ? "bg-blue-600 text-white" : "bg-white text-stone-500"}`}
              >
                {v === "week" ? labels.week : v === "month" ? labels.month : labels.year}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 ml-auto">
            <button type="button" onClick={() => navigate(-1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-stone-100 touch-manipulation" aria-label="Previous">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" onClick={goToday} className="min-h-[44px] px-2 text-xs font-semibold rounded border border-stone-200 touch-manipulation">
              {labels.today}
            </button>
            <button type="button" onClick={() => navigate(1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-stone-100 touch-manipulation" aria-label="Next">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => void loadEvents()} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-stone-100 touch-manipulation" title={labels.refresh}>
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="text-xs font-semibold text-stone-600 text-center md:text-left">{headerTitle}</div>

        <div className="flex flex-wrap gap-2">
          {mode === "admin" && (
            <select
              value={empFilter}
              onChange={(e) => setEmpFilter(e.target.value)}
              className="flex-1 min-w-[120px] text-xs border border-stone-200 rounded-lg px-2 py-2.5 bg-white min-h-[44px]"
            >
              <option value="">{labels.allEmployees}</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          )}
          {mode === "admin" && (
            <select
              value={bizFilter}
              onChange={(e) => setBizFilter(e.target.value as typeof bizFilter)}
              className="flex-1 min-w-[120px] text-xs border border-stone-200 rounded-lg px-2 py-2.5 bg-white min-h-[44px]"
            >
              <option value="all">{labels.bizAll}</option>
              <option value="appliance">{labels.bizAppliance}</option>
              <option value="dental">{labels.bizDental}</option>
            </select>
          )}
        </div>
      </div>

      <p className="text-[10px] text-stone-400 px-3 py-1">
        {touchDragId
          ? (isMobile ? "Tap a day square to move the job" : labels.dragHint)
          : (isMobile ? labels.tapHint : labels.dragHint)}
      </p>

      {loading && (
        <div className="p-4 text-center text-stone-400 text-sm">{labels.loading}</div>
      )}

      {/* WEEK — square grid (7 days) */}
      {view === "week" && (
        <div className="flex-1 overflow-auto p-2 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="border border-stone-200 rounded-lg bg-white overflow-hidden p-1 md:p-2">
            <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-0.5 md:mb-1">
              {WEEKDAYS_SHORT.map((wd) => (
                <div key={wd} className="text-center text-[9px] md:text-[10px] font-semibold text-stone-500 py-1">
                  {wd}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 md:gap-1.5">
              {weekDays.map((d) => (
                <DaySquare key={d.toISOString()} day={d} size={isMobile ? "sm" : "md"} />
              ))}
            </div>
          </div>

          {!loading && events.length === 0 && (
            <div className="text-center text-stone-400 text-sm py-6">{labels.noEvents}</div>
          )}
        </div>
      )}

      {/* MONTH — square grid */}
      {view === "month" && (
        <div className="flex-1 overflow-auto p-2 md:p-3 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="border border-stone-200 rounded-lg bg-white overflow-hidden p-1 md:p-2">
            <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-0.5 md:mb-1">
              {WEEKDAYS_SHORT.map((wd) => (
                <div key={wd} className="text-center text-[9px] md:text-[10px] font-semibold text-stone-500 py-1">{wd}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 md:gap-1">
              {getMonthGrid(anchor.getFullYear(), anchor.getMonth()).map((day) => (
                <DaySquare
                  key={day.toISOString()}
                  day={day}
                  inMonth={isSameMonth(day, anchor)}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* YEAR — month squares with mini day grid */}
      {view === "year" && (
        <div className="flex-1 overflow-auto p-2 md:p-3 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {MONTHS_LONG.map((name, mi) => {
              const monthDate = new Date(anchor.getFullYear(), mi, 1);
              const monthEvents = events.filter((ev) => {
                const d = new Date(ev.start_at);
                return d.getFullYear() === anchor.getFullYear() && d.getMonth() === mi;
              });
              const countByDay = new Map<number, number>();
              monthEvents.forEach((ev) => {
                const day = new Date(ev.start_at).getDate();
                countByDay.set(day, (countByDay.get(day) ?? 0) + 1);
              });
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => { setAnchor(monthDate); setView("month"); }}
                  className="border border-stone-200 rounded-lg bg-white p-2 text-left hover:border-blue-300 active:bg-stone-50 transition touch-manipulation"
                >
                  <div className="text-xs font-bold text-stone-700 mb-2">{name}</div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {getMonthGrid(anchor.getFullYear(), mi).slice(0, 35).map((day) => {
                      const cnt = isSameMonth(day, monthDate) ? (countByDay.get(day.getDate()) ?? 0) : 0;
                      return (
                        <div
                          key={day.toISOString()}
                          className={`aspect-square rounded-sm flex items-center justify-center ${
                            cnt > 0 ? "bg-blue-500 text-white" : "bg-stone-100"
                          }`}
                          style={{ opacity: cnt > 0 ? Math.min(1, 0.45 + cnt * 0.18) : 0.35 }}
                        >
                          {cnt > 0 && isSameMonth(day, monthDate) && (
                            <span className="text-[6px] font-bold">{day.getDate()}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[9px] text-stone-400 mt-1">{monthEvents.length} jobs</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Job drawer / bottom sheet */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end bg-black/40"
          onClick={() => { setSelected(null); setMoveOpen(false); setTouchDragId(null); }}
        >
          <div
            className="w-full md:max-w-sm bg-white md:h-full shadow-xl overflow-y-auto rounded-t-2xl md:rounded-none p-4 max-h-[90dvh]"
            style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-3 md:hidden" />
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-stone-800 text-lg">{selected.client_name}</h3>
              <button type="button" className="min-w-[44px] min-h-[44px] flex items-center justify-center" onClick={() => { setSelected(null); setMoveOpen(false); }}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-stone-600">
              <p><span className="font-semibold">{selected.appliance}</span></p>
              {selected.phone && <p>📞 <a href={`tel:${selected.phone}`} className="text-blue-600">{selected.phone}</a></p>}
              {selected.address && (
                <p>📍 <a href={`https://maps.google.com/?q=${encodeURIComponent(selected.address)}`} target="_blank" rel="noreferrer" className="text-blue-600">{selected.address}</a></p>
              )}
              <p>📅 {selected.preferred_date} · {selected.preferred_time}</p>
              {selected.employee_name && <p>{labels.technician}: {selected.employee_name}</p>}
              {selected.serial_number && <p>{labels.serialNumber}: {selected.serial_number}</p>}
              <p className="flex items-center gap-2 flex-wrap">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold text-white"
                  style={{ background: eventColor(selected.status, !!selected.is_overdue) }}>
                  {selected.is_overdue ? labels.overdue : statusLabel(selected.status)}
                </span>
                {bizBadge(selected)}
              </p>
            </div>

            {canReschedule(selected) && (
              <div className="mt-4">
                {!moveOpen ? (
                  <button
                    type="button"
                    onClick={() => { setMoveOpen(true); setMoveTargetDay(mobileDay); }}
                    className="w-full min-h-[44px] py-2 rounded-lg border-2 border-blue-600 text-blue-600 text-sm font-semibold touch-manipulation flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" /> {labels.moveJob}
                  </button>
                ) : (
                  <div className="border border-stone-200 rounded-lg p-3 bg-stone-50">
                    <p className="text-xs font-semibold text-stone-600 mb-2">{labels.pickTime}</p>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {weekDays.map((d) => (
                        <button
                          key={d.toISOString()}
                          type="button"
                          onClick={() => setMoveTargetDay(d)}
                          className={`aspect-square rounded-lg border text-center text-[9px] font-bold touch-manipulation flex flex-col items-center justify-center ${dayChipClass(d, isSameDay(d, moveTargetDay))}`}
                        >
                          <span className="text-[8px]">{WEEKDAYS_SHORT[d.getDay()]}</span>
                          <span>{d.getDate()}</span>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto">
                      {TIME_SLOTS.map((slot, slotIdx) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => { void reschedule(selected.id, isoFromDaySlot(moveTargetDay, slotIdx)); }}
                          className="min-h-[44px] text-[10px] font-semibold rounded bg-white border border-stone-200 active:bg-blue-50 touch-manipulation"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {onOpenBooking && (
              <button
                type="button"
                onClick={() => { onOpenBooking(selected.id); setSelected(null); setMoveOpen(false); }}
                className="mt-3 w-full min-h-[44px] py-2 rounded-lg text-white text-sm font-semibold touch-manipulation"
                style={{ background: ACCENT }}
              >
                {labels.openCrm} →
              </button>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-[60] bg-stone-800 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg max-w-[90vw] text-center"
          style={{ bottom: "max(16px, env(safe-area-inset-bottom))" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
