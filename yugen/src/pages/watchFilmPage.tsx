// src/pages/Watch.tsx
import * as React from "react";
import { useSearchParams } from "react-router-dom";
import Film from "../features/stream/components/film";
import { useAddHistory } from "../features/history/useHistory";
import AppLayout from "../layouts/layout-main";
import Thoughts from "../features/thoughts/components/thoughts";
import { useSimilarFilms } from "../features/recommendations/hooks/useSimilarFilms";
import SimilarFilmCard from "../features/recommendations/components/recommendedFilmCard";
import CustomLoading from "../SmallComponents/CutomsLoading";
import Loading from "../components/loading_kickflip";
import AuthActionGuard from "../components/clickWrapper";

const Watch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid");

  useAddHistory(uuid || undefined);

  const [activeTab, setActiveTab] = React.useState<"thoughts" | "recommended">(
    "thoughts",
  );

  const { films: similarFilms, isLoading } = useSimilarFilms(uuid || undefined);

  return (
    <>
      <div className="h-full w-full flex flex-col overflow-auto p-4">
        {uuid ? (
          <>
            <Film filmId={uuid} />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setActiveTab("thoughts")}
                className={`px-4 py-2 rounded-full border-2 font-bold shadow transition transform hover:-translate-y-[1px] ${
                  activeTab === "thoughts"
                    ? "bg-emerald-950 text-emerald-50 border-emerald-50"
                    : "bg-emerald-50 text-emerald-950 border-emerald-950 hover:bg-emerald-100"
                }`}
              >
                Thoughts
              </button>

              <button
                onClick={() => setActiveTab("recommended")}
                className={`px-4 py-2 rounded-full border-2 font-bold shadow transition transform hover:-translate-y-[1px] ${
                  activeTab === "recommended"
                    ? "bg-emerald-950 text-emerald-50 border-emerald-50"
                    : "bg-emerald-50 text-emerald-950 border-emerald-950 hover:bg-emerald-100"
                }`}
              >
                Recommended
              </button>
            </div>

            <div className="mt-4">
              {activeTab === "thoughts" && (
                <AuthActionGuard>
                  <Thoughts filmId={uuid} />
                </AuthActionGuard>
              )}

              {activeTab === "recommended" && (
                <div className="space-y-4">
                  {isLoading ? (
                    <Loading />
                  ) : similarFilms.length > 0 ? (
                    similarFilms.map((film) => (
                      <SimilarFilmCard key={film.film_uuid} film={film} />
                    ))
                  ) : (
                    <p className="text-emerald-900 font-freckle text-lg">
                      No similar films found yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-emerald-950 font-freckle text-xl">
            No film selected
          </p>
        )}
      </div>
    </>
  );
};

export default Watch;
