import { useState, useEffect } from "react";
import { fetchPlaylistMeta, fetchPlaylistFilms, getNextFilm } from "../services/watchPlaylistServices";

export function usePlaylist(
  playlistId?: string | null,
  currentFilmId?: string | null,
  getAccessToken?: () => Promise<string>
) {
  const [playlist, setPlaylist] = useState<any>(null);
  const [films, setFilms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shuffle, setShuffle] = useState(false);

  useEffect(() => {
    if (!playlistId || !getAccessToken) {
      setLoading(false);
      return;
    }

    let active = true;
    const loadPlaylist = async () => {
      setLoading(true);
      try {
        const token = await getAccessToken();
        const [meta, filmList] = await Promise.all([
          fetchPlaylistMeta(playlistId, token),
          fetchPlaylistFilms(playlistId, token),
        ]);
        if (active) {
          setPlaylist(meta);
          setFilms(filmList);
        }
      } catch (err) {
        console.error("Error loading playlist:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPlaylist();
    return () => {
      active = false;
    };
  }, [playlistId, getAccessToken]);

  const getNext = () => getNextFilm(films, currentFilmId || null, shuffle);
  const toggleShuffle = () => setShuffle((s) => !s);

  return {
    playlist,
    films,
    loading,
    shuffle,
    toggleShuffle,
    getNext,
  };
}
