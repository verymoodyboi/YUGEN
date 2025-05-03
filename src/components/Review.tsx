import "../App.css";
import { useState } from "react";
import { TextField, Button } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfigProvider, Rate } from "antd";
import axios from "axios";

function ReviewForm() {
  const [isSubmit, setIsSubmit] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
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

      toast.success(`Rating: ${rating}, Comment: ${comment}`);
      axios.post("http://localhost:3001/Review", formData);
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
          <Rate count={10} allowHalf value={rating} onChange={setRating} />
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
  } else {
    // Countdown timer for redirecting to another URL after several seconds
    let seconds = 5;
    let foo: ReturnType<typeof setInterval>;

    function redirect(): void {
      window.location.replace("/");
    }

    const updateSecs = async () => {
      const secondsElement = document.getElementById("seconds");
      console.log("updateSecs called, seconds:", seconds); // Debug line

      if (secondsElement) {
        secondsElement.innerHTML = seconds.toString();
      }
      seconds--;
      if (seconds < 0) {
        clearInterval(foo);
        redirect();
      }
    };
    function countdownTimer(): void {
      toast("Film uploaded successfully!");
      foo = setInterval(updateSecs, 1000);
    }

    countdownTimer();
    return (
      <div className="film-submit">
        <p className="film-submit-text">We appreciate you feedback!</p>
        <p className="film-submit-text" id="email-hover">
          {" "}
          Yugen@placeholder.com
        </p>
        <p className="film-submit-text" id="redirect">
          You should automatically be redirected in <span id="seconds">10</span>{" "}
          seconds.
        </p>
        <ToastContainer /*this styles the "toast alerts (alerts that show up on the side when there is an error)*/
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
  }
}

export default ReviewForm;
