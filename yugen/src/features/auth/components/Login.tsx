import "../../../App.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../../../lib/supabaseClient.ts";
import GoogleIcon from "@mui/icons-material/Google";
import CloseIcon from "@mui/icons-material/Close";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CheckIcon from "@mui/icons-material/Check";
import logo from "../../../YugenAssits/Transparent long.png";
import { toast, ToastContainer } from "react-toastify";

function LoginForm() {
  const [openReset, setOpenReset] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleChangePasswordEmail = async () => {
    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return toast.warn("Valid email required");
    }
    setIsDone(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/#/resetPassword",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      console.error("Supabase login error:", error);
      setEmail("");
      setPassword("");
      if (error.message.includes("Email not confirmed")) {
        return toast.warn("Please confirm your email before logging in.");
      } else {
        return toast.warn("Invalid email or password!");
      }
    }

    if (data) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email_confirmed_at) {
        return toast.warn("Please verify your email before logging in.");
      }
      navigate("/");
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}#/home` },
    });
    if (error) {
      console.error("Google sign in error:", error);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-50 text-center p-6">
      <ToastContainer />

      <form
        onSubmit={handleSubmit}
        className="bg-emerald-50 rounded-3xl shadow-xl p-8 max-w-md w-full border-4 border-emerald-950"
      >
        <img
          src="https://iqvsgbsnpqvbddmdixoz.supabase.co/storage/v1/object/public/assets/Yugen%20Logo%20Vector%20FINAL.svg"
          alt="Yugen Logo"
          className="h-36 w-auto mx-auto mb-6"
        />

        <p className="mb-4 text-emerald-950">
          Don&apos;t have an account?{" "}
          <Link
            to="/SignUpPage"
            className="underline text-emerald-950 hover:text-emerald-700"
          >
            Signup
          </Link>
        </p>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 mb-4 border-2 border-emerald-950 text-emerald-950 bg-emerald-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-freckle"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 mb-6 border-2 border-emerald-950 text-emerald-950 bg-emerald-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-freckle"
        />

        {/* Login Button */}
        <button
          type="submit"
          className="w-full py-3 mb-4 rounded-xl font-freckle text-emerald-50 bg-emerald-950 hover:bg-emerald-800 transition-all"
        >
          Login
        </button>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-3 flex items-center justify-center gap-2 rounded-xl font-freckle text-emerald-950 border-2 border-emerald-950 bg-emerald-50 hover:bg-emerald-100 transition-all"
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        {/* Forgot password */}
        <button
          type="button"
          onClick={() => setOpenReset(true)}
          className="mt-6 underline text-emerald-950 hover:text-emerald-700 font-freckle"
        >
          Forgot password?
        </button>
      </form>

      {/* Reset Modal */}
      {openReset && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="relative bg-emerald-50 rounded-3xl shadow-2xl p-8 w-full max-w-lg border-4 border-emerald-950 text-center">
            {/* Close Button */}
            <button
              onClick={() => {
                setOpenReset(false);
                setIsDone(false);
              }}
              className="absolute top-4 left-4 text-emerald-950 hover:scale-110 transition"
            >
              <CloseIcon />
            </button>

            {/* Content */}
            {isDone ? (
              <>
                <CheckIcon
                  className="text-emerald-950 mx-auto mb-4"
                  sx={{ fontSize: 100 }}
                />
                <h2 className="text-2xl font-freckle text-emerald-950 mb-2">
                  You will be sent an email to reset your password!
                </h2>
              </>
            ) : (
              <>
                <VpnKeyIcon
                  className="text-emerald-950 mx-auto mb-4"
                  sx={{ fontSize: 100 }}
                />
                <h2 className="text-xl font-freckle text-emerald-950 mb-4">
                  Please confirm your email to reset your password
                </h2>
                <input
                  type="email"
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 mb-6 border-2 border-emerald-950 text-emerald-950 bg-emerald-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-freckle"
                />
                <button
                  onClick={handleChangePasswordEmail}
                  className="w-full py-3 rounded-xl font-freckle text-emerald-50 bg-emerald-950 hover:bg-emerald-800 transition-all"
                >
                  Finish
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginForm;
