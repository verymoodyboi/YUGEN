import React from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import VideocamIcon from "@mui/icons-material/Videocam";
import supabase from "../../../lib/supabaseClient";

interface ChallengeHeaderProps {
  challenge: any;
  submittedFilm: any;
  userInfo: any;
  getFilmPlacement: () => number | null;
  navigate: (path: string) => void;
  handleRemoveSubmission: () => void;
  setJoin: (val: boolean) => void;
}

const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({
  challenge,
  submittedFilm,
  userInfo,
  getFilmPlacement,
  navigate,
  handleRemoveSubmission,
  setJoin,
}) => {
  return (
    <div className="rounded-2xl overflow-hidden border-2 border-emerald-950 shadow-md bg-emerald-100">
      {challenge ? (
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 w-full h-80 lg:h-auto">
            <img
              src={
                supabase.storage
                  .from("challenge_covers")
                  .getPublicUrl(challenge.cover_path).data.publicUrl
              }
              alt="Challenge Cover"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 p-6 space-y-3">
            <h1 className="text-3xl font-bold text-emerald-950">
              Challenge: {challenge?.challenge_name || ""}
            </h1>

            <button
              className="flex items-center space-x-2 text-emerald-900"
              onClick={() =>
                navigate(
                  `/@?username=${encodeURIComponent(challenge?.creator?.username)}`,
                )
              }
            >
              <img
                alt={challenge?.creator?.username || "User"}
                src={
                  supabase.storage
                    .from("pfps")
                    .getPublicUrl(challenge?.creator?.pfp_path).data.publicUrl
                }
                className="w-5 h-5 rounded-full border border-emerald-950"
              />
              <span className="font-bold">
                {challenge?.creator?.username || ""}
              </span>
            </button>

            <div className="flex items-center space-x-4 text-emerald-900">
              <div className="flex items-center gap-1">
                <VideocamIcon />
                <span className="font-semibold">
                  {challenge?.film_count || 0}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <RecordVoiceOverIcon />
                <span className="font-semibold">
                  {challenge?.vote_count || 0}
                </span>
              </div>
            </div>

            <p className="text-emerald-800 font-semibold">
              {challenge?.challenge_discription || ""}
            </p>

            {challenge?.challenge_rules && (
              <div className="mt-3">
                <h3 className="text-xl font-bold text-emerald-950">Rules</h3>
                <ul className="list-decimal list-inside space-y-1 text-emerald-800">
                  {(Array.isArray(challenge.challenge_rules)
                    ? challenge.challenge_rules
                    : JSON.parse(challenge.challenge_rules)
                  ).map((rule: string, i: number) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}

            <p
              className={`font-bold ${
                challenge?.deadline && new Date(challenge.deadline) < new Date()
                  ? "text-red-600"
                  : "text-emerald-950"
              }`}
            >
              Deadline: {challenge?.deadline || "N/A"}
            </p>

            <div className="mt-4">
              {challenge?.deadline &&
              new Date(challenge.deadline) < new Date() ? (
                <button
                  disabled
                  className="py-2 px-4 rounded-lg bg-emerald-200 text-emerald-950 font-bold border-2 border-emerald-950 opacity-70 cursor-not-allowed"
                >
                  Submit your film
                </button>
              ) : submittedFilm?.films ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRemoveSubmission}
                      className="py-2 px-4 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition"
                    >
                      Remove submission
                    </button>
                  </div>

                  <div className="mt-2 text-center">
                    <h4 className="text-lg font-bold text-emerald-950">
                      Your submission:
                    </h4>
                    <img
                      src={
                        supabase.storage
                          .from("posters")
                          .getPublicUrl(submittedFilm?.films.poster_path).data
                          .publicUrl
                      }
                      alt={submittedFilm.film_title}
                      className="w-28 h-40 object-cover rounded-md mx-auto"
                    />
                    <p className="mt-2 font-bold text-emerald-950">
                      {submittedFilm.films.film_title}
                    </p>

                    <p
                      className={`mt-2 font-bold ${
                        submittedFilm.is_accepted === true
                          ? "text-green-600"
                          : "text-orange-500"
                      }`}
                    >
                      Status:{" "}
                      {submittedFilm.is_accepted === true ? (
                        <>
                          Competing
                          {getFilmPlacement() && (
                            <>
                              {" "}
                              {challenge?.ranking_system === "voting" && (
                                <> , currently in #{getFilmPlacement()} place</>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        "Under review"
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {challenge?.is_academic &&
                  !challenge?.allow_non_students &&
                  userInfo?.academic_status !== challenge?.university_name ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setJoin(true)}
                        className="py-2 px-4 rounded-lg bg-emerald-600 text-white font-bold border-2 border-emerald-950 opacity-70 cursor-not-allowed"
                        disabled
                      >
                        Submit your film
                      </button>
                      <div className="flex items-center gap-2">
                        <InfoOutlinedIcon className="text-red-600" />
                        <span className="text-sm text-emerald-800">
                          only {challenge?.university_name} students can join
                          this challenge!
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setJoin(true)}
                      className="py-2 px-4 rounded-lg bg-emerald-600 text-white font-bold border-2 border-emerald-950 hover:bg-emerald-700 transition"
                    >
                      Submit your film
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-emerald-900">
          <p>Loading challenge...</p>
        </div>
      )}
    </div>
  );
};

export default ChallengeHeader;
