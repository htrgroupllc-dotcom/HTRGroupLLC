import { useEffect } from "react";
import { useRoute } from "wouter";
import { Loader2 } from "lucide-react";

const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "https://htr-group-llc-appliance-repair.replit.app"
).replace(/\/$/, "");

/**
 * Redirects to Replit-hosted intake form (same booking fields, always opens).
 * Cloudflare _redirects also sends /book-call/* here for old SMS links.
 */
export default function VoiceBookCallPage() {
  const [, params] = useRoute("/book-call/:token");
  const token = params?.token ?? "";

  useEffect(() => {
    if (!token) return;
    window.location.replace(`${API_BASE}/api/intake-form/${encodeURIComponent(token)}`);
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-[#EFF6FF]">
      <Loader2 className="h-8 w-8 animate-spin text-[#1B6FE8]" />
      <p className="text-stone-600 mt-3 text-sm">Opening your appointment form…</p>
      {token ? (
        <p className="text-xs text-stone-400 mt-4 text-center max-w-xs">
          If nothing happens,{" "}
          <a
            href={`${API_BASE}/api/intake-form/${encodeURIComponent(token)}`}
            className="text-[#1B6FE8] font-semibold underline"
          >
            tap here
          </a>
          .
        </p>
      ) : null}
    </div>
  );
}
