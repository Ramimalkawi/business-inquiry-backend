import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ ok: true, message: "Business inquiry backend is running." });
});

app.post("/api/business-inquiry", async (req, res) => {
  try {
    const { first_name, last_name, email, phone, company, message } = req.body;

    if (!first_name || !last_name || !email || !phone || !company) {
      return res.status(400).json({
        ok: false,
        message: "Missing required fields.",
      });
    }

    const fullName = `${first_name} ${last_name}`.trim();

    const adminHtml = `
  <div style="margin:0;padding:0;background:#f5f5f7;font-family:Arial,Helvetica,sans-serif;color:#1d1d1f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e5e7;">
            
            <tr>
              <td style="padding:28px 32px;background:#ffffff;border-bottom:1px solid #e5e5e7;">
                <div style="font-size:13px;line-height:1.4;color:#6e6e73;margin-bottom:8px;">eStore Business Inquiry</div>
                <h1 style="margin:0;font-size:30px;line-height:1.15;color:#1d1d1f;">New Business Inquiry</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:14px 0;border-bottom:1px solid #f0f0f2;width:180px;font-size:14px;font-weight:700;color:#1d1d1f;">Full name</td>
                    <td style="padding:14px 0;border-bottom:1px solid #f0f0f2;font-size:15px;color:#1d1d1f;">${fullName}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 0;border-bottom:1px solid #f0f0f2;font-size:14px;font-weight:700;color:#1d1d1f;">Email</td>
                    <td style="padding:14px 0;border-bottom:1px solid #f0f0f2;font-size:15px;">
                      <a href="mailto:${email}" style="color:#06c;text-decoration:none;">${email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 0;border-bottom:1px solid #f0f0f2;font-size:14px;font-weight:700;color:#1d1d1f;">Phone</td>
                    <td style="padding:14px 0;border-bottom:1px solid #f0f0f2;font-size:15px;color:#1d1d1f;">${phone}</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 0;border-bottom:1px solid #f0f0f2;font-size:14px;font-weight:700;color:#1d1d1f;">Company</td>
                    <td style="padding:14px 0;border-bottom:1px solid #f0f0f2;font-size:15px;color:#1d1d1f;">${company}</td>
                  </tr>
                </table>

                <div style="margin-top:28px;">
                  <div style="font-size:14px;font-weight:700;color:#1d1d1f;margin-bottom:10px;">Message</div>
                  <div style="background:#f5f5f7;border:1px solid #e5e5e7;border-radius:14px;padding:18px 20px;font-size:15px;line-height:1.7;color:#1d1d1f;">
                    ${(message || "No message provided.").replace(/\n/g, "<br>")}
                  </div>
                </div>

                <div style="margin-top:28px;">
                  <a href="mailto:${email}" style="display:inline-block;background:#0071e3;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;line-height:1;padding:14px 22px;border-radius:999px;">
                    Reply to ${first_name}
                  </a>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e5e5e7;font-size:12px;line-height:1.6;color:#6e6e73;">
                This message was sent from the Business Inquiries form on estorejo.com.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
`;

    const customerHtml = `
  <div style="margin:0;padding:0;background:#f5f5f7;font-family:Arial,Helvetica,sans-serif;color:#1d1d1f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e5e7;">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid #e5e5e7;">
                <h1 style="margin:0;font-size:30px;line-height:1.15;">Thank you for contacting eStore</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;font-size:15px;line-height:1.8;color:#1d1d1f;">
                <p style="margin:0 0 18px;">Hi ${first_name},</p>
                <p style="margin:0 0 18px;">We received your business inquiry and one of our team members will contact you shortly.</p>
                <p style="margin:0 0 18px;"><strong>Your company:</strong> ${company}</p>
                ${
                  message
                    ? `<p style="margin:0 0 18px;"><strong>Your message:</strong><br>${message.replace(/\n/g, "<br>")}</p>`
                    : ""
                }
                <p style="margin:24px 0 0;">Best regards,<br>eStore Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;

    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [process.env.TO_EMAIL],
      reply_to: email,
      subject: `New Business Inquiry — ${company} — ${email}`,
      html: adminHtml,
    });

    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [email],
      subject: "We received your business inquiry",
      html: customerHtml,
    });

    return res.status(200).json({
      ok: true,
      message: "Inquiry sent successfully.",
    });
  } catch (error) {
    console.error("Business inquiry send error:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to send inquiry.",
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
