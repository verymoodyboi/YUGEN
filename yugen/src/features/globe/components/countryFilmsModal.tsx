import React, { useEffect, useRef, useState } from "react";
import { Film } from "../../stream/types/film";
import FilmCard from "../../../components/filmCard-2x3";
import AccountCard from "../../../components/AccountCard";
import supabase from "../../../lib/supabaseClient";
import {
  FiFilm,
  FiUser,
  FiClock,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

interface Uploader {
  auth_id?: string;
  username?: string;
  pfp_path?: string | null;
  sub_count?: number;
  films_count?: number;
  bio?: string | null;
  [k: string]: any;
}

interface FilmWithUploader extends Film {
  uploader?: Uploader | null;
}

interface CountryModalProps {
  open: boolean;
  onClose: () => void;
  countryName: string;
  countryStats: {
    film_count: number | null;
    artist_count: number | null;
  } | null;
  films?: FilmWithUploader[];
  users?: any[];
  loading: boolean;
  loadMoreFilms: () => void;
  loadMoreUsers: () => void;
}

const CountryModal: React.FC<CountryModalProps> = ({
  open,
  onClose,
  countryName,
  countryStats,
  films = [],
  users = [],
  loading,
  loadMoreUsers,
  loadMoreFilms,
}) => {
  const [displayedFilms, setDisplayedFilms] = useState<FilmWithUploader[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"films" | "artists">("films");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  const normalizedUsers = Array.isArray(users)
    ? users
    : users?.data
      ? users.data
      : [];

  const getPosterUrl = (path?: string, updatedAt?: string) => {
    if (!path) return "/placeholder-poster.png";
    const { data } = supabase.storage.from("posters").getPublicUrl(path);
    const publicUrl = data?.publicUrl || "";
    return publicUrl + (updatedAt ? `?v=${new Date(updatedAt).getTime()}` : "");
  };

  const getPfpUrl = (path?: string) => {
    const { data } = supabase.storage.from("pfps").getPublicUrl(path || "");
    return data?.publicUrl || "/default-avatar.png";
  };

  // --- get uploader safely ---
  const getUploader = (film: any): Uploader | null => {
    if (!film) return null;
    return (
      film.uploader ||
      film.users || // in case Supabase join used "users" alias
      film.uploader_data ||
      null
    );
  };

  // initial pagination
  useEffect(() => {
    setDisplayedFilms(films.slice(0, 12));
  }, [films]);

  useEffect(() => {
    setDisplayedUsers(normalizedUsers.slice(0, 9));
  }, [normalizedUsers]);

  // header rotation
  const featuredFilms = films.slice(0, 10) || [];

  useEffect(() => {
    if (!featuredFilms.length) return;
    const interval = setInterval(() => {
      if (paused) return;
      setFading(true);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % featuredFilms.length);
        setFading(false);
      }, 400);
    }, 4200);
    return () => clearInterval(interval);
  }, [featuredFilms, paused]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const onEnter = () => setPaused(true);
    const onLeave = () => setPaused(false);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (!open) return null;

  const currentFilm = featuredFilms[currentIndex] || null;
  const uploader = getUploader(currentFilm);

  const StatItem: React.FC<{
    icon: React.ReactNode;
    value: string | number;
  }> = ({ icon, value }) => (
    <div className="flex items-center gap-2 text-emerald-950/90 text-sm">
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 20;

    if (nearBottom && !loading) {
      if (activeTab === "films") {
        loadMoreFilms();
      } else {
        loadMoreUsers();
      }
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl border-4 border-emerald-950 bg-emerald-50 shadow-[10px_10px_0_#064e3b]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        {/* COUNTRY HEADER SECTION */}
        <div className="px-6 pt-5 pb-2 border-b border-emerald-950/20">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-freckle text-3xl text-emerald-950 leading-none">
                {countryName}
              </h2>
              <div className="mt-1 flex gap-4 text-emerald-900/90 text-sm">
                <div className="flex items-center gap-1">
                  <FiFilm className="text-emerald-900" />
                  <span>{countryStats?.film_count ?? 0} films</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiUser className="text-emerald-900" />
                  <span>{countryStats?.artist_count ?? 0} artists</span>
                </div>
              </div>
            </div>

            {/* Small country accent line */}
            <div className="h-[2px] w-1/3 bg-emerald-950/40 rounded-full" />
          </div>
        </div>

        {/* HEADER - Featured Film */}
        <div
          ref={headerRef}
          className="flex gap-6 px-6 py-5 border-b-2 border-emerald-950/40 items-center"
        >
          {/* Poster with thesis */}
          <div
            className={`relative flex-shrink-0 rounded-lg overflow-hidden shadow-lg transition-all duration-500 ${
              fading ? "opacity-0 scale-98" : "opacity-100 scale-100"
            }`}
            style={{ width: "55%", height: 220 }}
          >
            {currentFilm && (
              <>
                <img
                  src={getPosterUrl(
                    currentFilm.poster_path,
                    currentFilm.updated_at
                  )}
                  alt={currentFilm.film_title || "Poster"}
                  className="w-full h-full object-cover"
                />

                {/* thesis overlay */}
                {currentFilm.thesis && (
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-emerald-50/40 text-emerald-950 text-sm italic font-freckle rounded-md px-4 py-2 shadow-md max-w-[90%] text-center">
                    “
                    {currentFilm.thesis.length > 100
                      ? currentFilm.thesis.slice(0, 100) + "…"
                      : currentFilm.thesis}
                    ”
                  </div>
                )}

                {/* film info */}
                <div className="absolute left-4 bottom-4 bg-emerald-50/40 text-emerald-950 rounded-md px-3 py-1 flex items-center gap-3">
                  <FiFilm className="text-lg" />
                  <div className="text-left">
                    <div className="font-freckle font-semibold text-base leading-tight truncate max-w-[420px]">
                      {currentFilm.film_title || "Untitled"}
                    </div>
                    <div className="text-xs text-emerald-900">
                      {currentFilm.release_date
                        ? new Date(
                            currentFilm.release_date
                          ).toLocaleDateString()
                        : "Unknown date"}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Uploader side */}
          <div className="flex flex-col flex-1 gap-3 justify-center">
            <div className="flex items-center gap-4">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-emerald-950 shadow-md flex-shrink-0">
                <img
                  src={getPfpUrl(uploader?.pfp_path)}
                  alt={uploader?.username || "uploader"}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/60 via-transparent to-transparent" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-freckle text-2xl text-emerald-950">
                  @{uploader?.username ?? "unknown"}
                </h3>
                <p className="mt-1 text-emerald-900 text-sm max-w-[360px] line-clamp-2">
                  {uploader?.bio
                    ? uploader.bio
                    : currentFilm?.thesis
                      ? currentFilm.thesis.slice(0, 150) +
                        (currentFilm.thesis.length > 150 ? "…" : "")
                      : ""}
                </p>
              </div>
            </div>

            {/* stats */}
            <div className="flex items-center gap-6 mt-2">
              <StatItem icon={<FiUser />} value={uploader?.sub_count ?? "—"} />
              <StatItem icon={<FiEye />} value={currentFilm?.view_count ?? 0} />
            </div>

            {/* rotation controls */}
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => {
                  setFading(true);
                  setTimeout(() => {
                    setCurrentIndex(
                      (i) =>
                        (i - 1 + featuredFilms.length) % featuredFilms.length
                    );
                    setFading(false);
                  }, 200);
                }}
                className="px-3 py-1 rounded-md bg-emerald-950 text-emerald-50 hover:scale-105 transition-transform"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={() => {
                  setFading(true);
                  setTimeout(() => {
                    setCurrentIndex((i) => (i + 1) % featuredFilms.length);
                    setFading(false);
                  }, 200);
                }}
                className="px-3 py-1 rounded-md bg-emerald-950 text-emerald-50 hover:scale-105 transition-transform"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b-2 border-emerald-950/30">
          <button
            onClick={() => setActiveTab("films")}
            className={`flex-1 px-6 py-3 font-freckle text-base transition-all duration-200 ${
              activeTab === "films"
                ? "bg-emerald-950 text-emerald-50 shadow-inner"
                : "text-emerald-950 hover:bg-emerald-100"
            }`}
          >
            Films
          </button>
          <button
            onClick={() => setActiveTab("artists")}
            className={`flex-1 px-6 py-3 font-freckle text-base transition-all duration-200 ${
              activeTab === "artists"
                ? "bg-emerald-950 text-emerald-50 shadow-inner"
                : "text-emerald-950 hover:bg-emerald-100"
            }`}
          >
            Artists
          </button>
        </div>

        {/* CONTENT */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 bg-emerald-50"
        >
          {loading ? (
            <div className="flex items-center justify-center h-36 text-emerald-950">
              Loading…
            </div>
          ) : activeTab === "films" ? (
            displayedFilms.length ? (
              <div className="flex flex-wrap justify-center gap-5">
                {displayedFilms.map((film) => (
                  <div
                    key={film.film_uuid}
                    className="w-36 transform hover:scale-105 transition-transform"
                  >
                    <FilmCard film={film} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-36 text-emerald-950">
                No films available.
              </div>
            )
          ) : displayedUsers.length ? (
            <div className="flex flex-wrap justify-center gap-5">
              {displayedUsers.map((u) => (
                <AccountCard key={u.username} account={u} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-36 text-emerald-950">
              No artists available.
            </div>
          )}
        </div>

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 bg-emerald-50 border-2 border-emerald-950 text-emerald-950 hover:scale-105 transition-transform"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default CountryModal;
