import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import AccHub from "../L2/AccountHub";
import SearchBar from "../L2/SearchBar";
import NavBar from "../L2/NavBar";
import Birdies from "../L2/Birdies";
import SideMenu from "../L2/SideMenu";
import supabase from "../server/config";
import StarOutlineIcon from "@mui/icons-material/StarOutline";

import Films from "../L2/Film";
import { useAuth } from "../contexts/AuthContext";
import ShuffleIcon from "@mui/icons-material/Shuffle";

import ShuffleOnIcon from "@mui/icons-material/ShuffleOn"; // add an icon for ON state
import { Switch } from "@mui/material"; // import MUI switch
import {
  Paper,
  Box,
  List,
  ListItem,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";

const WatchPlaylist: React.FC = () => {
  const { userInfo: user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid");
  const listId = searchParams.get("list_id");
  //alert(uuid);
  const [playlistFilms, setPlaylistFilms] = React.useState<any[]>([]);
  const [loadingPlaylist, setLoadingPlaylist] = React.useState(true);

  // history insertion logic
  const hasInsertedRef = React.useRef(false);
  React.useEffect(() => {
    const checkHistory = async () => {
      if (hasInsertedRef.current) return;
      hasInsertedRef.current = true;

      await supabase.from("historys_films").delete().eq("film_id", uuid);

      const { count } = await supabase
        .from("historys_films")
        .select("*", { count: "exact", head: true })
        .eq("history_id", user.auth_id);

      await supabase.from("historys_films").insert({
        history_id: user.auth_id,
        film_id: uuid,
        film_index: (count || 0) + 2,
      });
    };

    if (user?.auth_id && uuid) {
      checkHistory();
    }
  }, [user?.auth_id, uuid]);

  // fetch films in provided playlist
  const [playlistMeta, setPlaylistMeta] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchPlaylist = async () => {
      if (!listId) {
        setPlaylistFilms([]);
        setPlaylistMeta(null);
        setLoadingPlaylist(false);
        return;
      }

      setLoadingPlaylist(true);

      // fetch films
      const { data: filmsInPlaylist, error: filmsError } = await supabase
        .from("playlists_films")
        .select(
          "film_id, film_index, films(film_uuid, film_title, film_genre, poster_path,avg_rating)"
        )
        .eq("playlist_id", listId)
        .order("film_index", { ascending: true });

      // fetch playlist metadata
      const { data: playlistInfo, error: playlistError } = await supabase
        .from("playlists")
        .select("playlist_name, film_count, users(username)")
        .eq("playlist_uuid", listId)
        .single();

      if (filmsError) console.error(filmsError);
      if (playlistError) console.error(playlistError);

      setPlaylistFilms(filmsInPlaylist || []);
      setPlaylistMeta(playlistInfo || null);
      setLoadingPlaylist(false);
    };

    fetchPlaylist();
  }, [listId]);
  //shuffle
  const [shuffle, setShuffle] = React.useState(false); // shuffle toggle
  const handleFilmEnded = React.useCallback(() => {
    // alert("film ended");
    if (!playlistFilms.length || !uuid) return;

    if (shuffle) {
      let randomFilm;
      do {
        randomFilm =
          playlistFilms[Math.floor(Math.random() * playlistFilms.length)];
      } while (randomFilm.films.film_uuid === uuid && playlistFilms.length > 1);

      navigate(
        `/watchplaylist?uuid=${randomFilm.films.film_uuid}&list_id=${listId}`
      );
    } else {
      const currentIndex = playlistFilms.findIndex(
        (pf) => pf.films.film_uuid === uuid
      );
      if (currentIndex !== -1 && currentIndex < playlistFilms.length - 1) {
        const nextFilm = playlistFilms[currentIndex + 1];
        navigate(
          `/watchplaylist?uuid=${nextFilm.films.film_uuid}&list_id=${listId}`
        );
      }
    }
  }, [playlistFilms, shuffle, uuid, navigate, listId]);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Birdies />

      {/* Top Nav */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "100vw",
          height: "10vh",
          gap: 2,
          position: "absolute",
          left: 0,
          top: 0,
          px: 2,
        }}
      >
        <NavBar />
        <SearchBar />
        <AccHub />
      </Box>

      {/* Main viewer + playlist in one flex row */}

      {/* Film viewer */}
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
          width: { xs: "98vw", sm: "98vw", md: "60vw" },
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
            }}
          >
            <Films filmId={uuid} onEnded={handleFilmEnded} />
          </Box>
        </PageContainer>
      </Paper>

      {/* Playlist sidebar */}
      {listId && (
        <Paper
          sx={{
            background:
              "linear-gradient(rgba(46,62,38,0.3), rgba(96,170,167,0.3))",
            borderRadius: "30px",
            p: 2,
            position: "absolute",

            overflow: "hidden",
            flexDirection: "column",
            backgroundColor: "transparent",
            boxShadow:
              "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.10)",
            right: { xs: "1vw", sm: "1vw", md: "16vw" },
            top: "12vh",
            width: { xs: "0vw", sm: "0vw", md: "20vw" },
            height: "86vh",
            display: { xs: "none", sm: "none", md: "block" },
          }}
        >
          {playlistMeta && (
            <Box mb={2}>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontFamily: '"Freckle Face", system-ui',
                }}
                variant="h6"
              >
                {playlistMeta.playlist_name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontFamily: '"Freckle Face", system-ui',
                }}
              >
                {playlistMeta.film_count} films · by{" "}
                {playlistMeta.users?.username}
              </Typography>
              <Divider sx={{ mt: 1, mb: 1 }} />
              <Box display="flex" alignItems="center" gap={1}>
                <ShuffleIcon />
                <Switch
                  checked={shuffle}
                  onChange={(e) => setShuffle(e.target.checked)}
                />
              </Box>
            </Box>
          )}

          {loadingPlaylist ? (
            <p>Loading playlist…</p>
          ) : (
            <List>
              {playlistFilms.map((pf) => (
                <React.Fragment key={pf.film_id}>
                  {pf.films.film_uuid != uuid && (
                    <ListItem
                      button
                      onClick={() =>
                        navigate(
                          `/watchplaylist?uuid=${pf.films.film_uuid}&list_id=${listId}`
                        )
                      }
                      selected={pf.films.film_uuid === uuid}
                    >
                      <img
                        src={
                          supabase.storage
                            .from("posters")
                            .getPublicUrl(pf.films.poster_path).data
                            .publicUrl || "/placeholder.jpg"
                        }
                        alt={pf.films.film_title}
                        style={{
                          width: 80,
                          borderRadius: 8,
                          marginRight: 12,
                          aspectRatio: "2/3",
                        }}
                      />

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        flex={1}
                      >
                        <Box>
                          <Typography
                            sx={{
                              color: "text.secondary",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                            variant="h6"
                          >
                            {pf.films.film_title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                          >
                            {pf.films.film_genre || "No genre"}
                          </Typography>
                        </Box>

                        <Box textAlign="center">
                          <StarOutlineIcon />

                          <Typography
                            sx={{
                              color: "text.secondary",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                            variant="body2"
                          >
                            {pf.films.avg_rating ?? "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  )}
                  {pf.films.film_uuid == uuid && (
                    <ListItem
                      button
                      onClick={() =>
                        navigate(
                          `/watchplaylist?uuid=${pf.films.film_uuid}&list_id=${listId}`
                        )
                      }
                      sx={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                      selected={pf.films.film_uuid === uuid}
                    >
                      <img
                        src={
                          supabase.storage
                            .from("posters")
                            .getPublicUrl(pf.films.poster_path).data
                            .publicUrl || "/placeholder.jpg"
                        }
                        alt={pf.films.film_title}
                        style={{
                          width: 80,
                          borderRadius: 8,
                          marginRight: 12,
                          aspectRatio: "2/3",
                        }}
                      />

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        flex={1}
                      >
                        <Box>
                          <Typography
                            sx={{
                              color: "white",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                            variant="h6"
                          >
                            {pf.films.film_title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "white",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                          >
                            {pf.films.film_genre || "No genre"}
                          </Typography>
                        </Box>

                        <Box textAlign="center">
                          <StarOutlineIcon
                            sx={{
                              color: "white",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                          />

                          <Typography
                            sx={{
                              color: "white",
                              fontFamily: '"Freckle Face", system-ui',
                            }}
                            variant="body2"
                          >
                            {pf.films.avg_rating ?? "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  )}
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      )}

      <SideMenu />
    </div>
  );
};
export default WatchPlaylist;
