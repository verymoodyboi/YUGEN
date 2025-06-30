import "../App.css";
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
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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
  userId: number | null; // null if user is not logged in
  refreshKey?: number;
  userInfo: any;
}

const Thoughts: React.FC<ThoughtsProps> = ({
  filmId,
  userId,
  refreshKey,
  userInfo,
}) => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [newRating, setNewRating] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const [replyToID, setReplyToID] = useState<number>(0);
  const [replyToUsername, setReplyToUsername] = useState<string>("");
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
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
            user:users(username, pfp_path)
          )
        `
        )
        .eq("film_id", filmId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setThoughts(data || []);
    } catch (error) {
      console.error("Error fetching thoughts:", error);
      toast.error("Failed to load thoughts");
    }
  };

  const handleSubmitThought = async () => {
    if (!userId) {
      toast.warn("Please log in to share your thoughts");
      return;
    }

    if (!newRating) {
      toast.warn("Please provide a rating");
      return;
    }

    try {
      const { error } = await supabase.from("thoughts").insert([
        {
          film_id: filmId,
          user_id: userId,
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
      {userId && (
        <div className="new-thought-form">
          <MuiRating
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
                  src={`http://localhost:3001/uploads/pfp/${thought.user.pfp_path}`}
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
                <span key="upvote" onClick={() => {}}>
                  <ThumbUpOffAltIcon style={{ marginRight: 4 }} /> Upvote
                </span>,
                <span key="downvote" onClick={() => {}}>
                  <ThumbDownOffAltIcon style={{ marginRight: 4 }} /> Downvote
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
                  }}
                  userInfo={userInfo}
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
                            src={`http://localhost:3001/uploads/pfp/${reply.user.pfp_path}`}
                            icon={<UserOutlined />}
                          />
                        }
                        content={reply.comment}
                        datetime={new Date(
                          reply.created_at
                        ).toLocaleDateString()}
                        actions={[
                          <span key="upvote" onClick={() => {}}>
                            <ThumbUpOffAltIcon style={{ marginRight: 4 }} />{" "}
                            Upvote
                          </span>,
                          <span key="downvote" onClick={() => {}}>
                            <ThumbDownOffAltIcon style={{ marginRight: 4 }} />{" "}
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
