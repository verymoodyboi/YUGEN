import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignupGoogle } from "../hooks/useSignUpGoogle";
import { ImageCropper } from "../../../util/image-cropping/components/image-cropper";
import countries from "../../../Data/countries.json";

const SignupGoogle: React.FC = () => {
  // Simulated Google user — replace with your real Google OAuth data
  const googleUser = {
    email: "user@gmail.com",
    name: "Jane Doe",
  };

  const signup = useSignupGoogle(googleUser);

  const {
    steps,
    activeStep,
    handleNext,
    handleBack,
    fname,
    lname,
    region,
    gender,
    bday,
    username,
    bio,
    setFname,
    setLname,
    setRawPreview, // ✅ Add this line

    setRegion,
    setGender,
    setBday,
    setUsername,
    setBio,
    rawPreview,
    croppedFile,
    handleFileChange,
    confirmCrop,
    fileInputRef,
    isRegistering,
    handleSubmit,
    email,
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
           ${active ? "bg-gradient-to-br from-emerald-950 to-emerald-800 text-emerald-50 shadow-xl" : ""}
           ${completed && !active ? "bg-emerald-950 text-emerald-50" : ""}
           ${!active && !completed ? "bg-emerald-50 text-emerald-950 border-2 border-emerald-950" : ""}`}
      >
        {i + 1}
      </div>
      <div
        className={`${active ? "text-emerald-950 font-semibold" : "text-emerald-950/80"}`}
      >
        {label}
      </div>
    </div>
  );
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 text-emerald-950 font-freckle p-6">
      <div className="fixed top-0 left-4 z-50 flex items-center gap-2">
        <img
          src="https://iqvsgbsnpqvbddmdixoz.supabase.co/storage/v1/object/public/assets/Kickflip!.gif"
          alt="Yugen Logo"
          className="w-20 h-20 object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="w-full max-w-3xl bg-emerald-50 border-4 border-emerald-950 rounded-3xl shadow-2xl p-6 h-[600px] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl title font-bold">
            Finish setting up your account
          </h1>
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
            e.preventDefault(); // ← this stops the browser from reloading
            handleSubmit();
          }}
          className="space-y-6"
        >
          {activeStep === 0 && (
            <div>
              <label className="block mb-1">First Name</label>
              <input
                value={fname}
                onChange={(e) => setFname(e.target.value)}
                className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
              />
              <label className="block mt-4 mb-1">Last Name</label>
              <input
                value={lname}
                onChange={(e) => setLname(e.target.value)}
                className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
              />
            </div>
          )}

          {activeStep === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-lg border-2 border-emerald-950 px-3 py-2 bg-emerald-50"
                >
                  <option value="">Select country...</option>
                  {countries.map((c: any) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
                >
                  <option value="">Select gender...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block mb-1">Birth Date</label>
                <input
                  type="date"
                  value={bday}
                  onChange={(e) => setBday(e.target.value)}
                  className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
                />
                <p className="text-xs mt-1 opacity-70">
                  You must be 13+ to register
                </p>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
                  placeholder="your_handle"
                />
              </div>

              <div>
                <label className="block mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
                  placeholder="Tell people about you (min 10 chars)"
                />
              </div>

              <div>
                <label className="block mb-1">Profile picture (circle)</label>
                <div className="p-3 border-2 border-dashed border-emerald-950 rounded-lg bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="pfp"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-emerald-950 hover:bg-emerald-100 transition cursor-pointer"
                    >
                      Upload PFP
                      <input
                        id="pfp"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>

                    {croppedFile && (
                      <div className="ml-auto">
                        <img
                          src={URL.createObjectURL(croppedFile)}
                          alt="pfp"
                          className="w-20 h-20 rounded-full border-2 border-emerald-950 object-cover shadow"
                        />
                      </div>
                    )}
                  </div>

                  {rawPreview && (
                    <div className="mt-4">
                      <ImageCropper
                        src={rawPreview}
                        onCropConfirm={confirmCrop}
                        onCancel={() => setRawPreview(null)}
                      />
                    </div>
                  )}
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
                  {isRegistering ? "Creating..." : "Finish Signup"}
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/LoginPage" className="text-emerald-950 underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupGoogle;
