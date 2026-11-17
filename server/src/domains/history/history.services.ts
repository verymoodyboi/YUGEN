import supabase from '../../lib/supabase.js';

export async function addHistory(userId: string, filmId: string) {
  await supabase.from('historys_films')
    .delete()
    .eq('film_id', filmId)
    .eq('history_id', userId);

  const { count, error: countError } = await supabase
    .from('historys_films')
    .select('*', { count: 'exact', head: true })
    .eq('history_id', userId);

  if (countError) throw new Error(countError.message);

  // insert new row
  const { error: insertError } = await supabase
    .from('historys_films')
    .insert({
      history_id: userId,
      film_id: filmId,
      film_index: (count || 0) + 2,
    });

  if (insertError) throw new Error(insertError.message);
}


export async function removeHistory(userId: string, filmId: string) {
  await supabase.from('historys_films')
    .delete()
    .eq('film_id', filmId)
    .eq('history_id', userId);

  
}


export async function getHistory(userId: string) {
  const { data, error } = await supabase
    .from('historys_films')
    .select(`
      film_index,
      watched_at,
      films:film_id (
        film_uuid,
        film_title,
        film_genre,
        poster_path,
        avg_rating,
        thesis,
        view_count,
        uploader_id
      )
    `)
    .eq('history_id', userId)
    .order('watched_at', { ascending: false });

  if (error) throw new Error(error.message);

  return data ?? [];
}
