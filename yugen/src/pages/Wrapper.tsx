import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/loading_kickflip";
import { api } from "../lib/api";

type AuthStatus =
  | "loading"
  | "unauthenticated"
  | "pendingGoogleSignup"
  | "pendingConfirmation"
  | "authenticated";

function Wrapper({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const { getAccessToken } = useAuth();

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const token = await getAccessToken();

        if (!token) {
          if (mounted) setStatus("unauthenticated");
          return;
        }

        const { data } = await api.get("/auth/status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (mounted) setStatus(data.status);
      } catch {
        if (mounted) setStatus("unauthenticated");
      }
    };

    checkUser();

    return () => {
      mounted = false;
    };
  }, [getAccessToken]);

  //  Loading
  if (status === "loading") return <Loading />;

  //  Not logged in
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  //  Google auth but no public.users row
  if (status === "pendingGoogleSignup") {
    return <Navigate to="/googleSignUp" replace />;
  }

  //  Email not confirmed
  if (status === "pendingConfirmation") {
    return <Navigate to="/pending-email-confirmation" replace />;
  }

  //  Fully authenticated
  return <>{children}</>;
}

export default Wrapper;
