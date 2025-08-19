import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import PlayListCard from "../L2/PlaylistCard";
import FilmCard from "../L2/FilmCard";
import SearchBar from "../L2/SearchBar";
import NavBar from "../L2/NavBar";
import Birdies from "../L2/Birdies";
import SideMenu from "../L2/SideMenu";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import EditProfile from "../L2/EditProfile";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import SchoolIcon from "@mui/icons-material/School";
import AccHub from "../L2/AccountHub";
import { useRef } from "react";
import supabase from "../server/config";

import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  Dialog,
  Button,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
} from "@mui/material";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { PageContainer } from "@toolpad/core/PageContainer";

import { useAuth } from "../contexts/AuthContext";
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
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";

const UserProfile: React.FC = () => {
  const { userInfo: user } = useAuth();
  const [value, setValue] = React.useState(0);
  const [openEdit, setOpenEdit] = React.useState(false);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  //fetch movies
  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["films"],
      queryFn: async ({ pageParam = 0 }) => {
        const res = await axios.get(
          "http://localhost:3001/latestfrom-profile",
          {
            params: { offset: pageParam, limit: 10, uploaderID: user?.auth_id },
          }
        );

        return res.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.length === 10 ? pages.length * 10 : undefined,
    });

  const films = data?.pages.flat() ?? [];
  //scroll to top
  const boxRef = useRef<HTMLDivElement>(null);
  const scrollToTop = () => {
    if (boxRef.current) {
      boxRef.current.scrollTo({
        top: 0,
        behavior: "smooth", // Optional for smooth scrolling
      });
    }
  };
  ///fetch my playlists
  const { userInfo } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [myPlaylists, setMyPlaylist] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchMyPlaylists = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("playlists")
        .select(
          `
    playlist_uuid,
    playlist_name,
    is_public,
    film_count,
    creator:users!inner (
      username,
      pfp_path
    ),
    playlist_films:playlists_films (
      film_index,
      films (
        film_uuid,
        film_title,
        poster_path,
        release_date,
        film_duration,
        avg_rating
      )
    )
  `
        )
        .eq("user_id", userInfo.auth_id);

      if (error) {
        console.error("Error fetching playlists:", error);
      } else {
        setMyPlaylist(data);
        console.log("playlists:", data);
      }
      setLoading(false);
    };

    if (userInfo?.auth_id) {
      fetchMyPlaylists();
    }
  }, [userInfo?.auth_id]);

  return (
    <div style={{ height: "100vh", width: "100vh" }}>
      <Birdies></Birdies>
      <NavBar></NavBar>
      <SearchBar></SearchBar>
      <AccHub />
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
              cursor: "pointer",
              bgcolor: "gray",
              width: 100,
              height: 100,
              aspectRatio: "1/1",
            }}
            alt="Remy Sharp"
            src={
              supabase.storage.from("pfps").getPublicUrl(user.pfp_path).data
                .publicUrl
            }
          />
          <Box
            sx={{
              width: "fit-content",
              display: "block", // changed from inline-block
              textAlign: "left", // ensure text aligns left
              p: 2,
            }}
          >
            <Typography
              variant="h4"
              fontFamily={'"Freckle Face", system-ui'}
              color="#3c1c24"
            >
              {(user && user.username) || "Loading..."}
            </Typography>

            <Typography
              variant="body1"
              fontFamily={'"Freckle Face", system-ui'}
              color="white"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <VideocamOutlinedIcon sx={{ color: "white" }} />
              {user?.films_count}
              <GroupOutlinedIcon sx={{ color: "white", ml: 2 }} />
              {user?.sub_count}
            </Typography>
            <Typography
              variant="body1"
              fontFamily={'"Freckle Face", system-ui'}
              color="white"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <PublicOutlinedIcon />
              {user?.region}
            </Typography>

            {user?.university && (
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                <Tooltip title="student at">
                  <SchoolIcon />
                </Tooltip>
                {user?.university}
              </Typography>
            )}
            <Box display="flex" gap={2}>
              {user?.youtube && (
                <Tooltip title="YouTube">
                  <YouTubeIcon
                    style={{ cursor: "pointer", color: "white" }}
                    onClick={() => {
                      window.location.href = user.youtube;
                    }}
                  />
                </Tooltip>
              )}
              {user?.instagram && (
                <Tooltip title="Instagram">
                  <InstagramIcon
                    style={{ cursor: "pointer", color: "white" }}
                    onClick={() => {
                      window.location.href = user.instagram;
                    }}
                  />
                </Tooltip>
              )}
              {user?.linkedin && (
                <Tooltip title="LinkedIn">
                  <LinkedInIcon
                    style={{ cursor: "pointer", color: "white" }}
                    onClick={() => {
                      window.location.href = user.linkedin;
                    }}
                  />
                </Tooltip>
              )}
            </Box>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                maxWidth: "100%",
                display: "flex",
                alignItems: "center",
                gap: 1, // spacing between text and button
              }}
            >
              <Box
                sx={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  maskImage:
                    "linear-gradient(to right, black 70%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, black 70%, transparent)",
                  flexShrink: 1,
                  maxWidth: "100%",
                }}
              >
                <Typography
                  variant="body1"
                  fontFamily={'"Freckle Face", system-ui'}
                  color="white"
                  sx={{ display: "inline" }}
                >
                  {user?.bio?.slice(0, 50)}...
                </Typography>
              </Box>

              <Button
                onClick={() => {
                  setValue(1);
                  scrollToTop();
                }}
                sx={{
                  fontFamily: '"Freckle Face", system-ui',
                  color: "#3c1c24",
                  flexShrink: 0,
                  minWidth: "auto",
                  padding: 0,
                }}
              >
                more
              </Button>
            </Box>
            <Button
              onClick={() => setOpenEdit(true)}
              sx={{
                backgroundColor: "#3c1c24",
                fontFamily: '"Freckle Face", system-ui',
                color: "#ffffffff",
                flexShrink: 0,
                width: 420,
                padding: 0,
              }}
              startIcon={<DriveFileRenameOutlineIcon />}
            >
              Edit profile
            </Button>
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
                Latest from {(user && user.username) || "Loading..."}
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
                  </InfiniteScroll>
                </Box>
              )}
              <Typography
                variant="h4"
                sx={{
                  color: "#341c1c",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                playslists by {(user && user.username) || "Loading..."}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {" "}
                {myPlaylists.map((playlist: any, index: number) => (
                  <Box
                    key={index}
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
              </Box>
            </Box>
          </PageContainer>
        </CustomTabPanel>
        <CustomTabPanel ref={boxRef} value={value} index={1}>
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
                textAlign={"left"}
                sx={{
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                  justifySelf: "left",
                }}
              >
                {(user && user.bio) || "Loading..."}
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
                {(user && user.region) || "Loading..."}
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
                {user && user.sub_count}
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
                {user && user.films_count}
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
                {user && user.join_date}
              </Typography>

              {user?.youtube && (
                <Box display="flex" gap={2}>
                  <Tooltip title="YouTube">
                    <YouTubeIcon
                      style={{ cursor: "pointer", color: "white" }}
                      onClick={() => {
                        window.location.href = user.youtube;
                      }}
                    />
                  </Tooltip>
                  <a style={{ color: "black" }} href={user.youtube}>
                    {user.youtube}
                  </a>
                </Box>
              )}
              {user?.instagram && (
                <Box display="flex" gap={2}>
                  <Tooltip title="Instagram">
                    <InstagramIcon
                      style={{ cursor: "pointer", color: "white" }}
                      onClick={() => {
                        window.location.href = user.instagram;
                      }}
                    />
                  </Tooltip>
                  <a style={{ color: "black" }} href={user.instagram}>
                    {user.instagram}
                  </a>
                </Box>
              )}
              {user?.linkedin && (
                <Box display="flex" gap={2}>
                  <Tooltip title="LinkedIn">
                    <LinkedInIcon
                      style={{ cursor: "pointer", color: "white" }}
                      onClick={() => {
                        window.location.href = user.linkedin;
                      }}
                    />
                  </Tooltip>
                  <a href={user.linkedin}>{user.linkedin}</a>
                </Box>
              )}

              {user?.university && (
                <Typography
                  variant="body1"
                  sx={{
                    color: "white",
                    fontFamily: '"Freckle Face", system-ui',
                    justifySelf: "left",
                  }}
                >
                  <Tooltip title="student at">
                    <SchoolIcon />
                  </Tooltip>
                  {user?.university}
                </Typography>
              )}
            </Box>
          </PageContainer>
        </CustomTabPanel>
        <Dialog
          fullScreen
          open={openEdit}
          onClose={() => setOpenEdit(false)}
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
          <EditProfile
            onSubmitSuccess={() => {
              setOpenEdit(false);
            }}
            onCancel={() => {
              setOpenEdit(false);
            }}
          />
        </Dialog>
      </Paper>
      <SideMenu></SideMenu>
    </div>
  );
};
export default UserProfile;
