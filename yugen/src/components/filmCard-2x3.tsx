import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createPortal } from "react-dom";
import { logFilmClick } from "../features/stream/services/filmCardServices";
import { useFilm } from "../features/stream/hooks/useFilmCard";
import { startScroll, resetScroll } from "../features/stream/util/textScroll";
import type { Film } from "../features/stream/types/film";
import EditFilm from "../features/editFilm/components/EditFilm";
import BookMarkIcon from "../YugenAssits/fn_icons/Bookmark not added.svg";
import BookMarkIconheck from "../YugenAssits/fn_icons/Bookmark added.svg";
import Edit_icon from "../YugenAssits/fn_icons/Edit_Film.svg";
import tempPFP from "../YugenAssits/Avatar_Placeholder.png";
import tempPoster from "../YugenAssits/Cover_Placeholder.png";

import { FiPlay, FiEye, FiStar } from "react-icons/fi";
import { LuBookOpen } from "react-icons/lu";
import { Tooltip } from "@mui/material";
import AuthActionGuard from "./clickWrapper";

interface FilmCardProps {
  film: Film;
}

/* -------------------------------------------------------------------------- */
/* Helpers (module scope: created once, not on every render)                  */
/* -------------------------------------------------------------------------- */

const MOBILE_QUERY = "(max-width: 768px)";

const getIsMobile = (): boolean =>
  typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches;

const truncateName = (name: any): string | undefined =>
  name && name.length > 9 ? `${name.slice(0, 9)}...` : name;

const formatGenre = (raw: Film["film_genre"]): string => {
  try {
    const parsed: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) return parsed.join(", ");
    return parsed ? String(parsed) : "No genre";
  } catch {
    return (typeof raw === "string" && raw) || "No genre";
  }
};

/**
 * Preloads an image. Returns null while loading (show skeleton),
 * the src once loaded, or the fallback if there is no src / it fails.
 * Cleans up so a late onload never sets state on an unmounted component
 * or after src changed.
 */
const usePreloadedImage = (
  src: string | null,
  fallback: string,
): string | null => {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!src) {
      setUrl(fallback);
      return;
    }

    let active = true;
    const preload = new window.Image();
    preload.onload = () => {
      if (active) setUrl(src);
    };
    preload.onerror = () => {
      if (active) setUrl(fallback);
    };
    preload.src = src;

    return () => {
      active = false;
      preload.onload = null;
      preload.onerror = null;
    };
  }, [src, fallback]);

  return url;
};

/* -------------------------------------------------------------------------- */
/* Thesis modal (same markup as before, split out of the card's render)       */
/* -------------------------------------------------------------------------- */

interface ThesisModalProps {
  film: Film;
  posterUrl: string;
  pfpUrl: string | null;
  username: any;
  genres: any;
  onClose: () => void;
  onWatch: () => void;
  onOpenProfile: () => void;
}

const ThesisModal: React.FC<ThesisModalProps> = ({
  film,
  genres,
  posterUrl,
  pfpUrl,
  username,
  onClose,
  onWatch,
  onOpenProfile,
}) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // Fade/slide in on the next frame
    const frame = requestAnimationFrame(() => setVisible(true));

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // Stop the page behind the modal from scrolling
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-950 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-50";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={film.film_title}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => {
        // Portal events bubble to the card in React's tree; keep them here
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className={`relative flex flex-col w-full max-w-4xl max-h-[74dvh] overflow-hidden bg-emerald-50 rounded-2xl border-4 border-emerald-950 shadow-[6px_6px_0_0_#064e3b] sm:shadow-[12px_12px_0_0_#064e3b] transition duration-200 motion-reduce:transition-none ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button stays put while the content scrolls */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center text-emerald-950 font-bold text-[33px] leading-none rounded-full bg-emerald-50  hover:bg-emerald-100 transition ${focusRing}`}
        >
          ×
        </button>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain hidden-scrollbar p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-center md:items-start">
            <button
              type="button"
              onClick={onWatch}
              aria-label={`Watch ${film.film_title}`}
              className={`group relative block flex-shrink-0 rounded-md overflow-hidden  aspect-[2/3] w-40 sm:w-52 md:w-[288px] cursor-pointer ${focusRing}`}
            >
              <img
                src={posterUrl}
                alt=""
                decoding="async"
                className="w-full h-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-emerald-950/0 group-hover:bg-emerald-950/30 group-focus-visible:bg-emerald-950/30 transition-colors duration-300 motion-reduce:transition-none">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-950 text-emerald-950 opacity-50 group-hover:opacity-100 group-hover:scale-125 group-focus-visible:opacity-100 group-focus-visible:scale-125 transition duration-300 motion-reduce:transition-none">
                  <FiPlay size={22} fill="currentColor" className="ml-0.5" />
                </span>
              </span>
            </button>

            <div className="flex-1 min-w-0 w-full md:pr-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 md:mt-3 break-words">
                {film.film_title}
              </h2>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mb-3">
                <span className="italic">{film.country}</span>
                <span>• {film.film_duration}</span>
                <span className="flex items-center gap-1">
                  <FiStar /> {film.avg_rating ?? 0}
                </span>
                <span>• {new Date(film.release_date).getFullYear()}</span>
              </div>

              <p className="mb-4 text-sm sm:text-base leading-relaxed text-emerald-900">
                {film.thesis}
              </p>

              {username && (
                <button
                  type="button"
                  className={`hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer mb-4 rounded-full ${focusRing}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProfile();
                  }}
                >
                  {!pfpUrl ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-200 animate-pulse flex-shrink-0" />
                  ) : (
                    <img
                      src={pfpUrl}
                      alt="User avatar"
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <span className="text-xs">{truncateName(username)}</span>
                </button>
              )}

              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {genres.map((g: any) => (
                    <span
                      key={g}
                      className="px-3 py-1 rounded-full border border-emerald-950 text-xs"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions pinned to the bottom so they're always reachable */}
        {/* <div className="flex gap-3 p-3 sm:p-4 border-t-2 border-emerald-950 bg-emerald-50 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 sm:flex-none px-5 py-2 rounded-lg border-2 border-emerald-950 hover:scale-105 transition-transform ${focusRing}`}
          >
            Close
          </button>
          <button
            type="button"
            onClick={onWatch}
            className={`flex-1 sm:flex-none px-5 py-2 rounded-lg bg-emerald-950 text-emerald-50 border-2 border-emerald-950 hover:scale-105 transition-transform ${focusRing}`}
          >
            Watch Film
          </button>
        </div> */}
      </div>
    </div>,
    document.body,
  );
};

