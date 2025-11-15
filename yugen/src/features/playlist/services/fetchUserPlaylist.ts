import { api } from "../../../lib/api";
export async function fetchUserPlaylists(userId: string, token: string) {
  const { data } = await api.get("/playlists/user", {
    params: { userId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.playlists;
}