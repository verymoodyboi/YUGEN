import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useEditProfile } from "../features/profile/hooks/useEditProfile";
import { FaYoutube, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useToast } from "../components/toaster";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

type Stage = "welcome" | "step2" | "socials" | "student" | "done";

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
  const { getAccessToken, userInfo } = useAuth();

  // Default userType
  const [userType, setUserType] = useState("filmmaker");

  const { handleUpdateSocials, loading, handleAddUserType } = useEditProfile(
    () => setStage("done"),
  );

  const [socials, setSocials] = useState<{ platform: string; url: string }[]>(
    [],
  );
  const [socialInput, setSocialInput] = useState("");
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");

  useEffect(() => {
    // Load universities JSON
    fetch("/world_universities_and_domains.json")
      .then((res) => res.json())
      .then((data) => setUniversities(data))
      .catch((err) => console.error("Failed to load universities:", err));
  }, []);

  const handleGoHome = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      await api.post(
        "tools/complete-first-login",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      navigate("/");
    } catch (err) {
      console.error("Failed to complete first login:", err);
      navigate("/");
    }
  };

  // ---------------- SOCIALS ----------------
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

  const handleSaveUniversity = async () => {
    if (!selectedUniversity) {
      toast.error("Please select your university");
      return;
    }
    // Save userType and selected university
    await handleAddUserType("student");
    setStage("done");
  };

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen flex items-center justify-center text-emerald-950 font-freckle p-6">
      <div className="fixed top-0 left-4 z-50 flex items-center gap-2">
        <img
          src="https://assets.try-yugen.com/yugen_logo_dark.svg"
          alt="Yugen Logo"
          className="w-20 h-20 object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="w-full max-w-3xl bg-emerald-50 border-4 border-emerald-950 rounded-3xl shadow-2xl p-6">
        {/* ---------------------------------- */}
        {/* WELCOME */}
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
                  await handleAddUserType("filmmaker");
                  setStage("step2");
                }}
                className="px-5 py-2 bg-emerald-950 text-emerald-50 rounded-lg shadow hover:scale-105 transition"
              >
                Let’s go
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------- */}
        {/* STEP 2 */}
        {stage === "step2" && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold">Choose your path</h2>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={async () => {
                  await handleAddUserType("audience");
                  setStage("done");
                }}
                className="px-4 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                Just here to watch
              </button>

              <button
                onClick={() => setStage("student")}
                className="px-4 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                Student
              </button>

              <button
                onClick={async () => {
                  await handleAddUserType("filmmaker");
                  setStage("done");
                }}
                className="px-4 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                I know what I’m doing
              </button>

              <button
                onClick={() => setStage("socials")}
                className="px-4 py-6 border-2 border-emerald-950 rounded-xl hover:bg-emerald-100 transition"
              >
                Professional
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------- */}
        {/* STUDENT */}
        {stage === "student" && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold">Select your university</h2>

            <div className="relative w-full">
              <input
                type="text"
                placeholder="Type to search your university..."
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="w-full rounded-lg border-2 border-emerald-950 p-2"
              />

              {selectedUniversity && (
                <ul className="absolute z-10 w-full max-h-48 overflow-y-auto bg-emerald-50 border-2 border-emerald-950 rounded-b-lg mt-1">
                  {universities
                    .map((u) => {
                      const search = selectedUniversity.toLowerCase();
                      const name = u.name.toLowerCase();
                      const domainMatch = u.domains?.some((d: string) =>
                        d.toLowerCase().includes(search),
                      );
                      let rank = -1;
                      if (name === search) rank = 0;
                      else if (name.includes(search)) rank = 1;
                      else if (domainMatch) rank = 2;
                      return { ...u, rank };
                    })
                    .filter((u) => u.rank >= 0)
                    .sort((a, b) => a.rank - b.rank)
                    .slice(0, 10)
                    .map((u) => (
                      <li
                        key={u.name}
                        className="px-3 py-2 hover:bg-emerald-100 cursor-pointer"
                        onClick={() => setSelectedUniversity(u.name)}
                      >
                        {u.name} ({u.country})
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="flex gap-3 mt-15 justify-center">
              <button
                onClick={async () => {
                  if (!selectedUniversity) {
                    toast.error("Please select your university");
                    return;
                  }

                  try {
                    const token = await getAccessToken();
                    if (!token) return;

                    await api.post(
                      "profile/addSchool",
                      { school: selectedUniversity },
                      { headers: { Authorization: `Bearer ${token}` } },
                    );

                    await handleAddUserType("student");
                    setStage("done");
                  } catch (err) {
                    console.error("Failed to add school:", err);
                    toast.error("Failed to save your university");
                  }
                }}
                className="px-4 py-2 bg-emerald-950 text-emerald-50 rounded-md shadow hover:scale-105 transition"
              >
                Save & Continue
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

        {/* ---------------------------------- */}
        {/* SOCIALS */}
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
                  await handleAddUserType("filmmaker");
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
        {stage === "done" && (
          <div className="flex items-center justify-center ">
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
