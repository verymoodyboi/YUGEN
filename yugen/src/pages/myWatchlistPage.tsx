// src/pages/WatchlistPage.tsx
import * as React from "react";
import AppLayout from "../layouts/layout-main";

import { useMyWatchlist } from "../features/watchlist/hooks/useGetMyWatchlist";
import FilmScrollRowDynamic from "../layouts/filmcard-scroll-h-dynamic";
import Loading from "../components/loading_kickflip";
const WatchlistPage: React.FC = () => {
  const { watchlist, loading, error } = useMyWatchlist();

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h1 className="text-4xl font-bold border-b-4 border-emerald-950  pb-2">
          My Watchlist
        </h1>
        <p className="text-sm text-emerald-900/70  mt-2 sm:mt-0">
          Save it, and watch it when the time is right
        </p>
      </div>
      <>
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-emerald-950/20 " />
          <span className="px-4 font-freckle text-lg text-emerald-950/80 ">
            Don`t forget about them!
          </span>
          <div className="flex-grow border-t border-emerald-950/20" />
        </div>{" "}
        {loading ? (
          <Loading />
        ) : watchlist.length === 0 ? (
          <p className="text-emerald-900 ">No films in your watchlist yet.</p>
        ) : (
          <FilmScrollRowDynamic films={watchlist.map((item) => item.films)} />
        )}
      </>
    </>
  );
};

export default WatchlistPage;
