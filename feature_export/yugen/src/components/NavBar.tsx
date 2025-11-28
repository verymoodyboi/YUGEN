import "../App.css";
import SearchBar from "../features/search/components/SearchBar";
import supabase from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import logo from "../YugenAssits/Transparent long.png";
import PillNav from "../SmallComponents/PillNav";
import { useState, useRef, useEffect } from "react";
import UploadsPanel from "../features/uploads/UploadsPanel";
import { useUploadManager } from "../features/uploads/useUploadManager";

function NavBar() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [openUploads, setOpenUploads] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const uploadManager = (() => {
    try {
      return useUploadManager();
    } catch {
      return null as any;
    }
  })();

  const logOut = async () => {
    await supabase.auth.signOut();
    navigate("/LoginPage");
  };

  // Close search drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  return (
    <div className="absolute -top-2 left-1 w-[115px] h-[8vh] z-50">
      {/* PillNav */}
      <PillNav
        logo="https://iqvsgbsnpqvbddmdixoz.supabase.co/storage/v1/object/public/assets/Yugen%20Logo%20Vector%20FINAL.svg"
        logoAlt="Company Logo"
        items={[
          {
            label: "🔍︎ Search",
            href: "#",
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              setSearchOpen(true);
            },
          },
          { label: "🕭 Notifications", href: "/notifications" },
          {
            label: "⬆ Uploads",
            href: "#",
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              if (uploadManager && uploadManager.setOpenPanel) uploadManager.setOpenPanel(true);
              else setOpenUploads(true);
            },
          },
        ]}
        activeHref="/"
        className="custom-nav"
        ease="power2.easeOut"
        baseColor="transparent"
        pillColor="#ecfdf5"
        hoveredPillTextColor="#86b09dff"
        pillTextColor="#032a20"
      />

      {/* Top Drawer for Search */}
      {searchOpen && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-start bg-transparent">
          <div
            ref={drawerRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-[50vh] bg-emerald-50 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-50 backdrop-blur-md backdrop-saturate-150 rounded-b-2xl border border-emerald-950 dark:border-emerald-50 shadow-lg flex flex-col items-center p-4"
          >
            <div className="w-full h-[10vh] flex justify-center items-center">
              <SearchBar />
            </div>
          </div>
        </div>
      )}
      <UploadsPanel open={(uploadManager && uploadManager.openPanel) || openUploads} onClose={() => { if (uploadManager && uploadManager.setOpenPanel) uploadManager.setOpenPanel(false); else setOpenUploads(false); }} />
    </div>
  );
}

export default NavBar;
