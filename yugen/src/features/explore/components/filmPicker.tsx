import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLayoutEffect } from "react";
import AppLayout from "../../../layouts/layout-main";
import { motion, useAnimation } from "framer-motion";
import { FiPlay, FiRefreshCw, FiStar } from "react-icons/fi";
import supabase from "../../../lib/supabaseClient";
import { useRandomFilm } from "../hooks/useRandomFilm";
import { useNavigate } from "react-router-dom";
import { useFilm } from "../../stream/hooks/useFilmCard";
import tempPFP from "../../../YugenAssits/Avatar_Placeholder.png";

const SLOT_W = 180;
const SLOT_H = 270;
const SLOT_GAP = 24;
const SLOT_TOTAL = SLOT_W + SLOT_GAP;

const FilmPicker: React.FC<any> = () => {
  const navigate = useNavigate();
  const { films, loading, error, refetch } = useRandomFilm();
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedGlobalIndex, setSelectedGlobalIndex] = useState<number | null>(
    null
  );
  const [disabledRoll, setDisabledRoll] = useState(false);
  const [hoveringCenter, setHoveringCenter] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // create a long filmstrip visually using repetition of fetched films
  const visibleFilms = useMemo(() => {
    if (!films?.length) return [];
    const repeats = 10;
    return Array.from({ length: films.length * repeats }, (_, i) => ({
      ...films[i % films.length],
      uniqueId: `${films[i % films.length].film_uuid}-${i}`,
    }));
  }, [films]);

  const computeDistanceForGlobalIndex = (globalIndex: number) => {
    return globalIndex * SLOT_TOTAL - (containerWidth / 2 - SLOT_W / 2);
  };

  useEffect(() => {
    const onResize = () =>
      setContainerWidth(containerRef.current?.clientWidth ?? 0);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    if (!containerRef.current || films.length === 0) return;

    const width = containerRef.current.clientWidth;
    setContainerWidth(width);

    const startX = -(0 * SLOT_TOTAL - (width / 2 - SLOT_W / 2)) - 12;

    controls.set({ x: startX });
  }, [films, controls]);

  const roll = async () => {
    if (isRolling || disabledRoll || !films.length || containerWidth === 0)
      return;

    setIsRolling(true);
    setHoveringCenter(false);
    setShowModal(false);

    const baseCount = films.length;
    const targetIndex = Math.floor(Math.random() * baseCount);
    const loops = 3;
    const globalIndex = loops * baseCount + targetIndex;
    const distance = computeDistanceForGlobalIndex(globalIndex);

    if (isNaN(distance)) {
      console.warn("Invalid distance");
      setIsRolling(false);
      return;
    }

    await controls.start({
      x: -distance - 12,
      transition: { duration: 2.6, ease: [0.22, 1, 0.36, 1] },
    });

    setSelectedGlobalIndex(globalIndex);
    setIsRolling(false);
    setDisabledRoll(true);
  };

  const reset = async () => {
    setShowModal(false);
    setHoveringCenter(false);
    setSelectedGlobalIndex(null);
    setDisabledRoll(false);
    setIsRolling(false);

    await controls.start({
      x: -computeDistanceForGlobalIndex(0) - 12,
      transition: { duration: 0.45 },
    });
    await refetch();
  };

  const selectedFilm =
    selectedGlobalIndex !== null && visibleFilms.length > 0
      ? visibleFilms[selectedGlobalIndex % visibleFilms.length]
      : null;
  const { uploader } = useFilm(
    selectedFilm?.film_uuid,
    selectedFilm?.uploader_id
  );
  const hasSelectedFilm = selectedFilm !== null;

  return (
    <div className="min-h-screen bg-emerald-50 text-emerald-950 font-freckle py-12">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl border-4 border-emerald-950 bg-emerald-950/50 shadow-[inset_0_20px_30px_rgba(0,0,0,0.3),0_6px_20px_rgba(0,0,0,0.2)] h-[342px]"
      >
        {/* film strips on the side */}
        <div className="absolute left-0 top-0 h-full w-[60px] bg-emerald-950 border-r-4 border-emerald-950 z-100 flex flex-col justify-between py-3 px-3 z-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`l-${i}`}
              className="w-5 h-4 bg-emerald-50 rounded-sm mx-auto opacity-90"
            />
          ))}
        </div>
        <div className="absolute right-0 z-100 top-0 h-full w-[60px] bg-emerald-950 border-l-4 border-emerald-950 flex flex-col justify-between py-3 px-3 z-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`r-${i}`}
              className="w-5 h-4 bg-emerald-50 rounded-sm mx-auto opacity-90"
            />
          ))}
        </div>
        <div className="absolute left-0 top-0 h-full w-[160px] bg-gradient-to-r from-emerald-950 via-emerald-950/90 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-[160px] bg-gradient-to-l from-emerald-950 via-emerald-950/90 to-transparent z-20 pointer-events-none" />

        {/* center highlight frame */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none w-[180px] h-[270px] border-5  border-emerald-50 rounded-md" />

        {/* question mark before roll */}
        <motion.div
          key="question-mark"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: selectedGlobalIndex === null ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-[180px] h-[270px] border-2 border-emerald-950 rounded-md bg-emerald-50/50 shadow-inner pointer-events-none"
        >
          <span className="text-7xl text-emerald-950 select-none">?</span>
        </motion.div>

        {/* film strip */}
        <motion.div
          animate={controls}
          initial={{ x: 0 }}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center z-20"
          style={{ height: SLOT_H, willChange: "transform" }}
        >
          {visibleFilms.map((film, idx) => {
            const isCenter =
              selectedGlobalIndex !== null && idx === selectedGlobalIndex;
            const filter = isRolling
              ? "brightness(70%) saturate(0.9)"
              : selectedGlobalIndex === null
                ? "brightness(45%)"
                : isCenter
                  ? "none"
                  : "brightness(25%) grayscale(60%) blur(0.6px)";

            const posterUrl =
              supabase.storage.from("posters").getPublicUrl(film.poster_path)
                .data.publicUrl +
              (film.updated_at
                ? `?v=${new Date(film.updated_at).getTime()}`
                : "");

            return (
              <div
                key={film.uniqueId}
                className="flex-none"
                style={{ width: SLOT_TOTAL }}
              >
                <div className="relative mx-auto w-[180px] h-[270px] rounded-md overflow-hidden border-2 border-emerald-950 bg-black shadow-inner transition-all duration-500 ease-out">
                  <img
                    src={posterUrl}
                    alt={film.film_title}
                    className="w-full h-full object-cover transition-all duration-500"
                    style={{ filter }}
                    draggable={false}
                  />

                  {/* hover overlay on selected film */}
                  {isCenter && hoveringCenter && !isRolling && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 bg-emerald-950/90 text-emerald-50 flex flex-col items-center justify-center px-3 text-center"
                    >
                      <h3 className="text-lg font-semibold mb-1">
                        {film.film_title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <FiStar /> <span>{film.avg_rating}</span>
                      </div>
                      <div className="text-xs opacity-90">
                        {film.country} • {film.film_duration}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* hover capture zone */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40"
          style={{ width: SLOT_W, height: SLOT_H }}
          onMouseEnter={() => setHoveringCenter(true)}
          onMouseLeave={() => setHoveringCenter(false)}
          onClick={() => selectedFilm && setShowModal(true)}
        />
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={() => roll()}
          disabled={isRolling || disabledRoll}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg border-4 border-emerald-950 shadow-[6px_6px_0_0_#064e3b] transition-transform ${
            isRolling || disabledRoll
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-emerald-950 text-emerald-50 hover:scale-105"
          }`}
        >
          <FiPlay />
          Roll Film
        </button>

        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-emerald-950 bg-emerald-50 hover:scale-105"
        >
          <FiRefreshCw /> Reset
        </button>
      </div>

      {/* Film Modal */}
      {showModal && selectedFilm && (
        <div className="fixed inset-0 z-500 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28 }}
            className="relative z-50 max-w-4xl w-full mx-6"
          >
            <div className="bg-emerald-50 rounded-2xl p-6 border-4 border-emerald-950 shadow-[12px_12px_0_0_#064e3b] max-h-[90vh] hidden-scrollbar overflow-y-auto">
              <button
                onClick={(e) => {
                  setShowModal(false);
                }}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-emerald-950 font-bold text-[23px] rounded-full bg-emerald-50 border-2 border-emerald-950 hover:bg-emerald-100 transition"
              >
                ×
              </button>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 rounded-md overflow-hidden border-4 border-emerald-950 w-[288px] h-[432px]">
                  <img
                    src={
                      supabase.storage
                        .from("posters")
                        .getPublicUrl(selectedFilm.poster_path).data.publicUrl +
                      (selectedFilm.updated_at
                        ? `?v=${new Date(selectedFilm.updated_at).getTime()}`
                        : "")
                    }
                    alt={selectedFilm.film_title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">
                    {selectedFilm.film_title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span className="italic">{selectedFilm.country}</span>
                    <span>• {selectedFilm.film_duration}</span>
                    <span className="flex items-center gap-1">
                      <FiStar /> {selectedFilm.avg_rating}
                    </span>
                    <span>
                      • {new Date(selectedFilm.release_date).getFullYear()}
                      <>{() => {}}</>
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-emerald-900">
                    {selectedFilm.thesis}
                  </p>
                  {hasSelectedFilm && uploader.username && (
                    <div
                      className="hover:scale-105 flex items-center gap-1 w-[50%] cursor-pointer mb-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/@?username=${encodeURIComponent(
                            uploader?.username
                          )}`
                        );
                      }}
                    >
                      {uploader.pfp ? (
                        <img
                          src={
                            uploader.pfp
                              ? supabase.storage
                                  .from("pfps")
                                  .getPublicUrl(uploader.pfp).data.publicUrl +
                                `?v=${Date.now()}`
                              : tempPFP
                          }
                          alt="User avatar"
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-emerald-700" />
                      )}

                      <span className="text-[11px]">
                        {uploader.username && uploader.username.length > 9
                          ? `${uploader.username.slice(0, 9)}...`
                          : uploader.username}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedFilm.film_genre?.map((g: string) => (
                      <span
                        key={g}
                        className="px-3 py-1 rounded-full border border-emerald-950 text-xs"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        navigate(
                          `/watch?uuid=${encodeURIComponent(
                            selectedFilm.film_uuid
                          )}`
                        );
                      }}
                      className="px-5 py-2 rounded-lg bg-emerald-950 text-emerald-50 border-4 border-emerald-950 hover:scale-105 transition-transform"
                    >
                      Watch Film
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-5 py-2 rounded-lg border-2 border-emerald-950 hover:scale-105 transition-transform"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
export default FilmPicker;
