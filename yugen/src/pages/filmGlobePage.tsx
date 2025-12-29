import AppLayout from "../layouts/layout-main";
import FilmGlobe from "../features/globe/components/filmGlobe";
import { FiFilm, FiUsers } from "react-icons/fi";

export default function FilmGlobePage(): JSX.Element {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <h1 className="text-4xl font-bold border-b-4 border-emerald-950  pb-2">
          Yūgen Map
        </h1>
        <p className="text-sm text-emerald-900/70  mt-2 sm:mt-0">
          Travel the world with stories.
        </p>
      </div>
      <div
        className="flex flex-col items-center w-full"
        style={{ height: "calc(100vh - 180px)" }}
      >
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
