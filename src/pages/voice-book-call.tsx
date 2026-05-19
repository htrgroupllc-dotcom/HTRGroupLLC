import { useEffect, useState, type ReactNode } from "react";
import { useRoute } from "wouter";
import { CheckCircle2, Loader2 } from "lucide-react";

type Slot = { date: string; time: string; label: string };

type IntakePayload = {
  ok: boolean;
  language?: string;
  phoneMasked?: string;
  partialNotes?: string;
  slots?: Slot[];
  completed?: boolean;
  error?: string;
};

export default function VoiceBookCallPage() {
  const [, params] = useRoute("/book-call/:token");
  const token = params?.token ?? "";
  const apiBase = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [lang, setLang] = useState("en");
  const [phoneMasked, setPhoneMasked] = useState("");
  const [done, setDone] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Houston");
  const [zip, setZip] = useState("");
  const [appliance, setAppliance] = useState("");
  const [brandModel, setBrandModel] = useState("");
  const [problem, setProblem] = useState("");
  const [selected, setSelected] = useState<Slot | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${apiBase}/api/voice-intake/${token}`)
      .then(async (r) => {
        const d = (await r.json()) as IntakePayload;
        if (!r.ok) throw new Error(d.error ?? "load_failed");
        if (d.completed) {
          setDone(true);
          return;
        }
        setSlots(d.slots ?? []);
        setLang(d.language ?? "en");
        setPhoneMasked(d.phoneMasked ?? "");
        if (d.partialNotes?.includes("Appliance:")) {
          const m = d.partialNotes.match(/Appliance:\s*([^;]+)/);
          if (m?.[1]) setAppliance(m[1].trim());
        }
      })
      .catch(() => setError("expired"))
      .finally(() => setLoading(false));
  }, [token, apiBase]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/voice-intake/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || undefined,
          street,
          city,
          zip,
          appliance,
          brandModel,
          problem,
          date: selected.date,
          time: selected.time,
          lang,
        }),
      });
      const d = (await res.json()) as IntakePayload & { slots?: Slot[] };
      if (res.status === 409 && d.slots) {
        setSlots(d.slots);
        setSelected(null);
        setError("That time was just taken. Please pick another option.");
        return;
      }
      if (!res.ok) throw new Error(d.error ?? "submit_failed");
      setDone(true);
    } catch {
      setError("Could not submit. Call (606) 660-6067.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        <p className="text-stone-600 mt-3">Loading…</p>
      </PageShell>
    );
  }

  if (done) {
    return (
      <PageShell>
        <CheckCircle2 className="h-14 w-14 text-green-600" />
        <h1 className="text-xl font-bold mt-4">Request received</h1>
        <p className="text-stone-600 text-center max-w-sm mt-2">
          Thank you! We will confirm your appointment shortly by text or phone.
        </p>
      </PageShell>
    );
  }

  if (error === "expired") {
    return (
      <PageShell>
        <h1 className="text-xl font-bold">Link expired</h1>
        <p className="text-stone-600 text-center max-w-sm mt-2">
          Please call us at <a href="tel:+16066606067" className="text-violet-700 font-semibold">(606) 660-6067</a>.
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell wide>
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-stone-900">Complete your appointment</h1>
        <p className="text-sm text-stone-500 mt-1">
          Hi-Tech Repair Group · after your phone call
          {phoneMasked ? ` · ${phoneMasked}` : ""}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Full name" value={name} onChange={setName} required />
          <Field label="Phone" value={phone} onChange={setPhone} placeholder="Best callback number" type="tel" />
          <Field label="Street address" value={street} onChange={setStreet} required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="City" value={city} onChange={setCity} required />
            <Field label="ZIP code" value={zip} onChange={setZip} required />
          </div>
          <Field label="Appliance" value={appliance} onChange={setAppliance} required placeholder="e.g. refrigerator" />
          <Field label="Brand & model" value={brandModel} onChange={setBrandModel} placeholder="e.g. Samsung RF28..." />
          <Field label="Problem" value={problem} onChange={setProblem} required multiline />

          <div>
            <p className="text-sm font-semibold text-stone-700 mb-2">Pick a time (3 available)</p>
            <div className="space-y-2">
              {slots.map((s) => (
                <button
                  key={`${s.date}-${s.time}`}
                  type="button"
                  onClick={() => setSelected(s)}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition ${
                    selected?.date === s.date && selected?.time === s.time
                      ? "border-violet-600 bg-violet-50 ring-1 ring-violet-600"
                      : "border-stone-200 hover:border-violet-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {error && error !== "expired" && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !selected}
            className="w-full rounded-xl bg-violet-600 text-white font-semibold py-3 disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </PageShell>
  );
}

function Field({
  label, value, onChange, required, placeholder, type = "text", multiline,
}: {
  label: string; value: string; onChange: (v: string) => void;
  required?: boolean; placeholder?: string; type?: string; multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-700">{label}{required ? " *" : ""}</span>
      {multiline ? (
        <textarea
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function PageShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-stone-50 ${wide ? "items-stretch" : ""}`}>
      {children}
    </div>
  );
}
