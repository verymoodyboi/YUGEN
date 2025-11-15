import * as React from "react";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import AddIcon from "@mui/icons-material/Add";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import { usePlaylist } from "../hooks/usePlaylist";

interface NewPlaylistProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const NewPlaylist: React.FC<NewPlaylistProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [playlistName, setPlaylistName] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(false);
  const { getAccessToken } = useAuth();
  const { creating, handleCreatePlaylist } = usePlaylist();

  const handleSubmit = async () => {
    if (!playlistName.trim()) {
      toast.warn("Please name the playlist.");
      return;
    }
    try {
      const token = await getAccessToken();
      const success = await handleCreatePlaylist(playlistName, isPublic, token);
      if (success) {
        toast.success("Playlist created!");
        setPlaylistName("");
        setIsPublic(false);
        onClose();
        onCreated?.();
      } else {
        toast.error("Failed to create playlist");
      }
    } catch {
      toast.error("Failed to create playlist");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-emerald-950/30">
        <div
          className="bg-emerald-50 border-2 border-emerald-950 rounded-xl shadow-lg p-6 w-[90%] max-w-md text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <PlaylistPlayIcon
            className="text-emerald-950 mx-auto"
            style={{ fontSize: 80 }}
          />
          <h3 className="font-freckle text-xl text-emerald-950 mb-4">
            Create Playlist
          </h3>

          <input
            type="text"
            placeholder="Playlist name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 text-emerald-950 px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-950"
          />

          <div className="flex items-center justify-center gap-2 mb-4">
            <label className="text-emerald-950 font-freckle">Public</label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 accent-emerald-950"
            />
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={creating}
              className="px-4 py-2 rounded-lg bg-emerald-950 text-emerald-50 hover:bg-emerald-900 transition flex items-center gap-2"
            >
              <AddIcon fontSize="small" /> {creating ? "Creating..." : "Done"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-950 border-2 border-emerald-950 hover:bg-emerald-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default NewPlaylist;
