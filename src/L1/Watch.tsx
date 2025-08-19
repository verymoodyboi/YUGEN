import * as React from "react";
import { useSearchParams } from "react-router-dom";

import AccHub from "../L2/AccountHub";
import SearchBar from "../L2/SearchBar";
import NavBar from "../L2/NavBar";
import Birdies from "../L2/Birdies";
import SideMenu from "../L2/SideMenu";
import { useNavigate } from "react-router-dom";
import supabase from "../server/config";

import Films from "../L2/Film";

import { useAuth } from "../contexts/AuthContext";
import { Paper, Box } from "@mui/material";
import { PageContainer, PageHeader } from "@toolpad/core/PageContainer";

const Watch: React.FC = () => {
  const { userInfo: user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid");

  //add to history
  const hasInsertedRef = React.useRef(false);

  React.useEffect(() => {
    const checkHistory = async () => {
      if (hasInsertedRef.current) return;
      hasInsertedRef.current = true;

      // Get last film
      const { data: lastFilm } = await supabase
        .from("historys_films")
        .delete()
        .eq("film_id", uuid);
      // Count for index
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

  return (
    <div style={{ height: "100vh", width: "100vh" }}>
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
        <AccHub />
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
            <Films filmId={uuid}></Films>
          </Box>
        </PageContainer>
      </Paper>

      <SideMenu></SideMenu>
    </div>
  );
};
export default Watch;
