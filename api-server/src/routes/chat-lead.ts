import { Router } from "express";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";
import twilio from "twilio";

const chatLeadRouter = Router();

async function translateToRussian(
  messages: Array<{ role: string; content: string }>
): Promise<Array<{ role: string; content: string }> | null> {
  try {
    const baseUrl = process.env["AI_INTEGRATIONS_GEMINI_BASE_URL"];
    const apiKey = process.env["AI_INTEGRATIONS_GEMINI_API_KEY"];
    if (!baseUrl || !apiKey) return null;

    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "", baseUrl } });

    const formatted = messages
      .map((m) => `[${m.role === "user" ? "Клиент" : "Ассистент"}]: ${m.content}`)
      .join("\n\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: formatted }] }],
      config: {
        systemInstruction:
          "Ты переводчик. Переведи следующий диалог на русский язык. " +
          "Сохраняй метки [Клиент] и [Ассистент] точно как есть. " +
          "Если сообщение уже на русском — оставь без изменений. " +
          "Верни ТОЛЬКО переведённый диалог, ничего лишнего.",
        maxOutputTokens: 4096,
      },
    });

    const text = (response.text ?? "").trim();
    if (!text) return null;

    const translated: Array<{ role: string; content: string }> = [];
    const blocks = text.split(/\n\n+/);
    for (const block of blocks) {
      const custMatch = block.match(/^\[Клиент\]:\s*([\s\S]+)/);
      const asstMatch = block.match(/^\[Ассистент\]:\s*([\s\S]+)/);
      if (custMatch) translated.push({ role: "user", content: custMatch[1].trim() });
      else if (asstMatch) translated.push({ role: "assistant", content: asstMatch[1].trim() });
    }
    return translated.length > 0 ? translated : null;
  } catch {
    return null;
  }
}

