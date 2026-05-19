import { Router, type Request, type Response } from "express";
import { buildConversationRelayTwiml } from "../voice/twiml-relay.js";

const voiceRouter = Router();

export function handleVoiceIncoming(req: Request, res: Response): void {
  const twiml = buildConversationRelayTwiml(req);
  console.log(`[VOICE] Incoming ${req.body?.CallSid ?? "?"} from ${req.body?.From ?? "?"}`);
  res.type("text/xml").send(twiml);
}

voiceRouter.post("/voice/incoming", (req, res) => handleVoiceIncoming(req, res));

voiceRouter.post("/voice/call-status", (req, res) => {
  console.log(
    `[VOICE] Status ${req.body?.CallSid ?? "?"} → ${req.body?.CallStatus ?? "?"}`,
  );
  res.status(200).send();
});

voiceRouter.get("/voice/status", (req, res) => {
  res.json({
    ok: true,
    mode: "conversation-relay",
    wssUrl: buildConversationRelayTwiml(req).match(/url="(wss:[^"]+)"/)?.[1],
    gemini: Boolean(
      process.env["AI_INTEGRATIONS_GEMINI_API_KEY"] &&
        process.env["AI_INTEGRATIONS_GEMINI_BASE_URL"],
    ),
  });
});

export default voiceRouter;
