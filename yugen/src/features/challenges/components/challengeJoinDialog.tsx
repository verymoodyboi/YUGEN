import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import supabase from "../../../lib/supabaseClient";
import { useAuth } from "../../../contexts/AuthContext";
import { useChallenge } from "../useUseChallenges";

interface JoinChallengeDialogProps {
  join: boolean;
  setJoin: (val: boolean) => void;

  chooseDialog: boolean;
  setChooseDialog: (val: boolean) => void;

  challengeID: string | null;
}

const JoinChallengeDialog: React.FC<JoinChallengeDialogProps> = ({
  join,
  setJoin,
  chooseDialog,
  setChooseDialog,
  challengeID,
}) => {
  const { user, getAccessToken } = useAuth();
  const { fetchUserFilms, handleSubmitFilm } = useChallenge(challengeID, user);

  const [userFilms, setUserFilms] = useState<any[]>([]);
  const [loadingFilms, setLoadingFilms] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<any>(null);

  // === Fetch user films when choosing dialog opens ===
  useEffect(() => {
    if (!chooseDialog || !user) return;

    const loadFilms = async () => {
      setLoadingFilms(true);
      const films = await fetchUserFilms(getAccessToken); // ✅ pass getAccessToken
      setUserFilms(films || []);
      setLoadingFilms(false);
    };

    loadFilms();
  }, [chooseDialog, user, fetchUserFilms, getAccessToken]);

  // === Handle film submission to the challenge ===
  const onSubmitFilm = async () => {
    if (!selectedFilm || !challengeID || !user) return;

    await handleSubmitFilm(challengeID, selectedFilm.film_uuid, getAccessToken); // ✅ pass getAccessToken
    setSelectedFilm(null);
    setChooseDialog(false);
    setJoin(false);
  };

  // === Icon actions ===
  const iconsJoin = [
    {
      icon: <FileUploadIcon className="text-6xl" />,
      title: "Upload a new film",
      width: "33%",
      onClick: () => {
        window.location.href = "/UploadFilmPage";
      },
    },
    {
      icon: <SwitchAccountIcon className="text-6xl" />,
      title: "Choose from profile",
      width: "33%",
      onClick: () => {
        setChooseDialog(true);
      },
    },
  ];

  return (
    <>
      {/* === JOIN DIALOG === */}
      {join && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setJoin(false)}
        >
          <div
            className="relative w-[90vw] max-w-4xl h-[80vh] bg-emerald-50 rounded-xl p-6 border-2 border-emerald-950"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setJoin(false)}
              className="absolute top-4 left-4 p-2"
            >
              <CloseIcon />
            </button>

            <div className="flex flex-wrap items-center justify-center h-full gap-6">
              {iconsJoin.map((item) => (
                <div
                  key={item.title}
                  style={{ width: item.width }}
                  className="flex justify-center"
                >
                  <button
                    onClick={item.onClick}
                    className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-emerald-950 bg-emerald-100 hover:scale-105 transition"
                  >
                    <div>{item.icon}</div>
                    <div className="text-emerald-900 font-semibold">
                      {item.title}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === CHOOSE FILM DIALOG === */}
      {chooseDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setChooseDialog(false)}
        >
          <div
            className="bg-emerald-50 rounded-xl shadow-lg w-full max-w-3xl p-4 border-2 border-emerald-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-emerald-950">
                Choose a film to submit
              </h3>
              <button onClick={() => setChooseDialog(false)}>
                <CloseIcon />
              </button>
            </div>

            {loadingFilms ? (
              <div className="text-center text-emerald-800 mb-3">
                Loading your films...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto">
                {userFilms.length > 0 ? (
                  userFilms.map((f) => (
                    <div
                      key={f.film_uuid}
                      className={`p-2 rounded border ${
                        selectedFilm?.film_uuid === f.film_uuid
                          ? "border-emerald-900 bg-emerald-100"
                          : "border-emerald-200"
                      }`}
                    >
                      <img
                        src={
                          supabase.storage
                            .from("posters")
                            .getPublicUrl(f.poster_path).data.publicUrl
                        }
                        alt={f.film_title}
                        className="w-full h-40 object-cover rounded"
                      />
                      <div className="mt-2 text-sm font-semibold">
                        {f.film_title}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => setSelectedFilm(f)}
                          className="py-1 px-2 rounded bg-emerald-600 text-white"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center col-span-full text-emerald-800 italic">
                    You have no films uploaded yet.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setChooseDialog(false);
                  setSelectedFilm(null);
                }}
                className="py-2 px-4 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={onSubmitFilm}
                className="py-2 px-4 rounded bg-emerald-600 text-white"
                disabled={!selectedFilm || loadingFilms}
              >
                {loadingFilms ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JoinChallengeDialog;
