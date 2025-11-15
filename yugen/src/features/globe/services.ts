// src/features/globe/services.ts
import { api } from "../../lib/api";

/**
 * Fetch films for a given country (supports pagination)
 */
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

/**
 * Fetch stats (film_count, artist_count) for a given country
 */
export const fetchCountryStats = async (country: string) => {
  const res = await api.get(`/globe/${country}/stats`);
  return res.data.data;
};

/**
 * Fetch users (artists) for a given country (supports pagination)
 */
export const fetchUsersByCountry = async (
  country: string,
  limit = 9,
  offset = 0
) => {
  const res = await api.get(`/globe/${country}/users`, {
    params: { limit, offset },
  });
  // backend returns { success, data }, so use res.data.data
  return res.data.data;
};
