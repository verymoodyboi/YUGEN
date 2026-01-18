import * as React from "react";
import { useSearchParams } from "react-router-dom";
import AppLayout from "../layouts/layout-main";
import supabase from "../lib/supabaseClient";
import { useFilmsByGenre } from "../features/recommendations/hooks/useFilmsByGenre";
import { useGenresWithFilms } from "../features/genres/useGenres";
import FilmCard from "../components/filmCard-2x3";
import { FiStar, FiEye } from "react-icons/fi";
import Loading from "../components/loading_kickflip";
const GenrePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const genreName = searchParams.get("genre") || undefined;

  const { films, loading, hasMore, fetchNextPage } = useFilmsByGenre(genreName);
  const { genres, loading: genresLoading } = useGenresWithFilms();

  const genreInfo = React.useMemo(
    () => genres?.find((g) => g.genre === genreName),
    [genres, genreName]
  );

  const mainPoster =
    films.length > 0
      ? supabase.storage.from("posters").getPublicUrl(films[0].poster_path).data
          .publicUrl
      : undefined;

  const topFilm = films[0];

  React.useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 400
      ) {
        if (hasMore && !loading) fetchNextPage();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, fetchNextPage]);

  return (
    <>
      <div className="flex flex-col space-y-10 text-emerald-950 ">
        {/* === HERO SECTION === */}
        <div className=" w-full rounded-3xl  overflow-hidden border border-emerald-950/30 shadow-lg bg-emerald-950 ">
          {/* Background Poster (faded) */}
          {mainPoster && (
            <>
              <div
                className=" inset-0 bg-cover bg-center opacity-70"
                style={{ backgroundImage: `url(${mainPoster})` }}
              />
              <div className=" inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-950/50 to-transparent" />
            </>
          )}

          {/* Foreground Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 p-6 md:p-10">
            {/* === Left Main Poster (with hover overlay) === */}
            <div className="relative w-[240px] aspect-[2/3] rounded-xl overflow-hidden border-2 border-emerald-950 shadow-md flex-shrink-0 group cursor-pointer bg-emerald-950">
              {mainPoster && (
                <>
                  <img
                    src={mainPoster}
                    alt={`${genreName} Poster`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-emerald-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <h4 className="text-emerald-50 text-sm font-freckle truncate">
                      {topFilm?.film_title || "Untitled"}
                    </h4>
                    <div className="flex items-center justify-between text-emerald-100 text-xs mt-1">
                      <span className="flex items-center gap-1">
                        <FiStar className="text-yellow-400" />{" "}
                        {topFilm?.avg_rating ?? "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiEye /> {topFilm?.view_count ?? 0}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* === Genre Info Right === */}
            <div className="flex flex-col justify-center gap-4 max-w-3xl text-emerald-50 drop-shadow-lg">
              <h1 className="text-4xl md:text-5xl font-freckle font-bold tracking-wide">
                {genreName}
              </h1>
              <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed">
                {genreInfo?.overview ||
                  "Explore captivating stories and unforgettable moments in this genre."}
              </p>
            </div>
          </div>
        </div>

        {/* === FILMS GRID === */}
        <section className="flex flex-col space-y-4">
          <h2 className="font-freckle text-2xl border-b-4 border-emerald-950 pb-1">
            Top {genreName} Films
          </h2>

          {loading && films.length === 0 && <Loading />}

          {!loading && films.length === 0 && (
            <p className="text-emerald-950 ">No films found in this genre.</p>
          )}

          {/* Film Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {films.map((film) => (
              <FilmCard key={film.film_uuid} film={film} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center py-4 text-emerald-950 animate-pulse">
              Thats it for now!
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default GenrePage;
