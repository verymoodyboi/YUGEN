import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import watchlist_icon from "../YugenAssits/menu_icons/Watchlist.svg";
import history_icon from "../YugenAssits/menu_icons/History menu.svg";
import playlist_icon from "../YugenAssits/menu_icons/Playlist.svg";
import subscribtions_icon from "../YugenAssits/menu_icons/Subscriptions.svg";
import map_icon from "../YugenAssits/menu_icons/Filmmap.svg";
import genres_icon from "../YugenAssits/menu_icons/Genres.svg";
import surprise_icon from "../YugenAssits/menu_icons/Random.svg";
import report_icon from "../YugenAssits/menu_icons/Report.svg";
import contact_icon from "../YugenAssits/menu_icons/Contact.svg";
import send_icon from "../YugenAssits/menu_icons/send_temp.png";

import AuthActionGuard from "./clickWrapper";
import { Send } from "lucide-react";
import { send } from "process";
type SideMenuProps = {
  mode?: "desktop" | "mobile";
  onOpenReport?: () => void;
  onOpenContact?: () => void;
};

interface NavLink {
  title: string;
  path: string;
}

function SideMenu({
  mode = "desktop",
  onOpenReport,
  onOpenContact,
}: SideMenuProps) {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [open, setOpen] = useState(false);

  const SectionTitle = ({ children }: { children: string }) => (
    <h2 className="text-2xl title text-emerald-50  mb-2">{children}</h2>
  );
  const navigationLinks: NavLink[] = [
    { title: "About", path: "/about" },
    { title: "Privacy Policy", path: "/yugen-privacy-policy.html" },
    { title: "Terms of Service", path: "/yugen-terms.html" },
  ];
  const MenuButton = ({
    label,
    onClick,
    disabled,
    badge,
    icon,
  }: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    badge?: string | number;
    icon?: string;
  }) => (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`relative w-full py-2 px-4 font-freckle text-lg flex items-center gap-3
      transition-transform duration-200 border-2 ${
        disabled
          ? "border-white/30 bg-emerald-950 text-emerald-50 cursor-not-allowed shadow-none"
          : "border-emerald-50 bg-emerald-950 text-emerald-50 hover:scale-105 hover:shadow-[4px_4px_0_0_#ecfdf5]"
      }`}
    >
      {icon && <img src={icon} alt="" className="w-6 h-6 opacity-90" />}

      {label}

      {badge && (
        <span className="absolute -top-2 -right-2 bg-emerald-50 text-emerald-950 text-xs px-2 py-0.5 rounded-full shadow-sm border-emerald-950 border-2">
          {badge}
        </span>
      )}
    </button>
  );

  const MenuContent = (
    <div className="no-scrollbar w-full h-full bg-emerald-950 border-emerald-950  flex flex-col gap-4 p-6 overflow-y-auto ">
      <SectionTitle>Your Library</SectionTitle>
      <MenuButton
        label="Watchlist"
        icon={watchlist_icon}
        onClick={() => {
          navigate("/watchlist");
          setOpen(false);
        }}
        badge={userInfo?.watchlist_count || "0"}
      />

      <MenuButton
        label="history"
        icon={history_icon}
        onClick={() => {
          navigate("/history");
          setOpen(false);
        }}
      />

      <MenuButton
        label="Playlists"
        icon={playlist_icon}
        onClick={() => {
          navigate("/playlists");
          setOpen(false);
        }}
      />

      <MenuButton
        label="Subscriptions"
        icon={subscribtions_icon}
        onClick={() => {
          navigate("/subs");
          setOpen(false);
        }}
      />
      <SectionTitle>Community</SectionTitle>
      <MenuButton
        label="Yūgen map"
        icon={map_icon}
        onClick={() => {
          navigate("/globe");
          setOpen(false);
        }}
      />
      <MenuButton
        label="Pokes"
        icon={send_icon}
        onClick={() => {
          navigate("/Pokes");
          setOpen(false);
        }}
      />
      <SectionTitle>Explore</SectionTitle>

      <MenuButton
        label="Surprise me"
        icon={surprise_icon}
        onClick={() => {
          navigate("/random");
          setOpen(false);
        }}
      />
      <MenuButton
        label="Genres"
        icon={genres_icon}
        onClick={() => {
          navigate("/genres");
        }}
      />

      <SectionTitle>Help</SectionTitle>

      <MenuButton
        label="Contact Us"
        icon={contact_icon}
        onClick={onOpenContact}
      />
      <AuthActionGuard>
        <MenuButton label="Support" icon={report_icon} onClick={onOpenReport} />
      </AuthActionGuard>
      <nav className="flex flex-col space-y-3 flex-1 md:items-center">
        <h3 className="text-emerald-50 title text-md">More</h3>
        {navigationLinks.map((link) => (
          <a
            key={link.title}
            href={link.path}
            className="text-emerald-100/80 hover:text-emerald-50 hover:translate-x-1 transition-all duration-200 text-xs"
          >
            {link.title}
          </a>
        ))}
      </nav>
    </div>
  );

  if (mode === "desktop") return <>{MenuContent}</>;

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
            z-100000000000000
          "
          onClick={() => setOpen(true)}
        >
          Browse
        </button>
      )}

      <div
        className={`fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 ease-in-out
    ${open ? "opacity-100 visible" : "opacity-0 pointer-events-none"}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
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
