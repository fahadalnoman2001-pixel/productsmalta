import nodemailer from "nodemailer";

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE !== "false", // true for 465
  auth: {
    user: process.env.SMTP_USER || "noreplay@youroffers.eu",
    pass: process.env.SMTP_PASS || "R0d|>0;V&"
  }
};

const DEFAULT_FROM = process.env.SMTP_FROM || '"YourOffers Security" <noreplay@youroffers.eu>';
export const NOTIFY_SUPER_ADMIN_EMAIL = process.env.SECURITY_NOTIFY_EMAIL || "fahadalnoman2001@gmail.com";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(SMTP_CONFIG);
  }
  return transporter;
}

export interface SendAdminCodeParams {
  code: string;
  targetEmail: string;
  targetName?: string | null;
  targetRole: string;
  requestedBy: string;
  ip?: string | null;
}

/**
 * Sends a 10-digit confirmation code email to fahadalnoman2001@gmail.com
 * when a new admin user creation is requested.
 */
export async function sendAdminCreationCode(params: SendAdminCodeParams) {
  const { code, targetEmail, targetName, targetRole, requestedBy, ip } = params;
  const transport = getTransporter();

  const formattedRole =
    targetRole === "super_admin"
      ? "Super Administrator"
      : targetRole === "admin"
      ? "Administrator"
      : "Editor";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Creation Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #12151f 0%, #1e2538 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                YourOffers.eu Security
              </h1>
              <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px;">
                Administrator Account Verification
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 35px 30px;">
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #334155;">
                Hello Super Admin,
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 22px; color: #475569;">
                A request has been initiated to <strong>create a new administrator account</strong> on the YourOffers.eu Admin Portal. Please use the 10-digit confirmation code below to authorize this action:
              </p>

              <!-- 10-Digit Confirmation Code Box -->
              <div style="margin: 28px 0; padding: 22px; background-color: #fff5ed; border: 2px dashed #f97316; border-radius: 12px; text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: #c2450b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                  10-Digit Confirmation Code
                </div>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; color: #ea5c07; letter-spacing: 6px;">
                  ${code}
                </div>
                <div style="font-size: 12px; color: #9a3811; margin-top: 8px;">
                  ⏱ Valid for <strong>10 minutes</strong>
                </div>
              </div>

              <!-- Admin Details Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px;">
                <tr>
                  <td style="font-size: 12px; font-weight: bold; color: #64748b; padding: 4px 0; width: 140px;">New Admin Email:</td>
                  <td style="font-size: 13px; font-weight: 600; color: #0f172a; padding: 4px 0;">${targetEmail}</td>
                </tr>
                ${
                  targetName
                    ? `<tr>
                  <td style="font-size: 12px; font-weight: bold; color: #64748b; padding: 4px 0;">New Admin Name:</td>
                  <td style="font-size: 13px; color: #334155; padding: 4px 0;">${targetName}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="font-size: 12px; font-weight: bold; color: #64748b; padding: 4px 0;">Assigned Role:</td>
                  <td style="font-size: 13px; font-weight: 600; color: #7c3aed; padding: 4px 0;">${formattedRole}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; font-weight: bold; color: #64748b; padding: 4px 0;">Requested By:</td>
                  <td style="font-size: 12px; color: #64748b; padding: 4px 0;">${requestedBy}</td>
                </tr>
                ${
                  ip
                    ? `<tr>
                  <td style="font-size: 12px; font-weight: bold; color: #64748b; padding: 4px 0;">Request IP:</td>
                  <td style="font-size: 12px; font-family: monospace; color: #64748b; padding: 4px 0;">${ip}</td>
                </tr>`
                    : ""
                }
              </table>

              <p style="margin: 24px 0 0; font-size: 12px; line-height: 18px; color: #94a3b8;">
                ⚠️ If you did not request or authorize this new administrator account, ignore this email and verify your admin credentials immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center; font-size: 12px; color: #94a3b8;">
              © ${new Date().getFullYear()} YourOffers.eu • Automated Security Notification
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
YourOffers.eu Security - Admin Account Creation Confirmation

A request was made to create a new administrator account:
- New Admin Email: ${targetEmail}
- Assigned Role: ${formattedRole}
- Requested By: ${requestedBy}
${ip ? `- Request IP: ${ip}` : ""}

YOUR 10-DIGIT CONFIRMATION CODE:
${code}

This code is valid for 10 minutes. Enter this code in the admin creation modal to authorize and create the account.

If you did not initiate this request, please review your admin security immediately.
  `;

  const info = await transport.sendMail({
    from: DEFAULT_FROM,
    to: NOTIFY_SUPER_ADMIN_EMAIL,
    subject: `🔐 [YourOffers] Confirmation Code: ${code} (Admin Creation Request)`,
    text,
    html
  });

  return info;
}
