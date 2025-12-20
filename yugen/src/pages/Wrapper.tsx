import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/loading_kickflip";

function Wrapper({ children }) {
  const [status, setStatus] = useState<
    "loading" | "unauthenticated" | "signupGoogle" | "authenticated"
  >("loading");

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

        const { data } = await axios.get(
          "http://46.101.247.144/api/auth/status",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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

  if (status === "loading") return <Loading />;

  if (status === "unauthenticated") return <Navigate to="/about" replace />;

  if (status === "signupGoogle") return <Navigate to="/googleSignUp" replace />;

  return <>{children}</>;
}

export default Wrapper;
