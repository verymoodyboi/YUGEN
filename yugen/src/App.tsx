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
import NotificationsPage from "./pages/notificationsPage.tsx";
import SettingsPage from "./pages/settingsPage.tsx";
import ErrorBoundary from "./pages/errorPage.tsx";
import ProfileCustomization from "./pages/cotumizeProfilePage.tsx";
import GenresPage from "./pages/genresPage.tsx";
import FilmRollPickerPage from "./pages/randomFilmPage.tsx";
import FilmGlobePage from "./pages/filmGlobePage.tsx";
import CountryPage from "./pages/countryPage.tsx";
import FlaggedFilmsPage from "./pages/admin/flaggedFilmsPage.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.tsx";
import WaitingComfirmation from "./pages/waitingEmailComfirmationPage.tsx";
import AppLayout from "./layouts/layout-main.tsx";
import AppLayout2 from "./layouts/layout-secondery.tsx";
import Legal from "./pages/legal/termsAndPoliciesPage.tsx";
import PrivacyPolicyPage from "./pages/legal/privacyPolicyPage.tsx";
function Yugen() {
  return (
    <div>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/about" element={<LandingPage />} />
            <Route element={<AppLayout2 />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/SignUpPage" element={<SignUpPage />} />
              <Route path="/googleSignUp" element={<SignUpGoogle />} />
              <Route path="/onboarding" element={<ProfileCustomization />} />
              <Route
                path="/reset-password"
                element={
                  <Wrapper>
                    <ResetPassword />
                  </Wrapper>
                }
              />
              <Route
                path="/pending-email-confirmation"
                element={<WaitingComfirmation />}
              />
            </Route>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/terms" element={<Legal />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

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
                path="/UploadFilmPage"
                element={
                  <Wrapper>
                    <UploadPage />
                  </Wrapper>
                }
              />

              <Route path="/search" element={<SearchPage />} />
              <Route path="/watch" element={<Watch />} />
              <Route path="/watchplaylist" element={<WatchPlaylist />} />
              <Route path="/random" element={<FilmRollPickerPage />} />

              <Route path="/globe" element={<FilmGlobePage />} />
              <Route path="/country" element={<CountryPage />} />
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

              <Route path="/genre" element={<GenrePage />} />

              <Route path="/genres" element={<GenresPage />} />

              <Route
                path="/notifications"
                element={
                  <Wrapper>
                    <NotificationsPage />
                  </Wrapper>
                }
              />

              <Route path="/@" element={<AccountProfile />} />
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
            </Route>
          </Routes>
        </Router>
      </ErrorBoundary>
    </div>
  );
}

export default Yugen;
