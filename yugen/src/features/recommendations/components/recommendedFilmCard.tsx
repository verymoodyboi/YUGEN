import React from "react";
import supabase from "../../../lib/supabaseClient";
import { FiStar, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useFilm } from "../../stream/hooks/useFilmCard";

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

  // ✅ Always pass both film_uuid and uploader_id
  const { uploader } = useFilm(film.film_uuid, film.uploader_id);

  const posterUrl =
    supabase.storage.from("posters").getPublicUrl(film.poster_path || "").data
      .publicUrl || "/placeholder.jpg";

  const handleClick = () => {
    if (onClick) onClick();
    else navigate(`/watch?uuid=${film.film_uuid}`);
  };

  // ✅ Display genres safely
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
      className={`p-4 border-2 mt-2 border-emerald-950 rounded-lg bg-emerald-50 text-emerald-950 cursor-pointer transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#064e3b] ${
        selected ? "bg-emerald-100" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Poster */}
        <img
          src={posterUrl}
          alt={film.film_title}
          className="w-20 h-28 object-cover rounded-md border border-emerald-950"
        />

        {/* Film info */}
        <div className="flex-1 flex flex-col">
          <h3 className="font-freckle text-xl truncate">{film.film_title}</h3>
          <p className="text-sm text-emerald-950/70">{genresText}</p>

          {/* Uploader info under genre */}
          {uploader && uploader.username ? (
            <div
              className="flex items-center gap-1 mt-1 w-32 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                navigate(
                  `/@?username=${encodeURIComponent(uploader?.username)}`
                );
              }}
            >
              {uploader.pfp ? (
                <img
                  src={
                    userInfo?.pfp_path
                      ? supabase.storage.from("pfps").getPublicUrl(uploader.pfp)
                          .data.publicUrl + `?v=${Date.now()}`
                      : undefined
                  }
                  alt="Uploader avatar"
                  className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-emerald-700 flex-shrink-0" />
              )}
              <span className="text-[11px] truncate" title={uploader.username}>
                {uploader.username.length > 10
                  ? `${uploader.username.slice(0, 10)}...`
                  : uploader.username}
              </span>
            </div>
          ) : (
            <div className="text-xs text-emerald-950/50 mt-1">
              Loading uploader...
            </div>
          )}
        </div>

        {/* Views & Rating */}
        <div className="flex flex-col items-end text-sm text-emerald-950">
          <div className="flex items-center gap-1">
            <FiEye size={16} /> {film.view_count ?? 0}
          </div>
          <div className="flex items-center gap-1">
            <FiStar size={16} /> {film.avg_rating ?? "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarFilmCard;
