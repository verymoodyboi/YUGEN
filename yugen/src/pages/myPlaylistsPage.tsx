import * as React from "react";
import PlayListCard from "../features/playlist/components/PlaylistCard";
import AppLayout from "../layouts/layout-main";
import NewPlaylist from "../features/playlist/components/new-playlist-form";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../contexts/AuthContext";
import { usePlaylist } from "../features/playlist/hooks/usePlaylist";
import Loading from "../components/loading_kickflip";
const PlaylistsPage: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [isOpenAdd, setIsOpenAdd] = React.useState(false);

  const {
    myPlaylists,
    loading,
    fetchMyPlaylists,
    handleLocalPlaylistUpdate,
    handleLocalPlaylistDelete,
  } = usePlaylist(getAccessToken);

  React.useEffect(() => {
    fetchMyPlaylists();
  }, [fetchMyPlaylists]);

  return (
    <>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <h1 className="text-4xl font-bold border-b-4 border-emerald-950  pb-2">
            My Playlists
          </h1>
          <p className="text-sm text-emerald-900/70  mt-2 sm:mt-0">
            Organize your film library
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-emerald-900/20 text-emerald-950 
                     px-4 py-2 rounded-lg hover:bg-emerald-900/30 transition"
          onClick={() => setIsOpenAdd(true)}
        >
          Create a playlist
        </button>

        {loading ? (
          <Loading />
        ) : myPlaylists.length === 0 ? (
          <p className="text-emerald-900 ">No playlists yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {myPlaylists.map((playlist) => (
              <PlayListCard
                key={playlist.playlist_uuid}
                playlist={playlist}
                onLocalChange={handleLocalPlaylistUpdate}
                onLocalDelete={handleLocalPlaylistDelete}
              />
            ))}
          </div>
        )}
      </div>

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
