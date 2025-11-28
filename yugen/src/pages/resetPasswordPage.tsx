import React, { useState } from "react";
import supabase from "../lib/supabaseClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      return toast.warn("Password must be 8+ characters");
    }
    if (newPassword !== confirmPassword) {
      return toast.warn("Passwords must match");
    }

    setIsProcessing(true);
    try {
      await supabase.auth.updateUser({ password: newPassword });
      await supabase.auth.signOut();
      setIsDone(true);
    } catch (err) {
      toast.error("Failed to reset password");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 text-emerald-950 p-6 font-freckle">
        <div className="fixed top-0 left-4 z-50 flex items-center gap-2">
          <img
            src="https://iqvsgbsnpqvbddmdixoz.supabase.co/storage/v1/object/public/assets/Kickflip!.gif"
            alt="Yugen Logo"
            className="w-20 h-20 object-contain cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        <div className="w-full max-w-md bg-emerald-50 border-4 border-emerald-950 rounded-3xl shadow-2xl p-8 text-center space-y-6">
          <img
            src="https://iqvsgbsnpqvbddmdixoz.supabase.co/storage/v1/object/public/assets/Kickflip!.gif"
            alt="Yugen Logo"
            className="w-36 h-36 mx-auto"
          />
          <h1 className="text-3xl font-bold">Password Reset Successful!</h1>
          <p className="opacity-80">
            You can now log in with your new password and start exploring Yūgen.
          </p>
          <button
            onClick={() => navigate("/loginPage")}
            className="px-6 py-2 bg-emerald-950 text-emerald-50 rounded-lg shadow hover:scale-105 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 text-emerald-950 p-6 font-freckle">
      <div className="w-full max-w-md bg-emerald-50 border-4 border-emerald-950 rounded-3xl shadow-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center">Reset Password</h1>

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-lg border-2 border-emerald-950 px-4 py-2 bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-950/30 transition"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border-2 border-emerald-950 px-4 py-2 bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-950/30 transition"
        />

        <button
          onClick={handleResetPassword}
          disabled={isProcessing}
          className={`w-full px-6 py-2 rounded-lg shadow text-emerald-50 transition ${
            isProcessing
              ? "bg-emerald-200 text-emerald-700 cursor-not-allowed"
              : "bg-emerald-950 hover:scale-105"
          }`}
        >
          {isProcessing ? "Processing..." : "Reset Password"}
        </button>

        <ToastContainer position="top-left" />
      </div>
    </div>
  );
};

export default ResetPassword;
