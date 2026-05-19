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
  if (ws.readyState !== ws.OPEN) return;
  ws.send(JSON.stringify({ type: "text", token, last, interruptible: true }));
}

function speakReply(ws: WebSocket, text: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  sendText(ws, trimmed, true);
}

function validateTwilioWs(req: IncomingMessage): boolean {
  if (process.env["VOICE_RELAY_SKIP_SIGNATURE"] === "1") {
    console.warn("[VOICE-WS] Signature check SKIPPED (VOICE_RELAY_SKIP_SIGNATURE=1)");
    return true;
  }
  const token = process.env["TWILIO_AUTH_TOKEN"];
  if (!token) {
    console.warn("[VOICE-WS] No TWILIO_AUTH_TOKEN — allowing connection");
    return true;
  }
  const signature = req.headers["x-twilio-signature"] as string | undefined;
  if (!signature) {
    console.warn("[VOICE-WS] Missing X-Twilio-Signature");
    return false;
  }
  const host =
    (req.headers["x-forwarded-host"] as string) ??
    req.headers.host ??
    "localhost";
  const proto = (req.headers["x-forwarded-proto"] as string) ?? "https";
  const url = `${proto}://${host}${req.url ?? ""}`;
  const ok = twilio.validateRequest(token, signature, url, {});
  if (!ok) console.warn(`[VOICE-WS] Bad signature for ${url}`);
  return ok;
}

export function handleRelayConnection(ws: WebSocket, req: IncomingMessage): void {
  console.log(`[VOICE-WS] Upgrade ${req.url ?? ""}`);

  if (!validateTwilioWs(req)) {
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
      console.log(`[VOICE-WS] ${callSid || "new"} msg=${type}`);

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
        console.log(`[VOICE-WS] Setup OK ${callSid} from ${from}`);
        return;
      }

      if (!session || !callSid) return;

      if (type === "prompt") {
        if (msg["last"] !== true) return;
        const voicePrompt = String(msg["voicePrompt"] ?? "").trim();
        if (!voicePrompt || session.processing || session.booked) return;

        session.processing = true;
        console.log(`[VOICE-WS] User: "${voicePrompt.slice(0, 100)}"`);

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
              ? `${result.spokenReply} Your appointment is booked. We will call you within fifteen minutes to confirm. Thank you for calling H T R Group Texas. Goodbye!`
              : `${result.spokenReply} I could not save the appointment. Please visit htrgrouptx dot com or call back shortly.`;
            speakReply(ws, closing);
            setTimeout(() => {
              if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type: "end" }));
              }
              sessions.delete(callSid);
            }, 12000);
          } else {
            speakReply(ws, result.spokenReply);
          }
        } catch (err) {
          console.error("[VOICE-WS] Agent error:", err);
          speakReply(
            ws,
            "I'm sorry, I had a brief technical issue. Could you please repeat that?",
          );
        } finally {
          session.processing = false;
        }
        return;
      }

      if (type === "error") {
        console.error("[VOICE-WS] Relay error:", msg["description"]);
      }
    })();
  });

  ws.on("close", () => {
    if (callSid) sessions.delete(callSid);
    console.log(`[VOICE-WS] Closed ${callSid || "?"}`);
  });

  ws.on("error", (err) => {
    console.error("[VOICE-WS] Socket error:", err);
  });
}
