import "./App.css";
import UploadFIlmPage from "./pages/UploadFIlmPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import WatchFilmPage from "./pages/WatchFilmPage.tsx";
import ReportPage from "./pages/ReportPage.tsx";
import ReviewPage from "./pages/ReviewPage.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";
import HomePage from "./pages/HomePage.tsx";
import Films from "./components/Film.tsx";
import Wrapper from "./pages/Wrapper.tsx";
import SwipeableEdgeDrawer from "./components/testt.tsx";
import Landing from "./pages/Landing.tsx";
import TempCLubPage from "./pages/TempClubPage.tsx";
import Club from "./components/Club.tsx";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "./server/config.ts";

function Yugen() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true); // New state

  const loadProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession(); // Use getSession instead of getUser

    if (session?.user) {
      const { data, error } = await supabase
        .from("users")
        .select("username, pfp_path, user_id")
        .eq("email", session.user.email)
        .single();

      if (!error) {
        setUserInfo(data);
        console.log("User data loaded:", data);
      } else {
        console.error("Error loading user profile:", error);
      }
    } else {
      setUserInfo(null);
    }
    setLoading(false); // Finish loading
  };

  useEffect(() => {
    loadProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadProfile(); // Reload on sign-in/sign-out
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <p>Loading session...</p>; // Optional: splash or spinner

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/UploadFilmPage" element={<UploadFIlmPage />} />
          <Route path="/SignUpPage" element={<SignUpPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/Watch" element={<WatchFilmPage />} />
          <Route path="/Profile" element={<UserProfilePage />} />
          <Route path="/community" element={<Club id={1} />} />
          <Route path="/Club" element={<TempCLubPage />} />
          <Route
            path="/home"
            element={
              <Wrapper>
                <HomePage user={userInfo} />
              </Wrapper>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default Yugen;
