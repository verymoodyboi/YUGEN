import React, { useEffect, useState } from "react";
import supabase from "../server/config";
import { Navigate } from "react-router-dom";

function Wrapper({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        setStatus("unauthenticated");
        return;
      }

      const userEmail = session.user.email;

      // Check if user exists in users2 table using email
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", userEmail)
        .single(); // Assumes one user per email

      if (error || !data) {
        setStatus("signupGoogle"); // user not found in users2
      } else {
        setStatus("authenticated"); // user exists in users2
      }
    };

    checkUser();
  }, []);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/LoginPage" />;
  }

  if (status === "signupGoogle") {
    return <Navigate to="/googleSignUp" />;
  }

  return <>{children}</>;
}

export default Wrapper;
