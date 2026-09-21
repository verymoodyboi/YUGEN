import supabase from "../../../lib/supabase.js";
import logger from "../../../lib/logger.js";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
export async function getReportedAccounts() {
  const { data, error } = await supabase
    .from("reported_users")
    .select(`*, reported_user:users!reported_users_reported_fkey1 (
        auth_id,
        username,
        f_name,
        l_name,
        pfp_path,
        email
      ), reporter:users!reported_users_reported_by_fkey (
        auth_id,
        username
      )`)
    .order("reported_at", { ascending: true });

  if (error) {
    logger.error("Error fetching reported accounts", { error });
    throw new Error(error.message);
  }

  return data;
}

export async function dismissReport(id: string) {
  const { error } = await supabase
    .from("reported_users")
    .delete()
    .eq("id", id);

  if (error) {
    logger.error("Error dismissing report", { error });
    throw new Error(error.message);
  }

  return { success: true, message: "Report dismissed successfully." };
}

export async function banUser(auth_id: string) {
  // Look up the user's details first, since we need their email for the
  // notification after the row itself is gone.
  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("email, username")
    .eq("auth_id", auth_id)
    .single();
 
  if (fetchError) {
    logger.error("Error fetching user before ban", { fetchError });
    throw new Error(fetchError.message);
  }
 
  // Delete the public profile row first, since it has an FK to auth.users
  const { error: deleteUserError } = await supabase
    .from("users")
    .delete()
    .eq("auth_id", auth_id);
 
  if (deleteUserError) {
    logger.error("Error deleting user profile", { deleteUserError });
    throw new Error(deleteUserError.message);
  }
 
  // Delete the auth account itself
  const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(auth_id);
 
  if (deleteAuthError) {
    logger.error("Error deleting auth user", { deleteAuthError });
    throw new Error(deleteAuthError.message);
  }
 
  // Clear out any outstanding reports for this user, since they've now been actioned
  const { error: deleteReportsError } = await supabase
    .from("reported_users")
    .delete()
    .eq("reported", auth_id);
 
  if (deleteReportsError) {
    logger.error("Error clearing reports for banned user", { deleteReportsError });
    throw new Error(deleteReportsError.message);
  }
 
  if (user?.email) {
    try {
      await sendBanNotificationEmail(user.email, user.username);
    } catch (emailError) {
      logger.error("Error sending ban notification email", { emailError });
    }
  }
 
  return { success: true, message: "User banned successfully." };
}
 
async function sendBanNotificationEmail(email: string, username?: string) {
  const { error } = await resend.emails.send({
    from: `Yūgen <noreply@try-yugen.com>`,
    to: email,
    subject: `Your Yūgen account has been banned`,
    html: `
     <!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Yūgen Account Banned</title>
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
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table class="container" cellpadding="0" cellspacing="0" role="presentation">
 
          <tr>
            <td align="center" style="padding-bottom:14px;">
              <img src="https://assets.try-yugen.com/yugen_logo_dark%20(1).png"
                   alt="Yūgen Logo" class="logo">
            </td>
          </tr>
 
          <tr>
            <td class="card">
 
              <div class="h1">Your account has been banned</div>
 
              <div class="p">
                Hi${username ? ` ${username}` : ""}, following a review of reports
                against your account, we've made the decision to permanently ban
                your Yūgen account for violating our community guidelines.
              </div>
 
              <div class="p">
                Your profile, films, and account data have been removed from
                Yūgen. This action is final and your account cannot be
                recovered.
              </div>
 
              <div class="muted">
                If you believe this was a mistake, you can reach out to us at
                support@try-yugen.com.
              </div>
 
            </td>
          </tr>
 
          <tr>
            <td class="footer">
              © <span id="year"></span> Yūgen
              — Need help? support@try-yugen.com
            </td>
          </tr>
 
        </table>
      </td>
    </tr>
  </table>
 
  <script>
    document.getElementById('year')?.appendChild(
      document.createTextNode(new Date().getFullYear())
    );
  </script>
</body>
</html>
    `,
  });
 
  if (error) {
    throw new Error(error.message);
  }
}