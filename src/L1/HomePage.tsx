import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import FilmCard from "../L2/FilmCard";
import AccHub from "../L2/AccountHub";
import axios from "axios";
import SearchBar from "../L2/SearchBar";
import NavBar from "../L2/NavBar";
import Birdies from "../L2/Birdies";
import SideMenu from "../L2/SideMenu";

import CustomLoading from "../L3/CutomsLoading";

import { Paper, Box, Typography } from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";

const HomePage: React.FC = () => {
  ///fetch films
  const [isFilmsLoading, setIsFilmsLoading] = React.useState(false);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["films"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await axios.get("http://localhost:3001/filmssdata", {
        params: { offset: pageParam, limit: 5 },
      });
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      console.log(
        "lastPage length",
        lastPage.length,
        "pages so far",
        pages.length
      );
      return lastPage.length > 0 ? pages.length * 5 : undefined;
    },
  });

  const films = data?.pages.flat() ?? [];
  //onscroll fetch
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollRight = target.scrollLeft + target.clientWidth;
    const threshold = target.scrollWidth - 200; // 200px from right

    if (scrollRight >= threshold && hasNextPage) {
      setIsFilmsLoading(true);
      await fetchNextPage();
      setIsFilmsLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vh" }}>
      <AccHub></AccHub>
      <Birdies></Birdies>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center", // center everything vertically
          width: "100vw",
          height: "10vh", // you probably don't need 30vh for a nav

          gap: 2,
          position: "absolute",
          left: 0,
          top: 0,
          px: 2,
        }}
      >
        <NavBar />
        <SearchBar />
      </Box>

      <Paper
        sx={{
          background:
            "linear-gradient(rgba(46,62,38,0.3), rgba(96,170,167,0.3))",
          borderRadius: "30px",
          p: 2,
          position: "absolute",

          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "transparent",
          boxShadow:
            "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.10)",
          left: { xs: "1vw", sm: "1vw", md: "2vw" },
          top: "12vh",
          width: { xs: "98vw", sm: "98vw", md: "70vw" },
          height: "86vh",
        }}
      >
        <PageContainer sx={{ height: "100%", overflowY: "auto" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              height: "100%",
              overflowY: "auto",
              pr: 1,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "#341c1c",
                fontFamily: '"Freckle Face", system-ui',
                justifySelf: "left",
              }}
            >
              Hot Right Now
            </Typography>

            {isLoading ? (
              <CustomLoading />
            ) : isError ? (
              <Typography color="error">Failed to load films</Typography>
            ) : (
              <Box
                onScroll={handleScroll}
                sx={{
                  overflowX: "auto",
                  overflowY: "hidden",
                  whiteSpace: "nowrap",
                  width: "100%",
                  height: "100%",
                }}
              >
                {films.map((film) => (
                  <Box
                    key={film.film_uuid}
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

                {/* Spinner card at the end */}
                {isFetchingNextPage && (
                  <Box
                    sx={{
                      display: "inline-flex", // inline so it stays in the row
                      alignItems: "center", // vertical centering
                      justifyContent: "center", // horizontal centering
                      width: 240, // match FilmCard width
                      height: 360, // match FilmCard height
                      mr: 2,
                    }}
                  >
                    <CustomLoading />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </PageContainer>
      </Paper>

      <SideMenu></SideMenu>
    </div>
  );
};
export default HomePage;
