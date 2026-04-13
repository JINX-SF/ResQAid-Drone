const nodemailer = require("nodemailer");

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─────────────────────────────────────────────────────────────
// SHARED EMAIL LAYOUT
// ─────────────────────────────────────────────────────────────
const emailWrapper = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <tr>
            <td style="background:#1a1a2e;padding:28px 40px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:1px;">
                Drone Platform
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px;color:#333333;font-size:15px;line-height:1.7;">
              ${bodyHtml}
            </td>
          </tr>

          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#999999;text-align:center;">
                If you did not request this email, you can safely ignore it.<br/>
                &copy; ${new Date().getFullYear()} Drone Platform. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─────────────────────────────────────────────────────────────
// SEND VERIFICATION EMAIL
// ─────────────────────────────────────────────────────────────
const sendVerifyEmail = async (email, name, rawToken) => {
  const safeName = escapeHtml(name || "there");
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;
  const safeVerifyUrl = escapeHtml(verifyUrl);

  const html = `
    <p style="margin:0 0 16px;">Hi <strong>${safeName}</strong>,</p>
    <p style="margin:0 0 16px;">
      Welcome to Drone Platform! Please verify your email address so we can activate your account.
    </p>
    <p style="margin:0 0 28px;">
      This link will expire in <strong>24 hours</strong>.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td style="background:#2563eb;border-radius:6px;">
          <a href="${safeVerifyUrl}"
            style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:6px;">
            Verify my email
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:13px;color:#666666;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin:0;font-size:12px;color:#2563eb;word-break:break-all;">
      ${safeVerifyUrl}
    </p>
  `;

  const text = `
Hi ${name || "there"},

Welcome to Drone Platform!
Please verify your email address using this link:

${verifyUrl}

This link will expire in 24 hours.
`;

  await transporter.sendMail({
    from: `"Drone Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email — Drone Platform",
    text,
    html: emailWrapper("Verify your email", html),
  });
};

// ─────────────────────────────────────────────────────────────
// SEND PASSWORD RESET EMAIL
// ─────────────────────────────────────────────────────────────
const sendResetEmail = async (email, name, rawToken) => {
  const safeName = escapeHtml(name || "there");
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
  const safeResetUrl = escapeHtml(resetUrl);

  const html = `
    <p style="margin:0 0 16px;">Hi <strong>${safeName}</strong>,</p>
    <p style="margin:0 0 16px;">
      We received a request to reset the password for your Drone Platform account.
    </p>
    <p style="margin:0 0 28px;">
      This link will expire in <strong>1 hour</strong>.
      If you did not request a password reset, no action is needed.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td style="background:#dc2626;border-radius:6px;">
          <a href="${safeResetUrl}"
            style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:6px;">
            Reset my password
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:13px;color:#666666;">
      Or copy and paste this link into your browser:
    </p>
    <p style="margin:0;font-size:12px;color:#dc2626;word-break:break-all;">
      ${safeResetUrl}
    </p>
  `;

  const text = `
Hi ${name || "there"},

We received a request to reset the password for your Drone Platform account.

Use this link to reset your password:
${resetUrl}

This link will expire in 1 hour.
If you did not request this, you can ignore this email.
`;

  await transporter.sendMail({
    from: `"Drone Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password — Drone Platform",
    text,
    html: emailWrapper("Reset your password", html),
  });
};

// ─────────────────────────────────────────────────────────────
// VERIFY EMAIL CONFIG
// ─────────────────────────────────────────────────────────────
const verifyEmailConfig = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️ Email service not configured: missing EMAIL_USER or EMAIL_PASS");
      return;
    }

    await transporter.verify();
    console.log("✅ Email service ready");
  } catch (error) {
    console.warn("⚠️ Email service not configured:", error.message);
  }
};

module.exports = {
  sendVerifyEmail,
  sendResetEmail,
  verifyEmailConfig,
};