import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  BarChart3, DollarSign, Users, RefreshCw, Download,
  Calculator, CheckCircle2, ChevronDown, ChevronUp, Clock, FileText,
  Phone, X, MessageSquare, PhoneOutgoing, Trash2, RotateCcw,
} from "lucide-react";
import { useAdminLang } from "../../context/AdminLangContext";

const ACCENT = "#1B6FE8";

interface Props {
  apiBase: string;
  adminAuthH: () => Record<string, string>;
  onOpenBooking?: (bookingId: string) => void;
}

// ─── Payroll Report types ─────────────────────────────────────────────────────
interface PaymentRow {
  id:            string;
  employee_id:   string;
  name:          string;
  jobs_count:    number;
  revenue:       number;
  amount:        number;
  company_share: number;
  paid_at:       string | null;
  bank_name?:    string;
  bank_account?: string;
  bank_routing?: string;
}
interface ReportSummary {
  id:               string;
  period_start:     string;
  period_end:       string;
  generated_at:     string;
  auto_mode:        boolean;
  total_employees:  number;
  total_payout:     number;
  paid_count:       number;
}
interface ReportDetail extends ReportSummary {
  label:    string;
  payments: PaymentRow[];
}

// ─── Finance Report types ─────────────────────────────────────────────────────
interface FinanceSummary {
  gross_revenue:   number;
  total_expenses:  number;
  net_income:      number;
  employee_payout: number;
  company_share:   number;
  jobs_completed:  number;
  cash:            number;
  card_online:     number;
  split_employee:  number;
  split_company:   number;
}
interface PeriodRow {
  period:   string;
  revenue:  number;
  expenses: number;
  net:      number;
  jobs:     number;
}
interface EmpRow {
  id:            string;
  name:          string;
  jobs_count:    number;
  revenue:       number;
  payout:        number;
  company_share: number;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
}
interface FinanceReport {
  summary:   FinanceSummary;
  by_period: PeriodRow[];
  employees: EmpRow[];
}

// ─── Quarter helpers ──────────────────────────────────────────────────────────
const QUARTERS = [
  { label: "Q1 (Jan–Mar)", months: [1, 3] },
  { label: "Q2 (Apr–Jun)", months: [4, 6] },
  { label: "Q3 (Jul–Sep)", months: [7, 9] },
  { label: "Q4 (Oct–Dec)", months: [10, 12] },
];

