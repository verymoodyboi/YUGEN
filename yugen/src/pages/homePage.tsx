import * as React from "react";
import { useAuth } from "../contexts/AuthContext";
import AppLayout from "../layouts/layout-main";
import FilmCard from "../components/filmCard-2x3";
import { useRecommendations } from "../features/recommendations/hooks/useHomPage";
import CustomLoading from "../L3/CutomsLoading";

const HomePage: React.FC = () => {
  const { userInfo } = useAuth();
  const { hottest, fresh, subscriptions, watchlist, isLoading } =
    useRecommendations(userInfo?.auth_id);

  const renderSection = (
    title: string,
    films: any[],
    subtitle?: string,
    showIfEmpty = false
  ) => {
    if (!films?.length && !showIfEmpty) return null;

    return (
      <section className="space-y-2">
        <div className="flex flex-col">
          <h2 className="text-2xl font-freckle text-emerald-950">| {title}</h2>
          {subtitle && (
            <p className="text-emerald-900 text-sm italic"> {subtitle}</p>
          )}
        </div>

        <div className="flex overflow-x-auto space-x-3 pb-2 pl-2">
          {films.length > 0 ? (
            films.map((film) => <FilmCard key={film.film_uuid} film={film} />)
          ) : (
            <p className="text-emerald-700 text-sm italic">
              No films available.
            </p>
          )}
        </div>
      </section>
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-screen">
          <CustomLoading />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-10 px-4 py-6">
        {renderSection(
          "Hottest Picks",
          hottest,
          "Audiences` favourites at the moment"
        )}
        {renderSection(
          "Fresh Out of the Oven",
          fresh,
          "Newest trending releases"
        )}
        {renderSection(
          "From Your Subscriptions",
          subscriptions,
          "Films by filmmakers you follow"
        )}
        {renderSection(
          "From Your Watchlist",
          watchlist,
          "Films on your watchlist"
        )}
      </div>
    </AppLayout>
  );
};

export default HomePage;
