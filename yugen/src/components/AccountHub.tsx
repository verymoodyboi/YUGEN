// src/L2/AccountHub.tsx
import "../App.css";
import { useState, useEffect, useRef, use } from "react";
import supabase from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import PhotoCameraFrontIcon from "@mui/icons-material/PhotoCameraFront";
import SettingsIcon from "@mui/icons-material/Settings";
import upload_button from "../YugenAssits/upload-button/Upload button modified REPEAT.gif";
import { useToast } from "./toaster";
import upload_button_static from "../YugenAssits/upload-button/Regular.png";
import upload_button_gif from "../YugenAssits/upload-button/Upload button modified REPEAT.gif";
import { Tooltip } from "@mui/material";
function AccHub() {
  const toast = useToast();
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const img = new Image();
    img.src = upload_button_gif;
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [email, setEmail] = useState("");

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const logOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate("/about");
  };

  const handleChangePasswordEmail = async () => {
    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return toast.warn("Valid email required");
    }
    setIsDone(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/#/resetPassword",
    });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [isHover, setIsHover] = useState(false);

  return (
    <div className="absolute top-2 right-5 flex items-center justify-between z-10 h-[60px] w-35 rounded-full border-3 border-solid border-emerald-950/100 bg-emerald-50  backdrop-blur-md p-2 gap-0.5">
      {/* Profile video */}
      <Tooltip title="Upload">
        <img
          src={isHover ? upload_button_gif : upload_button_static}
          onClick={() => navigate("/UploadFilmPage")}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          className="h-[60px] w-auto cursor-pointer rounded-lg transition-transform duration-300 ease-in-out "
          alt="upload_button"
        />
      </Tooltip>
      {/* Avatar */}
      <img
        src={
          userInfo?.pfp_path
            ? supabase.storage.from("pfps").getPublicUrl(userInfo.pfp_path).data
                .publicUrl + `?v=${Date.now()}`
            : undefined
        }
        alt="avatar"
        onClick={toggleMenu}
        className="h-[50px] w-auto rounded-full cursor-pointer border-2 border-emerald-950  transition-transform duration-300 ease-in-out hover:scale-105"
      />
      {/* Dropdown Menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute top-12 right-0 bg-emerald-50 border border-emerald-950  rounded-xl shadow-lg w-40 py-2 flex flex-col"
        >
          <button
            className="flex items-center gap-2 px-4 py-2 text-emerald-950  hover:bg-emerald-100  rounded-lg"
            onClick={() => {
              navigate("/profile");
              setMenuOpen(false);
            }}
          >
            <PhotoCameraFrontIcon fontSize="small" />
            Profile
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 text-emerald-950  hover:bg-emerald-100 rounded-lg"
            onClick={() => {
              navigate("/settings");
              setMenuOpen(false);
            }}
          >
            <SettingsIcon fontSize="small" />
            Settings
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 text-emerald-950  hover:bg-emerald-100 rounded-lg"
            onClick={() => {
              setMenuOpen(false);
              logOut();
            }}
          >
            <LogoutIcon fontSize="small" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default AccHub;
