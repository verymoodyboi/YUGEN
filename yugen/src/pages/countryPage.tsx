// src/pages/CountryPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FiFilm,
  FiUser,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import FilmCard from "../components/filmCard-2x3";
import AccountCard from "../components/AccountCard";
import { useGlobe } from "../features/globe/useGlobe";
import supabase from "../lib/supabaseClient";
import tempPFP from "../YugenAssits/Avatar_Placeholder.png";

const CountryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const countryName = searchParams.get("country");
  const navigate = useNavigate();

  const {
    selectedCountry,
    countryStats,
    films,
    users,
    loading,
    loadMoreFilms,
    loadMoreUsers,
    handleCountryClick,
  } = useGlobe();

  const [activeTab, setActiveTab] = useState<"films" | "artists">("films");
  const [displayedFilms, setDisplayedFilms] = useState(films.slice(0, 12));
  const [displayedUsers, setDisplayedUsers] = useState(users.slice(0, 9));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);

  // Fetch data when country param changes
  useEffect(() => {
    if (countryName) handleCountryClick(countryName);
  }, [countryName, handleCountryClick]);

  // Update displayed items when films/users change
  useEffect(() => {
    setDisplayedFilms(films.slice(0, 12));
  }, [films]);

  useEffect(() => {
    setDisplayedUsers(users.slice(0, 9));
  }, [users]);

  // Featured rotation
  const featuredFilms = films.slice(0, 8);
  const currentFilm = featuredFilms[currentIndex];

  const getPosterUrl = (path?: string, updatedAt?: string) => {
    if (!path) return "/placeholder-poster.png";
    const { data } = supabase.storage.from("posters").getPublicUrl(path);
    return updatedAt
      ? `${data?.publicUrl}?v=${new Date(updatedAt).getTime()}`
      : data?.publicUrl;
  };

  const getPfpUrl = (path?: string) => {
    const { data } = supabase.storage.from("pfps").getPublicUrl(path || "");
    return data?.publicUrl || "/default-avatar.png";
  };

  const getUploader = (film: any) => film?.uploader || film?.users || null;
  const uploader = currentFilm && getUploader(currentFilm);

  // Featured rotation interval
  useEffect(() => {
    if (!featuredFilms.length) return;
    const interval = setInterval(() => {
      if (!paused) {
        setFading(true);
        setTimeout(() => {
          setCurrentIndex((i) => (i + 1) % featuredFilms.length);
          setFading(false);
        }, 280);
      }
    }, 4200);
    return () => clearInterval(interval);
  }, [featuredFilms, paused]);

  // Pause rotation on hover
  const pageRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const enter = () => setPaused(true);
    const leave = () => setPaused(false);
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);

  // Scroll handler for infinite load
  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const fullHeight = document.body.scrollHeight;

    if (scrollTop + viewportHeight >= fullHeight - 100 && !loading) {
      activeTab === "films" ? loadMoreFilms() : loadMoreUsers();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab, loading, loadMoreFilms, loadMoreUsers]);

  return (
    <div ref={pageRef} className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-emerald-900/15   bg-transparent z-10 backdrop-blur-sm">
        <h1 className="font-freckle text-4xl tracking-tight text-emerald-950">
          {selectedCountry || "Unknown"}
        </h1>
        <div className="mt-2 flex gap-6 text-emerald-900/80 text-sm">
          <div className="flex items-center gap-2">
            <FiFilm className="text-emerald-900" />
            {countryStats?.film_count ?? 0} films
          </div>
          <div className="flex items-center gap-2">
            <FiUser className="text-emerald-900" />
            {countryStats?.artist_count ?? 0} artists
          </div>
        </div>
      </div>

      {/* Featured Section */}
      {currentFilm && (
        <div className="relative border-b border-emerald-900/15 bg-emerald-50/40">
          <div
            className={`relative w-full h-[260px] overflow-hidden transition-all duration-500 ${
              fading ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"
            }`}
          >
            <img
              src={`https://posters.try-yugen.com/${currentFilm.poster_path}`}
              alt=""
              className="w-full h-full object-cover object-center"
            />

            {uploader && (
              <div
                className="absolute left-8 bottom-6 bg-white/90 backdrop-blur px-4 py-3 
                       rounded-xl shadow-md flex items-center gap-3 border border-emerald-900/10 cursor-pointer"
                onClick={() =>
                  navigate(
                    `/@?username=${encodeURIComponent(uploader.username)}`,
                  )
                }
              >
                <img
                  src={
                    uploader?.pfp_path
                      ? `https://pfps.try-yugen.com/${uploader.pfp_path}?t=${Date.now()}`
                      : tempPFP
                  }
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== tempPFP) {
                      img.src = tempPFP;
                    }
                  }}
                  className="w-12 h-12 rounded-full object-cover border border-emerald-900/20"
                />
                <div className="font-freckle text-lg text-emerald-950 truncate max-w-[150px]">
                  @{uploader.username}
                </div>
              </div>
            )}

            {/* Rotation controls */}
            <div className="absolute left-8 top-6 flex gap-3">
              <button
                onClick={() =>
                  setCurrentIndex(
                    (i) =>
                      (i - 1 + featuredFilms.length) % featuredFilms.length,
                  )
                }
                className="bg-white/90 backdrop-blur border border-emerald-900/10 
                       w-10 h-10 rounded-full flex items-center justify-center 
                       text-emerald-900 hover:bg-white hover:scale-[1.05] active:scale-[0.95] transition-transform duration-150"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={() =>
                  setCurrentIndex((i) => (i + 1) % featuredFilms.length)
                }
                className="bg-white/90 backdrop-blur border border-emerald-900/10 
                       w-10 h-10 rounded-full flex items-center justify-center 
                       text-emerald-900 hover:bg-white hover:scale-[1.05] active:scale-[0.95] transition-transform duration-150"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-emerald-900/15  z-10 bg-transparent backdrop-blur-sm">
        {["films", "artists"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`flex-1 py-3 font-freckle text-lg transition-all
              ${
                activeTab === t
                  ? "text-emerald-950 border-b-2 border-emerald-950"
                  : "text-emerald-900/60 hover:text-emerald-900"
              }
              hover:scale-[1.03] active:scale-[0.97] duration-150`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-8 grid gap-8">
        {loading && (
          <div className="text-center py-10 text-emerald-900">Loading…</div>
        )}

        {!loading &&
          activeTab === "films" &&
          (displayedFilms.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-8 place-items-center">
              {displayedFilms.map((film) => (
                <FilmCard key={film.film_uuid} film={film} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-emerald-900">
              No films available.
            </div>
          ))}

        {!loading &&
          activeTab === "artists" &&
          (displayedUsers.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-8 place-items-center">
              {displayedUsers.map((u) => (
                <AccountCard key={u.username} account={u} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-emerald-900">
              No artists available.
            </div>
          ))}
      </div>
    </div>
  );
};

export default CountryPage;
