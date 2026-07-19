import supabase from '../../lib/supabase.js';
import logger from '../../lib/logger.js';

export async function submitFilmReport(
  auth_id: string,
  reportType: string,
  report: string,
  film_id: string
) {
  const { error: insertError } = await supabase.from("film_reports").insert([
    {
      auth_id,
      report_type: reportType,
      report,
      ischecked: false,
      film_id,
    },
  ]);

  if (insertError) {
    logger.error("Database error inserting film report", { error: insertError });
    throw new Error(insertError.message);
  }

  const { count, error: countError } = await supabase
    .from("film_reports")
    .select("*", { count: "exact", head: true })
    .eq("film_id", film_id);

  if (countError) {
    logger.error("Database error counting film reports", { error: countError });
    throw new Error(countError.message);
  }

  if (count && count % 5 === 0) {
    const { error: updateError } = await supabase
      .from("films")
      .update({ is_flagged: true, flag_reason:"multible user reports" })
      .eq("film_uuid", film_id);

    if (updateError) {
      logger.error("Database error updating film visibility", {
        error: updateError,
      });
      throw new Error(updateError.message);
    }

    const { error: flagError } = await supabase.from("flagged_films").insert([
      {
        film_uuid: film_id,
        reason: "multiple user reports",
      },
    ]);

    if (flagError) {
      logger.error("Database error inserting flagged film", { error: flagError });
      throw new Error(flagError.message);
    }
  }

  return {
    success: true,
    message: "Report submitted successfully!",
    reportsCount: count ?? 0,
    filmFlagged: count ? count % 5 === 0 : false,
  };
}


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

  return { success: true, message: 'Technical report submitted successfully!' };
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
 