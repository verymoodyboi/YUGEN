import React from "react";
import dayjs from "dayjs";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StarIcon from "@mui/icons-material/Star";
import supabase from "../../../lib/supabaseClient";

interface AcceptedFilmsTabProps {
  challenge: any;
  challengeFilms: any[];
  podiumFilms: any[];
  userVote: string | null;
  handleVote: (filmId: string) => void;
  handleRemoveFilm: (filmId: string) => void;
  setOpenPodiumDialog: (val: boolean) => void;
  navigate: (path: string) => void;
  getAccessToken: () => Promise<string>;
}

const AcceptedFilmsTab: React.FC<AcceptedFilmsTabProps> = ({
  challenge,
  challengeFilms,
  podiumFilms,
  userVote,
  handleVote,
  handleRemoveFilm,
  setOpenPodiumDialog,
  navigate,
  getAccessToken,
}) => {
  return (
    <div>
      {/* === Voting system === */}
      {challenge?.ranking_system === "voting" && (
        <div>
          {challengeFilms.length === 0 && (
            <p className="text-center text-red-400">
              No films here yet, be the first!
            </p>
          )}

          <ul className="space-y-3">
            {challengeFilms.map((film: any, index: number) => (
              <li
                key={film.film_uuid}
                className="flex items-start gap-4 p-3 border rounded-md bg-emerald-50"
              >
                <img
                  src={
                    supabase.storage
                      .from("posters")
                      .getPublicUrl(film?.poster_path).data.publicUrl
                  }
                  alt={film.film_title}
                  className="w-24 h-36 object-cover rounded-md"
                />

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold">
                        {index + 1}# {film.film_title}
                      </h4>

                      <div className="flex items-center gap-2 text-goldenrod">
                        <span className="text-yellow-600">
                          {film.avg_rating}
                        </span>
                        <StarIcon className="text-yellow-500" />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-emerald-800">
                        <span className="text-xl font-semibold">
                          {(
                            (film.vote_count / challenge.vote_count) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                        <div className="text-sm text-emerald-700">
                          ({film.vote_count} votes)
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRemoveFilm(film.film_uuid)}
                          className="py-1 px-3 rounded bg-red-500 text-white hover:bg-red-600"
                        >
                          Remove
                        </button>

                        <button
                          onClick={() => handleVote(film.film_uuid)}
                          className={`py-1 px-3 rounded ${
                            userVote === film.film_uuid
                              ? "bg-pink-300 text-black"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {userVote === film.film_uuid ? "Voted" : "Vote"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-emerald-700 mt-2">
                    Released:{" "}
                    {film.release_date
                      ? dayjs(film.release_date).format("MMM D, YYYY")
                      : "N/A"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* === Manual ranking (Podium system) === */}
      {challenge?.ranking_system === "manual" && (
        <div>
          <div className="p-4">
            <h3 className="text-xl font-bold text-emerald-950 mb-4">Podium</h3>

            <div className="flex justify-center items-end gap-6">
              {Array.from({ length: challenge?.podium ?? 3 }).map((_, idx) => {
                const rank = idx + 1;
                const podiumFilm = podiumFilms.find((p) => p.rank === rank);
                return (
                  <div key={rank} className="flex flex-col items-center w-28">
                    <div className="text-goldenrod font-semibold mb-1">
                      #{rank} {podiumFilm?.films?.film_title ?? ""}
                    </div>
                    <div className="w-24 h-36 rounded-md border-2 border-dashed border-gray-300 bg-emerald-50 flex items-center justify-center overflow-hidden">
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
                        <div className="text-2xl font-bold text-emerald-900">
                          ?
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {podiumFilms.length === 0 &&
              challenge?.deadline &&
              new Date(challenge.deadline) < new Date() && (
                <div className="mt-4">
                  <button
                    onClick={() => setOpenPodiumDialog(true)}
                    className="py-2 px-4 rounded bg-emerald-600 text-white"
                  >
                    Announce winners
                  </button>
                </div>
              )}

            {podiumFilms.length === 0 &&
              challenge?.deadline &&
              new Date(challenge.deadline) > new Date() && (
                <div className="mt-4 flex items-center gap-2">
                  <button
                    disabled
                    className="py-2 px-4 rounded bg-emerald-300 text-emerald-900 cursor-not-allowed"
                  >
                    Announce winners
                  </button>
                  <div className="flex items-center gap-1 text-sm text-emerald-800">
                    <InfoOutlinedIcon />
                    <span>Wait until after deadline to announce winners!</span>
                  </div>
                </div>
              )}
          </div>

          <div className="mt-4">
            {challengeFilms.length === 0 && (
              <p className="text-center text-red-400">
                No films here yet, be the first!
              </p>
            )}

            <ul className="space-y-3">
              {challengeFilms.map((film: any) => (
                <li
                  key={film.film_uuid}
                  className="flex items-start gap-4 p-3 border rounded-md bg-emerald-50"
                >
                  <img
                    src={
                      supabase.storage
                        .from("posters")
                        .getPublicUrl(film?.poster_path).data.publicUrl
                    }
                    alt={film.film_title}
                    className="w-24 h-36 object-cover rounded-md cursor-pointer"
                    onClick={async () => {
                      navigate(
                        `/watch?uuid=${encodeURIComponent(film.film_uuid)}`
                      );
                    }}
                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold">{film.film_title}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRemoveFilm(film.film_uuid)}
                          className="py-1 px-3 rounded bg-red-500 text-white"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-emerald-700 mt-2">
                      Released:{" "}
                      {film.release_date
                        ? dayjs(film.release_date).format("MMM D, YYYY")
                        : "N/A"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptedFilmsTab;
