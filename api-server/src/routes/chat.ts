import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const chatRouter = Router();

const SYSTEM_PROMPT = `You are an expert appliance repair assistant for HTRGroupTX, a professional appliance repair company serving the Houston metropolitan area (Texas, USA). Phone: (346) 820-6021.

Your role is to help homeowners diagnose appliance problems step by step and provide practical advice. You cover all major home appliances: refrigerators, washing machines, dryers, dishwashers, ovens/ranges, microwaves, freezers, range hoods, ice makers, cooktops, wine coolers, garbage disposals, and warming drawers.

LANGUAGE RULE (highest priority):
- Detect the language the user is writing in from their messages.
- Always respond in the exact same language the user used in their last message.
- If the user switches language mid-conversation, switch your response language immediately.
- Default to English if the user's language is unclear or ambiguous.
- Never mix languages in a single response.

Guidelines:
- Ask clarifying questions to narrow down the problem (brand, model, symptoms, error codes, age of appliance, etc.)
- Give clear, step-by-step diagnostic guidance
- Explain what the likely cause is in simple, non-technical language
- Tell users which issues they can safely fix themselves vs. which require a professional technician
- For complex or potentially dangerous issues (electrical, refrigerant, gas), always recommend calling a professional
- At a natural point in the conversation — after you've diagnosed the problem — suggest calling HTRGroupTX at (346) 820-6021 for professional service in Houston
- Keep responses concise and practical — no more than 150-200 words per response
- Never recommend specific competitor companies
- Be warm, helpful, and professional

Start each new conversation by asking what appliance they are having trouble with and describing the main symptom.`;

chatRouter.post("/chat", async (req, res) => {
  try {
    const { messages, lang } = req.body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      lang?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages required" });
    }

    const baseUrl = process.env["AI_INTEGRATIONS_GEMINI_BASE_URL"];
    const apiKey = process.env["AI_INTEGRATIONS_GEMINI_API_KEY"];

    if (!baseUrl || !apiKey) {
      return res.status(500).json({ error: "AI integration not configured" });
    }

    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "", baseUrl } });

    const systemInstruction = SYSTEM_PROMPT;

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 8192,
      },
    });

    const text = response.text ?? "";
    return res.json({ content: text });
  } catch (err) {
    console.error("Chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "AI service error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "AI service error" })}\n\n`);
      res.end();
    }
  }
});

export default chatRouter;
