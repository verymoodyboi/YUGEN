import { api } from "../../../lib/api";

export const logFilmClick = async (filmID: string, token: any) => {
  return api.post(`/stream/${filmID}/click`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

