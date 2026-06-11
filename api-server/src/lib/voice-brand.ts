/**
 * Company names for voice: legal (docs) vs display vs spoken (TTS-friendly on phone).
 * "Hi-Tech" / "HiTech" TTS often misreads as "Hike Tech". Say "High Tech Repair Group" aloud.
 */
export const VOICE_COMPANY_LEGAL = "Hitechrepairgroup LLC";

/** Written / UI brand name */
export const VOICE_COMPANY_DISPLAY = "HTRGroup";

/** Clear American English — use in all Say / Realtime speech (never "Hi-Tech" or "Hike Tech"). */
export const VOICE_COMPANY_SPOKEN = "HTRGroup";

export const VOICE_GREETING_SERVICE_LINE = "appliance repair";

/** Short thank-you — avoid trailing "appliance repair" (TTS sounds like "application"). */
export const VOICE_GREETING_THANK_YOU =
  `Thank you for calling ${VOICE_COMPANY_SPOKEN}.`;

/** Language menu (English) — after thank-you. */
export const VOICE_LANGUAGE_MENU_EN =
  "Which language would you prefer: English, Spanish, or another language?";

/** One marin opening line (English): thank-you + language menu. */
export const VOICE_OPENING_SPOKEN_EN =
  `${VOICE_GREETING_THANK_YOU} ${VOICE_LANGUAGE_MENU_EN}`;

/** First intake question after language lock (English). */
export const VOICE_APPLIANCE_INTAKE_EN = "What appliance do you need help with today?";

export const VOICE_APPLIANCE_RETRY_EN =
  "I'm sorry, I didn't catch the appliance type. Is it a refrigerator, washer, dryer, oven, stove, dishwasher, or microwave?";

export const VOICE_APPLIANCE_CALLBACK_EN =
  "No problem. I'll have our team call you back. May I have your phone number?";

export const VOICE_GREETING_QUESTION = VOICE_APPLIANCE_INTAKE_EN;

export const VOICE_GREETING_FULL =
  `${VOICE_GREETING_THANK_YOU} ${VOICE_GREETING_QUESTION}`;

/** Twilio Polly — same words as spoken brand (no LLC suffix on phone). */
export const VOICE_COMPANY_GREETING_TWIML = VOICE_GREETING_THANK_YOU;
