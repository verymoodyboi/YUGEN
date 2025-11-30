// src/pages/SearchPage.tsx
import * as React from "react";
import { useSearchParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import AppLayout from "../layouts/layout-main";
import FilmCard from "../components/filmCard-2x3";
import PlayListCard from "../features/playlist/components/PlaylistCard";
import AccountCard from "../components/AccountCard";
import { useSearchResults } from "../features/search/hooks/useSearchResults";
import Loading from "../components/loading_kickflip";

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const { filmsQuery, suggestQuery, accountsQuery, playlistsQuery } =
    useSearchResults(query);

  const films = filmsQuery.data?.pages.flat() ?? [];
  const suggestions = suggestQuery.data?.pages.flat() ?? [];
  const accounts = accountsQuery.data?.pages.flat() ?? [];
  const playlists = playlistsQuery.data?.pages.flat() ?? [];

  const LoadingIndicator = () => (
    <div className="flex justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-emerald-950 dark:border-emerald-50"></div>
    </div>
  );

  const Section = ({
    title,
    items,
    render,
    onNext,
    hasMore,
  }: {
    title: string;
    items: any[];
    render: (item: any) => React.ReactNode;
    onNext: () => void;
    hasMore: boolean;
  }) =>
    items.length > 0 && (
      <div className="mb-10">
        <h3 className="font-freckle text-2xl border-b-2 border-emerald-950 dark:border-emerald-50 mb-4">
          {title}
        </h3>

        <div
          id={`${title}-scroll`}
          className="flex gap-5 overflow-x-auto overflow-y-visible pb-6 px-3 scrollbar-thin scrollbar-thumb-emerald-800/40"
          onWheel={(e) => (e.currentTarget.scrollLeft += e.deltaY)}
        >
          <InfiniteScroll
            dataLength={items.length}
            next={onNext}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center items-center w-full py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-emerald-950"></div>
              </div>
            }
            scrollableTarget={`${title}-scroll`}
            scrollThreshold={0.8}
            className="flex gap-5 overflow-visible"
          >
            {items.map((item) => (
              <div
                key={item.film_id || item.auth_id || item.playlist_uuid}
                className="shrink-0 min-w-[160px] sm:min-w-[180px] md:min-w-[200px] lg:min-w-[220px]
                         h-[300px] sm:h-[340px] md:h-[380px] lg:h-[420px]
                         flex justify-center items-center relative
                         transition-transform duration-200 ease-in-out hover:scale-[1.07]
                         hover:z-50"
              >
                {render(item)}
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </div>
    );

  return (
    <AppLayout>
      <div className="w-full h-full overflow-y-auto p-4">
        <h2 className="font-freckle text-3xl mb-6 text-emerald-950 dark:text-emerald-50">
          Search results for: <span className="italic">{query}</span>
        </h2>

        <Section
          title="Title Matches"
          items={films}
          render={(film) => <FilmCard film={film} />}
          onNext={filmsQuery.fetchNextPage}
          hasMore={!!filmsQuery.hasNextPage}
        />

        <Section
          title="Film Suggestions"
          items={suggestions}
          render={(s) => <FilmCard film={s} />}
          onNext={suggestQuery.fetchNextPage}
          hasMore={!!suggestQuery.hasNextPage}
        />

        <Section
          title="Accounts"
          items={accounts}
          render={(a) => <AccountCard account={a} />}
          onNext={accountsQuery.fetchNextPage}
          hasMore={!!accountsQuery.hasNextPage}
        />

        <Section
          title="Playlists"
          items={playlists}
          render={(p) => <PlayListCard playlist={p} />}
          onNext={playlistsQuery.fetchNextPage}
          hasMore={!!playlistsQuery.hasNextPage}
        />

        {films.length === 0 &&
          accounts.length === 0 &&
          playlists.length === 0 &&
          suggestions.length === 0 && (
            <p className="text-center text-emerald-950  font-freckle text-lg">
              No results found.
            </p>
          )}

        {(filmsQuery.isLoading ||
          suggestQuery.isLoading ||
          accountsQuery.isLoading ||
          playlistsQuery.isLoading) && <Loading />}
      </div>
    </AppLayout>
  );
};

export default SearchPage;
