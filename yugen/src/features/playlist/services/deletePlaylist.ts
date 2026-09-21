import {api} from "../../../lib/api";


export async function deletePlaylist(
  playlistID: string,
  token: string
) {
  const { data } = await api.delete("/playlists/", {
    headers: { Authorization: `Bearer ${token}` },
    data: { playlistID },   
  });

  return data;
}
