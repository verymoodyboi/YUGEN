// src/pages/HistoryPage.tsx
import * as React from "react";
import dayjs from "dayjs";
import AppLayout from "../layouts/layout-main";
import FilmScrollRowDynamic from "../layouts/filmcard-scroll-h-dynamic";
import { useHistory } from "../features/history/useHistory";
import Loading from "../components/loading_kickflip";
const HistoryPage: React.FC = () => {
  const { history, loading, error } = useHistory();

  // Group history by date
  const groupedHistory = history.reduce((acc: Record<string, any[]>, item) => {
    const dateKey = dayjs(item.watched_at).format("YYYY-MM-DD");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  return (
    <AppLayout>
      <div className="h-full w-full flex flex-col overflow-auto p-4">
        <h2 className="font-freckle text-2xl text-emerald-950 ">
          Watch history
        </h2>

        {loading && <Loading />}
        {error && (
          <p className="text-red-600 dark:text-red-400">
            Failed to load history.
          </p>
        )}
        {!loading && history.length === 0 && (
          <p className="text-emerald-900 ">No films in your history yet.</p>
        )}

        {!loading && history.length > 0 && (
          <div className="flex flex-col gap-10">
            {Object.entries(groupedHistory).map(([date, films]) => (
              <div key={date}>
                {/* Date divider */}
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-emerald-950/20 " />
                  <span className="px-4 font-freckle text-lg text-emerald-950 ">
                    {dayjs(date).format("MMMM D, YYYY")}
                  </span>
                  <div className="flex-grow border-t border-emerald-950/20" />
                </div>

                {/* Film scroll row */}
                <FilmScrollRowDynamic
                  films={films.map((h: any) => h.films)}
                  title=""
                  description=""
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HistoryPage;
