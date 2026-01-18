import { useState, useEffect, useCallback } from "react";
import { togglePlaylistPublic, checkPlaylistPublic } from "../services/playlistCardServices";
import { deletePlaylist } from "../services/deletePlaylist";
import { updateName } from "../services/updateName";
import { useAuth } from "../../../contexts/AuthContext";
import { checkPlaylistSaved, togglePlaylistSaved } from "../services/savePlaylist";

export function usePlaylistCard(playlist: any) {
  const { getAccessToken, userInfo } = useAuth();
  const [isPublic, setIsPublic] = useState<boolean>();
  const [isSaved, setIsSaved] = useState<boolean>();

  const fetchPublicStatus = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const status = await checkPlaylistPublic(playlist.playlist_uuid, token);
      setIsPublic(status);
    } catch (err) {
      console.error("Error checking Public:", err);
    }
  }, [playlist.playlist_uuid, getAccessToken]);

  const handleTogglePublic = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const newStatus = await togglePlaylistPublic(playlist.playlist_uuid, token);
      setIsPublic(newStatus);
    } catch (err) {
      console.error("Error toggling public:", err);
    }
  }, [playlist.playlist_uuid, getAccessToken]);

  const fetchSavedStatus = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const saved = await checkPlaylistSaved(playlist.playlist_uuid, token);
      setIsSaved(saved);
    } catch (err) {
      console.error("Error checking saved:", err);
    }
  }, [playlist.playlist_uuid, getAccessToken]);

  const handleToggleSaved = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const newSaved = await togglePlaylistSaved(playlist.playlist_uuid, token);
      setIsSaved(newSaved);
    } catch (err) {
      console.error("Error toggling saved:", err);
    }
  }, [playlist.playlist_uuid, getAccessToken]);

  const handleDeletePlaylist = useCallback(async () => {
    try {
      const token = await getAccessToken();
      await deletePlaylist(playlist.playlist_uuid, token);
    } catch (err) {
      console.error("Error deleting playlist:", err);
    }
  }, [playlist.playlist_uuid, getAccessToken]);

  const handleUpdateName = useCallback(async (newName: string) => {
    try {
      const token = await getAccessToken();
      await updateName(playlist.playlist_uuid, newName, token);
    } catch (err) {
      console.error("Error updating name:", err);
    }
  }, [playlist.playlist_uuid, getAccessToken]);

  useEffect(() => {
    if (playlist?.playlist_uuid) {
      fetchPublicStatus();
      fetchSavedStatus(); 
    }
  }, [playlist?.playlist_uuid, fetchPublicStatus, fetchSavedStatus]);

  return {
    isPublic,
    handleTogglePublic,
    handleDeletePlaylist,
    handleUpdateName,
    isSaved,
    handleToggleSaved, 
  };
}
