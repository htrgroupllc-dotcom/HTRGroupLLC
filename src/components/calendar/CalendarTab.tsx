import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ChevronLeft, ChevronRight, RefreshCw, CalendarDays, X, Clock, ChevronDown, GripVertical,
} from "lucide-react";
import { resolveBookingBiz } from "@/lib/adminSiteConfig";
import CalendarBookingFormModal, { type CalendarBookingFormLabels } from "./CalendarBookingFormModal";
import {
  type CalendarView,
  houstonNow,
  addMonths,
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
  isToday,
  startOfWeek,
} from "@/lib/calendarUtils";

const ACCENT = "#1B6FE8";
/** Fixed pixel layout — prod CSS bundle lacks grid-cols-7 / gap-0.5 */
const CAL_CELL = 32;
const CAL_GAP = 2;
const CAL_GRID_W = 7 * CAL_CELL + 6 * CAL_GAP;

const calGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: `repeat(7, ${CAL_CELL}px)`,
  gap: CAL_GAP,
  width: CAL_GRID_W,
  maxWidth: "100%",
  margin: "0 auto",
};

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
  message?: string;
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
  newBooking: string;
  editBooking: string;
  bookingForm: CalendarBookingFormLabels;
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

const EMPTY_DAY_BG = "#f5f5f4";

function statusPriority(ev: CalendarEvent): number {
  if (ev.is_overdue) return 5;
  if (ev.status === "pending") return 4;
  if (ev.status === "approved" || ev.status === "confirmed" || ev.status === "scheduled") return 3;
  if (ev.status === "in_progress") return 2;
  if (ev.status === "completed") return 1;
  return 0;
}

/** Dominant status color for a day cell (highest-priority job). */
function dayCellColor(events: CalendarEvent[]): string {
  if (events.length === 0) return EMPTY_DAY_BG;
  const top = events.reduce((a, b) => (statusPriority(a) >= statusPriority(b) ? a : b));
  return eventColor(top.status, !!top.is_overdue);
}

function textOnBg(bg: string): string {
  if (bg === EMPTY_DAY_BG) return "#57534e";
  return "#ffffff";
}

