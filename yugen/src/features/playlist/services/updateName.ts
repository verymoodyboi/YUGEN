import {api} from "../../../lib/api";


export async function updateName(
  playlist_uuid: string,
  newName: string,
  token: string
) {
  const { data } = await api.post(
    "/playlists/update-name",
    { playlist_uuid, newName },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}
