// src/pages/WatchlistPage.tsx
import * as React from "react";
import AppLayout from "../layouts/layout-main";

import { useMyWatchlist } from "../features/watchlist/hooks/useGetMyWatchlist";
import FilmScrollRowDynamic from "../layouts/filmcard-scroll-h-dynamic";
import Loading from "../components/loading_kickflip";
const WatchlistPage: React.FC = () => {
  const { watchlist, loading, error } = useMyWatchlist();

  return (
    <AppLayout>
      <h2 className="font-freckle text-2xl text-emerald-950 ">My Watchlist</h2>

      {loading ? (
        <Loading />
      ) : watchlist.length === 0 ? (
        <p className="text-emerald-900 ">No films in your watchlist yet.</p>
      ) : (
        <FilmScrollRowDynamic
          films={watchlist.map((item) => item.films)}
          description="All the films you’ve saved to watch later."
        />
      )}
    </AppLayout>
  );
};

export default WatchlistPage;
