import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/loading_kickflip";
import supabase from "../lib/supabaseClient";

type AuthStatus =
  | "loading"
  | "checking"
  | "unauthenticated"
  | "signupGoogle"
  | "emailUnverified"
  | "firstLogin"
  | "authenticated";

function Wrapper({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const { getAccessToken } = useAuth();

  /* ------------------------------------------------------------------ */
  /* STEP 1: BASIC AUTH CHECK (NO PROVIDER LOGIC)                        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      setStatus("checking");

      try {
        const token = await getAccessToken();
        if (!token) {
          if (mounted) setStatus("unauthenticated");
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) setStatus("unauthenticated");
          return;
        }

        /**
         * At this point:
         * - User is authenticated at Supabase level
         * - All provider / verification logic is backend-owned
         */
        if (mounted) setStatus("authenticated");
      } catch {
        if (mounted) setStatus("unauthenticated");
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [getAccessToken]);

  /* ------------------------------------------------------------------ */
  /* STEP 2: BACKEND-DRIVEN STATE CHECKS (AUTHENTICATED ONLY)            */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (status !== "authenticated") return;

    let mounted = true;

    const checkBackendState = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;

        const res = await axios.get(
          "https://try-yugen.com/api/tools/checkFirstTimer",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        /**
         * Backend response decides everything
         */
        if (mounted) {
          if (res.data?.requires_email_verification) {
            setStatus("emailUnverified");
            return;
          }

          if (res.data?.requires_google_signup) {
            setStatus("signupGoogle");
            return;
          }

          if (res.data?.first_timer === true) {
            setStatus("firstLogin");
            return;
          }
        }
      } catch {
        /* silent */
      }
    };

    checkBackendState();

    return () => {
      mounted = false;
    };
  }, [status, getAccessToken]);

  /* ------------------------------------------------------------------ */
  /* HARD GUARDS                                                         */
  /* ------------------------------------------------------------------ */

  if (status === "loading" || status === "checking") {
    return <Loading />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/about" replace />;
  }

  if (status === "emailUnverified") {
    return <Navigate to="/pending-email-confirmation" replace />;
  }

  if (status === "signupGoogle") {
    return <Navigate to="/googleSignUp" replace />;
  }

  if (status === "firstLogin") {
    return <Navigate to="/profile-customization" replace />;
  }

  return <>{children}</>;
}

export default Wrapper;
