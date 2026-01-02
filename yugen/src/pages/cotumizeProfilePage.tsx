import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useEditProfile } from "../features/profile/hooks/useEditProfile";
import { FaYoutube, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useToast } from "../components/toaster";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
type Stage = "welcome" | "role" | "filmmaker" | "audience" | "socials" | "done";

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
  const toast = useToast();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("welcome");
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username") || "";
  const { getAccessToken } = useAuth();
  const [userType, setUserType] = useState("audience");
  const { userInfo } = useAuth();
  const handleGoHome = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      // Call backend to mark first login complete
      await api.post(
        "tools/complete-first-login",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Navigate to home
      navigate("/");
    } catch (err) {
      console.error("Failed to complete first login:", err);
      // Optionally still navigate to home even if request fails
      navigate("/");
    }
  };
  const { handleUpdateSocials, loading, handleAddUserType } = useEditProfile(
    () => setStage("done")
  );

  const [socials, setSocials] = useState<{ platform: string; url: string }[]>(
    []
  );
  const [socialInput, setSocialInput] = useState("");

  // Add socials
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

  // Remove socials
  const handleRemoveSocial = (platform: string) => {
    setSocials(socials.filter((s) => s.platform !== platform));
  };

  // Save socials
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

  // ---------------- RENDER ----------------

  return (
    <div className="min-h-screen flex items-center justify-center  text-emerald-950 font-freckle p-6">
      {/* Persistent Logo */}
      <div className="fixed top-0 left-4 z-50 flex items-center gap-2">
        <img
          src="https://iqvsgbsnpqvbddmdixoz.supabase.co/storage/v1/object/public/assets/Kickflip!.gif"
          alt="Yugen Logo"
          className="w-20 h-20 object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="w-full max-w-3xl bg-emerald-50 border-4 border-emerald-950 rounded-3xl shadow-2xl p-6">
        {/* ---------------------------------- */}
        {/* WELCOME SCREEN */}
        {/* ---------------------------------- */}
        {stage === "welcome" && (
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Welcome to Yūgen</h1>
            <p className="opacity-80">
              Almost there! Just answer a few questions to improve your
              experience.
            </p>

            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={async () => {
                  setStage("done");
                  await handleAddUserType(userType);
                }}
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

        {/* ---------------------------------- */}
        {/* ROLE */}
        {/* ---------------------------------- */}
        {stage === "role" && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold">What are you here for?</h2>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => {
                  setStage("filmmaker");
                  setUserType("filmmaker");
                }}
                className="px-5 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                Filmmaking
              </button>

              <button
                onClick={() => {
                  setStage("audience");
                  setUserType("audience");
                }}
                className="px-5 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                Watching Films
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------- */}
        {/* FILMMAKER */}
        {/* ---------------------------------- */}
        {stage === "filmmaker" && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold">
              What type of filmmaker are you?
            </h2>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => setStage("socials")}
                className="px-4 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                Professional
              </button>

              <button
                onClick={async () => {
                  await handleAddUserType(userType);

                  setStage("done");
                }}
                className="px-4 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                Just Started
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------- */}
        {/* AUDIENCE */}
        {/* ---------------------------------- */}
        {stage === "audience" && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold">
              What type of audience are you?
            </h2>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={async () => {
                  await handleAddUserType(userType);
                  setStage("done");
                }}
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

        {/* ---------------------------------- */}
        {/* SOCIALS */}
        {/* ---------------------------------- */}
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
                onClick={async () => {
                  setStage("done");
                  await handleAddUserType(userType);
                }}
                className="px-4 py-2 border border-emerald-950 rounded-md hover:bg-emerald-100 transition"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------- */}
        {/* DONE */}
        {/* ---------------------------------- */}
        {stage === "done" && (
          <div className="flex items-center justify-center max-h-[20vh]">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold">Welcome to Yūgen</h1>

              <p className="opacity-80">
                You are all set! Check your email for verification and start
                exploring.
              </p>

              <button
                onClick={handleGoHome}
                className="px-5 py-2 bg-emerald-950 text-emerald-50 rounded-lg shadow hover:scale-105 transition mt-4"
              >
                Go to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCustomization;
