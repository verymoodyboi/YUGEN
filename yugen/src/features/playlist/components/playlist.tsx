// src/features/playlist/components/PlaylistSection.tsx
import React from "react";
import supabase from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { usePlaylist } from "../hooks/useWatchPlaylist";
import { FiEye, FiStar, FiShuffle, FiPlay } from "react-icons/fi";

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
        `/watchplaylist?uuid=${nextFilm.film_uuid}&playlist=${playlistId}`
      );
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
      {/* Header */}
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
            onClick={toggleShuffle}
            className={`flex items-center gap-2 px-3 py-2 border-2 rounded-full font-freckle text-sm transition-transform hover:scale-105 ${
              shuffle
                ? "bg-emerald-950 text-emerald-50 border-emerald-950"
                : "bg-emerald-50 text-emerald-950 border-emerald-950"
            }`}
          >
            <FiShuffle /> {shuffle ? "Shuffle On" : "Shuffle Off"}
          </button>

          <button
            onClick={handleNextFilm}
            className="flex items-center gap-2 px-3 py-2 border-2 border-emerald-950 rounded-full bg-emerald-950 text-emerald-50 font-freckle hover:scale-105 transition-transform"
          >
            <FiPlay /> Play Next
          </button>
        </div>
      </div>

      {/* Films List */}
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
        {films.length > 0 ? (
          films.map((pf, i) => {
            const film = pf.films || pf;
            const posterUrl =
              supabase.storage.from("posters").getPublicUrl(film.poster_path)
                .data.publicUrl || "/placeholder.jpg";
            const isActive = film.film_uuid === currentFilmId;

            return (
              <div
                key={film.film_uuid || i}
                onClick={() =>
                  navigate(
                    `/watchplaylist?uuid=${film.film_uuid}&playlist=${playlistId}`
                  )
                }
                className={`p-4 border-2 border-emerald-950 rounded-lg bg-emerald-50 text-emerald-950 cursor-pointer transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#064e3b] ${
                  isActive ? "bg-emerald-100" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={posterUrl}
                    alt={film.film_title}
                    className="w-20 h-28 object-cover rounded-md border border-emerald-950"
                  />
                  <div className="flex-1">
                    <h3 className="font-freckle text-xl">{film.film_title}</h3>
                    <p className="text-sm text-emerald-950/70">
                      {film.film_genre || "No genre"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end text-sm text-emerald-950">
                    <div className="flex items-center gap-1">
                      <FiEye size={16} /> {film.view_count ?? 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <FiStar size={16} /> {film.avg_rating ?? "N/A"}
                    </div>
                  </div>
                </div>
              </div>
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
