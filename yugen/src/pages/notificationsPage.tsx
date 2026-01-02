// src/pages/NotificationsPage.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../layouts/layout-main";
import supabase from "../lib/supabaseClient";
import { useNotifications } from "../features/notifications/useNotifications";
import Loading from "../components/loading_kickflip";
import tempPoster from "../YugenAssits/Cover_Placeholder.png";
import tempPFP from "../YugenAssits/Avatar_Placeholder.png";

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, notificationsLoading, handleFetchNotifications } =
    useNotifications();

  React.useEffect(() => {
    handleFetchNotifications();
  }, []);

  // Helper to format relative time (same as original)
  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  return (
    <>
      <div className="flex flex-col h-full w-full font-freckle text-emerald-950 ">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
          <h1 className="text-4xl font-bold border-b-4 border-emerald-950  pb-2">
            Notifications
          </h1>
          <p className="text-sm text-emerald-900/70  mt-2 sm:mt-0">
            Catch up on the latest stories from your favourite storytellers
          </p>
        </div>

        {/* Notifications List */}
        {notificationsLoading ? (
          <Loading />
        ) : notifications.length === 0 ? (
          <p className="text-emerald-900">No notifications yet.</p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((film) => (
              <li
                key={film.film_uuid}
                onClick={() => navigate(`/watch?uuid=${film.film_uuid}`)}
                className="flex items-start gap-4 p-4 rounded-2xl border-2 border-emerald-950 bg-emerald-50 hover:bg-emerald-100 cursor-pointer transition-transform hover:scale-[1.01] shadow-[4px_4px_0_#064e3b]"
              >
                {/* Poster */}
                <img
                  src={
                    film.poster_path
                      ? supabase.storage
                          .from("posters")
                          .getPublicUrl(film.poster_path).data.publicUrl +
                        (film.updated_at
                          ? `?v=${new Date(film.updated_at).getTime()}`
                          : "")
                      : tempPoster
                  }
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== tempPoster) {
                      img.src = tempPoster;
                    }
                  }}
                  alt={film.film_title}
                  className="w-20 rounded-lg aspect-[2/3] object-cover border-2 border-emerald-950"
                />

                {/* Info */}
                <div className="flex justify-between flex-1">
                  {/* Film info */}
                  <div>
                    <h3 className="text-xl text-emerald-950">
                      {film.film_title}
                    </h3>
                    <p className="text-emerald-900/80 text-sm">
                      {Array.isArray(film.film_genre) &&
                      film.film_genre.length > 0
                        ? film.film_genre
                            .map((g: any) =>
                              g === "docuentry"
                                ? "Documentary"
                                : g.charAt(0).toUpperCase() + g.slice(1)
                            )
                            .join(", ")
                        : "No genre"}
                    </p>

                    <p className="text-emerald-900/70 text-sm italic">
                      {formatRelativeTime(film.release_date)}
                    </p>
                  </div>

                  {/* Uploader info */}
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={
                        film.uploader_pfp
                          ? supabase.storage
                              .from("pfps")
                              .getPublicUrl(film.uploader_pfp).data.publicUrl
                          : tempPFP
                      }
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src !== tempPFP) {
                          img.src = tempPFP;
                        }
                      }}
                      alt={film.uploader_username}
                      className="w-12 h-12 rounded-full border-2 border-emerald-950 object-cover mb-1"
                    />
                    <p className="text-emerald-950 text-sm">
                      {film.uploader_fname} {film.uploader_lname}
                    </p>
                    <p className="text-emerald-900/70 text-xs italic">
                      @{film.uploader_username}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default NotificationsPage;
