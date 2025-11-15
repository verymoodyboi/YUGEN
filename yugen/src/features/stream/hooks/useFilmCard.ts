import { useState, useEffect } from "react";
import { checkWatchlist } from "../../watchlist/services.ts";
import { toggleWatchlist } from "../../watchlist/services.ts";
import { useAuth } from "../../../contexts/AuthContext";

export const useFilm = (filmID?: string) => {
  const { userInfo, getAccessToken } = useAuth();
  const [watchlisted, setWatchlisted] = useState(false);

  useEffect(() => {
    if (filmID && userInfo?.auth_id) {
      (async () => {
        const token = await getAccessToken();
        const listed = await checkWatchlist(filmID, token);
        setWatchlisted(listed);
      })();
    }
  }, [filmID, userInfo?.auth_id]);

  const handleToggleWatchlist = async () => {
    if (!filmID) return;
    const token = await getAccessToken();
    const listed = await toggleWatchlist(filmID, token);
    setWatchlisted(listed);
  };

  return { watchlisted, handleToggleWatchlist };
};
