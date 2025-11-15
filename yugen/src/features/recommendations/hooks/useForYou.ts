// src/features/recommendations/hooks/useRecommended.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchRecommended } from "../services";

export const useRecommended = (user_id: string) =>
  useInfiniteQuery({
    queryKey: ["films", "recommended", user_id],
    queryFn: ({ pageParam = 0 }) => fetchRecommended(user_id, pageParam, 5),
    enabled: !!user_id,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length > 0 ? pages.length * 5 : undefined,
  });
