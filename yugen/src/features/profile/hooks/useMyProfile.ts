import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchLatestUserFilms } from "../../recommendations/services";
import { fetchMyPlaylists } from "../../playlist/services/fetchMyPlaylists";
import { fetchUserChallenges } from "../../challenges/services";
import { fetchMyUploads } from "../services";

export function useMyProfile(uploaderID?: string, getAccessToken?: () => Promise<string>) {
  const filmsQuery = useInfiniteQuery({
    queryKey: ["films", uploaderID],
    queryFn: ({ pageParam = 0 }) =>
      fetchLatestUserFilms({ pageParam, uploaderID: uploaderID! }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage && lastPage.length > 0 ? pages.length * 3 : undefined,
    enabled: !!uploaderID,
  });

  const data = filmsQuery.data;
  const fetchNextPage = filmsQuery.fetchNextPage;
  const hasNextPage = filmsQuery.hasNextPage;
  const isLoading = filmsQuery.isLoading;
  const isError = filmsQuery.isError;
  const isFetchingNextPage = filmsQuery.isFetchingNextPage;
  const films = data?.pages.flat() ?? [];

  const uploadsQuery = useInfiniteQuery({
    queryKey: ["myUploads", uploaderID],
    queryFn: ({ pageParam = 0 }) =>
      fetchMyUploads({ pageParam, uploaderID: uploaderID! }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      !lastPage || lastPage.length < 10 ? undefined : allPages.length * 10,
    enabled: !!uploaderID,
  });

  const myUploadsData = uploadsQuery.data;
  const myUploads = myUploadsData?.pages.flat() ?? [];
  const fetchNextUploadsPage = uploadsQuery.fetchNextPage;
  const hasNextUploadsPage = uploadsQuery.hasNextPage;
  const uploadsLoading = uploadsQuery.isLoading;
  const uploadsError = uploadsQuery.isError;

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
        setMyPlaylists(res.playlists ?? res);
      } catch (err) {
        console.error("Error fetching playlists:", err);
      } finally {
        if (mounted) setPlaylistsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [uploaderID, getAccessToken]);

  const handleLocalPlaylistUpdate = (playlist_uuid: string, updates: any) => {
    setMyPlaylists((prev) =>
      prev.map((p) => (p.playlist_uuid === playlist_uuid ? { ...p, ...updates } : p))
    );
  };

  const handleLocalPlaylistDelete = (playlist_uuid: string) => {
    setMyPlaylists((prev) => prev.filter((p) => p.playlist_uuid !== playlist_uuid));
  };

  // const challengesQuery = useInfiniteQuery({
  //   queryKey: ["userChallenges", uploaderID],
  //   queryFn: ({ pageParam = 0 }) =>
  //     fetchUserChallenges({ pageParam, auth_id: uploaderID! }),
  //   initialPageParam: 0,
  //   getNextPageParam: (lastPage, allPages) =>
  //     !lastPage || lastPage.length < 10 ? undefined : allPages.length * 10,
  //   enabled: !!uploaderID,
  // });

  // const userChallengesData = challengesQuery.data;
  // const userChallengesLoading = challengesQuery.isLoading;
  // const userChallengesError = challengesQuery.isError;
  // const userChallenges = userChallengesData?.pages.flat() ?? [];

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    isFetchingNextPage,
    films,

    myUploadsData,
    myUploads,
    fetchNextUploadsPage,
    hasNextUploadsPage,
    uploadsLoading,
    uploadsError,

    myPlaylists,
    playlistsLoading,
    handleLocalPlaylistDelete,
    handleLocalPlaylistUpdate,

    // userChallengesData,
    // userChallengesLoading,
    // userChallengesError,
    // userChallenges,
  };
}
