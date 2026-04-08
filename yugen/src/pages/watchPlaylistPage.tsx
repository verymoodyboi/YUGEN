// src/pages/WatchPlaylist.tsx
import * as React from "react";
import { useSearchParams } from "react-router-dom";
import Film from "../features/stream/components/film";
import { useAddHistory } from "../features/history/useHistory";
import PlaylistSection from "../features/playlist/components/playlist";
import Thoughts from "../features/thoughts/components/thoughts";
import { useSimilarFilms } from "../features/recommendations/hooks/useSimilarFilms";
import SimilarFilmCard from "../features/recommendations/components/recommendedFilmCard";
import Loading from "../components/loading_kickflip";
import AuthActionGuard from "../components/clickWrapper";

const WatchPlaylist: React.FC = () => {
  const [searchParams] = useSearchParams();

  const uuid = searchParams.get("uuid");
  const { films: similarFilms, isLoading } = useSimilarFilms(uuid || undefined);

  const playlistId =
    searchParams.get("list_id") ||
    searchParams.get("playlist_id") ||
    searchParams.get("playlist") ||
    null;

  //console.log(" WatchPlaylist params:", { uuid, playlistId });

  const [activeTab, setActiveTab] = React.useState<
    "thoughts" | "playlist" | "recommended"
  >("thoughts");

  useAddHistory(uuid || undefined);
  const [nextFilmTrigger, setNextFilmTrigger] = React.useState(0);

  return (
    <>
      <div className="flex flex-col gap-6 p-4  min-h-screen text-emerald-950 font-freckle">
        {uuid ? (
          <>
            {/* Film */}
            <Film filmId={uuid} />

            {/* Vintage Tabs */}
            <div className="flex gap-1 mt-6">
              <button
                onClick={() => setActiveTab("thoughts")}
                className={`px-4 py-2 rounded-full border-2 font-bold shadow transition transform hover:-translate-y-[1px] ${
                  activeTab === "thoughts"
                    ? "bg-emerald-950 text-emerald-50 border-emerald-50"
                    : "bg-emerald-50 text-emerald-950 border-emerald-950 hover:bg-emerald-100"
                }`}
              >
                Thoughts
              </button>

              <button
                onClick={() => setActiveTab("playlist")}
                className={`px-2 py-2 rounded-full border-2 font-bold shadow transition transform hover:-translate-y-[1px] ${
                  activeTab === "playlist"
                    ? "bg-emerald-950 text-emerald-50 border-emerald-50"
                    : "bg-emerald-50 text-emerald-950 border-emerald-950 hover:bg-emerald-100"
                }`}
              >
                Playlist
              </button>
              <button
                onClick={() => setActiveTab("recommended")}
                className={`px-4 py-2 rounded-full border-2 font-bold shadow transition transform hover:-translate-y-[1px] ${
                  activeTab === "recommended"
                    ? "bg-emerald-950 text-emerald-50 border-emerald-50"
                    : "bg-emerald-50 text-emerald-950 border-emerald-950 hover:bg-emerald-100"
                }`}
              >
                recommended
              </button>
            </div>

            {/* Tab content */}
            <div className="mt-4">
              {activeTab === "thoughts" ? (
                <AuthActionGuard>
                  <Thoughts filmId={uuid} />
                </AuthActionGuard>
              ) : activeTab === "playlist" ? (
                <PlaylistSection
                  playlistId={playlistId}
                  currentFilmId={uuid}
                  nextFilmTrigger={nextFilmTrigger}
                />
              ) : (
                <div className="space-y-4">
                  {isLoading ? (
                    <Loading />
                  ) : similarFilms.length > 0 ? (
                    similarFilms.map((film) => (
                      <SimilarFilmCard key={film.film_uuid} film={film} />
                    ))
                  ) : (
                    <p className="text-emerald-900 font-freckle text-lg">
                      No similar films found yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-emerald-950 text-xl font-freckle">
            No film selected
          </p>
        )}
      </div>
    </>
  );
};

export default WatchPlaylist;
