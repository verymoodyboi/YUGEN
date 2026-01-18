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
  return GENRES.map((genre) => {
    const query = useInfiniteQuery({
      queryKey: ["films", genre.name],
      queryFn: ({ pageParam = 0 }) => fetchFilmsByGenre(genre.name, pageParam, 5),
      initialPageParam: 0,
      getNextPageParam: (lastPage) =>
        lastPage && lastPage.length > 0 ? undefined : undefined, 
     
    });

   
    return {
      genre,
      ...query,
    } as GenreQueryResult;
  });
};
