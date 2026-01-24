import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/loading_kickflip";
import { FiLock } from "react-icons/fi";

type AdminStatus =
  | "loading"
  | "unauthenticated"
  | "unauthorized"
  | "authorized";

function AdminWrapper({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AdminStatus>("loading");
  const { getAccessToken, userInfo } = useAuth();

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      try {
        const token = await getAccessToken();

        //  Not logged in
        if (!token) {
          if (mounted) setStatus("unauthenticated");
          return;
        }

        //  Wait for profile
        if (!userInfo) {
          if (mounted) setStatus("loading");
          return;
        }

        //  Role check
        if (userInfo.role === "admin") {
          if (mounted) setStatus("authorized");
        } else {
          if (mounted) setStatus("unauthorized");
        }
      } catch {
        if (mounted) setStatus("unauthenticated");
      }
    };

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, [getAccessToken, userInfo]);

  //  Loading
  if (status === "loading") return <Loading />;

  //  Not logged in
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  //  Logged in but not admin → static page
  if (status === "unauthorized") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 text-emerald-950 font-freckle p-6">
        <div className="max-w-md text-center border-4 border-emerald-950 rounded-xl p-8 bg-emerald-100">
          <FiLock className="mx-auto mb-4 text-4xl" />
          <h1 className="text-2xl font-bold mb-2">Admin Only</h1>
          <p className="text-sm opacity-80">
            This page is restricted to administrators.
            <br />
            If you believe this is a mistake, please contact the Yugen team.
          </p>
        </div>
      </div>
    );
  }

  //  Authorized admin
  return <>{children}</>;
}

export default AdminWrapper;
