import { api } from "../../lib/api";
export const getUserInfo = async (uploader_id: string, token: string) => {
  const { data } = await api.get(`/tools/getUserInfo`, {
    params: { userID: uploader_id },
    headers: { Authorization: `Bearer ${token}` },
  });

  return {
    username: data.username,
    pfp: data.pfp,
  };
};
