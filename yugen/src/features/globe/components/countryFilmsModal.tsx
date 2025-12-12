import React, { useEffect, useRef, useState } from "react";
import { Film } from "../../stream/types/film";
import FilmCard from "../../../components/filmCard-2x3";
import AccountCard from "../../../components/AccountCard";
import supabase from "../../../lib/supabaseClient";
import {
  FiFilm,
  FiUser,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  if (!open) return null;

  // -------------------------
  // STATE
  // -------------------------
  const [activeTab, setActiveTab] = useState<"films" | "artists">("films");
  const [displayedFilms, setDisplayedFilms] = useState<FilmWithUploader[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<any[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  // -------------------------
  // DATA NORMALIZATION
  // -------------------------
  const normalizedUsers = Array.isArray(users) ? users : users?.data || [];

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

  const getUploader = (film: any): Uploader | null =>
    film?.uploader || film?.users || film?.uploader_data || null;

  // -------------------------
  // PAGINATION
  // -------------------------
  useEffect(() => {
    setDisplayedFilms(films.slice(0, 12));
  }, [films]);

  useEffect(() => {
    setDisplayedUsers(normalizedUsers.slice(0, 9));
  }, [normalizedUsers]);

  // -------------------------
  // FEATURED ROTATION
  // -------------------------
  const featuredFilms = films.slice(0, 8);
  const currentFilm = featuredFilms[currentIndex];
  const uploader = getUploader(currentFilm);

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

  useEffect(() => {
    const el = headerRef.current;
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

  // -------------------------
  // SCROLL LOADING
  // -------------------------
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 40;

    if (!nearBottom || loading) return;
    activeTab === "films" ? loadMoreFilms() : loadMoreUsers();
  };

  // -------------------------
  // SMALL UI COMPONENT
  // -------------------------
  const Stat = ({ icon, label }: { icon: any; label: any }) => (
    <div className="flex items-center gap-2 text-emerald-900/80 text-sm">
      <span className="text-base">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );

  // -------------------------
  // MAIN RENDER
  // -------------------------
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm flex justify-center items-start p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl bg-white rounded-2xl 
                 border border-emerald-900/20 shadow-xl overflow-hidden"
      >
        {/* ---------------------------------- */}
        {/* 1. TOP HEADER (C + B aesthetic) */}
        {/* ---------------------------------- */}
        <div className="px-8 pb-4 pt-6 border-b border-emerald-900/15 bg-white sticky top-0 z-10">
          <h1 className="font-freckle text-4xl tracking-tight text-emerald-950">
            {countryName}
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

        {/* ---------------------------------- */}
        {/* 2. FEATURED SECTION */}
        {/* ---------------------------------- */}
        <div
          ref={headerRef}
          className="relative border-b border-emerald-900/15 bg-emerald-50/40"
        >
          {/* Banner */}
          <div
            className={`relative w-full h-[260px] overflow-hidden transition-all duration-500 
            ${fading ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"}`}
          >
            {currentFilm && (
              <img
                src={getPosterUrl(
                  currentFilm.poster_path,
                  currentFilm.updated_at
                )}
                alt=""
                className="w-full h-full object-cover object-center"
              />
            )}

            {/* Film info overlay */}
            {/* Film info overlay */}
            {currentFilm && (
              <div
                className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white 
               px-4 py-3 rounded-lg flex flex-col gap-1 max-w-[300px]"
              >
                {/* Title */}
                <div className="font-freckle text-xl leading-tight">
                  {currentFilm.film_title}
                </div>

                {/* Rating & Views */}
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <div className="flex items-center gap-1">
                    ★ {currentFilm.avg_rating ?? "—"}
                  </div>

                  <div className="flex items-center gap-1">
                    <FiEye /> {currentFilm.view_count ?? 0}
                  </div>
                </div>

                {/* Thesis (XS only) */}
                {currentFilm.thesis && (
                  <div className="text-xs mt-1 opacity-90 block">
                    {currentFilm.thesis.length > 100
                      ? currentFilm.thesis.slice(0, 100) + "…"
                      : currentFilm.thesis}
                  </div>
                )}
              </div>
            )}

            {/* Fade gradient bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          </div>

          {/* Simplified uploader capsule */}
          {uploader && (
            <div
              className="absolute left-8 bottom-6 bg-white/90 backdrop-blur px-4 py-3 
                       rounded-xl shadow-md flex items-center gap-3 border border-emerald-900/10"
              onClick={(e) => {
                e.stopPropagation();
                navigate(
                  `/@?username=${encodeURIComponent(uploader.username)}`
                );
              }}
            >
              <img
                src={getPfpUrl(uploader.pfp_path)}
                className="w-12 h-12 rounded-full object-cover border border-emerald-900/20"
              />
              <div className="font-freckle text-lg text-emerald-950">
                @{uploader.username}
              </div>
            </div>
          )}

          {/* Rotation controls — now extra interactive */}
          <div className="absolute right-8 bottom-6 flex gap-3">
            <button
              onClick={() => {
                setFading(true);
                setTimeout(() => {
                  setCurrentIndex(
                    (i) => (i - 1 + featuredFilms.length) % featuredFilms.length
                  );
                  setFading(false);
                }, 200);
              }}
              className="bg-white/90 backdrop-blur border border-emerald-900/10 
                       w-10 h-10 rounded-full flex items-center justify-center 
                       text-emerald-900 hover:bg-white hover:scale-[1.05]
                       active:scale-[0.95] transition-transform duration-150"
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
              className="bg-white/90 backdrop-blur border border-emerald-900/10 
                       w-10 h-10 rounded-full flex items-center justify-center 
                       text-emerald-900 hover:bg-white hover:scale-[1.05]
                       active:scale-[0.95] transition-transform duration-150"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>

        {/* ---------------------------------- */}
        {/* 3. TABS */}
        {/* ---------------------------------- */}
        <div className="flex border-b border-emerald-900/15 bg-white sticky top-0 z-10">
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
              hover:scale-[1.03] active:scale-[0.97] duration-150
            `}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ---------------------------------- */}
        {/* 4. CONTENT GRID */}
        {/* ---------------------------------- */}
        <div ref={scrollRef} onScroll={handleScroll} className="p-8 bg-white">
          {loading ? (
            <div className="text-center py-10 text-emerald-900">Loading…</div>
          ) : activeTab === "films" ? (
            displayedFilms.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                {displayedFilms.map((film) => (
                  <FilmCard key={film.film_uuid} film={film} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-emerald-900">
                No films available.
              </div>
            )
          ) : displayedUsers.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {displayedUsers.map((u) => (
                <AccountCard key={u.username} account={u} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-emerald-900">
              No artists available.
            </div>
          )}
        </div>

        {/* CLOSE BUTTON (more interactive) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur 
                 border border-emerald-900/20 text-emerald-900 flex items-center justify-center
                 hover:bg-white hover:scale-[1.1] active:scale-[0.9]
                 transition-transform duration-150"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default CountryModal;
