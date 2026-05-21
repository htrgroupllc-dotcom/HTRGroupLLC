import { useState, useRef, useCallback } from "react";

const API = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

// Pattern: 2 clicks → pause ≥ 900ms (up to 5s) → 3 clicks
// 5 rapid equal-interval clicks must NOT trigger the modal
type Phase = "idle" | "after_two" | "ready_three";

export default function AdminSecretAccess({ label }: { label: string }) {
  const phaseRef = useRef<Phase>("idle");
  const countRef = useRef(0);
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null); // reset idle counter
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null); // min-pause gate
  const t3 = useRef<ReturnType<typeof setTimeout> | null>(null); // max-pause / ready timeout

  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearAll = () => {
    [t1, t2, t3].forEach(r => { if (r.current) clearTimeout(r.current); r.current = null; });
  };

  const resetState = useCallback(() => {
    clearAll();
    phaseRef.current = "idle";
    countRef.current = 0;
  }, []);

  const handleClick = useCallback(() => {
    const phase = phaseRef.current;

    // ── Phase: idle — collecting first 2 clicks ──────────────────────────────
    if (phase === "idle") {
      countRef.current += 1;
      if (countRef.current < 2) {
        // 1st click: wait up to 1.5s for 2nd click (admin only — ©)
        if (t1.current) clearTimeout(t1.current);
        t1.current = setTimeout(resetState, 1500);
      } else {
        // 2nd click → admin min-pause gate (900ms)
        if (t1.current) clearTimeout(t1.current);
        countRef.current = 0;
        phaseRef.current = "after_two";

        // After 900ms with NO click → pause confirmed → ready for 3 clicks
        t2.current = setTimeout(() => {
          phaseRef.current = "ready_three";
          countRef.current = 0;
          // Give up to 5s to complete the 3 clicks
          t3.current = setTimeout(resetState, 5000);
        }, 900);
      }
      return;
    }

    // ── Phase: after_two — a click arrived before the 900ms pause ────────────
    if (phase === "after_two") {
      // Too fast — full reset (this is what blocks "5 equal interval clicks")
      resetState();
      return;
    }

    // ── Phase: ready_three — collecting the remaining 3 clicks ───────────────
    if (phase === "ready_three") {
      if (t3.current) clearTimeout(t3.current);
      countRef.current += 1;

      if (countRef.current >= 3) {
        // Pattern complete!
        resetState();
        setOpen(true);
      } else {
        // Allow 2s between each of the 3 clicks
        t3.current = setTimeout(resetState, 2000);
      }
    }
  }, [resetState]);

  // ── Form handlers ──────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/admin/schedule?date=Jan+1,+2026`, {
        headers: { "x-admin-pin": pin },
      });
      if (res.status === 401) {
        setError("Неверный пароль");
        setLoading(false);
        return;
      }
      sessionStorage.setItem("adminPin", pin);
      window.location.href = "/admin";
    } catch {
      setError("Ошибка соединения");
      setLoading(false);
    }
  }, [pin]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setPin("");
    setError("");
  }, []);

  const rest = label.startsWith("©") ? label.slice(1) : label;

  return (
    <>
      <span>
        <span
          onClick={handleClick}
          style={{ cursor: "default", userSelect: "none", fontSize: "2em", lineHeight: 1 }}
        >©</span>{rest}
      </span>

      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div style={{
            background: "#fff", borderRadius: "16px", padding: "32px",
            width: "min(360px, 90vw)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <h2 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: "#0B1A3F" }}>
              Admin Panel
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#64748b" }}>
              HTRGroupTX · Введите пароль
            </p>
            <form onSubmit={handleSubmit}>
              <input
                autoFocus
                type="password"
                placeholder="Пароль"
                value={pin}
                onChange={e => { setPin(e.target.value); setError(""); }}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "10px 14px", borderRadius: "8px",
                  border: error ? "1.5px solid #ef4444" : "1.5px solid #cbd5e1",
                  fontSize: "15px", outline: "none", marginBottom: "8px",
                }}
              />
              {error && (
                <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#ef4444" }}>{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !pin}
                style={{
                  width: "100%", padding: "11px",
                  background: loading || !pin ? "#93c5fd" : "#1B6FE8",
                  color: "#fff", border: "none", borderRadius: "8px",
                  fontSize: "15px", fontWeight: 600,
                  cursor: loading || !pin ? "not-allowed" : "pointer",
                  marginBottom: "8px",
                }}
              >
                {loading ? "Проверка..." : "Войти"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  width: "100%", padding: "10px",
                  background: "transparent", color: "#64748b",
                  border: "1.5px solid #e2e8f0", borderRadius: "8px",
                  fontSize: "14px", cursor: "pointer",
                }}
              >
                Отмена
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
