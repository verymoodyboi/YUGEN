import { useEffect, useState } from "react";
import { getHomeRecommendations } from "../services";

export function useRecommendations(userId?: string) {
  const [data, setData] = useState({
    hottest: [],
    fresh: [],
    subscriptions: [],
    watchlist: [],
  });
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await getHomeRecommendations(userId);
      setData(response);
      setLoading(false);
    }
    fetchData();
  }, [userId]);

  return { ...data, isLoading };
}
