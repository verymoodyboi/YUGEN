import { useState, useEffect, useCallback } from "react";
import {
  checkWatchlist,
  toggleWatchlist
} from "../../watchlist/services";
import { fetchMyPlaylists } from "../../playlist/services/fetchMyPlaylists";
import { checkFilmInPlaylist } from "../../playlist/services/checkPlaylisted";
import { toggleFilmInPlaylist } from "../../playlist/services/toggleFilmInPlaylist";
import { fetchFilm, incrementView } from "../services/filmServices";

interface UseFilmsProps {
  filmId?: string;
  getAccessToken?: () => Promise<string>;
}

export function useFilms({ filmId, getAccessToken }: UseFilmsProps) {
  const [filmData, setFilmData] = useState<any>(null);
  const [watchlisted, setWatchlisted] = useState(false);
  const [myPlaylists, setMyPlaylists] = useState<any[]>([]);
  const [listedPlaylists, setListedPlaylists] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  const loadFilmData = useCallback(async () => {
    if (!filmId || !getAccessToken) return;
    setLoading(true);
    try {
      const token = await getAccessToken();
      const film = await fetchFilm(filmId, token);
      setFilmData(film);
    } catch (err) {
      console.error("Error fetching film:", err);
    } finally {
      setLoading(false);
    }
  }, [filmId, getAccessToken]);

  const handleIncrementView = useCallback(async () => {
    if (!filmId || !getAccessToken) return;
    try {
      const token = await getAccessToken();
      await incrementView(filmId, token);
    } catch (err) {
      console.error("Error incrementing view count:", err);
    }
  }, [filmId, getAccessToken]);

  const loadWatchlist = useCallback(async () => {
    if (!filmId || !getAccessToken) return;
    try {
      const token = await getAccessToken();
      const inWatchlist = await checkWatchlist(filmId, token);
      setWatchlisted(inWatchlist);
    } catch (err) {
      console.error("Error checking watchlist:", err);
    }
  }, [filmId, getAccessToken]);

  const handleWatchlist = useCallback(async () => {
    if (!filmId || !getAccessToken) return;
    try {
      const token = await getAccessToken();
      const inWatchlist = await toggleWatchlist(filmId, token);
      setWatchlisted(inWatchlist);
    } catch (err) {
      console.error("Error toggling watchlist:", err);
    }
  }, [filmId, getAccessToken]);

  const loadPlaylistsAndChecks = useCallback(async () => {
    if (!filmId || !getAccessToken) return;
    setLoading(true);
    try {
      const token = await getAccessToken();
      const playlistsResponse = await fetchMyPlaylists(token);
      const playlists = Array.isArray(playlistsResponse.playlists) ? playlistsResponse.playlists : [];
      setMyPlaylists(playlists);

      const checked: { [key: string]: boolean } = {};
      for (const pl of playlists) {
        try {
          const inPlaylist = await checkFilmInPlaylist(pl.playlist_uuid, filmId, token);
          checked[pl.playlist_uuid] = inPlaylist;
        } catch {
          checked[pl.playlist_uuid] = false;
        }
      }
      setListedPlaylists(checked);
    } catch (err) {
      console.error("Error loading playlists:", err);
      setMyPlaylists([]);
      setListedPlaylists({});
    } finally {
      setLoading(false);
    }
  }, [filmId, getAccessToken]);

  const handleAddToPlaylist = useCallback(async (playlistID: string) => {
    if (!filmId || !getAccessToken) return;
    try {
      const token = await getAccessToken();
      const { action } = await toggleFilmInPlaylist(playlistID, filmId, token);
      setListedPlaylists(prev => ({ ...prev, [playlistID]: action === "added" }));
    } catch (err) {
      console.error("Error toggling film in playlist:", err);
    }
  }, [filmId, getAccessToken]);

  useEffect(() => {
    loadFilmData();
    loadWatchlist();
    loadPlaylistsAndChecks();
  }, [loadFilmData, loadWatchlist, loadPlaylistsAndChecks]);

  return {
    filmData,
    loading,
    handleIncrementView,
    watchlisted,
    handleWatchlist,
    myPlaylists,
    listedPlaylists,
    handleAddToPlaylist,
  };
}
