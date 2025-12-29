import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import supabase from "../lib/supabaseClient";
import { useToast } from "../components/toaster";

function WaitingConfirmation() {
  const [searchParams] = useSearchParams();

  const emailFromQuery = searchParams.get("email");
  const [email, setEmail] = useState(emailFromQuery || "");
  const [sending, setSending] = useState(false);

  const toast = useToast();

  const handleResendEmail = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      toast.error("Please enter your email address");
      return;
    }

    if (sending) return;

    setSending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
        options: {
          emailRedirectTo: "http://localhost:5173/profile-customization",
        },
      });

      if (error) throw error;

      toast.success("Verification email resent! Check your inbox.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to resend verification email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-6">
      <div
        className="
          flex flex-col items-center text-center gap-4
          bg-emerald-50
          border-4 border-emerald-950
          rounded-3xl
          shadow-[6px_6px_0_#064e3b]
          p-8
          max-w-lg
          w-full
          font-freckle
          max-h-[90vh]
          overflow-y-auto
          hidden-scrollbar
        "
      >
        <img
          src="https://iqvsgbsnpqvbddmdixoz.supabase.co/storage/v1/object/public/assets/Kickflip!.gif"
          alt="Yugen Logo"
          className="h-36 w-auto mb-4"
        />

        <h1 className="text-3xl text-emerald-950">Check your inbox!</h1>

        <p className="text-lg text-emerald-900">
          We’ve sent you a confirmation email
        </p>

        {emailFromQuery && (
          <p className="text-xl font-bold text-emerald-950 break-all">
            at {emailFromQuery}
          </p>
        )}

        <p className="text-emerald-900 mt-2">
          Click the link in the email to confirm your account.
        </p>

        <p className="text-sm text-emerald-700 mt-4">
          Didn’t receive it? Check your spam folder.
        </p>

        {/* Show input ONLY if email was not provided in the URL */}
        {!emailFromQuery && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 mt-4 border-2 border-emerald-950 text-emerald-950 bg-emerald-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-freckle"
          />
        )}

        <button
          onClick={handleResendEmail}
          disabled={sending}
          className={`
            mt-6 px-6 py-3 rounded-xl font-freckle text-emerald-50
            bg-emerald-950 hover:bg-emerald-800 transition
            ${sending ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {sending ? "Sending..." : "Resend Confirmation Email"}
        </button>
      </div>
    </div>
  );
}

export default WaitingConfirmation;
