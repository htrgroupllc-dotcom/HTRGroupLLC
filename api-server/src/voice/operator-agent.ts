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
}

const SYSTEM = `You are Sarah, a warm professional phone dispatcher for HTR Group Texas — appliance repair in Greater Houston.

STYLE: Natural American English. Understand Texas/Southern accents and casual speech. Patient, one or two short questions per turn. Under 50 words unless listing appointment times. Ignore background noise; ask to repeat if unclear.

EXPERTISE: Refrigerators, washers, dryers, dishwashers, ovens, microwaves. When caller reports a problem, ask how it manifests (not cooling, noise, leak, error code) before brand/model.

COLLECT IN ORDER: appliance → symptoms → brandModel → clientName → phone → city → streetAddress → zip → date/time from AVAILABLE SLOTS only.

When all info collected, confirm details and set confirmBooking true only after clear "yes".

JSON only:
{"spokenReply":"...","updates":{...},"confirmBooking":false}`;

function makeGemini(): GoogleGenAI {
  const baseUrl = process.env["AI_INTEGRATIONS_GEMINI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_GEMINI_API_KEY"];
  if (!baseUrl || !apiKey) throw new Error("Gemini not configured");
  return new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "", baseUrl } });
}

export async function runOperatorTurn(
  userMessage: string,
  state: BookingState,
  callerId: string,
  history: Array<{ role: "user" | "model"; text: string }>,
): Promise<AgentTurnResult> {
  const ai = makeGemini();
  let scheduling = "";
  if (isReadyForScheduling(state)) {
    scheduling = await buildSchedulingContext();
  }

  const resp = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { role: "user", parts: [{ text: SYSTEM }] },
      { role: "model", parts: [{ text: "OK" }] },
      {
        role: "user",
        parts: [{
          text: [
            `CALLER: """${userMessage}"""`,
            `DATA: ${JSON.stringify({ ...state, callerId })}`,
            `MISSING: ${missingFields(state).join(", ") || "none"}`,
            scheduling,
            history.slice(-4).map((h) => `${h.role}: ${h.text}`).join("\n"),
          ].filter(Boolean).join("\n\n"),
        }],
      },
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
    parsed = { spokenReply: "Sorry, could you say that again?" };
  }

  const merged = mergeBookingState(state, parsed.updates ?? {});
  if (!merged.phone && callerId) merged.phone = callerId;

  return {
    spokenReply:
      parsed.spokenReply?.trim() || "Thanks — could you tell me a bit more?",
    state: merged,
    shouldBook: Boolean(parsed.confirmBooking) && isReadyToBook(merged),
  };
}
