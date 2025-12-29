// PlaylistItem.tsx
import React from "react";
import supabase from "../../../lib/supabaseClient";
import { FiEye, FiStar } from "react-icons/fi";
import { useFilm } from "../../stream/hooks/useFilmCard";
import { useNavigate } from "react-router-dom";
interface PlaylistItemProps {
  pf: any; // same shape as playlistFilms entries from backend
  selected: boolean;
  onClick: () => void;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({
  pf,
  selected,
  onClick,
}) => {
  const film = pf.films || pf;

  // --- Get uploader info using your existing hook ---
  const { uploader } = useFilm(undefined, film.uploader_id);

  const posterUrl =
    supabase.storage.from("posters").getPublicUrl(film.poster_path).data
      .publicUrl || "/placeholder.jpg";
  const navigate = useNavigate();
  return (
    <div
      onClick={onClick}
      className={`p-4 border-2 mt-2 border-emerald-950 rounded-lg bg-emerald-50 text-emerald-950 cursor-pointer transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#064e3b] ${
        selected ? "bg-emerald-100" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Poster */}
        <img
          src={posterUrl}
          alt={film.film_title}
          className="w-20 h-28 object-cover rounded-md border border-emerald-950 flex-shrink-0"
        />

        {/* Film info */}
        <div className="flex-1 flex flex-col min-w-0">
          <h3 className="font-freckle text-xl truncate">{film.film_title}</h3>
          <p className="text-sm text-emerald-950/70 truncate">
            {film.film_genre || "No genre"}
          </p>

          {/* Uploader info under genre */}
          {uploader?.username && (
            <div
              className="flex items-center gap-1 mt-1 w-full sm:w-32 flex-shrink-0"
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
                    supabase.storage.from("pfps").getPublicUrl(uploader.pfp)
                      .data.publicUrl + `?v=${Date.now()}`
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
          )}
        </div>

        {/* Views & Rating */}
        <div className="flex sm:flex-col items-start sm:items-end gap-2 text-sm text-emerald-950 flex-shrink-0 mt-2 sm:mt-0">
          <div className="flex items-center gap-1">
            <FiEye size={16} /> <span>{film.view_count ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <FiStar size={16} /> <span>{film.avg_rating ?? "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistItem;
