import { api } from "../../lib/api";

export const toggleWatchlist = async (filmID: string, token: string) => {
  const { data } = await api.post(
    `/watchlist/toggle`,
    { filmID },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data.inWatchlist;
};
export const checkWatchlist = async (filmID: string, token: string) => {
  const { data } = await api.get(`/watchlist/check`, {
    params: { filmID },
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.inWatchlist;
};
export const getMyWatchlist = async (token: string) => {
  const { data } = await api.get(`/watchlist/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.watchlist;
};