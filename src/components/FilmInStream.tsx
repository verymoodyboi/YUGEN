import "../App.css";
import Birdies from "./Birdies";
import { useState } from "react";
import testing from "../YugenAssits/temp/testing.png";
import React from "react";
import ReviewForm from "./Review";
import ReportFilmForm from "./ReportFilm";

import {
  Avatar,
  Button,
  Stack,
  Chip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Box,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import StarIcon from "@mui/icons-material/Star";

const Description = `Film description.`;
const Cast = `Renad, Mohanad, Mohy and Ahmed as people..`;
const Crew = `Directed by Renad, produced by Mohanad, written by Mohy and Ahmed.`;
const videoPath = "/uploads/films/Really short video.mp4";

const V_Genres = ["Adventure", "Comedy", "Drama", "Horror", "Romance"];
const V_Rating = 9.9;
const genreColors: Record<string, string> = {
  Adventure: "#4caf50",
  Comedy: "#ff9800",
  Drama: "#3f51b5",
  Horror: "#f44336",
  Romance: "#e91e63",
};
const MAX_VISIBLE = 3;

const CommentSection = () => {
  const [comments, setComments] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim()) {
      setComments((prev) => [...prev, input.trim()]);
      setInput("");
    }
  };
  return (
    <Stack spacing={2} sx={{ mt: 4, width: "100%" }}>
      <Typography
        variant="h6"
        color="white"
        sx={{ fontFamily: '"Freckle Face", system-ui' }}
      >
        Comments
      </Typography>

      <TextField
        multiline
        fullWidth
        minRows={3}
        placeholder="Write your comment..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        variant="outlined"
        sx={{ backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: "2%" }}
      />

      <Button
        onClick={handleSubmit}
        variant="contained"
        sx={{ width: "fit-content", fontFamily: '"Freckle Face", system-ui' }}
      >
        Post Comment
      </Button>

      <List
        sx={{ backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: "2%" }}
      >
        {comments.map((comment, index) => (
          <ListItem key={index} alignItems="flex-start">
            <ListItemAvatar>
              <Avatar />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontFamily: '"Freckle Face", system-ui',
                    fontWeight: "bold",
                  }}
                >
                  User
                </Typography>
              }
              secondary={
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                  fontFamily='"Freckle Face", system-ui'
                >
                  {comment}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Stack>
  );
};

const FilmInStream: React.FC = () => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showReportForm, setShowReportForm] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReportClick = () => {
    setShowReportForm(!showReportForm);
    handleMenuClose();
  };

  return (
    <div>
      <div className="filmpage-wrapper">
        <Stack
          direction="column"
          spacing={2}
          sx={{ width: "100%", alignItems: "flex-start" }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ width: "100%" }}
          >
            <Avatar>
              <PersonIcon />
            </Avatar>

            <Typography
              variant="body1"
              sx={{ fontFamily: '"Freckle Face", system-ui' }}
            >
              username
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            <IconButton
              onClick={handleMenuOpen}
              sx={{
                marginLeft: "auto",
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
            >
              <MenuItem onClick={handleReportClick}>Report</MenuItem>
              <MenuItem
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  handleMenuClose();
                }}
              >
                Share
              </MenuItem>
            </Menu>
          </Stack>

          {showReportForm && (
            <Box sx={{ width: "100%", mt: 2 }}>
              <ReportFilmForm />
            </Box>
          )}

          <Stack
            direction="column"
            spacing={1}
            alignItems="center"
            width="100%"
          >
            <video
              src={videoPath}
              controls
              style={{ borderRadius: "2%", width: "100%" }}
            ></video>
          </Stack>

          <Stack
            className="filmpage-cover-and-filmname"
            direction="row"
            spacing={2}
            alignItems="center"
            width="100%"
          >
            {/*Film Cover*/}
            <Tooltip
              title={
                <img
                  src={testing}
                  alt="Full Cover"
                  style={{ maxWidth: "200px", borderRadius: "8px" }}
                />
              }
              placement="right"
            >
              <img
                src={testing}
                alt="Film Cover"
                style={{
                  borderRadius: "2%",
                  width: "5%",
                  height: "100%",
                  maxHeight: "600px",
                  cursor: "pointer",
                }}
              />
            </Tooltip>

            {/*Film Name*/}
            <Typography
              variant="h5"
              color="white"
              sx={{ fontFamily: '"Freckle Face", system-ui' }}
            >
              Film Title
            </Typography>
          </Stack>

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
                }}
              />
            ))}

            {V_Genres.length > MAX_VISIBLE && (
              <Tooltip
                title={
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    {V_Genres.slice(MAX_VISIBLE).map((genre) => (
                      <Chip
                        key={genre}
                        label={genre}
                        size="small"
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

          <Stack
            className="filmpage-review-container"
            direction="column"
            spacing={2}
            alignItems="flex-end"
            sx={{ width: "100%" }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <StarIcon sx={{ color: "#ff7f27" }} />
              <Typography
                variant="h6"
                sx={{ fontFamily: '"Freckle Face", system-ui' }}
              >
                {V_Rating}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowReviewForm(!showReviewForm)}
                sx={{
                  fontFamily: '"Freckle Face", system-ui',
                  backgroundColor: "transparent",
                  border: "none",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                {showReviewForm ? "Hide review" : "Add review"}
              </Button>
            </Stack>

            {showReviewForm && (
              <Box sx={{ width: "100%", mt: 2 }}>
                <ReviewForm />
              </Box>
            )}
          </Stack>

          <div className="filmpage-appendices" style={{ width: "90%" }}>
            <Accordion
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontFamily: '"Freckle Face", system-ui' }}>
                  Description
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ fontFamily: '"Freckle Face", system-ui' }}>
                  {Description}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontFamily: '"Freckle Face", system-ui' }}>
                  Cast
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ fontFamily: '"Freckle Face", system-ui' }}>
                  {Cast}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontFamily: '"Freckle Face", system-ui' }}>
                  Crew
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ fontFamily: '"Freckle Face", system-ui' }}>
                  {Crew}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </div>

          <CommentSection />
        </Stack>
      </div>
    </div>
  );
};

export default FilmInStream;
