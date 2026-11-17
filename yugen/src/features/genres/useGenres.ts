import { useEffect, useState } from "react";
import { fetchFilmsByGenre, fetchAllGenres } from "../recommendations/services";


export const useGenresWithFilms = () => {
  const [genresWithFilms, setGenresWithFilms] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const allGenres = await fetchAllGenres();
        if (!Array.isArray(allGenres)) throw new Error("Invalid genres response");
        setGenres(allGenres);

        const enrichedGenres = await Promise.all(
          allGenres.map(async (genre: any) => {
            try {
              const films = await fetchFilmsByGenre(genre.genre, 0, 100);
              return { ...genre, films: Array.isArray(films) ? films : [] };
            } catch (err) {
              console.error(`Error fetching films for ${genre.genre}:`, err);
              return { ...genre, films: [] };
            }
          })
        );

        setGenresWithFilms(enrichedGenres);
      } catch (err: any) {
        console.error("Error fetching genres:", err);
        setError(err.message || "Failed to fetch genres");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { genresWithFilms, loading, error, genres };
};
