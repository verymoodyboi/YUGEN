import { useState } from "react";
import supabase from "../../../lib/supabaseClient";
import { FiStar, FiEdit3 } from "react-icons/fi";
import { createPortal } from "react-dom";
import EditFilm from "../../editFilm/components/EditFilm";

const UploadFilmCard: React.FC<{ film: any }> = ({ film }) => {
  const [openEdit, setOpenEdit] = useState(false);

  const posterUrl =
    supabase.storage.from("posters").getPublicUrl(film.poster_path || "").data
      .publicUrl || "/placeholder.jpg";

  const isFlagged = film.is_flagged === true;
  const isUnderReview = film.moderation_status === "under_review";

  // 🔹 Decide background and border color based on film state
  const cardClass = isFlagged
    ? "bg-red-50 border-red-700 hover:bg-red-100"
    : isUnderReview
      ? "bg-yellow-50 border-yellow-600 hover:bg-yellow-100"
      : "bg-emerald-50 border-emerald-950 hover:bg-emerald-100";

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-all ${cardClass}`}
    >
      <img
        src={posterUrl}
        alt={film.film_title}
        className="w-20 h-28 object-cover rounded-md border border-emerald-950"
      />

      <div className="flex-1 text-left">
        <h3 className="font-freckle text-lg text-emerald-950">
          {film.film_title}
        </h3>
        <p className="text-sm text-emerald-900">
          Uploaded:{" "}
          {film.release_date
            ? new Date(film.release_date).toLocaleDateString()
            : "N/A"}
        </p>
        <p className="text-sm text-emerald-900">Views: {film.views ?? 0}</p>
        <p className="flex items-center gap-1 text-sm text-emerald-900">
          <FiStar className="text-yellow-600" /> {film.avg_rating ?? "N/A"}
        </p>

        {/*  Flagged warning */}
        {isFlagged && (
          <p className="text-sm text-red-800 font-semibold mt-1">
            ⚠️ This film was{" "}
            {film.flag_reason ? (
              <>flagged due to {film.flag_reason}</>
            ) : (
              <>flagged by moderators</>
            )}
            . It is currently under review by our team — thank you for your
            patience!
          </p>
        )}

        {/*  Under Review Notice */}
        {isUnderReview && (
          <p className="text-sm text-yellow-800 font-semibold mt-1">
            ⏳ This film is being scanned for inappropriate content. It may take
            a couple of minutes before it is visible to the public.
          </p>
        )}
      </div>

      {/*  Edit button */}
      <button
        className="text-emerald-950 hover:text-emerald-700 transition ml-2"
        title="Edit"
        onClick={(e) => {
          e.stopPropagation();
          setOpenEdit(true);
        }}
      >
        <FiEdit3 size={20} />
      </button>

      {/*  Edit Modal */}
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
          document.body
        )}
    </div>
  );
};

export default UploadFilmCard;
