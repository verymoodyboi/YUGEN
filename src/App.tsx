import "./App.css";
import UploadPage from "./L1/UploadPage.tsx";
import SignUpPage from "./L1/SignUpPage.tsx";
import LoginPage from "./L1/LoginPage.tsx";
import HomePage from "./L1/HomePage.tsx";
import ResetPassword from "./L1/ResetPasswordPage.tsx";
import UserProfile from "./L1/UserProfile.tsx";
import Wrapper from "./L1/Wrapper.tsx";
import SearchPage from "./L1/SeacrPage.tsx";
import Watch from "./L1/Watch.tsx";
import SignUpGoogle from "./L2/SignUpWithGoogle.tsx";
import AccountProfile from "./L1/AccProfile.tsx";
import PlaylistsPage from "./L1/PlaylistsPage.tsx";
import Subscriptons from "./L1/Subscriptions.tsx";
import WatchlistPage from "./L1/WatchList.tsx";
import WatchPlaylist from "./L1/WatchPlaylist.tsx";
import HistoryPage from "./L1/HstoryPage.tsx";
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
          <Route path="/search" element={<SearchPage />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/watchplaylist" element={<WatchPlaylist />} />
          <Route path="/subs" element={<Subscriptons />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/@" element={<AccountProfile />} />

          <Route path="/SignUpPage" element={<SignUpPage />} />
          <Route path="/googleSignUp" element={<SignUpGoogle />} />

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
