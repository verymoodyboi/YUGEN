import "../App.css";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import Divider from "@mui/material/Divider";
import React, { useState } from "react";
import ReactPlayer from "react-player";
import Avatar from "@mui/material/Avatar";
import axios from "axios";
import ReviewForm from "./Review";
import CloseIcon from "@mui/icons-material/Close";
import { TextField, Button, Dialog } from "@mui/material";
import Thoughts from "./thoughts";
interface targetFilm {
  id: number;
}
const Films: React.FC<targetFilm> = ({ id }) => {
  const [filmData, setFilmData] = useState<any | null>(null);
  const [uploaderData, setUploaderData] = useState<any | null>(null);
  const [filmID, setFilmID] = useState<any | null>(id);
  const [click, setClick] = useState(false);
  const [open, setOpen] = React.useState(false);

  const [rating, setRating] = useState<number>(0);
  const [userId, setUserId] = useState<number | null>(null);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleClick = async () => {
    try {
      const response = await axios.get("http://localhost:3001/filmdata", {
        params: { filmID },
      });

      if (response.data && response.data.length > 0) {
        const film = response.data[0];
        setFilmData(film); // Update film data for UI

        try {
          const response2 = await axios.get(
            "http://localhost:3001/getuploader",
            {
              params: { id: film.uploader_id },
            }
          );
          setUploaderData(response2.data[0]);
          //alert(JSON.stringify(response2.data[0]));
          if (response2.data && response2.data.length > 0) {
            setUploaderData(response2.data[0]);
          }
        } catch (error) {
          console.error("Error fetching uploader data:", error);
        }
      }

      setClick(true);
    } catch (error) {
      console.error("Error fetching film data:", error);
    }
  };
  if (!click) {
    handleClick();
  }

  return (
    <div style={{ backgroundColor: "reds" }}>
      {filmData && (
        <div className="film-and-filmData">
          <br></br>
          <Divider />
          <hr />

          <Divider />
          <hr />
          <ReactPlayer url={filmData.film_path} controls />
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
            {rating != 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  //flexDirection: "row",
                  alignItems: "center",
                  gap: "15px",
                  backgroundColor: "red",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    backgroundColor: "red",
                  }}
                >
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
                </Box>
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
                  flexDirection: "row",
                  justifyItems: "center",
                  alignItems: "center",
                }}
              >
                <IconButton onClick={toggleDrawer(true)}>
                  <StarOutlineIcon fontSize="large" />
                </IconButton>
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"Freckle Face", system-ui',
                  }}
                >
                  {filmData.avg_rating && <p>{filmData.avg_rating}</p>}
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
            <Card variant="outlined" className="Card">
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
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"Freckle Face", system-ui',
                  }}
                >
                  <p>{filmData.thesis}</p>
                </Typography>
              </Box>
            </Card>
            <Card variant="outlined" className="Card">
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
            <Card variant="outlined" className="Card">
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
            userId={userId} // Pass the current user's ID
          />
        </div>
      )}
      <Dialog
        fullScreen
        open={open}
        onClose={() => toggleDrawer(false)}
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
          <ReviewForm id={filmID} />
        </Box>
      </Dialog>
    </div>
  );
};

export default Films;
