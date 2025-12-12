import { useState, useEffect } from "react";
import { checkWatchlist, toggleWatchlist } from "../../watchlist/services.ts";
import { getUserInfo } from "../../../util/useInfo/getUserInfo.ts";
import { useAuth } from "../../../contexts/AuthContext";

export const useFilm = (filmID?: string, uploader_id?: string) => {
  const { userInfo, getAccessToken } = useAuth();
  const [watchlisted, setWatchlisted] = useState(false);

  const [uploader, setUploader] = useState<{
    username: string | null;
    pfp: string | null;
  }>({ username: null, pfp: null });

  // --- WATCHLIST ---
  useEffect(() => {
    if (filmID && userInfo?.auth_id) {
      (async () => {
        const token = await getAccessToken();
        const listed = await checkWatchlist(filmID, token);
        setWatchlisted(listed);
      })();
    }
  }, [filmID, userInfo?.auth_id]);

  // --- UPLOADER INFO ---
  useEffect(() => {
    if (uploader_id) {
      (async () => {
        const token = await getAccessToken();
        const info = await getUserInfo(uploader_id, token);
        setUploader(info);
      })();
    }
  }, [uploader_id]);

  const handleToggleWatchlist = async () => {
    if (!filmID) return;
    const token = await getAccessToken();
    const listed = await toggleWatchlist(filmID, token);
    setWatchlisted(listed);
  };

  return { watchlisted, handleToggleWatchlist, uploader };
};
