import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import SearchBar from "../components/SearchBar";
import NavBar from "../components/NavBar";
import Birdies from "../components/Birdies";
import SideMenu from "../components/SideMenu";
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
  Tabs,
  Tab,
  Avatar,
} from "@mui/material";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { PageContainer, PageHeader } from "@toolpad/core/PageContainer";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import AddIcon from "@mui/icons-material/Add";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      style={{ overflowY: "scroll" }}
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
const FilmCard = ({ film }: any) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "row",
        borderRadius: "5%",
        background: "linear-gradient(rgba(46,62,38,0.3),rgba(96,170,167,0.3))",
        width: "25vw",
        overflow: "hidden",
        boxShadow:
          "0 1px 3px rgba(0, 0, 0, 0.12), 0 4px 6px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(5px)",
        transition: "box-shadow 0.2s ease, transform 0.1s ease",
      }}
    >
      <CardMedia
        component="img"
        image={`http://localhost:3001/${film.poster_path?.replace(/\\/g, "/")}`}
        alt="Film thumbnail"
        style={{
          width: "33%",
          height: "auto",
          aspectRatio: "2/3",
          objectFit: "cover",
          borderRadius: "5% 0 0 5%",
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
      <Box sx={{ flex: 1, padding: 2, position: "relative" }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography
                sx={{
                  justifySelf: "left",
                  color: "text.secondary",
                  fontFamily: '"Freckle Face", system-ui',
                }}
                variant="h4"
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

        <IconButton onClick={() => setOpen(true)}>
          <AddIcon sx={{ color: "#3c1c24" }} />
        </IconButton>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "transparent",
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
            backdropFilter: "blur(10px)",
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

export default function HomePageReformat() {
  const [value, setValue] = React.useState(0);
  const [user, setUser] = React.useState(0);
  const [profile, setProfile] = React.useState<any>();
  const getUserProfile = async () => {
    const user_id = 1;
    try {
      const res = await axios.get("http://localhost:3001/profile", {
        params: { userID: user_id },
      });
      setProfile(res.data);
      console.log(res.data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };
  React.useEffect(() => {
    getUserProfile();
  }, []);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["films"],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await axios.get("http://localhost:3001/filmssdataprofile", {
          params: { offset: pageParam, limit: 10 },
        });
        //console.log(res.data);
        return res.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.length === 10 ? pages.length * 10 : undefined,
    });

  const films = data?.pages.flat() ?? [];

  return (
    <div style={{ height: "100vh", width: "100vh" }}>
      <Birdies></Birdies>
      <NavBar></NavBar>
      <SearchBar></SearchBar>

      <Paper
        sx={{
          background:
            "linear-gradient(rgba(46,62,38,0.3), rgba(96,170,167,0.3))",
          borderRadius: "30px",
          p: 2,
          position: "absolute",
          left: "2vw",
          top: "12vh",
          width: "70vw",
          height: "86vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "transparent",
          boxShadow:
            "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.10)",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "left",
            p: 2,
          }}
          gap={2}
        >
          <Avatar
            sx={{
              bgcolor: "gray",
              width: 100,
              height: "auto",
              aspectRatio: "1/1",
            }}
            alt="Remy Sharp"
            src="/broken-image.jpg"
          />
          <Box
            sx={{
              width: "fit-content",
              display: "inline-block",
              justifyContent: "left",
              p: 2,
            }}
            gap={2}
          >
            <Typography
              variant="h4"
              fontFamily={'"Freckle Face", system-ui'}
              color="#3c1c24"
            >
              {profile?.username || "Loading..."}
            </Typography>
            <Typography
              variant="body1"
              fontFamily={'"Freckle Face", system-ui'}
              color="white"
            >
              Films : {profile?.films_count} / Subscribers: {profile?.sub_count}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#3c1c24",
              },
              "& .MuiTab-root.Mui-selected": {
                color: "#3c1c24",
                fontWeight: "bold",
              },
            }}
          >
            <Tab
              label="Library"
              style={{ fontFamily: '"Freckle Face", system-ui' }}
              {...a11yProps(0)}
            />

            <Tab
              style={{ fontFamily: '"Freckle Face", system-ui' }}
              label="Info"
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <PageContainer sx={{ height: "100%", overflowY: "auto" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                height: "100%",
                overflowY: "auto",
                pr: 1,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: "#341c1c",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                Latest from {profile?.username || "Loading..."}
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
                      display: "flex",
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                      width: "100%",
                      alignItems: "flex-start",
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

              <Typography
                variant="h5"
                sx={{
                  color: "#341c1c",
                  fontFamily: '"Freckle Face", system-ui',
                }}
              >
                Costume playlist 1
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
                      display: "flex",
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                      width: "100%",
                      alignItems: "flex-start",
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
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <PageContainer sx={{ height: "100%", overflowY: "auto" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
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
                Bio
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                {profile?.bio || "Loading..."}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: "#341c1c",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                More Info
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                <PublicOutlinedIcon sx={{ color: "white" }} />
                {profile?.region || "Loading..."}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                <GroupOutlinedIcon sx={{ color: "white" }} />
                {profile?.sub_count}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                <VideocamOutlinedIcon sx={{ color: "white" }} />
                {profile?.films_count}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                <CalendarMonthOutlinedIcon sx={{ color: "white" }} />
                {profile?.join_date}
              </Typography>
            </Box>
          </PageContainer>
        </CustomTabPanel>
      </Paper>
      <SideMenu></SideMenu>
    </div>
  );
}
