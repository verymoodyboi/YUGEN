import supabase from "../../../lib/supabase.js";
import logger from "../../../lib/logger.js";

export async function getFlaggedFilms() {
  const { data, error } = await supabase
    .from("flagged_films")
    .select(`*, films(*,uploader:users!fk_uploader (
        auth_id,
        username,
        pfp_path,
        bio,
        sub_count,
        films_count
      ))`)
    .order("flagged_at", { ascending: true });

  if (error) {
    logger.error("Error fetching flagged films", { error });
    throw new Error(error.message);
  }

  return data;
}

export async function recoverFilm(film_uuid: string) {
  // Make film visible again and remove from flagged table
  const { error: updateError } = await supabase
    .from("films")
    .update({ is_flagged: false,flag_reason:"", moderation_status:"approved" })
    .eq("film_uuid", film_uuid);

  if (updateError) {
    logger.error("Error recovering film", { updateError });
    throw new Error(updateError.message);
  }

  const { error: deleteError } = await supabase
    .from("flagged_films")
    .delete()
    .eq("film_uuid", film_uuid);

  if (deleteError) {
    logger.error("Error deleting flagged film record", { deleteError });
    throw new Error(deleteError.message);
  }

  return { success: true, message: "Film recovered successfully." };
}

export async function deleteFilm(film_uuid: string) {
  const { error: filmError } = await supabase
    .from("films")
    .delete()
    .eq("film_uuid", film_uuid);

  if (filmError) {
    logger.error("Error deleting film", { filmError });
    throw new Error(filmError.message);
  }

  const { error: flaggedError } = await supabase
    .from("flagged_films")
    .delete()
    .eq("film_uuid", film_uuid);

  if (flaggedError) {
    logger.error("Error removing flagged film", { flaggedError });
    throw new Error(flaggedError.message);
  }

  return { success: true, message: "Film deleted permanently." };
}
