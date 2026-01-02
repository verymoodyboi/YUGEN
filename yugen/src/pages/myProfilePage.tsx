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
import EditProfile from "../features/profile/components/EditProfile";
import { Dialog, Transition } from "@headlessui/react";
import UploadFilmCard from "../features/profile/components/uploadedFilmsCard";
import { useSearchParams } from "react-router-dom";
import upload_button_static from "../YugenAssits/upload-button/Regular.png";
import upload_button_gif from "../YugenAssits/upload-button/Upload button modified REPEAT.gif";
import tempPFP from "../YugenAssits/Avatar_Placeholder.png";

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
import { Tooltip } from "@mui/material";

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
  const [searchParams] = useSearchParams();

  const paramTab = searchParams.get("to");

  const initialTab =
    paramTab === "uploads" || paramTab === "info" || paramTab === "library"
      ? paramTab
      : "library";

  const [value, setValue] = useState<"library" | "info" | "uploads">(
    initialTab
  );

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
    handleLocalPlaylistDelete,
    handleLocalPlaylistUpdate,
    playlistsLoading,
    myUploads,
    myUploadsData, // ✅ fixed
    fetchNextUploadsPage,
    hasNextUploadsPage,
    uploadsLoading,
    uploadsError,
  } = useMyProfile(user?.auth_id, getAccessToken);

  const [isHover, setIsHover] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.src = upload_button_gif;
  }, []);
  if (!user)
    return (
      <>
        <div className="flex items-center justify-center h-screen text-emerald-950 font-freckle">
          <Loading />
        </div>
      </>
    );
  const PFPurl = user?.pfp_path
    ? supabase.storage.from("pfps").getPublicUrl(user?.pfp_path).data
        .publicUrl +
      (user?.updated_at ? `?v=${new Date(user?.updated_at).getTime()}` : "")
    : tempPFP;
  return (
    <>
      <div className="min-h-screen  text-emerald-950 font-freckle p-4 flex flex-col gap-6">
        {/* HEADER */}
        <div className="flex flex-wrap gap-2 items-start justify-between w-full max-w-full overflow-x-hidden">
          {/* Profile Info */}
          <div className="flex gap-4 items-center">
            <img
              src={PFPurl}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== tempPFP) {
                  img.src = tempPFP;
                }
              }}
              alt="pfp"
              className="w-24 h-24 rounded-full border-4 border-emerald-950 object-cover"
            />

            <div>
              <h1 className="text-3xl">@{user?.username}</h1>
              <p className="flex items-center gap-2 mt-1 text-emerald-900">
                <Tooltip title="Films">
                  <FiVideo />
                </Tooltip>
                {user?.films_count}{" "}
                <Tooltip title="Subscrbiers">
                  <FiUsers />
                </Tooltip>{" "}
                {user?.sub_count}
              </p>
              <p className="flex items-center gap-2">
                <Tooltip title="Region">
                  <FiGlobe />
                </Tooltip>{" "}
                {user?.region || "N/A"}
              </p>

              {/* Social Links */}
              <div className="flex gap-3 mt-2">
                {user?.youtube && (
                  <Tooltip title="Youtube">
                    <FiYoutube
                      className="cursor-pointer hover:scale-110"
                      onClick={() => window.open(user.youtube, "_blank")}
                    />
                  </Tooltip>
                )}
                {user?.instagram && (
                  <Tooltip title="Instagram">
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

              {/* Bio Preview */}
              {user?.bio && (
                <div className="flex items-center gap-1">
                  <p className="font-freckle text-emerald-950 text-sm truncate max-w-[50%]">
                    {user?.bio?.slice(0, 50)}...
                  </p>
                  <Tooltip title="View more details">
                    <button
                      className="font-freckle text-emerald-950 underline text-sm flex-shrink-0 cursor-pointer"
                      onClick={(e) => {
                        setValue("info");
                        setTimeout(scrollToInfo, 150);
                      }}
                    >
                      more
                    </button>
                  </Tooltip>
                </div>
              )}

              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => setOpenEdit(true)}
                  className="px-4 py-2 rounded-full border-2 border-emerald-950 bg-emerald-950 text-emerald-50 font-bold transition hover:scale-105 flex items-center gap-2"
                >
                  <FiEdit3 className="inline" />
                  Edit Profile
                </button>

                {/* Mobile upload button */}
                <div className="md:hidden">
                  <Tooltip title="Upload">
                    <img
                      src={isHover ? upload_button_gif : upload_button_static}
                      onClick={() => navigate("/UploadFilmPage")}
                      onMouseEnter={() => setIsHover(true)}
                      onMouseLeave={() => setIsHover(false)}
                      className="h-12 w-12 cursor-pointer rounded-lg transition-transform duration-300 ease-in-out"
                      alt="upload_button"
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop upload button */}
          <div className="hidden md:block">
            <Tooltip title="Upload">
              <img
                src={isHover ? upload_button_gif : upload_button_static}
                onClick={() => navigate("/UploadFilmPage")}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                className="h-[150px] min-w-[75px] cursor-pointer rounded-lg transition-transform duration-300 ease-in-out"
                alt="upload_button"
              />
            </Tooltip>
          </div>
        </div>

        <div className="flex gap-4 border-b-2 border-emerald-950 pb-2">
          <button
            onClick={() => setValue("library")}
            className={`px-3 py-1.5 text-sm rounded-t-md font-semibold transition-transform hover:-translate-y-[1px] ${
              value === "library"
                ? "bg-emerald-950 text-emerald-50"
                : "bg-emerald-50 text-emerald-950 border-2 border-emerald-950"
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setValue("info")}
            className={`px-3 py-1.5 text-sm rounded-t-md font-semibold transition-transform hover:-translate-y-[1px] ${
              value === "info"
                ? "bg-emerald-950 text-emerald-50"
                : "bg-emerald-50 text-emerald-950 border-2 border-emerald-950"
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setValue("uploads")}
            className={`px-3 py-1.5 text-sm rounded-t-md font-semibold transition-transform hover:-translate-y-[1px] ${
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
                className="flex overflow-x-auto pb-2 gap-3 no-scrollbar max-h-100"
              >
                <div className="flex gap-3 flex-nowrap">
                  {isLoading ? (
                    <Loading />
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
                    <div
                      className="flex-shrink-0 flex items-center justify-center 
                  w-46 h-90 
                  rounded-xl"
                    >
                      <Loading />
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
                <div className="flex flex-wrap gap-4 justify-center">
                  {myPlaylists.map((pl: any, idx: number) => (
                    <PlaylistCard
                      key={idx}
                      playlist={pl}
                      onLocalChange={handleLocalPlaylistUpdate}
                      onLocalDelete={handleLocalPlaylistDelete}
                    />
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

            {uploadsLoading ? (
              <Loading />
            ) : uploadsError ? (
              <p className="text-red-500">Failed to load uploads</p>
            ) : myUploads.length > 0 ? (
              <>
                {myUploads.map((film) => (
                  <UploadFilmCard key={film.film_uuid} film={film} />
                ))}
                {hasNextUploadsPage && (
                  <div className="text-center text-emerald-900 animate-pulse py-2">
                    <Loading />
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
            <div className="fixed h-[100vh] inset-0 bg-black/40 flex items-center justify-center">
              <EditProfile
                onSubmitSuccess={() => setOpenEdit(false)}
                onCancel={() => setOpenEdit(false)}
              />
            </div>
          </Dialog>
        </Transition>
      </div>
    </>
  );
};

export default UserProfile;
