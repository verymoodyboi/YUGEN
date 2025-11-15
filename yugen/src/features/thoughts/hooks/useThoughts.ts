import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import { api } from "../../../lib/api";
import * as svc from "../services";

export const useThoughts = (filmId: number, refreshKey?: number) => {
  const { getAccessToken, userInfo } = useAuth();
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [activeIcon, setActiveIcon] = useState<{ [key: string]: boolean }>({});
  const [flaggedItems, setFlaggedItems] = useState<{ [key: string]: boolean }>({});

  // --- Load votes from localStorage ---
  useEffect(() => {
    const saved = localStorage.getItem("thoughtVotes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setActiveIcon(parsed);
      } catch {
        localStorage.removeItem("thoughtVotes");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("thoughtVotes", JSON.stringify(activeIcon));
  }, [activeIcon]);

  // --- Restore flagged items ---
  useEffect(() => {
    const savedFlags = localStorage.getItem("thoughtFlags");
    if (savedFlags) {
      try {
        setFlaggedItems(JSON.parse(savedFlags));
      } catch {
        localStorage.removeItem("thoughtFlags");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("thoughtFlags", JSON.stringify(flaggedItems));
  }, [flaggedItems]);

  // --- Fetch thoughts ---
  const fetchThoughts = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const data = await svc.getThoughts(filmId, token);

      let fetchedThoughts = data.thoughts || [];

      // ✅ Hide flagged thoughts for this user
      const hiddenIds = Object.keys(flaggedItems)
        .filter((key) => key.startsWith("thought-") && flaggedItems[key])
        .map((key) => parseInt(key.replace("thought-", ""), 10));

      if (hiddenIds.length > 0) {
        fetchedThoughts = fetchedThoughts.filter(
          (t: any) => !hiddenIds.includes(t.id)
        );
      }

      setThoughts(fetchedThoughts);

      // ✅ Build the activeIcon map
      const updated: { [key: string]: boolean } = {};
      const applyVotes = (votes: any, prefix: string) => {
        if (votes && typeof votes === "object") {
          for (const id of Object.keys(votes)) {
            updated[`${prefix}-${id}`] = true;
          }
        }
      };

      applyVotes(data.upvotes, "thought-up");
      applyVotes(data.downvotes, "thought-down");
      applyVotes(data.upvoteReplies, "reply-up");
      applyVotes(data.downvoteReplies, "reply-down");

      setActiveIcon((prev) => {
        const merged = { ...prev, ...updated };
        localStorage.setItem("thoughtVotes", JSON.stringify(merged));
        return merged;
      });
    } catch (error) {
      console.error("Error fetching thoughts:", error);
      toast.error("Failed to load thoughts");
    }
  }, [filmId, getAccessToken, flaggedItems]);

  useEffect(() => {
    fetchThoughts();
  }, [fetchThoughts, refreshKey]);

  const handleAdd = async (rating: number, comment: string | null) => {
    try {
      const token = await getAccessToken();
      await api.post(
        "/thoughts/add",
        { film_uuid: filmId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Thought shared successfully!");
      await fetchThoughts();
    } catch {
      toast.error("Failed to share thought");
    }
  };

  const handleVote = async (
    type: "upvote" | "downvote",
    payload: any,
    key: string
  ) => {
    try {
      const token = await getAccessToken();
      await api.post(`/thoughts/${type}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setActiveIcon((prev) => {
        const newState = { ...prev };
        const isUp = key.includes("-up-");
        const isDown = key.includes("-down-");

        if (isUp) {
          const thoughtKeyUp = key;
          const thoughtKeyDown = key.replace("-up-", "-down-");
          const wasActive = !!prev[thoughtKeyUp];
          newState[thoughtKeyUp] = !wasActive;
          if (!wasActive) newState[thoughtKeyDown] = false;
        } else if (isDown) {
          const thoughtKeyDown = key;
          const thoughtKeyUp = key.replace("-down-", "-up-");
          const wasActive = !!prev[thoughtKeyDown];
          newState[thoughtKeyDown] = !wasActive;
          if (!wasActive) newState[thoughtKeyUp] = false;
        }

        localStorage.setItem("thoughtVotes", JSON.stringify(newState));
        return newState;
      });

      await fetchThoughts();
    } catch (err) {
      console.error("Vote failed", err);
      toast.error("Vote failed");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = await getAccessToken();
      await api.post(
        "/thoughts/delete",
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Comment deleted");
      await fetchThoughts();
    } catch {
      toast.error("Delete failed");
    }
  };

  // --- Flag a thought ---
  const handleFlagThought = async (thoughtId: number, reason: string) => {
    try {
      const token = await getAccessToken();
      await svc.flagThought(thoughtId.toString(), reason, token);

      // ✅ Mark as flagged locally and hide immediately
      setFlaggedItems((prev) => {
        const next = { ...prev, [`thought-${thoughtId}`]: true };
        localStorage.setItem("thoughtFlags", JSON.stringify(next));
        return next;
      });

      setThoughts((prev) => prev.filter((t) => t.id !== thoughtId));
      toast.success("Flag submitted and hidden!");
    } catch (err: any) {
      console.error("Flag failed:", err);
      if (err?.response?.data?.error === "Already flagged")
        toast.warn("You already flagged this comment");
      else toast.error("Failed to flag comment");
    }
  };

  const refresh = async () => {
    await fetchThoughts();
  };

  return {
    thoughts,
    userInfo,
    activeIcon,
    handleAdd,
    handleVote,
    handleDelete,
    fetchThoughts,
    refresh,
    setActiveIcon,
    flaggedItems,
    handleFlagThought,
    setFlaggedItems,
  };
};
