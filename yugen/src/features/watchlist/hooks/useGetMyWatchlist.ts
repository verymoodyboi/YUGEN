import { useState, useEffect } from "react";
import { getMyWatchlist } from "../services";
import { useAuth } from "../../../contexts/AuthContext";

export const useMyWatchlist = () => {
  const { userInfo, getAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!userInfo?.auth_id) return;

      setLoading(true);
      setError(null);

      try {
        const token = await getAccessToken();
        const list = await getMyWatchlist(token);
        setWatchlist(list);
      } catch (err: any) {
        console.error("Error fetching watchlist:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [userInfo?.auth_id, getAccessToken]);

  return { watchlist, loading, error };
};
