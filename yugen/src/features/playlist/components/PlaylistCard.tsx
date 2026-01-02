import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../lib/supabaseClient";
import { useAuth } from "../../../contexts/AuthContext";
import { usePlaylistCard } from "../hooks/usePlaylistCard";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import VideocamIcon from "@mui/icons-material/Videocam";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import tempPoster from "../../../YugenAssits/Cover_Placeholder.png";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useToast } from "../../../components/toaster";

const PlaylistCard = ({ playlist, onLocalChange, onLocalDelete }: any) => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const {
    isPublic,
    handleTogglePublic,
    handleDeletePlaylist,
    handleUpdateName,
    isSaved,
    handleToggleSaved,
  } = usePlaylistCard(playlist);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(playlist.playlist_name);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [animatePopup, setAnimatePopup] = useState(false);

  const ownsPlaylist = userInfo?.username === playlist?.creator?.username;

  const posters = (playlist.playlist_films || [])
    .sort((a: any, b: any) => a.film_index - b.film_index)
    .slice(0, 3);
  const toast = useToast();
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".ignore-click")) return;
    if (playlist.playlist_films.length == 0) {
      return toast.warn("This playlist is empty!");
    }
    navigate(
      `/watchplaylist?uuid=${playlist.playlist_films?.[0]?.films?.film_uuid}&list_id=${playlist.playlist_uuid}`,
      { state: { playlist } }
    );
  };

  const handleNameSave = () => {
    handleUpdateName(newName);
    onLocalChange?.(playlist.playlist_uuid, { playlist_name: newName });
    setIsEditingName(false);
  };

  const openConfirmDelete = () => {
    setShowConfirmDelete(true);
    setTimeout(() => setAnimatePopup(true), 10);
  };

  const closeConfirmDelete = () => {
    setAnimatePopup(false);
    setTimeout(() => setShowConfirmDelete(false), 200);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="rounded-xl w-60 bg-emerald-50 border-2 border-emerald-950 shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] mt-2 ml-2"
      >
        {/* Posters */}
        <div className="flex w-full aspect-[6/3] border-b-2 border-emerald-950">
          {posters.length > 0 ? (
            posters.map((pf: any, idx: number) => (
              <div key={idx} className="flex-1 overflow-hidden">
                <img
                  src={
                    pf.films?.poster_path
                      ? supabase.storage
                          .from("posters")
                          .getPublicUrl(pf.films?.poster_path).data.publicUrl +
                        (pf.updated_at
                          ? `?v=${new Date(pf.updated_at).getTime()}`
                          : "")
                      : tempPoster
                  }
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== tempPoster) {
                      img.src = tempPoster;
                    }
                  }}
                  alt={pf.films?.film_title || "Film poster"}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center w-full bg-emerald-100">
              <PlaylistPlayIcon className="text-6xl text-emerald-950" />
            </div>
          )}
          {Array.from({ length: Math.max(0, 3 - posters.length) }).map(
            (_, i) => (
              <div
                key={`empty-${i}`}
                className="flex-1 flex items-center justify-center bg-emerald-100"
              >
                <LocalMoviesIcon className="text-4xl text-emerald-950/70" />
              </div>
            )
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex justify-between items-start">
          <div className="text-left flex flex-col gap-1 max-w-[140px]">
            {/* Playlist name */}
            <div className="flex items-center gap-1 min-w-0">
              <PlaylistPlayIcon fontSize="small" className="shrink-0" />

              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    className="border rounded px-1 py-0.5 text-sm w-36"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNameSave();
                    }}
                    className="text-emerald-950"
                  >
                    <CheckIcon fontSize="small" />
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className="
            block min-w-0
            overflow-hidden whitespace-nowrap text-ellipsis
          "
                    title={playlist.playlist_name}
                  >
                    {playlist.playlist_name}
                  </span>

                  {ownsPlaylist && (
                    <EditIcon
                      className="text-emerald-950 cursor-pointer shrink-0"
                      fontSize="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingName(true);
                      }}
                    />
                  )}
                </>
              )}
            </div>

            {/* Username */}
            <p
              className="
      text-sm text-emerald-950/70
      overflow-hidden whitespace-nowrap text-ellipsis
      cursor-pointer
    "
              title={playlist.creator?.username}
              onClick={(e) => {
                e.stopPropagation();
                navigate(
                  `/@?username=${encodeURIComponent(
                    playlist.creator?.username
                  )}`
                );
              }}
            >
              by @{playlist.creator?.username || ""}
            </p>
          </div>

          <div className="text-center">
            <VideocamIcon className="text-emerald-950" />
            <p className="text-sm text-emerald-950/70">
              {playlist.film_count ?? "N/A"}
            </p>
          </div>
        </div>

        {/* Bottom section */}
        <div className="ignore-click flex items-center justify-between bg-emerald-50 border-t-2 border-emerald-950 h-16 px-3">
          {/* LEFT: Visibility status */}
          <div className="flex items-center gap-2 text-emerald-950">
            {isPublic ? (
              <>
                <VisibilityIcon fontSize="small" />
                <span className="text-xs">Public</span>
              </>
            ) : (
              <>
                <VisibilityOffIcon fontSize="small" />
                <span className="text-xs">Private</span>
              </>
            )}
          </div>

          {/* RIGHT: Actions */}
          {ownsPlaylist ? (
            <div className="flex items-center gap-3">
              {/* Public toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isPublic || false}
                  onChange={handleTogglePublic}
                />
                <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-emerald-950 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-emerald-50 after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
              </label>

              {/* Delete */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openConfirmDelete();
                }}
                className="p-1.5 rounded-full bg-red-300 text-white hover:scale-105 transition"
              >
                <DeleteIcon fontSize="small" />
              </button>
            </div>
          ) : (
            /* SAVE PLAYLIST (not mine) */
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleSaved();
              }}
              className="flex items-center gap-1 text-xs px-3 py-1.5
                 border-2 border-emerald-950 rounded-full
                 hover:bg-emerald-950 hover:text-emerald-50 transition"
            >
              {isSaved ? (
                <>
                  {" "}
                  <BookmarkAddedIcon fontSize="small" /> Unsave{" "}
                </>
              ) : (
                <>
                  {" "}
                  <BookmarkAddIcon fontSize="small" /> Save{" "}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Confirm Delete Popup */}
      {showConfirmDelete && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ease-out
            ${animatePopup ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
        >
          <div
            className="flex flex-col items-center justify-center text-center p-6 rounded-2xl border-4 
            border-emerald-950 bg-emerald-50 shadow-[6px_6px_0_#064e3b] font-freckle w-96"
          >
            <h2 className="text-2xl font-bold mb-2">Confirm Delete</h2>
            <p className="text-lg mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{playlist.playlist_name}</span>?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  handleDeletePlaylist();
                  onLocalDelete?.(playlist.playlist_uuid);
                  closeConfirmDelete();
                }}
                className="bg-red-500 text-white px-5 py-2 rounded-full font-semibold hover:scale-105 transition"
              >
                Delete
              </button>
              <button
                onClick={closeConfirmDelete}
                className="bg-emerald-950 text-emerald-50 px-5 py-2 rounded-full font-semibold hover:scale-105 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlaylistCard;