chatLeadRouter.post("/chat-lead", async (req, res) => {
  const { name, email, phone, messages, lang } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    messages?: Array<{ role: string; content: string }>;
    lang?: string;
  };

  if (!name || !phone) {
    res.status(400).json({ error: "Name and phone are required" });
    return;
  }

  const gmailPass = process.env["EMAIL_PASS"];
  const gmailUser = process.env["EMAIL_USER"] || "htrgroupllc@gmail.com";
  const emailTo = process.env["EMAIL_TO"] || "htrgroupllc@gmail.com";
  if (!gmailPass) {
    console.error("EMAIL_PASS is not configured");
    res.status(503).json({ error: "Email service not configured" });
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const subject = `🤖 AI Assistant Lead — ${name} (${phone})`;

  const filteredMessages = (messages ?? []).filter(
    (m) => m.role === "user" || m.role === "assistant"
  );

  const translatedMessages = await translateToRussian(filteredMessages);
  const detectedLang = lang === "es" ? "Español" : lang === "ru" ? "Русский" : "English";

  function buildConversationHtml(
    msgs: Array<{ role: string; content: string }>,
    russian = false
  ) {
    return msgs
      .map((m) => {
        const isUser = m.role === "user";
        const bg = isUser ? "#eff6ff" : "#f8fafc";
        const label = isUser
          ? (russian ? "👤 Клиент" : "👤 Customer")
          : (russian ? "🤖 Ассистент" : "🤖 AI Assistant");
        const border = isUser ? "#1B6FE8" : "#94a3b8";
        return `
        <div style="margin-bottom:12px;">
          <p style="font-size:11px;color:#64748b;margin:0 0 4px;font-weight:bold;">${label}</p>
          <div style="background:${bg};border-left:3px solid ${border};padding:10px 14px;border-radius:4px;font-size:13px;line-height:1.6;color:#1e293b;">
            ${m.content.replace(/\n/g, "<br>")}
          </div>
        </div>`;
      })
      .join("");
  }

  const mainConversationHtml = buildConversationHtml(
    translatedMessages ?? filteredMessages,
    true
  );
  const originalConversationHtml = translatedMessages
    ? buildConversationHtml(filteredMessages, false)
    : null;

  const html = `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1B6FE8,#0D47B0);padding:20px 24px;">
    <h2 style="color:#fff;margin:0;font-size:18px;">🤖 New Lead from AI Assistant</h2>
    <p style="color:#b3d4ff;margin:4px 0 0;font-size:13px;">HTRGroupTX — Appliance Repair Chat Widget</p>
  </div>

  <div style="padding:20px 24px;">
    <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#856404;">
      ⚠️ This lead was automatically sent by the AI diagnostic assistant after the customer reached the conversation limit. Please follow up promptly.
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px 8px;color:#666;width:120px;">Name</td>
        <td style="padding:10px 8px;font-weight:bold;">${name}</td>
      </tr>
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px 8px;color:#666;">Phone</td>
        <td style="padding:10px 8px;font-weight:bold;">
          <a href="tel:${phone}" style="color:#1B6FE8;">${phone}</a>
        </td>
      </tr>
      ${email ? `
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px 8px;color:#666;">Email</td>
        <td style="padding:10px 8px;font-weight:bold;">
          <a href="mailto:${email}" style="color:#1B6FE8;">${email}</a>
        </td>
      </tr>` : ""}
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px 8px;color:#666;">Language</td>
        <td style="padding:10px 8px;">${detectedLang}</td>
      </tr>
    </table>

    <h3 style="font-size:14px;font-weight:bold;color:#0f172a;margin:0 0 12px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">
      📋 История переписки ${translatedMessages ? "(переведено на русский)" : ""}
    </h3>
    ${mainConversationHtml || "<p style='color:#94a3b8;font-size:13px;'>Сообщений нет.</p>"}

    ${originalConversationHtml ? `
    <details style="margin-top:16px;">
      <summary style="cursor:pointer;font-size:13px;font-weight:bold;color:#64748b;padding:8px 0;border-top:1px solid #e2e8f0;">
        🌐 Оригинал (язык клиента)
      </summary>
      <div style="margin-top:10px;opacity:0.85;">
        ${originalConversationHtml}
      </div>
    </details>` : ""}

    <div style="margin-top:20px;padding:12px 16px;background:#eff6ff;border-radius:6px;font-size:13px;color:#1B6FE8;">
      📞 Please call back within 15 minutes to confirm the appointment.
    </div>
  </div>

  <div style="background:#f8fafc;padding:12px 24px;font-size:11px;color:#94a3b8;text-align:center;">
    Sent automatically by HTRGroupTX AI Assistant • ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })} CT
  </div>
</div>`;

  const translatedForText = translatedMessages ?? filteredMessages;
  const textLines = [
    "🤖 НОВЫЙ ЛИД ОТ AI АССИСТЕНТА",
    "HTRGroupTX — Appliance Repair Chat Widget",
    "",
    "⚠️ Лид отправлен автоматически после достижения клиентом лимита вопросов.",
    "",
    `Имя:     ${name}`,
    `Телефон: ${phone}`,
    email ? `Email:   ${email}` : "",
    `Язык:    ${detectedLang}`,
    "",
    `--- ИСТОРИЯ ПЕРЕПИСКИ ${translatedMessages ? "(ПЕРЕВЕДЕНО НА РУССКИЙ)" : ""} ---`,
    ...translatedForText.map((m) =>
      `[${m.role === "user" ? "Клиент" : "Ассистент"}]: ${m.content}`
    ),
    "",
    "Перезвоните клиенту в течение 15 минут.",
  ].filter((l) => l !== undefined).join("\n");

  try {
    await transporter.sendMail({
      from: '"HTRGroupTX AI Assistant" <htrgroupllc@gmail.com>',
      to: emailTo,
      subject,
      html,
      text: textLines,
    });
  } catch (err) {
    console.error("Failed to send chat lead email:", err);
    res.status(500).json({ error: "Failed to send email" });
    return;
  }

  // WhatsApp notification to owner
  try {
    const twilioSid   = process.env["TWILIO_ACCOUNT_SID"];
    const twilioToken = process.env["TWILIO_AUTH_TOKEN"];
    const fromNum     = process.env["TWILIO_WHATSAPP_NUMBER"] ?? "whatsapp:+14155238886";
    const ownerWA     = "whatsapp:+13468206021";

    if (twilioSid && twilioToken) {
      const translatedForWA = translatedMessages ?? filteredMessages;
      const lastMsgs = translatedForWA.slice(-4);
      const dialogLines = lastMsgs
        .map((m) => `${m.role === "user" ? "👤" : "🤖"} ${m.content.slice(0, 200)}`)
        .join("\n\n");

      const waBody = [
        `🤖 *Новый лид от AI-ассистента*`,
        ``,
        `👤 *Имя:* ${name}`,
        `📞 *Телефон:* ${phone}`,
        email ? `📧 *Email:* ${email}` : "",
        `🌐 *Язык:* ${detectedLang}`,
        ``,
        `📋 *Последние сообщения:*`,
        dialogLines || "(нет сообщений)",
        ``,
        `⚡ Перезвоните клиенту в течение 15 минут.`,
      ].filter(Boolean).join("\n");

      const client = twilio(twilioSid, twilioToken);
      await client.messages.create({ from: fromNum, to: ownerWA, body: waBody });
    }
  } catch (waErr) {
    console.error("Failed to send WhatsApp lead notification:", waErr);
    // non-fatal — email already sent
  }

  res.json({ ok: true });
});

export default chatLeadRouter;
