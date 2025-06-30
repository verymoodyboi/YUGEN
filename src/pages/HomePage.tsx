import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import SearchBar from "../components/SearchBar";
import NavBar from "../components/NavBar";
import Birdies from "../components/Birdies";
import SideMenu from "../components/SideMenu";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import supabase from "../server/config";
import x from "../server/uploads/pfp/6.jpg";
import {
  Paper,
  Box,
  Typography,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  Button,
} from "@mui/material";
import { AppProvider } from "@toolpad/core/AppProvider";
import { PageContainer, PageHeader } from "@toolpad/core/PageContainer";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import AddIcon from "@mui/icons-material/Add";
import temp from "../server/uploads/thumbnails/1.jpg";

const FilmCard = ({ film }: any) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Card
      className="film-card"
      sx={{
        borderRadius: "5%",
        width: 240,
        background: "linear-gradient(rgba(46,62,38,0.3),rgba(96,170,167,0.3))",
      }}
    >
      <CardMedia
        component="img"
        image={`http://localhost:3001/${film.poster_path?.replace(/\\/g, "/")}`}
        alt="Film thumbnail"
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderRadius: "3%",
          aspectRatio: "2/3",
          width: "100%",
          justifySelf: "center",
        }}
      />
      <IconButton
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          backgroundColor: "transparent",
        }}
      >
        <BookmarkAddIcon fontSize="large" />
      </IconButton>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography
              sx={{
                justifySelf: "left",
                color: "text.secondary",
                fontFamily: '"Freckle Face", system-ui',
              }}
              variant="h6"
            >
              {film.film_title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontFamily: '"Freckle Face", system-ui',
              }}
            >
              {film.film_genre || "No genre"}
            </Typography>
          </Box>
          <Box textAlign="center">
            <StarOutlineIcon />
            <Typography
              sx={{
                color: "text.secondary",
                fontFamily: '"Freckle Face", system-ui',
              }}
              variant="body2"
            >
              {film.avg_rating ?? "N/A"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <Box textAlign="center" sx={{ backgroundColor: "#341c1c" }}>
        <IconButton
          onClick={async () => {
            setOpen(true);
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none", // remove default shadow
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "transparent", // remove dark overlay
          },
        }}
      >
        <Box
          p={2}
          className="Form"
          sx={{
            background:
              "linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.3))",
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(10px)", // Optional: glassy effect
          }}
        >
          <Typography
            sx={{
              color: "text.secondary",
              fontFamily: '"Freckle Face", system-ui',
            }}
            variant="h6"
          >
            Thesis
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              fontFamily: '"Freckle Face", system-ui',
            }}
            variant="body2"
          >
            {film.thesis}
          </Typography>
          <Button
            onClick={() => setOpen(false)}
            sx={{
              fontFamily: '"Freckle Face", system-ui',
              mt: 2,
              color: "black",
            }}
          >
            Close
          </Button>
        </Box>
      </Dialog>
    </Card>
  );
};
interface userProbs {
  user: any;
}
const HomePage: React.FC<userProbs> = ({ user }) => {
  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["films"],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await axios.get("http://localhost:3001/filmssdata", {
          params: { offset: pageParam, limit: 10 },
        });
        console.log(res.data.poster_path);
        return res.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.length === 10 ? pages.length * 10 : undefined,
    });

  const films = data?.pages.flat() ?? [];
  const navigate = useNavigate();
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate("/login");
  };
  return (
    <div style={{ height: "100vh", width: "100vh" }}>
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
        {user && <div></div>}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Avatar
            src={`http://localhost:3001/uploads/pfp/${user?.pfp_path}`}
            sx={{ width: 60, height: 60 }}
          />
          <Typography variant="h6" fontFamily={'"Freckle Face", system-ui'}>
            {(user && user.username) || "guest"}
          </Typography>
        </Box>

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
          left: "2vw",
          top: "12vh",
          width: "70vw",
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
              <CircularProgress />
            ) : isError ? (
              <Typography color="error">Failed to load films</Typography>
            ) : (
              <Box
                id="horizontalScrollDiv"
                onWheel={(e) => {
                  e.currentTarget.scrollLeft += e.deltaY;
                }}
                sx={{
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                  display: "block",
                  width: "100%",
                  paddingBottom: 2,
                }}
              >
                <InfiniteScroll
                  dataLength={films.length}
                  next={fetchNextPage}
                  hasMore={!!hasNextPage}
                  loader={<CircularProgress />}
                  scrollableTarget="horizontalScrollDiv"
                  scrollThreshold={0.8}
                  horizontal={true}
                >
                  {films.map((film: any, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        display: "inline-block",
                        verticalAlign: "top",
                        marginRight: 2,
                      }}
                    >
                      <FilmCard film={film} />
                    </Box>
                  ))}
                </InfiniteScroll>
              </Box>
            )}

            <Typography
              variant="h4"
              sx={{
                color: "#341c1c",
                fontFamily: '"Freckle Face", system-ui',
              }}
            >
              Latest
            </Typography>
            {isLoading ? (
              <CircularProgress />
            ) : isError ? (
              <Typography color="error">Failed to load films</Typography>
            ) : (
              <InfiniteScroll
                dataLength={films.length}
                next={fetchNextPage}
                hasMore={!!hasNextPage}
                loader={<CircularProgress />}
              >
                <Box
                  sx={{
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    display: "block",
                    width: "100%",
                  }}
                >
                  {films.map((film: any, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        display: "inline-block",
                        verticalAlign: "top",
                        marginRight: 2,
                      }}
                    >
                      <FilmCard film={film} />
                    </Box>
                  ))}
                </Box>
              </InfiniteScroll>
            )}
          </Box>
        </PageContainer>
      </Paper>
      <SideMenu></SideMenu>
    </div>
  );
};
export default HomePage;
