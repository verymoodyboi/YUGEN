import {api} from "../../../lib/api";

export async function fetchMyPlaylists(token: string) {
  const res = await api.get("/playlists/my", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}