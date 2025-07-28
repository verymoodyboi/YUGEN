import "../App.css";
import NavBar from "../L2/NavBar";
import UploadForm from "../L2/UploadForm";
import Birdies from "../L2/Birdies";
function UploadPage() {
  const UFP = (
    <div>
      <Birdies />
      <NavBar></NavBar>
      <UploadForm></UploadForm>
    </div>
  );
  return UFP;
}
export default UploadPage;
