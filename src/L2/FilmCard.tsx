import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import AccHub from "../L2/AccountHub";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import SearchBar from "../L2/SearchBar";
import NavBar from "../L2/NavBar";
import Birdies from "../L2/Birdies";
import SideMenu from "../L2/SideMenu";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import supabase from "../server/config";
import LogoutIcon from "@mui/icons-material/Logout";

import CloseIcon from "@mui/icons-material/Close";
import Films from "../L2/Film";
import CustomLoading from "../L3/CutomsLoading";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import KeyIcon from "@mui/icons-material/Key";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CheckIcon from "@mui/icons-material/Check";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Dialog,
  Button,
  Slide,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  TextField,
} from "@mui/material";
import { PageContainer, PageHeader } from "@toolpad/core/PageContainer";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import ShieldIcon from "@mui/icons-material/Shield";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
const FilmCard = ({ film }: any) => {
  const { userInfo } = useAuth();
  const [openThesis, setOpenThesis] = React.useState(false);
  const [watchlisted, setWatchlisted] = React.useState(false);
  const [openFilm, setOpenFilm] = React.useState(false);
  const [openRating, setOpenRating] = React.useState(false);
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") === null &&
      target.closest(".MuiDialog-root") === null
    ) {
      navigate(`/watch?uuid=${encodeURIComponent(film.film_uuid)}`);
    }
  };
  //Watchlist
  const checkListed = async () => {
    const { data: existingWatchlist, error: fetchError } = await supabase
      .from("watchlists_films")
      .select("*")
      .eq("film_id", film.film_uuid)
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
  checkListed();
  const handleWatchlist = async () => {
    // Check if film is already in user's watchlist
    const { data: existingWatchlist, error: fetchError } = await supabase
      .from("watchlists_films")
      .select("*")
      .eq("film_id", film.film_uuid)
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
        .eq("film_id", film.film_uuid)
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
          film_id: film.film_uuid,
          film_index: (count || 0) + 2, // You may want to calculate this dynamically
        });
      setWatchlisted(true);

      if (insertError) console.error("Error adding to watchlist:", insertError);
    }
  };

  return (
    <Card
      className="film-card"
      sx={{
        borderRadius: "5%",
        // width: 240,
        background: "linear-gradient(rgba(46,62,38,0.3),rgba(96,170,167,0.3))",
        position: "relative",
        cursor: "pointer",
        display: "flex", // ✅ make card flex
        flexDirection: "column",
      }}
      onClick={handleCardClick}
    >
      {/* Poster */}
      <CardMedia
        component="img"
        image={
          supabase.storage.from("posters").getPublicUrl(film.poster_path).data
            .publicUrl
        }
        alt="Film thumbnail"
        style={{
          borderRadius: "3%",
          aspectRatio: "2/3",
          width: "100%",
        }}
      />

      {/* Bookmark Icon */}
      {!watchlisted && (
        <IconButton
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
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
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor: "transparent",
          }}
          onClick={() => {
            handleWatchlist();
          }}
        >
          <BookmarkAddedIcon fontSize="large" />
        </IconButton>
      )}
      {/* Card Content */}
      <CardContent>
        <Box sx={{ mt: "auto" }} display="flex" justifyContent="space-between">
          <Box>
            <Typography
              sx={{
                color: "text.secondary",
                fontFamily: '"Freckle Face", system-ui',
              }}
              variant="h6"
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
            <IconButton
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering card click
                setOpenRating(true);
              }}
            >
              <StarOutlineIcon />
            </IconButton>
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
      {/* Rating Dialog*/}

      <Dialog open={openRating} onClose={() => setOpenRating(false)}>
        <Box p={2} bgcolor="white" borderRadius={2}>
          <Typography
            sx={{ fontFamily: '"Freckle Face", system-ui' }}
            variant="h6"
          >
            Film Rating
          </Typography>
          <Typography>Average Rating: {film.avg_rating ?? "N/A"}</Typography>
          <Button onClick={() => setOpenRating(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Dialog>

      {/* Bottom Icon Button (Thesis) */}
      <Box
        textAlign="center"
        justifyContent={"center"}
        sx={{
          backgroundColor: "#341c1c",
          mt: "auto", // ✅ pushes this box to the bottom
        }}
      >
        <IconButton
          onClick={(e) => {
            e.stopPropagation(); // prevent card click
            setOpenThesis(true);
          }}
        >
          <HistoryEduIcon />
        </IconButton>
      </Box>

      {/* Dialog: Thesis */}
      <Dialog
        open={openThesis}
        onClose={() => setOpenThesis(false)}
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
            onClick={() => setOpenThesis(false)}
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
export default FilmCard;
