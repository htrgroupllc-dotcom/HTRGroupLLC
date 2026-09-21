import { useEffect } from "react";
import { useRoute } from "wouter";
import { Loader2 } from "lucide-react";

const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "https://htr-group-llc-appliance-repair.replit.app"
).replace(/\/$/, "");

/**
 * Redirects to Replit-hosted public estimate HTML (no CRM login).
 * Cloudflare _redirects also sends /estimate/* to the API.
 */
export default function EstimateViewPage() {
  const [, params] = useRoute("/estimate/:token");
  const token = params?.token ?? "";

  useEffect(() => {
    if (!token) return;
    window.location.replace(`${API_BASE}/api/estimate/${encodeURIComponent(token)}`);
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-[#EFF6FF]">
      <Loader2 className="h-8 w-8 animate-spin text-[#1B6FE8]" />
      <p className="text-stone-600 mt-3 text-sm">Opening your estimate…</p>
      {token ? (
        <p className="text-xs text-stone-400 mt-4 text-center max-w-xs">
          If nothing happens,{" "}
          <a
            href={`${API_BASE}/api/estimate/${encodeURIComponent(token)}`}
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
