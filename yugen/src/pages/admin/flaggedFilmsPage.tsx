import React from "react";
import AppLayout from "../../layouts/layout-main";
import { useFlaggedFilms } from "../../features/admin/flagged_films/useFlaggedFilms";
import CustomLoading from "../../SmallComponents/CutomsLoading";
import { FiAlertCircle, FiTrash2, FiRotateCcw } from "react-icons/fi";
import supabase from "../../lib/supabaseClient";
import tempPoster from "../../YugenAssits/Cover_Placeholder.png";
import Loading from "../../components/loading_kickflip";

const FlaggedFilmsPage: React.FC = () => {
  const {
    flaggedFilms,
    isLoading,
    isError,
    recoverFilm,
    deleteFilm,
    isRecovering,
    isDeleting,
  } = useFlaggedFilms();

  return (
    <>
      <div className="min-h-screen  text-emerald-950 font-freckle p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiAlertCircle /> Flagged Films
          </h1>
        </div>

        {isLoading ? (
          <Loading />
        ) : isError ? (
          <p className="text-red-600">Failed to load flagged films.</p>
        ) : flaggedFilms.length === 0 ? (
          <p className="text-emerald-900">No flagged films at the moment :)</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flaggedFilms.map((item) => {
              const film = item.films;

              return (
                <div
                  key={item.film_uuid}
                  className="bg-emerald-100 border-4 border-emerald-950 rounded-xl p-4 flex flex-col justify-between hover:-translate-y-[2px] transition-transform"
                >
                  <div>
                    <img
                      src={
                        film?.poster_path
                          ? `https://posters.try-yugen.com/${film?.poster_path}`
                          : tempPoster
                      }
                      alt={film?.film_title || "Film Cover"}
                      className="w-150 h-100 object-cover rounded-lg border-2 border-emerald-950"
                    />
                    <h2 className="text-xl font-semibold mt-3">
                      {film?.film_title || "Untitled Film"}
                    </h2>
                    <p className="text-xs mt-2 opacity-70">
                      by @{film?.uploader?.username || "Untitled Film"}
                    </p>
                    <p className="text-xs opacity-70">
                      Flagged: {new Date(item.flagged_at).toLocaleString()}
                    </p>
                    <p className="text-xs mt-2 opacity-70">
                      Reason: {item.reason || "Unknown"}
                    </p>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => recoverFilm(item.film_uuid)}
                      disabled={isRecovering}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border-2 border-emerald-950 bg-emerald-900 text-emerald-50 hover:scale-[1.03] transition disabled:opacity-50"
                    >
                      <FiRotateCcw />{" "}
                      {isRecovering ? "Recovering..." : "Recover"}
                    </button>

                    <button
                      onClick={() => deleteFilm(item.film_uuid)}
                      disabled={isDeleting}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border-2 border-red-900 bg-red-900 text-emerald-50 hover:scale-[1.03] transition disabled:opacity-50"
                    >
                      <FiTrash2 /> {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default FlaggedFilmsPage;
