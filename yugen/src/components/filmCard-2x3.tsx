import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createPortal } from "react-dom";
import { logFilmClick } from "../features/stream/services/filmCardServices";
import { useFilm } from "../features/stream/hooks/useFilmCard";
import { startScroll, resetScroll } from "../features/stream/util/textScroll";
import { Film } from "../features/stream/types/film";
import EditFilm from "../features/editFilm/components/EditFilm";
import BookMarkIcon from "../YugenAssits/fn_icons/Bookmark not added.svg";
import BookMarkIconheck from "../YugenAssits/fn_icons/Bookmark added.svg";
import Edit_icon from "../YugenAssits/fn_icons/Edit_Film.svg";
import tempPFP from "../YugenAssits/Avatar_Placeholder.png";
import tempPoster from "../YugenAssits/Cover_Placeholder.png";

import { FiEye, FiStar } from "react-icons/fi";
import { LuBookOpen } from "react-icons/lu";
import { Tooltip } from "@mui/material";
import AuthActionGuard from "./clickWrapper";

interface FilmCardProps {
  film: Film;
}

const FilmCard: React.FC<FilmCardProps> = ({ film }) => {
  const poster_url = `https://posters.try-yugen.com/${film.poster_path}`;

  const { userInfo, getAccessToken } = useAuth();
  const { watchlisted, handleToggleWatchlist, uploader } = useFilm(
    film.film_uuid,
    film.uploader_id,
  );

  // null = still preloading (show skeleton), string = ready to display
  const [displayUrl, setDisplayUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!film.poster_path) {
      setDisplayUrl(tempPoster);
      return;
    }

    const preload = new window.Image();
    preload.onload = () => setDisplayUrl(poster_url);
    preload.onerror = () => setDisplayUrl(tempPoster);
    preload.src = poster_url;
  }, [film.poster_path]);

  // null = still preloading (show skeleton), string = ready to display
  const [pfpUrl, setPfpUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!uploader?.pfp) {
      setPfpUrl(tempPFP);
      return;
    }

    const pfp_url = `https://pfps.try-yugen.com/${uploader.pfp}?t=${Date.now()}`;

    const preload = new window.Image();
    preload.onload = () => setPfpUrl(pfp_url);
    preload.onerror = () => setPfpUrl(tempPFP);
    preload.src = pfp_url;
  }, [uploader?.pfp]);

  const [openEdit, setOpenEdit] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [openRating, setOpenRating] = React.useState(false);
  const navigate = useNavigate();

  const isMobile = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  }, []);

  const titleContainerRef = React.useRef<HTMLDivElement | null>(null);
  const titleTextRef = React.useRef<HTMLSpanElement | null>(null);
  const genreContainerRef = React.useRef<HTMLDivElement | null>(null);
  const genreTextRef = React.useRef<HTMLSpanElement | null>(null);

  React.useEffect(() => {
    if (isMobile) {
      startScroll(
        titleTextRef.current,
        titleContainerRef.current,
        genreTextRef.current,
        genreContainerRef.current,
      );
    }

    return () => {
      resetScroll(titleTextRef.current, genreTextRef.current);
    };
  }, [isMobile]);

  const handleCardClick = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("button") && !target.closest(".modal")) {
      try {
        const token = await getAccessToken();
        await logFilmClick(film.film_uuid, token);
        navigate(`/watch?uuid=${encodeURIComponent(film.film_uuid)}`);
      } catch {
        navigate(`/watch?uuid=${encodeURIComponent(film.film_uuid)}`);
      }
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => {
        if (!isMobile) {
          startScroll(
            titleTextRef.current,
            titleContainerRef.current,
            genreTextRef.current,
            genreContainerRef.current,
          );
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          resetScroll(titleTextRef.current, genreTextRef.current);
        }
      }}
      className="relative flex flex-col mt-3 rounded-xl overflow-hidden w-51 h-100
             bg-emerald-50 border-2 border-emerald-950 shadow-md
             transition-transform duration-300 hover:scale-105 mb-3 mt-1 ml-3 mr-1"
    >
      <div className="w-full aspect-[2/3] overflow-hidden border-b-2 border-emerald-950 relative">
        {!displayUrl && (
          <div className="absolute inset-0 bg-emerald-100 animate-pulse" />
        )}
        {displayUrl && (
          <img
            src={displayUrl}
            alt={film.film_title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <Tooltip title="Watchlist">
        <AuthActionGuard>
          <button
            className="absolute top-1 left-1 p-1 cursor-pointer hover:scale-110 transition"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleWatchlist();
            }}
          >
            <span className="rounded-full p-[4px] flex items-center justify-center">
              {watchlisted ? (
                <img
                  src={BookMarkIconheck}
                  alt="Bookmarked"
                  className="w-[24px] h-[24px]"
                />
              ) : (
                <img
                  src={BookMarkIcon}
                  alt="Add to bookmarks"
                  className="w-[24px] h-[24px]"
                />
              )}
            </span>
          </button>
        </AuthActionGuard>
      </Tooltip>

      {userInfo?.auth_id === film.uploader_id && (
        <Tooltip title="Edit">
          <button
            className="absolute top-1 right-1 p-1 cursor-pointer hover:scale-110 transition"
            onClick={(e) => {
              e.stopPropagation();
              setOpenEdit(true);
            }}
          >
            <span className="rounded-full p-[4px] flex items-center justify-center">
              <img
                src={Edit_icon}
                alt="Edit film"
                className="w-[24px] h-[24px]"
              />
            </span>
          </button>
        </Tooltip>
      )}

      <div className="flex justify-between items-start px-1 py-0.5 text-emerald-950">
        <div className="w-[130px] max-w-[130px]">
          <div
            ref={titleContainerRef}
            className="overflow-hidden whitespace-nowrap"
          >
            <span
              ref={titleTextRef}
              className="inline-block font-freckle font-semibold text-md"
            >
              {film.film_title}
            </span>
          </div>
          <div
            ref={genreContainerRef}
            className="overflow-hidden whitespace-nowrap"
          >
            <span
              ref={genreTextRef}
              className="inline-block font-freckle text-sm text-emerald-950/70"
            >
              {(() => {
                try {
                  const parsed =
                    typeof film.film_genre === "string"
                      ? JSON.parse(film.film_genre)
                      : film.film_genre;
                  return Array.isArray(parsed)
                    ? parsed.join(", ")
                    : parsed || "No genre";
                } catch {
                  return film.film_genre || "No genre";
                }
              })()}
            </span>
          </div>
        </div>
        <Tooltip title="Thesis">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            className="hover:scale-110 transition-transform flex flex-col items-center text-emerald-950/70 cursor-pointer"
          >
            <LuBookOpen size={25} />
          </button>
        </Tooltip>
      </div>

      {/* Footer */}
      <div className="flex justify-center items-center bg-emerald-950 py-1 h-14 hover:bg-emerald-900 transition-colors gap-6 text-emerald-50">
        <div
          className="hover:scale-105 flex items-center gap-1 w-[50%] cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate(
              `/@?username=${encodeURIComponent(uploader?.username ?? "")}`,
            );
          }}
        >
          {!pfpUrl ? (
            <div className="w-8 h-8 rounded-full bg-emerald-800 animate-pulse flex-shrink-0" />
          ) : (
            <img
              src={pfpUrl}
              alt="User avatar"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          )}
          <span className="text-[11px]">
            {uploader?.username && uploader.username.length > 9
              ? `${uploader.username.slice(0, 9)}...`
              : uploader?.username}
          </span>
        </div>

        <Tooltip title="Views">
          <div className="flex flex-col items-center">
            <FiEye size={14} />
            <span className="text-[11px]">{film.view_count || 0}</span>
          </div>
        </Tooltip>

        <Tooltip title="Rating">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenRating(true);
            }}
            className="flex flex-col items-center"
          >
            <FiStar size={14} />
            <span className="text-[11px]">{film.avg_rating ?? 0}</span>
          </button>
        </Tooltip>
      </div>

      {openEdit &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div
              className="bg-emerald-50 border-2 border-emerald-950 rounded-lg p-3 w-full h-full overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <EditFilm onDone={() => setOpenEdit(false)} filmInfo={film} />
            </div>
          </div>,
          document.body,
        )}

      {showModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setShowModal(false)}
          >
            <div
              className="relative bg-emerald-50 rounded-2xl p-6 border-4 border-emerald-950 shadow-[12px_12px_0_0_#064e3b] max-h-[90vh] w-[80vw] hidden-scrollbar overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-emerald-950 font-bold text-[23px] rounded-full bg-emerald-50 border-2 border-emerald-950 hover:bg-emerald-100 transition"
              >
                ×
              </button>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 rounded-md overflow-hidden border-4 border-emerald-950 w-[288px] h-[432px]">
                  <img
                    src={displayUrl ?? tempPoster}
                    alt={film.film_title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2 mt-3">
                    {film.film_title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span className="italic">{film.country}</span>
                    <span>• {film.film_duration}</span>
                    <span className="flex items-center gap-1">
                      <FiStar /> {film.avg_rating ?? 0}
                    </span>
                    <span>• {new Date(film.release_date).getFullYear()}</span>
                  </div>

                  <p className="mb-3 text-sm text-emerald-900">{film.thesis}</p>

                  {uploader?.username && (
                    <div
                      className="hover:scale-105 flex items-center gap-1 w-[50%] cursor-pointer mb-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/@?username=${encodeURIComponent(uploader.username)}`,
                        );
                      }}
                    >
                      {!pfpUrl ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-200 animate-pulse flex-shrink-0" />
                      ) : (
                        <img
                          src={pfpUrl}
                          alt="User avatar"
                          className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <span className="text-[11px]">
                        {uploader.username.length > 9
                          ? `${uploader.username.slice(0, 9)}...`
                          : uploader.username}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {film.film_genre?.map((g: string) => (
                      <span
                        key={g}
                        className="px-3 py-1 rounded-full border border-emerald-950 text-xs"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        navigate(
                          `/watch?uuid=${encodeURIComponent(film.film_uuid)}`,
                        )
                      }
                      className="px-5 py-2 rounded-lg bg-emerald-950 text-emerald-50 border-4 border-emerald-950 hover:scale-105 transition-transform"
                    >
                      Watch Film
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-5 py-2 rounded-lg border-2 border-emerald-950 hover:scale-105 transition-transform"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default FilmCard;
