import "../App.css";
import SearchBar from "../features/search/components/SearchBar";
import supabase from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import PillNav from "../SmallComponents/PillNav";
import { useState, useRef, useEffect } from "react";
import { FiSearch, FiBell } from "react-icons/fi";
function NavBar() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false); // for animation
  const drawerRef = useRef<HTMLDivElement>(null);

  const logOut = async () => {
    await supabase.auth.signOut();
    navigate("/LoginPage");
  };

  // Close search drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        // start closing animation
        setAnimateOpen(false);
        setTimeout(() => setSearchOpen(false), 300); // match transition duration
      }
    };
    if (searchOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  const handleOpenSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    setSearchOpen(true);
    setTimeout(() => setAnimateOpen(true), 10); // start animation
  };

  return (
    <div className="absolute -top-2 left-1 w-[115px] h-[8vh] z-50">
      {/* PillNav */}
      <PillNav
        logo="https://iqvsgbsnpqvbddmdixoz.supabase.co/storage/v1/object/public/assets/Yugen%20Logo%20Vector%20FINAL.svg"
        logoAlt="Company Logo"
        items={[
          {
            label: (
              <span className="flex items-center gap-2">
                <FiSearch size={16} />
                Search
              </span>
            ),
            href: "/",
            onClick: handleOpenSearch,
          },
          {
            label: (
              <span className="flex items-center gap-2">
                <FiBell size={16} />
                Notifications
              </span>
            ),
            href: "/notifications",
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
        <div
          className={`fixed inset-0 z-[100000000000000000] flex flex-col items-center justify-start bg-transparent pointer-events-none`}
        >
          <div
            ref={drawerRef}
            onClick={(e) => e.stopPropagation()}
            className={`w-full h-[50vh] bg-emerald-50 text-emerald-950 backdrop-blur-md backdrop-saturate-150 rounded-b-2xl border border-emerald-950 shadow-lg flex flex-col items-center p-4 
                        transform transition-transform duration-300 ease-in-out pointer-events-auto
                        ${animateOpen ? "translate-y-0" : "-translate-y-full"}`}
          >
            <div className="w-full h-[10vh] flex justify-center items-center">
              <SearchBar
                onSearch={() => {
                  // Close drawer on search
                  setAnimateOpen(false);
                  setTimeout(() => setSearchOpen(false), 300); // match transition
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NavBar;
