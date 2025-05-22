import * as React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from "@mui/material";
import temp from "../server/uploads/thumbnails/1.jpg";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import AddIcon from "@mui/icons-material/Add";

interface Film {
  film_title: string;
  film_genre?: string;
  avg_rating?: number;
  thesis: string;
}

function FilmCard() {
  const [filmData, setFilmData] = useState<Film | null>(null);
  const [filmID] = useState<number>(1);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchFilmData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/filmdata", {
          params: { filmID },
        });
        setFilmData(response.data[0]);
      } catch (error) {
        console.error("Error fetching film data:", error);
      }
    };

    fetchFilmData();
  }, [filmID]);

  return (
    <div>
      {filmData && (
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
            alt="Film thumbnail"
            style={{
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
          >
            <BookmarkAddIcon fontSize="large" />
          </IconButton>
          <CardContent sx={{ height: "16%" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              sx={{ width: "90%", height: "fit-content" }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
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
                  {filmData.film_genre || "Genres not available"}
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
                  {filmData.avg_rating ?? "Rating not available"}
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
            <IconButton onClick={() => setOpen(true)}>
              <AddIcon />
            </IconButton>
          </Box>

          {/* Dialog (clean, no form) */}
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            PaperProps={{
              sx: {
                backgroundColor: "transparent",
                boxShadow: "none", // optional: remove box shadow
                overflow: "visible", // allows rounded corners/positioning to overflow
              },
            }}
            BackdropProps={{
              sx: {
                backgroundColor: "rgba(0, 0, 0, 0.3)", // adjust overlay transparency
              },
            }}
          >
            <Box className="Form">
              <Typography
                variant="h4"
                sx={{
                  color: "text.secondary",
                  fontFamily: '"Freckle Face", system-ui',
                }}
              >
                Thesis
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontFamily: '"Freckle Face", system-ui',
                }}
              >
                {filmData.thesis}
              </Typography>
              <Button
                onClick={() => setOpen(false)}
                style={{
                  background: "#cc651f",
                  color: "white",
                  marginTop: "10px",
                }}
              >
                Close
              </Button>
            </Box>
          </Dialog>
        </Card>
      )}
    </div>
  );
}

export default FilmCard;
