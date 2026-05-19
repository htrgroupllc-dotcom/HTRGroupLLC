import type { IncomingMessage } from "http";
import type { WebSocket } from "ws";
import twilio from "twilio";
import type { BookingState } from "./booking-state.js";
import { runOperatorTurn } from "./operator-agent.js";
import { savePhoneBooking } from "./save-booking.js";

interface RelaySession {
  callSid: string;
  from: string;
  state: BookingState;
  history: Array<{ role: "user" | "model"; text: string }>;
  processing: boolean;
  booked: boolean;
}

const sessions = new Map<string, RelaySession>();

function normalizePhone(from: string): string {
  const digits = from.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return from;
}

function sendText(ws: WebSocket, token: string, last: boolean): void {
  ws.send(
    JSON.stringify({
      type: "text",
      token,
      last,
      interruptible: true,
      preemptible: false,
    }),
  );
}

/** Stream reply in sentence chunks for lower perceived latency. */
function speakReply(ws: WebSocket, text: string): void {
  const parts = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  parts.forEach((part, i) => {
    const chunk = part.trim();
    if (!chunk) return;
    const suffix = i < parts.length - 1 ? " " : "";
    sendText(ws, chunk + suffix, i === parts.length - 1);
  });
}

function validateTwilioWs(req: IncomingMessage): boolean {
  const token = process.env["TWILIO_AUTH_TOKEN"];
  if (!token) {
    console.warn("[VOICE-WS] TWILIO_AUTH_TOKEN missing — skipping signature check");
    return true;
  }
  const signature = req.headers["x-twilio-signature"] as string | undefined;
  if (!signature) return false;

  const host =
    (req.headers["x-forwarded-host"] as string) ??
    req.headers.host ??
    "localhost";
  const proto = (req.headers["x-forwarded-proto"] as string) ?? "https";
  const url = `${proto}://${host}${req.url ?? ""}`;

  return twilio.validateRequest(token, signature, url, {});
}

export function handleRelayConnection(ws: WebSocket, req: IncomingMessage): void {
  if (!validateTwilioWs(req)) {
    console.warn("[VOICE-WS] Invalid Twilio signature");
    ws.close(1008, "Unauthorized");
    return;
  }

  let callSid = "";
  let session: RelaySession | undefined;

  ws.on("message", (raw) => {
    void (async () => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(String(raw)) as Record<string, unknown>;
      } catch {
        return;
      }

      const type = msg["type"] as string;

      if (type === "setup") {
        callSid = (msg["callSid"] as string) ?? "";
        const from = normalizePhone((msg["from"] as string) ?? "");
        session = {
          callSid,
          from,
          state: { phone: from },
          history: [],
          processing: false,
          booked: false,
        };
        sessions.set(callSid, session);
        console.log(`[VOICE-WS] Setup ${callSid} from ${from}`);
        return;
      }

      if (!session || !callSid) return;

      if (type === "interrupt") {
        console.log(`[VOICE-WS] Interrupt ${callSid}`);
        return;
      }

      if (type === "prompt") {
        const last = msg["last"] === true;
        if (!last) return;

        const voicePrompt = (msg["voicePrompt"] as string) ?? "";
        if (!voicePrompt.trim() || session.processing || session.booked) return;

        session.processing = true;
        console.log(`[VOICE-WS] Prompt ${callSid}: "${voicePrompt.slice(0, 80)}"`);

        try {
          const result = await runOperatorTurn(
            voicePrompt,
            session.state,
            session.from,
            session.history,
          );

          session.state = result.state;
          session.history.push({ role: "user", text: voicePrompt });
          session.history.push({ role: "model", text: result.spokenReply });

          if (result.shouldBook) {
            const id = await savePhoneBooking(session.state);
            session.booked = true;
            const closing = id
              ? `${result.spokenReply} Your appointment is booked. We'll call you within fifteen minutes to confirm. Thank you for calling H T R Group Texas. Goodbye!`
              : `${result.spokenReply} I'm having trouble saving your appointment. Please visit htrgrouptx.com or call back in a few minutes.`;
            speakReply(ws, closing);
            setTimeout(() => {
              ws.send(JSON.stringify({ type: "end" }));
              sessions.delete(callSid);
            }, 8000);
          } else {
            speakReply(ws, result.spokenReply);
          }
        } catch (err) {
          console.error("[VOICE-WS] Agent error:", err);
          speakReply(
            ws,
            "I'm sorry, I'm having a brief technical issue. Could you repeat that for me?",
          );
        } finally {
          session.processing = false;
        }
      }

      if (type === "error") {
        console.error("[VOICE-WS] Relay error:", msg["description"]);
      }
    })();
  });

  ws.on("close", () => {
    if (callSid) sessions.delete(callSid);
    console.log(`[VOICE-WS] Closed ${callSid || "unknown"}`);
  });
}
