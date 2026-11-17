import { useState, useCallback } from "react";
import { createPlaylist } from "../services/createPlaylist";
import { fetchMyPlaylists as fetchMyPlaylistsService } from "../services/fetchMyPlaylists";
import { fetchMySavedPlaylists as fetchMySavedPlaylistsService } from "../services/savePlaylist";
import { useAuth } from "../../../contexts/AuthContext";

interface Playlist {
  playlist_uuid: string;
  playlist_name: string;
  is_public: boolean;
}

export function usePlaylist() {
  const { getAccessToken } = useAuth();

  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const [savedPlaylists, setSavedPlaylists] = useState<Playlist[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const fetchMyPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      const data = await fetchMyPlaylistsService(token);
      setMyPlaylists(data.playlists);
    } catch (err) {
      console.error("Error fetching playlists:", err);
      setMyPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

 
  const fetchMySavedPlaylists = useCallback(async () => {
    setSavedLoading(true);
    try {
      const token = await getAccessToken();
      const data = await fetchMySavedPlaylistsService(token);
      setSavedPlaylists(data.playlists);
    } catch (err) {
      console.error("Error fetching saved playlists:", err);
      setSavedPlaylists([]);
    } finally {
      setSavedLoading(false);
    }
  }, [getAccessToken]);


  const handleCreatePlaylist = useCallback(
    async (playlistName: string, isPublic: boolean) => {
      if (!playlistName.trim()) return false;
      try {
        setCreating(true);
        const token = await getAccessToken();
        await createPlaylist(
          { playlist_name: playlistName, is_public: isPublic },
          token
        );
        await fetchMyPlaylists();
        return true;
      } catch (err) {
        console.error("Error creating playlist:", err);
        return false;
      } finally {
        setCreating(false);
      }
    },
    [getAccessToken, fetchMyPlaylists]
  );
  const handleLocalPlaylistUpdate = (playlist_uuid: string, updates: any) => {
    setMyPlaylists((prev) =>
      prev.map((p) =>
        p.playlist_uuid === playlist_uuid ? { ...p, ...updates } : p
      )
    );
  };

  const handleLocalPlaylistDelete = (playlist_uuid: string) => {
    setMyPlaylists((prev) =>
      prev.filter((p) => p.playlist_uuid !== playlist_uuid)
    );
  };

  return {
    myPlaylists,
    loading,

    savedPlaylists,
    savedLoading,

    creating,

    fetchMyPlaylists,
    fetchMySavedPlaylists,

    handleCreatePlaylist,
    handleLocalPlaylistDelete,
    handleLocalPlaylistUpdate,
  };
}
