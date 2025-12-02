import * as React from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { createPortal } from "react-dom";
import { logFilmClick } from "../features/stream/services/filmCardServices";
import { useFilm } from "../features/stream/hooks/useFilmCard";
import { startScroll, resetScroll } from "../features/stream/util/textScroll";
import { Film } from "../features/stream/types/film";
import EditFilm from "../features/editFilm/components/EditFilm";

// Icons
import { FiEdit, FiEye, FiStar } from "react-icons/fi";
import { BsBookmarkPlus, BsBookmarkCheck } from "react-icons/bs";
import { LuBookOpen } from "react-icons/lu";

interface FilmCardProps {
  film: Film;
}

const FilmCard: React.FC<FilmCardProps> = ({ film }) => {
  const { userInfo, getAccessToken } = useAuth();
  const { watchlisted, handleToggleWatchlist } = useFilm(film.film_uuid);
  const [openThesis, setOpenThesis] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openRating, setOpenRating] = React.useState(false);
  const navigate = useNavigate();

  const titleContainerRef = React.useRef<HTMLDivElement | null>(null);
  const titleTextRef = React.useRef<HTMLSpanElement | null>(null);
  const genreContainerRef = React.useRef<HTMLDivElement | null>(null);
  const genreTextRef = React.useRef<HTMLSpanElement | null>(null);

  const handleCardClick = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("button") && !target.closest(".modal")) {
      try {
        const token = await getAccessToken();
        await logFilmClick(film.film_uuid, token);
        navigate(`/watch?uuid=${encodeURIComponent(film.film_uuid)}`);
      } catch {
        navigate(`/watch?uuid=${encodeURIComponent(film.film_uuid)}`);
      }
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() =>
        startScroll(
          titleTextRef.current,
          titleContainerRef.current,
          genreTextRef.current,
          genreContainerRef.current
        )
      }
      onMouseLeave={() =>
        resetScroll(titleTextRef.current, genreTextRef.current)
      }
      className="relative flex flex-col rounded-xl overflow-hidden aspect-[2/3] w-36 h-70
             bg-emerald-50 border-2 border-emerald-950 shadow-md cursor-pointer mt-2
             transition-transform duration-300 hover:scale-105 "
    >
      {/* Poster */}
      <img
        src={
          supabase.storage.from("posters").getPublicUrl(film.poster_path).data
            .publicUrl +
          (film.updated_at ? `?v=${new Date(film.updated_at).getTime()}` : "")
        }
        alt="Film thumbnail"
        className="w-full aspect-[2/3] object-cover border-b-2 border-emerald-950"
      />

      {/* Watchlist Icon */}
      <button
        className="absolute top-1 left-1 text-emerald-950 bg-emerald-50 rounded-full p-1 border border-emerald-950 
                   hover:bg-emerald-100 hover:scale-110 transition"
        onClick={(e) => {
          e.stopPropagation();
          handleToggleWatchlist();
        }}
      >
        {watchlisted ? (
          <BsBookmarkCheck size={18} />
        ) : (
          <BsBookmarkPlus size={18} />
        )}
      </button>

      {/* Edit Icon */}
      {userInfo?.auth_id === film.uploader_id && (
        <button
          className="absolute top-1 right-1 text-emerald-950 bg-emerald-50 rounded-full p-1 border border-emerald-950 
                     hover:bg-emerald-100 hover:scale-110 transition"
          onClick={(e) => {
            e.stopPropagation();
            setOpenEdit(true);
          }}
        >
          <FiEdit size={16} />
        </button>
      )}

      {/* Info Section */}
      <div className="flex justify-between items-start px-1 py-1 text-xs text-emerald-950">
        <div className="max-w-[80px]">
          <div
            ref={titleContainerRef}
            className="overflow-hidden whitespace-nowrap"
          >
            <span
              ref={titleTextRef}
              className="inline-block font-freckle font-semibold"
            >
              {film.film_title}
            </span>
          </div>
          <div
            ref={genreContainerRef}
            className="overflow-hidden whitespace-nowrap"
          >
            <span
              ref={genreTextRef}
              className="inline-block font-freckle text-sm"
            >
              {(() => {
                try {
                  // If it's a JSON string, parse it
                  const parsed =
                    typeof film.film_genre === "string"
                      ? JSON.parse(film.film_genre)
                      : film.film_genre;

                  // If it's now an array, join it
                  return Array.isArray(parsed)
                    ? parsed.join(", ")
                    : parsed || "No genre";
                } catch {
                  // fallback if parsing fails
                  return film.film_genre || "No genre";
                }
              })()}
            </span>
          </div>
        </div>

        {/* Views */}
        <div className="flex flex-col items-center text-emerald-950">
          <FiEye size={14} />
          <span className="text-[11px]">{film.view_count || 0}</span>
        </div>

        {/* Rating */}
        <div className="flex flex-col items-center text-emerald-950">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenRating(true);
            }}
          >
            <FiStar size={14} />
          </button>
          <span className="text-[11px]">{film.avg_rating ?? 0}</span>
        </div>
      </div>

      {/* Thesis Button */}
      <div className="flex justify-center bg-emerald-950 py-1 hover:bg-emerald-900 transition-colors">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenThesis(true);
          }}
          className="text-emerald-50 hover:scale-110 transition-transform"
        >
          <LuBookOpen size={16} />
        </button>
      </div>

      {/* Thesis Modal */}
      {openThesis &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div
              className="bg-emerald-50 border-2 border-emerald-950 rounded-lg p-3 max-w-sm shadow-xl text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-freckle text-emerald-950">Thesis</h2>
              <p className="text-emerald-950">{film?.thesis}</p>
              <button
                onClick={() => setOpenThesis(false)}
                className="mt-2 px-3 py-1 border border-emerald-950 text-emerald-950 rounded hover:bg-emerald-100 transition"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}

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

export default FilmCard;