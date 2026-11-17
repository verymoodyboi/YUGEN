import { api } from "../../lib/api";

export const fetchRandomFilms = async (limit = 1000) => {
  const response = await api.get("/explore/random", { params: { limit } });
  return response.data.data;
};
