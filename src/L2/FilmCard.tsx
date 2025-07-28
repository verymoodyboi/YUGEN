import * as React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  IconButton,
  Typography,
  Button,
  Dialog,
} from "@mui/material";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import AddIcon from "@mui/icons-material/Add";

interface Film {
  film_title: string;
  film_genre?: string;
  avg_rating?: number;
  thesis: string;
  thumbnail_path?: string;
}

interface Props {
  film: Film;
}

const FilmCard: React.FC<Props> = ({ film }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Card
      sx={{
        borderRadius: "5%",
        width: 240,
        background: "linear-gradient(rgba(46,62,38,0.3),rgba(96,170,167,0.3))",
        position: "relative",
      }}
    >
      <CardMedia
        component="img"
        image={"../server/" + film.poster_path}
        alt="Film thumbnail"
        style={{ aspectRatio: "2/3", width: "100%" }}
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
            <Typography variant="h6">{film.film_title}</Typography>
            <Typography variant="body2">
              {film.film_genre || "No genre"}
            </Typography>
          </Box>
          <Box textAlign="center">
            <StarOutlineIcon />
            <Typography variant="body2">{film.avg_rating ?? "N/A"}</Typography>
          </Box>
        </Box>
      </CardContent>
      <Box textAlign="center" sx={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
        <IconButton onClick={() => setOpen(true)}>
          <AddIcon />
        </IconButton>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <Box className="Form">
          <Typography variant="h6">Thesis</Typography>
          <Typography variant="body2">{film.thesis}</Typography>
          <Button onClick={() => setOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Dialog>
    </Card>
  );
};

export default FilmCard;
