import "./App.css";
import UploadPage from "./pages/uploadFilmPage.tsx";
import SignUpPage from "./pages/signUpPage.tsx";
import LoginPage from "./pages/loginPage.tsx";
import HomePage from "./pages/homePage.tsx";
import ResetPassword from "./pages/resetPasswordPage.tsx";
import UserProfile from "./pages/myProfilePage.tsx";
import Wrapper from "./pages/Wrapper.tsx";
import SearchPage from "./pages/searchResultsPage.tsx";
import Watch from "./pages/watchFilmPage.tsx";
import SignUpGoogle from "./features/register/components/SignUpWithGoogle.tsx";
import AccountProfile from "./pages/viewProfilePage.tsx";
import PlaylistsPage from "./pages/myPlaylistsPage.tsx";
import Subscriptons from "./pages/mySubscriptionsPage.tsx";
import WatchlistPage from "./pages/myWatchlistPage.tsx";
import WatchPlaylist from "./pages/watchPlaylistPage.tsx";
import HistoryPage from "./pages/historyPage.tsx";
import GenrePage from "./pages/genrePage.tsx";
import ChallengePage from "./pages/challengePage.tsx";
import ExploreChallengesPage from "./pages/challengesPage.tsx";
import NotificationsPage from "./pages/notificationsPage.tsx";
import SettingsPage from "./pages/settingsPage.tsx";
import ErrorBoundary from "./pages/errorPage.tsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProfileCustomization from "./pages/cotumizeProfilePage.tsx";
import GenresPage from "./pages/genresPage.tsx";
import FilmRollPickerPage from "./pages/randomFilmPage.tsx";
import FilmGlobePage from "./pages/filmGlobePage.tsx";
import FlaggedFilmsPage from "./pages/admin/flaggedFilmsPage.tsx";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.tsx";
function Yugen() {
  return (
    <ThemeProvider>
      <div>
        <ErrorBoundary>
          <Router>
            <Routes>
              <Route
                path="/home"
                element={
                  <Wrapper>
                    <HomePage />
                  </Wrapper>
                }
              />
              <Route path="/" element={<LandingPage />} />

              <Route
                path="/UploadFilmPage"
                element={
                  <Wrapper>
                    <UploadPage />
                  </Wrapper>
                }
              />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/watch" element={<Watch />} />
              <Route path="/random" element={<FilmRollPickerPage />} />
              <Route path="/globe" element={<FilmGlobePage />} />

              <Route path="/watchplaylist" element={<WatchPlaylist />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/subs" element={<Subscriptons />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/genre" element={<GenrePage />} />
              <Route path="/genres" element={<GenresPage />} />

              <Route path="/challenges" element={<ExploreChallengesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/challenge" element={<ChallengePage />} />
              <Route path="/@" element={<AccountProfile />} />
              <Route path="/SignUpPage" element={<SignUpPage />} />
              <Route path="/googleSignUp" element={<SignUpGoogle />} />
              <Route
                path="/profile-customization"
                element={<ProfileCustomization />}
              />

              <Route path="/login" element={<LoginPage />} />
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
              <Route path="/flagged" element={<FlaggedFilmsPage />} />
            </Routes>
          </Router>
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}

export default Yugen;
