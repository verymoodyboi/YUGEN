// src/features/recommendations/components/SimilarFilmCard.tsx
import React from "react";
import supabase from "../../../lib/supabaseClient";
import { FiStar, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface SimilarFilmCardProps {
  film: any;
}

const SimilarFilmCard: React.FC<SimilarFilmCardProps> = ({ film }) => {
  const navigate = useNavigate();

  const posterUrl =
    supabase.storage.from("posters").getPublicUrl(film.poster_path || "").data
      .publicUrl || "/placeholder.jpg";

  return (
    <div
      className="flex items-center gap-4 p-3 rounded-lg border-2 bg-emerald-50 border-emerald-950 hover:bg-emerald-100 transition-all cursor-pointer"
      onClick={() => navigate(`/watch?uuid=${film.film_uuid}`)}
    >
      <img
        src={posterUrl}
        alt={film.film_title}
        className="w-20 h-28 object-cover rounded-md border border-emerald-950"
      />

      <div className="flex-1 text-left">
        <h3 className="font-freckle text-lg text-emerald-950 truncate">
          {film.film_title}
        </h3>
        <p className="text-sm text-emerald-900">
          Released:{" "}
          {film.release_date
            ? new Date(film.release_date).toLocaleDateString()
            : "N/A"}
        </p>
        <p className="flex items-center gap-1 text-sm text-emerald-900">
          <FiEye /> {film.view_count ?? 0} views
        </p>
        <p className="flex items-center gap-1 text-sm text-emerald-900">
          <FiStar className="text-yellow-600" />{" "}
          {film.avg_rating ? film.avg_rating.toFixed(1) : "N/A"}
        </p>
      </div>
    </div>
  );
};

export default SimilarFilmCard;
