import supabase from '../../lib/supabase.js';

export async function getUserPlaylists(userId: string) {
  const { data, error } = await supabase
    .from('playlists')
    .select(`
      playlist_uuid,
      playlist_name,
      is_public,
      film_count,
      creator:users!inner (
        username,
        pfp_path
      ),
      playlist_films:playlists_films (
        film_index,
        films (
          film_uuid,
          film_title,
          poster_path,
          release_date,
          film_duration,
          avg_rating
        )
      )
    `)
    .eq('user_id', userId)
    .eq('is_public', true);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPlaylistFilms(id: string) {
  const { data, error } = await supabase
    .from('playlists_films')
    .select(`
      film_id,
      film_index,
      films(film_uuid, film_title, film_genre, poster_path, avg_rating,uploader_id)
    `)
    .eq('playlist_id', id)
    .order('film_index', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPlaylistMeta(id: string) {
  const { data, error } = await supabase
    .from('playlists')
    .select('playlist_name, film_count, users(username)')
    .eq('playlist_uuid', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getMyPlaylists(userId: string) {
  const { data, error } = await supabase
    .from('playlists')
    .select(`
      playlist_uuid,
      playlist_name,
      is_public,
      film_count,
      creator:users!inner (
        username,
        pfp_path
      ),
      playlist_films:playlists_films (
        film_index,
        films (
          film_uuid,
          film_title,
          poster_path,
          release_date,
          film_duration,
          avg_rating,
          view_count,
          uploader_id
        )
      )
    `)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createPlaylist(userId: string, playlist_name: string, is_public: boolean) {
  const { error } = await supabase.from('playlists').insert({
    playlist_name,
    is_public,
    user_id: userId,
  });
  if (error) throw new Error(error.message);
}

export async function addOrRemoveFilm(userId: string, playlistID: string, filmID: string) {
  const { data: playlist, error: playlistError } = await supabase
    .from('playlists')
    .select('playlist_uuid, user_id')
    .eq('playlist_uuid', playlistID)
    .single();

  if (playlistError || !playlist) throw new Error('Playlist not found');
  if (playlist.user_id !== userId) throw new Error('Not authorized');

  const { data: existing } = await supabase
    .from('playlists_films')
    .select('id')
    .eq('playlist_id', playlistID)
    .eq('film_id', filmID)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('playlists_films')
      .delete()
      .eq('playlist_id', playlistID)
      .eq('film_id', filmID);
    return { success: true, action: 'removed' };
  }

  const { count } = await supabase
    .from('playlists_films')
    .select('*', { count: 'exact', head: true })
    .eq('playlist_id', playlistID);

  await supabase.from('playlists_films').insert({
    playlist_id: playlistID,
    film_id: filmID,
    film_index: (count || 0) + 1,
  });

  return { success: true, action: 'added' };
}

export async function checkListed(userId: string, playlistID: string, filmID: string) {
  const { data: playlist, error: playlistError } = await supabase
    .from('playlists')
    .select('playlist_uuid, user_id')
    .eq('playlist_uuid', playlistID)
    .single();

  if (playlistError || !playlist) throw new Error('Playlist not found');
  if (playlist.user_id !== userId) throw new Error('Not authorized');

  const { data: existing, error } = await supabase
    .from('playlists_films')
    .select('id')
    .eq('film_id', filmID)
    .eq('playlist_id', playlistID)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return !!existing;
}

export async function togglePublic(userId: string, playlist_uuid: string) {
  const { data: pub, error: fetchError } = await supabase
    .from('playlists')
    .select('is_public, user_id')
    .eq('playlist_uuid', playlist_uuid)
    .maybeSingle();

  if (fetchError || !pub) throw new Error('Playlist not found');
  if (pub.user_id !== userId) throw new Error('Not authorized');

  const newState = !pub.is_public;
  await supabase.from('playlists')
    .update({ is_public: newState })
    .eq('playlist_uuid', playlist_uuid);

  return { isPub: newState };
}

export async function checkPublic(playlist_uuid: string) {
  const { data, error } = await supabase
    .from('playlists')
    .select('is_public')
    .eq('playlist_uuid', playlist_uuid)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return { isPub: data?.is_public ?? false };
}

export async function deletePlaylists(
  playlist_uuid: string,
  user_id: string
) {
  const { data, error } = await supabase
    .from("playlists")
    .delete()
    .eq("playlist_uuid", playlist_uuid)
    .eq("user_id", user_id)
    .select();

  if (error) throw new Error(error.message);

  return data ?? []; 
}

export async function updateName(userId: string, playlist_uuid: string,newName:string) {
  const { data: old, error: fetchError } = await supabase
    .from('playlists')
    .select('user_id')
    .eq('playlist_uuid', playlist_uuid)
    .maybeSingle();

  if (fetchError || !old) throw new Error('Playlist not found');
  if (old.user_id !== userId) throw new Error('Not authorized');

  await supabase.from('playlists')
    .update({ playlist_name: newName })
    .eq('playlist_uuid', playlist_uuid);

  return { updated_to: newName };
}