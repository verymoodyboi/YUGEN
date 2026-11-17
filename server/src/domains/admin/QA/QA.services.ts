import supabase from "../../../lib/supabase.js";
import logger from "../../../lib/logger.js";


export async function getPendingUploads() {
  const { data, error } = await supabase
    .from("films")
    .select(`
      film_uuid,
      film_title,
      poster_path,
      moderation_status,
      moderation_submitted_at,
      release_date,
      uploader:users!fk_uploader (
        username
      )
    `)
    .in("moderation_status", ["queued", "quality_control"])
    .order("moderation_submitted_at", { ascending: true });

  if (error) {
    logger.error("Error fetching pending uploads", { error });
    throw new Error(error.message);
  }

  // Shape response EXACTLY how frontend expects it
  return data.map((film: any) => ({
    film_uuid: film.film_uuid,
    moderation_status: film.moderation_status,
    uploaded_at: film.moderation_submitted_at || film.release_date,
    films: {
      title: film.film_title,
      poster_path: film.poster_path,
      uploader: {
        username: film.uploader?.username,
      },
    },
  }));
}



export async function acceptUpload(film_uuid: string) {
  const { error } = await supabase
    .from("films")
    .update({
      moderation_status: "approved",
      moderation_checked_at: new Date().toISOString(),
      is_flagged: false,
      flag_reason: null,
    })
    .eq("film_uuid", film_uuid);

  if (error) {
    logger.error("Error accepting upload", { error });
    throw new Error(error.message);
  }

  return {
    success: true,
    message: "Upload approved successfully.",
  };
}


export async function rejectUpload(film_uuid: string) {

 const { error: flagError } = await supabase.from("flagged_films").insert([
        {
          film_uuid: film_uuid,
          reason: "not matching quality Yugen standerds",
          status: "Admin flagged",
        },
      ]);
      await supabase
        .from("films")
        .update({
          is_flagged: true,
          flag_reason: "not matching quality Yugen standerds",
          moderation_status: "rejected",
        })
        .eq("film_uuid", film_uuid);

  if (flagError) {
    logger.error("Error rejecting upload", { flagError });
    throw new Error(flagError.message);
  }

  return {
    success: true,
    message: "Upload rejected and film deleted.",
  };
}
