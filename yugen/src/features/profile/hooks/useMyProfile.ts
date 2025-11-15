// src/features/profile/hooks/useMyProfile.ts
import { useEffect, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchLatestUserFilms } from "../../recommendations/services";
import { fetchMyPlaylists } from "../../playlist/services/fetchMyPlaylists";
import { fetchUserChallenges } from "../../challenges/services";

export function useMyProfile(uploaderID?: string, getAccessToken?: () => Promise<string>) {
  // ---- Films (mirrors your current useInfiniteQuery names) ----
  const filmsQuery = useInfiniteQuery({
    queryKey: ["films", uploaderID],
    queryFn: ({ pageParam = 0 }) =>
      fetchLatestUserFilms({ pageParam, uploaderID: uploaderID! }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage && lastPage.length > 0 ? pages.length * 3 : undefined,
    enabled: !!uploaderID,
  });

  // keep original names your component expects:
  const data = filmsQuery.data; // pages structure
  const fetchNextPage = filmsQuery.fetchNextPage;
  const hasNextPage = filmsQuery.hasNextPage;
  const isLoading = filmsQuery.isLoading;
  const isError = filmsQuery.isError;
  const isFetchingNextPage = filmsQuery.isFetchingNextPage;

  // convenience flattened films array (your component used this pattern already)
  const films = data?.pages.flat() ?? [];

  // ---- Playlists (keeps the `myPlaylists` name used in component) ----
  const [myPlaylists, setMyPlaylists] = useState<any[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!uploaderID || !getAccessToken) return;
      setPlaylistsLoading(true);
      try {
        const token = await getAccessToken();
        const res = await fetchMyPlaylists(token);
        if (!mounted) return;
        // fetchMyPlaylists returns res.data in your service; if it returns {playlists: [...]}, normalize:
        setMyPlaylists(res.playlists ?? res);
      } catch (err) {
        console.error("Error fetching playlists:", err);
      } finally {
        if (mounted) setPlaylistsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [uploaderID, getAccessToken]);

  // ---- Challenges (paginated) ----
 
const challengesQuery = useInfiniteQuery({
  queryKey: ["userChallenges", uploaderID],
  queryFn: ({ pageParam = 0 }) =>
    fetchUserChallenges({ pageParam, auth_id: uploaderID! }),
  initialPageParam: 0,
  getNextPageParam: (lastPage, allPages) =>
    !lastPage || lastPage.length < 10 ? undefined : allPages.length * 10,
  enabled: !!uploaderID,
});

const userChallengesData = challengesQuery.data;
const userChallengesLoading = challengesQuery.isLoading;
const userChallengesError = challengesQuery.isError;
const userChallenges = userChallengesData?.pages.flat() ?? [];

  // ---- return exact names used in your component so you can drop it in ----
  return {
    // Films (same shape your file expects)
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    isFetchingNextPage,
    // convenience
    films,

    // Playlists (same variable name used in component)
    myPlaylists,
    playlistsLoading,

    // Challenges (same variables used in component)
    userChallengesData,
    userChallengesLoading,
    userChallengesError,
    userChallenges,
  };
}
