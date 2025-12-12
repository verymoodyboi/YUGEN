import { useState, useCallback } from "react";
import { createPlaylist } from "../services/createPlaylist";
import { fetchMyPlaylists as fetchMyPlaylistsService } from "../services/fetchMyPlaylists";
import { useAuth } from "../../../contexts/AuthContext";
interface Playlist {
  playlist_uuid: string;
  playlist_name: string;
  is_public: boolean;
}

export function usePlaylist() {

  const [myPlaylists, setMyPlaylists] = useState<Playlist[] | any>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
const {getAccessToken}= useAuth()
  const fetchMyPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      const data = await fetchMyPlaylistsService(token); // call the service
      setMyPlaylists(data.playlists);
    } catch (err) {
      console.error("Error fetching playlists:", err);
      setMyPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  const handleCreatePlaylist = useCallback(
    async (playlistName: string, isPublic: boolean) => {
      if (!playlistName.trim()) return false;
      try {
        setCreating(true);
        const token = await getAccessToken();
        await createPlaylist({ playlist_name: playlistName, is_public: isPublic }, token);
        await fetchMyPlaylists(); // refresh after creation
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
    creating,
    fetchMyPlaylists,
    handleCreatePlaylist,
    handleLocalPlaylistDelete,
    handleLocalPlaylistUpdate
  };
}
