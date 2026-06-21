import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const ACCENT = "#1B6FE8";
const DEFAULT_API = "https://htr-group-llc-appliance-repair.replit.app";
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined ?? "").replace(/\/$/, "") || DEFAULT_API;

type StripePromise = ReturnType<typeof loadStripe>;

function initStripePromises(publishableKey: string): {
  en: StripePromise;
  es: StripePromise;
} {
  return {
    en: loadStripe(publishableKey, { locale: "en" }),
    es: loadStripe(publishableKey, { locale: "es" }),
  };
}

const T = {
  en: {
    title:       "Pay for Your Repair",
    subtitle:    "Hi-Tech Repair Group",
    amountLabel: "Amount (USD)",
    amountPlh:   "e.g. 150",
    nameLabel:   "Your Name (optional)",
    namePlh:     "John Smith",
    nextBtn:     "Continue to Payment",
    payBtn:      "Pay Now",
    processing:  "Processing…",
    errEmpty:    "Please enter an amount",
    errMin:      "Minimum amount is $1",
    errMax:      "Maximum amount is $50,000",
    errServer:   "Payment error. Please try again.",
    cancelled:   "Payment was cancelled. You can try again.",
    secure:      "Secured by Stripe",
    paying:      "Paying",
    change:      "Change amount",
    successTitle: "Payment Successful!",
    successMsg:   "Thank you! Your payment has been received.",
    cardTitle:    "Payment Details",
    doneBtn:      "Done",
  },
  es: {
    title:       "Pagar su Reparación",
    subtitle:    "Hi-Tech Repair Group",
    amountLabel: "Monto (USD)",
    amountPlh:   "ej. 150",
    nameLabel:   "Su Nombre (opcional)",
    namePlh:     "Juan García",
    nextBtn:     "Continuar al Pago",
    payBtn:      "Pagar Ahora",
    processing:  "Procesando…",
    errEmpty:    "Por favor ingrese un monto",
    errMin:      "El monto mínimo es $1",
    errMax:      "El monto máximo es $50,000",
    errServer:   "Error de pago. Intente de nuevo.",
    cancelled:   "El pago fue cancelado. Puede intentar de nuevo.",
    secure:      "Protegido por Stripe",
    paying:      "Pagando",
    change:      "Cambiar monto",
    successTitle: "¡Pago Exitoso!",
    successMsg:   "¡Gracias! Su pago ha sido recibido.",
    cardTitle:    "Datos de Pago",
    doneBtn:      "Listo",
  },
};

