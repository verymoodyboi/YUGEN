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
      <div className="mb-10 w-full max-w-full overflow-x-hidden">
        <h3 className="font-freckle text-2xl border-b-2 border-emerald-950 mb-4 px-4">
          {title}
        </h3>

        <div
          id={`${title}-scroll`}
          className="w-full max-w-full overflow-x-auto overflow-y-hidden pb-6 no-scrollbar"
        >
          <InfiniteScroll
            dataLength={items.length}
            next={onNext}
            hasMore={hasMore}
            scrollableTarget={`${title}-scroll`}
            scrollThreshold={0.8}
            className="flex gap-5 w-max px-4"
          >
            {items.map((item) => (
              <div
                key={item.film_id || item.auth_id || item.playlist_uuid}
                className=" p-6"
              >
                {render(item)}
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </div>
    );

  return (
    <>
      <div className="w-full max-w-full overflow-x-hidden p-4">
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
    </>
  );
};

export default SearchPage;