/* -------------------------------------------------------------------------- */
/* Film card                                                                  */
/* -------------------------------------------------------------------------- */

const FilmCard: React.FC<FilmCardProps> = ({ film }) => {
  const { userInfo, getAccessToken } = useAuth();
  const { watchlisted, handleToggleWatchlist, uploader } = useFilm(
    film.film_uuid,
    film.uploader_id,
  );
  const navigate = useNavigate();

  // null = still preloading (show skeleton), string = ready to display
  const posterSrc = film.poster_path
    ? `https://posters.try-yugen.com/${film.poster_path}`
    : null;
  const displayUrl = usePreloadedImage(posterSrc, tempPoster);

  // Cache-buster is computed once per pfp value (same behavior as before)
  const uploaderPfp = uploader?.pfp;
  const pfpSrc = React.useMemo(
    () =>
      uploaderPfp
        ? `https://pfps.try-yugen.com/${uploaderPfp}?t=${Date.now()}`
        : null,
    [uploaderPfp],
  );
  const pfpUrl = usePreloadedImage(pfpSrc, tempPFP);

  const [openEdit, setOpenEdit] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [, setOpenRating] = React.useState(false);

  const isMobile = React.useMemo(getIsMobile, []);

  const titleContainerRef = React.useRef<HTMLDivElement | null>(null);
  const titleTextRef = React.useRef<HTMLSpanElement | null>(null);
  const genreContainerRef = React.useRef<HTMLDivElement | null>(null);
  const genreTextRef = React.useRef<HTMLSpanElement | null>(null);

  const runStartScroll = React.useCallback(() => {
    startScroll(
      titleTextRef.current,
      titleContainerRef.current,
      genreTextRef.current,
      genreContainerRef.current,
    );
  }, []);

  React.useEffect(() => {
    // Capture refs so cleanup uses the same nodes the effect started with
    const titleText = titleTextRef.current;
    const genreText = genreTextRef.current;

    if (isMobile) runStartScroll();

    return () => {
      resetScroll(titleText, genreText);
    };
  }, [isMobile, runStartScroll]);

  const genreLabel = React.useMemo(
    () => formatGenre(film.film_genre),
    [film.film_genre],
  );

  const watchPath = `/watch?uuid=${encodeURIComponent(film.film_uuid)}`;
  const username = uploader?.username;
  const profilePath = `/@?username=${encodeURIComponent(username ?? "")}`;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest(".modal")) return;

    void (async () => {
      try {
        const token = await getAccessToken();
        await logFilmClick(film.film_uuid, token);
      } catch {
        // Same as before: navigate even if logging fails
      }
      navigate(watchPath);
    })();
  };

  const handleMouseEnter = () => {
    if (!isMobile) runStartScroll();
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      resetScroll(titleTextRef.current, genreTextRef.current);
    }
  };

  const closeThesis = React.useCallback(() => setShowModal(false), []);

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col rounded-xl overflow-hidden w-51 h-100
             bg-emerald-50 border-2 border-emerald-950 shadow-md
             transition-transform duration-300 hover:scale-105 mb-3 mt-3 ml-3 mr-1"
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
              {genreLabel}
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
            navigate(profilePath);
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
          <span className="text-[11px]">{truncateName(username)}</span>
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

      {showModal && (
        <ThesisModal
          film={film}
          posterUrl={displayUrl ?? tempPoster}
          pfpUrl={pfpUrl}
          genres={film.film_genre}
          username={username}
          onClose={closeThesis}
          onWatch={() => navigate(watchPath)}
          onOpenProfile={() => navigate(profilePath)}
        />
      )}
    </div>
  );
};

// Memoized so grid/list parents re-rendering doesn't re-render every card
export default React.memo(FilmCard);
