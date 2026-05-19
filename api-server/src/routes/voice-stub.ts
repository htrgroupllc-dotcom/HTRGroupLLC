import { Router } from "express";

/** Production voice AI runs on Replit (HTRGroupLLC1), not this repo. */
export const VOICE_API_BASE =
  process.env["VOICE_API_BASE"] ??
  "https://htr-group-llc-appliance-repair.replit.app";

const voiceStubRouter = Router();

voiceStubRouter.get("/voice/status", (_req, res) => {
  res.json({
    ok: false,
    message: "Voice API is hosted on Replit (HTRGroupLLC1).",
    use: `${VOICE_API_BASE}/api/voice/status`,
    twilioWebhook: `${VOICE_API_BASE}/api/voice/incoming`,
  });
});

voiceStubRouter.post("/voice/incoming", (_req, res) => {
  res.type("text/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>
     <Response>
       <Say voice="Polly.Joanna-Neural" language="en-US">
         Our phone assistant is on a dedicated line. Please call again in a moment or text us at six zero six six six zero six zero six seven.
       </Say>
       <Hangup/>
     </Response>`,
  );
});

voiceStubRouter.post("/voice/gather", (_req, res) => {
  res.type("text/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`,
  );
});

voiceStubRouter.post("/voice/call-status", (_req, res) => {
  res.status(200).send();
});

export default voiceStubRouter;
