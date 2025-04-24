import "./App.css";
import HomePage from "./pages/HomePage.tsx";
import UploadFIlmPage from "./pages/UploadFIlmPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

function Yugen() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/UploadFilmPage" element={<UploadFIlmPage />} />
          <Route path="/SignUpPage" element={<SignUpPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />
        </Routes>
      </Router>
    </div>
  );
}
export default Yugen;
