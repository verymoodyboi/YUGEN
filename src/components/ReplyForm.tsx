import "../App.css";
import { useState } from "react";
import { TextField, Button } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfigProvider, Rate } from "antd";
import axios from "axios";
import { Box } from "@mui/material";
interface targetReply {
  //film_id: number;
  comment_id: number;
  commentor: string;
  onSubmitSuccess?: () => void;
}
const ReplyForm: React.FC<targetReply> = ({
  comment_id,
  commentor,
  onSubmitSuccess,
}) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [rating, setRating] = useState<number>(0);

  const validate = () => {
    const errors = {};
    if (!comment) {
      errors.comment = "no comment";
      toast.warn("add comment");
    }
    return errors;
  };
  const SendToServer = async () => {
    try {
      const formData = new FormData();
      //formData.append("rating", rating.toString());
      formData.append("comment", comment);
      formData.append("comment_id", comment_id.toString());
      // formData.append("user_id", film_id.toString());
      //axios.post("http://localhost:3001/addthought", formData);
      axios.post("http://localhost:3001/replies", formData);
    } catch (error: any) {
      if (error) {
        toast("" + error);
        return error;
      } else {
        toast("succes");

        return "";
      }
    }
    setIsSubmit(true);
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = await validate();
    if (Object.keys(errors).length === 0) {
      await SendToServer();
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    }
  };
  if (isSubmit == false) {
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
            label="reply"
            variant="outlined"
            multiline
            maxRows={20}
            sx={{
              minHeight: "80px",
              height: "auto",
              fontSize: "16px",
              padding: "10px",
              width: "100%",
              marginTop: "16px",
            }}
            // value={comment}
            defaultValue={"@" + commentor}
            onChange={(event) => {
              setComment(event.target.value);
            }}
          />
          <Button
            type="submit"
            style={{ background: "#cc651f", color: "white", marginTop: "20px" }}
          >
            Submit
          </Button>
        </form>
        <ToastContainer />
      </ConfigProvider>
    );
  }
};
export default ReplyForm;
