import React, { useEffect, useMemo, useState } from "react";
import { X, PlusCircle, Pencil } from "lucide-react";
import { formatBookingDate } from "@/lib/calendarUtils";
import type { BookingBiz } from "@/lib/adminSiteConfig";

const ACCENT = "#1B6FE8";

export interface CalendarBookingEvent {
  id: string;
  client_name: string;
  phone?: string;
  address?: string;
  appliance?: string;
  brand_model?: string;
  status: string;
  business_type?: string;
  preferred_date?: string;
  preferred_time?: string;
  message?: string;
}

export interface CalendarBookingFormLabels {
  createTitle: string;
  editTitle: string;
  timeReq: string;
  nameReq: string;
  phoneReq: string;
  address: string;
  equipmentAppliance: string;
  equipmentDental: string;
  problemAppliance: string;
  problemDental: string;
  bizType: string;
  bizAppliance: string;
  bizDental: string;
  cancel: string;
  createBtn: string;
  saveBtn: string;
  saving: string;
  errNamePhone: string;
  errSlotTaken: string;
  errServer: string;
  savedOk: string;
  next: string;
}

interface Props {
  open: boolean;
  mode: "create" | "edit";
  day: Date;
  event?: CalendarBookingEvent | null;
  defaultBiz: BookingBiz;
  showBizPicker: boolean;
  apiBase: string;
  authHeaders: () => Record<string, string>;
  actorMode: "admin" | "employee";
  timeSlots: string[];
  labels: CalendarBookingFormLabels;
  onClose: () => void;
  onSaved: () => void;
}

function FieldInput({
  label, value, onChange, placeholder, type = "text", required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 min-h-[44px] touch-manipulation"
        style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
      />
    </div>
  );
}

export default function CalendarBookingFormModal({
  open, mode, day, event, defaultBiz, showBizPicker, apiBase, authHeaders,
  actorMode, timeSlots, labels, onClose, onSaved,
}: Props) {
  const [time, setTime] = useState(timeSlots[0] ?? "9:00 AM");
  const [biz, setBiz] = useState<BookingBiz>(defaultBiz);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [equipment, setEquipment] = useState("");
  const [problem, setProblem] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"time" | "details">("time");

  const dateLabel = useMemo(() => formatBookingDate(day), [day]);
  const isDental = biz === "dental";

  useEffect(() => {
    if (!open) return;
    setStep("time");
    setError("");
    setSaving(false);
    setBiz(defaultBiz);
    if (mode === "edit" && event) {
      setTime(event.preferred_time ?? timeSlots[0] ?? "9:00 AM");
      setName(event.client_name ?? "");
      setPhone(event.phone ?? "");
      setAddress(event.address ?? "");
      setEquipment([event.appliance, event.brand_model].filter(Boolean).join(" — "));
      setProblem(event.message ?? "");
      setBiz(event.business_type === "dental" ? "dental" : "appliance");
      setStep("details");
    } else {
      setTime(timeSlots[0] ?? "9:00 AM");
      setName("");
      setPhone("");
      setAddress("");
      setEquipment("");
      setProblem("");
    }
  }, [open, mode, event, defaultBiz, timeSlots]);

  if (!open) return null;

  const createUrl = actorMode === "admin"
    ? `${apiBase}/api/admin/booking`
    : `${apiBase}/api/employee/booking`;
  const editUrl = actorMode === "admin"
    ? `${apiBase}/api/admin/edit-booking`
    : `${apiBase}/api/employee/edit-booking`;

  const submit = async () => {
    if (!name.trim() || !phone.trim() || !time.trim()) {
      setError(labels.errNamePhone);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = mode === "edit" && event
        ? {
            id: event.id,
            name: name.trim(),
            phone: phone.trim(),
            email: "",
            address: address.trim(),
            appliance: equipment.trim(),
            date: dateLabel,
            time: time.trim(),
            message: problem.trim(),
            business_type: biz,
          }
        : {
            name: name.trim(),
            phone: phone.trim(),
            email: "",
            address: address.trim(),
            appliance: equipment.trim(),
            date: dateLabel,
            time: time.trim(),
            message: problem.trim(),
            business_type: biz,
          };

      const r = await fetch(mode === "edit" ? editUrl : createUrl, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json().catch(() => ({})) as { error?: string; message?: string };
      if (r.status === 409 || d.error === "slot_taken") {
        setError(labels.errSlotTaken);
        return;
      }
      if (!r.ok) {
        setError(d.message ?? d.error ?? labels.errServer);
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError(labels.errServer);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end md:items-center justify-center bg-black/45 px-0 md:px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[92dvh] overflow-y-auto"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mt-3 md:hidden" />
        <div className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              {mode === "edit"
                ? <Pencil className="w-5 h-5 text-violet-600 shrink-0" />
                : <PlusCircle className="w-5 h-5 shrink-0" style={{ color: ACCENT }} />}
              <h3 className="font-bold text-stone-800 text-base truncate">
                {mode === "edit" ? labels.editTitle : labels.createTitle}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-stone-100 shrink-0"
            >
              <X className="w-5 h-5 text-stone-400" />
            </button>
          </div>
          <p className="text-xs text-stone-400 mb-4">{dateLabel}</p>

          {step === "time" ? (
            <>
              <p className="text-xs font-semibold text-stone-600 mb-2">{labels.timeReq}</p>
              <div className="grid grid-cols-3 gap-1.5 max-h-[240px] overflow-y-auto mb-4">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`min-h-[44px] text-[11px] font-semibold rounded-lg border touch-manipulation ${
                      time === slot
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-stone-700 border-stone-200 active:bg-blue-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep("details")}
                className="w-full min-h-[44px] py-2.5 rounded-lg text-white text-sm font-semibold touch-manipulation"
                style={{ background: ACCENT }}
              >
                {labels.next}
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">{labels.timeReq}</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm min-h-[44px] bg-white"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              {showBizPicker && (
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">{labels.bizType}</label>
                  <select
                    value={biz}
                    onChange={(e) => setBiz(e.target.value as BookingBiz)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm min-h-[44px] bg-white"
                  >
                    <option value="appliance">{labels.bizAppliance}</option>
                    <option value="dental">{labels.bizDental}</option>
                  </select>
                </div>
              )}

              <FieldInput label={labels.nameReq} value={name} onChange={setName} placeholder="John Smith" required />
              <FieldInput label={labels.phoneReq} value={phone} onChange={setPhone} placeholder="(346) 000-0000" type="tel" required />
              <FieldInput label={labels.address} value={address} onChange={setAddress} placeholder="123 Main St, Houston, TX" />
              <FieldInput
                label={isDental ? labels.equipmentDental : labels.equipmentAppliance}
                value={equipment}
                onChange={setEquipment}
                placeholder={isDental ? "Dental chair, autoclave…" : "Washer, dryer, fridge…"}
              />
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">
                  {isDental ? labels.problemDental : labels.problemAppliance}
                </label>
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  rows={3}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 min-h-[80px]"
                  style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => (mode === "create" ? setStep("time") : onClose())}
                  className="flex-1 min-h-[44px] py-2 rounded-lg border border-stone-200 text-sm font-semibold text-stone-600 touch-manipulation"
                >
                  {labels.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={saving}
                  className="flex-1 min-h-[44px] py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60 touch-manipulation"
                  style={{ background: mode === "edit" ? "#7c3aed" : ACCENT }}
                >
                  {saving ? labels.saving : mode === "edit" ? labels.saveBtn : labels.createBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
