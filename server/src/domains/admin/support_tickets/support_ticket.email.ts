import { Resend } from 'resend';
import logger from '../../../lib/logger';

// NOTE: assumes you already have RESEND_API_KEY set in your env from the
// film-insert-notification migration you did earlier. If you already have
// a shared "sendEmail" helper from that work, just add the two functions
// below to it instead of creating a second Resend client.
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = process.env.SUPPORT_EMAIL_FROM || 'Yugen Support <support@try-yugen.com>';
const LOGO_URL = 'https://assets.try-yugen.com/yugen_logo_dark%20(1).png';

// Shared wrapper matching the Yūgen sign-in email visual style.
function renderEmailShell(opts: {
  heading: string;
  bodyHtml: string; // pre-escaped/pre-built inner HTML for the card body
  preheader?: string;
}) {
  const { heading, bodyHtml, preheader } = opts;
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>${escapeHtml(heading)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { -ms-interpolation-mode: bicubic; border:0; outline:none; text-decoration:none; display:block; }

    body {
      margin:0;
      padding:0;
      width:100% !important;
      background-color:#ecfdf5; /* emerald-50 */
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color:#022c22; /* emerald-950 */
    }

    .container { width:100%; max-width:600px; margin:0 auto; }
    .card {
      background:#ffffff;
      border-radius:12px;
      padding:28px;
      box-shadow:0 4px 18px rgba(0,0,0,0.05);
    }

    .logo { width:140px; height:auto; }

    .h1 { font-size:22px; line-height:30px; font-weight:700; margin:18px 0 6px; color:#022c22; }
    .p { font-size:15px; line-height:22px; margin:0 0 18px; color:#064e3b; } /* emerald-900 */

    .btn {
      display:inline-block;
      text-decoration:none;
      font-weight:600;
      padding:12px 20px;
      border-radius:8px;
      background:#059669; /* emerald-600 */
      color:#ffffff;
    }

    .quote {
      border-left:3px solid #a7f3d0; /* emerald-200 */
      padding:10px 14px;
      margin:0 0 18px;
      color:#065f46; /* emerald-800 */
      background:#f0fdfa;
      border-radius:0 6px 6px 0;
      font-size:14px;
      line-height:21px;
    }

    .muted { font-size:13px; color:#065f46; margin-top:18px; } /* emerald-800 */
    .footer { text-align:center; font-size:13px; color:#065f46; padding:22px 0; }

    @media (max-width:420px) {
      .card { padding:18px; }
      .logo { width:120px; }
      .h1 { font-size:19px; }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table class="container" cellpadding="0" cellspacing="0" role="presentation">

          <tr>
            <td align="center" style="padding-bottom:14px;">
              <img src="${LOGO_URL}" alt="Yūgen Logo" class="logo">
            </td>
          </tr>

          <tr>
            <td class="card">
              <div class="h1">${escapeHtml(heading)}</div>
              ${bodyHtml}
            </td>
          </tr>

          <tr>
            <td class="footer">
              &copy; ${year} Y&#363;gen &mdash; Need help? support@try-yugen.com
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendTechReportConfirmationEmail(
  to: string,
  reportType: string,
  report: string
) {
  try {
    const bodyHtml = `
      <div class="p">
        Thanks for reaching out. We've received your <strong>${escapeHtml(reportType)}</strong> report and our team will take a look shortly.
      </div>
      <div class="p" style="margin-bottom:6px;">Your message:</div>
      <div class="quote">${escapeHtml(report)}</div>
      <div class="p" style="margin-bottom:0;">
        We'll follow up by email if we need more information or once it's resolved.
      </div>
    `;

    const html = renderEmailShell({
      heading: "We've received your report",
      preheader: `Thanks for reaching out — we've received your ${reportType} report.`,
      bodyHtml,
    });

    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: "We've received your report",
      html,
    });

    if (error) {
      logger.error('Resend error sending tech report confirmation', { error });
    }
  } catch (err) {
    // Best-effort: a failed confirmation email should not fail the report submission
    logger.error('Unexpected error sending tech report confirmation', { err });
  }
}

export async function sendTechReportReplyEmail(
  to: string,
  originalReport: string,
  replyMessage: string
) {
  const bodyHtml = `
    <div class="p">Here's a reply from our support team regarding your report:</div>
    <div class="quote">${escapeHtml(originalReport)}</div>
    <div class="p" style="white-space:pre-wrap;">${escapeHtml(replyMessage)}</div>
    <div class="p" style="margin-bottom:0;">If you have more questions, just reply to this email.</div>
  `;

  const html = renderEmailShell({
    heading: 'Update on your support ticket',
    preheader: 'Our support team replied to your report.',
    bodyHtml,
  });

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'Update on your support ticket',
    html,
  });

  if (error) {
    logger.error('Resend error sending tech report reply', { error });
    throw new Error(error.message);
  }

  return data;
}

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}