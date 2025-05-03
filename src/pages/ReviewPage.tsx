import "../App.css";
import Birdies from "../components/Birdies";
import NavBar from "../components/NavBar";
import ReviewForm from "../components/Review";
function ReviewPage() {
  return (
    <div>
      <Birdies />
      <NavBar></NavBar>
      <ReviewForm></ReviewForm>
    </div>
  );
}
export default ReviewPage;
