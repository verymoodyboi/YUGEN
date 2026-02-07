import "../../../App.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../../../lib/supabaseClient.ts";
import GoogleIcon from "@mui/icons-material/Google";
import CloseIcon from "@mui/icons-material/Close";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CheckIcon from "@mui/icons-material/Check";
import logo from "../../../YugenAssits/Transparent long.png";
import { useToast } from "../../../components/toaster.tsx";
import { Transition } from "@headlessui/react";

function LoginForm() {
  const frontEndOrigin = import.meta.env.FRONTEND_ORIGIN;
  const toast = useToast();
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
      redirectTo: `${frontEndOrigin}/reset-password`,
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

      if (error.message.includes("Email not confirmed")) {
        return navigate(
          `/pending-email-confirmation?email=${encodeURIComponent(email)}`,
        );
      } else {
        return toast.warn("Invalid email or password!");
      }
    }

    if (data) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email_confirmed_at) {
        return navigate(
          `/pending-email-confirmation?email=${encodeURIComponent(email)}`,
        );
      }
      navigate("/");
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}` },
    });
    if (error) {
      console.error("Google sign in error:", error);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[90vh]  text-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-emerald-50 rounded-3xl shadow-xl p-8 max-w-md w-full border-4 border-emerald-950"
      >
        <img
          src="https://iqvsgbsnpqvbddmdixoz.supabase.co/storage/v1/object/public/assets/Kickflip!.gif"
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
          </Link>{" "}
          or{" "}
          <p
            onClick={async () => {
              const error = await supabase.auth.signOut();
              navigate("/");
            }}
            className="underline text-emerald-950 hover:text-emerald-700 cursor-pointer"
          >
            continue as a guest.
          </p>
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 mb-4 border-2 border-emerald-950 text-emerald-950 bg-emerald-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-freckle"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 mb-6 border-2 border-emerald-950 text-emerald-950 bg-emerald-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-freckle"
        />

        <button
          type="submit"
          className="w-full py-3 mb-4 rounded-xl font-freckle text-emerald-50 bg-emerald-950 hover:bg-emerald-800 transition-all"
        >
          Login
        </button>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-3 flex items-center justify-center gap-2 rounded-xl font-freckle text-emerald-950 border-2 border-emerald-950 bg-emerald-50 hover:bg-emerald-100 transition-all"
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        <button
          type="button"
          onClick={() => setOpenReset(true)}
          className="mt-6 underline text-emerald-950 hover:text-emerald-700 font-freckle"
        >
          Forgot password?
        </button>
        <p className="mt-4 text-xs text-emerald-950/60 font-freckle">
          By signing up, you agree to our{" "}
          <Link
            to="/yugen-privacy-policy.html"
            className="underline hover:text-emerald-700 transition"
          >
            Privacy Policy
          </Link>
        </p>
      </form>

      {openReset && (
        <Transition
          show={openReset}
          enter="transition duration-200 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition duration-150 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setOpenReset(false);
              setIsDone(false);
            }}
          >
            <div
              className="
          relative flex flex-col gap-4 w-full max-w-md p-6 
          rounded-2xl border-4 border-emerald-950 bg-emerald-50
          shadow-[6px_6px_0_#064e3b] font-freckle
        "
              onClick={(e) => e.stopPropagation()}
            >
              {isDone ? (
                <>
                  <CheckIcon
                    className="text-emerald-950 mx-auto mb-4"
                    sx={{ fontSize: 100 }}
                  />
                  <h2 className="text-2xl text-center text-emerald-950">
                    You will be sent an email to reset your password!
                  </h2>
                </>
              ) : (
                <>
                  <VpnKeyIcon
                    className="text-emerald-950 mx-auto mb-4"
                    sx={{ fontSize: 100 }}
                  />

                  <h2 className="text-xl text-center text-emerald-950 mb-2">
                    Please confirm your email to reset your password
                  </h2>

                  <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="
                w-full px-4 py-3 mb-3 border-2 border-emerald-950 
                bg-emerald-50 text-emerald-950 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-emerald-600
                font-freckle
              "
                  />

                  <button
                    onClick={handleChangePasswordEmail}
                    className="
                w-full py-3 rounded-xl font-freckle text-emerald-50
                bg-emerald-950 hover:scale-105 transition
              "
                  >
                    Finish
                  </button>
                </>
              )}
            </div>
          </div>
        </Transition>
      )}
    </div>
  );
}

export default LoginForm;
