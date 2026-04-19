import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Wrench, CalendarCheck } from "lucide-react";

const STORAGE_KEY = "htr_promo_shown";
const DELAY_MS = 1_000;

const TR = {
  en: {
    badge:   "Limited Offer",
    title:   "Free Diagnostic Visit!",
    sub:     "Not sure what's wrong with your appliance? Our technician comes to you and diagnoses the problem — completely free.",
    cta:     "Book Free Visit",
    dismiss: "No thanks",
  },
  es: {
    badge:   "Oferta Limitada",
    title:   "¡Visita de Diagnóstico Gratis!",
    sub:     "¿No sabe qué le pasa a su electrodoméstico? Nuestro técnico va a su casa y diagnostica el problema — completamente gratis.",
    cta:     "Reservar Visita Gratis",
    dismiss: "No, gracias",
  },
};

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

export default function PromoPopup() {
  const [visible, setVisible] = useState(false);

  const lang: "en" | "es" = (() => {
    try { return (localStorage.getItem("lang") as "en" | "es") ?? "en"; }
    catch { return "en"; }
  })();
  const T = TR[lang] ?? TR.en;

  useEffect(() => {
    const ss = safeStorage("session");
    if (ss?.getItem(STORAGE_KEY)) return;
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

  if (!visible) return null;

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

        {/* Header gradient */}
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

        {/* Body */}
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
