import "../App.css";
import { useState, useEffect, useRef } from "react";
import supabase from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import PhotoCameraFrontIcon from "@mui/icons-material/PhotoCameraFront";
import SettingsIcon from "@mui/icons-material/Settings";
import upload_button_static from "../YugenAssits/upload-button/upload_button.png";
import upload_button_gif from "../YugenAssits/upload-button/upload_button.gif";
import { Tooltip } from "@mui/material";
import tempPFP from "../YugenAssits/Avatar_Placeholder.png";
import { createPortal } from "react-dom";
import AuthActionGuard from "./clickWrapper";

function AccHub() {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const img = new Image();
    img.src = upload_button_gif;
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const logOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate("/about");
  };

  const PFPurl = userInfo?.pfp_path
    ? `https://pfps.try-yugen.com/${userInfo.pfp_path}?t=${Date.now()}`
    : tempPFP;
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
    <div className="absolute top-2 right-5 flex items-center justify-between h-[60px] w-35 rounded-full border-3 border-solid border-emerald-950/100 bg-emerald-50  backdrop-blur-md p-2 gap-0.5">
      <Tooltip title="Upload">
        <AuthActionGuard>
          <img
            src={isHover ? upload_button_gif : upload_button_static}
            onClick={() => navigate("/UploadFilmPage")}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className="h-[60px] w-auto cursor-pointer rounded-lg transition-transform duration-300 ease-in-out "
            alt="upload_button"
          />
        </AuthActionGuard>
      </Tooltip>
      <img
        src={PFPurl}
        onError={(e) => {
          const img = e.currentTarget;
          if (img.src !== tempPFP) {
            img.src = tempPFP;
          }
        }}
        alt="avatar"
        onClick={toggleMenu}
        className="h-[50px] w-auto rounded-full cursor-pointer border-2 border-emerald-950  transition-transform duration-300 ease-in-out hover:scale-105"
      />

      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed top-16 right-5 z-[999999] bg-emerald-50 border border-emerald-950 rounded-xl shadow-lg w-40 py-2 flex flex-col"
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
            </button>{" "}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default AccHub;
