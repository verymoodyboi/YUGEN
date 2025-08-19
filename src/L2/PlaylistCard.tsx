import { useNavigate } from "react-router-dom";
import supabase from "../server/config";

import AddIcon from "@mui/icons-material/Add";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import VideocamIcon from "@mui/icons-material/Videocam";

import { Box, Typography, Card, CardContent, IconButton } from "@mui/material";

const PlayListCard = ({ playlist }: any) => {
  const navigate = useNavigate();
  const handleCardClick = () => {
    navigate(
      `/watchplaylist?uuid=${playlist.playlist_films?.[0]?.films?.film_uuid}&list_id=${playlist.playlist_uuid}`,
      {
        state: { playlist }, // optional: send full playlist object too
      }
    );
  };

  const posters = (playlist.playlist_films || [])
    .sort((a: any, b: any) => a.film_index - b.film_index)
    .slice(0, 3);
  return (
    <Card
      onClick={handleCardClick}
      className="playlist-card"
      sx={{
        borderRadius: "5%",
        width: 240,
        background: "linear-gradient(rgba(46,62,38,0.3),rgba(96,170,167,0.3))",
        position: "relative",
      }}
    >
      {/* Posters */}

      <Box
        sx={{
          display: "flex",
          width: "100%",
          aspectRatio: "6/3",
          borderRadius: "3%",
          overflow: "hidden",
        }}
      >
        {posters.map((pf: any, idx: number) => (
          <Box
            key={idx}
            sx={{
              flex: 1, // equal width for each image
              overflow: "hidden",
            }}
          >
            <img
              src={
                supabase.storage
                  .from("posters")
                  .getPublicUrl(pf.films?.poster_path).data.publicUrl ||
                "/placeholder.png"
              }
              alt={pf.films?.film_title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
        ))}
        {/* Fill empty slots if less than 3 films */}
        {Array.from({ length: 3 - posters.length }).map((_, i) => (
          <Box
            key={`empty-${i}`}
            sx={{
              flex: 1,
              background: "rgba(0,0,0,0.2)",
            }}
          >
            {" "}
            <LocalMoviesIcon sx={{ fontSize: "5vw" }} />
          </Box>
        ))}
        {posters.length == 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center", // centers horizontally
              alignItems: "center",
              background: "rgba(0,0,0,0.2)",
              width: "100%", // make sure it has space to center in
            }}
          >
            <PlaylistPlayIcon sx={{ fontSize: "10vw" }} />
          </Box>
        )}
      </Box>
      {/* Card Content */}
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography
              sx={{
                color: "text.secondary",
                fontFamily: '"Freckle Face", system-ui',
              }}
              textAlign={"left"}
              textOverflow={"auto"}
              variant="h6"
            >
              <PlaylistPlayIcon /> {playlist.playlist_name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontFamily: '"Freckle Face", system-ui',
              }}
            >
              by @{playlist.creator?.username || ""}
            </Typography>
          </Box>
          <Box textAlign="center">
            <VideocamIcon />
            <Typography
              sx={{
                color: "text.secondary",
                fontFamily: '"Freckle Face", system-ui',
              }}
              variant="body2"
            >
              {playlist.film_count ?? "N/A"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      {/* Bottom Icon Button (Thesis) */}
      <Box
        textAlign="center"
        justifyContent={"center"}
        sx={{ backgroundColor: "#341c1c" }}
      >
        <IconButton>
          <AddIcon />
        </IconButton>
      </Box>
    </Card>
  );
};
export default PlayListCard;
