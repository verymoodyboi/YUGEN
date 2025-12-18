import supabase from "../../lib/supabase.js";

export async function getUserProfile(username: string) {
  const { data, error } = await supabase
    .from("users")
    .select(`
      username,
      f_name,
      l_name,
      age,
      is_artist,
      is_admin,
      bio,
      pfp_path,
      films_count,
      sub_count,
      region,
      join_date,
      gender,
      is_student,
      sid,
      university,
      youtube,
      instagram,
      linkedin,
      watchlist_count,
      role,
      auth_id
    `)
    .eq("username", username)
    .single();

  if (error) throw error;
  return data;
}

export async function getLatestProfileFilms(
  uploaderID: string,
  offset: number,
  limit: number
) {
  const { data, error } = await supabase
    .from("films")
    .select("*")
              .eq("is_flagged", false)
  .eq("moderation_status", "approved")
  .eq("poster_moderation_status", "approved")
    .eq("uploader_id", uploaderID)
    .order("release_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (data || []).map((film) => ({
    ...film,
    poster_path: film.poster_path?.replace(/\\/g, "/"),
  }));
}

export async function getMyUploads(
  uploaderID: string,
  offset: number,
  limit: number
) {
  const { data, error } = await supabase
    .from("films")
    .select("*")
    .eq("uploader_id", uploaderID)
    .order("release_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (data || []).map((film) => ({
    ...film,
    poster_path: film.poster_path?.replace(/\\/g, "/"),
  }));
}
