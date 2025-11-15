import supabase from "../../lib/supabase.js";

export async function toggleWatchlist(userId: string, filmID: string) {
  const { data: existing, error: fetchError } = await supabase
    .from("watchlists_films")
    .select("*")
    .eq("film_id", filmID)
    .eq("watchlist_id", userId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  if (existing) {
    const { error: deleteError } = await supabase
      .from("watchlists_films")
      .delete()
      .eq("film_id", filmID)
      .eq("watchlist_id", userId);

    if (deleteError) throw new Error(deleteError.message);
    return { inWatchlist: false };
  } else {
    const { count, error: countError } = await supabase
      .from("watchlists_films")
      .select("*", { count: "exact", head: true })
      .eq("watchlist_id", userId);

    if (countError) throw new Error(countError.message);

    const { error: insertError } = await supabase
      .from("watchlists_films")
      .insert({
        watchlist_id: userId,
        film_id: filmID,
        film_index: (count || 0) + 1,
      });

    if (insertError) throw new Error(insertError.message);
    return { inWatchlist: true };
  }
}

export async function checkWatchlist(userId: string, filmID: string) {
  const { data: existing, error } = await supabase
    .from("watchlists_films")
    .select("*")
    .eq("film_id", filmID)
    .eq("watchlist_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return { inWatchlist: !!existing };
}

export async function getMyWatchlist(userId: string) {
  const { data, error } = await supabase
    .from("watchlists_films")
    .select(
      `
      film_index,
      films:film_id (
        film_uuid,
        film_title,
        film_genre,
        poster_path,
        avg_rating,
        thesis
      )
    `
    )
    .eq("watchlist_id", userId)
    .order("film_index", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
