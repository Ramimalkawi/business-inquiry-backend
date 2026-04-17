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
      <div style="font-family:Arial,Helvetica,sans-serif; color:#111; line-height:1.6;">
        <h2 style="margin:0 0 20px;">New Business Inquiry</h2>
        <table style="border-collapse:collapse; width:100%; max-width:700px;">
          <tr>
            <td style="padding:8px 0; font-weight:bold; width:160px;">Name</td>
            <td style="padding:8px 0;">${fullName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; font-weight:bold;">Email</td>
            <td style="padding:8px 0;">${email}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; font-weight:bold;">Phone</td>
            <td style="padding:8px 0;">${phone}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; font-weight:bold;">Company</td>
            <td style="padding:8px 0;">${company}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; font-weight:bold; vertical-align:top;">Message</td>
            <td style="padding:8px 0;">${(message || "").replace(/\n/g, "<br>")}</td>
          </tr>
        </table>
      </div>
    `;

    const customerHtml = `
      <div style="font-family:Arial,Helvetica,sans-serif; color:#111; line-height:1.6;">
        <h2 style="margin:0 0 20px;">Thank you for contacting eStore</h2>
        <p>Hi ${first_name},</p>
        <p>We received your business inquiry and one of our team members will contact you shortly.</p>
        <p><strong>Your details</strong></p>
        <ul style="padding-left:18px;">
          <li><strong>Name:</strong> ${fullName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Company:</strong> ${company}</li>
        </ul>
        ${
          message
            ? `<p><strong>Your message:</strong><br>${message.replace(/\n/g, "<br>")}</p>`
            : ""
        }
        <p>Best regards,<br>eStore Team</p>
      </div>
    `;

    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [process.env.TO_EMAIL],
      reply_to: email,
      subject: "New Business Inquiry",
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
