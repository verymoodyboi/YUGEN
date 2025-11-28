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
import WaitingComfirmation from "./pages/waitingEmailComfirmationPage.tsx";
function Yugen() {
  return (
    <ThemeProvider>
      <div>
        <ErrorBoundary>
          <Router>
            <Routes>
              <Route path="/about" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/SignUpPage" element={<SignUpPage />} />
              <Route path="/googleSignUp" element={<SignUpGoogle />} />
              <Route path="/resetPassword" element={<ResetPassword />} />
              <Route
                path="/confirmation:pending:"
                element={<WaitingComfirmation />}
              />

              <Route
                path="/"
                element={
                  <Wrapper>
                    <HomePage />
                  </Wrapper>
                }
              />

              <Route
                path="/UploadFilmPage"
                element={
                  <Wrapper>
                    <UploadPage />
                  </Wrapper>
                }
              />

              <Route
                path="/search"
                element={
                  <Wrapper>
                    <SearchPage />
                  </Wrapper>
                }
              />

              <Route
                path="/watch"
                element={
                  <Wrapper>
                    <Watch />
                  </Wrapper>
                }
              />

              <Route
                path="/random"
                element={
                  <Wrapper>
                    <FilmRollPickerPage />
                  </Wrapper>
                }
              />

              <Route
                path="/globe"
                element={
                  <Wrapper>
                    <FilmGlobePage />
                  </Wrapper>
                }
              />

              <Route
                path="/watchplaylist"
                element={
                  <Wrapper>
                    <WatchPlaylist />
                  </Wrapper>
                }
              />

              <Route
                path="/settings"
                element={
                  <Wrapper>
                    <SettingsPage />
                  </Wrapper>
                }
              />

              <Route
                path="/subs"
                element={
                  <Wrapper>
                    <Subscriptons />
                  </Wrapper>
                }
              />

              <Route
                path="/playlists"
                element={
                  <Wrapper>
                    <PlaylistsPage />
                  </Wrapper>
                }
              />

              <Route
                path="/watchlist"
                element={
                  <Wrapper>
                    <WatchlistPage />
                  </Wrapper>
                }
              />

              <Route
                path="/history"
                element={
                  <Wrapper>
                    <HistoryPage />
                  </Wrapper>
                }
              />

              <Route
                path="/genre"
                element={
                  <Wrapper>
                    <GenrePage />
                  </Wrapper>
                }
              />

              <Route
                path="/genres"
                element={
                  <Wrapper>
                    <GenresPage />
                  </Wrapper>
                }
              />

              <Route
                path="/challenges"
                element={
                  <Wrapper>
                    <ExploreChallengesPage />
                  </Wrapper>
                }
              />

              <Route
                path="/notifications"
                element={
                  <Wrapper>
                    <NotificationsPage />
                  </Wrapper>
                }
              />

              <Route
                path="/challenge"
                element={
                  <Wrapper>
                    <ChallengePage />
                  </Wrapper>
                }
              />

              <Route
                path="/@"
                element={
                  <Wrapper>
                    <AccountProfile />
                  </Wrapper>
                }
              />

              <Route
                path="/profile-customization"
                element={<ProfileCustomization />}
              />

              <Route
                path="/Profile"
                element={
                  <Wrapper>
                    <UserProfile />
                  </Wrapper>
                }
              />

              <Route
                path="/flagged"
                element={
                  <Wrapper>
                    <FlaggedFilmsPage />
                  </Wrapper>
                }
              />
            </Routes>
          </Router>
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}

export default Yugen;