// ─── Inner checkout form (rendered inside <Elements>) ────────────────────────
function CheckoutForm({
  amount,
  lang,
  t,
  onBack,
  onDone,
}: {
  amount: number;
  lang: "en" | "es";
  t: typeof T.en;
  onBack: () => void;
  onDone: () => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState("");
  const [success, setSuccess]   = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE
    ? (import.meta.env.VITE_API_BASE as string).replace(/\/$/, "").replace(/\/api$/, "")
    : window.location.origin;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    const { error: submitErr } = await elements.submit();
    if (submitErr) {
      setError(submitErr.message ?? t.errServer);
      setLoading(false);
      return;
    }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${baseUrl}/payment-success?lang=${lang}`,
      },
      redirect: "if_required",
    });

    if (confirmErr) {
      setError(confirmErr.message ?? t.errServer);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
          {t.successTitle}
        </div>
        <div style={{ fontSize: 15, color: "#64748b" }}>{t.successMsg}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: ACCENT, marginTop: 20, marginBottom: 28 }}>
          ${amount.toFixed(2)}
        </div>
        <button
          onClick={onDone}
          style={{
            width: "100%", padding: "16px",
            background: ACCENT, color: "#fff",
            borderRadius: 12, border: "none",
            fontSize: 16, fontWeight: 800, cursor: "pointer",
          }}
        >
          {t.doneBtn}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Amount badge */}
      <div style={{
        background: "#f0f6ff", borderRadius: 12, padding: "12px 16px",
        marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{t.paying}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: ACCENT }}>${amount.toFixed(2)}</div>
        </div>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none", border: "1px solid #cbd5e1", borderRadius: 8,
            padding: "6px 12px", fontSize: 12, color: "#64748b", cursor: "pointer",
          }}
        >
          {t.change}
        </button>
      </div>

      {/* Stripe PaymentElement */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
          {t.cardTitle}
        </div>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10,
          padding: "10px 14px", fontSize: 13, color: "#b91c1c", marginBottom: 16,
        }}>
          ❌ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe}
        style={{
          width: "100%", padding: "16px",
          background: loading ? "#94a3b8" : ACCENT,
          color: "#fff", borderRadius: 12, border: "none",
          fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "background 0.2s",
        }}
      >
        {loading ? (
          <>
            <span style={{
              width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.4)",
              borderTopColor: "#fff", borderRadius: "50%",
              display: "inline-block", animation: "spin 0.7s linear infinite",
            }} />
            {t.processing}
          </>
        ) : (
          <>{t.payBtn} — ${amount.toFixed(2)}</>
        )}
      </button>

      <div style={{
        marginTop: 14, textAlign: "center", fontSize: 11, color: "#94a3b8",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        {t.secure} · SSL
      </div>
    </form>
  );
}

// ─── Main PayPage ─────────────────────────────────────────────────────────────
export default function PayPage() {
  const params    = new URLSearchParams(window.location.search);
  const initLang  = params.get("lang") === "es" ? "es" : "en";
  const cancelled = params.get("cancelled") === "1";

  const [lang, setLang]               = useState<"en" | "es">(initLang);
  const [amount, setAmount]           = useState("");
  const [name,   setName]             = useState("");
  const [error,  setError]            = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [confirmedAmount, setConfirmedAmount] = useState(0);
  const [stripePromiseEn, setStripePromiseEn] = useState<StripePromise | null>(null);
  const [stripePromiseEs, setStripePromiseEs] = useState<StripePromise | null>(null);
  const [stripeReady, setStripeReady] = useState(false);

  const t = T[lang];

  // Load Stripe publishable key from API (bundle build has no VITE_STRIPE_PUBLISHABLE_KEY).
  useEffect(() => {
    let cancelled = false;
    const embedded = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined)?.trim();
    if (embedded) {
      const p = initStripePromises(embedded);
      setStripePromiseEn(p.en);
      setStripePromiseEs(p.es);
      setStripeReady(true);
      return;
    }
    fetch(`${API_BASE}/api/public/stripe-config`)
      .then(async (r) => {
        const d = (await r.json()) as { ok?: boolean; publishableKey?: string };
        if (cancelled) return;
        if (d.ok && d.publishableKey) {
          const p = initStripePromises(d.publishableKey);
          setStripePromiseEn(p.en);
          setStripePromiseEs(p.es);
        }
        setStripeReady(true);
      })
      .catch(() => {
        if (!cancelled) setStripeReady(true);
      });
    return () => { cancelled = true; };
  }, []);

  // PWA / home-screen manifest swap
  useEffect(() => {
    const prev = document.querySelector("link[rel='manifest']") as HTMLLinkElement | null;
    if (prev) document.head.removeChild(prev);
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = "/pay-manifest.json";
    document.head.appendChild(link);

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta("apple-mobile-web-app-capable", "yes");
    setMeta("apple-mobile-web-app-status-bar-style", "default");
    setMeta("apple-mobile-web-app-title", "HTR Pay");
    setMeta("theme-color", "#1B6FE8");

    const appleIcon = document.createElement("link");
    appleIcon.rel = "apple-touch-icon";
    appleIcon.href = "/icon-192.png";
    document.head.appendChild(appleIcon);

    return () => {
      if (link.parentNode) document.head.removeChild(link);
      if (appleIcon.parentNode) document.head.removeChild(appleIcon);
      if (prev) document.head.appendChild(prev);
    };
  }, []);

  async function handleContinue() {
    setError("");
    const parsed = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (!amount.trim() || isNaN(parsed)) { setError(t.errEmpty); return; }
    if (parsed < 1)       { setError(t.errMin); return; }
    if (parsed > 50000)   { setError(t.errMax); return; }

    setLoadingIntent(true);
    try {
      const resp = await fetch(`${API_BASE}/api/public/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsed, name, lang }),
      });
      const data = await resp.json() as { ok?: boolean; clientSecret?: string; error?: string };
      if (!resp.ok || !data.ok || !data.clientSecret) {
        setError(data.error ?? t.errServer);
        setLoadingIntent(false);
        return;
      }
      setConfirmedAmount(parsed);
      setClientSecret(data.clientSecret);
    } catch {
      setError(t.errServer);
    }
    setLoadingIntent(false);
  }

  const elementsOptions = clientSecret
    ? {
        clientSecret,
        locale: lang as "en" | "es",
        appearance: {
          theme: "stripe" as const,
          variables: {
            colorPrimary: ACCENT,
            borderRadius: "10px",
            fontFamily: "'Inter', system-ui, sans-serif",
          },
        },
      }
    : null;

  function handleDone() {
    setClientSecret(null);
    setAmount("");
    setName("");
    setError("");
    setConfirmedAmount(0);
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(135deg, #f0f6ff 0%, #e8f0fe 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        width: "100%", maxWidth: 440,
        background: "#fff", borderRadius: 20,
        boxShadow: "0 8px 40px rgba(27,111,232,0.12)",
        padding: "32px 28px",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>{t.title}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{t.subtitle}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["en", "es"] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", border: "none",
                  background: lang === l ? ACCENT : "#f1f5f9",
                  color:      lang === l ? "#fff"  : "#64748b",
                }}
              >
                {l === "en" ? "EN" : "ES"}
              </button>
            ))}
          </div>
        </div>

        {/* Step 1: amount input */}
        {!clientSecret && (
          <>
            {cancelled && (
              <div style={{
                background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 10,
                padding: "10px 14px", fontSize: 13, color: "#92400e", marginBottom: 18,
              }}>
                ⚠️ {t.cancelled}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {t.amountLabel}
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                  fontSize: 18, fontWeight: 700, color: "#374151",
                }}>$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setError(""); }}
                  onKeyDown={e => { if (e.key === "Enter") handleContinue(); }}
                  placeholder={t.amountPlh}
                  style={{
                    width: "100%", padding: "14px 14px 14px 32px",
                    fontSize: 22, fontWeight: 700, color: "#0f172a",
                    border: error ? "2px solid #ef4444" : "2px solid #e2e8f0",
                    borderRadius: 12, outline: "none", boxSizing: "border-box",
                    background: "#f8fafc",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = ACCENT; }}
                  onBlur={e => { e.currentTarget.style.borderColor = error ? "#ef4444" : "#e2e8f0"; }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {t.nameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t.namePlh}
                style={{
                  width: "100%", padding: "12px 14px",
                  fontSize: 15, color: "#0f172a",
                  border: "2px solid #e2e8f0", borderRadius: 12,
                  outline: "none", boxSizing: "border-box", background: "#f8fafc",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = ACCENT; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
              />
            </div>

            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10,
                padding: "10px 14px", fontSize: 13, color: "#b91c1c", marginBottom: 16,
              }}>
                ❌ {error}
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={loadingIntent}
              style={{
                width: "100%", padding: "16px",
                background: loadingIntent ? "#94a3b8" : ACCENT,
                color: "#fff", borderRadius: 12, border: "none",
                fontSize: 16, fontWeight: 800, cursor: loadingIntent ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s",
              }}
            >
              {loadingIntent ? (
                <>
                  <span style={{
                    width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.7s linear infinite",
                  }} />
                  {t.processing}
                </>
              ) : (
                <>{t.nextBtn}</>
              )}
            </button>

            <div style={{
              marginTop: 14, textAlign: "center", fontSize: 11, color: "#94a3b8",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              {t.secure} · Google Pay · Apple Pay · Card
            </div>
          </>
        )}

        {/* Step 2: Stripe Elements */}
        {clientSecret && !stripeReady && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#64748b", fontSize: 14 }}>
            {t.processing}
          </div>
        )}
        {clientSecret && stripeReady && (lang === "es" ? stripePromiseEs : stripePromiseEn) && elementsOptions && (
          <Elements stripe={lang === "es" ? stripePromiseEs! : stripePromiseEn!} options={elementsOptions}>
            <CheckoutForm
              amount={confirmedAmount}
              lang={lang}
              t={t}
              onBack={() => { setClientSecret(null); setError(""); }}
              onDone={handleDone}
            />
          </Elements>
        )}

        {/* No Stripe key configured */}
        {clientSecret && stripeReady && !stripePromiseEn && (
          <div style={{ color: "#b91c1c", fontSize: 14, textAlign: "center" }}>
            Stripe is not configured. Please contact support.
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}
