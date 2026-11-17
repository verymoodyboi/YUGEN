// src/pages/CountryPage.tsx
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FiFilm,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
} from "react-icons/fi";
import FilmCard from "../components/filmCard-2x3";
import AccountCard from "../components/AccountCard";
import { useGlobe } from "../features/globe/useGlobe";
import type { Film } from "../features/stream/types/film";
import tempPFP from "../YugenAssits/Avatar_Placeholder.png";
import tempPoster from "../YugenAssits/Cover_Placeholder.png";

/* -------------------------------------------------------------------------- */
/* Types & constants                                                          */
/* -------------------------------------------------------------------------- */

const TABS = ["films", "artists"] as const;
type Tab = (typeof TABS)[number];

interface UploaderInfo {
  username: string;
  pfp_path?: string | null;
}

// The API attaches the uploader under either `uploader` or `users`.
// If your Film type already declares these, drop this intersection.
type FeaturedFilm = Film & {
  uploader?: UploaderInfo | null;
  users?: UploaderInfo | null;
};

const getUploader = (film: FeaturedFilm): UploaderInfo | null =>
  film.uploader || film.users || null;

// film_genre can arrive as an array, a JSON string, or a plain string
const parseGenres = (raw: Film["film_genre"]): string[] => {
  try {
    const parsed: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) return parsed.map(String);
    return parsed ? [String(parsed)] : [];
  } catch {
    return typeof raw === "string" && raw ? [raw] : [];
  }
};

const FEATURED_COUNT = 8;
const AUTO_ADVANCE_MS = 4200;

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* -------------------------------------------------------------------------- */
/* Featured carousel                                                          */
/* Native scroll-snap track: swipe on touch, arrows/dots on desktop.          */
/* Owns all of its own state, so rotating never re-renders the page grid.     */
/* -------------------------------------------------------------------------- */

interface FeaturedSlideProps {
  film: FeaturedFilm;
  position: number;
  total: number;
  onOpenProfile: (username: string) => void;
  onWatch: (filmUuid: string) => void;
}

