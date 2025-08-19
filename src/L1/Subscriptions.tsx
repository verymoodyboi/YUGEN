import * as React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import AccountCard from "../L2/AccountCard";
import SearchBar from "../L2/SearchBar";
import NavBar from "../L2/NavBar";
import Birdies from "../L2/Birdies";
import SideMenu from "../L2/SideMenu";
import supabase from "../server/config";

import AccHub from "../L2/AccountHub";

import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  Card,
  Grid,
  Divider,
  Button,
} from "@mui/material";

const Subscriptons: React.FC = () => {
  // Fetch accounts with query awareness
  const { userInfo } = useAuth();
  const [subs, setSubs] = React.useState<any>([]);
  const [loading, setLoading] = React.useState(true);
  //account info
  const [searchParams] = useSearchParams();
  React.useEffect(() => {
    const fetchSubs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          `
    *,
    sub:users!fk_artist(username, pfp_path, films_count, sub_count, bio)
  `
        )
        .eq("subscriber_id", userInfo.auth_id);

      if (error) {
        console.error("Error fetching film:", error);
      } else {
        setSubs(data);
        console.log("data" + data);
      }
      setLoading(false);
    };

    if (userInfo?.auth_id) {
      fetchSubs();
    }
  }, [userInfo?.auth_id]);

  // Update films state when data changes

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Birdies />

      {/* Top Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
          height: "10vh",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <AccHub />
      </Box>
      <NavBar />
      <SearchBar />

      <Paper
        sx={{
          background:
            "linear-gradient(rgba(46,62,38,0.3), rgba(96,170,167,0.3))",
          borderRadius: "30px",
          p: 2,
          position: "absolute",
          left: { xs: "2vw", sm: "1vw", md: "2vw" },
          top: "12vh",
          width: { xs: "98vw", sm: "98vw", md: "70vw" },
          height: "86vh",
          boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
          overflowY: "auto",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#341c1c",
            fontFamily: '"Freckle Face", system-ui',
            mb: 2,
          }}
        >
          Subscriptions:
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : subs.length === 0 ? (
          <Typography color="error">No results!</Typography>
        ) : (
          <>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                {subs.map((subItem: any, index: number) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <AccountCard account={subItem.sub} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}

        {subs.length == 0 && <>No results!</>}
      </Paper>

      <SideMenu />
    </div>
  );
};

export default Subscriptons;
