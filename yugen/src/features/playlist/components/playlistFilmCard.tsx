import React from "react";
import supabase from "../../../lib/supabaseClient";
import { FiStar } from "react-icons/fi";

interface PlaylistItemProps {
  pf: any; // same shape as playlistFilms entries from backend
  selected: boolean;
  onClick: () => void;
}

/**
 * Small presentational item for a playlist row.
 * - Dark emerald background, light content as requested.
 */
const PlaylistItem: React.FC<PlaylistItemProps> = ({
  pf,
  selected,
  onClick,
}) => {
  const posterUrl =
    supabase.storage.from("posters").getPublicUrl(pf.films.poster_path).data
      .publicUrl || "/placeholder.jpg";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all
        ${selected ? "bg-emerald-800/60 ring-2 ring-emerald-50" : "hover:bg-emerald-900/20"}
      `}
    >
      <img
        src={posterUrl}
        alt={pf.films.film_title}
        className="w-20 h-28 object-cover rounded-md border border-emerald-50/20"
        style={{ aspectRatio: "2/3" }}
      />
      <div className="flex-1 text-left">
        <div
          className={`font-freckle text-lg ${selected ? "text-emerald-50" : "text-emerald-50/90"}`}
        >
          {pf.films.film_title}
        </div>
        <div
          className={`text-sm ${selected ? "text-emerald-50/90" : "text-emerald-50/70"}`}
        >
          {pf.films.film_genre || "No genre"}
        </div>
      </div>
      <div className="flex flex-col items-center text-emerald-50 text-sm">
        <FiStar size={18} />
        <span className="mt-1">{pf.films.avg_rating ?? "N/A"}</span>
      </div>
    </button>
  );
};

export default PlaylistItem;
