import "../App.css";
import React, { useState } from "react";
import ReactPlayer from "react-player";
import axios from "axios";
import ReportFilm from "./ReportFilm";
import Thoughts from "./thoughts";

import {
  Avatar,
  Button,
  Stack,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  Box,
  TextField,
  Menu,
  MenuItem,
  Alert,
  Card,
  Drawer,
  Grid,
  Divider,
  Rating,
} from "@mui/material";

import StarOutlineIcon from "@mui/icons-material/StarOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";

function Films() {
  const [filmData, setFilmData] = useState<any | null>(null);
  const [uploaderData, setUploaderData] = useState<any | null>(null);
  const [filmID, setFilmID] = useState<any | null>(null);
  const [click, setClick] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const filmCoverPath = filmData?.poster_path
    ? filmData.poster_path
    : "/temp/testing.png";

  const validate = () => {
    const errors = {};
    if (!rating) {
      errors.rating = "no rating";
    }
    return errors;
  };
  const SendToServer = async () => {
    try {
      const formData = new FormData();
      formData.append("rating", rating.toString());
      formData.append("comment", comment);
      axios.post("http://localhost:3001/addthought", formData);
    } catch (error: any) {
      if (error) {
        return error;
      } else {
        return "";
      }
    }
    setIsSubmit(true);
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    toggleDrawer(false);
    event.preventDefault();
    const errors = await validate();
    if (Object.keys(errors).length === 0) {
      await SendToServer();
    }
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const toggleReportDrawer = (newOpen: boolean) => () => {
    setReportOpen(newOpen);
  };

  const handleClick = async () => {
    try {
      const response = await axios.get("http://localhost:3001/filmdata", {
        params: { filmID },
      });
      if (response.data && response.data.length > 0) {
        setFilmData(response.data[0]);
        try {
          const id = filmData.uploader_id;
          const response2 = await axios.get(
            "http://localhost:3001/getuploader",
            {
              params: { id },
            }
          );
          if (response2.data && response2.data.length > 0) {
            setUploaderData(response2.data[0]);
          }
        } catch (error) {
          console.error("Error fetching film data:", error);
        }
      }
      setClick(true);
    } catch (error) {
      console.error("Error fetching film data:", error);
    }
  };

  const DrawerList = (
    <Box sx={{ width: 0, backgroundColor: "transparent" }} role="presentation">
      <form
        className="ReviewForm"
        onSubmit={handleSubmit}
        style={{
          background:
            "linear-gradient(rgba(50, 54, 49, 0.8), rgba(96, 170, 167, 0.8))",
          padding: "16px",
          borderRadius: "8px",
        }}
      >
        <label id="ReviewLabel" style={{ color: "rgb(13, 16, 16)" }}>
          Review
        </label>

        <p id="ReviewText">
          How many stars does this film deserve? Let the creator know!
        </p>
        <Rating
          max={10}
          precision={0.5}
          defaultValue={rating}
          onChange={(event, newValue) => {
            setRating(newValue);
          }}
          sx={{
            "& .MuiRating-icon": {
              fontSize: "40px", // Change this to whatever size you want
            },
          }}
        />
        <TextField
          name="Comment"
          label="Comment (Optional)"
          variant="outlined"
          multiline
          maxRows={20}
          sx={{
            minHeight: "80px",
            height: "auto",
            fontSize: "16px",
            padding: "10px",
            width: "100%",
            marginTop: "16px",
            // backgroundColor: "rgba(97, 155, 142, 0.2)",
          }}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
        <Button
          id="filmpage-report-button"
          type="submit"
          sx={{
            backgroundColor: "#cc651f",
            color: "white",
            marginTop: "20px",
            fontSize: "1.2rem",
            fontFamily: '"Freckle Face", system-ui',
            width: "20%",
            height: "15%",
            "&:hover": {
              backgroundColor: "#e38e2c",
              boxShadow: "1px 1px 10px rgb(255, 162, 32)",
            },
          }}
          onClick={async () => {
            setOpen(false);
          }}
        >
          Submit
        </Button>
      </form>
    </Box>
  );

  const ReportDrawerList = (
    <Box>
      <ReportFilm />
    </Box>
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showReportForm, setShowReportForm] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const genreColors: Record<string, string> = {
    Adventure: "#4caf50",
    Comedy: "#ff9800",
    Drama: "#3f51b5",
    Horror: "#f44336",
    Romance: "#e91e63",
    Animation: "rgb(140, 75, 0)",
    Biography: "rgb(8, 69, 144)",
  };

  const MAX_VISIBLE = 3;

  const V_Genres =
    filmData?.film_genre
      ?.split(",")
      .map((g: string) => g.trim())
      .filter((g: string) => g.length > 0) || [];

  return (
    <div>
      <p>film ID:</p>
      <input
        type="text"
        onChange={(e) => {
          setFilmID(e.target.value);
        }}
      />
      <button onClick={handleClick}>click</button>
      {click && filmData && uploaderData && (
        <div className="film-and-filmdata">
          <br></br>
          <Divider />
          <hr />
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: "100%" }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                alt="Remy Sharp"
                src={"uploads/pfp" + "/" + uploaderData.pfp_path}
                sx={{ width: 70, height: 70 }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Freckle Face", system-ui',
                  color: "black",
                }}
              >
                {uploaderData.username}
              </Typography>
            </Box>

            <IconButton
              onClick={handleMenuOpen}
              sx={{
                backgroundColor: "transparent",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <MoreVertIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              slotProps={{
                paper: {
                  sx: {
                    backgroundColor: "rgb(69, 41, 41)",
                    color: "white",
                    borderRadius: 2,
                  },
                },
              }}
            >
              <MenuItem onClick={toggleReportDrawer(true)}>
                <Typography sx={{ fontFamily: '"Freckle Face", system-ui' }}>
                  Report
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  handleMenuClose();
                }}
              >
                <Typography sx={{ fontFamily: '"Freckle Face", system-ui' }}>
                  Share
                </Typography>
              </MenuItem>
            </Menu>
          </Box>

          <Divider />

          <hr />
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: 1200,
              height: "55%",
              backgroundColor: "black",
              overflow: "hidden",
              borderRadius: 2,
              flexShrink: 0,
            }}
          >
            <ReactPlayer
              url={filmData.film_path}
              controls
              width="100%"
              height="100%"
              style={{ position: "absolute", top: 0, left: 0 }}
              config={{
                file: {
                  attributes: {
                    style: {
                      objectFit: "contain",
                      width: "100%",
                      height: "100%",
                    },
                  },
                },
              }}
            />
          </Box>

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
              <Stack
                direction="row"
                spacing={3}
                alignItems="flex-start"
                width="100%"
              >
                {/* Film Cover */}
                {filmCoverPath && (
                  <Tooltip
                    title={
                      <img
                        src={filmCoverPath}
                        alt="Full Cover"
                        style={{
                          maxWidth: "200px",
                          borderRadius: "8px",
                          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.40)",
                        }}
                      />
                    }
                    placement="right"
                  >
                    <img
                      src={filmCoverPath}
                      alt="Film Cover"
                      style={{
                        borderRadius: "8px",
                        width: "125px",
                        height: "175px",
                        cursor: "pointer",
                        flexShrink: 0,
                        boxShadow: "2px 8px 5px rgba(0, 0, 0, 0.40)",
                      }}
                    />
                  </Tooltip>
                )}

                <Stack
                  direction="column"
                  spacing={1}
                  justifyContent="flex-start"
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: '"Freckle Face", system-ui',
                      color: "black",
                      textAlign: "left",
                      flexShrink: 0,
                    }}
                  >
                    {filmData.film_title}
                  </Typography>

                  <Stack
                    className="filmpage-genres-container"
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    alignItems="center"
                  >
                    {V_Genres.slice(0, MAX_VISIBLE).map((genre) => (
                      <Chip
                        key={genre}
                        label={genre}
                        size="small"
                        sx={{
                          fontFamily: '"Freckle Face", system-ui',
                          backgroundColor: genreColors[genre] || "gray",
                          color: "white",
                          fontSize: "1rem",
                          height: 24,
                          padding: "0 6px",
                          borderRadius: "12px",
                          boxShadow: "0 8px 10px rgba(0, 0, 0, 0.40)",
                        }}
                      />
                    ))}

                    {V_Genres.length > MAX_VISIBLE && (
                      <Tooltip
                        title={
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.5,
                            }}
                          >
                            {V_Genres.slice(MAX_VISIBLE).map((genre) => (
                              <Chip
                                key={genre}
                                label={genre}
                                sx={{
                                  fontFamily: '"Freckle Face", system-ui',
                                  backgroundColor: genreColors[genre] || "gray",
                                  color: "white",
                                }}
                              />
                            ))}
                          </Box>
                        }
                        arrow
                        placement="top"
                      >
                        <Chip
                          label={`+${V_Genres.length - MAX_VISIBLE} more`}
                          size="small"
                          sx={{
                            fontFamily: '"Freckle Face", system-ui',
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                            cursor: "pointer",
                          }}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </div>
            {rating != 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Grid>
                  <IconButton
                    sx={{ backgroundColor: "goldenrod" }}
                    aria-label="delete"
                    onClick={toggleDrawer(true)}
                  >
                    <StarOutlineIcon fontSize="large" />

                    <Typography
                      variant="h6"
                      sx={{
                        color: "",
                        fontFamily: '"Freckle Face", system-ui',
                      }}
                    >
                      {rating}
                    </Typography>
                  </IconButton>
                </Grid>
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"Freckle Face", system-ui',
                  }}
                >
                  {filmData.avg_rating && <p>{filmData.avg_rating}</p>}
                  {!filmData.avg_rating && <p>Rating not available</p>}
                </Typography>
              </div>
            )}
            {rating == 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Grid>
                  <IconButton aria-label="delete" onClick={toggleDrawer(true)}>
                    <StarOutlineIcon fontSize="large" />
                  </IconButton>
                </Grid>
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"Freckle Face", system-ui',
                  }}
                >
                  {filmData.avg_rating && <p>{filmData.avg_rating}</p>}
                  {!filmData.avg_rating && <p>Rating not available</p>}
                </Typography>
              </div>
            )}
          </Box>

          <Divider />
          <hr />
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{ width: "99%", height: "fit-content" }}
          >
            {" "}
            <Card variant="outlined" className="filmpage-cards">
              <Box sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    sx={{ fontFamily: '"Freckle Face", system-ui' }}
                  >
                    Thesis
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  fontSize={20}
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"Freckle Face", system-ui',
                  }}
                >
                  <p>{filmData.thesis}</p>
                </Typography>
              </Box>
            </Card>
            <Card variant="outlined" className="filmpage-cards">
              <Box sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    sx={{ fontFamily: '"Freckle Face", system-ui' }}
                  >
                    Cast
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  fontSize={20}
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"Freckle Face", system-ui',
                  }}
                >
                  {filmData.cast && <p>{filmData.cast}</p>}
                  {!filmData.cast && <p>Cast not available</p>}
                </Typography>
              </Box>
            </Card>
            <Card variant="outlined" className="filmpage-cards">
              <Box sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    sx={{ fontFamily: '"Freckle Face", system-ui' }}
                  >
                    Crew
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  fontSize={20}
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"Freckle Face", system-ui',
                  }}
                >
                  {filmData.crew && <p>{filmData.crew}</p>}
                  {!filmData.crew && <p>Cast not available</p>}
                </Typography>
              </Box>
            </Card>
          </Box>

          <Thoughts
            filmId={1} // Replace with actual film ID from your data/props
            userId={userId} // Pass the current user's ID
          />
        </div>
      )}
      {click && !filmData && (
        <div>
          <Alert severity="error">Film not found!</Alert>
        </div>
      )}
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>

      <Drawer open={reportOpen} onClose={toggleReportDrawer(false)}>
        {ReportDrawerList}
      </Drawer>
    </div>
  );
}

export default Films;
