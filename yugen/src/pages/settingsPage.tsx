// src/pages/SettingsPage.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditProfile from "../features/profile/components/EditProfile copy";
import AppLayout from "../layouts/layout-main";
import universitiesData from "../data/world_universities_and_domains.json";
import LockIcon from "@mui/icons-material/Lock";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import SchoolIcon from "@mui/icons-material/School";
import CheckIcon from "@mui/icons-material/Check";
import { useAcademic } from "../features/academic/hooks/useAcademicAplication";
const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState("profile");
  const tabGroups = [
    {
      groupLabel: "Account",
      tabs: [{ key: "profile", label: "Edit profile", icon: <SchoolIcon /> }],
    },
    {
      groupLabel: "Security",
      tabs: [{ key: "password", label: "Change Password", icon: <LockIcon /> }],
    },
  ];

  // Academic linking
  const {
    academicEmail,
    universityName,
    uniID,
    role,
    verificationFile,
    existingApplication,
    step,
    setAcademicEmail,
    setRole,
    setUniID,
    setVerificationFile,
    setStep,
    handleAcademicSubmit,
    handleAcademicSubmitFinal,
    handleRemoveApplication,
  } = useAcademic();

  // Password reset
  const [isDone, setIsDone] = useState(false);
  const [email, setEmail] = useState("");

  const handleChangePasswordEmail = async () => {
    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
      return toast.warn("Valid email required");

    setIsDone(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/#/resetPassword",
    });
    toast.info("Reset password email sent");
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "password":
        return (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            {isDone ? (
              <>
                <CheckIcon
                  className="text-emerald-950 dark:text-emerald-50"
                  style={{ fontSize: 80 }}
                />
                <p className="font-freckle text-xl text-emerald-950 dark:text-emerald-50">
                  You’ll receive an email to reset your password.
                </p>
                <button
                  className="px-4 py-2 rounded-lg bg-emerald-950 text-emerald-50 
                             dark:bg-emerald-50 dark:text-emerald-950"
                  onClick={() => {
                    setIsDone(false);
                    setEmail("");
                  }}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <VpnKeyIcon
                  className="text-emerald-950 dark:text-emerald-50"
                  style={{ fontSize: 80 }}
                />
                <p className="font-freckle text-lg text-emerald-950 dark:text-emerald-50">
                  Confirm your email to reset your password.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-lg border border-emerald-950 dark:border-emerald-50 
                             bg-transparent text-emerald-950 dark:text-emerald-50 px-3 py-2 focus:outline-none 
                             focus:ring-2 focus:ring-emerald-950/60 dark:focus:ring-emerald-50/60"
                />
                <button
                  className="px-4 py-2 rounded-lg bg-emerald-950 text-emerald-50 
                             dark:bg-emerald-50 dark:text-emerald-950"
                  onClick={handleChangePasswordEmail}
                >
                  Finish
                </button>
              </>
            )}
          </div>
        );

      case "profile":
        return (
          <div className="flex flex-col gap-6 p-4 text-emerald-950 dark:text-emerald-50 transition-all duration-300">
            <EditProfile />
          </div>
        );

      case "theme":
        return (
          <div className="flex flex-col items-center justify-center gap-6 p-6">
            <h2 className="font-freckle text-xl text-emerald-950 dark:text-emerald-50">
              Appearance
            </h2>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-lg bg-emerald-950 text-emerald-50 
                         dark:bg-emerald-50 dark:text-emerald-950 shadow-md
                         hover:shadow-lg hover:scale-105 transition"
            >
              {theme === "light" ? "☀︎ Light" : "☽ Dark"}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="h-full flex flex-col font-freckle text-emerald-950 dark:text-emerald-50">
        <ToastContainer />
        <h2 className="text-3xl font-bold border-b-4 border-emerald-950 mb-6 pb-2">
          Settings
        </h2>

        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-[200px] flex-shrink-0 border-r-2 border-emerald-950/30 pr-2">
            {tabGroups.map((group, idx) => (
              <div key={group.groupLabel} className="mb-3">
                <p className="text-sm mb-1 opacity-70">{group.groupLabel}</p>
                {group.tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key)}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg mb-1 transition
                      ${
                        selectedTab === tab.key
                          ? "bg-emerald-950 text-emerald-50 dark:bg-emerald-50 dark:text-emerald-950"
                          : "hover:bg-emerald-900/20 dark:hover:bg-emerald-50/20"
                      }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
                {idx < tabGroups.length - 1 && (
                  <hr className="my-2 border-emerald-950/20 dark:border-emerald-50/20" />
                )}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">{renderContent()}</div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
