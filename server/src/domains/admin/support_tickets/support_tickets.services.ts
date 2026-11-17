import supabase from '../../../lib/supabase.js';
import logger from '../../../lib/logger.js';
import { sendTechReportConfirmationEmail, sendTechReportReplyEmail } from './support_ticket.email.js';




export async function submitTechReport(auth_id: string, reportType: string, report: string) {
  const { error } = await supabase.from('tech_reports').insert([
    {
      auth_id,
      report_type: reportType,
      report,
    },
  ]);

  if (error) {
    logger.error('Database error inserting tech report', { error });
    throw new Error(error.message);
  }

  // Best-effort confirmation email — don't fail the request if this errors.
  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('email')
    .eq('auth_id', auth_id)
    .single();
    const email=userRow?.email
      console.log();
      ({ email});

  if (userError) {
    logger.error('Could not look up user email for tech report confirmation', { error: userError });
  } else if (userRow?.email) {
    await sendTechReportConfirmationEmail(userRow.email, reportType, report);
  }

  return { success: true, message: 'Technical report submitted successfully!' };
}

export async function getAllTechReports() {
  // Adjust the "users:auth_id" relation alias/constraint name if your
  // Supabase schema cache uses a different name for this foreign key.
  const { data, error } = await supabase
    .from('tech_reports')
    .select(
      `*, users:auth_id ( username, email, f_name, l_name, pfp_path )`
    )
    .eq("reviewed",false)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Database error fetching tech reports', { error });
    throw new Error(error.message);
  }

  return data;
}

export async function replyToTechReport(reportId: string, replyMessage: string) {
  const { data: report, error: fetchError } = await supabase
    .from('tech_reports')
    .select(`*, users:auth_id ( email )`)
    .eq('id', reportId)
    .single();

  if (fetchError || !report) {
    logger.error('Database error fetching tech report for reply', { error: fetchError });
    throw new Error(fetchError?.message || 'Report not found');
  }

  const userEmail = (report as any).users?.email;
  if (!userEmail) {
    throw new Error('No email on file for this user');
  }

  await sendTechReportReplyEmail(userEmail, report.report, replyMessage);

  const { error: updateError } = await supabase
    .from('tech_reports')
    .update({
      admin_reply: replyMessage,
      replied_at: new Date().toISOString(),
      reviewed: true,
    })
    .eq('id', reportId);

  if (updateError) {
    logger.error('Database error saving reply on tech report', { error: updateError });
    throw new Error(updateError.message);
  }

  return { success: true, message: 'Reply sent successfully!' };
}


export interface SubmitReportInput {
  reported: string;
  reported_by: string;
  reason: string;
  report?: string;
}
 
export async function reportAccount({ reported, reported_by, reason, report }: SubmitReportInput) {
  if (reported === reported_by) {
    throw new Error("You cannot report yourself.");
  }
 
  const { data, error } = await supabase
    .from("reported_users")
    .insert({
      reported,
      reported_by,
      reason,
      report: report || "",
    })
    .select()
    .single();
 
  if (error) {
    logger.error("Error submitting report", { error });
    throw new Error(error.message);
  }
 
  return { success: true, message: "Report submitted successfully.", data };
}