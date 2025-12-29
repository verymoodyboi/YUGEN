import * as React from "react";
import PlayListCard from "../features/playlist/components/PlaylistCard";
import NewPlaylist from "../features/playlist/components/new-playlist-form";
import { usePlaylist } from "../features/playlist/hooks/usePlaylist";
import Loading from "../components/loading_kickflip";

const PlaylistsPage: React.FC = () => {
  const [isOpenAdd, setIsOpenAdd] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const {
    myPlaylists,
    savedPlaylists,
    loading,
    savedLoading,
    fetchMyPlaylists,
    fetchMySavedPlaylists,
    handleLocalPlaylistUpdate,
    handleLocalPlaylistDelete,
  } = usePlaylist();

  React.useEffect(() => {
    fetchMyPlaylists();
    fetchMySavedPlaylists();
  }, [fetchMyPlaylists, fetchMySavedPlaylists]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredMyPlaylists = React.useMemo(() => {
    if (!normalizedSearch) return myPlaylists;

    return myPlaylists.filter((p) =>
      p.playlist_name?.toLowerCase().includes(normalizedSearch)
    );
  }, [myPlaylists, normalizedSearch]);

  const filteredSavedPlaylists = React.useMemo(() => {
    if (!normalizedSearch) return savedPlaylists;

    return savedPlaylists.filter((p) =>
      p.playlist_name?.toLowerCase().includes(normalizedSearch)
    );
  }, [savedPlaylists, normalizedSearch]);

  return (
    <>
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <h1 className="text-4xl font-bold border-b-4 border-emerald-950 pb-2">
            My Playlists
          </h1>
          <p className="text-sm text-emerald-900/70 mt-2 sm:mt-0">
            Organize your film library
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="flex items-center gap-2 bg-emerald-900/20 text-emerald-950 
                       px-4 py-2 rounded-lg hover:bg-emerald-900/30 transition"
            onClick={() => setIsOpenAdd(true)}
          >
            + Create a playlist
          </button>

          {/* 🔍 Search */}
          <input
            type="text"
            placeholder="Search playlists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg border border-emerald-900/30
                       focus:outline-none focus:ring-2 focus:ring-emerald-800"
          />
        </div>

        {/* ===================== */}
        {/* My Playlists */}
        {/* ===================== */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-emerald-950">
            My Playlists
          </h2>

          {loading ? (
            <Loading />
          ) : filteredMyPlaylists.length === 0 ? (
            <p className="text-emerald-900">No playlists found.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {filteredMyPlaylists.map((playlist) => (
                <div
                  key={playlist.playlist_uuid}
                  className="snap-start shrink-0"
                >
                  <PlayListCard
                    playlist={playlist}
                    onLocalChange={handleLocalPlaylistUpdate}
                    onLocalDelete={handleLocalPlaylistDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ===================== */}
        {/* Saved Playlists */}
        {/* ===================== */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-emerald-950">
            Saved Playlists
          </h2>

          {savedLoading ? (
            <Loading />
          ) : filteredSavedPlaylists.length === 0 ? (
            <p className="text-emerald-900/70">
              {searchTerm
                ? "No saved playlists match your search."
                : "You haven’t saved any playlists yet."}
            </p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {filteredSavedPlaylists.map((playlist) => (
                <div
                  key={playlist.playlist_uuid}
                  className="snap-start shrink-0"
                >
                  <PlayListCard playlist={playlist} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create Playlist Modal */}
      {isOpenAdd && (
        <NewPlaylist
          isOpen={isOpenAdd}
          onClose={() => setIsOpenAdd(false)}
          onCreated={fetchMyPlaylists}
        />
      )}
    </>
  );
};

export default PlaylistsPage;
