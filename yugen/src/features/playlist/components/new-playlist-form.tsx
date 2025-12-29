import * as React from "react";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../../../contexts/AuthContext";
import { usePlaylist } from "../hooks/usePlaylist";
import { useToast } from "../../../components/toaster";

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
  const toast = useToast();
  const [playlistName, setPlaylistName] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(false);

  const { getAccessToken } = useAuth();
  const { creating, handleCreatePlaylist } = usePlaylist();

  // 🔥 Animation / close handling
  const [visible, setVisible] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Trigger animation when opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
    }
  }, [isOpen]);

  //  Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setVisible(false);
        setTimeout(() => onClose(), 200);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, isOpen]);

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

        // close with animation
        setVisible(false);
        setTimeout(() => {
          onClose();
          onCreated?.();
        }, 200);
      } else {
        toast.error("Failed to create playlist");
      }
    } catch {
      toast.error("Failed to create playlist");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`
          flex flex-col gap-4 p-6 rounded-2xl border-4 border-emerald-950 bg-emerald-50 
          shadow-[6px_6px_0_#064e3b] transform transition-all duration-300 ease-out
          ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}
      >
        <button
          onClick={(e) => {
            setVisible(false);
            setTimeout(() => onClose(), 200);
          }}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-emerald-950 font-bold text-[23px] rounded-full bg-emerald-50 border-2 border-emerald-950 hover:bg-emerald-100 transition"
        >
          ×
        </button>
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
        </div>
      </div>
    </div>
  );
};

export default NewPlaylist;
