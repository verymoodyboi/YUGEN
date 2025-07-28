import "./App.css";
import UploadPage from "./L1/UploadPage.tsx";
import SignUpPage from "./L1/SignUpPage.tsx";
import LoginPage from "./L1/LoginPage.tsx";
import HomePage from "./L1/HomePage.tsx";
import ResetPassword from "./L1/ResetPasswordPage.tsx";
import UserProfile from "./L1/UserProfile.tsx";
import Wrapper from "./L1/Wrapper.tsx";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
function Yugen() {
  return (
    <div>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Wrapper>
                <HomePage />
              </Wrapper>
            }
          />
          <Route path="/UploadFilmPage" element={<UploadPage />} />
          <Route path="/SignUpPage" element={<SignUpPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route
            path="/Profile"
            element={
              <Wrapper>
                <UserProfile />
              </Wrapper>
            }
          />

          <Route
            path="/resetPassword"
            element={
              <Wrapper>
                <ResetPassword />
              </Wrapper>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default Yugen;
