import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import FilmCard from "../L2/FilmCard";
import PlayListCard from "../L2/PlaylistCard";
import AccountCard from "../L2/AccountCard";
import SearchBar from "../L2/SearchBar";
import NavBar from "../L2/NavBar";
import Birdies from "../L2/Birdies";
import SideMenu from "../L2/SideMenu";

import AccHub from "../L2/AccountHub";

import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");

  const [films, setFilms] = React.useState<any[]>([]);
  const [accounts, setAccounts] = React.useState<any[]>([]);
  const [playlists, setPlaylists] = React.useState<any[]>([]);

  // Fetch films with query awareness
  const { data, fetchNextPage, hasNextPage, isLoading, isError, refetch } =
    useInfiniteQuery({
      queryKey: ["films", query],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await axios.get("http://localhost:3001/searchQuery", {
          params: { offset: pageParam, limit: 10, query },
        });
        return res.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.length === 10 ? pages.length * 10 : undefined,
      enabled: !!query, // only fetch if query exists
    });

  // Update films state when data changes
  React.useEffect(() => {
    if (data) {
      setFilms(data.pages.flat());
    }
  }, [data]);

  // Fetch accounts with query awareness
  const {
    data: dataAccount,
    fetchNextPage: fetchNextPageAccount,
    hasNextPage: hasNextPageAccount,
    isLoading: isLoadingAccount,
    isError: isErrorAccount,
    refetch: refetchAccount,
  } = useInfiniteQuery({
    queryKey: ["accounts", query],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await axios.get("http://localhost:3001/searchQueryAccounts", {
        params: { offset: pageParam, limit: 10, query },
      });
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 10 ? pages.length * 10 : undefined,
    enabled: !!query, // only fetch if query exists
  });

  // Update films state when data changes
  React.useEffect(() => {
    if (dataAccount) {
      setAccounts(dataAccount.pages.flat());
    }
  }, [dataAccount]);
  // Fetch accounts with query awareness
  const {
    data: dataPlaylist,
    fetchNextPage: fetchNextPagePlaylist,
    hasNextPage: hasNextPagePlaylist,
    isLoading: isLoadingPlaylist,
    isError: isErrorPlaylist,
    refetch: refetchPlaylist,
  } = useInfiniteQuery({
    queryKey: ["playlists", query],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await axios.get(
        "http://localhost:3001/searchQueryPlaylists",
        {
          params: { offset: pageParam, limit: 10, query },
        }
      );
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 10 ? pages.length * 10 : undefined,
    enabled: !!query, // only fetch if query exists
  });

  // Update films state when data changes
  React.useEffect(() => {
    if (dataPlaylist) {
      console.log(dataPlaylist);
      setPlaylists(dataPlaylist.pages.flat());
    }
  }, [dataPlaylist]);
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Birdies />

      {/* Top Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
          height: "10vh",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <AccHub />
      </Box>
      <NavBar />
      <SearchBar />
      {/* Films container */}
      <Paper
        sx={{
          background:
            "linear-gradient(rgba(46,62,38,0.3), rgba(96,170,167,0.3))",
          borderRadius: "30px",
          p: 2,
          position: "absolute",
          left: { xs: "2vw", sm: "1vw", md: "2vw" },
          top: "12vh",
          width: { xs: "98vw", sm: "98vw", md: "70vw" },
          height: "86vh",
          boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
          overflowY: "auto",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#341c1c",
            fontFamily: '"Freckle Face", system-ui',
            mb: 2,
          }}
        >
          search results: {query}
        </Typography>
        {isLoading ? (
          <CircularProgress />
        ) : films.length == 0 ? (
          <Typography color="error"></Typography>
        ) : (
          <Box
            id="horizontalScrollDiv"
            onWheel={(e) => (e.currentTarget.scrollLeft += e.deltaY)}
            sx={{ overflowX: "auto", whiteSpace: "nowrap" }}
          >
            <Divider
              sx={{
                color: "rgba(0, 0, 0, 0.3)",
                borderColor: "rgba(0, 0, 0, 0.3)",
                fontWeight: "normal",
                fontSize: "2rem",
              }}
            >
              Films
            </Divider>
            <InfiniteScroll
              dataLength={films.length}
              next={fetchNextPage}
              hasMore={!!hasNextPage}
              loader={<CircularProgress />}
              scrollableTarget="horizontalScrollDiv"
              scrollThreshold={0.8}
              horizontal
            >
              {films.map((film) => (
                <Box
                  key={film.film_id}
                  sx={{
                    display: "inline-block",
                    mr: 2,
                    verticalAlign: "top",
                    width: {
                      xs: "100%",
                      sm: "50%",
                      md: "25%",
                    },
                    height: "100%",
                  }}
                >
                  <FilmCard film={film} />
                </Box>
              ))}
            </InfiniteScroll>
          </Box>
        )}
        {isLoadingAccount ? (
          <CircularProgress />
        ) : accounts.length == 0 ? (
          <Typography color="error"></Typography>
        ) : (
          <Box
            id="horizontalScrollDiv"
            onWheel={(e) => (e.currentTarget.scrollLeft += e.deltaY)}
            sx={{ overflowX: "auto", whiteSpace: "nowrap" }}
          >
            <Divider
              sx={{
                color: "rgba(0, 0, 0, 0.3)",
                borderColor: "rgba(0, 0, 0, 0.3)",
                fontWeight: "normal",
                fontSize: "2rem",
              }}
            >
              Accounts
            </Divider>
            <InfiniteScroll
              dataLength={accounts.length}
              next={fetchNextPageAccount}
              hasMore={!!hasNextPageAccount}
              loader={<CircularProgress />}
              scrollableTarget="horizontalScrollDiv"
              scrollThreshold={0.8}
              horizontal
            >
              {accounts.map((account) => (
                <Box
                  key={account.auth_id}
                  sx={{
                    display: "inline-block",
                    mr: 2,
                    verticalAlign: "top",
                    width: {
                      xs: "100%",
                      sm: "50%",
                      md: "25%",
                    },
                    height: "100%",
                  }}
                  onClick={() => {
                    // setTargetFilm(film.film_id);
                    //  setOpen2(true);
                  }}
                >
                  <AccountCard account={account} />
                </Box>
              ))}
            </InfiniteScroll>
          </Box>
        )}{" "}
        {isLoadingPlaylist ? (
          <CircularProgress />
        ) : playlists.length == 0 ? (
          <Typography color="error"></Typography>
        ) : (
          <Box
            id="horizontalScrollDiv"
            onWheel={(e) => (e.currentTarget.scrollLeft += e.deltaY)}
            sx={{ overflowX: "auto", whiteSpace: "nowrap" }}
          >
            <Divider
              sx={{
                color: "rgba(0, 0, 0, 0.3)",
                borderColor: "rgba(0, 0, 0, 0.3)",
                fontWeight: "normal",
                fontSize: "2rem",
              }}
            >
              Playlists
            </Divider>
            <InfiniteScroll
              dataLength={playlists.length}
              next={fetchNextPagePlaylist}
              hasMore={!!hasNextPagePlaylist}
              loader={<CircularProgress />}
              scrollableTarget="horizontalScrollDiv"
              scrollThreshold={0.8}
              horizontal
            >
              {playlists.map((playlist) => (
                <Box
                  key={playlist.playlist_uuid}
                  sx={{
                    display: "inline-block",
                    mr: 2,
                    verticalAlign: "top",
                    width: {
                      xs: "100%",
                      sm: "50%",
                      md: "25%",
                    },
                    height: "100%",
                  }}
                >
                  <PlayListCard playlist={playlist} />
                </Box>
              ))}
            </InfiniteScroll>
          </Box>
        )}
        {films.length == 0 && accounts.length == 0 && playlists.length == 0 && (
          <>No results!</>
        )}
      </Paper>

      <SideMenu />
    </div>
  );
};

export default SearchPage;
