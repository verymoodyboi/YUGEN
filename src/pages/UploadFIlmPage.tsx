import "../App.css";
import NavBar from "../components/NavBar";
import UploadForm from "../components/UploadForm";
import Birdies from "../components/Birdies";
function UploadFIlmPage() {
  const UFP = (
    <div>
      <Birdies />
      <NavBar></NavBar>
      <UploadForm></UploadForm>
    </div>
  );
  return UFP;
}
export default UploadFIlmPage;
