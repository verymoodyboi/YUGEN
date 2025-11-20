import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEditProfile } from "../features/profile/hooks/useEditProfile";
// import { useAcademic } from "../features/academic/hooks/useAcademicAplication";

// Icons
import { FaYoutube, FaInstagram, FaLinkedin } from "react-icons/fa";

type Stage =
  | "welcome"
  | "role"
  | "filmmaker"
  | "audience"
  // | "studentForm"
  | "socials"
  | "done";

const detectPlatform = (url: string) => {
  if (/youtube\.com|youtu\.be/.test(url)) return "YouTube";
  if (/instagram\.com/.test(url)) return "Instagram";
  if (/linkedin\.com/.test(url)) return "LinkedIn";
  return "Other";
};

const platformIcons: Record<string, JSX.Element> = {
  YouTube: <FaYoutube className="text-red-600" />,
  Instagram: <FaInstagram className="text-pink-600" />,
  LinkedIn: <FaLinkedin className="text-blue-600" />,
};

const ProfileCustomization: React.FC = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("welcome");
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username") || "";

  // const {
  //   academicEmail,
  //   universityName,
  //   uniID,
  //   role,
  //   verificationFile,
  //   setAcademicEmail,
  //   setUniversityName,
  //   setUniID,
  //   setRole,
  //   setVerificationFile,
  //   handleAcademicSubmit,
  //   handleAcademicSubmitFinal,
  // } = useAcademic();
  // const submitAcadmic = async () => {
  //   if (!academicEmail || !role || !universityName || !uniID) {
  //     toast.error("Please fill all fields");
  //     return;
  //   }

  //   try {
  //     await handleAcademicSubmitFinal(); // submit via hook
  //     toast.success("Academic verification submitted!");
  //     setStage("done"); // ✅ automatically go to done
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to submit academic info");
  //   }
  // };
  // Socials
  const { handleUpdateSocials, loading } = useEditProfile(() =>
    setStage("done")
  );
  const [socials, setSocials] = useState<{ platform: string; url: string }[]>(
    []
  );
  const [socialInput, setSocialInput] = useState("");

  // === Social link handlers ===
  const handleAddSocial = () => {
    const url = socialInput.trim();
    if (!url) return;
    const platform = detectPlatform(url);
    if (platform === "Other") {
      toast.error("Only YouTube, Instagram, and LinkedIn are supported.");
      return;
    }
    const filtered = socials.filter((s) => s.platform !== platform);
    setSocials([...filtered, { platform, url }]);
    setSocialInput("");
  };

  const handleRemoveSocial = (platform: string) => {
    setSocials(socials.filter((s) => s.platform !== platform));
  };

  const handleSaveSocials = async () => {
    if (socials.length === 0) {
      toast.error("Add at least one social link");
      return;
    }

    const socialsData = {
      Insta: socials.find((s) => s.platform === "Instagram")?.url || "",
      YT: socials.find((s) => s.platform === "YouTube")?.url || "",
      LI: socials.find((s) => s.platform === "LinkedIn")?.url || "",
    };

    await handleUpdateSocials(socialsData);
    setStage("done");
  };

  // === Render ===
  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 text-emerald-950 font-freckle p-6">
      <ToastContainer position="top-left" />
      <div className="w-full max-w-2xl bg-emerald-50 border-4 border-emerald-950 rounded-3xl shadow-2xl p-6">
        {/* Welcome */}
        {stage === "welcome" && (
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Welcome to Yūgen</h1>
            <p className="opacity-80">
              Almost there! Just answer a few questions to improve your
              experience.
            </p>
            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={() => setStage("done")}
                className="px-5 py-2 border border-emerald-950 rounded-md hover:bg-emerald-100 transition"
              >
                Skip
              </button>
              <button
                onClick={() => setStage("role")}
                className="px-5 py-2 bg-emerald-950 text-emerald-50 rounded-lg shadow hover:scale-105 transition"
              >
                Let’s go
              </button>
            </div>
          </div>
        )}

        {/* Role */}
        {stage === "role" && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold">What are you here for?</h2>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => setStage("filmmaker")}
                className="px-5 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                Filmmaking
              </button>
              <button
                onClick={() => setStage("audience")}
                className="px-5 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                Watching Films
              </button>
            </div>
          </div>
        )}

        {/* Filmmaker */}
        {stage === "filmmaker" && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold">
              What type of filmmaker are you?
            </h2>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* <button
                onClick={() => setStage("studentForm")}
                className="px-4 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                Student
              </button> */}
              <button
                onClick={() => setStage("socials")}
                className="px-4 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                Professional
              </button>
              <button
                onClick={() => setStage("done")}
                className="px-4 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                Just Started
              </button>
            </div>
          </div>
        )}

        {/* Audience */}
        {stage === "audience" && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold">
              What type of audience are you?
            </h2>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => setStage("done")}
                className="px-5 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                Film Lover
              </button>
              <button
                onClick={() => setStage("socials")}
                className="px-5 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                Critic
              </button>
            </div>
          </div>
        )}

        {/* Student Form (academic section) */}
        {/* {stage === "studentForm" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-3">
              Academic Verification
            </h2>
            <input
              type="email"
              placeholder="Academic Email"
              value={academicEmail}
              onChange={(e) => setAcademicEmail(e.target.value)}
              className="w-full rounded-lg border-2 border-emerald-950 px-3 py-2 bg-emerald-50"
            />
            <button
              onClick={handleAcademicSubmit}
              className="mt-2 px-4 py-2 bg-emerald-950 text-emerald-50 rounded-md shadow hover:scale-105 transition"
            >
              Detect University
            </button>

            {universityName && (
              <div className="mt-4 space-y-3">
                <p className="font-semibold">Detected: {universityName}</p>
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "student" | "teacher" | "")
                  }
                  className="w-full rounded-lg border-2 border-emerald-950 px-3 py-2 bg-emerald-50"
                >
                  <option value="">Select role...</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
                <input
                  type="text"
                  placeholder="University ID"
                  value={uniID}
                  onChange={(e) => setUniID(e.target.value)}
                  className="w-full rounded-lg border-2 border-emerald-950 px-3 py-2 bg-emerald-50"
                />
                <label className="block w-full cursor-pointer">
                  <span className="block text-sm font-medium mb-1">
                    Upload Verification File
                  </span>
                  <div className="flex items-center justify-between border-2 border-emerald-950 rounded-lg px-3 py-2 bg-emerald-50 hover:bg-emerald-100 transition shadow-sm">
                    <span className="text-sm opacity-70 truncate">
                      {verificationFile
                        ? verificationFile.name
                        : "Choose a file..."}
                    </span>
                    <span className="px-3 py-1 bg-emerald-950 text-emerald-50 rounded-md text-sm shadow">
                      Browse
                    </span>
                  </div>
                  <input
                    type="file"
                    onChange={(e) =>
                      setVerificationFile(e.target.files?.[0] ?? null)
                    }
                    className="hidden"
                  />
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={submitAcadmic}
                    className="mt-3 px-4 py-2 bg-emerald-950 text-emerald-50 rounded-md shadow hover:scale-105 transition"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setStage("done")}
                    className="mt-3 px-4 py-2 border border-emerald-950 rounded-md hover:bg-emerald-100 transition"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
          </div>
        )} */}

        {/* Socials */}
        {stage === "socials" && (
          <div>
            <h2 className="text-2xl font-semibold mb-3">Add your socials</h2>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste link (YouTube, Instagram, LinkedIn)"
                value={socialInput}
                onChange={(e) => setSocialInput(e.target.value)}
                className="flex-1 rounded-lg border-2 border-emerald-950 px-3 py-2 bg-emerald-50"
              />
              <button
                onClick={handleAddSocial}
                className="px-4 py-2 bg-emerald-950 text-emerald-50 rounded-md shadow hover:scale-105 transition"
              >
                Add
              </button>
            </div>
            <p className="text-xs opacity-70 mt-2">
              Allowed platforms: YouTube, Instagram, LinkedIn
            </p>
            <ul className="mt-4 space-y-2">
              {socials.map((s) => (
                <li
                  key={s.platform}
                  className="flex justify-between items-center border-b border-emerald-200 pb-1"
                >
                  <div className="flex items-center gap-2">
                    {platformIcons[s.platform]}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {s.url}
                    </a>
                  </div>
                  <button
                    onClick={() => handleRemoveSocial(s.platform)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveSocials}
                disabled={loading}
                className="px-4 py-2 bg-emerald-950 text-emerald-50 rounded-md shadow hover:scale-105 transition"
              >
                {loading ? "Saving..." : "Save & Continue"}
              </button>
              <button
                onClick={() => setStage("done")}
                className="px-4 py-2 border border-emerald-950 rounded-md hover:bg-emerald-100 transition"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {stage === "done" && (
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Welcome to Yūgen</h1>
            <p className="opacity-80">
              You are all set! Check your email for verification and start
              exploring.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2 bg-emerald-950 text-emerald-50 rounded-lg shadow hover:scale-105 transition mt-4"
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCustomization;
