import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../lib/api";
 import { checkSubscriptionStatus,subscribeToArtist,
  unsubscribeFromArtist, } from "../../subscriptions/services";
import { toggleNotifyStatus } from "../../notifications/services";
import { fetchProfileFilms } from "../../recommendations/services";
import { fetchUserPlaylists } from "../../playlist/services/fetchUserPlaylist";
  import { fetchUserChallenges } from "../../challenges/services";

export function useViewProfile(username: string | null) {
  const { userInfo, getAccessToken } = useAuth();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isNotify, setIsNotify] = useState<boolean>(false);
  const [myPlaylists, setMyPlaylists] = useState<any[]>([]);

  useEffect(() => {
    const fetchAccount = async () => {
      if (!username) return;
      setLoading(true);
      try {
        const token = await getAccessToken();
        const { data } = await api.get("/view_profile/users/profile", {
          params: { username },
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching account:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [username]);


useEffect(() => {
  const loadSubscriptionStatus = async () => {
    if (!user?.auth_id || !userInfo?.auth_id) return;
    try {
      const token = await getAccessToken();
      const { isSubscribed, notify } = await checkSubscriptionStatus(
        user.auth_id,
        token
      );
      setIsSubscribed(isSubscribed);
      setIsNotify(notify);
    } catch (err) {
      console.error("Error checking subscription:", err);
      setIsSubscribed(false);
      setIsNotify(false);
    }
  };
  loadSubscriptionStatus();
}, [user?.auth_id, userInfo?.auth_id]);
const handleSubscribe = async () => {
  if (!user?.auth_id) return;
  try {
    const token = await getAccessToken();
    if (isSubscribed) {
      const { isSubscribed: sub, notify } = await unsubscribeFromArtist(
        user.auth_id,
        token
      );
      setIsSubscribed(sub);
      setIsNotify(notify);
    } else {
      const { isSubscribed: sub, notify } = await subscribeToArtist(
        user.auth_id,
        token
      );
      setIsSubscribed(sub);
      setIsNotify(notify);
    }
  } catch (err) {
    console.error("Error subscribing/unsubscribing:", err);
  }
};

  // === Toggle Notify ===

const handleNotify = async () => {
  if (!user?.auth_id) return;
  try {
    const token = await getAccessToken();
    const newNotify = !isNotify;
    await toggleNotifyStatus(user.auth_id, newNotify, token);
    setIsNotify(newNotify);
  } catch (err) {
    console.error("Error toggling notify:", err);
  }
};

  // === Fetch Films ===
const {
  data: filmPages,
  fetchNextPage,
  hasNextPage,
  isLoading: filmsLoading,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ["films", user?.auth_id],
  queryFn: async ({ pageParam = 0 }) =>
    fetchProfileFilms({
      offset: pageParam,
      limit: 10,
      uploaderID: user?.auth_id,
    }),
  initialPageParam: 0,
  getNextPageParam: (lastPage, pages) =>
    lastPage.length > 0 ? pages.length * 10 : undefined,
  enabled: !!user?.auth_id,
});

const films = filmPages?.pages.flat() ?? [];

  // === Fetch Playlists ===

useEffect(() => {
  const loadUserPlaylists = async () => {
    if (!user?.auth_id) return;
    try {
      const token = await getAccessToken();
      const playlists = await fetchUserPlaylists(user.auth_id, token);
      setMyPlaylists(playlists);
    } catch (err) {
      console.error("Error fetching playlists:", err);
    }
  };
  loadUserPlaylists();
}, [user?.auth_id]);

  // === Fetch Challenges ===

const {
  data: userChallengesData,
  isLoading: userChallengesLoading,
} = useInfiniteQuery({
  queryKey: ["userChallenges", user?.auth_id],
  queryFn: ({ pageParam = 0 }) =>
    fetchUserChallenges({ pageParam, auth_id: user?.auth_id! }),
  initialPageParam: 0,
  getNextPageParam: (lastPage, allPages) =>
    !lastPage || lastPage.length < 10 ? undefined : allPages.length * 10,
  enabled: !!user?.auth_id,
});

const userChallenges = userChallengesData?.pages.flat() ?? [];

  return {
    user,
    loading,
    isSubscribed,
    isNotify,
    handleSubscribe,
    handleNotify,
    films,
    filmsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    myPlaylists,
    userChallenges,
    userChallengesLoading,
  };
}
