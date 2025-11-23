import * as React from "react";
import PlayListCard from "../features/playlist/components/PlaylistCard";
import AppLayout from "../layouts/layout-main";
import NewPlaylist from "../features/playlist/components/new-playlist-form";
import { useAuth } from "../contexts/AuthContext";
import { usePlaylist } from "../features/playlist/hooks/usePlaylist";
import Loading from "../components/loading_kickflip";
const PlaylistsPage: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [isOpenAdd, setIsOpenAdd] = React.useState(false);

  const { myPlaylists, loading, fetchMyPlaylists } =
    usePlaylist(getAccessToken);

  React.useEffect(() => {
    fetchMyPlaylists();
  }, [fetchMyPlaylists]);

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        <h2 className="font-freckle text-2xl text-emerald-950 dark:text-emerald-50">
          My Playlists
        </h2>

        <button
          className="flex items-center gap-2 bg-emerald-900/20 dark:bg-emerald-50/20 text-emerald-950 dark:text-emerald-50 
                     px-4 py-2 rounded-lg hover:bg-emerald-900/30 dark:hover:bg-emerald-50/30 transition"
          onClick={() => setIsOpenAdd(true)}
        >
          Create a playlist
        </button>

        {loading ? (
          <Loading />
        ) : myPlaylists.length === 0 ? (
          <p className="text-emerald-900 dark:text-emerald-50">
            No playlists yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {myPlaylists.map((playlist) => (
              <PlayListCard key={playlist.playlist_uuid} playlist={playlist} />
            ))}
          </div>
        )}
      </div>

      {isOpenAdd && (
        <NewPlaylist
          isOpen={isOpenAdd}
          onClose={() => setIsOpenAdd(false)}
          onCreated={fetchMyPlaylists} // optional, handled inside hook already
        />
      )}
    </AppLayout>
  );
};

export default PlaylistsPage;
