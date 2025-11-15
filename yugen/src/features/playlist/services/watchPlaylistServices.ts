// src/features/playlist/services/playlistServices.ts
import { api } from "../../../lib/api";

/**
 * Fetch metadata for a playlist
 */
export async function fetchPlaylistMeta(playlistId: string, token: string) {
  const res = await api.get(`/playlists/${playlistId}/meta`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.playlist || res.data;
}

/**
 * Fetch films in a playlist
 */
export async function fetchPlaylistFilms(playlistId: string, token: string) {
  const res = await api.get(`/playlists/${playlistId}/films`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.films || res.data || [];
}

/**
 * Determine the next film based on shuffle or sequential mode
 */
export function getNextFilm(
  films: any[],
  currentFilmId: string | null,
  shuffle: boolean
) {
  if (!films.length || !currentFilmId) return null;

  if (shuffle) {
    return films[Math.floor(Math.random() * films.length)]?.films ||
           films[Math.floor(Math.random() * films.length)];
  }

  const currentIndex = films.findIndex(
    (f) => (f.films || f)?.film_uuid === currentFilmId
  );

  if (currentIndex !== -1 && currentIndex < films.length - 1) {
    return films[currentIndex + 1].films || films[currentIndex + 1];
  }

  return null;
}
