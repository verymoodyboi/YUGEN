import React, { useState, useMemo } from "react";
import CloseIcon from "@mui/icons-material/Close";
import supabase from "../../../lib/supabaseClient";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { useChallenge } from "../useUseChallenges";
interface PodiumDialogProps {
  open: boolean;
  challenge: any;
  challengeID: string;
  challengeFilms: any[];
  podiumFilms: { rank: number; films: any }[];
  setPodiumFilms: React.Dispatch<
    React.SetStateAction<{ rank: number; films: any }[]>
  >;
  onClose: () => void;
}

const PodiumDialog: React.FC<PodiumDialogProps> = ({
  open,
  challenge,
  challengeID,
  challengeFilms,
  podiumFilms,
  setPodiumFilms,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { getAccessToken } = useAuth();

  const maxPodium = challenge?.podium ?? 3;

  const filteredFilms = useMemo(() => {
    return challengeFilms.filter((film: any) =>
      film.film_title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [challengeFilms, searchTerm]);

  const handleSelectFilm = (film: any) => {
    const exists = podiumFilms.find(
      (p) => p.films?.film_uuid === film.film_uuid,
    );
    if (exists) return;

    const nextEmptyRank = Array.from({ length: maxPodium })
      .map((_, i) => i + 1)
      .find((rank) => !podiumFilms.find((p) => p.rank === rank));

    if (!nextEmptyRank) return;

    setPodiumFilms((prev) => [...prev, { rank: nextEmptyRank, films: film }]);
  };

  const handleRemoveFilm = (rank: number) => {
    setPodiumFilms((prev) => prev.filter((p) => p.rank !== rank));
  };

  const { savePodium } = useChallenge();

  const handleSavePodium = async () => {
    setIsSaving(true);
    await savePodium(challengeID, podiumFilms);
    setIsSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-emerald-50 border-2 border-emerald-950 rounded-xl shadow-lg w-full max-w-3xl p-6 space-y-4 overflow-y-auto max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-emerald-950">
            Announce Winners
          </h2>
          <button
            onClick={onClose}
            className="text-emerald-900 hover:text-red-700 transition"
          >
            <CloseIcon />
          </button>
        </div>

        <p className="text-emerald-800">
          Select the top {maxPodium} films to assign podium ranks.
        </p>
        <div className="flex justify-center gap-6 mt-4 flex-wrap">
          {Array.from({ length: maxPodium }).map((_, index) => {
            const rank = index + 1;
            const podiumFilm = podiumFilms.find((p) => p.rank === rank);
            return (
              <div
                key={rank}
                className="cursor-pointer w-28 flex flex-col items-center"
                onClick={() => handleRemoveFilm(rank)}
              >
                <div className="text-emerald-900 font-semibold mb-1">
                  #{rank}
                </div>
                <div className="w-24 h-36 rounded-md border-2 border-dashed border-emerald-900 bg-emerald-50 flex items-center justify-center overflow-hidden transition hover:bg-red-100">
                  {podiumFilm?.films ? (
                    <img
                      src={
                        supabase.storage
                          .from("posters")
                          .getPublicUrl(podiumFilm.films.poster_path).data
                          .publicUrl
                      }
                      alt={podiumFilm.films.film_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xl font-bold text-emerald-800">
                      Empty
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-center text-emerald-800">
                  {podiumFilm?.films?.film_title || "Click film to fill"}
                </p>
                {podiumFilm?.films && (
                  <span className="text-xs text-red-600 italic">
                    Click slot to remove
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 border-t border-emerald-900 pt-4">
          <h3 className="text-lg font-semibold text-emerald-950 mb-2">
            Select from accepted films
          </h3>

          <input
            type="text"
            placeholder="Search films..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 mb-4 border border-emerald-900 rounded bg-emerald-50 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
            {filteredFilms.length > 0 ? (
              filteredFilms.map((film: any) => (
                <div
                  key={film.film_uuid}
                  className="cursor-pointer p-2 rounded border border-emerald-800 hover:bg-emerald-100 transition flex flex-col items-center"
                  onClick={() => handleSelectFilm(film)}
                >
                  <img
                    src={
                      supabase.storage
                        .from("posters")
                        .getPublicUrl(film.poster_path).data.publicUrl
                    }
                    alt={film.film_title}
                    className="w-20 h-28 object-cover rounded mb-1"
                  />
                  <span className="text-sm text-emerald-900 font-medium text-center line-clamp-2">
                    {film.film_title}
                  </span>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-emerald-800 italic">
                No films match your search.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSavePodium}
            disabled={isSaving}
            className={`py-2 px-4 rounded border-2 border-emerald-950 ${
              isSaving
                ? "bg-emerald-300 text-emerald-900 cursor-not-allowed"
                : "bg-emerald-700 text-white hover:bg-emerald-800 transition"
            }`}
          >
            {isSaving ? "Saving..." : "Save Winners"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PodiumDialog;
