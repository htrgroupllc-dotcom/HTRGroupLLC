import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Wrench, CalendarCheck } from "lucide-react";

const STORAGE_KEY = "htr_promo_shown";
const DELAY_MS = 1_000;

const EXCLUDED_PATHS = ["/admin", "/gallery", "/book-call", "/intake", "/form", "/pay", "/payment-success"];

function makeTranslations(fee: string) {
  const n = Number(fee);
  const isFree = Number.isFinite(n) && n === 0;
  const feeLabel = isFree ? "Free" : `$${fee}`;
  const feeLabelEs = isFree ? "Gratis" : `$${fee}`;

  return {
    en: {
      badge:   "Limited Offer",
      title:   isFree ? "Free Diagnostic Visit!" : `$${fee} Diagnostic Visit!`,
      sub:     isFree
        ? "Not sure what's wrong with your appliance? Our technician comes to you and diagnoses the problem — completely free."
        : `Not sure what's wrong with your appliance? Our technician comes to you and diagnoses the problem for only $${fee} — applied toward your repair.`,
      cta:     isFree ? "Book Free Visit" : `Book for ${feeLabel}`,
      dismiss: "No thanks",
    },
    es: {
      badge:   "Oferta Limitada",
      title:   isFree ? "¡Visita de Diagnóstico Gratis!" : `¡Visita de Diagnóstico por ${feeLabelEs}!`,
      sub:     isFree
        ? "¿No sabe qué le pasa a su electrodoméstico? Nuestro técnico va a su casa y diagnostica el problema — completamente gratis."
        : `¿No sabe qué le pasa a su electrodoméstico? Nuestro técnico va a su casa y diagnostica el problema por solo ${feeLabelEs} — aplicado al costo de la reparación.`,
      cta:     isFree ? "Reservar Visita Gratis" : `Reservar por ${feeLabelEs}`,
      dismiss: "No, gracias",
    },
  };
}

function safeStorage(type: "local" | "session") {
  try {
    const s = type === "local" ? localStorage : sessionStorage;
    s.setItem("__test__", "1");
    s.removeItem("__test__");
    return s;
  } catch {
    return null;
  }
}

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined ?? "https://htr-group-llc-appliance-repair.replit.app").replace(/\/$/, "");

export default function PromoPopup() {
  const [visible, setVisible] = useState(false);
  const [fee, setFee]         = useState<string | null>(null);

  const lang: "en" | "es" = (() => {
    try { return (localStorage.getItem("lang") as "en" | "es") ?? "en"; }
    catch { return "en"; }
  })();

  useEffect(() => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "";
    const p = window.location.pathname.replace(base, "") || "/";
    if (EXCLUDED_PATHS.some(ep => p === ep || p.startsWith(ep + "/"))) return;

    const ss = safeStorage("session");
    if (ss?.getItem(STORAGE_KEY)) return;

    fetch(`${API_BASE}/api/settings/visit-fee?site=appliance`)
      .then(r => r.json())
      .then((d: { fee?: string }) => setFee(d.fee ?? "0"))
      .catch(() => setFee("0"));

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    setVisible(false);
  }

  function bookNow() {
    close();
    setTimeout(() => {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  }

  if (!visible || fee === null) return null;

  const TR = makeTranslations(fee);
  const T  = TR[lang] ?? TR.en;

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(11,26,63,0.65)",
        backdropFilter: "blur(4px)",
      }}
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "20px",
          maxWidth: "420px",
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
          animation: "htr-popup-in 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <style>{`
          @keyframes htr-popup-in {
            from { opacity: 0; transform: scale(0.85) translateY(20px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        <div style={{
          background: "linear-gradient(135deg,#0B1A3F,#1B6FE8)",
          padding: "28px 24px 20px",
          position: "relative",
          textAlign: "center",
        }}>
          <button
            onClick={close}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "9999px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
            }}
          >
            <X size={16} />
          </button>

          <span style={{
            display: "inline-block",
            background: "#F59E0B",
            color: "#1a1a1a",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: "9999px",
            marginBottom: "12px",
          }}>{T.badge}</span>

          <div style={{
            width: "56px",
            height: "56px",
            background: "rgba(255,255,255,0.12)",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
          }}>
            <Wrench size={28} color="white" />
          </div>

          <h2 style={{
            color: "white",
            fontSize: "22px",
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.2,
          }}>{T.title}</h2>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          <p style={{
            color: "#4b5563",
            fontSize: "14px",
            lineHeight: 1.6,
            margin: "0 0 20px",
            textAlign: "center",
          }}>{T.sub}</p>

          <button
            onClick={bookNow}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg,#1B6FE8,#0D47B0)",
              color: "white",
              fontWeight: 700,
              fontSize: "15px",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(27,111,232,0.4)",
            }}
          >
            <CalendarCheck size={18} />
            {T.cta}
          </button>

          <button
            onClick={close}
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "10px",
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              fontSize: "13px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >{T.dismiss}</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
