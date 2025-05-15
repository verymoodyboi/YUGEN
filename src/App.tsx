import "./App.css";
import HomePage from "./pages/HomePage.tsx";
import UploadFIlmPage from "./pages/UploadFIlmPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import WatchFilmPage from "./pages/WatchFilmPage.tsx";
import ReportPage from "./pages/ReportPage.tsx";
import ReviewPage from "./pages/ReviewPage.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";
import HomePageReformat from "./pages/HomePageReformat.tsx";
import Films from "./components/Film.tsx";
import Thoughts from "./components/thoughts.tsx";
import SwipeableEdgeDrawer from "./components/testt.tsx";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

function Yugen() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePageReformat />} />
          <Route path="/UploadFilmPage" element={<UploadFIlmPage />} />
          <Route path="/SignUpPage" element={<SignUpPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/Watch" element={<WatchFilmPage />} />
          <Route path="/Report" element={<ReportPage />} />
          <Route path="/AddThought" element={<ReviewPage />} />
          <Route path="/Profile" element={<UserProfilePage />} />
          <Route path="/film" element={<Films />} />
          <Route path="/test" element={<SwipeableEdgeDrawer />} />
        </Routes>
      </Router>
    </div>
  );
}
export default Yugen;
