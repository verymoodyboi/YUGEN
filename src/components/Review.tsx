import "../App.css";
import { useState, useEffect } from "react";
import supabase from "../server/config";
import { TextField, Button } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfigProvider, Rate } from "antd";
import axios from "axios";

interface targetFilm {
  id: number;
  userInfo?: any;
  onSubmitSuccess?: () => void;
}
const ReviewForm: React.FC<targetFilm> = ({
  id,
  userInfo,
  onSubmitSuccess,
}) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };
  const validate = () => {
    const errors = {};
    if (!rating) {
      errors.rating = "no rating";
      toast.warn(
        "Come on, at least appretiate the effort! Please select at least one star."
      );
    }
    return errors;
  };
  const SendToServer = async () => {
    try {
      const formData = new FormData();
      formData.append("rating", rating.toString());
      formData.append("comment", comment);
      formData.append("id", id.toString());
      formData.append("user_id", userInfo.user_id.toString());
      axios.post("http://localhost:3001/addthought", formData);
      axios.post("http://localhost:3001/addthoughtv1", formData);
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
    console.log("User data loaded:", userInfo);
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
          <label id="ReviewLabel">Review</label>
          <p id="ReviewText">
            How many stars does this film deserve? Let the creator know!
          </p>
          <Rate count={10} value={rating} onChange={setRating} />
          <TextField
            name="Comment"
            label="Comment (Optional)"
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
            value={comment}
            onChange={(event) => setComment(event.target.value)}
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

export default ReviewForm;
