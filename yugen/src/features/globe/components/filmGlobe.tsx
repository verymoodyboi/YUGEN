// src/features/globe/components/FilmGlobe.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";
import { scaleSequentialSqrt } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import { useGlobe } from "../useGlobe";
import CountryModal from "./countryFilmsModal";
import { FiFilm, FiUser } from "react-icons/fi";
interface CountryFeature {
  type: "Feature";
  properties: {
    name: string;
    ADMIN: string;
    ISO_A3: string;
    [key: string]: any;
  };
  geometry: any;
}

const FilmGlobe: React.FC = () => {
  const globeRef = useRef<any>();
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [hoverD, setHoverD] = useState<CountryFeature | null>(null);

  const {
    selectedCountry,
    countryStats,
    films,
    hoverStats,
    handleCountryClick,
    handleCountryHover,
    closeDialog,
    loading,
    users,
    loadMoreFilms,
    loadMoreUsers,
  } = useGlobe();

  useEffect(() => {
    fetch("/world.geojson")
      .then((res) => res.json())
      .then((data) => setCountries(data.features))
      .catch((err) => console.error("Failed to load countries:", err));
  }, []);

  const colorScale = useMemo(
    () => scaleSequentialSqrt(interpolateYlOrRd).domain([0, 1]),
    []
  );

  const getColor = (d: CountryFeature) => colorScale(Math.random());

  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.1;
  }, []);

  return (
    <div className="flex items-top justify-center min-h-screen relative">
      {/* Tooltip */}
      {hoverD && (
        <div
          className="pointer-events-none absolute z-30 top-4 left-1/2 transform -translate-x-1/2 rounded-md px-3 py-2 text-center text-white text-sm shadow-lg"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(10,10,25,0.6))",
            backdropFilter: "blur(6px)",
            minWidth: 180,
          }}
        >
          <div className="font-bold text-emerald-100">
            {hoverD.properties.name}
          </div>
          {hoverStats[hoverD.properties.name] && (
            <div className="text-xs text-emerald-200 mt-1 flex items-center justify-center gap-3">
              <span className="flex items-center gap-1">
                <FiFilm className="text-white" />
                <span>
                  {hoverStats[hoverD.properties.name].film_count ?? 0} films
                </span>
              </span>
              <span className="flex items-center gap-1">
                <FiUser className="text-white" />
                <span>
                  {hoverStats[hoverD.properties.name].artist_count ?? 0} artists
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      <Globe
        ref={globeRef}
        width={1500}
        height={650}
        globeImageUrl="earth.png"
        backgroundImageUrl="galaxy.png"
        polygonsData={countries.filter((d) => d.properties.ISO_A3 !== "ATA")}
        polygonAltitude={(d) => (d === hoverD ? 0.06 : 0.01)}
        polygonCapColor={(d) => (d === hoverD ? "#002c22" : "#9cd5ac")}
        polygonSideColor={() => "rgba(63, 230, 41, 0.1)"}
        polygonStrokeColor={() => "#002c22"}
        polygonsTransitionDuration={200}
        onPolygonHover={(polygon) => {
          const country = polygon as CountryFeature;
          setHoverD(country);
          if (country?.properties?.name) {
            handleCountryHover(country.properties.name);
          }
        }}
        onPolygonClick={(polygon) => {
          const country = polygon as CountryFeature;
          if (country?.properties?.name) {
            handleCountryClick(country.properties.name);
          }
        }}
        lineHoverPrecision={0}
        enablePointerInteraction={true}
      />

      {/* Country Modal */}
      {selectedCountry && (
        <CountryModal
          open={!!selectedCountry}
          onClose={closeDialog}
          countryName={selectedCountry}
          countryStats={countryStats}
          films={films}
          users={users}
          loading={loading}
          loadMoreFilms={loadMoreFilms}
          loadMoreUsers={loadMoreUsers}
        />
      )}
    </div>
  );
};

export default FilmGlobe;
