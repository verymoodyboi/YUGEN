import "../App.css";
import NavBar from "../components/NavBar";
import ReportForm from "../components/Report";
import Birdies from "../components/Birdies";
function ReportPage() {
  const ReportP = (
    <div>
      <Birdies />
      <NavBar></NavBar>
      <ReportForm></ReportForm>
    </div>
  );
  return ReportP;
}
export default ReportPage;
