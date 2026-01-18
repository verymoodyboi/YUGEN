import { api } from "../../lib/api";

export const fetchFilmsByCountry = async (
  country: string,
  limit = 12,
  offset = 0
) => {
  const res = await api.get(`/globe/${country}/films`, {
    params: { limit, offset },
  });
  return res.data.data;
};


export const fetchCountryStats = async (country: string) => {
  const res = await api.get(`/globe/${country}/stats`);
  return res.data.data;
};

export const fetchUsersByCountry = async (
  country: string,
  limit = 9,
  offset = 0
) => {
  const res = await api.get(`/globe/${country}/users`, {
    params: { limit, offset },
  });
  return res.data.data;
};
