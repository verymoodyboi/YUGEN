import "./App.css";
//import HomePage from "./pages/HomePage.tsx";
import UploadFIlmPage from "./pages/UploadFIlmPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import WatchFilmPage from "./pages/WatchFilmPage.tsx";
import ReportPage from "./pages/ReportPage.tsx";
import ReviewPage from "./pages/ReviewPage.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";
import PageContainerBasic from "./pages/HomePageReformat.tsx";
import Films from "./components/Film.tsx";
import SwipeableEdgeDrawer from "./components/testt.tsx";
import Landing from "./pages/Landing.tsx";
import TempCLubPage from "./pages/TempClubPage.tsx";
import Club from "./components/Club.tsx";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

function Yugen() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/UploadFilmPage" element={<UploadFIlmPage />} />
          <Route path="/SignUpPage" element={<SignUpPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/Watch" element={<WatchFilmPage />} />
          <Route path="/Report" element={<ReportPage />} />
          <Route path="/AddThought" element={<ReviewPage />} />
          <Route path="/Profile" element={<UserProfilePage />} />
          <Route path="/community" element={<Club id={1} />} />
          <Route path="/test" element={<SwipeableEdgeDrawer />} />
          <Route path="/Landing" element={<Landing />} />
          <Route path="/Club" element={<TempCLubPage />} />
        </Routes>
      </Router>
    </div>
  );
}
export default Yugen;
