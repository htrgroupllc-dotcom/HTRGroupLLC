import { useState, useEffect, useCallback } from "react";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
// Derive option JSON types from the library function signatures — no separate @simplewebauthn/types needed
type RegistrationOptionsJSON   = Parameters<typeof startRegistration>[0]["optionsJSON"];
type AuthenticationOptionsJSON = Parameters<typeof startAuthentication>[0]["optionsJSON"];

type RegisterOptionsResponse = RegistrationOptionsJSON   & { challengeId: string };
type LoginOptionsResponse    = AuthenticationOptionsJSON & { challengeId: string };

const API = (
  import.meta.env.VITE_API_BASE as string | undefined
) ?? "https://htr-group-llc-appliance-repair.replit.app";
const TOKEN_KEY  = "adminAuthToken";
const FID_KEY    = "htr_fid_cred_id"; // localStorage: credential ID for this device

function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
}
function saveToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_KEY, token);
}
function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
function getLocalCredId(): string | null { return localStorage.getItem(FID_KEY); }
function saveLocalCredId(id: string)     { localStorage.setItem(FID_KEY, id); }

async function isTokenValid(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/auth/webauthn/credentials`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function hasPlatformBiometrics(): Promise<boolean> {
  try {
    return !!(
      window.PublicKeyCredential &&
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    );
  } catch {
    return false;
  }
}

interface AuthGateProps {
  children: React.ReactNode;
  title?: string;
}

type Screen = "checking" | "login" | "register-fid" | "authenticated";

export default function AuthGate({ children, title = "HTRGroupTX" }: AuthGateProps) {
  const [screen, setScreen]         = useState<Screen>("checking");
  const [pin, setPin]               = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [hasBiometrics, setHasBio]  = useState(false);
  // True only when THIS device has a registered credential (checked via localStorage)
  const [deviceHasFid, setDevFid]   = useState(false);

  useEffect(() => {
    async function init() {
      const token = getToken();
      if (token && await isTokenValid(token)) {
        setScreen("authenticated");
        return;
      }
      clearToken();

      const [bio] = await Promise.all([hasPlatformBiometrics()]);
      setHasBio(bio);

      // Face ID button only appears when this device has a locally-stored credential
      const localCredId = getLocalCredId();
      setDevFid(bio && !!localCredId);

      setScreen("login");
    }
    void init();
  }, []);

  const handlePin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      const data = await res.json().catch(() => ({})) as { error?: string; code?: string; token?: string };
      if (!res.ok) {
        if (data.code === "admin_pin_missing") {
          setError("На сервере не задан ADMIN_PIN. Replit → Secrets → ADMIN_PIN → Publish.");
        } else if (data.code === "session_secret_missing") {
          setError("На сервере не задан SESSION_SECRET. Replit → Secrets → Publish.");
        } else if (res.status >= 500) {
          setError(data.error ?? "Ошибка сервера. Проверьте Replit Secrets.");
        } else {
          setError("Неверный пароль");
        }
        return;
      }
      if (!data.token) {
        setError("Ошибка сервера: нет токена");
        return;
      }
      saveToken(data.token);
      const trimmed = pin.trim();
      sessionStorage.setItem("adminPin", trimmed);
      localStorage.setItem("adminPin", trimmed);

      // Offer Face ID registration only if device supports biometrics
      // and doesn't already have a registered credential on this device
      if (hasBiometrics && !getLocalCredId()) {
        setScreen("register-fid");
      } else {
        setScreen("authenticated");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  }, [pin, hasBiometrics]);

  const handleFaceID = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const localCredId = getLocalCredId();
      const optRes = await fetch(`${API}/api/auth/webauthn/login-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localCredId ? { credentialId: localCredId } : {}),
      });
      if (!optRes.ok) throw new Error("Failed to get options");
      const { challengeId, ...optionsJSON } = await optRes.json() as LoginOptionsResponse;

      const credential = await startAuthentication({ optionsJSON });

      const verRes = await fetch(`${API}/api/auth/webauthn/login-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: credential, challengeId }),
      });
      if (!verRes.ok) throw new Error("Verification failed");
      const data = await verRes.json() as { token: string };
      saveToken(data.token);
      setScreen("authenticated");
    } catch {
      setError("Face ID не прошёл. Попробуйте пароль.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRegisterFaceID = useCallback(async () => {
    setLoading(true);
    setError("");
    const token = getToken();
    if (!token) { setLoading(false); return; }
    try {
      const optRes = await fetch(`${API}/api/auth/webauthn/register-options`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!optRes.ok) throw new Error("Failed to get options");
      const { challengeId, ...optionsJSON } = await optRes.json() as RegisterOptionsResponse;

      const credential = await startRegistration({ optionsJSON });

      const deviceLabel = /iPhone|iPad/.test(navigator.userAgent)
        ? "iPhone"
        : /Android/.test(navigator.userAgent)
        ? "Android"
        : "Desktop";

      const verRes = await fetch(`${API}/api/auth/webauthn/register-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ response: credential, label: deviceLabel, challengeId }),
      });
      if (!verRes.ok) throw new Error("Registration failed");
      const data = await verRes.json() as { credentialId: string };
      // Save credential ID to localStorage so this device shows Face ID button next time
      if (data.credentialId) saveLocalCredId(data.credentialId);

      setScreen("authenticated");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("cancel") || msg.includes("abort") || msg.includes("NotAllowed")) {
        // User cancelled — just proceed to authenticated
      } else {
        setError("Не удалось зарегистрировать Face ID");
      }
      setScreen("authenticated");
    } finally {
      setLoading(false);
    }
  }, []);

  if (screen === "checking") {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "#0B1A3F",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 99999,
      }}>
        <div style={{
          width: 40, height: 40, border: "3px solid #1B6FE8",
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (screen === "authenticated") {
    return <>{children}</>;
  }

  if (screen === "register-fid") {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "#0B1A3F",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 99999, padding: "20px",
      }}>
        <div style={{
          background: "#fff", borderRadius: "20px", padding: "36px 28px",
          width: "min(380px, 100%)", textAlign: "center",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🔒</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#0B1A3F" }}>
            Включить Face ID?
          </h2>
          <p style={{ margin: "0 0 28px", fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>
            Вход одним касанием без пароля.<br />
            Ваше лицо / отпечаток не покидает устройство.
          </p>
          <button
            onClick={() => void handleRegisterFaceID()}
            disabled={loading}
            style={{
              width: "100%", padding: "13px", marginBottom: 10,
              background: loading ? "#93c5fd" : "#1B6FE8",
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <span style={{ fontSize: 20 }}>👤</span>
            {loading ? "Регистрация..." : "Включить Face ID / Fingerprint"}
          </button>
          <button
            onClick={() => setScreen("authenticated")}
            disabled={loading}
            style={{
              width: "100%", padding: "12px",
              background: "transparent", color: "#64748b",
              border: "1.5px solid #e2e8f0", borderRadius: 10,
              fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Пропустить
          </button>
          {error && <p style={{ marginTop: 10, color: "#ef4444", fontSize: 13 }}>{error}</p>}
        </div>
      </div>
    );
  }

  // Login screen
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0B1A3F",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 99999, padding: "20px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "36px 28px",
        width: "min(380px, 100%)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🔐</div>
          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#0B1A3F" }}>
            {title}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            HTRGroupTX · Защищённый раздел
          </p>
        </div>

        {/* Face ID button only shown when THIS device has a registered credential */}
        {deviceHasFid && (
          <button
            onClick={() => void handleFaceID()}
            disabled={loading}
            style={{
              width: "100%", padding: "13px", marginBottom: 16,
              background: loading ? "#f1f5f9" : "#0B1A3F",
              color: loading ? "#94a3b8" : "#fff",
              border: "none", borderRadius: 10,
              fontSize: 15, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <span style={{ fontSize: 20 }}>👤</span>
            {loading ? "Проверка..." : "Войти через Face ID"}
          </button>
        )}

        <form onSubmit={(e) => void handlePin(e)}>
          <div style={{ marginBottom: 8 }}>
            <input
              type="password"
              placeholder="Пароль"
              value={pin}
              autoFocus={!deviceHasFid}
              onChange={e => { setPin(e.target.value); setError(""); }}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "11px 14px", borderRadius: 10,
                border: error ? "1.5px solid #ef4444" : "1.5px solid #cbd5e1",
                fontSize: 15, outline: "none",
              }}
            />
          </div>
          {error && <p style={{ margin: "0 0 8px", fontSize: 13, color: "#ef4444" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !pin}
            style={{
              width: "100%", padding: "12px",
              background: loading || !pin ? "#93c5fd" : "#1B6FE8",
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: 15, fontWeight: 600,
              cursor: loading || !pin ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Проверка..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}

