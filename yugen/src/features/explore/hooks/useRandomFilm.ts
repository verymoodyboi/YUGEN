import { useEffect, useState, useCallback } from "react";
import { fetchRandomFilms } from "../services";

export const useRandomFilm = () => {
  const [films, setFilms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const loadFilms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRandomFilms(50);
      setFilms(data || []);
    } catch (err) {
      console.error("Failed to fetch films:", err);
      setError("Failed to load films");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFilms();
  }, [loadFilms]);

  return { films, loading, error, refetch: loadFilms };
};
