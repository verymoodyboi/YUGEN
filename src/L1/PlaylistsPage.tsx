import * as React from "react";
import PlayListCard from "../L2/PlaylistCard";
import AccHub from "../L2/AccountHub";
import SearchBar from "../L2/SearchBar";
import NavBar from "../L2/NavBar";
import Birdies from "../L2/Birdies";
import SideMenu from "../L2/SideMenu";

import supabase from "../server/config";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";

import AddIcon from "@mui/icons-material/Add";

import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import {
  Paper,
  Box,
  Typography,
  Switch,
  Dialog,
  Button,
  DialogContent,
  TextField,
} from "@mui/material";
import { PageContainer, PageHeader } from "@toolpad/core/PageContainer";

const PlaylistsPage: React.FC = () => {
  /// Add playlist
  const [playlistName, setPlaylistName] = React.useState("");
  const [isPublic, seIsPublic] = React.useState(false);
  const [isOpenAdd, setIsOpenAdd] = React.useState(false);

  const handleCreatePlaylist = async () => {
    if (playlistName == "") {
      toast.warn("please name the playlist.");
      return;
    }
    const addPlaylistToDB = await supabase.from("playlists").insert({
      playlist_name: playlistName,
      is_public: isPublic,
      user_id: userInfo.auth_id,
    });
    setIsOpenAdd(false);
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
      <AccHub></AccHub>
      <Birdies></Birdies>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center", // center everything vertically
          width: "100vw",
          height: "10vh", // you probably don't need 30vh for a nav

          gap: 2,
          position: "absolute",
          left: 0,
          top: 0,
          px: 2,
        }}
      >
        <NavBar />
        <SearchBar />
      </Box>

      <Paper
        sx={{
          background:
            "linear-gradient(rgba(46,62,38,0.3), rgba(96,170,167,0.3))",
          borderRadius: "30px",
          p: 2,
          position: "absolute",

          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "transparent",
          boxShadow:
            "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.10)",
          left: { xs: "1vw", sm: "1vw", md: "2vw" },
          top: "12vh",
          width: { xs: "98vw", sm: "98vw", md: "70vw" },
          height: "86vh",
        }}
      >
        <PageContainer sx={{ height: "100%", overflowY: "auto" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
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
              Mine
            </Typography>
            <Button
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
                borderRadius: "20px",
                color: "white",
                textTransform: "none",
                px: 2,
                py: 1,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                },
              }}
              startIcon={<AddIcon />}
              onClick={() => setIsOpenAdd(true)}
            >
              Create a playlist
            </Button>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {" "}
              {myPlaylists.map((playlist: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    display: "inline-block",
                    verticalAlign: "top",
                    marginRight: 2,
                  }}
                >
                  <PlayListCard playlist={playlist} />
                </Box>
              ))}
            </Box>
          </Box>
        </PageContainer>
      </Paper>
      <Dialog
        open={isOpenAdd}
        onClose={() => setIsOpenAdd(false)}
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
          <PlaylistPlayIcon sx={{ fontSize: 100 }} />
          <TextField
            label="Playlist name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            fullWidth
          />
          <Box
            sx={{
              display: "flex",
              //  flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Freckle Face", system-ui',
                color: "white",
              }}
            >
              Public
            </Typography>
            <Switch
              aria-label="public"
              checked={isPublic}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                seIsPublic(event.target.checked);
              }}
              slotProps={{ input: { "aria-label": "controlled" } }}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#9cd5ac", // thumb color when ON
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#9cd5ac", // track color when ON
                },
                "& .MuiSwitch-track": {
                  backgroundColor: "#ccc", // track color when OFF
                },
              }}
            />
          </Box>
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
              startIcon={<AddIcon />}
              onClick={() => {
                handleCreatePlaylist();
              }}
            >
              Done
            </Button>

            <Button
              variant="contained"
              sx={{
                fontFamily: '"Freckle Face", system-ui',
                borderColor: "#ff89b2ff",
                color: "#ffffffff",
                backgroundColor: "#ff89b2ff",
                transition: "all 0.3s ease",
                "&:hover": {
                  color: "#ffffffff",
                  borderColor: "#552637ff",
                  backgroundColor: "#552637ff",
                },
              }}
              onClick={() => {
                setIsOpenAdd(false);
              }}
            >
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <SideMenu></SideMenu>
      <ToastContainer />
    </div>
  );
};
export default PlaylistsPage;
