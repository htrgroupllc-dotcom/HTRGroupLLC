import { createPortal } from "react-dom";
import { useState, useEffect } from "react";

const WA_NUMBER = "15559554342";
const WA_MSG_EN = "Hello! I need appliance repair help.";
const WA_MSG_ES = "¡Hola! Necesito ayuda con reparación de electrodomésticos.";

export default function WhatsAppButton() {
  const isEs = document.documentElement.lang === "es" ||
    localStorage.getItem("lang") === "es";
  const msg  = encodeURIComponent(isEs ? WA_MSG_ES : WA_MSG_EN);
  const href = `https://wa.me/${WA_NUMBER}?text=${msg}`;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const button = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      style={{
        position:       "fixed",
        bottom:         isMobile ? "24px" : "88px",
        right:          "24px",
        zIndex:         49,
        width:          "52px",
        height:         "52px",
        borderRadius:   "9999px",
        background:     "#25D366",
        boxShadow:      "0 4px 14px rgba(37,211,102,0.45)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        transition:     "transform 0.2s, box-shadow 0.2s",
        textDecoration: "none",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.transform  = "scale(1.08)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow  = "0 6px 20px rgba(37,211,102,0.55)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.transform  = "scale(1)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow  = "0 4px 14px rgba(37,211,102,0.45)";
      }}
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.648 4.83 1.78 6.867L2 30l7.363-1.754A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 0 1-5.89-1.607l-.422-.25-4.37 1.042 1.072-4.26-.276-.438A11.554 11.554 0 0 1 4.4 16C4.4 9.594 9.594 4.4 16 4.4S27.6 9.594 27.6 16 22.406 27.6 16 27.6zm6.34-8.674c-.348-.174-2.058-1.016-2.378-1.131-.32-.116-.552-.174-.785.174-.232.348-.9 1.131-1.102 1.363-.203.232-.406.26-.754.086-.348-.174-1.47-.542-2.8-1.726-1.034-.924-1.733-2.065-1.936-2.413-.203-.348-.022-.536.152-.71.157-.156.348-.406.522-.61.174-.202.232-.348.348-.58.116-.232.058-.434-.029-.61-.087-.174-.785-1.893-1.075-2.59-.283-.681-.57-.588-.785-.6-.203-.01-.435-.012-.667-.012s-.61.087-.928.434c-.32.348-1.218 1.19-1.218 2.9s1.247 3.365 1.421 3.597c.174.232 2.453 3.745 5.942 5.25.831.358 1.48.572 1.986.732.834.265 1.594.228 2.194.138.669-.1 2.058-.841 2.348-1.654.29-.812.29-1.508.203-1.654-.087-.145-.32-.232-.667-.406z"/>
      </svg>
    </a>
  );

  return createPortal(button, document.body);
}
