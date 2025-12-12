import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import * as svc from "../services";
import { useToast } from "../../../components/toaster";

export function useReply(
  onSuccess?: () => void,
  sharedActiveIcon?: any,
  setSharedActiveIcon?: any
) {
  const toast = useToast()
  const { getAccessToken } = useAuth();

  // Local flag state
  const [activeFlags, setActiveFlags] = useState<{ [key: string]: boolean }>({});
  const [visibleReplies, setVisibleReplies] = useState<any[]>([]);

  // Load saved reply flags from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("replyFlags");
    if (saved) {
      try {
        setActiveFlags(JSON.parse(saved));
      } catch {
        localStorage.removeItem("replyFlags");
      }
    }
  }, []);

  // Persist replyFlags on change
  useEffect(() => {
    localStorage.setItem("replyFlags", JSON.stringify(activeFlags));
  }, [activeFlags]);

  // Filter out flagged replies before showing
  const filterVisibleReplies = (replies: any[]) => {
    const hiddenIds = Object.keys(activeFlags)
      .filter((key) => key.startsWith("reply-flag-") && activeFlags[key])
      .map((key) => parseInt(key.replace("reply-flag-", ""), 10));
    return replies.filter((r) => !hiddenIds.includes(r.id));
  };

  // Expose helper to update visibleReplies (used by Thoughts.tsx)
  const updateVisibleReplies = (allReplies: any[]) => {
    setVisibleReplies(filterVisibleReplies(allReplies));
  };

  const submitReply = async (thoughtId: number, comment: string) => {
    if (!comment.trim()) return toast.warn("Please add a reply");
    try {
      const token = await getAccessToken();
      if (!token) return toast.warn("Please log in");
      await svc.addReply(thoughtId, comment, token);
      toast.success("Reply submitted!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("submitReply error:", err);
      toast.error("Failed to submit reply");
    }
  };

  const handleVote = async (
    type: "upvote" | "downvote",
    payload: any,
    key: string
  ) => {
    try {
      const token = await getAccessToken();
      if (!token) return toast.warn("Please log in to vote");
      await svc.voteReply(type, payload, token);

      // ✅ Update the SHARED activeIcon map from useThoughts
      setSharedActiveIcon?.((prev: any) => {
        const next = { ...prev };
        const isUp = key.includes("-up-");
        const isDown = key.includes("-down-");

        if (isUp) {
          const upKey = key;
          const downKey = key.replace("-up-", "-down-");
          const wasActive = !!prev[upKey];
          next[upKey] = !wasActive;
          if (!wasActive) next[downKey] = false;
        } else if (isDown) {
          const downKey = key;
          const upKey = key.replace("-down-", "-up-");
          const wasActive = !!prev[downKey];
          next[downKey] = !wasActive;
          if (!wasActive) next[upKey] = false;
        }

        localStorage.setItem("thoughtVotes", JSON.stringify(next));
        return next;
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("reply vote error:", err);
      toast.error("Vote failed");
    }
  };

  const handleDelete = async (replyId: number) => {
    try {
      const token = await getAccessToken();
      if (!token) return toast.warn("Not authorized");
      await svc.deleteReply(replyId, token);
      toast.success("Reply deleted");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("delete reply error:", err);
      toast.error("Delete failed");
    }
  };

 const handleFlagReply = async (replyId: number, reason: string) => {
  try {
    const token = await getAccessToken();
    if (!token) return toast.warn("Please log in to flag");

    await svc.flagReply(replyId.toString(), reason, token);

    // ✅ Mark as flagged locally and hide immediately
    setActiveFlags((prev) => {
      const key = `reply-flag-${replyId}`;
      const next = { ...prev, [key]: true };
      localStorage.setItem("replyFlags", JSON.stringify(next));
      return next;
    });

    // ✅ Hide reply immediately from visible list (instant UI feedback)
    setVisibleReplies((prev) => prev.filter((r) => r.id !== replyId));

    // ✅ Also notify parent (Thoughts.tsx) to refetch or refresh
    if (onSuccess) onSuccess();

    toast.success("Reply flagged and hidden!");
  } catch (err: any) {
    console.error("flag reply failed:", err);
    const serverError = err?.response?.data?.error;
    if (err?.response?.status === 409 || serverError === "Already flagged") {
      toast.warn("You already flagged this reply");
      setActiveFlags((prev) => ({
        ...prev,
        [`reply-flag-${replyId}`]: true,
      }));
      // Hide locally too (just in case user refreshes before server sync)
      setVisibleReplies((prev) => prev.filter((r) => r.id !== replyId));
    } else if (err?.response?.status === 400) {
      toast.error("Flag failed (bad request)");
    } else {
      toast.error("Flag failed");
    }
  }
};


  return {
    submitReply,
    handleVote,
    handleDelete,
    handleFlagReply,
    activeIcon: sharedActiveIcon,
    activeFlags,
    visibleReplies,
    updateVisibleReplies,
  };
}
