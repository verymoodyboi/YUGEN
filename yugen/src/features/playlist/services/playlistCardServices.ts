import { api } from "../../../lib/api";

export async function togglePlaylistPublic(playlist_uuid: string, token: string) {
  const { data } = await api.post(
    "/playlists/togglePublic",
    { playlist_uuid },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data.isPub;
}

export async function checkPlaylistPublic(playlist_uuid: string, token: string) {
  const { data } = await api.get("/playlists/checkPublic", {
    params: { playlist_uuid },
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.isPub;
}
