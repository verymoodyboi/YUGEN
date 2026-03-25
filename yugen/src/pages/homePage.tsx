import * as React from "react";
import { useAuth } from "../contexts/AuthContext";
import FilmCard from "../components/filmCard-2x3";
import { useRecommendations } from "../features/recommendations/hooks/useHomPage";
import Loading from "../components/loading_kickflip";

const HomePage: React.FC = () => {
  const { userInfo } = useAuth();
  const {
    hottest,
    fresh,
    subscriptions,
    watchlist,
    community,
    isLoading,
    hottestRef,
    freshRef,
    subsRef,
    watchlistRef,
    communityRef,
  } = useRecommendations(userInfo?.auth_id);

  const renderSection = (
    title: string,
    films: any[],
    ref: React.Ref<HTMLDivElement>,
    subtitle?: string,
  ) => {
    if (!films?.length) return null;

    return (
      <section className="space-y-3">
        <div className="flex flex-col">
          <h2 className="text-2xl title text-emerald-950">| {title}</h2>
          {subtitle && (
            <p className="text-emerald-900/80 text-md italic">{subtitle}</p>
          )}
        </div>

        <div className="flex overflow-x-auto space-x-3 pb-2 pl-2 -mx-2">
          {films.map((film, index) => {
            const isLast = index === films.length - 1;
            return (
              <div
                key={film.film_uuid}
                className="flex-shrink-0"
                ref={isLast ? ref : null}
              >
                <FilmCard film={film} />
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <>
      <div className="space-y-10 px-4 py-6">
        {renderSection(
          `Top in ${userInfo?.region}`,
          community,
          communityRef,
          "Discover talented storytellers around you",
        )}
        {renderSection(
          "Hottest Picks",
          hottest,
          hottestRef,
          "Audience favorites at the moment",
        )}

        {renderSection(
          "Fresh Out of the Oven",
          fresh,
          freshRef,
          "Newest trending releases",
        )}

        {renderSection(
          "From Your Subscriptions",
          subscriptions,
          subsRef,
          "Films by filmmakers you follow",
        )}

        {renderSection(
          "From Your Watchlist",
          watchlist,
          watchlistRef,
          "Films on your watchlist",
        )}

        {isLoading && (
          <div className="flex justify-center py-4">
            <Loading />
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
