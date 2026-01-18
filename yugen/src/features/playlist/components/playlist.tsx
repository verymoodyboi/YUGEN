import React from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiShuffle, FiPlay } from "react-icons/fi";
import { useAuth } from "../../../contexts/AuthContext";
import { usePlaylist } from "../hooks/useWatchPlaylist";
import PlaylistItem from "./playlistFilmCard";

const PlaylistSection = ({
  playlistId,
  currentFilmId,
}: {
  playlistId?: string | null;
  currentFilmId?: string | null;
}) => {
  const { getAccessToken } = useAuth();
  const navigate = useNavigate();

  const { playlist, films, loading, shuffle, toggleShuffle, getNext } =
    usePlaylist(playlistId, currentFilmId, getAccessToken);

  const handleNextFilm = () => {
    const nextFilm = getNext();
    if (nextFilm?.film_uuid)
      navigate(
        `/watchplaylist?uuid=${nextFilm.film_uuid}&playlist=${playlistId}`,
      );
  };
  const handleShufflePlay = () => {
    if (!films.length) return;

    if (films.length === 1) {
      const onlyFilm = films[0]?.films?.film_uuid;
      if (onlyFilm)
        navigate(`/watchplaylist?uuid=${onlyFilm}&playlist=${playlistId}`);
      return;
    }

    let pickedFilm;
    let safety = 0;

    do {
      const randomIndex = Math.floor(Math.random() * films.length);
      pickedFilm = films[randomIndex]?.films?.film_uuid;
      safety++;
    } while (pickedFilm === currentFilmId && safety < 10);

    if (pickedFilm) {
      navigate(`/watchplaylist?uuid=${pickedFilm}&playlist=${playlistId}`);
    }
  };

  if (loading)
    return (
      <div className="text-emerald-950 font-freckle animate-pulse">
        Loading playlist...
      </div>
    );

  if (!playlist)
    return (
      <div className="text-emerald-950 font-freckle">
        Playlist not found or failed to load.
      </div>
    );

  return (
    <div className="w-full max-w-3xl mx-auto border-4 border-emerald-950 rounded-xl bg-emerald-50 p-4 mt-6 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-2xl font-freckle text-emerald-950">
            🎞 {playlist.playlist_name || "Untitled Playlist"}
          </h2>
          <p className="text-emerald-950/80 text-sm">
            by{" "}
            <span className="underline cursor-pointer hover:text-emerald-800">
              @{playlist.users?.username || "unknown"}
            </span>{" "}
            • {playlist.film_count ?? films.length} films
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShufflePlay}
            className="
    flex items-center gap-2 px-4 py-2
    border-2 border-emerald-950 rounded-full
    bg-emerald-950 text-emerald-50
    font-freckle text-sm
    hover:scale-105 transition-transform
  "
          >
            <FiShuffle /> Shuffle
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
        {films.length > 0 ? (
          films.map((pf, i) => {
            const isActive = pf.films?.film_uuid === currentFilmId;
            return (
              <PlaylistItem
                key={pf.films?.film_uuid || i}
                pf={pf}
                selected={!!isActive}
                onClick={() =>
                  navigate(
                    `/watchplaylist?uuid=${pf.films.film_uuid}&playlist=${playlistId}`,
                  )
                }
              />
            );
          })
        ) : (
          <p className="text-emerald-950 text-center">
            No films in this playlist.
          </p>
        )}
      </div>
    </div>
  );
};

export default PlaylistSection;
