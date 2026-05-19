import { Router, type Request, type Response } from "express";
import { buildConversationRelayTwiml } from "../voice/twiml-relay.js";

const voiceRouter = Router();

/** Incoming call → Twilio Conversation Relay (AI voice operator). */
export function handleVoiceIncoming(req: Request, res: Response): void {
  console.log(
    `[VOICE] Incoming ${req.body?.CallSid ?? "?"} from ${req.body?.From ?? "?"}`,
  );
  res.type("text/xml").send(buildConversationRelayTwiml(req));
}

voiceRouter.post("/voice/incoming", (req, res) => handleVoiceIncoming(req, res));

/** Twilio call-status callbacks (logging only). */
voiceRouter.post("/voice/call-status", (req, res) => {
  console.log(
    `[VOICE] Status ${req.body?.CallSid ?? "?"} → ${req.body?.CallStatus ?? "?"}`,
  );
  res.status(200).send();
});

voiceRouter.get("/voice/status", (_req, res) => {
  res.json({
    ok: true,
    mode: "conversation-relay",
    gemini: Boolean(
      process.env["AI_INTEGRATIONS_GEMINI_API_KEY"] &&
        process.env["AI_INTEGRATIONS_GEMINI_BASE_URL"],
    ),
    relayPath: "/api/voice/relay",
  });
});

export default voiceRouter;
