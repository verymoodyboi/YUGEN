// src/features/globe/useGlobe.ts
import { useState, useCallback } from "react";
import {
  fetchFilmsByCountry,
  fetchCountryStats,
  fetchUsersByCountry,
} from "./services";
import { Film } from "../stream/types/film";
import { useToast } from "../../components/toaster";

interface CountryStats {
  film_count: number | null;
  artist_count: number | null;
}

export const useGlobe = () => {
    const toast = useToast()
  
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countryStats, setCountryStats] = useState<CountryStats | null>(null);
  const [films, setFilms] = useState<Film[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filmOffset, setFilmOffset] = useState(0);
  const [userOffset, setUserOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverStats, setHoverStats] = useState<Record<string, CountryStats>>({});

  const FILM_LIMIT = 12;
  const USER_LIMIT = 9;


const handleCountryClick = useCallback(async (countryName: string) => {
  if (!countryName) return;
  setLoading(true);
  setError(null);
  setFilmOffset(0);
  setUserOffset(0);

  try {
    const [stats, filmsData, usersData] = await Promise.all([
      fetchCountryStats(countryName),
      fetchFilmsByCountry(countryName),
      fetchUsersByCountry(countryName),
    ]);

    const filmCount = filmsData?.length || 0;

    if (filmCount === 0) {
      toast.warn(`No films uploaded from ${countryName} yet!`);
      return; 
    }

    setSelectedCountry(countryName);
    setCountryStats(stats || { film_count: 0, artist_count: 0 });
    setFilms(filmsData || []);
    setUsers(usersData?.data || usersData || []);
  } catch (err: any) {
    setError(err.message || "Failed to load data");
    toast.error(`Failed to load data for ${countryName}`);
  } finally {
    setLoading(false);
  }
}, []);

  // Load more films when scrolling
  const loadMoreFilms = useCallback(async () => {
    if (!selectedCountry) return;
    setLoadingMore(true);
    try {
      const newOffset = filmOffset + FILM_LIMIT;
      const moreFilms = await fetchFilmsByCountry(
        selectedCountry,
        FILM_LIMIT,
        newOffset
      );
      if (moreFilms.length > 0) {
        setFilms((prev) => [...prev, ...moreFilms]);
        setFilmOffset(newOffset);
      }
    } catch (err) {
      console.error("Failed to load more films", err);
    } finally {
      setLoadingMore(false);
    }
  }, [selectedCountry, filmOffset]);

  // Load more users (artists)
  const loadMoreUsers = useCallback(async () => {
    if (!selectedCountry) return;
    setLoadingMore(true);
    try {
      const newOffset = userOffset + USER_LIMIT;
      const moreUsers = await fetchUsersByCountry(
        selectedCountry,
        USER_LIMIT,
        newOffset
      );
      if (moreUsers?.data?.length || moreUsers.length) {
        const u = moreUsers?.data || moreUsers;
        setUsers((prev) => [...prev, ...u]);
        setUserOffset(newOffset);
      }
    } catch (err) {
      console.error("Failed to load more users", err);
    } finally {
      setLoadingMore(false);
    }
  }, [selectedCountry, userOffset]);

  const handleCountryHover = useCallback(
    async (countryName: string) => {
      if (!countryName || hoverStats[countryName]) return;
      try {
        const stats = await fetchCountryStats(countryName);
        if (stats)
          setHoverStats((prev) => ({ ...prev, [countryName]: stats }));
      } catch {
      }
    },
    [hoverStats]
  );

  const closeDialog = useCallback(() => {
    setSelectedCountry(null);
    setCountryStats(null);
    setFilms([]);
    setUsers([]);
  }, []);

  return {
    selectedCountry,
    countryStats,
    films,
    users,
    loading,
    loadingMore,
    error,
    hoverStats,
    handleCountryClick,
    handleCountryHover,
    closeDialog,
    loadMoreFilms,
    loadMoreUsers,
  };
};
