import { useState, useCallback, useEffect } from "react";
import {
  fetchUserPokes,
  sendPoke,
  acceptPoke,
  deletePoke,
  SentPoke,
  ReceivedPoke,
  rejectPoke
} from "./services";

export function usePokes(getAccessToken: any) {
  const [sent, setSent] = useState<SentPoke[]>([]);
  const [received, setReceived] = useState<ReceivedPoke[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const loadPokes = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      const data = await fetchUserPokes(token);

      setSent(data.sent);
      setReceived(data.received);
    } catch (err) {
      console.error("Error fetching pokes:", err);
      setSent([]);
      setReceived([]);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);
useEffect(() => {
  loadPokes().catch(console.error);
}, [loadPokes]);
  const handleSendPoke = useCallback(
    async (targetId: string) => {
      setProcessing(true);
      try {
        const token = await getAccessToken();
        await sendPoke(targetId, token);
        await loadPokes();
      } catch (err) {
        console.error("Error sending poke:", err);
      } finally {
        setProcessing(false);
      }
    },
    [getAccessToken, loadPokes]
  );

  const handleAcceptPoke = useCallback(
    async (pokeId: string) => {
      setProcessing(true);
      try {
        const token = await getAccessToken();
        await acceptPoke(pokeId, token);
        await loadPokes();
      } catch (err) {
        console.error("Error accepting poke:", err);
      } finally {
        setProcessing(false);
      }
    },
    [getAccessToken, loadPokes]
  );

  const handleDeletePoke = useCallback(
    async (pokeId: string) => {
      setProcessing(true);
      try {
        const token = await getAccessToken();
        await deletePoke(pokeId, token);
        await loadPokes();
      } catch (err) {
        console.error("Error deleting poke:", err);
      } finally {
        setProcessing(false);
      }
    },
    [getAccessToken, loadPokes]
  );

  /**
   * Compute poke status relative to a profile user
   */
  const getPokeStatus = useCallback(
    (profileUserId: string) => {
      // Check sent pokes
      const sentPoke = sent.find((p) => p.poked_id === profileUserId);
      if (sentPoke) {
        if (sentPoke.accepted) {
          return { status: "accepted", pokeId: sentPoke.id };
        }
        return { status: "sent", pokeId: sentPoke.id };
      }

      // Check received pokes
      const receivedPoke = received.find((p) => p.poker_id === profileUserId);
      if (receivedPoke) {
        if (receivedPoke.accepted) {
          return { status: "accepted", pokeId: receivedPoke.id };
        }
        return { status: "received", pokeId: receivedPoke.id };
      }

      // No poke exists
      return { status: "none", pokeId: null };
    },
    [sent, received]
  );

  const handleRejectPoke = async (pokeId: string) => {
  try {
    setProcessing(true);

    await rejectPoke(pokeId, getAccessToken);

    // remove from received locally
    setReceived((prev) => prev.filter((p) => p.id !== pokeId));
  } catch (err) {
    console.error(err);
  } finally {
    setProcessing(false);
  }
};
  return {
    sent,
    received,
    loading,
    processing,
    loadPokes,
    handleSendPoke,
    handleAcceptPoke,
    handleDeletePoke,
    handleRejectPoke,
    getPokeStatus,
  };
}