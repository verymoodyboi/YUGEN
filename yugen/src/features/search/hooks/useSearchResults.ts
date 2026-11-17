import { useInfiniteQuery } from "@tanstack/react-query";
import {
  searchFilms,
  searchFilmSuggestions,
  searchAccounts,
  searchPlaylists,
} from "../services";

export const useSearchResults = (query: string | null) => {
  const filmsQuery = useInfiniteQuery({
    queryKey: ["films", query],
    queryFn: ({ pageParam = 0 }) => searchFilms(query || "", pageParam),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 10 ? pages.length * 10 : undefined,
    enabled: !!query,
    initialPageParam: 0,
  });

  const suggestQuery = useInfiniteQuery({
    queryKey: ["suggestion", query],
    queryFn: ({ pageParam = 0 }) => searchFilmSuggestions(query || "", pageParam),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 10 ? pages.length * 10 : undefined,
    enabled: !!query,
    initialPageParam: 0,
  });

  
  const accountsQuery = useInfiniteQuery({
    queryKey: ["accounts", query],
    queryFn: ({ pageParam = 0 }) => searchAccounts(query || "", pageParam),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 10 ? pages.length * 10 : undefined,
    enabled: !!query,
    initialPageParam: 0,
  });

  const playlistsQuery = useInfiniteQuery({
    queryKey: ["playlists", query],
    queryFn: ({ pageParam = 0 }) => searchPlaylists(query || "", pageParam),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 10 ? pages.length * 10 : undefined,
    enabled: !!query,
    initialPageParam: 0,
  });

  return {
    filmsQuery,
    suggestQuery,
    accountsQuery,
    playlistsQuery,
  };
};
