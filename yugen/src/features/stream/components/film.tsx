import supabase from "../../../lib/supabaseClient";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import {
  FiFlag,
  FiPlusSquare,
  FiBookmark,
  FiCheckSquare,
  FiEye,
  FiStar,
  FiX,
} from "react-icons/fi";
import { Dialog, Transition } from "@headlessui/react";

import VideoPlayer from "./videoPlayer";
import Thoughts from "../../thoughts/components/thoughts";
import ReportForm from "../../report/components/Report";
import Wrapper from "../../../pages/Wrapper";
import { useAuth } from "../../../contexts/AuthContext";
import { useFilms } from "../hooks/useFilm";
import Loading from "../../../components/loading_kickflip";
import { Tooltip } from "@mui/material";
import tempPFP from "../../../YugenAssits/Avatar_Placeholder.png";
import AuthActionGuard from "../../../components/clickWrapper";

interface Props {
  filmId: string;
  onEnded?: () => void;
}

const Film: React.FC<Props> = ({ filmId, onEnded }) => {
  const navigate = useNavigate();
  const { username, getAccessToken } = useAuth();

  const [expanded, setExpanded] = useState<string | false>(false);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  // merged hook
  const {
    filmData,
    loading,
    watchlisted,
    handleWatchlist,
    myPlaylists,
    listedPlaylists,
    handleAddToPlaylist,
    handleIncrementView,
  } = useFilms({ filmId, getAccessToken });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80 text-emerald-950">
        <Loading />
      </div>
    );
  }
  //console.log("FilmPath being passed:", filmData?.film_path);
  const castArray = (() => {
    try {
      if (Array.isArray(filmData?.cast)) return filmData.cast;
      if (typeof filmData?.cast === "string") return JSON.parse(filmData.cast);
      return [];
    } catch {
      return [];
    }
  })();

  const crewArray = (() => {
    try {
      if (Array.isArray(filmData?.crew)) return filmData.crew;
      if (typeof filmData?.crew === "string") return JSON.parse(filmData.crew);
      return [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="flex flex-col gap-4 w-full overFlow-y-scrol">
      {filmData && (
        <>
          <div className="flex items-center gap-4 p-2">
            <img
              src={
                filmData?.uploader?.pfp_path
                  ? `https://pfps.try-yugen.com/${filmData?.uploader.pfp_path}?t=${Date.now()}`
                  : tempPFP
              }
              alt="pfp"
              className="w-20 h-20 rounded-full border-2 border-emerald-950 cursor-pointer"
              onClick={() => {
                if (username === filmData?.uploader?.username) {
                  navigate("/profile");
                } else {
                  navigate(
                    `/@?username=${encodeURIComponent(
                      filmData?.uploader?.username,
                    )}`,
                  );
                }
              }}
            />
            <div>
              <h2 className="text-2xl font-freckle text-emerald-950">
                @{filmData?.uploader?.username}
              </h2>
              <h4 className="text-emerald-950 flex items-center gap-2">
                📽 {filmData?.uploader?.films_count} 𐦂𖨆𐀪𖠋{" "}
                {filmData?.uploader?.sub_count}
              </h4>
            </div>
          </div>

          {filmData?.film_path && (
            <VideoPlayer
              filmPath={filmData.film_path}
              onEnded={onEnded}
              on70={handleIncrementView}
            />
          )}
          <div className="flex justify-between items-start p-2">
            <div>
              <h1 className="text-3xl font-freckle text-emerald-950">
                {filmData.film_title}
              </h1>
              <span className="inline-block font-freckle text-sm text-emerald-950/70">
                {(() => {
                  try {
                    const parsed =
                      typeof filmData.film_genre === "string"
                        ? JSON.parse(filmData.film_genre)
                        : filmData.film_genre;

                    return Array.isArray(parsed)
                      ? parsed.join(", ")
                      : parsed || "No genre";
                  } catch {
                    return filmData.film_genre || "No genre";
                  }
                })()}
                {filmData.release_date && (
                  <>
                    <span>•</span>
                    <span>
                      {new Date(filmData.release_date).toLocaleDateString(
                        "en-GB",
                      )}
                    </span>
                  </>
                )}
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 text-emerald-950">
              <Tooltip title="Views">
                <div className="flex items-center gap-1">
                  <FiEye size={22} /> {filmData.view_count ?? 0}
                </div>
              </Tooltip>
              <Tooltip title="Rating">
                <div className="flex items-center gap-1">
                  <FiStar size={22} /> {filmData.avg_rating ?? 0}{" "}
                  <p className="text-emerald-950/60 text-xs">
                    ({filmData.rating_count ?? 0})
                  </p>
                </div>
              </Tooltip>
            </div>
          </div>

          <div className="h-4" />

          <div className="flex gap-4 p-2 justify-start text-emerald-950">
            <Tooltip title="Report">
              <AuthActionGuard>
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="hover:scale-110 transition"
                >
                  <FiFlag size={26} />
                </button>
              </AuthActionGuard>
            </Tooltip>

            <Tooltip title="Add to plalist">
              <AuthActionGuard>
                <button
                  onClick={() => setIsPlaylistOpen(true)}
                  className="hover:scale-110 transition"
                >
                  <FiPlusSquare size={26} />
                </button>
              </AuthActionGuard>
            </Tooltip>
            <Tooltip title="Add to Watchlist">
              <AuthActionGuard>
                <button
                  onClick={handleWatchlist}
                  className="hover:scale-110 transition"
                >
                  {watchlisted ? (
                    <FiCheckSquare size={26} />
                  ) : (
                    <FiBookmark size={26} />
                  )}
                </button>
              </AuthActionGuard>
            </Tooltip>
          </div>

          <div className="flex flex-col gap-2 w-full">
            {/* Thesis */}
            <div
              className="border-2 border-emerald-950 bg-emerald-50 rounded-xl cursor-pointer hover:scale-101 transition"
              onClick={() =>
                setExpanded(expanded === "thesis" ? false : "thesis")
              }
            >
              <div className="p-2 font-freckle text-lg text-emerald-950">
                Thesis
              </div>
              {expanded === "thesis" && (
                <div className="p-2 text-emerald-950">
                  {filmData.thesis && filmData.thesis.trim() !== "" ? (
                    filmData.thesis
                  ) : (
                    <div className="text-emerald-950/70"> Not available</div>
                  )}
                </div>
              )}
            </div>

            <div
              className="border-2 border-emerald-950 bg-emerald-50 rounded-xl cursor-pointer hover:scale-101 "
              onClick={() => setExpanded(expanded === "cast" ? false : "cast")}
            >
              <div className="p-2 font-freckle text-lg text-emerald-950 transition">
                Cast
              </div>
              {expanded === "cast" && (
                <div className="p-2 text-emerald-950">
                  {castArray.length > 0 ? (
                    castArray.map((member: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 border-b border-emerald-950 py-1 last:border-none"
                      >
                        {member.actor?.includes("@") && (
                          <img
                            src={
                              member?.pfp
                                ? `https://pfps.try-yugen.com/${member.pfp}?t=${Date.now()}`
                                : tempPFP
                            }
                            alt={member.actor}
                            className="w-8 h-8 rounded-full object-cover"
                            onClick={(e) => {
                              e.stopPropagation();
                              const uname = member.actor.replace(/^@/, "");
                              navigate(
                                username === uname
                                  ? "/profile"
                                  : `/@?username=${encodeURIComponent(uname)}`,
                              );
                            }}
                          />
                        )}
                        <span>
                          {member.actor} as {member.character}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-emerald-950/70">Not available</div>
                  )}
                </div>
              )}
            </div>

            <div
              className="border-2 border-emerald-950 bg-emerald-50 rounded-xl cursor-pointer hover:scale-101 transition"
              onClick={() => setExpanded(expanded === "crew" ? false : "crew")}
            >
              <div className="p-2 font-freckle text-lg text-emerald-950">
                Crew
              </div>
              {expanded === "crew" && (
                <div className="p-2 text-emerald-950">
                  {crewArray.length > 0 ? (
                    crewArray.map((member: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 border-b border-emerald-950 py-1 last:border-none"
                      >
                        {member.name?.includes("@") && (
                          <img
                            src={
                              member?.pfp
                                ? `https://pfps.try-yugen.com/${member.pfp}?t=${Date.now()}`
                                : tempPFP
                            }
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover"
                            onClick={(e) => {
                              e.stopPropagation();
                              const uname = member.name.replace(/^@/, "");
                              navigate(
                                username === uname
                                  ? "/profile"
                                  : `/@?username=${encodeURIComponent(uname)}`,
                              );
                            }}
                          />
                        )}
                        <span>
                          {member.role}: {member.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-emerald-950/70">Not available</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <Transition show={isReportOpen} as={Fragment}>
            <Dialog
              onClose={() => setIsReportOpen(false)}
              className="relative z-50"
            >
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                <Dialog.Panel className=" rounded-xl p-4 max-w-md w-full">
                  <button
                    onClick={() => setIsReportOpen(false)}
                    className="absolute top-2 right-2 text-emerald-950"
                  >
                    <FiX size={20} />
                  </button>
                  <Wrapper>
                    <ReportForm
                      film_id={filmData.film_uuid}
                      onSubmitSuccess={() =>
                        setTimeout(() => setIsReportOpen(false), 2000)
                      }
                      onClose={() => {
                        setIsReportOpen(false);
                      }}
                    />
                  </Wrapper>
                </Dialog.Panel>
              </div>
            </Dialog>
          </Transition>

          <Transition show={isPlaylistOpen}>
            <Dialog
              onClose={() => setIsPlaylistOpen(false)}
              className="relative z-50"
            >
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
                <Dialog.Panel
                  className="
          relative w-full max-w-md p-6 font-freckle
          rounded-2xl border-4 border-emerald-950 bg-emerald-50
          shadow-[6px_6px_0_#064e3b]
        "
                >
                  <button
                    onClick={() => setIsPlaylistOpen(false)}
                    className="absolute top-3 right-3 text-emerald-950 hover:scale-110 transition"
                  >
                    <FiX size={22} />
                  </button>

                  <h2 className="text-2xl text-emerald-950 mb-4">
                    Add to playlist
                  </h2>

                  <div
                    className="
    flex flex-col gap-3
    max-h-64
    overflow-y-auto
    pr-1
  "
                  >
                    {myPlaylists.map((pl, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddToPlaylist(pl.playlist_uuid)}
                        className="
        flex items-center gap-2 p-3 text-left
        border-2 border-emerald-950 rounded-xl
        hover:bg-emerald-100 transition
        text-emerald-950
      "
                      >
                        {listedPlaylists[pl.playlist_uuid] ? (
                          <FiCheckSquare />
                        ) : (
                          <FiPlusSquare />
                        )}
                        {pl.playlist_name}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsPlaylistOpen(false)}
                    className="
            mt-6 px-4 py-2
            border-2 border-emerald-950
            bg-emerald-950 text-emerald-50
            rounded-xl
            hover:scale-105 transition
          "
                  >
                    Done
                  </button>
                </Dialog.Panel>
              </div>
            </Dialog>
          </Transition>
        </>
      )}
    </div>
  );
};

export default Film;
