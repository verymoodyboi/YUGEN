import * as React from "react";
import { useState } from "react";
import axios from "axios";
import { styled } from "@mui/material/styles";
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Grid,
  Avatar,
  IconButton,
  IconButtonProps,
  Typography,
  Button,
  ButtonProps,
  Drawer,
  Stack,
} from "@mui/material";
import temp from "../server/uploads/thumbnails/1.jpg";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import AddIcon from "@mui/icons-material/Add";

function FilmCard() {
  const [filmData, setFilmData] = useState<any | null>(null);
  const [uploaderData, setUploaderData] = useState<any | null>(null);
  const [filmID, setFilmID] = useState<any | null>(null);
  const [click, setClick] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [setthesis, thesis] = useState<any | string>("");
  const [loading, setLoading] = React.useState(true);

  //////////
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    toggleDrawer(false);
    event.preventDefault();
  };
  const DrawerList = (
    <Box sx={{ width: 0, backgroundColor: "transparent" }} role="presentation">
      <form className="ReviewForm" onSubmit={handleSubmit}>
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
            <p> {thesis}</p>
          </Typography>
        </Box>
        <Button
          type="submit"
          style={{ background: "#cc651f", color: "white", marginTop: "20px" }}
          onClick={async () => {
            setOpen(false);
          }}
        >
          Close
        </Button>
      </form>
    </Box>
  );
  /////////
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };
  const handleClick = async () => {
    try {
      setLoading(true);
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
            setthesis(filmData.thesis);
            setLoading(false);
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
        <Card
          className="film-card"
          sx={{
            borderRadius: "5%",
            maxWidth: 345,
            background:
              "linear-gradient(rgba(46,62,38,0.3),rgba(96,170,167,0.3))",
          }}
        >
          <CardMedia
            component="img"
            image={temp}
            alt="Paella dish"
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
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.5)",
              },
            }}
            aria-label="favorite"
          >
            <BookmarkAddIcon fontSize="large" />
          </IconButton>
          <CardContent sx={{ height: "16%" }}>
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
                  variant="h6"
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <StarOutlineIcon fontSize="large" />
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"Freckle Face", system-ui',
                  }}
                >
                  {filmData.avg_rating && <p>{filmData.avg_rating}</p>}
                  {!filmData.avg_rating && <p>Rating not available</p>}
                </Typography>
              </div>
            </Box>
          </CardContent>
          <Box
            sx={{
              width: "100%",
              height: "9%",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <IconButton onClick={toggleDrawer(true)}>
              <AddIcon />
            </IconButton>
          </Box>
          <Drawer open={open} onClose={toggleDrawer(false)}>
            {DrawerList}
          </Drawer>
        </Card>
      )}
    </div>
  );
}
export default FilmCard;
