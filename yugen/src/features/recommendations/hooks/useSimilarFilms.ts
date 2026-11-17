import { useEffect, useState } from "react";
import { getSimilarFilms } from "../services";

export function useSimilarFilms(filmId?: string | null) {
  const [films, setFilms] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!filmId) {
      setFilms([]);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const list = await getSimilarFilms(filmId);
        if (mounted) setFilms(list);
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [filmId]);

  return { films, isLoading, error };
}
