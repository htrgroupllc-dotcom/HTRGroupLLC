import { Router } from "express";
import nodemailer from "nodemailer";

const contactRouter = Router();

contactRouter.post("/contact", async (req, res) => {
  const { name, phone, zip, email, appliance, brandModel, description, lang } = req.body as {
    name?: string;
    phone?: string;
    zip?: string;
    email?: string;
    appliance?: string;
    brandModel?: string;
    description?: string;
    lang?: string;
  };

  if (!name || !phone || !zip || !appliance) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const gmailPass = process.env["GMAIL_APP_PASSWORD"];
  if (!gmailPass) {
    console.error("GMAIL_APP_PASSWORD is not configured");
    res.status(503).json({ error: "Email service not configured" });
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "htrgroupllc@gmail.com",
      pass: gmailPass,
    },
  });

  const langLabel = lang === "es" ? "Español" : "English";
  const subject = `New Repair Request — ${appliance} (ZIP ${zip})`;

  const optRow = (label: string, value?: string) =>
    value
      ? `<tr style="border-bottom:1px solid #eee;">
          <td style="padding:10px 8px;color:#666;width:120px;">${label}</td>
          <td style="padding:10px 8px;font-weight:bold;">${value}</td>
        </tr>`
      : "";

  const html = `
<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#1B6FE8;padding:20px 24px;">
    <h2 style="color:#fff;margin:0;font-size:18px;">&#128203; New Repair Request</h2>
    <p style="color:#b3d4ff;margin:4px 0 0;font-size:13px;">Hi-Tech Repair Group — Website Form</p>
  </div>
  <div style="padding:20px 24px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
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
      ${optRow("Email", email ? `<a href="mailto:${email}" style="color:#1B6FE8;">${email}</a>` : undefined)}
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px 8px;color:#666;">ZIP Code</td>
        <td style="padding:10px 8px;font-weight:bold;">${zip}</td>
      </tr>
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px 8px;color:#666;">Appliance</td>
        <td style="padding:10px 8px;font-weight:bold;">${appliance}</td>
      </tr>
      ${optRow("Brand / Model", brandModel)}
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px 8px;color:#666;">Language</td>
        <td style="padding:10px 8px;">${langLabel}</td>
      </tr>
    </table>
    ${
      description
        ? `<div style="margin-top:16px;">
            <p style="font-size:13px;color:#666;margin:0 0 6px;">Problem Description:</p>
            <div style="background:#f8fafc;border-left:3px solid #1B6FE8;padding:10px 14px;border-radius:4px;font-size:14px;line-height:1.6;">${description.replace(/\n/g, "<br>")}</div>
          </div>`
        : ""
    }
    <div style="margin-top:20px;padding:12px 16px;background:#eff6ff;border-radius:6px;font-size:13px;color:#1B6FE8;">
      &#8987; Please call back within 15 minutes to confirm the appointment.
    </div>
  </div>
</div>`;

  const textLines = [
    "New Repair Request",
    "",
    `Name:        ${name}`,
    `Phone:       ${phone}`,
    email       ? `Email:       ${email}`       : null,
    `ZIP Code:    ${zip}`,
    `Appliance:   ${appliance}`,
    brandModel  ? `Brand/Model: ${brandModel}`  : null,
    `Language:    ${langLabel}`,
    description ? `\nDescription:\n${description}` : null,
    "",
    "Please call back within 15 minutes.",
  ].filter(Boolean).join("\n");

  try {
    await transporter.sendMail({
      from: '"Hi-Tech Repair Group" <htrgroupllc@gmail.com>',
      to: "htrgroupllc@gmail.com",
      subject,
      html,
      text: textLines,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to send email:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default contactRouter;
