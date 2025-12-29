import { useState } from "react";
import supabase from "../../../lib/supabaseClient";
import { FiStar, FiEdit3, FiImage } from "react-icons/fi";
import { createPortal } from "react-dom";
import EditFilm from "../../editFilm/components/EditFilm";

const UploadFilmCard: React.FC<{ film: any }> = ({ film }) => {
  const [openEdit, setOpenEdit] = useState(false);

  const posterUrl =
    supabase.storage.from("posters").getPublicUrl(film.poster_path || "").data
      .publicUrl || null;

  const isFlagged = film.is_flagged === true;
  const isUnderReview = film.moderation_status === "under_review";
  const isUploading = ["uploading", "queued"].includes(film.moderation_status);
  const isUploadError = film.moderation_status === "upload_error";

  // 🔹 Card color logic
  const cardClass = isUploadError
    ? "bg-red-100 border-red-700"
    : isUploading
    ? "bg-blue-50 border-blue-600 animate-pulse"
    : isFlagged
    ? "bg-red-50 border-red-700 hover:bg-red-100"
    : isUnderReview
    ? "bg-yellow-50 border-yellow-600 hover:bg-yellow-100"
    : "bg-emerald-50 border-emerald-950 hover:bg-emerald-100";

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-all ${cardClass}`}
    >
      {/* =============================
          POSTER — UPDATED LOGIC HERE
         ============================= */}
      <div className="relative w-20 h-28">
        {isUploading || !posterUrl ? (
          //  Pulsating placeholder icon
          <div className="w-full h-full flex items-center justify-center bg-blue-100 border border-blue-600 rounded-md animate-pulse">
            <FiImage className="text-blue-700" size={28} />
          </div>
        ) : (
          <img
            src={posterUrl}
            alt={film.film_title}
            className="w-full h-full object-cover rounded-md border border-emerald-950"
          />
        )}
      </div>

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

        {/* ❌ Upload error */}
        {isUploadError && (
          <p className="text-sm text-red-800 font-semibold mt-1">
            ❗ Upload failed. Please review the error report.
          </p>
        )}

        {/* Flagged warning */}
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

        {/* Under review */}
        {isUnderReview && (
          <p className="text-sm text-yellow-800 font-semibold mt-1">
            ⏳ This film is being scanned for inappropriate content. It may take
            a couple of minutes before it is visible to the public.
          </p>
        )}

        {/* Uploading state */}
        {isUploading && (
          <p className="text-sm text-blue-700 font-semibold mt-1">
            ⏳ Uploading… please wait. Great things take time :)
          </p>
        )}
      </div>

      {/* Edit / Error Report button */}
      <button
        className={`transition ml-2 ${
          isUploadError
            ? "text-red-700 hover:text-red-500"
            : "text-emerald-950 hover:text-emerald-700"
        }`}
        title={isUploadError ? "Open Error Report" : "Edit"}
        onClick={(e) => {
          e.stopPropagation();
          setOpenEdit(true);
        }}
      >
        <FiEdit3 size={20} />
      </button>

      {/* Edit Modal */}
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
