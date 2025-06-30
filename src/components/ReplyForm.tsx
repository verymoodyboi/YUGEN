import "../App.css";
import { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfigProvider } from "antd";
import supabase from "../server/config";
import axios from "axios";

interface TargetReplyProps {
  comment_id: number;
  commentor: string;
  onSubmitSuccess?: () => void;
}

const ReplyForm: React.FC<TargetReplyProps> = ({
  comment_id,
  commentor,
  onSubmitSuccess,
}) => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isSubmit, setIsSubmit] = useState(false);
  const [comment, setComment] = useState("@" + commentor);
  const [isLoading, setIsLoading] = useState(false);

  const loadProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const { data, error } = await supabase
        .from("users")
        .select("username, pfp_path, user_id")
        .eq("email", session.user.email)
        .single();

      if (!error) {
        setUserInfo(data);
      } else {
        console.error("Error loading profile:", error);
      }
    } else {
      setUserInfo(null);
    }
  };

  useEffect(() => {
    loadProfile();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const validate = () => {
    const errors: { comment?: string } = {};
    if (!comment.trim()) {
      errors.comment = "No comment";
      toast.warn("Please add a comment.");
    }
    return errors;
  };

  const SendToServer = async () => {
    if (!userInfo) {
      toast.error("You must be logged in to submit a reply.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("comment", comment);
      formData.append("comment_id", comment_id.toString());
      formData.append("user_id", userInfo.user_id.toString());

      await axios.post("http://localhost:3001/replies", formData);

      toast.success("Reply submitted!");
      setIsSubmit(true);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error: any) {
      toast.error("Error: " + (error?.message || "Something went wrong"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length === 0) {
      await SendToServer();
    }
  };

  if (isSubmit) {
    return (
      <p style={{ color: "#2c5d5a", fontWeight: "bold" }}>Reply submitted!</p>
    );
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Rate: {
            starSize: 35,
            starBg: "#2c5d5a",
            starColor: "#cc651f",
          },
        },
      }}
    >
      <form className="ReviewForm" onSubmit={handleSubmit}>
        <p id="ReviewText">Reply to {commentor}</p>

        <TextField
          name="Comment"
          label="Reply"
          variant="outlined"
          multiline
          maxRows={20}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          sx={{
            minHeight: "80px",
            height: "auto",
            fontSize: "16px",
            padding: "10px",
            width: "100%",
            marginTop: "16px",
          }}
        />

        <Button
          type="submit"
          disabled={isLoading}
          style={{
            background: isLoading ? "#aaa" : "#cc651f",
            color: "white",
            marginTop: "20px",
          }}
        >
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </form>
      <ToastContainer />
    </ConfigProvider>
  );
};

export default ReplyForm;
