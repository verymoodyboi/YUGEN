import "../App.css";
import supabase from "../server/config";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
  Button,
  TextField,
  Switch,
  Grid,
  Stack,
} from "@mui/material";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import Avatar from "@mui/material/Avatar";
import React, { useState, useEffect } from "react";
import VideoPlayer from "../L3/VideoPlayer";
import ReviewForm from "./Review";
import CloseIcon from "@mui/icons-material/Close";
import { Dialog, DialogContent } from "@mui/material";
import Thoughts from "./thoughts";
import Wrapper from "../L1/Wrapper";
import FlagIcon from "@mui/icons-material/Flag";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import AddIcon from "@mui/icons-material/Add";
import StarIcon from "@mui/icons-material/Star";
import ReportForm from "./Report";
import { useAuth } from "../contexts/AuthContext";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
///tabs
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
///tabs////

interface probs {
  filmId: string;
  onEnded?: () => void; // match WatchPlaylist + VideoPlayer
}

const Films: React.FC<probs> = ({ filmId, onEnded }) => {
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [openReport, setOpenReport] = React.useState(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [filmData, setFilmData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { userInfo } = useAuth();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };
  const toggleDrawerReport = (newOpen: boolean) => () => {
    setOpenReport(newOpen);
  };

  const handleChange = (panel) => (_event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Fetch film data when filmId changes
  useEffect(() => {
    const fetchFilmData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("films")
        .select(
          `
      *,
      uploader:users!uploader_id(auth_id, username, f_name, l_name, pfp_path, bio)
    `
        )
        .eq("film_uuid", filmId)
        .single();

      if (error) {
        console.error("Error fetching film:", error);
      } else {
        setFilmData(data);
      }

      setLoading(false);
    };

    if (filmId) {
      fetchFilmData();
    }
  }, [filmId]);
  // check playlisted

  /// Add playlist
  const [playlistName, setPlaylistName] = useState("");
  const [isPublic, seIsPublic] = useState(false);
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [myPlaylists, setMyPlaylist] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchMyPlaylists = async () => {
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
      //   setLoading(false);
    };

    if (userInfo?.auth_id) {
      fetchMyPlaylists();
    }
  }, [userInfo?.auth_id]);
  const handleAddToPlaylist = async (playlistID: any) => {
    if (listedPlaylists[playlistID]) {
      const addPlaylistToDB = await supabase
        .from("playlists_films")
        .delete()
        .eq("film_id", filmData.film_uuid)
        .eq("playlist_id", playlistID);
    } else {
      const { count } = await supabase
        .from("playlists_films")
        .select("*", { count: "exact", head: true })
        .eq("playlist_id", playlistID);
      const addPlaylistToDB = await supabase.from("playlists_films").insert({
        playlist_id: playlistID,
        film_id: filmData.film_uuid,
        film_index: count + 2 || 0,
      });
    }
    setListedPlaylists((prev) => ({
      ...prev,
      [playlistID]: !prev[playlistID],
    }));
  };
  //check playlisted
  const [listedPlaylists, setListedPlaylists] = useState<{
    [key: string]: boolean;
  }>({});

  // Check if film is in a playlist
  const checkListed = async (playlistID: string) => {
    const { data: existingWatchlist, error: fetchError } = await supabase
      .from("playlists_films")
      .select("*")
      .eq("film_id", filmData.film_uuid)
      .eq("playlist_id", playlistID)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking watchlist:", fetchError);
      return false;
    }

    return !!existingWatchlist;
  };

  // Load all statuses once
  useEffect(() => {
    const fetchStatuses = async () => {
      const results: { [key: string]: boolean } = {};

      for (const playlist of myPlaylists) {
        results[playlist.playlist_uuid] = await checkListed(
          playlist.playlist_uuid
        );
      }

      setListedPlaylists(results);
    };

    if (filmData?.film_uuid && myPlaylists?.length) {
      fetchStatuses();
    }
  }, [filmData, myPlaylists]);
  //Watchlist
  const [watchlisted, setWatchlisted] = React.useState(false);
  const checkWatchListed = async () => {
    const { data: existingWatchlist, error: fetchError } = await supabase
      .from("watchlists_films")
      .select("*")
      .eq("film_id", filmData.film_uuid)
      .eq("watchlist_id", userInfo.auth_id)
      .maybeSingle(); // won't throw error if no rows

    if (fetchError) {
      console.error("Error checking watchlist:", fetchError);
      return;
    }

    if (existingWatchlist) {
      // Remove from watchlist
      setWatchlisted(true);
    } else {
      setWatchlisted(false);
    }
  };
  React.useEffect(() => {
    checkWatchListed();
  }, [filmData?.film_uuid, userInfo?.auth_id]);

  const handleWatchlist = async () => {
    // Check if film is already in user's watchlist
    const { data: existingWatchlist, error: fetchError } = await supabase
      .from("watchlists_films")
      .select("*")
      .eq("film_id", filmData.film_uuid)
      .eq("watchlist_id", userInfo.auth_id)
      .maybeSingle(); // won't throw error if no rows

    if (fetchError) {
      console.error("Error checking watchlist:", fetchError);
      return;
    }

    if (existingWatchlist) {
      // Remove from watchlist
      const { error: deleteError } = await supabase
        .from("watchlists_films")
        .delete()
        .eq("film_id", filmData.film_uuid)
        .eq("watchlist_id", userInfo.auth_id);
      setWatchlisted(false);
      if (deleteError)
        console.error("Error removing from watchlist:", deleteError);
    } else {
      // Add to watchlist
      const { count } = await supabase
        .from("watchlists_films")
        .select("*", { count: "exact", head: true })
        .eq("watchlist_id", userInfo.auth_id);

      const { error: insertError } = await supabase
        .from("watchlists_films")
        .insert({
          watchlist_id: userInfo.auth_id,
          film_id: filmData.film_uuid,
          film_index: (count || 0) + 2, // You may want to calculate this dynamically
        });
      setWatchlisted(true);

      if (insertError) console.error("Error adding to watchlist:", insertError);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        load
      </Box>
    );
  }
  return (
    <div>
      {filmData && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "left",
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
                supabase.storage
                  .from("pfps")
                  .getPublicUrl(filmData?.uploader.pfp_path).data.publicUrl
              }
              onClick={() => {
                if (userInfo.username == filmData.uploader.username) {
                  navigate("/profile");
                } else {
                  navigate(
                    `/@?username=${encodeURIComponent(filmData.uploader.username)}`
                  );
                }
              }}
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
                {(filmData && filmData?.uploader.username) || "Loading..."}
              </Typography>

              <Typography
                variant="body1"
                fontFamily={'"Freckle Face", system-ui'}
                color="white"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <VideocamOutlinedIcon sx={{ color: "white" }} />
                {userInfo?.films_count}
                <GroupOutlinedIcon sx={{ color: "white", ml: 2 }} />
                {userInfo?.sub_count}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <hr />

          {filmData?.film_path && (
            <VideoPlayer filmPath={filmData.film_path} onEnded={onEnded} />
          )}

          <Divider />
          <hr />
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{ width: "90%", height: "fit-content" }}
          >
            {" "}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Freckle Face", system-ui',
                  color: "black",
                }}
              >
                {filmData.film_title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontFamily: '"Freckle Face", system-ui',
                }}
              >
                {filmData.film_genre && <p>{filmData.film_genre}</p>}
                {!filmData.film_genre && <p>Genres not available</p>}
              </Typography>
            </div>
            <Box textAlign="center">
              <Box display="flex" flexDirection="row" alignItems="center">
                <IconButton>
                  <StarIcon sx={{ fontSize: 40, color: "#cc651f" }} />
                </IconButton>
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"Freckle Face", system-ui',
                  }}
                  variant="h6"
                >
                  {filmData.avg_rating ?? "N/A"}
                </Typography>
              </Box>
              <IconButton sx={{}} onClick={toggleDrawerReport(true)}>
                <FlagIcon fontSize="large" />
              </IconButton>
              <IconButton
                sx={{}}
                onClick={() => {
                  setIsOpenAdd(true); // ✅ this now opens the Add Playlist dialog
                }}
              >
                <PlaylistAddIcon fontSize="large" />
              </IconButton>
              {/* Bookmark Icon */}
              {!watchlisted && (
                <IconButton
                  sx={{
                    backgroundColor: "transparent",
                  }}
                  onClick={() => {
                    handleWatchlist();
                  }}
                >
                  <BookmarkAddIcon fontSize="large" />
                </IconButton>
              )}
              {watchlisted && (
                <IconButton
                  sx={{
                    backgroundColor: "transparent",
                  }}
                  onClick={() => {
                    handleWatchlist();
                  }}
                >
                  <BookmarkAddedIcon fontSize="large" />
                </IconButton>
              )}
            </Box>
          </Box>

          <Divider />
          <hr />
          <Box
            sx={{
              display: "flex",
              justifyContent: "center", // Centers horizontally
              alignItems: "flex-start", // Keep top alignment
              mt: 4,
              width: "100%",
            }}
          >
            <Stack
              spacing={2}
              sx={{
                width: { xs: "90%", sm: "70%", md: "50%" }, // Responsive width
                minWidth: "300px",
              }}
            >
              {/* Thesis Accordion */}
              <Accordion
                expanded={expanded === "panel1"}
                onChange={handleChange("panel1")}
                sx={{ width: "100%", flexDirection: "column" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography
                    variant="h5"
                    sx={{ fontFamily: '"Freckle Face", system-ui' }}
                  >
                    Thesis
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontFamily: '"Freckle Face", system-ui',
                    }}
                  >
                    {filmData.thesis || "Thesis not available"}
                  </Typography>
                </AccordionDetails>
              </Accordion>

              {/* Cast Accordion */}
              <Accordion
                expanded={expanded === "panel2"}
                onChange={handleChange("panel2")}
                sx={{ width: "100%", flexDirection: "column" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography
                    variant="h5"
                    sx={{ fontFamily: '"Freckle Face", system-ui' }}
                  >
                    Cast
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {(() => {
                    let castArray = [];

                    try {
                      castArray = Array.isArray(filmData.cast)
                        ? filmData.crew
                        : JSON.parse(filmData.cast);
                    } catch (error) {
                      console.error("Failed to parse cast data:", error);
                    }

                    return castArray && castArray.length > 0 ? (
                      castArray.map((member, index) => (
                        <Box
                          key={index}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            p: 1,
                            mb: 1,
                            borderRadius: "8px",
                          }}
                          flexWrap="wrap"
                        >
                          <Avatar
                            src={
                              supabase.storage
                                .from("pfps")
                                .getPublicUrl(member.pfp).data.publicUrl
                            }
                            alt={member.name}
                            sx={{ width: 24, height: 24, mx: 1 }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                          >
                            {member.actor}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontFamily: '"Freckle Face", system-ui',
                              mx: 1,
                            }}
                          >
                            as
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontFamily: '"Freckle Face", system-ui',
                              minWidth: "80px",
                            }}
                          >
                            "{member.character}"
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontFamily: '"Freckle Face", system-ui',
                        }}
                      >
                        Crew not available
                      </Typography>
                    );
                  })()}
                </AccordionDetails>
              </Accordion>

              {/* Crew Accordion */}
              <Accordion
                expanded={expanded === "panel3"}
                onChange={handleChange("panel3")}
                sx={{ width: "100%", flexDirection: "column" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography
                    variant="h5"
                    sx={{ fontFamily: '"Freckle Face", system-ui' }}
                  >
                    Crew
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  {(() => {
                    let crewArray = [];

                    try {
                      crewArray = Array.isArray(filmData.crew)
                        ? filmData.crew
                        : JSON.parse(filmData.crew);
                    } catch (error) {
                      console.error("Failed to parse crew data:", error);
                    }

                    return crewArray && crewArray.length > 0 ? (
                      crewArray.map((member, index) => (
                        <Box
                          key={index}
                          display="flex"
                          alignItems="center"
                          mb={1}
                          flexWrap="wrap"
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontFamily: '"Freckle Face", system-ui',
                              minWidth: "80px",
                            }}
                          >
                            {member.role}:
                          </Typography>

                          <Avatar
                            src={
                              supabase.storage
                                .from("pfps")
                                .getPublicUrl(member.pfp).data.publicUrl
                            }
                            alt={member.name}
                            sx={{ width: 24, height: 24, mx: 1 }}
                          />

                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                          >
                            {member.name}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontFamily: '"Freckle Face", system-ui',
                        }}
                      >
                        Crew not available
                      </Typography>
                    );
                  })()}
                </AccordionDetails>
              </Accordion>
            </Stack>
          </Box>
          <Box
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Thoughts
              filmId={filmData.film_uuid} // Replace with actual film ID from your data/props
              userId={userId}
              key={`${filmData.film_uuid}-${refreshKey}`}
              userInfo={userInfo}
            />
          </Box>
          <Dialog
            fullScreen
            open={open}
            onClose={toggleDrawer(false)}
            slots={
              {
                //    transition: Transition,
              }
            }
            sx={{
              "& .MuiDialog-container": {
                backgroundColor: "transparent",
                display: "flex", // Enable flexbox
                justifyContent: "center", // Horizontal centering
                alignItems: "center", // Vertical centering
              },
              "& .MuiPaper-root": {
                backgroundColor: "transparent",
                boxShadow:
                  "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.10)",
                display: "flex", // Needed to center contents inside Paper
                justifyContent: "center",
                alignItems: "center",
              },
            }}
            BackdropProps={{
              sx: {
                backgroundColor: "transparent !important",
                opacity: 1,
              },
            }}
          >
            <Box
              sx={{
                width: "80vw",
                height: "80vh",
                // backgroundColor: "red",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                onClick={toggleDrawer(false)}
                aria-label="close"
                sx={{
                  zIndex: 10,
                  position: "absolute",
                  top: 16,
                  left: 16,
                  color: "white", // optional, in case it's invisible on background
                }}
              >
                <CloseIcon />
              </IconButton>
              <Wrapper>
                <ReviewForm
                  id={filmData.film_uuid}
                  onSubmitSuccess={() => {
                    setOpen(false);
                    setRefreshKey((prev) => prev + 1);
                    console.log(refreshKey);
                  }}
                  userInfo={userInfo}
                />
              </Wrapper>
            </Box>
          </Dialog>
          <Dialog
            fullScreen
            open={openReport}
            onClose={() => toggleDrawerReport(false)}
            slots={
              {
                //    transition: Transition,
              }
            }
            sx={{
              "& .MuiDialog-container": {
                backgroundColor: "transparent",
                display: "flex", // Enable flexbox
                justifyContent: "center", // Horizontal centering
                alignItems: "center", // Vertical centering
              },
              "& .MuiPaper-root": {
                backgroundColor: "transparent",
                boxShadow:
                  "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.10)",
                display: "flex", // Needed to center contents inside Paper
                justifyContent: "center",
                alignItems: "center",
              },
            }}
            BackdropProps={{
              sx: {
                backgroundColor: "transparent !important",
                opacity: 1,
              },
            }}
          >
            <Box
              sx={{
                width: "80vw",
                height: "80vh",
                // backgroundColor: "red",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                onClick={toggleDrawerReport(false)}
                aria-label="close"
                sx={{
                  zIndex: 10,
                  position: "absolute",
                  top: 16,
                  left: 16,
                  color: "white", // optional, in case it's invisible on background
                }}
              >
                <CloseIcon />
              </IconButton>
              <Wrapper>
                <ReportForm
                  film_id={filmData.film_uuid}
                  onSubmitSuccess={() => {
                    setOpenReport(false);
                  }}
                  userInfo={userInfo}
                />
              </Wrapper>
            </Box>
          </Dialog>
          <Dialog
            open={isOpenAdd}
            onClose={() => setIsOpenAdd(false)}
            keepMounted
            PaperProps={{
              sx: {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(15px)",
                borderRadius: "16px",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                color: "white",
                minWidth: "400px",
                maxWidth: "600px",
                p: 3,
              },
            }}
          >
            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2, // spacing between items
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  color: "white",
                  fontFamily: '"Freckle Face", system-ui',
                }}
                textAlign={"left"}
                textOverflow={"auto"}
                variant="h6"
              >
                <PlaylistPlayIcon sx={{ fontSize: "5vw" }} />
                Add to playlist
              </Typography>{" "}
              <Stack spacing={2}>
                {myPlaylists.map((playlist: any, index: number) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1.5,
                      backgroundColor: "transparent",
                      borderRadius: "8px",
                      boxShadow: 1,
                    }}
                  >
                    {!listedPlaylists[playlist.playlist_uuid] && (
                      <IconButton
                        onClick={() =>
                          handleAddToPlaylist(playlist.playlist_uuid)
                        }
                        sx={{ mr: 1 }}
                      >
                        <PlaylistAddIcon />
                      </IconButton>
                    )}
                    {listedPlaylists[playlist.playlist_uuid] && (
                      <IconButton
                        onClick={() =>
                          handleAddToPlaylist(playlist.playlist_uuid)
                        }
                        sx={{ mr: 1 }}
                      >
                        <PlaylistAddCheckIcon />
                      </IconButton>
                    )}
                    <Typography
                      variant="h6"
                      sx={{
                        color: "black",
                        fontFamily: '"Freckle Face", system-ui',
                      }}
                    >
                      {playlist.playlist_name}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    fontFamily: '"Freckle Face", system-ui',
                    borderColor: "#9cd5ac",
                    color: "white",
                    backgroundColor: "#9cd5ac",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "#3e5e47ff",
                      backgroundColor: "#3e5e47ff",
                    },
                  }}
                  onClick={() => {
                    setIsOpenAdd(false);
                  }}
                >
                  Done
                </Button>
              </Box>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default Films;