const FeaturedSlide = memo(function FeaturedSlide({
  film,
  position,
  total,
  onOpenProfile,
  onWatch,
}: FeaturedSlideProps) {
  const uploader = getUploader(film);
  const pfpPath = uploader?.pfp_path;

  // Cache-buster computed once per pfp (previously changed on every render)
  const pfpSrc = useMemo(
    () =>
      pfpPath
        ? `https://pfps.try-yugen.com/${pfpPath}?t=${Date.now()}`
        : tempPFP,
    [pfpPath],
  );

  const posterSrc = film.poster_path
    ? `https://posters.try-yugen.com/${film.poster_path}`
    : tempPoster;

  const genres = useMemo(() => parseGenres(film.film_genre), [film.film_genre]);
  const meta = [film.film_duration, genres.join(", ")]
    .filter(Boolean)
    .join(" • ");

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${position + 1} of ${total}`}
      className="flex-none w-full snap-center snap-always flex items-start gap-3 sm:gap-4 px-4 sm:px-8 pt-6 pb-8"
    >
      {/* Poster: click to watch, play icon appears on hover/focus */}
      <button
        type="button"
        onClick={() => onWatch(film.film_uuid)}
        aria-label={`Watch ${film.film_title}`}
        className="group relative block flex-shrink-0 h-[200px] aspect-[2/3] rounded-lg overflow-hidden border-2 border-emerald-950 shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-950 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-50"
      >
        <img
          src={posterSrc}
          alt=""
          loading={position === 0 ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallback) return;
            img.dataset.fallback = "1";
            img.src = tempPoster;
          }}
          className="w-full h-full object-cover select-none"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-emerald-950/0 group-hover:bg-emerald-950/30 group-focus-visible:bg-emerald-950/30 transition-colors duration-300 motion-reduce:transition-none">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-950 text-emerald-950 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:scale-100 transition duration-300 motion-reduce:transition-none">
            <FiPlay size={22} fill="currentColor" className="ml-0.5" />
          </span>
        </span>
      </button>

      {/* Details */}
      <div className="flex flex-col min-w-0 flex-1 h-[200px] gap-1 sm:gap-2">
        <h3 className="font-freckle text-base sm:text-xl leading-tight text-emerald-950 line-clamp-2 sm:line-clamp-1 sm:pr-28">
          {film.film_title}
        </h3>

        {meta && (
          <p className="text-xs sm:text-sm text-emerald-900/70 truncate sm:pr-28">
            {meta}
          </p>
        )}

        {film.thesis && (
          <p className="text-xs sm:text-sm leading-snug text-emerald-900 line-clamp-2">
            {film.thesis}
          </p>
        )}

        {uploader && (
          <button
            type="button"
            onClick={() => onOpenProfile(uploader.username)}
            className="mt-auto self-start max-w-full min-w-0 bg-white/90 px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-md flex items-center gap-2 sm:gap-3 border border-emerald-900/10 cursor-pointer text-left"
          >
            <img
              src={pfpSrc}
              alt=""
              onError={(e) => {
                const img = e.currentTarget;
                if (img.dataset.fallback) return;
                img.dataset.fallback = "1";
                img.src = tempPFP;
              }}
              className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full object-cover border border-emerald-900/20"
            />
            <div className="font-freckle text-base sm:text-lg text-emerald-950 truncate min-w-0 sm:max-w-[150px]">
              @{uploader.username}
            </div>
          </button>
        )}
      </div>
    </div>
  );
});

interface FeaturedCarouselProps {
  films: FeaturedFilm[];
}

const FeaturedCarousel = memo(function FeaturedCarousel({
  films,
}: FeaturedCarouselProps) {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Refs (not state) for everything the autoplay timer reads: no re-renders
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const inViewRef = useRef(true);
  const lastInteractionRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [index, setIndex] = useState(0);
  const count = films.length;
  const firstUuid = films[0]?.film_uuid;

  const goTo = useCallback(
    (target: number, smooth = true) => {
      const track = trackRef.current;
      if (!track || count === 0) return;
      const next = ((target % count) + count) % count;
      track.scrollTo({
        left: next * track.clientWidth,
        behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto",
      });
    },
    [count],
  );

  const markInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
  }, []);

  const handlePrev = useCallback(() => {
    markInteraction();
    goTo(indexRef.current - 1);
  }, [goTo, markInteraction]);

  const handleNext = useCallback(() => {
    markInteraction();
    goTo(indexRef.current + 1);
  }, [goTo, markInteraction]);

  const handleOpenProfile = useCallback(
    (username: string) => {
      navigate(`/@?username=${encodeURIComponent(username)}`);
    },
    [navigate],
  );

  const handleWatch = useCallback(
    (filmUuid: string) => {
      navigate(`/watch?uuid=${encodeURIComponent(filmUuid)}`);
    },
    [navigate],
  );

  // Keep the active dot in sync with the scroll position (once per frame)
  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const track = trackRef.current;
      if (!track || !track.clientWidth) return;
      const next = Math.round(track.scrollLeft / track.clientWidth);
      if (next !== indexRef.current) {
        indexRef.current = next;
        setIndex(next);
      }
    });
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  // New country / new film set -> back to the first slide
  useEffect(() => {
    goTo(0, false);
  }, [firstUuid, goTo]);

  // Only autoplay while the carousel is actually on screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry) inViewRef.current = entry.isIntersecting;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Autoplay: skips while hovered/focused, recently touched, hidden or offscreen
  useEffect(() => {
    if (count < 2 || prefersReducedMotion()) return;

    const id = window.setInterval(() => {
      if (pausedRef.current || document.hidden || !inViewRef.current) return;
      if (Date.now() - lastInteractionRef.current < AUTO_ADVANCE_MS) return;
      goTo(indexRef.current + 1);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(id);
  }, [count, goTo]);

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="Featured films"
      className="relative border-b border-emerald-900/15 bg-emerald-50/40"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") pausedRef.current = true;
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") pausedRef.current = false;
      }}
      onPointerDown={markInteraction}
      onFocus={() => {
        pausedRef.current = true;
      }}
      onBlur={() => {
        pausedRef.current = false;
      }}
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain hidden-scrollbar"
      >
        {films.map((film, i) => (
          <FeaturedSlide
            key={film.film_uuid}
            film={film}
            position={i}
            total={count}
            onOpenProfile={handleOpenProfile}
            onWatch={handleWatch}
          />
        ))}
      </div>

      {count > 1 && (
        <>
          {/* Rotation controls */}
          <div className="absolute right-8 top-6 hidden sm:flex gap-3">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous film"
              className="bg-white/90 border border-emerald-900/10
                       w-10 h-10 rounded-full flex items-center justify-center
                       text-emerald-900 hover:bg-white hover:scale-[1.05] active:scale-[0.95] transition-transform duration-150"
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next film"
              className="bg-white/90 border border-emerald-900/10
                       w-10 h-10 rounded-full flex items-center justify-center
                       text-emerald-900 hover:bg-white hover:scale-[1.05] active:scale-[0.95] transition-transform duration-150"
            >
              <FiChevronRight />
            </button>
          </div>

          {/* Position dots */}
          <div className="absolute bottom-1 left-0 right-0 flex justify-center">
            {films.map((film, i) => (
              <button
                key={film.film_uuid}
                type="button"
                aria-label={`Go to film ${i + 1}`}
                aria-current={i === index}
                onClick={() => {
                  markInteraction();
                  goTo(i);
                }}
                className="p-1.5"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i === index
                      ? "w-5 bg-emerald-950"
                      : "w-1.5 bg-emerald-900/30"
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
});

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const CountryPage = () => {
  const [searchParams] = useSearchParams();
  const countryName = searchParams.get("country");

  const {
    selectedCountry,
    countryStats,
    films,
    users,
    loading,
    loadMoreFilms,
    loadMoreUsers,
    handleCountryClick,
  } = useGlobe();

  const [activeTab, setActiveTab] = useState<Tab>("films");

  // Derived values: computed, not copied into state via effects
  const displayedFilms = useMemo(() => films.slice(0, 12), [films]);
  const displayedUsers = useMemo(() => users.slice(0, 9), [users]);
  const featuredFilms = useMemo(() => films.slice(0, FEATURED_COUNT), [films]);

  // Fetch data when country param changes
  useEffect(() => {
    if (countryName) handleCountryClick(countryName);
  }, [countryName, handleCountryClick]);

  // Infinite load near the bottom (one check per frame, passive listener)
  const loadMore = useCallback(() => {
    if (activeTab === "films") {
      loadMoreFilms();
    } else {
      loadMoreUsers();
    }
  }, [activeTab, loadMoreFilms, loadMoreUsers]);

  useEffect(() => {
    let frame: number | null = null;

    const handleScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        if (loading) return;
        const nearBottom =
          window.scrollY + window.innerHeight >=
          document.body.scrollHeight - 100;
        if (nearBottom) loadMore();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [loading, loadMore]);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-emerald-900/15   bg-transparent z-10 backdrop-blur-sm">
        <h1 className="font-freckle text-4xl tracking-tight text-emerald-950">
          {selectedCountry || "Unknown"}
        </h1>
        <div className="mt-2 flex gap-6 text-emerald-900/80 text-sm">
          <div className="flex items-center gap-2">
            <FiFilm className="text-emerald-900" />
            {countryStats?.film_count ?? 0} films
          </div>
          <div className="flex items-center gap-2">
            <FiUser className="text-emerald-900" />
            {countryStats?.artist_count ?? 0} artists
          </div>
        </div>
      </div>

      {/* Featured Section */}
      {featuredFilms.length > 0 && <FeaturedCarousel films={featuredFilms} />}

      {/* Tabs */}
      <div className="flex border-b border-emerald-900/15  z-10 bg-transparent backdrop-blur-sm">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-3 font-freckle text-lg transition-all
              ${
                activeTab === t
                  ? "text-emerald-950 border-b-2 border-emerald-950"
                  : "text-emerald-900/60 hover:text-emerald-900"
              }
              hover:scale-[1.03] active:scale-[0.97] duration-150`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-8 grid gap-8">
        {loading && (
          <div className="text-center py-10 text-emerald-900">Loading…</div>
        )}

        {!loading &&
          activeTab === "films" &&
          (displayedFilms.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-8 place-items-center">
              {displayedFilms.map((film) => (
                <FilmCard key={film.film_uuid} film={film} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-emerald-900">
              No films available.
            </div>
          ))}

        {!loading &&
          activeTab === "artists" &&
          (displayedUsers.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-8 place-items-center">
              {displayedUsers.map((u) => (
                <AccountCard key={u.username} account={u} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-emerald-900">
              No artists available.
            </div>
          ))}
      </div>
    </div>
  );
};

export default CountryPage;
