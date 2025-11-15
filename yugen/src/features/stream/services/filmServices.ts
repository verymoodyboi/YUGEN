import { api } from "../../../lib/api";
import { Film } from "../types/film";

// Fetch a film by ID
export async function fetchFilm(filmId: string, token: string): Promise<Film> {
  const { data } = await api.get<{ film: Film }>(
    `/stream/${filmId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data.film;
}

// Increment view count
export async function incrementView(filmId: string, token: string): Promise<void> {
  await api.post(
    `/stream/${filmId}/increment-view`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
