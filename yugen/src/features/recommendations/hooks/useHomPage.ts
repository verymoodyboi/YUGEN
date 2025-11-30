import { useEffect, useState, useRef } from "react";
import {
  fetchHotThisWeek,
  fetchRecommended,
  fetchFilmsByGenre,
  getHomeRecommendations,
} from "../services";

export function useRecommendations(userId?: string) {
  // ---------------------------
  // STATE
  // ---------------------------
  const [hottest, setHottest] = useState<any[]>([]);
  const [fresh, setFresh] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(true);

  // keep offsets for each section
  const offsets = useRef({
    hottest: 0,
    fresh: 0,
    subscriptions: 0,
    watchlist: 0,
  });

  // refs for last-item observers
  const hottestRef = useRef<HTMLDivElement | null>(null);
  const freshRef = useRef<HTMLDivElement | null>(null);
  const subsRef = useRef<HTMLDivElement | null>(null);
  const watchlistRef = useRef<HTMLDivElement | null>(null);

  // ---------------------------
  // INITIAL LOAD
  // ---------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await getHomeRecommendations(userId);

      setHottest(res.hottest || []);
      setFresh(res.fresh || []);
      setSubscriptions(res.subscriptions || []);
      setWatchlist(res.watchlist || []);

      offsets.current = {
        hottest: res.hottest?.length || 0,
        fresh: res.fresh?.length || 0,
        subscriptions: res.subscriptions?.length || 0,
        watchlist: res.watchlist?.length || 0,
      };

      setLoading(false);
    }

    load();
  }, [userId]);

  // ---------------------------
  // LOAD MORE HANDLERS
  // ---------------------------
  const loadMore = {
    hottest: async () => {
      const more = await fetchHotThisWeek(offsets.current.hottest);
      offsets.current.hottest += more.length;
      setHottest((prev) => [...prev, ...more]);
    },
    fresh: async () => {
      const more = await fetchFilmsByGenre("latest", offsets.current.fresh);
      offsets.current.fresh += more.length;
      setFresh((prev) => [...prev, ...more]);
    },
    subscriptions: async () => {
      if (!userId) return;
      const more = await fetchRecommended(userId, offsets.current.subscriptions);
      offsets.current.subscriptions += more.length;
      setSubscriptions((prev) => [...prev, ...more]);
    },
    watchlist: async () => {
      // you did not give a watchlist service → so we DO NOT create one.
      // we simply do nothing.
      return;
    },
  };

  // ---------------------------
  // OBSERVER
  // ---------------------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const section = entry.target.getAttribute("data-section");

          if (section && loadMore[section as keyof typeof loadMore]) {
            loadMore[section as keyof typeof loadMore]();
          }
        });
      },
      {
        root: null,
        threshold: 1.0,
      }
    );

    const targets = [
      { ref: hottestRef, id: "hottest" },
      { ref: freshRef, id: "fresh" },
      { ref: subsRef, id: "subscriptions" },
      { ref: watchlistRef, id: "watchlist" },
    ];

    targets.forEach(({ ref, id }) => {
      if (ref.current) {
        ref.current.setAttribute("data-section", id);
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, [userId]);

  return {
    hottest,
    fresh,
    subscriptions,
    watchlist,
    isLoading,
    hottestRef,
    freshRef,
    subsRef,
    watchlistRef,
  };
}
