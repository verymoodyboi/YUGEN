import React, { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiYoutube,
  FiInstagram,
  FiLinkedin,
  FiUsers,
  FiVideo,
  FiGlobe,
  FiBell,
  FiBellOff,
} from "react-icons/fi";
import { Send, CheckCircle, Sparkles, UserCheck, X } from "lucide-react";

import { FiCheck } from "react-icons/fi";

import { usePokes } from "../features/pokes/usePokes";
import FilmCard from "../components/filmCard-2x3";
import PlaylistCard from "../features/playlist/components/PlaylistCard";
import { useViewProfile } from "../features/profile/hooks/useViewProfile";
import Loading from "../components/loading_kickflip";
import { useAuth } from "../contexts/AuthContext";
import { Tooltip } from "@mui/material";
import AuthActionGuard from "../components/clickWrapper";
import ContactInfoGuard from "../features/pokes/components/contactWrapper";
import ReportButton from "../features/profile/components/ReportButton";

const AccProfile: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { getAccessToken } = useAuth();
  const {
    sent,
    received,
    loading: pokesLoading,
    processing: pokeProcessing,
    getPokeStatus,
    handleSendPoke,
    handleAcceptPoke,
    handleDeletePoke,
  } = usePokes(getAccessToken);
  const [openContactModal, setOpenContactModal] = useState(false);
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username");
  if (username == userInfo?.username) {
    navigate("/profile");
  }
  const paramTab = searchParams.get("tab");
  const initialTab =
    paramTab === "uploads" || paramTab === "info" || paramTab === "library"
      ? paramTab
      : "library";
  const infoRef = useRef<HTMLDivElement | null>(null);

  const scrollToInfo = () =>
    infoRef.current?.scrollIntoView({ behavior: "smooth" });
  const [tab, setTab] = useState<"library" | "info" | "uploads">(initialTab);

  const {
    user,
    loading,
    isSubscribed,
    isNotify,
    films,
    filmsLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    myPlaylists,
    // userChallenges,
    // challengesLoading,
    handleSubscribe,
    handleNotify,
  } = useViewProfile(username);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollRight = target.scrollLeft + target.clientWidth;
    const threshold = target.scrollWidth - 200;
    if (scrollRight >= threshold && hasNextPage) await fetchNextPage();
  };
  const pokeStatus = user?.auth_id
    ? getPokeStatus(user.auth_id)
    : { status: "none", pokeId: null };

  if (loading)
    return (
      <>
        <div className="flex items-center justify-center h-screen text-emerald-950 font-freckle">
          <Loading />
        </div>
      </>
    );

  return (
    <>
      <div className="min-h-screen  text-emerald-950 font-freckle p-4 flex flex-col gap-6">
        {/* HEADER */}
        <div className="flex flex-wrap gap-2 items-start justify-between w-full max-w-full overflow-x-hidden">
          <div className="flex gap-4 items-center">
            <img
              src={`https://pfps.try-yugen.com/${user.pfp_path}?t=${Date.now()}`}
              alt="pfp"
              className="w-24 h-24 rounded-full border-4 border-emerald-950 object-cover"
            />
            <div>
              <h1 className="text-3xl">@{user?.username}</h1>

              <p className="flex items-center gap-2 mt-1 text-emerald-900">
                <>
                  <Tooltip title="Films">
                    <FiVideo />
                  </Tooltip>
                  {user?.films_count}
                </>
                <>
                  {" "}
                  <Tooltip title="Subscribers">
                    <FiUsers />
                  </Tooltip>
                  {user?.sub_count}
                </>
              </p>
              <p className="flex items-center gap-2">
                <Tooltip title="Region">
                  <FiGlobe />
                </Tooltip>
                {user?.region || "N/A"}
              </p>
              {/* {user?.academic_status && user.academic_status !== "pending" && (
                <p className="flex items-center gap-2 text-emerald-950">
                  <SchoolIcon fontSize="small" />
                  {user.academic_status}
                </p>
              )} */}

              {/* Social Links */}
              <div className="flex gap-3 mt-2">
                {user?.youtube && (
                  <Tooltip title="YouTube">
                    <FiYoutube
                      className="cursor-pointer hover:scale-110"
                      onClick={() => window.open(user.youtube, "_blank")}
                    />
                  </Tooltip>
                )}
                {user?.instagram && (
                  <Tooltip title="Instagarm">
                    <FiInstagram
                      className="cursor-pointer hover:scale-110"
                      onClick={() => window.open(user.instagram, "_blank")}
                    />
                  </Tooltip>
                )}
                {user?.linkedin && (
                  <Tooltip title="LinkedIn">
                    <FiLinkedin
                      className="cursor-pointer hover:scale-110"
                      onClick={() => window.open(user.linkedin, "_blank")}
                    />
                  </Tooltip>
                )}
              </div>
              {user?.bio && (
                <div className="flex items-center gap-1 cursor-pointer">
                  <p className="font-freckle text-emerald-950 text-sm truncate max-w-[50%]">
                    {user?.bio?.slice(0, 50)}...
                  </p>

                  <button
                    className="font-freckle text-emerald-950 underline text-sm flex-shrink-0 "
                    onClick={(e) => {
                      e.stopPropagation();
                      setTab("info");
                      setTimeout(scrollToInfo, 150);
                    }}
                  >
                    more
                  </button>
                </div>
              )}
              {/* Subscribe / Notify */}

              <div className="mt-3 flex flex-col gap-3 mb-2">
                {/* ROW 1 — Subscribe + Notify */}
                <div className="flex gap-3">
                  <AuthActionGuard>
                    <button
                      onClick={handleSubscribe}
                      className={`px-4 py-2 rounded-full border-2 font-bold transition hover:scale-105 flex items-center gap-2 ${
                        isSubscribed
                          ? "bg-emerald-950 text-emerald-50 border-emerald-950"
                          : "bg-emerald-50 text-emerald-950 border-emerald-950"
                      }`}
                    >
                      {isSubscribed ? (
                        <>
                          <FiCheck />
                          Subscribed
                        </>
                      ) : (
                        "Subscribe"
                      )}
                    </button>
                  </AuthActionGuard>

                  {isSubscribed && (
                    <Tooltip title="Notification">
                      <AuthActionGuard>
                        <button
                          onClick={handleNotify}
                          className="px-4 py-2 rounded-full border-2 border-emerald-950 bg-emerald-50 text-emerald-950 font-bold hover:scale-105 transition"
                        >
                          {isNotify ? <FiBell /> : <FiBellOff />}
                        </button>
                      </AuthActionGuard>
                    </Tooltip>
                  )}
                  <Tooltip title="Report">
                    <AuthActionGuard>
                      <ReportButton reportedUserId={user.auth_id} />
                    </AuthActionGuard>
                  </Tooltip>
                </div>

                {/* ROW 2 — Poke */}
                {isSubscribed && (
                  <Tooltip
                    title={
                      pokeStatus.status === "sent"
                        ? "Poke sent — waiting for them"
                        : pokeStatus.status === "received"
                          ? "They poked you — accept to connect"
                          : pokeStatus.status === "accepted"
                            ? "You're connected"
                            : "Send a poke"
                    }
                  >
                    <ContactInfoGuard>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!user?.auth_id) return;

                          switch (pokeStatus.status) {
                            case "none":
                              await handleSendPoke(user.auth_id);
                              break;

                            case "received":
                              if (pokeStatus.pokeId)
                                await handleAcceptPoke(pokeStatus.pokeId);
                              break;

                            case "accepted":
                            case "sent":
                              if (pokeStatus.pokeId)
                                await handleDeletePoke(pokeStatus.pokeId);
                              break;
                          }
                        }}
                        className={`
            px-4 py-2 rounded-full border-2 font-bold 
            transition-all duration-200 
            hover:scale-105 
            flex items-center gap-2
            ${
              pokeStatus.status === "accepted"
                ? "bg-emerald-100 text-emerald-900 border-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                : pokeStatus.status === "received"
                  ? "bg-yellow-50 text-emerald-900 border-yellow-400"
                  : pokeStatus.status === "sent"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-400"
                    : "bg-emerald-50 text-emerald-950 border-emerald-950 hover:bg-emerald-100"
            }
          `}
                      >
                        {pokeStatus.status === "none" && (
                          <>
                            <Send size={16} />
                            Poke
                          </>
                        )}

                        {pokeStatus.status === "sent" && (
                          <>
                            <CheckCircle size={16} />
                            Sent
                          </>
                        )}

                        {pokeStatus.status === "received" && (
                          <>
                            <Sparkles size={16} />
                            Accept
                          </>
                        )}

                        {pokeStatus.status === "accepted" && (
                          <>
                            <UserCheck size={16} />
                            Matched
                          </>
                        )}
                      </button>
                    </ContactInfoGuard>
                  </Tooltip>
                )}

                {/* ROW 3 — Contact (only when matched) */}
                {isSubscribed && pokeStatus.status === "accepted" && user && (
                  <button
                    type="button"
                    onClick={() => setOpenContactModal(true)}
                    className="
        px-4 py-2 rounded-full border-2 border-emerald-950 
        bg-emerald-100 text-emerald-950 font-bold
        shadow-[0_0_10px_rgba(16,185,129,0.25)]
        hover:scale-105 transition
        flex items-center gap-2
      "
                  >
                    <Send size={16} />
                    Contact @{user.username}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b-2 border-emerald-950 pb-2">
          <button
            onClick={() => setTab("library")}
            className={`px-4 py-2 rounded-t-md font-bold transition-transform hover:-translate-y-[1px] ${
              tab === "library"
                ? "bg-emerald-950 text-emerald-50"
                : "bg-emerald-50 text-emerald-950 border-2 border-emerald-950"
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setTab("info")}
            className={`px-4 py-2 rounded-t-md font-bold transition-transform hover:-translate-y-[1px] ${
              tab === "info"
                ? "bg-emerald-950 text-emerald-50"
                : "bg-emerald-50 text-emerald-950 border-2 border-emerald-950"
            }`}
          >
            Info
          </button>
        </div>

        {/* LIBRARY TAB */}
        {tab === "library" && (
          <div className="flex flex-col gap-6">
            {films.length > 0 ? (
              <div>
                <h2 className="text-2xl mb-2">Films by @{user?.username}</h2>

                <div
                  onScroll={handleScroll}
                  className="flex overflow-x-auto pb-2 gap-3 no-scrollbar"
                >
                  <div className="flex gap-3 flex-nowrap">
                    {filmsLoading ? (
                      <Loading />
                    ) : (
                      films.map((film) => (
                        <div key={film.film_uuid} className="flex-shrink-0">
                          <FilmCard film={film} />
                        </div>
                      ))
                    )}

                    {isFetchingNextPage && (
                      <div
                        className="flex-shrink-0 flex items-center justify-center 
                  w-46 h-90 rounded-xl"
                      >
                        <Loading />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-emerald-900">
                {user?.username} hasn`t shared anything yet.
              </p>
            )}

            {myPlaylists.length > 0 && (
              <div>
                <h2 className="text-2xl mb-2">
                  Playlists by @{user?.username}
                </h2>
                <div className="flex flex-wrap gap-4 justify-center">
                  {myPlaylists.map((pl, idx) => (
                    <PlaylistCard key={idx} playlist={pl} />
                  ))}
                </div>
              </div>
            )}

            <div>
              {/* {challengesLoading ? (
                <CustomLoading />
              ) : (
                <>
                  {userChallenges.length > 0 && (
                    <>
                      <h2 className="text-2xl mb-2">Challenges</h2>
                      <div className="flex flex-col gap-3">
                        {userChallenges.map((ch: any) => (
                          <div
                            key={ch.challenge_id}
                            onClick={() =>
                              navigate(
                                `/challenge?challenge_id=${encodeURIComponent(
                                  ch.challenge_id
                                )}`
                              )
                            }
                            className="flex items-center gap-4 p-3 bg-emerald-100 border-2 border-emerald-950 rounded-xl cursor-pointer hover:-translate-y-[1px] hover:shadow-[3px_3px_0_0_#064e3b] transition"
                          >
                            <img
                              src={
                                supabase.storage
                                  .from("challenge_covers")
                                  .getPublicUrl(ch.cover_path).data.publicUrl
                              }
                              alt={ch.challenge_name}
                              className="w-28 h-20 object-cover rounded-md border-2 border-emerald-950"
                            />
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">
                                {ch.challenge_name}
                              </h3>
                              <p className="text-sm">
                                {ch.challenge_discription
                                  ? ch.challenge_discription
                                      .split(" ")
                                      .slice(0, 15)
                                      .join(" ") + "..."
                                  : "No description"}
                              </p>
                              <p className="text-xs mt-1">
                                Films: {ch.film_count ?? 0} | Votes:{" "}
                                {ch.vote_count ?? 0}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )} */}
            </div>
          </div>
        )}

        {/* INFO TAB */}
        {tab === "info" && (
          <div ref={infoRef} className="flex flex-col gap-3 mt-4">
            <h2 className="text-2xl mb-2">More Info</h2>
            <Tooltip title="Region">
              <FiGlobe />
            </Tooltip>{" "}
            {user?.region || "N/A"}
            <p>
              <Tooltip title="Subscribers">
                <FiUsers />
              </Tooltip>{" "}
              Subscribers: {user?.sub_count}
            </p>
            <p>
              <Tooltip title="Films">
                <FiVideo />
              </Tooltip>
              Films: {user?.films_count}
            </p>
            {user?.join_date && <p>Joined: {user.join_date}</p>}
            {/* {user?.academic_status && user.academic_status !== "pending" && (
              <p>
                <SchoolIcon fontSize="small" /> {user.academic_status}
              </p>
            )} */}
            <span className="opacity-80">Socials</span>
            <div className="flex items-center gap-3 justify-start max-w-full">
              {user?.youtube && (
                <Tooltip title="YouTube">
                  <a
                    href={user.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 max-w-[280px] truncate"
                  >
                    <FiYoutube />
                    <span className="truncate text-sm">{user.youtube}</span>
                  </a>
                </Tooltip>
              )}
              {user?.instagram && (
                <Tooltip title="instagram">
                  <a
                    href={user.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 max-w-[280px] truncate"
                  >
                    <FiInstagram />
                    <span className="truncate text-sm">{user.instagram}</span>
                  </a>
                </Tooltip>
              )}
              {user?.linkedin && (
                <Tooltip title="LinkedIn">
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 max-w-[280px] truncate"
                  >
                    <FiLinkedin />
                    <span className="truncate text-sm">{user.linkedin}</span>
                  </a>
                </Tooltip>
              )}
            </div>
            {user?.bio && (
              <p className="mt-2 border-t border-emerald-950 pt-2">
                {user.bio}
              </p>
            )}
          </div>
        )}
      </div>
      {openContactModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="
        w-[90%] max-w-md
        p-6 border-2 border-emerald-950
        rounded-lg bg-emerald-50 text-emerald-950
        shadow-[4px_4px_0_0_#064e3b]
        relative
      "
          >
            {/* Close */}
            <button
              onClick={() => setOpenContactModal(false)}
              className="absolute top-3 right-3 text-emerald-950 hover:scale-110 transition"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-3">
              Contact @{user.username} now
            </h2>

            <p className="text-sm mb-4 font-semibold text-emerald-800">
              You’re matched — reach out and create something together.
            </p>

            <div className="space-y-3 text-sm">
              {user.contact_email && (
                <div className="p-3 border border-emerald-900 rounded-md bg-white">
                  <span className="font-semibold">Email:</span>
                  <br />
                  {user.contact_email}
                </div>
              )}

              {user.contact_number && (
                <div className="p-3 border border-emerald-900 rounded-md bg-white">
                  <span className="font-semibold">Phone:</span>
                  <br />
                  {user.contact_number}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccProfile;
