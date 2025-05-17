import "../App.css";
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { TextField, Button, Rating as MuiRating } from "@mui/material";
import { Avatar, Space, List } from "antd";
import { Comment } from "@ant-design/compatible";
import { UserOutlined } from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./AuthContext";
import { ClassNames } from "@emotion/react";

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
}

const Thoughts: React.FC<ThoughtsProps> = ({ filmId, userId }) => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [newRating, setNewRating] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [showReplyInput, setShowReplyInput] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    fetchThoughts();
  }, [filmId]);

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

  const handleSubmitReply = async (thoughtId: number) => {
    if (!userId) {
      toast.warn("Please log in to reply");
      return;
    }

    const reply = replyText[thoughtId]?.trim();
    if (!reply) {
      toast.warn("Please enter a reply");
      return;
    }

    try {
      const { error } = await supabase.from("thought_replies").insert([
        {
          thought_id: thoughtId,
          user_id: userId,
          comment: reply,
        },
      ]);

      if (error) throw error;

      setReplyText({ ...replyText, [thoughtId]: "" });
      setShowReplyInput({ ...showReplyInput, [thoughtId]: false });
      fetchThoughts();
      toast.success("Reply posted successfully!");
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error("Failed to post reply");
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
          <List.Item
            style={{
              boxShadow: "0 8px 15px rgba(0, 0, 0, 0.50)",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <Comment
              author={
                <span className="ant-comment-content-author-name">
                  {thought.user.username}
                </span>
              }
              avatar={
                <Avatar
                  src={`/uploads/pfp/${thought.user.pfp_path}`}
                  icon={<UserOutlined />}
                />
              }
              content={
                <div>
                  <MuiRating value={thought.rating} readOnly />
                  {thought.comment && <p>{thought.comment}</p>}
                </div>
              }
              datetime={new Date(thought.created_at).toLocaleDateString()}
            />

            {/* Replies */}
            <List
              className="replies-list"
              itemLayout="vertical"
              dataSource={thought.replies}
              locale={{ emptyText: "No thoughts yet. Be the first to share!" }} // Customize the empty state
              renderItem={(reply) => (
                <List.Item>
                  <Comment
                    author={
                      <span className="ant-comment-content-reply-name">
                        reply.user.username
                      </span>
                    }
                    avatar={
                      <Avatar
                        src={`/uploads/pfp/${reply.user.pfp_path}`}
                        icon={<UserOutlined />}
                      />
                    }
                    content={reply.comment}
                    datetime={new Date(reply.created_at).toLocaleDateString()}
                  />
                </List.Item>
              )}
            />

            {/* Reply Form */}
            {userId && (
              <div className="reply-form">
                {!showReplyInput[thought.id] ? (
                  <Button
                    onClick={() =>
                      setShowReplyInput({
                        ...showReplyInput,
                        [thought.id]: true,
                      })
                    }
                  >
                    Reply
                  </Button>
                ) : (
                  <div>
                    <TextField
                      placeholder="Write a reply..."
                      value={replyText[thought.id] || ""}
                      onChange={(e) =>
                        setReplyText({
                          ...replyText,
                          [thought.id]: e.target.value,
                        })
                      }
                      fullWidth
                      sx={{ mt: 1, mb: 1 }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleSubmitReply(thought.id)}
                      sx={{
                        fontFamily: '"Freckle Face", system-ui, sans-serif',
                        color: "#fff",
                        mr: 1,
                      }}
                    >
                      Post Reply
                    </Button>
                    <Button
                      onClick={() => {
                        setShowReplyInput({
                          ...showReplyInput,
                          [thought.id]: false,
                        });
                        setReplyText({ ...replyText, [thought.id]: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
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
