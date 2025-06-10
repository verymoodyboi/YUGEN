import "../App.css";
import React from "react";
import GenreLogo from "../YugenAssits/Icons/GenreLogopng.png";
import HistoryLogo from "../YugenAssits/Icons/HistoryIcon.png";
import FollowsLogo from "../YugenAssits/Icons/FollowsIcon.png";
import PlaylistsLogo from "../YugenAssits/Icons/PlaylistIcon.png";
import WatchListLogo from "../YugenAssits/Icons/WatchListLogo.png";
import { Box, Button, ButtonGroup, Typography, Divider } from "@mui/material";
import EyeOutlined from "antd";
import { relative } from "path";

function SideMenu() {
  return (
    <Box
      className="sideMenu"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Typography
        variant="h5"
        color="rgba(255,255,255,0.8)"
        fontFamily={'"Freckle Face", system-ui'}
      >
        {" "}
        Your Library
      </Typography>
      <Button size="small" className="Button">
        Watchlist
      </Button>
      <Button className="Button"> Subscriptions</Button>
      <Button className="Button">Watch history</Button>
      <Typography
        variant="h5"
        color="rgba(255,255,255,0.8)"
        fontFamily={'"Freckle Face", system-ui'}
      >
        {" "}
        Community
      </Typography>
      <Button className="Button">Clubs</Button>
      <Button className="Button">Challenges</Button>
      <Typography
        variant="h5"
        color="rgba(255,255,255,0.8)"
        fontFamily={'"Freckle Face", system-ui'}
      >
        {" "}
        Explore
      </Typography>
      <Button className="Button">Genres</Button>
      <Button className="Button">Film map</Button>
      <Button className="Button">Roll a dice</Button>
    </Box>
  );
}
export default SideMenu;
