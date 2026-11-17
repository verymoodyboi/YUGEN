import React from "react";
import { Link } from "react-router-dom";
import "react-image-crop/dist/ReactCrop.css";
import { useSignup } from "../hooks/useSignUp";

// const steps = ["Credentials"];

const SignUpForm: React.FC = () => {
  const signup = useSignup();

  const {
    steps,
    activeStep,
    handleNext,
    handleBack,

    email,
    password,
    confirmPassword,

    setPassword,
    setConfirmPassword,

    isRegistering,
    handleSubmit,
    handleEmailChange,
  } = signup;

  const StepPill: React.FC<{
    i: number;
    label: string;
    active: boolean;
    completed: boolean;
  }> = ({ i, label, active, completed }) => (
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
           ${
             active
               ? "bg-gradient-to-br from-emerald-950 to-emerald-800 text-emerald-50 shadow-xl"
               : ""
           }
           ${completed && !active ? "bg-emerald-950 text-emerald-50" : ""}
           ${
             !active && !completed
               ? "bg-emerald-50 text-emerald-950 border-2 border-emerald-950"
               : ""
           }`}
      >
        {i + 1}
      </div>
      <div
        className={`${
          active ? "text-emerald-950 font-semibold" : "text-emerald-950/80"
        }`}
      >
        {label}
      </div>
    </div>
  );
  return (
    <div className="min-h-screen flex items-center justify-center  text-emerald-950 font-freckle p-6">
      <div
        className="
    w-full max-h-[65vh] max-w-3xl bg-emerald-50 border-4 border-emerald-950 
    rounded-3xl shadow-2xl p-6 h-[600px] overflow-y-auto hidden-scrollbar
    max-w-[80vw]
  "
      >
        <div className="mb-6">
          <h1 className="text-3xl title font-bold">Create your account</h1>

          <p className="mt-2 text-xs text-emerald-950/70">
            By signing up you agree to{" "}
            <Link to="/terms" className="underline hover:opacity-80">
              our terms and conditions
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
          {steps.map((s, i) => (
            <StepPill
              key={s}
              i={i}
              label={s}
              active={i === activeStep}
              completed={i < activeStep}
            />
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          {activeStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Email</label>
                <input
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2 focus:outline-none"
                  placeholder="name@example.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2 focus:outline-none"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label className="block mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2 focus:outline-none"
                    placeholder="Repeat password"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div>
              {activeStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 border border-emerald-950 rounded-md hover:bg-emerald-100 transition"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {activeStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 bg-emerald-950 text-emerald-50 rounded-lg shadow hover:scale-105 transition"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isRegistering}
                  className={`px-5 py-2 rounded-lg shadow ${
                    isRegistering
                      ? "bg-emerald-200 text-emerald-700"
                      : "bg-emerald-950 text-emerald-50 hover:scale-105"
                  } transition`}
                >
                  {isRegistering ? "Creating..." : "Create Account"}
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-950 underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
