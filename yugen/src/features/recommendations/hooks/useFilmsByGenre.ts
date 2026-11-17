import { useState, useCallback, useEffect } from "react";
import { api } from "../../../lib/api"; 
import { Film } from "../../stream/types/film";

interface UseFilmsByGenreResult {
  films: Film[];
  loading: boolean;
  hasMore: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

export function useFilmsByGenre(genre?: string, pageSize = 5): UseFilmsByGenreResult {
  const [films, setFilms] = useState<Film[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const fetchFilms = useCallback(
    async (pageParam = 0) => {
      if (!genre) return;
      setLoading(true);
      try {
        const { data } = await api.get<Film[]>("/recommendations/films-by-genre", {
          params: { genre, offset: pageParam * pageSize, limit: pageSize },
        });
        if (data.length < pageSize) setHasMore(false);
        setFilms((prev) => (pageParam === 0 ? data : [...prev, ...data]));
      } catch (err) {
        console.error("Error fetching films by genre:", err);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [genre, pageSize]
  );

  const fetchNextPage = useCallback(() => {
    if (!hasMore) return;
    const nextPage = page + 1;
    fetchFilms(nextPage);
    setPage(nextPage);
  }, [fetchFilms, page, hasMore]);

  const refetch = useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchFilms(0);
  }, [fetchFilms]);

  useEffect(() => {
    refetch();
  }, [genre, refetch]);

  return { films, loading, hasMore, fetchNextPage, refetch };
}
