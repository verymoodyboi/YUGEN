import React from "react";
import { FiUploadCloud, FiCheck, FiX } from "react-icons/fi";
import { usePendingUploads } from "../../features/admin/QA/useQA";
import CustomLoading from "../../SmallComponents/CutomsLoading";
import tempPoster from "../../YugenAssits/Cover_Placeholder.png";
import Loading from "../../components/loading_kickflip";

const statusStyles = {
  queued: {
    card: "bg-yellow-100 border-yellow-900",
    badge: "bg-yellow-900 text-yellow-50",
    label: "Queued",
  },
  quality_control: {
    card: "bg-blue-100 border-blue-900",
    badge: "bg-blue-900 text-blue-50",
    label: "Quality Control",
  },
};

const ManageUploadsPage: React.FC = () => {
  const {
    pendingUploads,
    isLoading,
    isError,
    acceptUpload,
    rejectUpload,
    isAccepting,
    isRejecting,
  } = usePendingUploads();

  return (
    <div className="min-h-screen  text-emerald-950 font-freckle p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <FiUploadCloud /> Pending Uploads
      </h1>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <p className="text-red-600">Failed to load pending uploads.</p>
      ) : pendingUploads.length === 0 ? (
        <p className="text-emerald-900">No pending uploads</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingUploads.map((item) => {
            const film = item.films;
            const status = statusStyles[item.moderation_status];

            return (
              <div
                key={item.film_uuid}
                className={`border-4 rounded-xl p-4 flex flex-col justify-between hover:-translate-y-[2px] transition-transform ${status.card}`}
              >
                <div>
                  <img
                    src={
                      film?.poster_path
                        ? `https://posters.try-yugen.com/${film.poster_path}`
                        : tempPoster
                    }
                    alt={film?.title || "Film Cover"}
                    className="w-150 h-100 object-cover rounded-lg border-2 border-emerald-950"
                  />

                  <h2 className="text-xl font-semibold mt-3">
                    {film?.title || "Untitled Film"}
                  </h2>

                  <p className="text-xs mt-2 opacity-70">
                    by @{film?.uploader?.username || "unknown"}
                  </p>

                  <p className="text-xs opacity-70">
                    Uploaded: {new Date(item.uploaded_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <span
                    className={`self-start px-4 py-1 rounded-full text-xs font-bold border-2 border-emerald-950 ${status.badge}`}
                  >
                    {status.label}
                  </span>

                  <div className="flex gap-3">
                    <button
                      onClick={() => acceptUpload(item.film_uuid)}
                      disabled={isAccepting}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border-2 border-emerald-950 bg-emerald-900 text-emerald-50 hover:scale-[1.03] transition disabled:opacity-50"
                    >
                      <FiCheck />
                      {isAccepting ? "Accepting..." : "Accept"}
                    </button>

                    <button
                      onClick={() => rejectUpload(item.film_uuid)}
                      disabled={isRejecting}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border-2 border-red-900 bg-red-900 text-emerald-50 hover:scale-[1.03] transition disabled:opacity-50"
                    >
                      <FiX />
                      {isRejecting ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageUploadsPage;
