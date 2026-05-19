import { Router, type Request, type Response } from "express";
import { handleGatherIncoming, handleGatherTurn } from "../voice/gather-handler.js";
import { buildConversationRelayTwiml } from "../voice/twiml-relay.js";
import { webhookBase } from "../voice/twiml-relay.js";

const voiceRouter = Router();

/** gather = Say+Speech (works everywhere). relay = Conversation Relay + WebSocket. */
function voiceMode(): "gather" | "relay" {
  const m = (process.env["VOICE_MODE"] ?? "gather").toLowerCase();
  return m === "relay" ? "relay" : "gather";
}

export function handleVoiceIncoming(req: Request, res: Response): void {
  console.log(
    `[VOICE] Incoming ${req.body?.CallSid ?? "?"} from ${req.body?.From ?? "?"} mode=${voiceMode()}`,
  );
  if (voiceMode() === "relay") {
    res.type("text/xml").send(buildConversationRelayTwiml(req));
    return;
  }
  handleGatherIncoming(req, res);
}

voiceRouter.post("/voice/incoming", (req, res) => handleVoiceIncoming(req, res));

voiceRouter.post("/voice/gather", (req, res) => {
  void handleGatherTurn(req, res);
});

voiceRouter.post("/voice/call-status", (req, res) => {
  console.log(
    `[VOICE] Status ${req.body?.CallSid ?? "?"} → ${req.body?.CallStatus ?? "?"}`,
  );
  res.status(200).send();
});

voiceRouter.get("/voice/status", (req, res) => {
  const mode = voiceMode();
  res.json({
    ok: true,
    mode,
    baseUrl: webhookBase(req),
    gatherUrl: `${webhookBase(req)}/api/voice/gather`,
    gemini: Boolean(
      process.env["AI_INTEGRATIONS_GEMINI_API_KEY"] &&
        process.env["AI_INTEGRATIONS_GEMINI_BASE_URL"],
    ),
    hint:
      mode === "gather"
        ? "Uses Twilio Say+Speech — should speak immediately on call"
        : "Uses Conversation Relay — needs WebSocket + Twilio AI enable",
  });
});

/** Quick test: always returns audible Say (open in browser as POST won't work — use curl). */
voiceRouter.get("/voice/test-say", (_req, res) => {
  res.type("text/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">H T R Group Texas voice test. If you hear this, Twilio can play audio.</Say>
  <Hangup/>
</Response>`);
});

export default voiceRouter;
