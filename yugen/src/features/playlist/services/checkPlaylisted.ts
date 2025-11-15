import {api} from "../../../lib/api";
export async function checkFilmInPlaylist(playlistID: string, filmID: string, token: string) {
  const { data } = await api.get(`/playlists/check-listed`, {
    params: { playlistID, filmID },
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("checkFilmInPlaylist response:", data, playlistID, filmID);
  return data.listed as boolean;
}