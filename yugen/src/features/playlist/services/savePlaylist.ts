import {api} from "../../../lib/api";

export async function checkPlaylistSaved(playlist_uuid: string, token: string) {
  const res = await api.get("/playlists/saved/check", {
    params: { playlist_uuid },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.saved as boolean;
}

export async function togglePlaylistSaved(playlist_uuid: string, token: string) {
  const res = await api.post(
    "/playlists/saved/toggle",
    { playlist_uuid },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.saved as boolean;
}

export async function fetchMySavedPlaylists(token: string) {
  const res = await api.get(
    `/playlists/saved/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}
