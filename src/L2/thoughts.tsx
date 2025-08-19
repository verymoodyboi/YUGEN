import "../App.css";
import { useAuth } from "../contexts/AuthContext";
import React, { useEffect, useState } from "react";
import supabase from "../server/config";
import {
  TextField,
  Button,
  Rating as MuiRating,
  Dialog,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReplyForm from "./ReplyForm";
import { Avatar, List } from "antd";
import { Comment } from "@ant-design/compatible";
import { UserOutlined } from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Badge, { badgeClasses } from "@mui/material/Badge";
import { styled } from "@mui/material/styles";

const CartBadge = styled(Badge)`
  & .${badgeClasses.badge} {
    top: -12px;
    right: -6px;
  }
`;
interface Thought {
  id: number;
  film_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    username: string;
    pfp_path: string;
  };
  replies: ThoughtReply[];
}

interface ThoughtReply {
  id: number;
  thought_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  user: {
    username: string;
    pfp_path: string;
  };
}

interface ThoughtsProps {
  filmId: number;
  refreshKey?: number;
}

const Thoughts: React.FC<ThoughtsProps> = ({ filmId, refreshKey }) => {
  const { userInfo } = useAuth();

  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [newRating, setNewRating] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const [replyToID, setReplyToID] = useState<number>(0);
  const [replyToUsername, setReplyToUsername] = useState<string>("");
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
  const [upvote, setUpvote] = useState<{ [key: number]: boolean }>({});
  const [downvote, setDownvote] = useState<{ [key: number]: boolean }>({});
  const [upvoteReplies, setUpvoteReplies] = useState<{
    [key: number]: boolean;
  }>({});
  const [downvoteReplies, setDownvoteReplies] = useState<{
    [key: number]: boolean;
  }>({});

  const [replyDisplayCount, setReplyDisplayCount] = useState<{
    [key: number]: number;
  }>({});

  const [repliesVisible, setRepliesVisible] = useState<{
    [key: number]: boolean;
  }>({});
  const toggleReplies = (thoughtId: number) => {
    setRepliesVisible((prev) => {
      const isVisible = !prev[thoughtId];
      if (isVisible && !replyDisplayCount[thoughtId]) {
        setReplyDisplayCount((countPrev) => ({
          ...countPrev,
          [thoughtId]: 2,
        }));
      }
      return {
        ...prev,
        [thoughtId]: isVisible,
      };
    });
  };

  useEffect(() => {
    fetchThoughts();
  }, [filmId, refreshKey, localRefreshKey]);

  const fetchThoughts = async () => {
    try {
      const { data, error } = await supabase
        .from("thoughtsv1")
        .select(
          `
          *,
          user:users(username, pfp_path),
          replies:thought_replies(
            *,
            user:users(username, pfp_path),
                  reply_votes(vote_type, user_id)

          ),
            thought_votes(vote_type, user_id)
        `
        )
        .eq("film_uuid", filmId)
        .order("upvotes", { ascending: false });
      const upvotes: { [key: number]: boolean } = {};
      const downvotes: { [key: number]: boolean } = {};

      for (const thought of data) {
        const voteRecord = thought.thought_votes?.find(
          (v: any) => v.user_id === userInfo.auth_id
        );
        if (voteRecord?.vote_type === "up") upvotes[thought.id] = true;
        if (voteRecord?.vote_type === "down") downvotes[thought.id] = true;
        const upvoteMap: { [key: number]: boolean } = {};
        const downvoteMap: { [key: number]: boolean } = {};

        data.forEach((thought: any) => {
          thought.replies?.forEach((reply: any) => {
            const vote = reply.reply_votes?.find(
              (v: any) => v.user_id === userInfo.auth_id
            );
            if (vote?.vote_type === "up") upvoteMap[reply.id] = true;
            if (vote?.vote_type === "down") downvoteMap[reply.id] = true;
          });
        });

        setUpvoteReplies(upvoteMap);
        setDownvoteReplies(downvoteMap);
      }

      setUpvote(upvotes);
      setDownvote(downvotes);
      if (error) throw error;
      setThoughts(data || []);
    } catch (error) {
      console.error("Error fetching thoughts:", error);
      toast.error("Failed to load thoughts");
    }
  };

  const handleSubmitThought = async () => {
    if (!userInfo) {
      toast.warn("Please log in to share your thoughts");
      return;
    }

    if (!newRating) {
      toast.warn("Please provide a rating");
      return;
    }

    try {
      const { error } = await supabase.from("thoughtsv1").insert([
        {
          film_uuid: filmId,
          auth_id: userInfo.auth_id,
          rating: newRating,
          comment: newComment.trim() || null,
        },
      ]);

      if (error) throw error;

      setNewRating(null);
      setNewComment("");
      fetchThoughts();
      toast.success("Thought shared successfully!");
    } catch (error) {
      console.error("Error submitting thought:", error);
      toast.error("Failed to share thought");
    }
  };

  const handleDeleteThought = async (thoughtId: number) => {
    try {
      const { error } = await supabase
        .from("thoughtsv1")
        .delete()
        .eq("id", thoughtId);

      if (error) throw error;

      toast.success("Comment deleted");
      fetchThoughts();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete comment");
    }
  };
  const handleUpVote = async (thoughtId: number) => {
    const isUpvoted = upvote[thoughtId];

    if (!isUpvoted) {
      try {
        await supabase.rpc("increment_upvotes", { row_id: thoughtId });
        setUpvote((prev) => ({ ...prev, [thoughtId]: true }));
        if (downvote[thoughtId]) {
          await supabase.rpc("remove_downvotes", { row_id: thoughtId });
          setDownvote((prev) => ({ ...prev, [thoughtId]: false }));
        }
      } catch (error) {
        console.error("Upvote error", error);
      }
    } else {
      try {
        await supabase.rpc("remove_upvotes", { row_id: thoughtId });
        setUpvote((prev) => ({ ...prev, [thoughtId]: false }));
      } catch (error) {
        console.error("Remove upvote error", error);
      }
    }
    //votes table
    const { data: existingVote } = await supabase
      .from("thought_votes")
      .select("vote_type")
      .eq("thought_id", thoughtId)
      .eq("user_id", userInfo.auth_id)
      .single();

    if (existingVote?.vote_type === "up") {
      // Remove upvote
      await supabase
        .from("thought_votes")
        .delete()
        .eq("thought_id", thoughtId)
        .eq("user_id", userInfo.auth_id);
    } else {
      // Insert or update to upvote
      if (existingVote?.vote_type === "down") {
        await supabase
          .from("thought_votes")
          .update({
            thought_id: thoughtId,
            user_id: userInfo.auth_id,
            vote_type: "up",
          })
          .eq("thought_id", thoughtId)
          .eq("user_id", userInfo.auth_id);
      } else {
        await supabase.from("thought_votes").insert({
          thought_id: thoughtId,
          user_id: userInfo.auth_id,
          vote_type: "up",
        });
      }
    }
    fetchThoughts();
  };

  const handleDownVote = async (thoughtId: number) => {
    const isDownvoted = downvote[thoughtId];

    if (!isDownvoted) {
      try {
        await supabase.rpc("increment_downvotes", { row_id: thoughtId });
        setDownvote((prev) => ({ ...prev, [thoughtId]: true }));
        if (upvote[thoughtId]) {
          await supabase.rpc("remove_upvotes", { row_id: thoughtId });
          setUpvote((prev) => ({ ...prev, [thoughtId]: false }));
        }
      } catch (error) {
        console.error("Downvote error", error);
      }
    } else {
      try {
        await supabase.rpc("remove_downvotes", { row_id: thoughtId });
        setDownvote((prev) => ({ ...prev, [thoughtId]: false }));
      } catch (error) {
        console.error("Remove downvote error", error);
      }
    }
    // votes table
    const { data: existingVote } = await supabase
      .from("thought_votes")
      .select("vote_type")
      .eq("thought_id", thoughtId)
      .eq("user_id", userInfo.auth_id)
      .single();

    if (existingVote?.vote_type === "down") {
      // User already downvoted → remove downvote
      await supabase
        .from("thought_votes")
        .delete()
        .eq("thought_id", thoughtId)
        .eq("user_id", userInfo.auth_id);
    } else {
      // If previously upvoted → remove upvote
      if (existingVote?.vote_type === "up") {
        // Insert or update to downvote
        await supabase
          .from("thought_votes")
          .update({
            thought_id: thoughtId,
            user_id: userInfo.auth_id,
            vote_type: "down",
          })
          .eq("thought_id", thoughtId)
          .eq("user_id", userInfo.auth_id);
      } else {
        await supabase.from("thought_votes").insert({
          thought_id: thoughtId,
          user_id: userInfo.auth_id,
          vote_type: "down",
        });
      }
    }
    fetchThoughts();
  };
  const handleUpVoteReply = async (replyId: number) => {
    const isUpvoted = upvoteReplies[replyId];

    if (!isUpvoted) {
      try {
        await supabase.rpc("increment_upvotes_reply", { row_id: replyId });
        setUpvoteReplies((prev) => ({ ...prev, [replyId]: true }));
        if (downvoteReplies[replyId]) {
          await supabase.rpc("remove_downvotes_reply", { row_id: replyId });
          setDownvoteReplies((prev) => ({ ...prev, [replyId]: false }));
        }
      } catch (error) {
        console.error("Reply upvote error", error);
      }
    } else {
      try {
        await supabase.rpc("remove_upvotes_reply", { row_id: replyId });
        setUpvoteReplies((prev) => ({ ...prev, [replyId]: false }));
      } catch (error) {
        console.error("Remove reply upvote error", error);
      }
    }
    const { data: existingVote } = await supabase
      .from("reply_votes")
      .select("vote_type")
      .eq("reply_id", replyId)
      .eq("user_id", userInfo.auth_id)
      .single();

    if (existingVote?.vote_type === "up") {
      // Remove upvote
      await supabase
        .from("reply_votes")
        .delete()
        .eq("reply_id", replyId)
        .eq("user_id", userInfo.auth_id);
    } else {
      // Remove downvote if exists
      if (existingVote?.vote_type === "down") {
        await supabase
          .from("reply_votes")
          .update({
            reply_id: replyId,
            user_id: userInfo.auth_id,
            vote_type: "up",
          })
          .eq("reply_id", replyId)
          .eq("user_id", userInfo.auth_id);
      } else {
        await supabase.from("reply_votes").insert({
          reply_id: replyId,
          user_id: userInfo.auth_id,
          vote_type: "up",
        });
      }
    }

    fetchThoughts();
  };
  const handleDownVoteReply = async (replyId: number) => {
    const isDownvoted = downvoteReplies[replyId];

    if (!isDownvoted) {
      try {
        await supabase.rpc("increment_downvotes_reply", { row_id: replyId });
        setDownvoteReplies((prev) => ({ ...prev, [replyId]: true }));
        if (upvoteReplies[replyId]) {
          await supabase.rpc("remove_upvotes_reply", { row_id: replyId });
          setUpvoteReplies((prev) => ({ ...prev, [replyId]: false }));
        }
      } catch (error) {
        console.error("Reply downvote error", error);
      }
    } else {
      try {
        await supabase.rpc("remove_downvotes_reply", { row_id: replyId });
        setDownvoteReplies((prev) => ({ ...prev, [replyId]: false }));
      } catch (error) {
        console.error("Remove reply downvote error", error);
      }
    }
    const { data: existingVote } = await supabase
      .from("reply_votes")
      .select("vote_type")
      .eq("reply_id", replyId)
      .eq("user_id", userInfo.auth_id)
      .single();

    if (existingVote?.vote_type === "down") {
      // Remove downvote
      await supabase
        .from("reply_votes")
        .delete()
        .eq("reply_id", replyId)
        .eq("user_id", userInfo.auth_id);
    } else {
      // Remove upvote if exists
      if (existingVote?.vote_type === "up") {
        await supabase
          .from("reply_votes")
          .update({
            reply_id: replyId,
            user_id: userInfo.auth_id,
            vote_type: "down",
          })
          .eq("reply_id", replyId)
          .eq("user_id", userInfo.auth_id);
      } else {
        await supabase.from("reply_votes").insert({
          reply_id: replyId,
          user_id: userInfo.auth_id,
          vote_type: "down",
        });
      }
    }

    fetchThoughts();
  };

  const handleDeleteReply = async (replyID: number) => {
    try {
      const { error } = await supabase
        .from("thought_replies")
        .delete()
        .eq("id", replyID);

      if (error) throw error;

      toast.success("Comment deleted");
      fetchThoughts();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="thoughts-container">
      <h2>Thoughts</h2>

      {/* New Thought Form */}
      {userInfo && (
        <div className="new-thought-form">
          <MuiRating
            max={10}
            value={newRating}
            onChange={(_, value) => setNewRating(value)}
            size="large"
          />
          <TextField
            multiline
            rows={3}
            placeholder="Share your thoughts about this film (optional)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmitThought}
            sx={{
              fontFamily: '"Freckle Face", system-ui, sans-serif',
              color: "#fff",
            }}
          >
            Share Thought
          </Button>
        </div>
      )}

      {/* Thoughts List */}
      <List
        className="thoughts-list"
        itemLayout="vertical"
        dataSource={thoughts}
        locale={{ emptyText: "No thoughts yet. Be the first to share!" }} // Customize the empty state
        renderItem={(thought) => (
          <List.Item>
            <Comment
              author={thought.user.username}
              avatar={
                <Avatar
                  //src={`http://localhost:3001/uploads/pfp/${thought.user.pfp_path}`}
                  src={
                    supabase.storage
                      .from("pfps")
                      .getPublicUrl(thought.user.pfp_path).data.publicUrl
                  }
                  icon={!thought.user.pfp_path && <UserOutlined />}
                />
              }
              content={
                <div>
                  <MuiRating value={thought.rating} readOnly max={10} />
                  {thought.comment && <p>{thought.comment}</p>}
                </div>
              }
              datetime={new Date(thought.created_at).toLocaleDateString()}
              actions={[
                <span key="upvote" onClick={() => handleUpVote(thought.id)}>
                  {upvote[thought.id] ? (
                    <IconButton>
                      <ThumbUpIcon style={{ marginRight: 4 }} />{" "}
                      <CartBadge
                        badgeContent={thought.upvotes}
                        color="primary"
                        overlap="circular"
                      />
                    </IconButton>
                  ) : (
                    <IconButton>
                      <ThumbUpOffAltIcon style={{ marginRight: 4 }} />
                      <CartBadge
                        badgeContent={thought.upvotes}
                        color="primary"
                        overlap="circular"
                      />
                    </IconButton>
                  )}
                </span>,

                <span key="downvote" onClick={() => handleDownVote(thought.id)}>
                  {downvote[thought.id] ? (
                    <IconButton>
                      <ThumbDownAltIcon style={{ marginRight: 4 }} />{" "}
                      <CartBadge
                        badgeContent={thought.downvotes}
                        color="primary"
                        overlap="circular"
                      />
                    </IconButton>
                  ) : (
                    <IconButton>
                      <ThumbDownOffAltIcon style={{ marginRight: 4 }} />{" "}
                      <CartBadge
                        badgeContent={thought.downvotes}
                        color="primary"
                        overlap="circular"
                      />
                    </IconButton>
                  )}
                </span>,
                <span
                  key="reply"
                  onClick={async () => {
                    setReplyToID(thought.id);
                    setReplyToUsername(thought.user.username);
                    setOpen(true);
                  }}
                >
                  <ChatBubbleOutlineIcon style={{ marginRight: 4 }} /> Reply
                </span>,
                userInfo?.user_id === thought.user_id && (
                  <IconButton
                    key="delete"
                    size="small"
                    onClick={() => handleDeleteThought(thought.id)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                ),
              ]}
            />
            <Dialog
              fullScreen
              open={open}
              onClose={() => setOpen(false)}
              slots={
                {
                  //    transition: Transition,
                }
              }
              sx={{
                "& .MuiDialog-container": {
                  backgroundColor: "transparent",
                  display: "flex", // Enable flexbox
                  justifyContent: "center", // Horizontal centering
                  alignItems: "center", // Vertical centering
                },
                "& .MuiPaper-root": {
                  backgroundColor: "transparent",
                  boxShadow:
                    "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.10)",
                  display: "flex", // Needed to center contents inside Paper
                  justifyContent: "center",
                  alignItems: "center",
                },
              }}
              BackdropProps={{
                sx: {
                  backgroundColor: "transparent !important",
                  opacity: 1,
                },
              }}
            >
              <Box
                sx={{
                  width: "80vw",
                  height: "80vh",
                  // backgroundColor: "red",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={() => {
                    setOpen(false);
                  }}
                  aria-label="close"
                  sx={{
                    zIndex: 10,
                    position: "absolute",
                    top: 16,
                    left: 16,
                    color: "white", // optional, in case it's invisible on background
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <ReplyForm
                  comment_id={replyToID}
                  commentor={replyToUsername}
                  onSubmitSuccess={() => {
                    setLocalRefreshKey((prev) => prev + 1);
                    setOpen(false);
                    fetchThoughts();
                  }}
                />
              </Box>
            </Dialog>
            {/* Replies */}
            <Button
              size="small"
              onClick={() => toggleReplies(thought.id)}
              sx={{
                mt: 1,
                mb: 1,
                fontFamily: '"Freckle Face", system-ui',
                color: "white",
              }}
            >
              {repliesVisible[thought.id]
                ? "Hide Replies"
                : `Show Replies (${thought.replies.length})`}
            </Button>

            {repliesVisible[thought.id] && (
              <>
                <List
                  className="replies-list"
                  itemLayout="vertical"
                  dataSource={thought.replies.slice(
                    0,
                    replyDisplayCount[thought.id] || 2
                  )}
                  locale={{
                    emptyText: "No replies yet. Be the first to share!",
                  }}
                  renderItem={(reply) => (
                    <List.Item>
                      <Comment
                        author={reply.user.username}
                        avatar={
                          <Avatar
                            src={
                              supabase.storage
                                .from("pfps")
                                .getPublicUrl(reply.user.pfp_path).data
                                .publicUrl
                            }
                            icon={<UserOutlined />}
                          />
                        }
                        content={reply.comment}
                        datetime={new Date(
                          reply.created_at
                        ).toLocaleDateString()}
                        actions={[
                          <span
                            key="upvote"
                            onClick={() => handleUpVoteReply(reply.id)}
                          >
                            {upvoteReplies[reply.id] ? (
                              <IconButton>
                                <ThumbUpIcon style={{ marginRight: 4 }} />
                                <CartBadge
                                  badgeContent={reply.upvotes}
                                  color="primary"
                                  overlap="circular"
                                />
                              </IconButton>
                            ) : (
                              <IconButton>
                                <ThumbUpOffAltIcon style={{ marginRight: 4 }} />
                                <CartBadge
                                  badgeContent={reply.upvotes}
                                  color="primary"
                                  overlap="circular"
                                />
                              </IconButton>
                            )}
                          </span>,

                          <span
                            key="downvote"
                            onClick={() => handleDownVoteReply(reply.id)}
                          >
                            {downvoteReplies[reply.id] ? (
                              <IconButton>
                                <ThumbDownAltIcon style={{ marginRight: 4 }} />
                                <CartBadge
                                  badgeContent={reply.downvotes}
                                  color="primary"
                                  overlap="circular"
                                />
                              </IconButton>
                            ) : (
                              <IconButton>
                                <ThumbDownOffAltIcon
                                  style={{ marginRight: 4 }}
                                />{" "}
                                <CartBadge
                                  badgeContent={reply.downvotes}
                                  color="primary"
                                  overlap="circular"
                                />
                              </IconButton>
                            )}
                            Downvote
                          </span>,
                          <span
                            key="reply"
                            onClick={async () => {
                              setReplyToID(thought.id);
                              setReplyToUsername(reply.user.username);
                              setOpen(true);
                            }}
                          >
                            <ChatBubbleOutlineIcon style={{ marginRight: 4 }} />{" "}
                            Reply
                          </span>,
                          userInfo?.user_id === reply.user_id && (
                            <IconButton
                              key="delete"
                              size="small"
                              onClick={() => handleDeleteReply(reply.id)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          ),
                        ]}
                      />
                    </List.Item>
                  )}
                />
                {thought.replies.length >
                  (replyDisplayCount[thought.id] || 2) && (
                  <Button
                    size="small"
                    onClick={() =>
                      setReplyDisplayCount((prev) => ({
                        ...prev,
                        [thought.id]: (prev[thought.id] || 2) + 10,
                      }))
                    }
                    sx={{
                      mb: 1,
                      fontFamily: '"Freckle Face", system-ui',
                      color: "white",
                    }}
                  >
                    Show More Replies
                  </Button>
                )}
              </>
            )}
          </List.Item>
        )}
      />

      <ToastContainer
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default Thoughts;
