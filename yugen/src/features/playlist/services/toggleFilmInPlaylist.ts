import {api} from "../../../lib/api";


export async function toggleFilmInPlaylist(
  playlistID: string,
  filmID: string,
  token: string
) {
  const { data } = await api.post(
    "/playlists/add-to",
    { playlistID, filmID },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}
