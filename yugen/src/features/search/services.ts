// src/features/search/services.ts
import { api } from "../../lib/api";

export const searchFilms = async (query: string, offset = 0, limit = 10) => {
  const res = await api.get("/search/films", {
    params: { query, offset, limit },
  });
  return res.data;
};

export const searchFilmSuggestions = async (query: string, offset = 0, limit = 10) => {
  const res = await api.get("/search/advanced", {
    params: { query, offset, limit },
  });
  return res.data;
};

export const searchAccounts = async (query: string, offset = 0, limit = 10) => {
  const res = await api.get("/search/accounts", {
    params: { query, offset, limit },
  });
  return res.data;
};

export const searchPlaylists = async (query: string, offset = 0, limit = 10) => {
  const res = await api.get("/search/playlists", {
    params: { query, offset, limit },
  });
  return res.data;
};

export const quickSearch = async (query: string) => {
  const res = await api.get("/search", { params: { q: query } });
  return res.data.results || [];
};


export const searchMentions = async (token: string, query: string) => {
  if (!query.trim()) return [];
  const res = await api.get(
    `/search/mentions/?q=${encodeURIComponent(query)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const users = res.data.users || [];
  return users.map((u: any) => ({
    username: u.username,
    pfp: u.pfp_path,
  }));
};
