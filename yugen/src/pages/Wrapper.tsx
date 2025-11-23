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
    const checkUser = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          setStatus("unauthenticated");
          return;
        }

        const { data } = await axios.get(
          "http://localhost:8080/api/auth/status",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStatus(data.status);
      } catch (err) {
        console.error("Error checking auth status:", err);
        setStatus("unauthenticated");
      }
    };

    checkUser();
  }, [getAccessToken]);

  if (status === "loading")
    return (
      <div>
        <Loading />
      </div>
    );
  if (status === "unauthenticated") return <Navigate to="/login" />;
  if (status === "signupGoogle") return <Navigate to="/googleSignUp" />;

  return <>{children}</>;
}

export default Wrapper;
