// src/pages/WatchPlaylist.tsx
import * as React from "react";
import { useSearchParams } from "react-router-dom";
import Film from "../features/stream/components/film";
import { useAddHistory } from "../features/history/useHistory";
import AppLayout from "../layouts/layout-main";
import PlaylistSection from "../features/playlist/components/playlist";
import Thoughts from "../features/thoughts/components/thoughts";

const WatchPlaylist: React.FC = () => {
  const [searchParams] = useSearchParams();

  const uuid = searchParams.get("uuid");
  const playlistId =
    searchParams.get("list_id") ||
    searchParams.get("playlist_id") ||
    searchParams.get("playlist") ||
    null;

  console.log(" WatchPlaylist params:", { uuid, playlistId });

  const [activeTab, setActiveTab] = React.useState<"thoughts" | "playlist">(
    "thoughts"
  );

  useAddHistory(uuid || undefined);
  const [nextFilmTrigger, setNextFilmTrigger] = React.useState(0);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-4 bg-emerald-50 min-h-screen text-emerald-950 font-freckle">
        {uuid ? (
          <>
            {/* Film */}
            <Film filmId={uuid} />

            {/* Vintage Tabs */}
            <div className="flex gap-3 mt-6">
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
                className={`px-4 py-2 rounded-full border-2 font-bold shadow transition transform hover:-translate-y-[1px] ${
                  activeTab === "playlist"
                    ? "bg-emerald-950 text-emerald-50 border-emerald-50"
                    : "bg-emerald-50 text-emerald-950 border-emerald-950 hover:bg-emerald-100"
                }`}
              >
                Playlist
              </button>
            </div>

            {/* Tab content */}
            <div className="mt-4">
              {activeTab === "thoughts" ? (
                <Thoughts filmId={uuid} />
              ) : playlistId ? (
                <PlaylistSection
                  playlistId={playlistId}
                  currentFilmId={uuid}
                  nextFilmTrigger={nextFilmTrigger} // 🔹 Pass trigger to playlist
                />
              ) : (
                <div className="text-center py-10 border-2 border-emerald-950 bg-emerald-50 rounded-3xl shadow-lg">
                  <p className="text-emerald-950 text-xl font-freckle">
                    No playlist selected 💿
                  </p>
                  <p className="text-emerald-950/70 text-sm">
                    Try reloading or navigating from a playlist.
                  </p>
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
    </AppLayout>
  );
};

export default WatchPlaylist;
