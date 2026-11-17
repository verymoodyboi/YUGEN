import {api} from "../../../lib/api";

export async function fetchMyPlaylists(token: any) {
  const res = await api.get("/playlists/my", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}