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
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import ThoughtsWrapper from "./components/ThoughtsWrapper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Yugen() {
  return (
    <AuthProvider>
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
            <Route path="/thoughts/:filmId" element={<ThoughtsWrapper />} />
          </Routes>
        </Router>
        <ToastContainer
          position="top-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </AuthProvider>
  );
}
export default Yugen;
