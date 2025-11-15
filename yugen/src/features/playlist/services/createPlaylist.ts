import { api } from "../../../lib/api";

interface CreatePlaylistParams {
  playlist_name: string;
  is_public: boolean;
}

export async function createPlaylist(params: CreatePlaylistParams, token: string) {
  const { playlist_name, is_public } = params;
  const { data } = await api.post("/playlists/create", { playlist_name, is_public }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
