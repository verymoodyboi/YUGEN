import React from "react";
import StarIcon from "@mui/icons-material/Star";
import supabase from "../../../lib/supabaseClient";

interface PendingFilmsTabProps {
  pendingFilms: any[];
  handleRemoveFilm: (filmId: string) => void;
  handleAcceptFilm: (filmId: string) => void;
}

const PendingFilmsTab: React.FC<PendingFilmsTabProps> = ({
  pendingFilms,
  handleRemoveFilm,
  handleAcceptFilm,
}) => {
  return (
    <div className="mt-2 h-80 overflow-y-auto pr-2">
      {pendingFilms.length === 0 && (
        <p className="text-center text-red-400">
          No new submissions at the moment.
        </p>
      )}

      <ul className="space-y-3">
        {pendingFilms.map((film: any) => (
          <li
            key={film.film_uuid}
            className="flex items-start gap-4 p-3 border-b border-emerald-900 bg-emerald-50 rounded-md"
          >
            <img
              src={
                supabase.storage.from("posters").getPublicUrl(film?.poster_path)
                  .data.publicUrl
              }
              alt={film.film_title}
              className="w-24 h-36 object-cover rounded-md border border-emerald-900"
            />

            <div className="flex-1">
              <h4 className="text-lg font-bold text-emerald-950">
                {film.film_title}
              </h4>

              <div className="text-sm text-amber-600 flex items-center gap-1">
                Rating: {film.avg_rating ?? "N/A"} <StarIcon />
              </div>

              <div className="text-sm text-emerald-800">
                Submitted at:{" "}
                {film?.submitted_at ? film.submitted_at.split("T")[0] : "N/A"}
              </div>

              <div className="text-xs text-emerald-700 italic">
                Pending review
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleRemoveFilm(film.film_uuid)}
                className="py-1 px-3 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Remove
              </button>

              <button
                onClick={() => handleAcceptFilm(film.film_uuid)}
                className="py-1 px-3 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Accept
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PendingFilmsTab;
