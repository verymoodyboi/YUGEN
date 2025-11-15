import React from "react";
import FilmCard from "../components/filmCard-2x3";

interface Film {
  film_uuid?: string;
  id?: string;
  [key: string]: any;
}

interface FilmScrollRowProps {
  films: Film[];
  title?: string;
  description?: string;
  isLoading?: boolean;
  isError?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

const FilmScrollRowDynamic: React.FC<FilmScrollRowProps> = ({
  films,
  title,
  description,
  isLoading,
  isError,
  fetchNextPage,
  isFetchingNextPage,
}) => {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!fetchNextPage || isFetchingNextPage) return;

    const target = e.currentTarget;
    const scrollRight = target.scrollLeft + target.clientWidth;
    const threshold = target.scrollWidth - 200;

    if (scrollRight >= threshold) {
      fetchNextPage();
    }
  };

  return (
    <section className="mb-8">
      {/* Title + description */}
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="font-freckle text-2xl text-emerald-950 dark:text-emerald-50">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-emerald-900 dark:text-emerald-200 text-sm mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Content states */}
      {isLoading && (
        <p className="text-emerald-900 dark:text-emerald-200">Loading…</p>
      )}
      {isError && <p className="text-red-500">Failed to load films</p>}

      {/* Film row */}
      <div
        className="flex flex-row gap-0 overflow-x-auto overflow-y-hidden pl-2 min-h-[310px]"
        onScroll={handleScroll}
      >
        {films?.map((film) => (
          <div
            key={film.film_uuid || film.id}
            className="flex-shrink-0 min-w-[200px]"
          >
            <FilmCard film={film} />
          </div>
        ))}

        {isFetchingNextPage && (
          <div className="flex items-center justify-center flex-shrink-0 min-w-[200px] text-emerald-500">
            Loading more…
          </div>
        )}
      </div>
    </section>
  );
};

export default FilmScrollRowDynamic;
