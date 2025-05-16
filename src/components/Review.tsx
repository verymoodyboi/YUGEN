import "../App.css";
import "react-toastify/dist/ReactToastify.css";
import { Rating } from "@mui/material";

function ReviewForm() {
  return (
    <div className="ReviewForm">
      <label id="ReviewLabel">Review</label>
      <p id="ReviewText">
        How many stars does this film deserve? Let the creator know!
      </p>
      <div id="ReviewIcon"></div>
      <Rating
        name="film-rating"
        defaultValue={0}
        max={10}
        precision={0.5}
        size="large"
        sx={{
          fontSize: "35px",
          color: "#cc651f",
        }}
      />
    </div>
  );
}

export default ReviewForm;
