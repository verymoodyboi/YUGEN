import { useState, useEffect, useCallback } from "react";
import { togglePlaylistPublic, checkPlaylistPublic } from "../services/playlistCardServices";
import { deletePlaylist } from "../services/deletePlaylist";

import { useAuth } from "../../../contexts/AuthContext";
import { updateName } from "../services/updateName";
import { fetchMyPlaylists } from "../services/fetchMyPlaylists";

export function usePlaylistCard(playlist: any) {
  const { getAccessToken } = useAuth();
  const {userInfo}= useAuth()
  const [isPublic, setIsPublic] = useState<boolean>();
  const [myPlaylists, setMyPlaylists] = useState<any[]>([]);

  //  Check current public status
  const fetchPublicStatus = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const status = await checkPlaylistPublic(playlist.playlist_uuid, token);
      setIsPublic(status);
    } catch (err) {
      console.error("Error checking Public:", err);
    }
  }, [playlist.playlist_uuid, getAccessToken]);

  //  Toggle public/private
  const handleTogglePublic = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const newStatus = await togglePlaylistPublic(playlist.playlist_uuid, token);
      setIsPublic(newStatus);
    } catch (err) {
      console.error("Error toggling public:", err);
    }
  }, [playlist.playlist_uuid, getAccessToken]);

  useEffect(() => {
    if (playlist?.playlist_uuid) fetchPublicStatus();
  }, [playlist?.playlist_uuid, fetchPublicStatus]);
const handleDeletePlaylist = useCallback(async () => {
  try {
    const token = await getAccessToken();
    await deletePlaylist(playlist.playlist_uuid, token);
  } catch (err) {
    console.error("Error deleting playlist:", err);
  }
}, [playlist.playlist_uuid, getAccessToken]);

const handleUpdateName = useCallback(async (newName:string) => {
  try {
    const token = await getAccessToken();
    await updateName(playlist.playlist_uuid,newName, token);
  } catch (err) {
    console.error("Error updating name:", err);
  }
}, [playlist.playlist_uuid, getAccessToken]);





  return { isPublic, handleTogglePublic,handleDeletePlaylist,handleUpdateName };

}

