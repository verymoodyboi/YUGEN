// src/pages/UserProfile.tsx
import React, { useState, useRef, useEffect, Fragment } from "react";
import { useMyProfile } from "../features/profile/hooks/useMyProfile";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import AppLayout from "../layouts/layout-main";
import FilmCard from "../components/filmCard-2x3";
import PlaylistCard from "../features/playlist/components/PlaylistCard";
import CustomLoading from "../SmallComponents/CutomsLoading";
import EditProfile from "../features/profile/components/EditProfile copy";
import { Dialog, Transition } from "@headlessui/react";
import UploadFilmCard from "../features/profile/components/uploadedFilmsCard";
import {
  FiYoutube,
  FiInstagram,
  FiLinkedin,
  FiEdit3,
  FiUsers,
  FiVideo,
  FiGlobe,
  FiCalendar,
} from "react-icons/fi";
import SchoolIcon from "@mui/icons-material/School";
import Loading from "../components/loading_kickflip";

const UserProfile: React.FC = () => {
  const { userInfo: user, getAccessToken } = useAuth();
  const navigate = useNavigate();
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollRight = target.scrollLeft + target.clientWidth;
    const threshold = target.scrollWidth - 200;
    if (scrollRight >= threshold && hasNextPage) {
      await fetchNextPage();
    }
  };

  const [value, setValue] = useState<"library" | "info" | "uploads">("library");
  const [openEdit, setOpenEdit] = useState(false);
  const infoRef = useRef<HTMLDivElement | null>(null);

  const scrollToInfo = () =>
    infoRef.current?.scrollIntoView({ behavior: "smooth" });

  // === Fetch Films (unchanged logic) ===
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    isFetchingNextPage,
    films,
    myPlaylists,
    playlistsLoading,
    // userChallengesData,
    // userChallengesLoading,
    // userChallengesError,
    // userChallenges,
  } = useMyProfile(user?.auth_id, getAccessToken);
  if (!user)
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen text-emerald-950 font-freckle">
          <Loading />
        </div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="min-h-screen bg-emerald-50 text-emerald-950 font-freckle p-4 flex flex-col gap-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
          {/* Profile Info */}
          <div className="flex gap-4 items-center">
            <img
              src={
                supabase.storage.from("pfps").getPublicUrl(user?.pfp_path || "")
                  .data.publicUrl + `?v=${Date.now()}`
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

              {/* {user?.academic_status && (
                <p
                  className={`flex items-center gap-2 ${
                    user.academic_status === "pending"
                      ? "text-orange-600"
                      : "text-emerald-950"
                  }`}
                >
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

              {/* Bio Preview */}
              {user?.bio && (
                <p
                  className="mt-2 text-emerald-900 cursor-pointer hover:underline"
                  onClick={() => {
                    setValue("info");
                    setTimeout(scrollToInfo, 150);
                  }}
                >
                  {user.bio.length > 50
                    ? user.bio.slice(0, 50) + "..."
                    : user.bio}
                </p>
              )}

              {/* Edit Button */}
              <div className="mt-3">
                <button
                  onClick={() => setOpenEdit(true)}
                  className="px-4 py-2 rounded-full border-2 border-emerald-950 bg-emerald-950 text-emerald-50 font-bold transition hover:scale-105"
                >
                  <FiEdit3 className="inline mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Upload Visual */}
          <div>
            <video
              onClick={() => navigate("/UploadFilmPage")}
              autoPlay
              loop
              muted
              playsInline
              src={
                supabase.storage
                  .from("assets")
                  .getPublicUrl("createButtonFinal.webm").data.publicUrl
              }
              className="w-56 h-36 object-cover rounded-xl border-4 border-emerald-950 cursor-pointer hover:scale-105 transition"
            />
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-4 border-b-2 border-emerald-950 pb-2">
          <button
            onClick={() => setValue("library")}
            className={`px-4 py-2 rounded-t-md font-bold transition-transform hover:-translate-y-[1px] ${
              value === "library"
                ? "bg-emerald-950 text-emerald-50"
                : "bg-emerald-50 text-emerald-950 border-2 border-emerald-950"
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setValue("info")}
            className={`px-4 py-2 rounded-t-md font-bold transition-transform hover:-translate-y-[1px] ${
              value === "info"
                ? "bg-emerald-950 text-emerald-50"
                : "bg-emerald-50 text-emerald-950 border-2 border-emerald-950"
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setValue("uploads")}
            className={`px-4 py-2 rounded-t-md font-bold transition-transform hover:-translate-y-[1px] ${
              value === "uploads"
                ? "bg-emerald-950 text-emerald-50"
                : "bg-emerald-50 text-emerald-950 border-2 border-emerald-950"
            }`}
          >
            Uploads
          </button>
        </div>

        {/* TAB CONTENT */}
        {value === "library" && (
          <div className="flex flex-col gap-6">
            {films.length > 0 && (
              <div
                onScroll={handleScroll}
                className="flex overflow-x-auto pb-2 gap-3 no-scrollbar"
              >
                <div className="flex gap-3 flex-nowrap">
                  {isLoading ? (
                    <CustomLoading />
                  ) : isError ? (
                    <p className="text-red-500">Failed to load films</p>
                  ) : (
                    films.map((film) => (
                      <div key={film.film_uuid} className="flex-shrink-0">
                        <FilmCard film={film} />
                      </div>
                    ))
                  )}
                  {isFetchingNextPage && (
                    <div className="flex items-center justify-center text-sm text-emerald-950 animate-pulse flex-shrink-0">
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
                  {myPlaylists.map((pl: any, idx: number) => (
                    <PlaylistCard key={idx} playlist={pl} />
                  ))}
                </div>
              </div>
            )}

            <div>
              {/* <h2 className="text-2xl mb-2">Challenges</h2>
              {userChallengesLoading ? (
                <CustomLoading />
              ) : userChallengesError ? (
                <p className="text-red-500">Failed to load challenges</p>
              ) : (
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
              )} */}
            </div>
          </div>
        )}

        {value === "info" && (
          <div ref={infoRef} className="flex flex-col gap-3 mt-4">
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
            <p>
              <FiCalendar /> Joined: {user?.join_date || "N/A"}
            </p>
            {/* {user?.academic_status && (
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
        {value === "uploads" && (
          <div
            onScroll={handleScroll}
            className="flex flex-col gap-4 mt-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar"
          >
            <h2 className="text-2xl mb-2">Your Uploads</h2>

            {isLoading ? (
              <CustomLoading />
            ) : isError ? (
              <p className="text-red-500">Failed to load films</p>
            ) : films.length > 0 ? (
              <>
                {films.map((film) => (
                  <UploadFilmCard key={film.film_uuid} film={film} />
                ))}
                {isFetchingNextPage && (
                  <div className="text-center text-emerald-900 animate-pulse py-2">
                    Loading more uploads...
                  </div>
                )}
              </>
            ) : (
              <p className="text-emerald-900">
                You haven’t uploaded any films yet.
              </p>
            )}
          </div>
        )}

        {/* Edit modal */}
        <Transition show={openEdit} as={Fragment}>
          <Dialog onClose={() => setOpenEdit(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
              <Dialog.Panel className="bg-emerald-50 border-4 border-emerald-950 rounded-2xl p-4 max-w-lg w-full">
                <EditProfile
                  onSubmitSuccess={() => setOpenEdit(false)}
                  onCancel={() => setOpenEdit(false)}
                />
              </Dialog.Panel>
            </div>
          </Dialog>
        </Transition>
      </div>
    </AppLayout>
  );
};

export default UserProfile;
