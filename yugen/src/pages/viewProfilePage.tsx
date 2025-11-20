import React, { useState } from "react";
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

const AccProfile: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username");

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

  const [tab, setTab] = useState<"library" | "info">("library");

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollRight = target.scrollLeft + target.clientWidth;
    const threshold = target.scrollWidth - 200;
    if (scrollRight >= threshold && hasNextPage) await fetchNextPage();
  };

  if (loading)
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen text-emerald-950 font-freckle">
          Loading profile...
        </div>
      </AppLayout>
    );

  return (
    <AppLayout>
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
                <FiVideo /> {user?.films_count} <FiUsers /> {user?.sub_count}
              </p>
              <p className="flex items-center gap-2">
                <FiGlobe /> {user?.region || "N/A"}
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
                  <FiYoutube
                    className="cursor-pointer hover:scale-110"
                    onClick={() => window.open(user.youtube, "_blank")}
                  />
                )}
                {user?.instagram && (
                  <FiInstagram
                    className="cursor-pointer hover:scale-110"
                    onClick={() => window.open(user.instagram, "_blank")}
                  />
                )}
                {user?.linkedin && (
                  <FiLinkedin
                    className="cursor-pointer hover:scale-110"
                    onClick={() => window.open(user.linkedin, "_blank")}
                  />
                )}
              </div>

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
                    <button
                      onClick={handleNotify}
                      className="px-4 py-2 rounded-full border-2 border-emerald-950 bg-emerald-50 text-emerald-950 font-bold hover:scale-105"
                    >
                      {isNotify ? <FiBell /> : <FiBellOff />}
                    </button>
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
                  className="flex gap-3 overflow-x-auto pb-2"
                >
                  {filmsLoading ? (
                    <CustomLoading />
                  ) : (
                    films.map((film) => (
                      <FilmCard key={film.film_uuid} film={film} />
                    ))
                  )}
                  {isFetchingNextPage && (
                    <div className="flex items-center justify-center text-sm text-emerald-950 animate-pulse">
                      Loading more...
                    </div>
                  )}
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
          <div className="flex flex-col gap-3 mt-4">
            <h2 className="text-2xl mb-2">More Info</h2>
            <p>
              <FiGlobe /> {user?.region || "N/A"}
            </p>
            <p>
              <FiUsers /> Subscribers: {user?.sub_count}
            </p>
            <p>
              <FiVideo /> Films: {user?.films_count}
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
                <a
                  href={user.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 max-w-[280px] truncate"
                >
                  <FiYoutube />
                  <span className="truncate text-sm">{user.youtube}</span>
                </a>
              )}
              {user?.instagram && (
                <a
                  href={user.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 max-w-[280px] truncate"
                >
                  <FiInstagram />
                  <span className="truncate text-sm">{user.instagram}</span>
                </a>
              )}
              {user?.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 max-w-[280px] truncate"
                >
                  <FiLinkedin />
                  <span className="truncate text-sm">{user.linkedin}</span>
                </a>
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
    </AppLayout>
  );
};

export default AccProfile;
