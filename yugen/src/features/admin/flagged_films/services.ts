// src/features/admin/flagged_films/services.ts
import { api } from "../../../lib/api";

export interface FlaggedFilm {
  id: number;
  film_uuid: string;
  reason: string;
  flagged_date: string;
  films?: {
    title?: string;
    cover_path?: string;
    description?: string;
    author_id?: string;
  };
}

export async function fetchFlaggedFilms(): Promise<FlaggedFilm[]> {
  const { data } = await api.get("/flagged");
  return data;
}

export async function recoverFilm(film_uuid: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post(`flagged/recover/${film_uuid}`);
  return data;
}

export async function deleteFilm(film_uuid: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`flagged/${film_uuid}`);
  return data;
}
