import { useState, useEffect, useRef } from "react";
import { historyService, HistoryItem } from "./services";
import { useAuth } from "../../contexts/AuthContext";

export function useHistory() {
  const { userInfo } = useAuth();
  const {getAccessToken} = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!userInfo?.auth_id) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      const token= await getAccessToken();
      try {
        const data = await historyService.getMyHistory(token);
        setHistory(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userInfo?.auth_id]);

  return { history, loading, error };
}
export const useAddHistory = (filmId?: string) => {
  const { userInfo, getAccessToken } = useAuth();
  const hasInsertedRef = useRef(false);

  useEffect(() => {
    const addToHistory = async () => {
      if (!filmId || !userInfo?.auth_id || hasInsertedRef.current) return;
      hasInsertedRef.current = true;

      try {
        const token = await getAccessToken();
        await historyService.addHistory(filmId, token);
      } catch (error) {
        console.error("Error adding to history:", error);
      }
    };

    addToHistory();
  }, [filmId, userInfo?.auth_id, getAccessToken]);
};