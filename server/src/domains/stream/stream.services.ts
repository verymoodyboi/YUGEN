import supabase from '../../lib/supabase.js';
import  logger from '../../lib/logger.js';

export async function getFilmById(filmId: string) {
  const { data: film, error } = await supabase
    .from('films')
    .select(`
      *,
      uploader:users!uploader_id(auth_id, username, f_name, l_name, pfp_path, bio, films_count, sub_count)
    `)
    .eq('film_uuid', filmId)
    .single();

  if (error || !film) {
    logger.warn('Film not found', { filmId });
    throw new Error('Film not found');
  }

  return film;
}




export async function updateFilmPopularity(filmId: string) {
  const { error } = await supabase.rpc('update_film_popularity', {
    p_film_uuid: filmId,  
  });

  if (error) {
    logger.error(' Failed to update film popularity', { filmId, error });
    throw new Error('Failed to update film popularity');
  }

  logger.info(` Popularity updated for film ${filmId}`);
  return { success: true };
}



export async function incrementView(filmId: string) {
  const { error: incrementError } = await supabase.rpc('increment_view_count', {
    p_film_uuid: filmId,
  });

  if (incrementError) {
    logger.error('Failed to increment view count', { filmId, error: incrementError });
    throw new Error('Failed to increment view count');
  }

  const { data, error: fetchError } = await supabase
    .from('films')
    .select('view_count')
    .eq('film_uuid', filmId)
    .single();

  if (fetchError || !data) {
    logger.error('Failed to fetch updated view count', { filmId, error: fetchError });
    throw new Error('Failed to fetch updated view count');
  }

  const currentViews = data.view_count ?? 0;

  if (currentViews % 10 === 0) {
    try {
      await updateFilmPopularity(filmId);
    } catch (popularityError) {
      logger.warn('Popularity update failed after view increment', {
        filmId,
        error: popularityError,
      });
    }
  }

  return { success: true, views: currentViews };
}


export async function logClick(filmId: string, userId: string) {
  const { error } = await supabase.from('click_through_films').insert({
    auth_id: userId,
    film_uuid: filmId,
  });

  if (error) {
    logger.error('Failed to log click', { filmId, userId, error });
    throw new Error('Failed to log click');
  }

  return { success: true };
}
