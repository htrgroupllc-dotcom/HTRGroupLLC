import type { Request } from "express";
import { webhookBase } from "./twiml-relay.js";

const VOICE = "Polly.Joanna-Neural";
const HINTS =
  "refrigerator, fridge, washer, dryer, dishwasher, Houston, Texas, HTR Group, appointment";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function gatherActionUrl(req: Request): string {
  const base = webhookBase(req);
  const legacy =
    req.originalUrl?.startsWith("/voice/") && !req.originalUrl.startsWith("/api/");
  return `${base}${legacy ? "/voice/gather" : "/api/voice/gather"}`;
}

/** First ring — guaranteed speech (no Conversation Relay required). */
export function buildGatherIncomingTwiml(req: Request): string {
  const action = gatherActionUrl(req);
  const greeting =
    process.env["VOICE_WELCOME_GREETING"] ??
    "Hi there! Thanks for calling H T R Group Texas appliance repair. I'm Sarah. How can I help you today?";

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" language="en-US" speechTimeout="auto" timeout="6"
    action="${xmlEscape(action)}" method="POST" hints="${xmlEscape(HINTS)}">
    <Say voice="${VOICE}" language="en-US">${xmlEscape(greeting)}</Say>
  </Gather>
  <Say voice="${VOICE}">I didn't hear you. Let me try again.</Say>
  <Redirect method="POST">${xmlEscape(`${action}?noinput=1`)}</Redirect>
</Response>`;
}

export function buildGatherContinueTwiml(
  req: Request,
  spoken: string,
  hangup = false,
): string {
  const action = gatherActionUrl(req);
  const say = xmlEscape(spoken.slice(0, 1200));

  if (hangup) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${VOICE}" language="en-US">${say}</Say>
  <Hangup/>
</Response>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" language="en-US" speechTimeout="auto" timeout="7"
    action="${xmlEscape(action)}" method="POST" hints="${xmlEscape(HINTS)}">
    <Say voice="${VOICE}" language="en-US">${say}</Say>
  </Gather>
  <Say voice="${VOICE}">Are you still there?</Say>
  <Redirect method="POST">${xmlEscape(`${action}?noinput=1`)}</Redirect>
</Response>`;
}
