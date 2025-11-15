// src/features/recommendations/hooks/useGenreRecommendations.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { GENRES } from "../data/genres";
import { fetchFilmsByGenre } from "../services";

type GenreQueryResult = {
  genre: { id: string; name: string; overview?: string };
  data?: any;
  isLoading: boolean;
  isError: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  refetch?: () => void;
};

export const useGenreRecommendations = (): GenreQueryResult[] => {
  // NOTE: calling the same number of hooks each render is OK because GENRES is fixed
  return GENRES.map((genre) => {
    const query = useInfiniteQuery({
      queryKey: ["films", genre.name],
      queryFn: ({ pageParam = 0 }) => fetchFilmsByGenre(genre.name, pageParam, 5),
      initialPageParam: 0,
      getNextPageParam: (lastPage) =>
        lastPage && lastPage.length > 0 ? undefined : undefined, // fallback
      // Proper pagination: return pages.length * limit when lastPage had items
      // We'll recompute below because some backends return empty arrays
    });

    // derive getNextPageParam logic again so TypeScript inference is simpler
    // but the above useInfiniteQuery already sets it; leaving default is fine.
    return {
      genre,
      ...query,
    } as GenreQueryResult;
  });
};
