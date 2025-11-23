import React from "react";
import AppLayout from "../layouts/layout-main";
import GenreCard from "../features/genres/components/genreCard";
import { useGenresWithFilms } from "../features/genres/useGenres";
import Loading from "../components/loading_kickflip";
const GenresPage: React.FC = () => {
  const { genresWithFilms, loading } = useGenresWithFilms();

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col gap-10 text-emerald-950 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-50 px-4 sm:px-8 py-10 transition-colors duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <h1 className="text-4xl font-freckle font-bold border-b-4 border-emerald-950 dark:border-emerald-50 pb-2">
            Explore Genres
          </h1>
          <p className="text-sm text-emerald-900/70 dark:text-emerald-100/70 mt-2 sm:mt-0">
            Discover films by theme, tone, and feel.
          </p>
        </div>

        {/* Loading & Empty States */}
        {loading && (
          <div className="flex justify-center items-center py-20">
             <Loading />
          </div>
        )}

        {!loading && genresWithFilms.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <p className="text-lg font-freckle text-emerald-900/80 dark:text-emerald-100/80">
              No genres available at this time.
            </p>
          </div>
        )}

        {/* Genre Grid */}
        {!loading && genresWithFilms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {genresWithFilms.map((g) => (
              <GenreCard
                key={g.id || g.name}
                name={g.genre}
                description={g.overview}
                films={g.films}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default GenresPage;