function quarterDates(q: number, year: number): { from: string; to: string } {
  const months = QUARTERS[q - 1]!.months;
  const from = `${year}-${String(months[0]).padStart(2, "0")}-01`;
  const lastDay = new Date(year, months[1]!, 0).getDate();
  const to = `${year}-${String(months[1]).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

const fmt$ = (n: number | undefined) => `$${(n ?? 0).toFixed(2)}`;
const years = () => { const c = new Date().getFullYear(); return [c, c - 1, c - 2]; };

interface ReceiptDownloadRow {
  id: number | string;
  booking_id: string;
  client_name: string | null;
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

interface CallLogRow {
  id: number | string;
  created_at: string;
  caller_phone: string | null;
  status: "completed" | "no_booking" | "error";
  duration_sec: number | null;
  booking_id: string | null;
  client_name: string | null;
  deleted_at: string | null;
}

interface CallToast {
  phone: string;
  status: "completed" | "no_booking" | "error";
}

export default function ReportsTab({ apiBase, adminAuthH, onOpenBooking }: Props) {
  const { t } = useAdminLang();
  const [section, setSection] = useState<"payroll" | "finance" | "downloads" | "calls" | "weekly">("payroll");

  // ─── Real-time call notifications (SSE) ──────────────────────────────────────
  const [newCallBadge, setNewCallBadge] = useState(0);
  const [callToast, setCallToast]       = useState<CallToast | null>(null);
  const sectionRef    = useRef(section);
  const adminAuthHRef = useRef(adminAuthH);
  const loadCallLogsRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => { sectionRef.current = section; }, [section]);
  useEffect(() => { adminAuthHRef.current = adminAuthH; }, [adminAuthH]);

  // ═══════════════ PAYROLL SECTION ═════════════════════════════════════════════
  const [pFrom, setPFrom]             = useState("");
  const [pTo, setPTo]                 = useState("");
  const [pLabel, setPLabel]           = useState("");
  const [reports, setReports]         = useState<ReportSummary[]>([]);
  const [currentReport, setCurrentReport] = useState<ReportDetail | null>(null);
  const [expandedRpt, setExpandedRpt] = useState<string | null>(null);
  const [generating, setGenerating]   = useState(false);
  const [rptLoading, setRptLoading]   = useState(false);
  const [payingAll, setPayingAll]     = useState(false);
  const [payingId, setPayingId]       = useState<string | null>(null);
  const [pError, setPError]           = useState("");

  const loadReportsList = useCallback(async () => {
    setRptLoading(true);
    try {
      const r = await fetch(`${apiBase}/api/admin/payroll-reports`, { headers: adminAuthH() });
      const d = await r.json() as { ok?: boolean; reports?: ReportSummary[] };
      setReports(d.reports ?? []);
    } catch { /* silent */ }
    finally { setRptLoading(false); }
  }, [apiBase, adminAuthH]);

  const loadReportDetail = useCallback(async (id: string) => {
    const r = await fetch(`${apiBase}/api/admin/payroll-reports/${id}`, { headers: adminAuthH() });
    const d = await r.json() as { ok?: boolean; report?: ReportDetail };
    return d.report ?? null;
  }, [apiBase, adminAuthH]);

  useEffect(() => {
    if (section === "payroll") loadReportsList();
  }, [section, loadReportsList]);

  // ═══════════════ WEEKLY SUMMARY SECTION ══════════════════════════════════════
  interface WeeklyEmpRow {
    id: string; name: string; job_count: number;
    labor: number; parts: number; tax: number; employee_net: number;
  }
  interface WeeklySummaryData {
    week_start: string; week_end: string;
    employees: WeeklyEmpRow[];
    totals: { job_count: number; labor: number; parts: number; tax: number; employee_net: number };
    emp_pct: number;
  }
  const [weeklyData, setWeeklyData]     = useState<WeeklySummaryData | null>(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  const loadWeeklySummary = useCallback(async () => {
    setWeeklyLoading(true);
    try {
      const r = await fetch(`${apiBase}/api/admin/weekly-summary`, { headers: adminAuthH() });
      const d = await r.json() as WeeklySummaryData & { ok?: boolean };
      if (d.ok !== false) setWeeklyData(d);
    } catch { /* silent */ }
    finally { setWeeklyLoading(false); }
  }, [apiBase, adminAuthH]);

  useEffect(() => {
    if (section === "weekly") void loadWeeklySummary();
  }, [section, loadWeeklySummary]);

  const handleGenerate = async () => {
    if (!pFrom || !pTo) { setPError("Select start and end dates"); return; }
    setGenerating(true);
    setPError("");
    setCurrentReport(null);
    try {
      const r = await fetch(`${apiBase}/api/admin/payroll-reports`, {
        method:  "POST",
        headers: { ...adminAuthH(), "Content-Type": "application/json" },
        body:    JSON.stringify({ period_start: pFrom, period_end: pTo, period_label: pLabel || undefined }),
      });
      const d = await r.json() as { ok?: boolean; report?: ReportDetail; error?: string };
      if (!r.ok || !d.ok) { setPError(d.error ?? "Error generating"); return; }
      setCurrentReport(d.report!);
      await loadReportsList();
    } catch {
      setPError("Connection error");
    } finally {
      setGenerating(false);
    }
  };

  const openReport = async (id: string) => {
    const detail = await loadReportDetail(id);
    if (detail) setCurrentReport(detail);
  };

  const payEmployee = async (reportId: string, employeeId: string) => {
    setPayingId(employeeId);
    await fetch(`${apiBase}/api/admin/payroll-reports/${reportId}/pay/${employeeId}`, {
      method:  "POST",
      headers: adminAuthH(),
    });
    const detail = await loadReportDetail(reportId);
    if (detail) setCurrentReport(detail);
    await loadReportsList();
    setPayingId(null);
  };

  const payAll = async (reportId: string) => {
    if (!confirm("Mark ALL employees in this report as paid?")) return;
    setPayingAll(true);
    await fetch(`${apiBase}/api/admin/payroll-reports/${reportId}/pay-all`, {
      method:  "POST",
      headers: adminAuthH(),
    });
    const detail = await loadReportDetail(reportId);
    if (detail) setCurrentReport(detail);
    await loadReportsList();
    setPayingAll(false);
  };

  const pendingInCurrent = currentReport?.payments.filter(p => !p.paid_at).length ?? 0;
  const allPaidInCurrent = currentReport && pendingInCurrent === 0 && (currentReport.payments.length > 0);

  // ═══════════════ FINANCE SECTION ═════════════════════════════════════════════
  const [fYear, setFYear]       = useState(new Date().getFullYear());
  const [fFrom, setFFrom]       = useState("");
  const [fTo, setFTo]           = useState("");
  const [fGroupBy, setFGroupBy] = useState<"month" | "quarter">("month");
  const [fReport, setFReport]   = useState<FinanceReport | null>(null);
  const [fLoading, setFLoading] = useState(false);
  const [fError, setFError]     = useState("");

  const loadFinance = useCallback(async (from: string, to: string, groupBy: "month" | "quarter" = "month") => {
    if (!from || !to) return;
    setFLoading(true);
    setFError("");
    setFReport(null);
    setFGroupBy(groupBy);
    try {
      const url = `${apiBase}/api/admin/finance?from=${from}&to=${to}&groupBy=${groupBy}`;
      const r = await fetch(url, { headers: adminAuthH() });
      const d = await r.json() as { ok?: boolean } & Partial<FinanceReport> & { error?: string };
      if (!r.ok || !d.ok) { setFError(d.error ?? "Error loading"); return; }
      setFReport({ summary: d.summary!, by_period: d.by_period ?? [], employees: d.employees ?? [] });
    } catch {
      setFError("Connection error");
    } finally {
      setFLoading(false);
    }
  }, [apiBase, adminAuthH]);

  const selectQuarter = (q: number) => {
    const { from, to } = quarterDates(q, fYear);
    setFFrom(from); setFTo(to);
    loadFinance(from, to, "month");
  };

  const selectAnnual = () => {
    const from = `${fYear}-01-01`;
    const to   = `${fYear}-12-31`;
    setFFrom(from); setFTo(to);
    loadFinance(from, to, "quarter");
  };

  const downloadCSV = () => {
    if (!fFrom || !fTo) return;
    const url = `${apiBase}/api/admin/finance/csv?from=${fFrom}&to=${fTo}&groupBy=${fGroupBy}`;
    fetch(url, { headers: adminAuthH() })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `finance_${fFrom}_${fTo}.csv`;
        a.click();
      })
      .catch(() => window.open(url));
  };

  const isAnnual = fGroupBy === "quarter";

  // ═══════════════ DOWNLOADS SECTION ═══════════════════════════════════════════
  const [dFrom, setDFrom]             = useState("");
  const [dTo, setDTo]                 = useState("");
  const [dActor, setDActor]           = useState("");
  const [dBooking, setDBooking]       = useState("");
  const [dQuery, setDQuery]           = useState("");
  const [dRows, setDRows]             = useState<ReceiptDownloadRow[]>([]);
  const [dLoading, setDLoading]       = useState(false);
  const [dError, setDError]           = useState("");
  const [dExporting, setDExporting]   = useState(false);
  const [dSuspiciousOnly, setDSuspiciousOnly] = useState(false);

  const buildDownloadsQuery = useCallback((forCsv: boolean): string => {
    const params = new URLSearchParams();
    if (dFrom)    params.set("from", new Date(`${dFrom}T00:00:00`).toISOString());
    if (dTo)      params.set("to",   new Date(`${dTo}T23:59:59`).toISOString());
    if (dActor)   params.set("actor", dActor);
    if (dBooking.trim()) params.set("booking", dBooking.trim());
    if (dQuery.trim())   params.set("q", dQuery.trim());
    if (forCsv)   params.set("format", "csv");
    const s = params.toString();
    return s ? `?${s}` : "";
  }, [dFrom, dTo, dActor, dBooking, dQuery]);

  const loadDownloads = useCallback(async () => {
    setDLoading(true);
    setDError("");
    try {
      const r = await fetch(`${apiBase}/api/admin/receipt-downloads${buildDownloadsQuery(false)}`, {
        headers: adminAuthH(),
      });
      const d = await r.json() as { ok?: boolean; downloads?: ReceiptDownloadRow[]; error?: string };
      if (!r.ok || !d.ok) { setDError(d.error ?? t.downloadsErrorLoad); setDRows([]); return; }
      setDRows(d.downloads ?? []);
    } catch {
      setDError(t.downloadsErrorConnection);
      setDRows([]);
    } finally {
      setDLoading(false);
    }
  }, [apiBase, adminAuthH, buildDownloadsQuery, t.downloadsErrorLoad, t.downloadsErrorConnection]);

  const exportDownloadsCsv = useCallback(async () => {
    setDExporting(true);
    try {
      const r = await fetch(`${apiBase}/api/admin/receipt-downloads${buildDownloadsQuery(true)}`, {
        headers: adminAuthH(),
      });
      if (!r.ok) { setDError(t.downloadsErrorExport); return; }
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `receipt-downloads.csv`;
      a.click();
    } catch {
      setDError(t.downloadsErrorExport);
    } finally {
      setDExporting(false);
    }
  }, [apiBase, adminAuthH, buildDownloadsQuery, t.downloadsErrorExport]);

  useEffect(() => {
    if (section === "downloads" && dRows.length === 0 && !dLoading && !dError) {
      loadDownloads();
    }
    // Only auto-load once on first switch — explicit refresh button after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // ═══════════════ CALL LOGS SECTION ═══════════════════════════════════════════
  const [clFrom, setClFrom]           = useState("");
  const [clTo, setClTo]               = useState("");
  const [clStatus, setClStatus]       = useState("");
  const [clRows, setClRows]           = useState<CallLogRow[]>([]);
  const [clLoading, setClLoading]     = useState(false);
  const [clError, setClError]         = useState("");
  const [clExporting, setClExporting] = useState(false);
  const [clPage, setClPage]           = useState(1);
  const [clTotal, setClTotal]         = useState(0);
  const CL_LIMIT = 50;
  const [clTranscript, setClTranscript] = useState<{
    id: string | number; phone: string | null;
    client_name: string | null; transcript: string;
    recording_url?: string | null;
  } | null>(null);
  const [clTranscriptLoading, setClTranscriptLoading] = useState(false);
  const [clCallingBack, setClCallingBack]   = useState<string | null>(null); // phone being called back
  const [clCallBackMsg, setClCallBackMsg]   = useState<{ phone: string; ok: boolean; text: string } | null>(null);
  const [clShowDeleted, setClShowDeleted]   = useState(false);
  const [clDeleteMsg, setClDeleteMsg]       = useState<{ ok: boolean; text: string } | null>(null);
  const [clActionLoading, setClActionLoading] = useState<string | number | null>(null);

  const initiateCallBack = useCallback(async (phone: string) => {
    setClCallingBack(phone);
    setClCallBackMsg(null);
    try {
      const r = await fetch(`${apiBase}/api/admin/call-back`, {
        method: "POST",
        headers: { ...adminAuthH(), "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (r.ok && d.ok) {
        setClCallBackMsg({ phone, ok: true,  text: t.callLogsCallBackOk });
      } else {
        setClCallBackMsg({ phone, ok: false, text: d.error ?? t.callLogsCallBackErr });
      }
    } catch {
      setClCallBackMsg({ phone, ok: false, text: t.callLogsCallBackErr });
    } finally {
      setClCallingBack(null);
      setTimeout(() => setClCallBackMsg(null), 5000);
    }
  }, [apiBase, adminAuthH, t.callLogsCallBackOk, t.callLogsCallBackErr]);

  const buildCallLogsQuery = useCallback((forCsv: boolean, page = 1, showDeleted = false): string => {
    const params = new URLSearchParams();
    if (clFrom)       params.set("from", clFrom);
    if (clTo)         params.set("to",   clTo);
    if (clStatus)     params.set("status", clStatus);
    if (showDeleted)  params.set("show_deleted", "true");
    if (forCsv) {
      params.set("format", "csv");
    } else {
      params.set("page",  String(page));
      params.set("limit", String(CL_LIMIT));
    }
    const s = params.toString();
    return s ? `?${s}` : "";
  }, [clFrom, clTo, clStatus]);

  const loadCallLogs = useCallback(async (page = 1, showDeleted?: boolean) => {
    const isDeleted = showDeleted ?? clShowDeleted;
    setClLoading(true);
    setClError("");
    try {
      const r = await fetch(`${apiBase}/api/admin/call-logs${buildCallLogsQuery(false, page, isDeleted)}`, {
        headers: adminAuthH(),
      });
      const d = await r.json() as { ok?: boolean; logs?: CallLogRow[]; total?: number; page?: number; error?: string };
      if (!r.ok || !d.ok) { setClError(d.error ?? t.callLogsError); setClRows([]); setClTotal(0); setClPage(1); return; }
      setClRows(d.logs ?? []);
      setClTotal(d.total ?? 0);
      setClPage(page);
    } catch {
      setClError(t.callLogsError);
      setClRows([]);
      setClTotal(0);
      setClPage(1);
    } finally {
      setClLoading(false);
    }
  }, [apiBase, adminAuthH, buildCallLogsQuery, clShowDeleted, t.callLogsError]);

  const deleteCallLog = useCallback(async (id: number | string) => {
    if (!window.confirm(t.callLogsDeleteConfirm)) return;
    setClActionLoading(id);
    setClDeleteMsg(null);
    try {
      const r = await fetch(`${apiBase}/api/admin/call-logs/${id}`, {
        method: "DELETE",
        headers: adminAuthH(),
      });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (r.ok && d.ok) {
        setClDeleteMsg({ ok: true, text: t.callLogsDeleteOk });
        setClRows(prev => prev.filter(row => row.id !== id));
        setClTotal(prev => prev - 1);
      } else {
        setClDeleteMsg({ ok: false, text: d.error ?? t.callLogsDeleteErr });
      }
    } catch {
      setClDeleteMsg({ ok: false, text: t.callLogsDeleteErr });
    } finally {
      setClActionLoading(null);
      setTimeout(() => setClDeleteMsg(null), 4000);
    }
  }, [apiBase, adminAuthH, t.callLogsDeleteConfirm, t.callLogsDeleteOk, t.callLogsDeleteErr]);

  const restoreCallLog = useCallback(async (id: number | string) => {
    setClActionLoading(id);
    setClDeleteMsg(null);
    try {
      const r = await fetch(`${apiBase}/api/admin/call-logs/${id}/restore`, {
        method: "POST",
        headers: adminAuthH(),
      });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (r.ok && d.ok) {
        setClDeleteMsg({ ok: true, text: t.callLogsRestoreOk });
        setClRows(prev => prev.filter(row => row.id !== id));
        setClTotal(prev => prev - 1);
      } else {
        setClDeleteMsg({ ok: false, text: d.error ?? t.callLogsRestoreErr });
      }
    } catch {
      setClDeleteMsg({ ok: false, text: t.callLogsRestoreErr });
    } finally {
      setClActionLoading(null);
      setTimeout(() => setClDeleteMsg(null), 4000);
    }
  }, [apiBase, adminAuthH, t.callLogsRestoreOk, t.callLogsRestoreErr]);

  const exportCallLogsCsv = useCallback(async () => {
    setClExporting(true);
    try {
      const r = await fetch(`${apiBase}/api/admin/call-logs${buildCallLogsQuery(true)}`, {
        headers: adminAuthH(),
      });
      if (!r.ok) { setClError(t.callLogsError); return; }
      const blob = await r.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = "call-logs.csv";
      a.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
    } catch {
      setClError(t.callLogsError);
    } finally {
      setClExporting(false);
    }
  }, [apiBase, adminAuthH, buildCallLogsQuery, t.callLogsError]);

  const openTranscript = useCallback(async (row: CallLogRow) => {
    setClTranscriptLoading(true);
    setClTranscript(null);
    try {
      const r = await fetch(`${apiBase}/api/admin/call-logs/${row.id}`, { headers: adminAuthH() });
      const d = await r.json() as { ok?: boolean; log?: { transcript: string; recording_url?: string | null } };
      setClTranscript({
        id: row.id,
        phone: row.caller_phone,
        client_name: row.client_name,
        transcript: (r.ok && d.ok && d.log?.transcript) ? d.log.transcript : "",
        recording_url: (r.ok && d.ok) ? (d.log?.recording_url ?? null) : null,
      });
    } catch {
      setClTranscript({ id: row.id, phone: row.caller_phone, client_name: row.client_name, transcript: "", recording_url: null });
    } finally {
      setClTranscriptLoading(false);
    }
  }, [apiBase, adminAuthH]);

  useEffect(() => {
    if (section === "calls" && clRows.length === 0 && !clLoading && !clError) {
      loadCallLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // Keep loadCallLogsRef in sync so the SSE handler can call the latest version
  useEffect(() => { loadCallLogsRef.current = loadCallLogs; }, [loadCallLogs]);

  // Reset badge and force-refresh list when user switches to "calls" section
  // Use a ref to read newCallBadge without adding it to the dep array
  const newCallBadgeRef = useRef(newCallBadge);
  useEffect(() => { newCallBadgeRef.current = newCallBadge; }, [newCallBadge]);

  useEffect(() => {
    if (section === "calls") {
      if (newCallBadgeRef.current > 0) {
        void loadCallLogsRef.current?.();
      }
      setNewCallBadge(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // ── SSE subscription (fetch-based so custom auth headers work) ───────────────
  useEffect(() => {
    let active = true;
    let abortCtrl: AbortController | null = null;

    const connect = async () => {
      if (!active) return;
      abortCtrl = new AbortController();
      try {
        const headers = adminAuthHRef.current();
        const res = await fetch(`${apiBase}/api/admin/call-logs/events`, {
          headers,
          signal: abortCtrl.signal,
        });
        if (!res.ok || !res.body) {
          if (active) setTimeout(connect, 5000);
          return;
        }
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer    = "";
        while (active) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";
          for (const chunk of chunks) {
            const dataLine = chunk.split("\n").find(l => l.startsWith("data:"));
            if (!dataLine) continue;
            try {
              const event = JSON.parse(dataLine.slice(5).trim()) as {
                type: string;
                caller_phone?: string;
                status?: "completed" | "no_booking" | "error";
              };
              if (event.type === "new_call") {
                if (sectionRef.current !== "calls") {
                  setNewCallBadge(n => n + 1);
                } else {
                  void loadCallLogsRef.current?.();
                }
                setCallToast({ phone: event.caller_phone ?? "Unknown", status: event.status ?? "no_booking" });
                setTimeout(() => setCallToast(null), 6000);
              }
            } catch { /* ignore parse errors */ }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
      if (active) setTimeout(connect, 4000);
    };

    void connect();
    return () => {
      active = false;
      abortCtrl?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {/* Toast notification for new calls */}
      {callToast && (
        <div
          className="fixed top-4 right-4 z-50 flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl border border-blue-200 bg-white max-w-xs"
          style={{ animation: "fadeInDown 0.3s ease" }}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
            style={{ background: callToast.status === "completed" ? "#16a34a" : callToast.status === "error" ? "#dc2626" : ACCENT }}>
            📞
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-stone-800">
              {callToast.status === "completed" ? "✅ Новая заявка со звонка" : callToast.status === "error" ? "⚠️ Ошибка звонка" : "📞 Новый звонок"}
            </p>
            <p className="text-[11px] text-stone-500 truncate">{callToast.phone}</p>
          </div>
          <button onClick={() => setCallToast(null)} className="text-stone-400 hover:text-stone-600 flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <style>{`@keyframes fadeInDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Section toggle — horizontally scrollable on mobile */}
      <div className="flex rounded-xl border border-stone-200 bg-stone-100 p-0.5 gap-0.5 overflow-x-auto">
        {(["calls", "weekly", "payroll", "finance", "downloads"] as const).map(s => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`flex-shrink-0 px-2.5 py-2 rounded-[10px] text-[11px] font-bold transition flex items-center justify-center gap-1 whitespace-nowrap
              ${section === s ? "bg-white text-stone-800 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
          >
            {s === "weekly"    ? <Users className="w-3.5 h-3.5 flex-shrink-0" />
            : s === "payroll"  ? <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
            : s === "finance"  ? <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
            : s === "calls"    ? (
              <span className="relative inline-flex items-center flex-shrink-0">
                <Phone className="w-3.5 h-3.5" />
                {newCallBadge > 0 && (
                  <span className="absolute -top-2 -right-2.5 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 leading-none">
                    {newCallBadge > 9 ? "9+" : newCallBadge}
                  </span>
                )}
              </span>
            )
            : <FileText className="w-3.5 h-3.5 flex-shrink-0" />}
            {s === "weekly" ? t.weeklyTabLabel : s === "payroll" ? "Payroll" : s === "finance" ? "Finance" : s === "calls" ? t.callLogsTitle : t.downloadsTabLabel}
          </button>
        ))}
      </div>

      {/* ══════════════ PAYROLL SECTION ══════════════════════════════════════════ */}
      {section === "payroll" && (
        <div className="space-y-4">
          {/* Generate form */}
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 space-y-3">
            <h3 className="font-semibold text-stone-700 flex items-center gap-2 text-sm">
              <Calculator className="w-4 h-4" style={{ color: ACCENT }} />
              Generate Payroll Report (All Employees)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Period Start *</label>
                <input type="date" value={pFrom} onChange={e => setPFrom(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Period End *</label>
                <input type="date" value={pTo} onChange={e => setPTo(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Label (optional)</label>
                <input type="text" value={pLabel} onChange={e => setPLabel(e.target.value)} placeholder="e.g. April 2026"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>
            {pError && <p className="text-xs text-red-500">{pError}</p>}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 transition"
              style={{ background: ACCENT }}
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              {generating ? "Generating..." : "Generate Report"}
            </button>
          </div>

          {/* Current / latest report table */}
          {currentReport && (
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-semibold text-stone-700 text-sm">{currentReport.label}</span>
                  <span className="ml-2 text-xs text-stone-400">{currentReport.period_start} – {currentReport.period_end}</span>
                </div>
                {pendingInCurrent > 0 && (
                  <button
                    onClick={() => payAll(currentReport.id)}
                    disabled={payingAll}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-bold disabled:opacity-50"
                    style={{ background: "#16a34a" }}
                  >
                    {payingAll ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Pay All ({pendingInCurrent})
                  </button>
                )}
                {allPaidInCurrent && (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">All Paid</span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500">
                      <th className="text-left px-3 py-2 font-semibold">Employee</th>
                      <th className="text-right px-3 py-2 font-semibold">Jobs</th>
                      <th className="text-right px-3 py-2 font-semibold">Revenue</th>
                      <th className="text-right px-3 py-2 font-semibold">Payout</th>
                      <th className="text-right px-3 py-2 font-semibold">Co. Share</th>
                      <th className="text-right px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReport.payments.map((p, i) => (
                      <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                        <td className="px-3 py-2.5 font-semibold text-stone-700">{p.name}</td>
                        <td className="px-3 py-2.5 text-right text-stone-600">{p.jobs_count ?? 0}</td>
                        <td className="px-3 py-2.5 text-right text-stone-600">{fmt$(p.revenue)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-blue-600">{fmt$(p.amount)}</td>
                        <td className="px-3 py-2.5 text-right text-stone-500">{fmt$(p.company_share)}</td>
                        <td className="px-3 py-2.5 text-right">
                          {p.paid_at
                            ? <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid</span>
                            : <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          {!p.paid_at && (
                            <button
                              onClick={() => payEmployee(currentReport.id, p.employee_id)}
                              disabled={payingId === p.employee_id}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-white text-[10px] font-bold disabled:opacity-50"
                              style={{ background: "#16a34a" }}
                            >
                              {payingId === p.employee_id
                                ? <RefreshCw className="w-3 h-3 animate-spin" />
                                : <CheckCircle2 className="w-3 h-3" />}
                              Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr className="border-t border-stone-200 bg-stone-100">
                      <td className="px-3 py-2 font-bold text-stone-700">Total</td>
                      <td className="px-3 py-2 text-right font-bold text-stone-600">
                        {currentReport.payments.reduce((s, p) => s + (p.jobs_count ?? 0), 0)}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-stone-600">
                        {fmt$(currentReport.payments.reduce((s, p) => s + (p.revenue ?? 0), 0))}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-blue-700">
                        {fmt$(currentReport.payments.reduce((s, p) => s + p.amount, 0))}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-stone-600">
                        {fmt$(currentReport.payments.reduce((s, p) => s + (p.company_share ?? 0), 0))}
                      </td>
                      <td colSpan={2} className="px-3 py-2 text-right text-xs text-stone-400">
                        {currentReport.payments.filter(p => p.paid_at).length} / {currentReport.payments.length} paid
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* History */}
          <div className="space-y-2">
            <h3 className="font-semibold text-stone-600 text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              History
              {rptLoading && <RefreshCw className="w-3 h-3 animate-spin ml-1" />}
            </h3>
            {reports.length === 0 && !rptLoading && (
              <div className="flex flex-col items-center py-8 gap-2 text-stone-400">
                <DollarSign className="w-8 h-8 opacity-20" />
                <p className="text-xs">No payroll reports yet. Use the form above to generate one.</p>
              </div>
            )}
            {reports.map(rpt => (
              <div key={rpt.id} className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => {
                    setExpandedRpt(id => {
                      if (id === rpt.id) return null;
                      openReport(rpt.id);
                      return rpt.id;
                    });
                  }}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-stone-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-stone-700 text-sm">
                        {rpt.period_start} – {rpt.period_end}
                      </span>
                      {rpt.auto_mode && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">AUTO</span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${rpt.paid_count === rpt.total_employees && rpt.total_employees > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"}`}>
                        {rpt.paid_count}/{rpt.total_employees} paid
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      {rpt.total_employees} employees · Total: {fmt$(Number(rpt.total_payout))}
                    </div>
                  </div>
                  {expandedRpt === rpt.id
                    ? <ChevronUp className="w-4 h-4 text-stone-400 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0" />}
                </button>

                {expandedRpt === rpt.id && currentReport?.id === rpt.id && (
                  <div className="border-t border-stone-100 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-stone-50 text-stone-500">
                          <th className="text-left px-3 py-2 font-semibold">Employee</th>
                          <th className="text-right px-3 py-2 font-semibold">Payout</th>
                          <th className="text-right px-3 py-2 font-semibold">Status</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentReport.payments.map((p, i) => (
                          <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                            <td className="px-3 py-2 font-semibold text-stone-700">{p.name}</td>
                            <td className="px-3 py-2 text-right font-bold text-blue-600">{fmt$(p.amount)}</td>
                            <td className="px-3 py-2 text-right">
                              {p.paid_at
                                ? <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid</span>
                                : <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending</span>}
                            </td>
                            <td className="px-3 py-2">
                              {!p.paid_at && (
                                <button
                                  onClick={() => payEmployee(rpt.id, p.employee_id)}
                                  disabled={payingId === p.employee_id}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-white text-[10px] font-bold disabled:opacity-50"
                                  style={{ background: "#16a34a" }}
                                >
                                  <CheckCircle2 className="w-3 h-3" /> Pay
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ FINANCE SECTION ══════════════════════════════════════════ */}
      {section === "finance" && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-xs font-semibold text-stone-500">Year:</label>
              <select value={fYear} onChange={e => setFYear(Number(e.target.value))}
                className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                {years().map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button onClick={selectAnnual}
                className="px-3 py-1.5 rounded-lg text-white text-xs font-bold transition"
                style={{ background: ACCENT }}>
                Full Year {fYear}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {QUARTERS.map((q, i) => (
                <button key={q.label} onClick={() => selectQuarter(i + 1)}
                  className="py-2 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition hover:border-blue-300 hover:text-blue-600">
                  {q.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-stone-400 font-semibold">Custom:</span>
              <input type="date" value={fFrom} onChange={e => setFFrom(e.target.value)}
                className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
              <span className="text-stone-400 text-xs">to</span>
              <input type="date" value={fTo} onChange={e => setFTo(e.target.value)}
                className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
              <button onClick={() => loadFinance(fFrom, fTo, "month")} disabled={!fFrom || !fTo}
                className="px-3 py-1.5 rounded-lg text-white text-xs font-bold disabled:opacity-40"
                style={{ background: ACCENT }}>
                Load
              </button>
            </div>
          </div>

          {fError && <p className="text-xs text-red-500 text-center py-2">{fError}</p>}
          {fLoading && <div className="flex justify-center py-10"><RefreshCw className="w-6 h-6 animate-spin text-stone-300" /></div>}

          {!fLoading && fReport && (<>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Gross Revenue",    value: fmt$(fReport.summary.gross_revenue),   cls: "text-stone-700 text-xl" },
                { label: `Total Expenses (${fReport.summary.split_employee}%)`, value: fmt$(fReport.summary.total_expenses), cls: "text-blue-600 font-bold text-xl" },
                { label: `Net Income (${fReport.summary.split_company}%)`,      value: fmt$(fReport.summary.net_income),     cls: "text-green-600 font-bold text-xl" },
                { label: "Jobs Completed",   value: String(fReport.summary.jobs_completed), cls: "text-stone-700 text-xl" },
                { label: "Cash",             value: fmt$(fReport.summary.cash),             cls: "text-stone-600 text-xl" },
                { label: "Card / Online",    value: fmt$(fReport.summary.card_online),      cls: "text-indigo-600 text-xl" },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-xl border border-stone-100 shadow-sm p-3 text-center">
                  <div className={`font-bold ${c.cls}`}>{c.value}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{c.label}</div>
                </div>
              ))}
            </div>

            {/* Period breakdown */}
            {fReport.by_period.length > 0 && (
              <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4">
                <h3 className="font-semibold text-stone-700 text-sm mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" style={{ color: ACCENT }} />
                  {isAnnual ? "Quarterly Breakdown" : "Monthly Breakdown"}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-500">
                        <th className="text-left px-3 py-2 font-semibold">Period</th>
                        <th className="text-right px-3 py-2 font-semibold">Revenue</th>
                        <th className="text-right px-3 py-2 font-semibold text-blue-600">Expenses</th>
                        <th className="text-right px-3 py-2 font-semibold text-green-600">Net Income</th>
                        <th className="text-right px-3 py-2 font-semibold">Jobs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fReport.by_period.map((row, i) => (
                        <tr key={row.period} className={i % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                          <td className="px-3 py-2 font-semibold text-stone-700">{row.period}</td>
                          <td className="px-3 py-2 text-right text-stone-600">{fmt$(row.revenue)}</td>
                          <td className="px-3 py-2 text-right text-blue-600 font-semibold">{fmt$(row.expenses)}</td>
                          <td className="px-3 py-2 text-right text-green-600 font-semibold">{fmt$(row.net)}</td>
                          <td className="px-3 py-2 text-right text-stone-500">{row.jobs}</td>
                        </tr>
                      ))}
                      {/* Totals */}
                      <tr className="border-t border-stone-200 bg-stone-100 font-bold">
                        <td className="px-3 py-2 text-stone-700">Total</td>
                        <td className="px-3 py-2 text-right text-stone-700">{fmt$(fReport.summary.gross_revenue)}</td>
                        <td className="px-3 py-2 text-right text-blue-700">{fmt$(fReport.summary.total_expenses)}</td>
                        <td className="px-3 py-2 text-right text-green-700">{fmt$(fReport.summary.net_income)}</td>
                        <td className="px-3 py-2 text-right text-stone-700">{fReport.summary.jobs_completed}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Employee breakdown */}
            {fReport.employees.length > 0 && (
              <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4">
                <h3 className="font-semibold text-stone-700 text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  Employee Breakdown {isAnnual && `(${fYear} by Quarter)`}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-500">
                        <th className="text-left px-3 py-2 font-semibold">Employee</th>
                        <th className="text-right px-3 py-2 font-semibold">Jobs</th>
                        <th className="text-right px-3 py-2 font-semibold">Revenue</th>
                        <th className="text-right px-3 py-2 font-semibold text-blue-600">Payout</th>
                        <th className="text-right px-3 py-2 font-semibold text-green-600">Company</th>
                        {isAnnual && <>
                          <th className="text-right px-3 py-2 font-semibold text-stone-400">Q1</th>
                          <th className="text-right px-3 py-2 font-semibold text-stone-400">Q2</th>
                          <th className="text-right px-3 py-2 font-semibold text-stone-400">Q3</th>
                          <th className="text-right px-3 py-2 font-semibold text-stone-400">Q4</th>
                        </>}
                      </tr>
                    </thead>
                    <tbody>
                      {fReport.employees.map((e, i) => (
                        <tr key={e.id} className={i % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                          <td className="px-3 py-2 font-semibold text-stone-700">{e.name}</td>
                          <td className="px-3 py-2 text-right text-stone-500">{e.jobs_count}</td>
                          <td className="px-3 py-2 text-right font-semibold text-stone-700">{fmt$(e.revenue)}</td>
                          <td className="px-3 py-2 text-right font-bold text-blue-600">{fmt$(e.payout)}</td>
                          <td className="px-3 py-2 text-right font-bold text-green-600">{fmt$(e.company_share)}</td>
                          {isAnnual && <>
                            <td className="px-3 py-2 text-right text-stone-500">{fmt$(e.q1)}</td>
                            <td className="px-3 py-2 text-right text-stone-500">{fmt$(e.q2)}</td>
                            <td className="px-3 py-2 text-right text-stone-500">{fmt$(e.q3)}</td>
                            <td className="px-3 py-2 text-right text-stone-500">{fmt$(e.q4)}</td>
                          </>}
                        </tr>
                      ))}
                      <tr className="border-t border-stone-200 bg-stone-100 font-bold">
                        <td className="px-3 py-2 text-stone-700">Total</td>
                        <td className="px-3 py-2 text-right text-stone-700">{fReport.employees.reduce((s, e) => s + e.jobs_count, 0)}</td>
                        <td className="px-3 py-2 text-right text-stone-700">{fmt$(fReport.employees.reduce((s, e) => s + e.revenue, 0))}</td>
                        <td className="px-3 py-2 text-right text-blue-700">{fmt$(fReport.employees.reduce((s, e) => s + e.payout, 0))}</td>
                        <td className="px-3 py-2 text-right text-green-700">{fmt$(fReport.employees.reduce((s, e) => s + e.company_share, 0))}</td>
                        {isAnnual && <>
                          <td className="px-3 py-2 text-right text-stone-500">{fmt$(fReport.employees.reduce((s, e) => s + (e.q1 ?? 0), 0))}</td>
                          <td className="px-3 py-2 text-right text-stone-500">{fmt$(fReport.employees.reduce((s, e) => s + (e.q2 ?? 0), 0))}</td>
                          <td className="px-3 py-2 text-right text-stone-500">{fmt$(fReport.employees.reduce((s, e) => s + (e.q3 ?? 0), 0))}</td>
                          <td className="px-3 py-2 text-right text-stone-500">{fmt$(fReport.employees.reduce((s, e) => s + (e.q4 ?? 0), 0))}</td>
                        </>}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CSV Download */}
            <button onClick={downloadCSV}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-semibold hover:bg-stone-50 transition">
              <Download className="w-4 h-4" />
              Download CSV Report
            </button>
          </>)}

          {!fLoading && !fReport && !fError && (
            <div className="flex flex-col items-center py-12 gap-2 text-stone-400">
              <BarChart3 className="w-10 h-10 opacity-20" />
              <p className="text-sm">Select a period above to load the report</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ DOWNLOADS SECTION ═══════════════════════════════════════ */}
      {section === "downloads" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 space-y-3">
            <h3 className="font-semibold text-stone-700 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: ACCENT }} />
              {t.downloadsTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1 uppercase tracking-wide">{t.receiptHistoryFilterFrom}</label>
                <input type="date" value={dFrom} onChange={e => setDFrom(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1 uppercase tracking-wide">{t.receiptHistoryFilterTo}</label>
                <input type="date" value={dTo} onChange={e => setDTo(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1 uppercase tracking-wide">{t.receiptHistoryFilterActor}</label>
                <select value={dActor} onChange={e => setDActor(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">{t.receiptHistoryFilterActorAll}</option>
                  <option value="admin">{t.receiptHistoryActorAdmin}</option>
                  <option value="employee">{t.receiptHistoryActorEmployee}</option>
                  <option value="client">{t.receiptHistoryActorClient}</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1 uppercase tracking-wide">{t.downloadsFilterBookingId}</label>
                <input type="text" value={dBooking} onChange={e => setDBooking(e.target.value)} placeholder={t.downloadsFilterBookingPlaceholder}
                  className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1 uppercase tracking-wide">{t.receiptHistoryFilterSearch}</label>
                <input type="search" value={dQuery} onChange={e => setDQuery(e.target.value)} placeholder={t.receiptHistoryFilterSearchPlaceholder}
                  className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={loadDownloads} disabled={dLoading}
                className="px-3 py-1.5 rounded-lg text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
                style={{ background: ACCENT }}>
                {dLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {t.downloadsApplyFilters}
              </button>
              <button
                onClick={() => setDSuspiciousOnly(v => !v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition
                  ${dSuspiciousOnly
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}
              >
                {t.downloadsSuspiciousOnly}
                {dRows.some(r => r.suspicious) && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black leading-none
                    ${dSuspiciousOnly ? "bg-white text-red-600" : "bg-red-600 text-white"}`}>
                    {dRows.filter(r => r.suspicious).length}
                  </span>
                )}
              </button>
              <button onClick={exportDownloadsCsv} disabled={dExporting}
                className="ml-auto px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 hover:bg-blue-100">
                <Download className="w-3.5 h-3.5" />
                {dExporting ? t.downloadsExporting : t.receiptHistoryExportCsv}
              </button>
            </div>
          </div>

          {dError && <p className="text-xs text-red-500 text-center py-2">{dError}</p>}
          {dLoading && <div className="flex justify-center py-10"><RefreshCw className="w-6 h-6 animate-spin text-stone-300" /></div>}

          {!dLoading && dRows.length === 0 && !dError && (
            <div className="flex flex-col items-center py-12 gap-2 text-stone-400">
              <FileText className="w-10 h-10 opacity-20" />
              <p className="text-sm">{t.downloadsEmpty}</p>
            </div>
          )}

          {!dLoading && dRows.length > 0 && (() => {
            const displayedDRows = dSuspiciousOnly ? dRows.filter(r => r.suspicious) : dRows;
            return (
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
              <div className="px-4 py-2 border-b border-stone-100 text-xs text-stone-500 font-semibold flex items-center gap-2">
                {dSuspiciousOnly
                  ? <><span className="text-red-600">{t.downloadsSuspiciousCount(displayedDRows.length)}</span><span className="text-stone-300">{t.downloadsOf} {dRows.length} {t.downloadsTotal}</span></>
                  : <>{t.downloadsCount(dRows.length)}</>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500">
                      <th className="text-left px-3 py-2 font-semibold">{t.downloadsThWhen}</th>
                      <th className="text-left px-3 py-2 font-semibold">{t.downloadsThClient}</th>
                      <th className="text-left px-3 py-2 font-semibold">{t.downloadsThActor}</th>
                      <th className="text-left px-3 py-2 font-semibold">{t.downloadsThIpLocation}</th>
                      <th className="text-left px-3 py-2 font-semibold">{t.downloadsThBrowser}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedDRows.length === 0 ? (
                      <tr><td colSpan={5} className="px-3 py-8 text-center text-stone-400 text-xs">{t.downloadsNoSuspicious}</td></tr>
                    ) : displayedDRows.map((row, i) => (
                      <tr key={String(row.id)} className={`${i % 2 === 0 ? "bg-white" : "bg-stone-50"} ${row.suspicious ? "bg-red-50" : ""}`}>
                        <td className="px-3 py-2 text-stone-600 whitespace-nowrap">
                          {new Date(row.downloaded_at).toLocaleString()}
                        </td>
                        <td className="px-3 py-2">
                          {onOpenBooking ? (
                            <button
                              type="button"
                              onClick={() => onOpenBooking(row.booking_id)}
                              className="text-left group"
                              title="Open booking"
                            >
                              <div className="font-semibold text-blue-600 group-hover:underline">{row.client_name ?? "—"}</div>
                              <div className="text-[10px] text-blue-400 font-mono group-hover:underline">{row.booking_id}</div>
                            </button>
                          ) : (
                            <>
                              <div className="font-semibold text-stone-700">{row.client_name ?? "—"}</div>
                              <div className="text-[10px] text-stone-400 font-mono">{row.booking_id}</div>
                            </>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-semibold text-stone-700">
                            {row.actor_type === "admin" ? t.receiptHistoryActorAdmin
                              : row.actor_type === "employee" ? t.receiptHistoryActorEmployee
                              : row.actor_type === "client" ? t.receiptHistoryActorClient
                              : row.actor_type ?? t.receiptHistoryActorUnknown}
                          </div>
                          {row.actor_name && <div className="text-[10px] text-stone-400">{row.actor_name}</div>}
                          {row.suspicious && (
                            <span className="mt-1 inline-flex items-center rounded-full bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 text-[10px] font-semibold"
                              title={row.suspicious_reason ?? undefined}>
                              {t.downloadsSuspiciousBadge}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {row.ip_address && <div className="font-mono text-stone-600">{row.ip_address}</div>}
                          {row.location && <div className="text-[10px] text-stone-400">{row.location}</div>}
                        </td>
                        <td className="px-3 py-2 text-stone-500 max-w-[200px] truncate" title={row.user_agent ?? undefined}>
                          {row.user_agent ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
          })()}
        </div>
      )}

      {/* ══════════════ CALL LOGS SECTION ════════════════════════════════════════ */}
      {section === "calls" && (
        <div className="space-y-4">
          {/* Filters — compact mobile layout */}
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-3 space-y-2">
            <h3 className="font-semibold text-stone-700 text-sm flex items-center gap-2">
              <Phone className="w-4 h-4" style={{ color: ACCENT }} />
              {t.callLogsTitle}
            </h3>
            {/* Dates row — always 2 columns */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-stone-400 mb-0.5 uppercase tracking-wide">{t.callLogsFrom}</label>
                <input type="date" value={clFrom} onChange={e => setClFrom(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-400 mb-0.5 uppercase tracking-wide">{t.callLogsTo}</label>
                <input type="date" value={clTo} onChange={e => setClTo(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>
            {/* Status + Apply in one row */}
            <div className="flex items-center gap-2">
              <select value={clStatus} onChange={e => setClStatus(e.target.value)}
                className="flex-1 min-w-0 border border-stone-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="">{t.callLogsStatusAll}</option>
                <option value="completed">{t.callLogsStatusCompleted}</option>
                <option value="no_booking">{t.callLogsStatusNoBooking}</option>
                <option value="error">{t.callLogsStatusError}</option>
              </select>
              <button onClick={() => { setClPage(1); void loadCallLogs(1); }} disabled={clLoading}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                style={{ background: ACCENT }}>
                {clLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {t.callLogsApply}
              </button>
            </div>
            {/* Secondary actions row */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const next = !clShowDeleted;
                  setClShowDeleted(next);
                  setClPage(1);
                  void loadCallLogs(1, next);
                }}
                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  clShowDeleted
                    ? "bg-red-100 text-red-700 border-red-200"
                    : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                }`}
              >
                <Trash2 className="w-3 h-3" />
                {clShowDeleted ? t.callLogsHideDeleted : t.callLogsShowDeleted}
              </button>
              <button onClick={exportCallLogsCsv} disabled={clExporting}
                className="flex-1 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 hover:bg-blue-100">
                <Download className="w-3.5 h-3.5" />
                {clExporting ? "…" : t.callLogsExportCsv}
              </button>
            </div>
          </div>

          {clError && <p className="text-xs text-red-500 text-center py-2">{clError}</p>}
          {clCallBackMsg && (
            <div className={`text-xs px-3 py-2 rounded-lg mb-2 font-medium ${clCallBackMsg.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {clCallBackMsg.ok ? "✅" : "❌"} {clCallBackMsg.phone} — {clCallBackMsg.text}
            </div>
          )}
          {clDeleteMsg && (
            <div className={`text-xs px-3 py-2 rounded-lg mb-2 font-medium ${clDeleteMsg.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {clDeleteMsg.ok ? "✅" : "❌"} {clDeleteMsg.text}
            </div>
          )}
          {clLoading && <div className="flex justify-center py-10"><RefreshCw className="w-6 h-6 animate-spin text-stone-300" /></div>}

          {!clLoading && clRows.length === 0 && !clError && (
            <div className="flex flex-col items-center py-12 gap-2 text-stone-400">
              <Phone className="w-10 h-10 opacity-20" />
              <p className="text-sm">{t.callLogsEmpty}</p>
            </div>
          )}

          {!clLoading && clRows.length > 0 && (
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
              <div className="px-3 py-2 border-b border-stone-100 text-xs text-stone-500 font-semibold">
                {t.callLogsShowing((clPage - 1) * CL_LIMIT + clRows.length, clTotal)}
              </div>

              {/* ── Mobile card list (hidden on sm+) ── */}
              <div className="sm:hidden divide-y divide-stone-100">
                {clRows.map((row) => {
                  const isDeleted = !!row.deleted_at;
                  const deletedDate = row.deleted_at ? new Date(row.deleted_at) : null;
                  const canRestore = deletedDate
                    ? (Date.now() - deletedDate.getTime()) < 90 * 24 * 3600 * 1000
                    : false;
                  const isActing = clActionLoading === row.id;
                  const dt = new Date(row.created_at);
                  const dateStr = dt.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
                  const timeStr = dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div
                      key={String(row.id)}
                      onClick={() => !isDeleted && openTranscript(row)}
                      className={`px-3 py-2.5 space-y-1.5 transition
                        ${isDeleted ? "opacity-60 bg-red-50 cursor-default" : "cursor-pointer active:bg-blue-50"}
                        ${!isDeleted && row.status === "error" ? "bg-red-50" : ""}`}
                    >
                      {/* Line 1: date + time + status badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-stone-500 flex-shrink-0">{dateStr} {timeStr}</span>
                        {row.status === "completed" && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-700 flex-shrink-0">✓ {t.callLogsStatusCompleted}</span>
                        )}
                        {row.status === "no_booking" && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-stone-100 text-stone-500 flex-shrink-0">{t.callLogsStatusNoBooking}</span>
                        )}
                        {row.status === "error" && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-700 flex-shrink-0">⚠ {t.callLogsStatusError}</span>
                        )}
                        {row.duration_sec != null && (
                          <span className="ml-auto text-[10px] text-stone-400 flex-shrink-0">{row.duration_sec}с</span>
                        )}
                      </div>
                      {/* Line 2: phone + actions */}
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <span className="font-mono text-xs text-stone-800 flex-1 truncate">
                          {row.caller_phone ?? "—"}
                          {row.client_name && <span className="ml-1 text-[10px] text-stone-400 font-sans non-italic">· {row.client_name}</span>}
                        </span>
                        {row.booking_id && (
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onOpenBooking?.(row.booking_id!); }}
                            className="font-mono text-[10px] text-blue-600 hover:underline flex-shrink-0 px-1.5 py-1 rounded border border-blue-100 bg-blue-50"
                          >#{row.booking_id.slice(0, 6)}</button>
                        )}
                        {!isDeleted && row.caller_phone && (
                          <button
                            type="button"
                            disabled={clCallingBack === row.caller_phone}
                            onClick={e => { e.stopPropagation(); void initiateCallBack(row.caller_phone!); }}
                            title={t.callLogsCallBack}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-50 text-green-700 border border-green-200 disabled:opacity-50 flex-shrink-0"
                          >
                            {clCallingBack === row.caller_phone
                              ? <RefreshCw className="w-3 h-3 animate-spin" />
                              : <PhoneOutgoing className="w-3 h-3" />}
                          </button>
                        )}
                        {!isDeleted && (
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={e => { e.stopPropagation(); void deleteCallLog(row.id); }}
                            title={t.callLogsDelete}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-200 disabled:opacity-50 flex-shrink-0"
                          >
                            {isActing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          </button>
                        )}
                        {isDeleted && canRestore && (
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={e => { e.stopPropagation(); void restoreCallLog(row.id); }}
                            title={t.callLogsRestore}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-orange-50 text-orange-600 border border-orange-200 disabled:opacity-50 flex-shrink-0"
                          >
                            {isActing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                          </button>
                        )}
                        {isDeleted && !canRestore && (
                          <span className="text-[10px] text-stone-400 italic">{t.callLogsRestoreExpired}</span>
                        )}
                        {!isDeleted && <MessageSquare className="w-3.5 h-3.5 text-stone-300 flex-shrink-0" />}
                      </div>
                      {isDeleted && deletedDate && (
                        <div className="text-[10px] text-red-400">🗑 {t.callLogsDeletedAt}: {deletedDate.toLocaleDateString("ru-RU")}</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Desktop table (hidden on mobile) ── */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500">
                      <th className="text-left px-3 py-2 font-semibold">{t.callLogsThWhen}</th>
                      <th className="text-left px-3 py-2 font-semibold">{t.callLogsThPhone}</th>
                      <th className="text-left px-3 py-2 font-semibold">{t.callLogsThStatus}</th>
                      <th className="text-right px-3 py-2 font-semibold">{t.callLogsThDuration}</th>
                      <th className="text-left px-3 py-2 font-semibold">{t.callLogsThBooking}</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clRows.map((row, i) => {
                      const isDeleted = !!row.deleted_at;
                      const deletedDate = row.deleted_at ? new Date(row.deleted_at) : null;
                      const canRestore = deletedDate
                        ? (Date.now() - deletedDate.getTime()) < 90 * 24 * 3600 * 1000
                        : false;
                      const isActing = clActionLoading === row.id;
                      return (
                        <tr
                          key={String(row.id)}
                          onClick={() => !isDeleted && openTranscript(row)}
                          className={`transition
                            ${isDeleted ? "opacity-60 bg-red-50 cursor-default" : `cursor-pointer hover:bg-blue-50 ${i % 2 === 0 ? "bg-white" : "bg-stone-50"}`}
                            ${!isDeleted && row.status === "error" ? "bg-red-50 hover:bg-red-100" : ""}`}
                        >
                          <td className="px-3 py-2.5 text-stone-600 whitespace-nowrap">
                            {new Date(row.created_at).toLocaleString()}
                            {isDeleted && deletedDate && (
                              <div className="text-[10px] text-red-400 mt-0.5">
                                🗑 {t.callLogsDeletedAt}: {deletedDate.toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-stone-700">
                            {row.caller_phone ?? "—"}
                            {row.client_name && (
                              <div className="text-[10px] text-stone-400 font-sans">{row.client_name}</div>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            {row.status === "completed" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                                ✓ {t.callLogsStatusCompleted}
                              </span>
                            )}
                            {row.status === "no_booking" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-500">
                                {t.callLogsStatusNoBooking}
                              </span>
                            )}
                            {row.status === "error" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                                ⚠ {t.callLogsStatusError}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right text-stone-500">
                            {row.duration_sec != null ? row.duration_sec : "—"}
                          </td>
                          <td className="px-3 py-2.5">
                            {row.booking_id ? (
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); onOpenBooking?.(row.booking_id!); }}
                                className="font-mono text-[10px] text-blue-600 hover:underline cursor-pointer inline-flex items-center gap-0.5"
                                title={row.booking_id}
                              >
                                {row.booking_id.slice(0, 8)}…
                              </button>
                            ) : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {!isDeleted && row.caller_phone && (
                                <button
                                  type="button"
                                  disabled={clCallingBack === row.caller_phone}
                                  onClick={e => { e.stopPropagation(); void initiateCallBack(row.caller_phone!); }}
                                  title={t.callLogsCallBack}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold
                                    bg-green-50 text-green-700 hover:bg-green-100 border border-green-200
                                    disabled:opacity-50 disabled:cursor-wait transition"
                                >
                                  {clCallingBack === row.caller_phone
                                    ? <><RefreshCw className="w-3 h-3 animate-spin" /> {t.callLogsCallingBack}</>
                                    : <><PhoneOutgoing className="w-3 h-3" /> {t.callLogsCallBack}</>}
                                </button>
                              )}
                              {!isDeleted && (
                                <button
                                  type="button"
                                  disabled={isActing}
                                  onClick={e => { e.stopPropagation(); void deleteCallLog(row.id); }}
                                  title={t.callLogsDelete}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold
                                    bg-red-50 text-red-600 hover:bg-red-100 border border-red-200
                                    disabled:opacity-50 disabled:cursor-wait transition"
                                >
                                  {isActing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                </button>
                              )}
                              {isDeleted && canRestore && (
                                <button
                                  type="button"
                                  disabled={isActing}
                                  onClick={e => { e.stopPropagation(); void restoreCallLog(row.id); }}
                                  title={t.callLogsRestore}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold
                                    bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200
                                    disabled:opacity-50 disabled:cursor-wait transition"
                                >
                                  {isActing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                                  {t.callLogsRestore}
                                </button>
                              )}
                              {isDeleted && !canRestore && (
                                <span className="text-[10px] text-stone-400 italic">{t.callLogsRestoreExpired}</span>
                              )}
                              {!isDeleted && <MessageSquare className="w-3.5 h-3.5 text-stone-300 flex-shrink-0" />}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination controls */}
          {!clLoading && clTotal > CL_LIMIT && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                disabled={clPage <= 1 || clLoading}
                onClick={() => void loadCallLogs(clPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← {t.callLogsPrev}
              </button>
              <span className="text-xs text-stone-400 font-medium">
                {t.callLogsPage(clPage, Math.ceil(clTotal / CL_LIMIT))}
              </span>
              <button
                disabled={clPage >= Math.ceil(clTotal / CL_LIMIT) || clLoading}
                onClick={() => void loadCallLogs(clPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {t.callLogsNext} →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ TRANSCRIPT MODAL ═════════════════════════════════════════ */}
      {(clTranscript || clTranscriptLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => { if (!clTranscriptLoading) setClTranscript(null); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-800 text-sm">{t.callLogsTranscriptTitle}</h3>
                {clTranscript && (
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {clTranscript.phone ?? "—"}
                    {clTranscript.client_name ? ` · ${clTranscript.client_name}` : ""}
                  </p>
                )}
              </div>
              <button
                onClick={() => setClTranscript(null)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Audio player — shown only when recording_url is available */}
            {!clTranscriptLoading && clTranscript?.recording_url && (
              <div className="px-5 py-3 border-b border-stone-100 bg-stone-50">
                <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide mb-1.5">
                  {t.callLogsRecording}
                </p>
                <audio
                  controls
                  src={clTranscript.recording_url}
                  className="w-full h-9"
                  style={{ borderRadius: "8px" }}
                >
                  {t.callLogsRecordingUnsupported}
                </audio>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {clTranscriptLoading && (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin text-stone-300" />
                </div>
              )}
              {!clTranscriptLoading && clTranscript && (() => {
                const lines = clTranscript.transcript
                  .split("\n")
                  .map(l => l.trim())
                  .filter(Boolean);

                if (lines.length === 0) {
                  return (
                    <p className="text-xs text-stone-400 text-center py-8">{t.callLogsTranscriptEmpty}</p>
                  );
                }

                return lines.map((line, idx) => {
                  const isAgent    = line.startsWith("Agent:");
                  const isCustomer = line.startsWith("Customer:");
                  const text = isAgent
                    ? line.slice("Agent:".length).trim()
                    : isCustomer
                      ? line.slice("Customer:".length).trim()
                      : line;
                  const label = isAgent
                    ? t.callLogsTranscriptAgent
                    : isCustomer
                      ? t.callLogsTranscriptCustomer
                      : null;

                  if (isAgent) {
                    return (
                      <div key={idx} className="flex justify-start gap-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                          style={{ background: ACCENT }}>AI</div>
                        <div className="max-w-[80%]">
                          <div className="text-[9px] text-stone-400 mb-0.5 font-semibold">{label}</div>
                          <div className="bg-blue-50 text-stone-800 text-xs rounded-2xl rounded-tl-sm px-3 py-2 leading-relaxed">
                            {text}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (isCustomer) {
                    return (
                      <div key={idx} className="flex justify-end gap-2">
                        <div className="max-w-[80%] text-right">
                          <div className="text-[9px] text-stone-400 mb-0.5 font-semibold">{label}</div>
                          <div className="bg-stone-100 text-stone-800 text-xs rounded-2xl rounded-tr-sm px-3 py-2 leading-relaxed">
                            {text}
                          </div>
                        </div>
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-[9px] font-bold">C</div>
                      </div>
                    );
                  }

                  // Unrecognised line — show as neutral note
                  return (
                    <div key={idx} className="text-center text-[10px] text-stone-400 italic py-1">
                      {text}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
      {/* ══════════════ WEEKLY SUMMARY SECTION ═══════════════════════════════════ */}
      {section === "weekly" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-700 flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" style={{ color: ACCENT }} />
                {t.weeklySummaryTitle}
              </h3>
              <button onClick={() => void loadWeeklySummary()} className="text-stone-400 hover:text-stone-600 transition" title="Refresh">
                <RefreshCw className={`w-3.5 h-3.5 ${weeklyLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            {weeklyLoading && !weeklyData && (
              <div className="text-center text-sm text-stone-400 py-8">{t.weeklyLoading}</div>
            )}
            {weeklyData && (
              <>
                <div className="text-xs text-stone-400 mb-3">
                  {t.weeklyPeriod}: <span className="font-semibold text-stone-600">{weeklyData.week_start} — {weeklyData.week_end}</span>
                  <span className="ml-2 text-stone-400">({t.weeklyNet}: {weeklyData.emp_pct}%)</span>
                </div>
                {weeklyData.employees.every(e => e.job_count === 0) ? (
                  <div className="text-center text-sm text-stone-400 py-6">{t.weeklyNoData}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-stone-100">
                          <th className="text-left py-2 pr-3 font-semibold text-stone-500">{t.weeklyEmployee}</th>
                          <th className="text-center py-2 px-2 font-semibold text-stone-500">{t.weeklyJobs}</th>
                          <th className="text-right py-2 px-2 font-semibold text-stone-500">{t.weeklyLabor}</th>
                          <th className="text-right py-2 px-2 font-semibold text-stone-500">{t.weeklyParts}</th>
                          <th className="text-right py-2 px-2 font-semibold text-stone-500">{t.weeklyTax}</th>
                          <th className="text-right py-2 pl-2 font-semibold text-stone-700">{t.weeklyNet}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeklyData.employees.map(e => (
                          <tr key={e.id} className="border-b border-stone-50 hover:bg-stone-50 transition">
                            <td className="py-2.5 pr-3 font-medium text-stone-700">{e.name}</td>
                            <td className="py-2.5 px-2 text-center text-stone-500">{e.job_count}</td>
                            <td className="py-2.5 px-2 text-right text-stone-600">${e.labor.toFixed(2)}</td>
                            <td className="py-2.5 px-2 text-right text-stone-500">${e.parts.toFixed(2)}</td>
                            <td className="py-2.5 px-2 text-right text-stone-500">${e.tax.toFixed(2)}</td>
                            <td className="py-2.5 pl-2 text-right font-bold" style={{ color: ACCENT }}>${e.employee_net.toFixed(2)}</td>
                          </tr>
                        ))}
                        {/* Total row */}
                        <tr className="bg-stone-50 font-semibold border-t border-stone-200">
                          <td className="py-2.5 pr-3 text-stone-700 text-xs uppercase tracking-wide">{t.weeklyTotal}</td>
                          <td className="py-2.5 px-2 text-center text-stone-700">{weeklyData.totals.job_count}</td>
                          <td className="py-2.5 px-2 text-right text-stone-700">${weeklyData.totals.labor.toFixed(2)}</td>
                          <td className="py-2.5 px-2 text-right text-stone-700">${weeklyData.totals.parts.toFixed(2)}</td>
                          <td className="py-2.5 px-2 text-right text-stone-700">${weeklyData.totals.tax.toFixed(2)}</td>
                          <td className="py-2.5 pl-2 text-right font-bold text-sm" style={{ color: ACCENT }}>${weeklyData.totals.employee_net.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {[
                    { label: t.weeklyLabor, value: weeklyData.totals.labor, color: "#1B6FE8" },
                    { label: t.weeklyParts, value: weeklyData.totals.parts, color: "#f59e0b" },
                    { label: t.weeklyTax,   value: weeklyData.totals.tax,   color: "#64748b" },
                    { label: t.weeklyNet,   value: weeklyData.totals.employee_net, color: "#16a34a" },
                  ].map(card => (
                    <div key={card.label} className="bg-stone-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-stone-400 mb-1">{card.label}</div>
                      <div className="font-bold text-base" style={{ color: card.color }}>${card.value.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
