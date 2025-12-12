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

const PlaylistCard = ({ playlist, onLocalChange, onLocalDelete }: any) => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const {
    isPublic,
    handleTogglePublic,
    handleDeletePlaylist,
    handleUpdateName,
  } = usePlaylistCard(playlist);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(playlist.playlist_name);

  const ownsPlaylist = userInfo?.username === playlist?.creator?.username;

  const posters = (playlist.playlist_films || [])
    .sort((a: any, b: any) => a.film_index - b.film_index)
    .slice(0, 3);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".ignore-click")) return;

    navigate(
      `/watchplaylist?uuid=${playlist.playlist_films?.[0]?.films?.film_uuid}&list_id=${playlist.playlist_uuid}`,
      { state: { playlist } }
    );
  };

  const handleNameSave = () => {
    handleUpdateName(newName);
    onLocalChange?.(playlist.playlist_uuid, { playlist_name: newName }); // local UI update
    setIsEditingName(false);
  };

  return (
    <div
      onClick={handleCardClick}
      className="rounded-xl w-60 bg-emerald-50 border-2 border-emerald-950 shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
    >
      {/* Posters */}
      <div className="flex w-full aspect-[6/3] border-b-2 border-emerald-950">
        {posters.length > 0 ? (
          posters.map((pf: any, idx: number) => (
            <div key={idx} className="flex-1 overflow-hidden">
              <img
                src={
                  pf.films?.poster_path
                    ? `${
                        supabase.storage
                          .from("posters")
                          .getPublicUrl(pf.films.poster_path).data.publicUrl
                      }?v=${Date.now()}`
                    : "/placeholder.png"
                }
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
        {Array.from({ length: Math.max(0, 3 - posters.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex-1 flex items-center justify-center bg-emerald-100"
          >
            <LocalMoviesIcon className="text-4xl text-emerald-950/70" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 flex justify-between items-start">
        <div className="text-left flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <PlaylistPlayIcon fontSize="small" />
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
                <span>{playlist.playlist_name}</span>
                {ownsPlaylist && (
                  <EditIcon
                    className="text-emerald-950 cursor-pointer"
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
          <p className="text-sm text-emerald-950/70">
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
      {ownsPlaylist && (
        <div className="ignore-click flex flex-col items-center justify-center bg-emerald-50 border-t-2 border-emerald-950 h-20 gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isPublic || false}
              onChange={handleTogglePublic}
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-emerald-950 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-emerald-50 after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
          </label>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePlaylist();
              onLocalDelete?.(playlist.playlist_uuid);
            }}
            className="p-2 rounded-full border-2 bg-red-600 text-white hover:scale-105 transition flex items-center gap-1"
          >
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PlaylistCard;
