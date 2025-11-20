import supabase from "../../lib/supabase.js";

/**
 * Fetch films for a given country name, ordered by view_count DESC
 */
export const getFilmsByCountry = async (
  country: string,
  limit = 12,
  offset = 0
) => {
  const { data, error } = await supabase
    .from("films")
    .select(
      `
      *,
      uploader:users!fk_uploader (
        auth_id,
        username,
        pfp_path,
        bio,
        sub_count,
        films_count
      )
    `
    )
    .eq("country", country)
    .order("view_count", { ascending: false })
    .range(offset, offset + limit - 1); //  pagination support

  if (error) throw new Error(error.message);
  return data;
};




/**
 * Fetch film_count and artist_count for a given country name
 */
export const getCountryStats = async (name: string) => {
  const { data, error } = await supabase
    .from("regions")
    .select("film_count, artist_count")
    .eq("name", name)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Fetch artists for a given country name, ordered by sub_count DESC
 */
export const fetchArtistsByCountry = async (
  countryName: string,
  limit = 9,
  offset = 0
) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("region", countryName)
    .order("sub_count", { ascending: false })
    .range(offset, offset + limit - 1); //  pagination support

  if (error) throw new Error(error.message);
  return data;
};
