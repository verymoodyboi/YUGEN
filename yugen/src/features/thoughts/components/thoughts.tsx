// src/features/thought/components/Thoughts.tsx
import React, { use, useState } from "react";
import { Dialog } from "@mui/material";
import {
  FiThumbsUp,
  FiThumbsDown,
  FiMessageSquare,
  FiTrash,
  FiX,
} from "react-icons/fi";
import { useToast } from "../../../components/toaster";
import supabase from "../../../lib/supabaseClient";
import ReplyForm from "./ReplyForm";
import { useThoughts } from "../hooks/useThoughts";
import { useReply } from "../hooks/useReply";
import { FiFlag, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import tempPFP from "../../../YugenAssits/Avatar_Placeholder.png";

interface ThoughtsProps {
  filmId: number;
  refreshKey?: number;
}

const Thoughts: React.FC<ThoughtsProps> = ({ filmId, refreshKey }) => {
  const {
    thoughts,
    userInfo,
    activeIcon,
    handleAdd,
    handleVote,
    handleDelete,
    fetchThoughts,
    refresh,
    setActiveIcon,
    handleFlagThought,
    flaggedItems,
  } = useThoughts(filmId, refreshKey);
  const toast = useToast();
  const navigate = useNavigate();
  // Flag modal state
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagTargetId, setFlagTargetId] = useState<number | null>(null);
  const [flagTargetType, setFlagTargetType] = useState<
    "thought" | "reply" | null
  >(null);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagTargetReply, setFlagTargetReply] = useState<number | null>(null);
  const [flagReason, setFlagReason] = useState<string>("spam");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const {
    handleVote: replyVote,
    handleDelete: replyDelete,
    activeIcon: replyActive,
    handleFlagReply,
    activeFlags: replyFlags,
  } = useReply(() => fetchThoughts(), activeIcon, setActiveIcon);

  const [newRating, setNewRating] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [open, setOpen] = useState(false);
  const [replyToID, setReplyToID] = useState<number>(0);
  const [replyToUsername, setReplyToUsername] = useState<string>("");

  const [repliesVisible, setRepliesVisible] = useState<{
    [key: number]: boolean;
  }>({});
  const [replyDisplayCount, setReplyDisplayCount] = useState<{
    [key: number]: number;
  }>({});
  const userThought = Array.isArray(thoughts)
    ? thoughts.find((t: any) => t?.user?.username === userInfo?.username)
    : null;
  const hasUserThought = !!userThought;
  const sortedThoughts = userThought
    ? [userThought, ...thoughts.filter((t: any) => t.id !== userThought.id)]
    : thoughts;
  const toggleReplies = (thoughtId: number) => {
    setRepliesVisible((prev) => {
      const isVisible = !prev[thoughtId];
      if (isVisible && !replyDisplayCount[thoughtId]) {
        setReplyDisplayCount((c) => ({ ...c, [thoughtId]: 2 }));
      }
      return { ...prev, [thoughtId]: isVisible };
    });
  };

  const onShareThought = async () => {
    const success = await handleAdd(newRating, newComment.trim() || null);
    if (success) {
      setNewRating(null);
      setNewComment("");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto border-4 border-emerald-950 rounded-xl bg-emerald-50 p-4 mt-6 shadow-lg">
      <h2 className="font-freckle text-2xl text-emerald-950 mb-4">Thoughts</h2>

      {/* New Thought Form */}
      <div className="mb-6">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              onClick={hasUserThought ? undefined : () => setNewRating(i + 1)}
              className={`cursor-pointer text-xl ${
                hasUserThought
                  ? (userThought?.rating ?? 0) > i
                    ? "text-emerald-950"
                    : "text-gray-300"
                  : newRating && newRating > i
                    ? "text-emerald-950"
                    : "text-gray-300"
              } ${hasUserThought ? "cursor-not-allowed opacity-60" : ""}`}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          className="w-full p-2 border-2 border-emerald-950 rounded-md bg-emerald-50 text-emerald-950"
          placeholder="Share your thoughts about this film (optional)"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
        />
        <button
          onClick={hasUserThought ? undefined : onShareThought}
          disabled={hasUserThought}
          className={`mt-2 px-4 py-2 rounded-md font-freckle transition-transform ${
            hasUserThought
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-emerald-950 text-emerald-50 hover:scale-105"
          }`}
        >
          {hasUserThought
            ? "You already shared your thoughts here!"
            : "Share Thought"}
        </button>
      </div>

      {/* Thoughts List */}
      {!Array.isArray(thoughts) || thoughts.length === 0 ? (
        <p className="text-emerald-950">No thoughts yet. Be the first!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedThoughts.map((thought: any) => {
            const isUser = thought?.user?.username === userInfo?.username;
            const tid = thought?.id;
            const user = thought?.user ?? {};
            const pfpPath = user?.pfp_path ?? "";
            const publicUrl =
              pfpPath && typeof pfpPath === "string"
                ? supabase.storage.from("pfps").getPublicUrl(pfpPath).data
                    ?.publicUrl
                : tempPFP;
            const displayPfp = publicUrl || "/default-pfp.png";

            return (
              <div
                key={tid}
                className={`p-4 border-2 rounded-lg bg-emerald-50 text-emerald-950 transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#064e3b] ${
                  isUser
                    ? "border-emerald-50 shadow-[0_0_10px_rgba(234,179,8,0.6)]"
                    : "border-emerald-950"
                }`}
              >
                {/* Author */}
                <div
                  className="flex items-center gap-3 mb-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/@?username=${encodeURIComponent(user?.username)}`
                    );
                  }}
                >
                  <img
                    src={displayPfp}
                    alt={user?.username ?? "user"}
                    className="w-8 h-8 rounded-full border border-emerald-950 cursor-pointer"
                  />
                  <span className="font-bold">
                    @{user?.username ?? "unknown"}
                  </span>
                  <span className="ml-auto text-sm italic">
                    {thought?.created_at
                      ? new Date(thought.created_at).toLocaleDateString()
                      : ""}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(10)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        (thought?.rating ?? 0) > i
                          ? "text-emerald-950"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>

                {thought?.comment && <p className="mb-2">{thought.comment}</p>}

                {/* Actions */}
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() =>
                      handleVote(
                        "upvote",
                        { thoughtId: tid },
                        `thought-up-${tid}`
                      )
                    }
                    className={`flex items-center gap-1 px-2 py-1 rounded-full transition-transform hover:scale-105 ${
                      activeIcon[`thought-up-${tid}`]
                        ? "bg-emerald-950 text-emerald-50"
                        : "text-emerald-950"
                    }`}
                  >
                    <FiThumbsUp className="stroke-[2.5]" />{" "}
                    {thought?.upvotes ?? 0}
                  </button>

                  <button
                    onClick={() =>
                      handleVote(
                        "downvote",
                        { thoughtId: tid },
                        `thought-down-${tid}`
                      )
                    }
                    className={`flex items-center gap-1 px-2 py-1 rounded-full transition-transform hover:scale-105 ${
                      activeIcon[`thought-down-${tid}`]
                        ? "bg-emerald-950 text-emerald-50"
                        : "text-emerald-950"
                    }`}
                  >
                    <FiThumbsDown className="stroke-[2.5]" />{" "}
                    {thought?.downvotes ?? 0}
                  </button>

                  <button
                    onClick={() => {
                      setReplyToID(tid);
                      setReplyToUsername(user?.username ?? "");
                      setOpen(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-emerald-950 hover:scale-105 transition-transform"
                  >
                    <FiMessageSquare className="stroke-[2.5]" /> Reply
                  </button>

                  {user?.username && user?.username === userInfo?.username && (
                    <button
                      onClick={() => {
                        setConfirmMessage(
                          "Are you sure you want to delete this thought? This action cannot be undone."
                        );
                        setConfirmAction(() => () => handleDelete(tid));
                        setConfirmOpen(true);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full text-emerald-950 hover:scale-105 transition-transform"
                    >
                      <FiTrash className="stroke-[2.5]" />{" "}
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  )}
                  {user?.username && user?.username === userInfo?.username && (
                    <button
                      disabled={flaggedItems[`thought-${tid}`]} // disable if already flagged
                      onClick={() => {
                        setFlagTargetId(tid);
                        setFlagTargetType("thought");
                        setFlagModalOpen(true);
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full transition-transform hover:scale-105 ${
                        flaggedItems[`thought-${tid}`]
                          ? "bg-red-800 text-white cursor-not-allowed"
                          : "text-emerald-950"
                      }`}
                    >
                      {flaggedItems[`thought-${tid}`] ? (
                        <>
                          <FiFlag className="stroke-[2.5]" />
                          <FiCheck className="stroke-[2.5]" />
                        </>
                      ) : (
                        <>
                          {" "}
                          <FiFlag className="stroke-[2.5]" />{" "}
                          <span className="hidden sm:inline">Flag</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Replies toggle */}
                <button
                  onClick={() => toggleReplies(tid)}
                  className="mt-2 text-emerald-950 font-freckle hover:scale-105 transition-transform"
                >
                  {repliesVisible[tid]
                    ? "Hide Replies"
                    : `Show Replies (${
                        Array.isArray(thought?.replies)
                          ? thought.replies.length
                          : 0
                      })`}
                </button>

                {/* Replies List */}
                {repliesVisible[tid] && (
                  <div className="mt-2 ml-6 flex flex-col gap-2">
                    {Array.isArray(thought?.replies) &&
                      thought.replies
                        .slice(0, replyDisplayCount[tid] || 2)
                        .map((reply: any) => {
                          const rid = reply?.id;
                          const rUser = reply?.user ?? {};
                          const rPfpPath = rUser?.pfp_path ?? "";
                          const rUrl =
                            rPfpPath && typeof rPfpPath === "string"
                              ? supabase.storage
                                  .from("pfps")
                                  .getPublicUrl(rPfpPath).data?.publicUrl
                              : tempPFP;

                          return (
                            <div
                              key={rid}
                              className="p-2 border-2 border-emerald-950 rounded-md bg-emerald-50 text-emerald-950
                                   transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[3px_3px_0_0_#064e3b]"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={rUrl || "/default-pfp.png"}
                                  alt={rUser?.username ?? "user"}
                                  className="w-6 h-6 rounded-full border border-emerald-950 cursor-pointer"
                                />
                                <span className="font-bold">
                                  @{rUser?.username ?? "unknown"}
                                </span>
                                <span className="ml-auto text-xs italic">
                                  {reply?.created_at
                                    ? new Date(
                                        reply.created_at
                                      ).toLocaleDateString()
                                    : ""}
                                </span>
                              </div>

                              <p className="mt-1">{reply?.comment}</p>

                              <div className="flex items-center gap-3 text-sm mt-1">
                                <button
                                  onClick={() =>
                                    replyVote(
                                      "upvote",
                                      { replyId: rid },
                                      `reply-up-${rid}`
                                    )
                                  }
                                  className={`flex items-center gap-1 px-2 py-1 rounded-full transition-transform hover:scale-105 ${
                                    replyActive[`reply-up-${rid}`]
                                      ? "bg-emerald-950 text-emerald-50"
                                      : "text-emerald-950"
                                  }`}
                                >
                                  <FiThumbsUp className="stroke-[2.5]" />{" "}
                                  {reply?.upvotes ?? 0}
                                </button>

                                <button
                                  onClick={() =>
                                    replyVote(
                                      "downvote",
                                      { replyId: rid },
                                      `reply-down-${rid}`
                                    )
                                  }
                                  className={`flex items-center gap-1 px-2 py-1 rounded-full transition-transform hover:scale-105 ${
                                    replyActive[`reply-down-${rid}`]
                                      ? "bg-emerald-950 text-emerald-50"
                                      : "text-emerald-950"
                                  }`}
                                >
                                  <FiThumbsDown className="stroke-[2.5]" />{" "}
                                  {reply?.downvotes ?? 0}
                                </button>

                                {rUser?.username &&
                                  rUser?.username === userInfo?.username && (
                                    <button
                                      onClick={() => {
                                        setConfirmMessage(
                                          "Are you sure you want to delete this reply? This action cannot be undone."
                                        );
                                        setConfirmAction(
                                          () => () => replyDelete(rid)
                                        );
                                        setConfirmOpen(true);
                                      }}
                                      className="flex items-center gap-1 px-2 py-1 rounded-full text-emerald-950 hover:scale-105 transition-transform"
                                    >
                                      <FiTrash className="stroke-[2.5]" />{" "}
                                      <span className="hidden sm:inline">
                                        Delete
                                      </span>
                                    </button>
                                  )}
                                {rUser?.username &&
                                  rUser?.username != userInfo?.username && (
                                    <button
                                      onClick={() => {
                                        setFlagTargetReply(rid);
                                        setFlagReason("spam"); // default
                                        setFlagOpen(true);
                                      }}
                                      disabled={
                                        replyFlags[`reply-flag-${rid}`] === true
                                      } // disable if already flagged locally/server
                                      className={`flex items-center gap-1 px-2 py-1 rounded-full transition-transform hover:scale-105 ${
                                        replyFlags[`reply-flag-${rid}`]
                                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                          : "text-emerald-950"
                                      }`}
                                      title={
                                        replyFlags[`reply-flag-${rid}`]
                                          ? "Already flagged"
                                          : "Flag"
                                      }
                                    >
                                      <FiFlag className="stroke-[2.5]" />{" "}
                                      <span className="hidden sm:inline">
                                        Flag
                                      </span>
                                    </button>
                                  )}
                              </div>
                            </div>
                          );
                        })}

                    {Array.isArray(thought?.replies) &&
                      thought.replies.length >
                        (replyDisplayCount[tid] || 2) && (
                        <button
                          onClick={() =>
                            setReplyDisplayCount((prev) => ({
                              ...prev,
                              [tid]: (prev[tid] || 2) + 5,
                            }))
                          }
                          className="mt-2 text-emerald-950 font-freckle hover:scale-105 transition-transform"
                        >
                          Show More Replies
                        </button>
                      )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Form Modal */}
      <Dialog
        fullScreen
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          "& .MuiDialog-container": {
            backgroundColor: "transparent",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
          "& .MuiPaper-root": {
            backgroundColor: "transparent",
            boxShadow:
              "0 10px 20px rgba(0,0,0,0.15), 0 6px 6px rgba(0,0,0,0.10)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        <div className="w-[80vw] h-[80vh] flex justify-center items-center relative">
          <ReplyForm
            comment_id={replyToID}
            commentor={replyToUsername}
            onSubmitSuccess={() => {
              refresh();
              setOpen(false);
              fetchThoughts();
            }}
          />
        </div>
      </Dialog>

      {/* Tailwind Flag Modal */}
      {flagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex flex-col gap-4 p-6 rounded-2xl border-4 border-emerald-950 bg-red-200 shadow-[6px_6px_0_#064e3b]">
            <h3 className="font-freckle text-xl mb-4">Report this content</h3>

            <label className="block text-sm font-semibold mb-2">
              Choose a reason:
            </label>
            <select
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              className="w-full p-2 border-2 border-emerald-950 rounded-md mb-4"
            >
              <option value="">Select reason</option>
              <option value="spam">Spam or misleading</option>
              <option value="hate">Hate speech or harassment</option>
              <option value="explicit">Explicit or violent content</option>
              <option value="other">Other</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setFlagModalOpen(false)}
                className="px-4 py-2 border-2 border-emerald-950 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!flagReason) return toast.warn("Please select a reason");
                  await handleFlagThought(flagTargetId!, flagReason);
                  setFlagModalOpen(false);
                  setFlagReason("");
                }}
                className="px-4 py-2 bg-emerald-950 text-emerald-50 rounded-md hover:scale-105 transition-transform"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Flag modal (tailwind) */}
      {flagOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-white  rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-emerald-950 mb-3">
              Flag Reply
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Why are you flagging this reply?
            </p>

            <select
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              className="w-full border-2 border-emerald-950 rounded px-3 py-2 mb-4"
            >
              <option value="spam">Spam</option>
              <option value="harassment">Harassment / hate</option>
              <option value="explicit">Explicit content</option>
              <option value="other">Other</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setFlagOpen(false)}
                className="px-4 py-2 rounded border border-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (!flagTargetReply) return;
                  try {
                    // call hook's flag method
                    await handleFlagReply(flagTargetReply, flagReason);
                    setFlagOpen(false);
                  } catch (err) {
                    // hook already handles toasts; keep here for safety
                    console.error("Flag modal error:", err);
                  }
                }}
                className="px-4 py-2 rounded bg-emerald-950 text-white"
              >
                Submit Flag
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-emerald-50 border-4 border-emerald-950 rounded-2xl p-6 max-w-sm w-full shadow-[6px_6px_0_#064e3b]">
            <h3 className="font-freckle text-xl text-emerald-950 mb-2">
              Confirm Deletion
            </h3>

            <p className="text-emerald-950 mb-6">{confirmMessage}</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmAction(null);
                }}
                className="px-4 py-2 border-2 border-emerald-950 rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  confirmAction?.();
                  setConfirmOpen(false);
                  setConfirmAction(null);
                }}
                className="px-4 py-2 bg-red-700 text-white rounded-md hover:scale-105 transition-transform"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Thoughts;