export default function CalendarTab({
  apiBase, authHeaders, mode, labels, locale = "en-US", onOpenBooking,
}: Props) {
  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState(() => houstonNow());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOpt[]>([]);
  const [empFilter, setEmpFilter] = useState("");
  const [bizFilter, setBizFilter] = useState<"all" | "appliance" | "dental">("all");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveTargetDay, setMoveTargetDay] = useState<Date>(() => houstonNow());
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropHoverKey, setDropHoverKey] = useState<string | null>(null);
  const [touchDragId, setTouchDragId] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [bookingFormMode, setBookingFormMode] = useState<"create" | "edit">("create");
  const [bookingFormDay, setBookingFormDay] = useState<Date>(() => houstonNow());
  const [bookingFormEvent, setBookingFormEvent] = useState<CalendarEvent | null>(null);

  const today = useMemo(() => houstonNow(), [anchor, view]);
  const weekStart = useMemo(() => startOfWeek(selectedDay ?? anchor), [selectedDay, anchor]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    }),
    [weekStart],
  );

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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const navigate = (dir: -1 | 1) => {
    if (view === "month") setAnchor((a) => addMonths(a, dir));
    else setAnchor((a) => new Date(a.getFullYear() + dir, a.getMonth(), a.getDate()));
    setSelectedDay(null);
  };

  const goToday = () => {
    const now = houstonNow();
    setAnchor(now);
    setSelectedDay(now);
  };

  const headerTitle = view === "month" ? formatMonthYear(anchor, locale) : formatYear(anchor);

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
      setDragId(null);
      setTouchDragId(null);
      setDropHoverKey(null);
      void loadEvents();
    } catch (e) {
      showToast(e instanceof Error ? e.message : labels.rescheduleErr);
    }
  };

  const slotForEvent = (ev: CalendarEvent) => {
    const s = slotIndexFromIso(ev.start_at);
    return s >= 0 && s < TIME_SLOTS.length ? s : 2;
  };

  const dayKey = (day: Date) => `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;

  const onDropDay = (targetDay: Date) => {
    const id = dragId ?? touchDragId;
    if (!id) return;
    const ev = events.find((e) => e.id === id);
    if (!ev || !canReschedule(ev)) return;
    void reschedule(id, isoFromDaySlot(targetDay, slotForEvent(ev)));
    setDragId(null);
    setTouchDragId(null);
    setDropHoverKey(null);
  };

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const startJobDrag = (ev: CalendarEvent, e: React.DragEvent) => {
    if (!canReschedule(ev)) return;
    setDragId(ev.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", ev.id);
  };

  const startJobTouchDrag = (ev: CalendarEvent) => (e: React.TouchEvent) => {
    if (!canReschedule(ev)) return;
    clearLongPress();
    longPressTimer.current = setTimeout(() => {
      setTouchDragId(ev.id);
      if (navigator.vibrate) navigator.vibrate(20);
    }, 280);
    e.stopPropagation();
  };

  const eventsForDay = (day: Date) =>
    events
      .filter((ev) => {
        const d = new Date(ev.start_at);
        return isSameDay(
          new Date(d.toLocaleString("en-US", { timeZone: "America/Chicago" })),
          day,
        );
      })
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

  const statusLabel = (s: string) => {
    if (s === "completed") return labels.statusCompleted;
    if (s === "approved") return labels.statusApproved;
    return labels.statusPending;
  };

  const bizBadge = (ev: CalendarEvent) => {
    const b = resolveBookingBiz(ev.business_type);
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded ${b === "appliance" ? "bg-sky-100 text-sky-700" : "bg-violet-100 text-violet-700"}`}>
        {b === "appliance" ? labels.bizAppliance : labels.bizDental}
      </span>
    );
  };

  const openFullBooking = (id: string) => {
    if (!onOpenBooking) return;
    onOpenBooking(id);
    setSelectedDay(null);
    setSelected(null);
    setMoveOpen(false);
  };

  const openBookingForm = (mode: "create" | "edit", day: Date, ev?: CalendarEvent | null) => {
    setBookingFormMode(mode);
    setBookingFormDay(day);
    setBookingFormEvent(ev ?? null);
    setBookingFormOpen(true);
  };

  const openDay = (day: Date) => {
    setSelectedDay(day);
    setSelected(null);
    setMoveOpen(false);
    openBookingForm("create", day);
  };

  const CompactDayCell = ({ day }: { day: Date }) => {
    const inMonth = isSameMonth(day, anchor);
    const dayEvents = eventsForDay(day);
    const bg = inMonth ? dayCellColor(dayEvents) : EMPTY_DAY_BG;
    const fg = inMonth ? textOnBg(bg) : "#d6d3d1";
    const todayMark = isToday(day, today);
    const active = selectedDay ? isSameDay(day, selectedDay) : false;
    const count = dayEvents.length;
    const key = dayKey(day);
    const isDropHover = dropHoverKey === key && !!(dragId || touchDragId);
    const isDragging = !!(dragId || touchDragId);

    return (
      <button
        type="button"
        onClick={() => {
          if (touchDragId) {
            onDropDay(day);
            return;
          }
          if (inMonth) openDay(day);
        }}
        disabled={!inMonth}
        onDragOver={(e) => {
          if (!isDragging) return;
          e.preventDefault();
          setDropHoverKey(key);
        }}
        onDragLeave={() => setDropHoverKey((k) => (k === key ? null : k))}
        onDrop={(e) => {
          e.preventDefault();
          if (inMonth) onDropDay(day);
        }}
        title={count > 0 ? `${day.getDate()}: ${count} job(s)` : String(day.getDate())}
        style={{
          width: CAL_CELL,
          height: CAL_CELL,
          padding: 0,
          margin: 0,
          border: isDropHover ? "2px solid #2563eb" : active ? "2px solid #2563eb" : todayMark ? "1px solid #60a5fa" : "1px solid rgba(0,0,0,0.06)",
          borderRadius: 4,
          background: isDropHover ? "#dbeafe" : inMonth ? bg : "#fafaf9",
          color: isDropHover ? "#1d4ed8" : fg,
          fontSize: 11,
          fontWeight: 600,
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          cursor: inMonth ? (isDragging ? "copy" : "pointer") : "default",
          opacity: inMonth ? 1 : 0.45,
          boxSizing: "border-box",
          touchAction: "manipulation",
          transform: isDropHover ? "scale(1.08)" : undefined,
          transition: "transform 0.1s, background 0.1s",
        }}
      >
        <span>{day.getDate()}</span>
        {count > 1 && inMonth && (
          <span
            style={{
              position: "absolute",
              bottom: 1,
              right: 2,
              fontSize: 7,
              fontWeight: 700,
              color: fg,
              lineHeight: 1,
            }}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  const dayDetailEvents = selectedDay ? eventsForDay(selectedDay) : [];

  const defaultBookingBiz = useMemo((): "appliance" | "dental" => {
    if (bizFilter === "dental") return "dental";
    if (bizFilter === "appliance") return "appliance";
    return "appliance";
  }, [bizFilter]);

  const showBizPicker = mode === "employee" || bizFilter === "all";

  const toolbarStickyTop = mode === "employee" ? undefined : 56;
  const toolbarClassName =
    mode === "employee"
      ? "relative z-0 bg-white border-b border-stone-200 px-2 md:px-3 py-2 flex flex-col gap-2 shadow-sm"
      : "sticky z-10 bg-white border-b border-stone-200 px-2 md:px-3 py-2 flex flex-col gap-2 shadow-sm";

  return (
    <div
      className={mode === "employee" ? "flex flex-col bg-stone-50" : "flex flex-col h-full min-h-[calc(100dvh-56px)] md:min-h-[calc(100vh-120px)] bg-stone-50"}
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      {/* Toolbar */}
      <div
        className={toolbarClassName}
        style={toolbarStickyTop != null ? { top: toolbarStickyTop } : undefined}
      >
        <div className="flex flex-wrap items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600 shrink-0 hidden sm:block" />
          <span className="font-bold text-stone-700 text-sm">{labels.title}</span>

          <div className="flex rounded-lg border border-stone-200 overflow-hidden text-xs font-semibold shrink-0">
            {(["month", "year"] as CalendarView[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => { setView(v); setSelectedDay(null); }}
                className={`min-h-[44px] md:min-h-0 px-3 py-2 md:py-1.5 transition touch-manipulation ${view === v ? "bg-blue-600 text-white" : "bg-white text-stone-500"}`}
              >
                {v === "month" ? labels.month : labels.year}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 ml-auto">
            <button type="button" onClick={() => navigate(-1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-stone-100 touch-manipulation">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" onClick={goToday} className="min-h-[44px] px-2 text-xs font-semibold rounded border border-stone-200 touch-manipulation">
              {labels.today}
            </button>
            <button type="button" onClick={() => navigate(1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-stone-100 touch-manipulation">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => void loadEvents()} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-stone-100 touch-manipulation" title={labels.refresh}>
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="text-xs font-semibold text-stone-600">{headerTitle}</div>

        {mode === "admin" && (
          <div className="flex flex-wrap gap-2">
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
            <select
              value={bizFilter}
              onChange={(e) => setBizFilter(e.target.value as typeof bizFilter)}
              className="flex-1 min-w-[120px] text-xs border border-stone-200 rounded-lg px-2 py-2.5 bg-white min-h-[44px]"
            >
              <option value="all">{labels.bizAll}</option>
              <option value="appliance">{labels.bizAppliance}</option>
              <option value="dental">{labels.bizDental}</option>
            </select>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 px-3 py-1.5 text-[9px] text-stone-500">
        <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: eventColor("approved", false) }} /> {labels.statusApproved}</span>
        <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: eventColor("pending", false) }} /> {labels.statusPending}</span>
        <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: eventColor("completed", false) }} /> {labels.statusCompleted}</span>
        <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: eventColor("pending", true) }} /> {labels.overdue}</span>
      </div>

      <p className="text-[10px] text-stone-400 px-3 pb-1">
        {dragId || touchDragId ? labels.dragHint : labels.tapHint}
      </p>

      {loading && (
        <div className="py-2 text-center text-stone-400 text-sm">{labels.loading}</div>
      )}

      {/* MONTH — compact numbered cells (inline grid — no grid-cols-7 in prod CSS) */}
      {view === "month" && (
        <div className="px-2 pb-2">
          <div className="bg-white border border-stone-200 rounded-lg py-2 px-1">
            <div style={{ ...calGridStyle, marginBottom: CAL_GAP }}>
              {WEEKDAYS_SHORT.map((wd) => (
                <div
                  key={wd}
                  style={{
                    width: CAL_CELL,
                    textAlign: "center",
                    fontSize: 9,
                    fontWeight: 600,
                    color: "#a8a29e",
                    lineHeight: `${CAL_CELL}px`,
                  }}
                >
                  {wd.charAt(0)}
                </div>
              ))}
            </div>
            <div style={calGridStyle}>
              {getMonthGrid(anchor.getFullYear(), anchor.getMonth()).map((day) => (
                <CompactDayCell key={day.toISOString()} day={day} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* YEAR — 12 mini month grids */}
      {view === "year" && (
        <div className="flex-1 overflow-auto px-2 pb-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {MONTHS_LONG.map((name, mi) => {
            const monthDate = new Date(anchor.getFullYear(), mi, 1);
            return (
              <button
                key={name}
                type="button"
                onClick={() => { setAnchor(monthDate); setView("month"); setSelectedDay(null); }}
                className="bg-white border border-stone-200 rounded-lg p-1.5 text-left hover:border-blue-300 active:bg-stone-50 touch-manipulation"
              >
                <div className="text-[10px] font-bold text-stone-700 mb-1">{name.slice(0, 3)}</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(7, 8px)`,
                    gap: 1,
                    width: 7 * 8 + 6,
                  }}
                >
                  {getMonthGrid(anchor.getFullYear(), mi).map((day) => {
                    const inMonth = day.getMonth() === mi;
                    const evs = inMonth ? eventsForDay(day) : [];
                    const bg = inMonth ? dayCellColor(evs) : "transparent";
                    return (
                      <div
                        key={day.toISOString()}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 1,
                          background: inMonth && evs.length > 0 ? bg : inMonth ? EMPTY_DAY_BG : "transparent",
                          opacity: inMonth ? 1 : 0.15,
                        }}
                      />
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Day detail — opens when a day is tapped */}
      {selectedDay && view === "month" && (
        <div className={`overflow-y-auto px-2 pb-4 border-t border-stone-200 bg-white mx-2 rounded-t-xl shadow-[0_-4px_12px_rgba(0,0,0,0.06)] ${mode === "employee" ? "" : "flex-1"}`}>
          <div className="sticky top-0 bg-white pt-3 pb-2 flex items-center justify-between border-b border-stone-100 mb-2 gap-2">
            <div className="min-w-0">
              <div className="text-sm font-bold text-stone-800">{formatDayHeader(selectedDay, locale)}</div>
              <div className="text-[10px] text-stone-400">
                {dayDetailEvents.length === 0 ? labels.noEvents : `${dayDetailEvents.length} job(s)`}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => openBookingForm("create", selectedDay)}
                className="min-h-[44px] px-3 rounded-lg text-white text-xs font-semibold touch-manipulation"
                style={{ background: ACCENT }}
              >
                {labels.newBooking}
              </button>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-stone-100"
              >
                <ChevronDown className="w-5 h-5 text-stone-400" />
              </button>
            </div>
          </div>

          {dayDetailEvents.length === 0 && !loading && (
            <p className="text-center text-stone-400 text-sm py-6">{labels.noEvents}</p>
          )}

          <div className="space-y-2">
            {dayDetailEvents.map((ev) => {
              const dragging = dragId === ev.id || touchDragId === ev.id;
              const draggable = canReschedule(ev);
              return (
              <div
                key={ev.id}
                draggable={draggable}
                onDragStart={(e) => startJobDrag(ev, e)}
                onDragEnd={() => { setDragId(null); setDropHoverKey(null); }}
                onTouchStart={startJobTouchDrag(ev)}
                onTouchEnd={() => clearLongPress()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" || touchDragId) return;
                  if (onOpenBooking) openFullBooking(ev.id);
                  else { setSelected(ev); setMoveOpen(false); setMoveTargetDay(selectedDay!); }
                }}
                onClick={() => {
                  if (touchDragId) return;
                  if (onOpenBooking) { openFullBooking(ev.id); return; }
                  setSelected(ev);
                  setMoveOpen(false);
                  setMoveTargetDay(selectedDay!);
                }}
                className={`w-full text-left rounded-xl border border-stone-200 bg-stone-50 p-3 touch-manipulation active:bg-stone-100 transition ${draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"} ${dragging ? "opacity-50 ring-2 ring-blue-400" : ""}`}
                style={{ borderLeftWidth: 4, borderLeftColor: eventColor(ev.status, !!ev.is_overdue) }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 flex items-start gap-1.5">
                    {draggable && <GripVertical className="w-4 h-4 shrink-0 text-stone-400 mt-0.5" />}
                    <div className="min-w-0">
                    <div className="font-semibold text-stone-800 text-sm truncate">{ev.client_name}</div>
                    <div className="text-xs text-stone-500 truncate mt-0.5">{ev.appliance}</div>
                    {ev.address && (
                      <div className="text-[10px] text-stone-400 truncate mt-0.5">{ev.address}</div>
                    )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-stone-700">{formatTime(ev.start_at, locale)}</div>
                    <span
                      className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold text-white"
                      style={{ background: eventColor(ev.status, !!ev.is_overdue) }}
                    >
                      {ev.is_overdue ? labels.overdue : statusLabel(ev.status)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                  {bizBadge(ev)}
                  {canReschedule(ev) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openBookingForm("edit", selectedDay!, ev);
                      }}
                      className="text-[10px] px-2 py-1 rounded border border-violet-200 text-violet-700 font-semibold touch-manipulation min-h-[32px]"
                    >
                      {labels.editBooking}
                    </button>
                  )}
                </div>
              </div>
            );})}
          </div>
        </div>
      )}

      {/* Job detail drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end bg-black/40"
          onClick={() => { setSelected(null); setMoveOpen(false); }}
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
              {selected.brand_model && <p className="text-xs text-stone-500">{selected.brand_model}</p>}
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
              <button
                type="button"
                onClick={() => openBookingForm("edit", selectedDay ?? anchor, selected)}
                className="mt-3 w-full min-h-[44px] py-2 rounded-lg border-2 border-violet-600 text-violet-700 text-sm font-semibold touch-manipulation"
              >
                {labels.editBooking}
              </button>
            )}

            {canReschedule(selected) && (
              <div className="mt-4">
                {!moveOpen ? (
                  <button
                    type="button"
                    onClick={() => { setMoveOpen(true); setMoveTargetDay(selectedDay ?? anchor); }}
                    className="w-full min-h-[44px] py-2 rounded-lg border-2 border-blue-600 text-blue-600 text-sm font-semibold touch-manipulation flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" /> {labels.moveJob}
                  </button>
                ) : (
                  <div className="border border-stone-200 rounded-lg p-3 bg-stone-50">
                    <p className="text-xs font-semibold text-stone-600 mb-2">{labels.pickTime}</p>
                    <div style={{ ...calGridStyle, marginBottom: 8 }}>
                      {weekDays.map((d) => {
                        const bg = dayCellColor(eventsForDay(d));
                        const evs = eventsForDay(d);
                        return (
                          <button
                            key={d.toISOString()}
                            type="button"
                            onClick={() => setMoveTargetDay(d)}
                            style={{
                              width: CAL_CELL,
                              height: CAL_CELL,
                              borderRadius: 4,
                              border: isSameDay(d, moveTargetDay) ? "2px solid #2563eb" : "1px solid #e7e5e4",
                              background: evs.length ? bg : EMPTY_DAY_BG,
                              color: textOnBg(evs.length ? bg : EMPTY_DAY_BG),
                              fontSize: 10,
                              fontWeight: 700,
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            {d.getDate()}
                          </button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 max-h-[180px] overflow-y-auto">
                      {TIME_SLOTS.map((slot, slotIdx) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => { void reschedule(selected.id, isoFromDaySlot(moveTargetDay, slotIdx)); }}
                          className="min-h-[40px] text-[10px] font-semibold rounded bg-white border border-stone-200 active:bg-blue-50 touch-manipulation"
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

      <CalendarBookingFormModal
        open={bookingFormOpen}
        mode={bookingFormMode}
        day={bookingFormDay}
        event={bookingFormEvent}
        defaultBiz={defaultBookingBiz}
        showBizPicker={showBizPicker}
        apiBase={apiBase}
        authHeaders={authHeaders}
        actorMode={mode}
        timeSlots={TIME_SLOTS}
        labels={labels.bookingForm}
        onClose={() => setBookingFormOpen(false)}
        onSaved={() => {
          showToast(labels.bookingForm.savedOk);
          void loadEvents();
        }}
      />

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
