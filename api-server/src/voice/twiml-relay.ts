import type { Request } from "express";

/** STT hints — brands, appliances, Houston area (improves Texas / industry recognition). */
const STT_HINTS = [
  "HTR Group",
  "HTRGroupTX",
  "Houston",
  "Texas",
  "refrigerator",
  "fridge",
  "freezer",
  "washer",
  "washing machine",
  "dryer",
  "dishwasher",
  "oven",
  "stove",
  "range",
  "microwave",
  "ice maker",
  "appliance repair",
  "Sub-Zero",
  "Wolf",
  "Viking",
  "Thermador",
  "KitchenAid",
  "Whirlpool",
  "Maytag",
  "GE",
  "Samsung",
  "LG",
  "Frigidaire",
  "Kenmore",
  "Bosch",
  "Miele",
  "Katy",
  "Sugar Land",
  "Pearland",
  "Cypress",
  "Spring",
  "The Woodlands",
  "Pasadena",
  "Baytown",
  "Humble",
  "zip code",
  "appointment",
  "schedule",
  "y'all",
].join(",");

export function webhookBase(req: Request): string {
  const env = process.env["PUBLIC_BASE_URL"] ?? process.env["REPLIT_DEV_DOMAIN"];
  if (env) {
    const base = env.startsWith("http") ? env : `https://${env}`;
    return base.replace(/\/$/, "");
  }
  const proto = (req.headers["x-forwarded-proto"] as string) ?? req.protocol ?? "https";
  const host = (req.headers["x-forwarded-host"] as string) ?? req.headers.host ?? "";
  return `${proto}://${host}`.replace(/\/$/, "");
}

export function relayWebSocketUrl(req: Request): string {
  const override = process.env["VOICE_RELAY_WSS_URL"];
  if (override) return override.replace(/\/$/, "");
  const base = webhookBase(req);
  const legacy =
    req.originalUrl?.startsWith("/voice/") && !req.originalUrl.startsWith("/api/");
  const path = legacy ? "/voice/relay" : "/api/voice/relay";
  return base.replace(/^http/, "wss") + path;
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Twilio Conversation Relay — natural TTS (ElevenLabs) + Deepgram flux STT
 * tuned for phone noise, backchannels, and US / Texas English.
 */
export function buildConversationRelayTwiml(req: Request): string {
  const wssUrl = relayWebSocketUrl(req);
  const voice = process.env["VOICE_ELEVENLABS_ID"] ?? "UgBBYS2sOqTuMpoF3BR0";
  const greeting =
    process.env["VOICE_WELCOME_GREETING"] ??
    "Hi there! Thanks for calling H T R Group Texas appliance repair. I'm Sarah, your scheduling specialist. How can I help you today?";

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="${xmlEscape(wssUrl)}"
      welcomeGreeting="${xmlEscape(greeting)}"
      welcomeGreetingInterruptible="speech"
      language="en-US"
      ttsProvider="ElevenLabs"
      voice="${xmlEscape(voice)}"
      transcriptionProvider="Deepgram"
      speechModel="flux"
      deepgramSmartFormat="true"
      eotThreshold="0.78"
      partialPrompts="false"
      interruptible="speech"
      interruptSensitivity="medium"
      ignoreBackchannel="true"
      speechTimeout="2200"
      reportInputDuringAgentSpeech="none"
      hints="${xmlEscape(STT_HINTS)}"
    />
  </Connect>
</Response>`;
}
