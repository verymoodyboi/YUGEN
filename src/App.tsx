import "./App.css";
import HomePage from "./pages/HomePage.tsx";
import UploadFIlmPage from "./pages/UploadFIlmPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import WatchFilmPage from "./pages/WatchFilmPage.tsx";
import ReportPage from "./pages/ReportPage.tsx";
import ReviewPage from "./pages/ReviewPage.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";
// import Films from "./components/Film.tsx";

// import FilmBox from "./components/FilmBox.tsx";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

function Yugen() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/UploadFilmPage" element={<UploadFIlmPage />} />
          <Route path="/WatchFilmPage" element={<WatchFilmPage />} />
          <Route path="/SignUpPage" element={<SignUpPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/Watch" element={<WatchFilmPage />} />
          <Route path="/Report" element={<ReportPage />} />
          <Route path="/Review" element={<ReviewPage />} />
          <Route path="/Profile" element={<UserProfilePage />} />

        </Routes>
      </Router>

      {/* <div className="Testingcurrently">
        <FilmBox />
      </div> */}
    </div>
  );
}
export default Yugen;
