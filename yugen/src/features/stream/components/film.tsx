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
  console.log("FilmPath being passed:", filmData?.film_path);

  return (
    <div className="flex flex-col gap-4 w-full overFlow-y-scrol">
      {filmData && (
        <>
          {/* Uploader Section */}
          <div className="flex items-center gap-4 p-2">
            <img
              src={
                supabase.storage
                  .from("pfps")
                  .getPublicUrl(filmData?.uploader?.pfp_path || "").data
                  .publicUrl
              }
              alt="pfp"
              className="w-20 h-20 rounded-full border-2 border-emerald-950 cursor-pointer"
              onClick={() => {
                if (username === filmData?.uploader?.username) {
                  navigate("/profile");
                } else {
                  navigate(
                    `/@?username=${encodeURIComponent(filmData?.uploader?.username)}`
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

          {/* Video */}
          {filmData?.film_path && (
            <VideoPlayer
              filmPath={filmData.film_path}
              onEnded={onEnded}
              on70={handleIncrementView}
            />
          )}
          {/* Title & Actions */}
          <div className="flex justify-between items-start p-2">
            <div>
              <h1 className="text-3xl font-freckle text-emerald-950">
                {filmData.film_title}
              </h1>
              <p className="text-emerald-950">
                {filmData.film_genre || "Genres not available"}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-emerald-950">
              <div className="flex items-center gap-1">
                <FiEye size={22} /> {filmData.view_count ?? 0}
              </div>
              <div className="flex items-center gap-1">
                <FiStar size={22} /> {filmData.avg_rating ?? 0}
              </div>
              <button
                onClick={() => setIsReportOpen(true)}
                className="hover:scale-110 transition"
              >
                <FiFlag size={22} />
              </button>
              <button
                onClick={() => setIsPlaylistOpen(true)}
                className="hover:scale-110 transition"
              >
                <FiPlusSquare size={22} />
              </button>
              <button
                onClick={handleWatchlist}
                className="hover:scale-110 transition"
              >
                {watchlisted ? (
                  <FiCheckSquare size={22} />
                ) : (
                  <FiBookmark size={22} />
                )}
              </button>
            </div>
          </div>

          {/* Accordions */}
          <div className="max-w-2xl mx-auto w-full">
            {/* Thesis */}
            <div
              className="border-2 border-emerald-950 bg-emerald-50 rounded-xl mb-2 cursor-pointer"
              onClick={() =>
                setExpanded(expanded === "thesis" ? false : "thesis")
              }
            >
              <div className="p-2 font-freckle text-lg text-emerald-950">
                Thesis
              </div>
              {expanded === "thesis" && (
                <div className="p-2 text-emerald-950">
                  {filmData.thesis || "Thesis not available"}
                </div>
              )}
            </div>

            {/* Cast */}
            <div
              className="border-2 border-emerald-950 bg-emerald-50 rounded-xl mb-2 cursor-pointer"
              onClick={() => setExpanded(expanded === "cast" ? false : "cast")}
            >
              <div className="p-2 font-freckle text-lg text-emerald-950">
                Cast
              </div>
              {expanded === "cast" && (
                <div className="p-2 text-emerald-950">
                  {filmData.cast
                    ? JSON.parse(filmData.cast).map(
                        (member: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 border-b border-emerald-950 py-1 last:border-none"
                          >
                            <img
                              src={
                                supabase.storage
                                  .from("pfps")
                                  .getPublicUrl(member.pfp).data.publicUrl
                              }
                              alt={member.actor}
                              className="w-6 h-6 rounded-full border border-emerald-950 cursor-pointer hover:scale-110 transition"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (username === member.username) {
                                  navigate("/profile");
                                } else {
                                  navigate(
                                    `/@?username=${encodeURIComponent(member.username)}`
                                  );
                                }
                              }}
                            />
                            <span>
                              {member.actor} as {member.character}
                            </span>
                          </div>
                        )
                      )
                    : "Cast not available"}
                </div>
              )}
            </div>

            {/* Crew */}
            <div
              className="border-2 border-emerald-950 bg-emerald-50 rounded-xl mb-2 cursor-pointer"
              onClick={() => setExpanded(expanded === "crew" ? false : "crew")}
            >
              <div className="p-2 font-freckle text-lg text-emerald-950">
                Crew
              </div>
              {expanded === "crew" && (
                <div className="p-2 text-emerald-950">
                  {filmData.crew
                    ? JSON.parse(filmData.crew).map(
                        (member: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 border-b border-emerald-950 py-1 last:border-none"
                          >
                            <img
                              src={
                                supabase.storage
                                  .from("pfps")
                                  .getPublicUrl(member.pfp).data.publicUrl
                              }
                              alt={member.name}
                              className="w-6 h-6 rounded-full border border-emerald-950 cursor-pointer hover:scale-110 transition"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (username === member.username) {
                                  navigate("/profile");
                                } else {
                                  navigate(
                                    `/@?username=${encodeURIComponent(member.username)}`
                                  );
                                }
                              }}
                            />
                            <span>
                              {member.role}: {member.name}
                            </span>
                          </div>
                        )
                      )
                    : "Crew not available"}
                </div>
              )}
            </div>
          </div>

          {/* Thoughts */}

          {/* Report Dialog */}
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
                      onSubmitSuccess={() => setIsReportOpen(false)}
                    />
                  </Wrapper>
                </Dialog.Panel>
              </div>
            </Dialog>
          </Transition>

          {/* Playlist Dialog */}
          <Transition show={isPlaylistOpen} as={Fragment}>
            <Dialog
              onClose={() => setIsPlaylistOpen(false)}
              className="relative z-50"
            >
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                <Dialog.Panel className="bg-emerald-50 border-2 border-emerald-950 rounded-xl p-4 max-w-md w-full">
                  <button
                    onClick={() => setIsPlaylistOpen(false)}
                    className="absolute top-2 right-2 text-emerald-950"
                  >
                    <FiX size={20} />
                  </button>
                  <h2 className="font-freckle text-lg text-emerald-950 mb-2">
                    Add to playlist
                  </h2>

                  <div className="flex flex-col gap-2">
                    {myPlaylists.map((pl, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddToPlaylist(pl.playlist_uuid)}
                        className="flex items-center gap-2 p-2 border-2 border-emerald-950 rounded-lg hover:bg-emerald-100 text-emerald-950"
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
                    className="mt-4 px-3 py-1 border-2 border-emerald-950 text-emerald-950 rounded hover:bg-emerald-100 transition"
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
