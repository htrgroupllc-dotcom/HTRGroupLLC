import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { createPortal } from "react-dom";

export default function BackButton() {
  const [location] = useLocation();
  if (location === "/" || location === "" || location.startsWith("/admin")) return null;

  const button = (
    <button
      onClick={() => window.history.back()}
      aria-label="Go back"
      style={{
        position: "fixed",
        left: "12px",
        bottom: "24px",
        zIndex: 999999,
        background: "rgba(11,26,63,0.45)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: "9999px",
        padding: "8px 14px",
        fontSize: "13px",
        fontWeight: 600,
        color: "white",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        cursor: "pointer",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        letterSpacing: "0.01em",
        opacity: 0.75,
        transition: "opacity 0.2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "0.75")}
    >
      <ArrowLeft size={14} />
      <span>Back</span>
    </button>
  );

  return createPortal(button, document.body);
}
