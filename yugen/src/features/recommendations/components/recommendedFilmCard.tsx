import React from "react";
import supabase from "../../../lib/supabaseClient";
import { FiStar, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useFilm } from "../../stream/hooks/useFilmCard";
import { startScroll, resetScroll } from "../../stream/util/textScroll";
import tempPoster from "../../../YugenAssits/Cover_Placeholder.png";
import tempPFP from "../../../YugenAssits/Avatar_Placeholder.png";
interface SimilarFilmCardProps {
  film: any;
  selected?: boolean;
  onClick?: () => void;
}

const SimilarFilmCard: React.FC<SimilarFilmCardProps> = ({
  film,
  selected,
  onClick,
}) => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const posterUrl = film.poster_path
    ? supabase.storage.from("posters").getPublicUrl(film.poster_path).data
        .publicUrl +
      (film.updated_at ? `?v=${new Date(film.updated_at).getTime()}` : "")
    : tempPoster;

  // scroll refs
  const titleContainerRef = React.useRef<HTMLDivElement | null>(null);
  const titleTextRef = React.useRef<HTMLSpanElement | null>(null);
  const genreContainerRef = React.useRef<HTMLDivElement | null>(null);
  const genreTextRef = React.useRef<HTMLSpanElement | null>(null);

  const isMobile = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  }, []);

  React.useEffect(() => {
    if (isMobile) {
      startScroll(
        titleTextRef.current,
        titleContainerRef.current,
        genreTextRef.current,
        genreContainerRef.current
      );
    }

    return () => {
      resetScroll(titleTextRef.current, genreTextRef.current);
    };
  }, [isMobile]);

  // always pass both ids
  const { uploader } = useFilm(film.film_uuid, film.uploader_id);
  const PFPurl = uploader?.pfp
    ? supabase.storage.from("pfps").getPublicUrl(uploader?.pfp).data.publicUrl +
      (uploader?.updated_at
        ? `?v=${new Date(uploader?.updated_at).getTime()}`
        : "")
    : tempPFP;
  const handleClick = () => {
    if (onClick) onClick();
    else navigate(`/watch?uuid=${film.film_uuid}`);
  };

  // safe genres
  const genresText = (() => {
    try {
      const genres =
        typeof film.film_genre === "string"
          ? JSON.parse(film.film_genre)
          : film.film_genre;
      return Array.isArray(genres) && genres.length > 0
        ? genres.join(", ")
        : "No genre";
    } catch {
      return "No genre";
    }
  })();

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => {
        if (!isMobile) {
          startScroll(
            titleTextRef.current,
            titleContainerRef.current,
            genreTextRef.current,
            genreContainerRef.current
          );
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          resetScroll(titleTextRef.current, genreTextRef.current);
        }
      }}
      className={`p-4 mt-2 border-2 border-emerald-950 rounded-lg bg-emerald-50
        cursor-pointer transition-transform duration-200 ease-in-out
        hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#064e3b]
        ${selected ? "bg-emerald-100" : ""}`}
    >
      <div className="flex items-start gap-4">
        {/* Poster */}
        <img
          src={posterUrl}
          alt="Film thumbnail"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src !== tempPoster) {
              img.src = tempPoster;
            }
          }}
          className="w-20 h-28 object-cover rounded-md border border-emerald-950 flex-shrink-0"
        />

        {/* Film info */}
        <div className="flex-1 flex flex-col">
          {/* Title */}
          <div
            ref={titleContainerRef}
            className="overflow-hidden whitespace-nowrap
                       max-w-[140px] sm:max-w-[200px]"
          >
            <span
              ref={titleTextRef}
              className="inline-block font-freckle text-sm"
            >
              {film.film_title}
            </span>
          </div>

          {/* Genres */}
          <div
            ref={genreContainerRef}
            className="overflow-hidden whitespace-nowrap
                       max-w-[140px] sm:max-w-[200px]"
          >
            <span
              ref={genreTextRef}
              className="inline-block text-sm text-emerald-950/70"
            >
              {genresText}
            </span>
          </div>

          {/* Views + Rating UNDER genres */}
          <div className="flex items-center gap-4 mt-1 text-xs text-emerald-950/80">
            <div className="flex items-center gap-1">
              <FiEye size={14} />
              <span>{film.view_count ?? 0}</span>
            </div>

            <div className="flex items-center gap-1">
              <FiStar size={14} />
              <span>{film.avg_rating ?? "N/A"}</span>
            </div>
          </div>

          {/* Uploader */}
          {uploader?.username ? (
            <div
              className="flex items-center gap-1 mt-2 w-32 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(
                  `/@?username=${encodeURIComponent(uploader.username)}`
                );
              }}
            >
              <img
                src={PFPurl}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src !== tempPFP) {
                    img.src = tempPFP;
                  }
                }}
                alt="Uploader avatar"
                className="w-5 h-5 rounded-full object-cover"
              />

              <span className="text-[11px] truncate">{uploader.username}</span>
            </div>
          ) : (
            <div className="text-xs text-emerald-950/50 mt-2">
              Loading uploader...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimilarFilmCard;
