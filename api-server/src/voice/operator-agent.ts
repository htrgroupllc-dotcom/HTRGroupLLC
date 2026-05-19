import { GoogleGenAI } from "@google/genai";
import {
  type BookingState,
  isReadyForScheduling,
  isReadyToBook,
  mergeBookingState,
  missingFields,
} from "./booking-state.js";
import { buildSchedulingContext } from "./slots-context.js";

export interface AgentTurnResult {
  spokenReply: string;
  state: BookingState;
  shouldBook: boolean;
  shouldEndCall: boolean;
}

function makeGemini(): GoogleGenAI {
  const baseUrl = process.env["AI_INTEGRATIONS_GEMINI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_GEMINI_API_KEY"];
  if (!baseUrl || !apiKey) throw new Error("Gemini not configured");
  return new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "", baseUrl } });
}

const SYSTEM_PROMPT = `You are Sarah, a warm, professional phone dispatcher for HTR Group Texas — licensed appliance repair in Greater Houston, Texas.

VOICE & STYLE:
- Sound like a real person on the phone: calm, patient, friendly Texas hospitality (natural, not cartoonish).
- Use clear American English. Understand Texas accents, Southern drawl, casual phrasing ("y'all", "fixin to", "it ain't cooling").
- ONE or TWO short questions per turn. Never rush. Pause-friendly phrasing.
- Ignore background noise, TV, kids, traffic — only respond to the caller's intent. If unclear, politely ask them to repeat.
- Keep replies under 45 words unless listing appointment times.

APPLIANCE EXPERTISE:
- You specialize in refrigerators, washers, dryers, dishwashers, ovens, ranges, microwaves, ice makers, wine coolers.
- When they mention a problem (e.g. "fridge not cold"), ask follow-ups ONE at a time: how it acts, noises, leaks, error codes, how long.
- Then ask brand and model (e.g. Samsung RF28...). If unknown, note "model unknown".

BOOKING FLOW (in order — do not skip):
1. appliance type
2. symptoms / how the problem shows up
3. brand and model
4. caller's first and last name
5. callback phone (confirm digits if they give a different number than caller ID)
6. city (Houston area: Houston, Katy, Sugar Land, Pearland, Cypress, Spring, The Woodlands, etc.)
7. street address
8. ZIP code
9. appointment date and time from AVAILABLE SLOTS only

SCHEDULING:
- Only offer times listed in AVAILABLE APPOINTMENTS. Never invent slots.
- Read 2–3 options slowly and clearly.
- After they choose, read back full details and ask "Does that all sound correct?"
- Set confirmBooking true only after they clearly say yes.

OUTPUT: Respond with ONLY valid JSON (no markdown):
{
  "spokenReply": "what you say aloud",
  "updates": {
    "appliance": "",
    "symptoms": "",
    "brandModel": "",
    "clientName": "",
    "phone": "",
    "city": "",
    "streetAddress": "",
    "zip": "",
    "preferredDate": "",
    "preferredTime": "",
    "selectedSlot": ""
  },
  "confirmBooking": false
}

Only include keys in "updates" when the caller clearly provided that information.`;

export async function runOperatorTurn(
  userMessage: string,
  state: BookingState,
  callerId: string,
  history: Array<{ role: "user" | "model"; text: string }>,
): Promise<AgentTurnResult> {
  const ai = makeGemini();
  let schedulingBlock = "";
  if (isReadyForScheduling(state)) {
    schedulingBlock = await buildSchedulingContext();
  }

  const missing = missingFields(state);
  const stateJson = JSON.stringify(
    { ...state, callerIdFromPhone: callerId },
    null,
    2,
  );

  const userBlock = [
    `CALLER SAID: """${userMessage}"""`,
    `CURRENT BOOKING DATA: ${stateJson}`,
    missing.length
      ? `STILL NEEDED: ${missing.join(", ")}`
      : "All fields collected — confirm appointment and ask for yes to book.",
    schedulingBlock,
    history.length
      ? `RECENT TURNS:\n${history
          .slice(-6)
          .map((h) => `${h.role}: ${h.text}`)
          .join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const resp = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Understood. I will respond only with JSON." }] },
      { role: "user", parts: [{ text: userBlock }] },
    ],
    config: {
      temperature: 0.35,
      maxOutputTokens: 512,
      responseMimeType: "application/json",
    },
  });

  const raw = resp.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  let parsed: {
    spokenReply?: string;
    updates?: Partial<BookingState>;
    confirmBooking?: boolean;
  };
  try {
    parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    parsed = {
      spokenReply:
        "I'm sorry, I didn't catch that. Could you say that again for me?",
    };
  }

  const merged = mergeBookingState(state, parsed.updates ?? {});
  if (!merged.phone && callerId) merged.phone = callerId;

  const spoken =
    (parsed.spokenReply ?? "").trim() ||
    "Thanks for your patience. What else can you tell me?";

  const shouldBook = Boolean(parsed.confirmBooking) && isReadyToBook(merged);
  const shouldEndCall = shouldBook;

  return {
    spokenReply: spoken,
    state: merged,
    shouldBook,
    shouldEndCall,
  };
}
