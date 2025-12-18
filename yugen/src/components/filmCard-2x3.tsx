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
import BookMarkIcon from "../YugenAssits/fn_icons/Bookmark not added.svg";
import BookMarkIconheck from "../YugenAssits/fn_icons/Bookmark added.svg";
import Edit_icon from "../YugenAssits/fn_icons/Edit_Film.svg";
// Icons
import { FiEdit, FiEye, FiStar } from "react-icons/fi";
import { BsBookmarkPlus, BsBookmarkCheck } from "react-icons/bs";
import { LuBookOpen } from "react-icons/lu";
import { Tooltip } from "@mui/material";

interface FilmCardProps {
  film: Film;
}

const FilmCard: React.FC<FilmCardProps> = ({ film }) => {
  const { userInfo, getAccessToken } = useAuth();
  const { watchlisted, handleToggleWatchlist, uploader } = useFilm(
    film.film_uuid,
    film.uploader_id
  );
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
      className="relative flex flex-col rounded-xl overflow-hidden aspect-[2/3] w-46 h-90
             bg-emerald-50 border-2 border-emerald-950 shadow-md  mt-2
             transition-transform duration-300 hover:scale-105 mb-3 mt-3 ml-3 mr-1"
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
      {/* Watchlist Icon */}
      <Tooltip title="Watchlist">
        <button
          className="absolute top-1 left-1 p-1 cursor-pointer hover:scale-110 transition"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleWatchlist();
          }}
        >
          <span className=" rounded-full p-[4px] flex items-center justify-center">
            {watchlisted ? (
              <img
                src={BookMarkIconheck}
                alt="Bookmarked"
                className="w-[18px] h-[18px]"
              />
            ) : (
              <img
                src={BookMarkIcon}
                alt="Add to bookmarks"
                className="w-[18px] h-[18px]"
              />
            )}
          </span>
        </button>
      </Tooltip>
      {/* Edit Icon */}
      {userInfo?.auth_id === film.uploader_id && (
        <Tooltip title="Edit">
          <button
            className="absolute top-1 right-1 p-1 cursor-pointer hover:scale-110 transition"
            onClick={(e) => {
              e.stopPropagation();
              setOpenEdit(true);
            }}
          >
            <span className="rounded-full p-[4px] flex items-center justify-center">
              <img src={Edit_icon} alt="Edited" className="w-[18px] h-[18px]" />{" "}
            </span>
          </button>
        </Tooltip>
      )}

      {/* Info Section */}
      <div className="flex justify-between items-start px-1 py-0.5  text-emerald-950">
        <div className="w-[130px] max-w-[130px] ">
          <div
            ref={titleContainerRef}
            className="overflow-hidden whitespace-nowrap "
          >
            <span
              ref={titleTextRef}
              className="inline-block font-freckle font-semibold text-md"
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
              className="inline-block font-freckle text-sm text-emerald-950/70"
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
        <Tooltip title="Thesis">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenThesis(true);
            }}
            className="hover:scale-110 transition-transform flex flex-col items-center text-emerald-950/70 cursor-pointer"
          >
            <LuBookOpen size={25} />
          </button>
        </Tooltip>
      </div>

      {/* footer */}
      <div className="flex justify-center items-center bg-emerald-950 py-1 h-14 hover:bg-emerald-900 transition-colors gap-6 text-emerald-50">
        <div
          className="hover:scale-105 flex items-center gap-1 w-[50%] cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/@?username=${encodeURIComponent(uploader?.username)}`);
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
              alt="User avatar"
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-emerald-700" />
          )}

          <span className="text-[11px]">
            {uploader.username && uploader.username.length > 9
              ? `${uploader.username.slice(0, 9)}...`
              : uploader.username}
          </span>
        </div>

        {/* Views */}
        <Tooltip title="Views">
          <div className="flex flex-col items-center">
            <FiEye size={14} />
            <span className="text-[11px]">{film.view_count || 0}</span>
          </div>
        </Tooltip>

        <Tooltip title="Rating">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenRating(true);
            }}
            className="flex flex-col items-center"
          >
            <FiStar size={14} />
            <span className="text-[11px]">{film.avg_rating ?? 0}</span>
          </button>
        </Tooltip>
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
