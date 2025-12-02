// src/L2/SideMenu.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type SideMenuProps = {
  mode?: "desktop" | "mobile";
  onOpenReport?: () => void;
  onOpenContact?: () => void;
};

function SideMenu({
  mode = "desktop",
  onOpenReport,
  onOpenContact,
}: SideMenuProps) {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [open, setOpen] = useState(false);

  const SectionTitle = ({ children }: { children: string }) => (
    <h2 className="text-2xl title text-emerald-950  mb-2">{children}</h2>
  );

  const MenuButton = ({
    label,
    onClick,
    disabled,
    badge,
  }: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    badge?: string | number;
  }) => (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`relative w-full py-2 px-4 font-freckle text-lg transition-transform duration-200 border-2 ${
        disabled
          ? "border-gray-700 bg-emerald-950 text-emerald-50 cursor-not-allowed shadow-none"
          : "border-emerald-950  bg-emerald-50/60  text-emerald-950  hover:scale-105 hover:shadow-[4px_4px_0_0_#064e3b]"
      }`}
    >
      {label}
      {badge && (
        <span className="absolute -top-1 -right-1 bg-emerald-50 text-emerald-950 text-xs px-2 py-0.5 rounded-full shadow-sm border-emerald-950 border-2">
          {badge}
        </span>
      )}
    </button>
  );

  // Menu sections
  const MenuContent = (
    <div className="w-full h-full bg-emerald-50 border-emerald-950  flex flex-col gap-4 p-6 overflow-y-auto">
      {/* Library */}
      <SectionTitle>Your Library</SectionTitle>
      <MenuButton
        label="Watchlist"
        onClick={() => {
          navigate("/watchlist");
          setOpen(false);
        }}
        badge={userInfo?.watchlist_count || "0"}
      />
      <MenuButton
        label="Watch history"
        onClick={() => {
          navigate("/history");
          setOpen(false);
        }}
      />
      <MenuButton
        label="Playlists"
        onClick={() => {
          navigate("/playlists");
          setOpen(false);
        }}
      />
      <MenuButton
        label="Subscriptions"
        onClick={() => {
          navigate("/subs");
          setOpen(false);
        }}
      />
      {/* Explore */}
      <SectionTitle>Explore</SectionTitle>
      <MenuButton
        label="Film map"
        onClick={() => {
          navigate("/globe");
          setOpen(false);
        }}
      />
      <MenuButton
        label="Genres"
        onClick={() => {
          navigate("/genres");
        }}
      />
      <MenuButton
        label="Surprise me"
        onClick={() => {
          navigate("/random");
          setOpen(false);
        }}
      />

      {/* Community */}
      <SectionTitle>Community</SectionTitle>
      <MenuButton
        disabled
        badge="Soon!"
        label="Challenges"
        onClick={() => {
          navigate("/challenges");
          setOpen(false);
        }}
      />
      <MenuButton label="Clubs" badge="Soon!" disabled />

      {/* Help */}
      <SectionTitle>Help</SectionTitle>
      <MenuButton label="Technical Report" onClick={onOpenReport} />
      <MenuButton label="Contact Us" onClick={onOpenContact} />
    </div>
  );

  // Desktop
  if (mode === "desktop") return <>{MenuContent}</>;

  // Mobile
  return (
    <>
      {!open && (
        <button
          className="
            fixed bottom-6 left-6 z-50 
            py-2 px-5 
            font-freckle text-lg 
            border-2 border-emerald-950 
            bg-emerald-50/70  
            text-emerald-950
            rounded-full shadow-md
            backdrop-blur-sm
            hover:scale-105 hover:shadow-[3px_3px_0_0_#064e3b]
            active:scale-95
            transition-all duration-200
          "
          onClick={() => setOpen(true)}
        >
          Browse
        </button>
      )}

      {/* 🔹 Always-mounted mobile drawer */}
      <div
        className={`fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 ease-in-out
    ${open ? "opacity-100 visible" : "opacity-0 pointer-events-none"}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false); // close on outside click
        }}
      >
        <div
          className={`absolute top-0 left-0 h-full w-64 bg-emerald-50  
      border-r-2 border-emerald-950 shadow-2xl transform transition-transform duration-300 ease-in-out
      ${open ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {MenuContent}

          <button
            className="absolute top-2 right-2 text-emerald-950 "
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}

export default SideMenu;
