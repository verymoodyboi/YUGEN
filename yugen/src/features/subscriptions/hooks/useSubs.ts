import { useState, useCallback } from "react";
import {
  fetchMySubscriptions,
  subscribe,
  unsubscribe,
  Subscription,
} from "../services"

export function useSubs(getAccessToken: () => Promise<string>) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      const subs = await fetchMySubscriptions(token);
      setSubscriptions(subs);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  const handleSubscribe = useCallback(
    async (authId: string) => {
      setProcessing(true);
      try {
        const token = await getAccessToken();
        await subscribe(authId, token);
        await loadSubscriptions(); 
      } catch (err) {
        console.error("Error subscribing:", err);
      } finally {
        setProcessing(false);
      }
    },
    [getAccessToken, loadSubscriptions]
  );

  const handleUnsubscribe = useCallback(
    async (authId: string) => {
      setProcessing(true);
      try {
        const token = await getAccessToken();
        await unsubscribe(authId, token);
        await loadSubscriptions(); 
      } catch (err) {
        console.error("Error unsubscribing:", err);
      } finally {
        setProcessing(false);
      }
    },
    [getAccessToken, loadSubscriptions]
  );

  return {
    subscriptions,
    loading,
    processing,
    loadSubscriptions,
    handleSubscribe,
    handleUnsubscribe,
  };
}
