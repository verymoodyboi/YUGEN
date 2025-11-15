// src/features/recommendations/hooks/useHotThisWeek.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchHotThisWeek } from "../services";

export const useHotThisWeek = () =>
  useInfiniteQuery({
    queryKey: ["films", "hotThisWeek"],
    queryFn: ({ pageParam = 0 }) => fetchHotThisWeek(pageParam, 5),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length > 0 ? pages.length * 5 : undefined,
  });
