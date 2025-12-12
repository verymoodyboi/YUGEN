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
import SchoolIcon from "@mui/icons-material/School";
import supabase from "../lib/supabaseClient";
import AppLayout from "../layouts/layout-main";
import FilmCard from "../components/filmCard-2x3";
import PlaylistCard from "../features/playlist/components/PlaylistCard";
import CustomLoading from "../SmallComponents/CutomsLoading";
import { useViewProfile } from "../features/profile/hooks/useViewProfile";
import Loading from "../components/loading_kickflip";
import { useAuth } from "../contexts/AuthContext";
import { Tooltip } from "@mui/material";

const AccProfile: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username");
  if (username == userInfo.username) {
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
      <div className="min-h-screen bg-emerald-50 text-emerald-950 font-freckle p-4 flex flex-col gap-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
          <div className="flex gap-4 items-center">
            <img
              src={
                supabase.storage.from("pfps").getPublicUrl(user?.pfp_path || "")
                  .data.publicUrl
              }
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
              {isSubscribed !== null && (
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={handleSubscribe}
                    className={`px-4 py-2 rounded-full border-2 font-bold transition hover:scale-105 ${
                      isSubscribed
                        ? "bg-emerald-950 text-emerald-50 border-emerald-950"
                        : "bg-emerald-50 text-emerald-950 border-emerald-950"
                    }`}
                  >
                    {isSubscribed ? "Subscribed" : "Subscribe"}
                  </button>

                  {isSubscribed && (
                    <Tooltip title="Notification">
                      <button
                        onClick={handleNotify}
                        className="px-4 py-2 rounded-full border-2 border-emerald-950 bg-emerald-50 text-emerald-950 font-bold hover:scale-105"
                      >
                        {isNotify ? <FiBell /> : <FiBellOff />}
                      </button>
                    </Tooltip>
                  )}
                </div>
              )}
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
            {films.length > 0 && (
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
            )}

            {myPlaylists.length > 0 && (
              <div>
                <h2 className="text-2xl mb-2">
                  Playlists by @{user?.username}
                </h2>
                <div className="flex flex-wrap gap-4">
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
    </>
  );
};

export default AccProfile;
