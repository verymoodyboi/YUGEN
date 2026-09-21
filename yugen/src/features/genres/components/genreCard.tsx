import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiStar, FiEye } from "react-icons/fi";
import tempPoster from "../../../YugenAssits/Cover_Placeholder.png";

interface FilmThumb {
  poster_path: string;
  film_uuid?: string;
  film_title?: string;
  avg_rating?: number;
  view_count?: number;
}

interface GenreCardProps {
  name: string;
  description?: string;
  films?: FilmThumb[];
}

const GenreCard: React.FC<GenreCardProps> = ({
  name,
  description,
  films = [],
}) => {
  const navigate = useNavigate();

  const mainPoster =
    films.length > 0
      ? `https://posters.try-yugen.com/${films[0].poster_path}`
      : tempPoster;

  return (
    <div className="relative bg-emerald-50 text-emerald-950 rounded-3xl overflow-hidden shadow-lg border-emerald-950  hover:scale-105 hover:shadow-[4px_4px_0_0_#064e3b] transition-all duration-300 border-4 border-emerald-950">
      {mainPoster && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-500"
            style={{ backgroundImage: `url(${mainPoster})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/40 via-emerald-50/30 to-transparent" />
        </>
      )}

      <div className="relative z-10 p-6 flex flex-col gap-4">
        <div className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
          <h3 className="text-3xl font-freckle font-semibold mb-1 text-emerald-950 drop-shadow-sm">
            {name || "Untitled Genre"}
          </h3>
          {description && (
            <p className="text-md text-emerald-950/90 max-w-3xl drop-shadow-sm">
              {description}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex gap-4">
            {[
              ...films.slice(0, 3),
              ...Array(Math.max(0, 3 - films.length)).fill(null),
            ].map((f, idx) => (
              <div
                key={idx}
                className="relative aspect-[2/3] w-32 rounded-lg overflow-hidden border border-emerald-950 shadow-sm cursor-pointer group bg-emerald-950"
                onClick={(e) => {
                  e.stopPropagation;
                  if (f) {
                    navigate(`/watch?uuid=${f.film_uuid}`);
                  }
                }}
              >
                {f ? (
                  <>
                    <img
                      src={
                        f.poster_path
                          ? `https://posters.try-yugen.com/${f.poster_path}`
                          : tempPoster
                      }
                      alt={f.film_title || `${name} film`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-emerald-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                      <h4 className="text-emerald-50 text-sm font-freckle truncate">
                        {f.film_title || "Untitled"}
                      </h4>
                      <div className="flex items-center justify-between text-emerald-100 text-xs mt-1">
                        <span className="flex items-center gap-1">
                          <FiStar className="text-yellow-400" />{" "}
                          {f.avg_rating ?? "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiEye /> {f.view_count ?? 0}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-emerald-950" />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate(`/genre?genre=${encodeURIComponent(name)}`)}
            className="self-start flex items-center gap-1 px-3 py-1.5 rounded-full border border-emerald-950 bg-emerald-950 text-emerald-50 text-xs font-freckle hover:bg-emerald-900 hover:translate-x-1 transition-transform duration-300"
          >
            Explore {name}{" "}
            <FiArrowRight className="text-emerald-50" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenreCard;
