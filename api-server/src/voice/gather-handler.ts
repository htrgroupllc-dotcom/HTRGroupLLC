import type { Request, Response } from "express";
import type { BookingState } from "./booking-state.js";
import { runOperatorTurn } from "./operator-agent.js";
import { savePhoneBooking } from "./save-booking.js";
import { buildGatherContinueTwiml, buildGatherIncomingTwiml } from "./twiml-gather.js";

interface GatherSession {
  state: BookingState;
  history: Array<{ role: "user" | "model"; text: string }>;
  from: string;
}

const sessions = new Map<string, GatherSession>();

function normalizePhone(from: string): string {
  const digits = from.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return from;
}

export function handleGatherIncoming(req: Request, res: Response): void {
  const callSid = String(req.body?.CallSid ?? "");
  const from = normalizePhone(String(req.body?.From ?? ""));
  if (callSid) {
    sessions.set(callSid, { state: { phone: from }, history: [], from });
  }
  console.log(`[VOICE-GATHER] Incoming ${callSid} from ${from}`);
  res.type("text/xml").send(buildGatherIncomingTwiml(req));
}

export async function handleGatherTurn(req: Request, res: Response): Promise<void> {
  const callSid = String(req.body?.CallSid ?? "");
  const from = normalizePhone(String(req.body?.From ?? ""));
  const speech = String(req.body?.SpeechResult ?? "").trim();
  const noinput = req.query["noinput"] === "1";

  let sess = sessions.get(callSid);
  if (!sess) {
    sess = { state: { phone: from }, history: [], from };
    sessions.set(callSid, sess);
  }

  console.log(
    `[VOICE-GATHER] ${callSid} speech="${speech.slice(0, 80)}" noinput=${noinput}`,
  );

  if (noinput && !speech) {
    res.type("text/xml").send(
      buildGatherContinueTwiml(
        req,
        "Sorry, I didn't catch that. Please tell me what appliance needs repair.",
      ),
    );
    return;
  }

  if (!speech) {
    res.type("text/xml").send(
      buildGatherContinueTwiml(req, "Could you please repeat that for me?"),
    );
    return;
  }

  try {
    const result = await runOperatorTurn(
      speech,
      sess.state,
      sess.from,
      sess.history,
    );
    sess.state = result.state;
    sess.history.push({ role: "user", text: speech });
    sess.history.push({ role: "model", text: result.spokenReply });

    if (result.shouldBook) {
      const id = await savePhoneBooking(sess.state);
      sessions.delete(callSid);
      const msg = id
        ? `${result.spokenReply} Your visit is booked. We'll call you within fifteen minutes to confirm. Thank you for calling H T R Group Texas. Goodbye!`
        : `${result.spokenReply} I couldn't save the booking. Please visit htrgrouptx.com. Goodbye!`;
      res.type("text/xml").send(buildGatherContinueTwiml(req, msg, true));
      return;
    }

    res.type("text/xml").send(buildGatherContinueTwiml(req, result.spokenReply));
  } catch (err) {
    console.error("[VOICE-GATHER] error:", err);
    res.type("text/xml").send(
      buildGatherContinueTwiml(
        req,
        "I'm sorry, a quick technical hiccup. Please tell me again what appliance needs service.",
      ),
    );
  }
}
