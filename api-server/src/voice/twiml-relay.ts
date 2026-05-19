import type { Request } from "express";

const STT_HINTS = [
  "HTR Group", "HTRGroupTX", "Houston", "Texas", "refrigerator", "fridge", "freezer",
  "washer", "dryer", "dishwasher", "oven", "stove", "microwave", "appliance repair",
  "Sub-Zero", "Whirlpool", "Samsung", "LG", "GE", "Maytag", "KitchenAid", "Katy",
  "Sugar Land", "zip code", "appointment", "y'all",
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
 * Conversation Relay: Deepgram (Texas phone audio) + Google Journey voice (reliable TTS).
 * ElevenLabs can be enabled via env if configured in Twilio.
 */
export function buildConversationRelayTwiml(req: Request): string {
  const wssUrl = relayWebSocketUrl(req);
  const ttsProvider = process.env["VOICE_TTS_PROVIDER"] ?? "Google";
  const voice =
    process.env["VOICE_TTS_VOICE"] ??
    (ttsProvider === "Google" ? "en-US-Journey-O" : "UgBBYS2sOqTuMpoF3BR0");
  const greeting =
    process.env["VOICE_WELCOME_GREETING"] ??
    "Hi there! Thanks for calling H T R Group Texas appliance repair. I'm Sarah. How can I help you today?";

  console.log(`[VOICE] Relay WSS → ${wssUrl}`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay
      url="${xmlEscape(wssUrl)}"
      welcomeGreeting="${xmlEscape(greeting)}"
      welcomeGreetingInterruptible="speech"
      language="en-US"
      ttsProvider="${xmlEscape(ttsProvider)}"
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
