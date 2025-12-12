import AppLayout from "../layouts/layout-main";
import FilmGlobe from "../features/globe/components/filmGlobe";
import { FiFilm, FiUsers } from "react-icons/fi";

export default function FilmGlobePage(): JSX.Element {
  return (
    <>
      <div
        className="flex flex-col items-center w-full"
        style={{ height: "calc(100vh - 120px)" }}
      >
        {/*  Header */}
        <div className="w-full max-w-6xl mb-6 p-6 bg-emerald-50 border-4 border-emerald-950 rounded-2xl shadow-lg flex items-center justify-between gap-6">
          <div className="flex-1 flex flex-col justify-center gap-2 text-emerald-950">
            <h1 className="text-5xl font-freckle drop-shadow-lg">Film map</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-16 h-1 bg-emerald-950 rounded-full" />
              <span className="text-emerald-950 font-bold text-sm tracking-widest">
                DISCOVER
              </span>
              <div className="w-16 h-1 bg-emerald-950 rounded-full" />
            </div>
            <p className="text-lg">Culture rich, from all around the globe!</p>
          </div>

          <div className="flex gap-3">
            <div className="bg-emerald-50 border-2 border-emerald-950 rounded-lg p-3 w-32 shadow-md hover:shadow-[4px_4px_0_0_#064e3b] transition-transform hover:scale-105 cursor-crosshair flex flex-col items-center gap-2">
              <FiFilm size={28} className="text-emerald-950" />
              <h3 className="font-bold text-emerald-950">Films</h3>
              <p className="text-xs text-emerald-950 mt-1 text-center">
                Worldwide collection
              </p>
            </div>
            <div className="bg-emerald-50 border-2 border-emerald-950 rounded-lg p-3 w-32 shadow-md hover:shadow-[4px_4px_0_0_#064e3b] transition-transform hover:scale-105 cursor-crosshair flex flex-col items-center gap-2">
              <FiUsers size={28} className="text-emerald-950" />
              <h3 className="font-bold text-emerald-950">Artists</h3>
              <p className="text-xs text-emerald-950 mt-1 text-center">
                From all continents
              </p>
            </div>
          </div>
        </div>
        <div
          className="flex-1 w-full max-w-6xl flex items-center justify-center cursor-crosshair relative"
          style={{
            minHeight: 0,
            borderRadius: "2rem",
            overflow: "hidden",
            position: "relative",
            background: "transparent",
          }}
        >
          <FilmGlobe />

          <div
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{
              background: `radial-gradient(
        circle at center,
        rgba(16,64,32,0.0) 40%,    /* soft near center */
        rgba(16,64,32,0.2) 70%,   /* medium strength mid edges */
        rgba(16,64,32,0.45) 100%  /* strong outer edges */
      )`,
              zIndex: 1,
            }}
          />

          <div
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{
              boxShadow: "0 0 400px 300px rgba(16,64,32,0.08) inset",
              zIndex: 0,
            }}
          />
        </div>
      </div>
    </>
  );
}
