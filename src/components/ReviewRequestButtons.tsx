import React from "react";
import { MessageSquare, Mail, MessageCircle } from "lucide-react";

export type ReviewChannel = "sms" | "email" | "whatsapp";

export function reviewLoadingKey(bookingId: string, channel: ReviewChannel): string {
  return `${bookingId}:${channel}`;
}

interface Props {
  phone?: string | null;
  email?: string | null;
  loadingKey: string | null;
  bookingId: string;
  onSend: (channel: ReviewChannel) => void;
  labels: {
    sms: string;
    email: string;
    wa: string;
    sending: string;
  };
  layout?: "row" | "stack";
}

export default function ReviewRequestButtons({
  phone, email, loadingKey, bookingId, onSend, labels, layout = "row",
}: Props) {
  const hasPhone = !!(phone ?? "").trim();
  const hasEmail = !!(email ?? "").trim();
  if (!hasPhone && !hasEmail) return null;

  const btnClass = layout === "row"
    ? "flex-1 min-h-[40px] flex items-center justify-center gap-1 text-[11px] font-semibold rounded-lg border touch-manipulation disabled:opacity-50"
    : "w-full min-h-[40px] flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg border touch-manipulation disabled:opacity-50";

  const wrapClass = layout === "row"
    ? "flex gap-1.5 w-full"
    : "flex flex-col gap-1.5 w-full";

  const mkBtn = (
    channel: ReviewChannel,
    label: string,
    icon: React.ReactNode,
    enabled: boolean,
    colors: { bg: string; border: string; text: string },
  ) => {
    const key = reviewLoadingKey(bookingId, channel);
    const loading = loadingKey === key;
    return (
      <button
        type="button"
        disabled={!enabled || loading}
        onClick={() => onSend(channel)}
        className={btnClass}
        style={{
          background: enabled ? colors.bg : "#f5f5f4",
          borderColor: enabled ? colors.border : "#e7e5e4",
          color: enabled ? colors.text : "#a8a29e",
          cursor: !enabled ? "not-allowed" : loading ? "wait" : "pointer",
        }}
        title={enabled ? label : undefined}
      >
        {icon}
        {loading ? labels.sending : label}
      </button>
    );
  };

  return (
    <div className={wrapClass}>
      {mkBtn("sms", labels.sms, <MessageSquare className="w-3.5 h-3.5 shrink-0" />, hasPhone, {
        bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8",
      })}
      {mkBtn("email", labels.email, <Mail className="w-3.5 h-3.5 shrink-0" />, hasEmail, {
        bg: "#ecfdf5", border: "#a7f3d0", text: "#047857",
      })}
      {mkBtn("whatsapp", labels.wa, <MessageCircle className="w-3.5 h-3.5 shrink-0" />, hasPhone, {
        bg: "#fffbeb", border: "#fcd34d", text: "#b45309",
      })}
    </div>
  );
}
