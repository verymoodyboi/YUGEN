import React from "react";
import FilmCard from "../components/filmCard-2x3";
import { Film } from "../features/stream/types/film";

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

      {/* Film row
          - -mx-4 cancels <main>'s p-4 so the row bleeds to the screen edges
          - px-4 puts the first/last card back in line with the page content
          - pt/pb leave room for shadows and hover scaling
          - overflow-y-hidden removed: it was clipping shadows/borders */}
      <div
        className="flex flex-row gap-3 overflow-x-auto -mx-4 px-4 pt-2 pb-4 min-h-[310px] snap-x scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
      >
        {films?.map((film) => (
          <div
            key={film.film_uuid}
            className="flex-shrink-0 min-w-[200px] snap-start"
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
