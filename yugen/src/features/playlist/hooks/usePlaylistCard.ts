import { useState, useEffect, useCallback } from "react";
import { togglePlaylistPublic, checkPlaylistPublic } from "../services/playlistCardServices";
import { useAuth } from "../../../contexts/AuthContext";

export function usePlaylistCard(playlist: any) {
  const { getAccessToken } = useAuth();
  const [isPublic, setIsPublic] = useState<boolean>();

  // ✅ Check current public status
  const fetchPublicStatus = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const status = await checkPlaylistPublic(playlist.playlist_uuid, token);
      setIsPublic(status);
    } catch (err) {
      console.error("Error checking Public:", err);
    }
  }, [playlist.playlist_uuid, getAccessToken]);

  // ✅ Toggle public/private
  const handleTogglePublic = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const newStatus = await togglePlaylistPublic(playlist.playlist_uuid, token);
      setIsPublic(newStatus);
    } catch (err) {
      console.error("Error toggling public:", err);
    }
  }, [playlist.playlist_uuid, getAccessToken]);

  // ✅ Run on mount
  useEffect(() => {
    if (playlist?.playlist_uuid) fetchPublicStatus();
  }, [playlist?.playlist_uuid, fetchPublicStatus]);

  return { isPublic, handleTogglePublic };
}
