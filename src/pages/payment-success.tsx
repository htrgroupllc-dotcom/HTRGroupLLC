import { useEffect, useState } from "react";
import { CheckCircle2, Home, Phone, Wrench, Loader2, DollarSign, Calendar, MapPin, Settings, Receipt, Download } from "lucide-react";
import { downloadReceiptPdf } from "../lib/downloadReceipt";

const ACCENT = "#1B6FE8";

interface BookingSummary {
  invoice_number: string;
  client_name: string;
  appliance: string | null;
  address: string | null;
  amount: number | null;
  paid: boolean;
  preferred_date: string | null;
  work_description: string | null;
}

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

export default function PaymentSuccess() {
  const [lang, setLang] = useState<"en" | "es">(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get("lang");
    if (urlLang === "es" || urlLang === "en") return urlLang;
    const s = localStorage.getItem("lang");
    return s === "es" ? "es" : "en";
  });

  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "done">("loading");
  const [downloading, setDownloading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id") ?? "";

  useEffect(() => {
    if (!sessionId) { setLoadState("done"); return; }
    const base = (import.meta.env.VITE_API_BASE as string | undefined ?? "").replace(/\/$/, "");
    fetch(`${base}/api/public/payment-confirmation?session_id=${encodeURIComponent(sessionId)}`)
      .then(r => r.json())
      .then((data: BookingSummary & { ok?: boolean }) => {
        if (data.ok) setSummary(data);
        setLoadState("done");
      })
      .catch(() => setLoadState("done"));
  }, [sessionId]);

  const t = {
    en: {
      title: "Payment Received!",
      subtitle: "Thank you for paying online.",
      body: "Your payment has been processed. Our team will confirm your appointment shortly.",
      home: "Back to Home",
      invoiceLabel: "Invoice #",
      sessionLabel: "Session ref:",
      summary: "Service Summary",
      client: "Client",
      appliance: "Appliance",
      address: "Address",
      amount: "Amount Paid",
      date: "Service Date",
      work: "Work Performed",
      help: "Questions? Call us anytime:",
      download: "Download Receipt",
      downloading: "Generating PDF…",
      downloadError: "Could not generate receipt. Please try again.",
    },
    es: {
      title: "¡Pago recibido!",
      subtitle: "Gracias por pagar en línea.",
      body: "Su pago ha sido procesado. Nuestro equipo confirmará su cita en breve.",
      home: "Volver al inicio",
      invoiceLabel: "Factura #",
      sessionLabel: "Referencia:",
      summary: "Resumen del servicio",
      client: "Cliente",
      appliance: "Electrodoméstico",
      address: "Dirección",
      amount: "Monto pagado",
      date: "Fecha de servicio",
      work: "Trabajo realizado",
      help: "¿Preguntas? Llámenos cuando quiera:",
      download: "Descargar recibo",
      downloading: "Generando PDF…",
      downloadError: "No se pudo generar el recibo. Inténtelo de nuevo.",
    },
  }[lang];

  const invoiceNumber = summary?.invoice_number ?? null;
  const sessionRef = sessionId ? sessionId.slice(0, 24) + "…" : null;

  async function handleDownloadReceipt() {
    if (!sessionId || downloading) return;
    setDownloading(true);
    try {
      const base = (import.meta.env.VITE_API_BASE as string | undefined ?? "").replace(/\/$/, "");
      const url = `${base}/api/public/invoice-html?session_id=${encodeURIComponent(sessionId)}&lang=${lang}`;
      const filenameBase = invoiceNumber ? `receipt-${invoiceNumber}` : "receipt";
      await downloadReceiptPdf({ url, filenameBase });
    } catch {
      window.alert(t.downloadError);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-stone-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-stone-700">HTRGroup</span>
        </div>

        <h1 className="text-3xl font-bold text-stone-800 mb-2">{t.title}</h1>
        <p className="text-stone-500 text-base mb-2">{t.subtitle}</p>
        <p className="text-stone-600 text-sm mb-5">{t.body}</p>

        {loadState === "loading" && sessionId ? (
          <div className="flex items-center justify-center gap-2 text-stone-400 text-sm mb-5">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{lang === "en" ? "Loading your details…" : "Cargando sus detalles…"}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 mb-5 bg-stone-100 rounded-xl px-4 py-2.5">
            <Receipt className="w-4 h-4 text-stone-400 shrink-0" />
            <span className="text-xs font-mono text-stone-500">
              {invoiceNumber
                ? <>{t.invoiceLabel}<span className="font-bold text-stone-700">{invoiceNumber}</span></>
                : sessionRef
                  ? <>{t.sessionLabel} {sessionRef}</>
                  : null
              }
            </span>
          </div>
        )}

        {loadState === "done" && summary && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm text-left px-5 py-4 mb-6 space-y-3">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">{t.summary}</h2>

            {summary.client_name && (
              <SummaryRow icon={<Wrench className="w-3.5 h-3.5 text-blue-500" />} label={t.client} value={summary.client_name} />
            )}
            {summary.appliance && (
              <SummaryRow icon={<Settings className="w-3.5 h-3.5 text-blue-500" />} label={t.appliance} value={summary.appliance} />
            )}
            {summary.amount != null && (
              <SummaryRow
                icon={<DollarSign className="w-3.5 h-3.5 text-green-600" />}
                label={t.amount}
                value={`$${summary.amount.toFixed(2)}`}
                valueClass="font-bold text-green-700"
              />
            )}
            {summary.preferred_date && (
              <SummaryRow
                icon={<Calendar className="w-3.5 h-3.5 text-blue-500" />}
                label={t.date}
                value={formatDate(summary.preferred_date, lang === "en" ? "en-US" : "es-MX")}
              />
            )}
            {summary.address && (
              <SummaryRow icon={<MapPin className="w-3.5 h-3.5 text-blue-500" />} label={t.address} value={summary.address} />
            )}
            {summary.work_description && (
              <SummaryRow icon={<Receipt className="w-3.5 h-3.5 text-stone-400" />} label={t.work} value={summary.work_description} />
            )}
          </div>
        )}

        {loadState === "done" && summary && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleDownloadReceipt}
              disabled={downloading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 font-bold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ borderColor: ACCENT, color: ACCENT, background: "white" }}
            >
              {downloading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {t.downloading}</>
              ) : (
                <><Download className="w-4 h-4" /> {t.download}</>
              )}
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition"
            style={{ background: ACCENT }}
          >
            <Home className="w-4 h-4" /> {t.home}
          </a>
          <a
            href="tel:+16066606067"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-stone-200 text-stone-700 font-bold text-sm hover:bg-stone-50 transition"
          >
            <Phone className="w-4 h-4" /> (606) 660-6067
          </a>
        </div>

        <p className="text-xs text-stone-400 mt-8">{t.help} (606) 660-6067</p>

        <button
          onClick={() => setLang(l => l === "en" ? "es" : "en")}
          className="mt-4 text-xs text-stone-400 hover:text-stone-600 transition underline"
        >
          {lang === "en" ? "Español" : "English"}
        </button>
      </div>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  valueClass = "text-stone-800",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-stone-50 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-stone-400">{label}</p>
        <p className={`text-sm font-semibold leading-snug ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}
