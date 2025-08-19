import "../App.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Badge,
  Drawer,
  IconButton,
  SwipeableDrawer,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useAuth } from "../contexts/AuthContext";

function SideMenu() {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [open, setOpen] = useState(false);
  const MenuContentBig = (
    <Box
      className="sideMenu"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      gap={2}
      sx={{ p: 2, width: 220 }}
    >
      <Typography
        variant="h5"
        color="rgba(255,255,255,0.8)"
        fontFamily={'"Freckle Face", system-ui'}
      >
        Your Library
      </Typography>
      <Badge
        badgeContent={userInfo?.watchlist_count || ""}
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: "#341c1c",
            color: "#fff",
          },
        }}
      >
        <Button
          size="small"
          className="Button"
          onClick={() => {
            navigate("/watchlist");
            setOpen(false); // close drawer on mobile
          }}
        >
          Watchlist
        </Button>
      </Badge>
      <Button
        className="Button"
        onClick={() => {
          navigate("/history");
          setOpen(false);
        }}
      >
        Watch history
      </Button>
      <Button
        className="Button"
        onClick={() => {
          navigate("/playlists");
          setOpen(false);
        }}
      >
        Playlists
      </Button>
      <Button
        className="Button"
        onClick={() => {
          navigate("/subs");
          setOpen(false);
        }}
      >
        Subscriptions
      </Button>

      <Typography
        variant="h5"
        color="rgba(255,255,255,0.8)"
        fontFamily={'"Freckle Face", system-ui'}
      >
        Community
      </Typography>
      <Button disabled={true} className="Button">
        Clubs
      </Button>
      <Button disabled={true} className="Button">
        Challenges
      </Button>

      <Typography
        variant="h5"
        color="rgba(255,255,255,0.8)"
        fontFamily={'"Freckle Face", system-ui'}
      >
        Explore
      </Typography>
      <Button disabled={true} className="Button">
        Genres
      </Button>
      <Button disabled={true} className="Button">
        Film map
      </Button>
      <Button disabled={true} className="Button">
        Roll a dice
      </Button>
    </Box>
  );
  const buttonSx = {
    borderRadius: "40%",
    boxShadow: `
      0 1px 3px rgba(0, 0, 0, 0.12),
      0 4px 6px rgba(0, 0, 0, 0.1)
    `,
    transition: "box-shadow 0.2s ease, transform 0.1s ease",
    backgroundColor: "transparent",
    fontFamily: '"Freckle Face", system-ui',
    fontWeight: 400,
    fontSize: "2.5vh",
    color: "#341c1c",
    "&:hover": {
      boxShadow: `
        0 6px 12px rgba(0, 0, 0, 0.35)
      `,
      transform: "translateY(-5px)",
    },
  };
  const MenuContent = (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      p={2}
    >
      <Typography
        variant="h5"
        color="rgba(255,255,255,0.8)"
        fontFamily={'"Freckle Face", system-ui'}
      >
        Your Library
      </Typography>

      <Badge
        badgeContent={userInfo?.watchlist_count || ""}
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: "#341c1c",
            color: "#fff",
          },
        }}
      >
        <Button
          sx={buttonSx}
          onClick={() => {
            navigate("/watchlist");
            setOpen?.(false);
          }}
        >
          Watchlist
        </Button>
      </Badge>
      <Button
        sx={buttonSx}
        onClick={() => {
          navigate("/playlists");
          setOpen(false);
        }}
      >
        Playlists
      </Button>
      <Button
        sx={buttonSx}
        onClick={() => {
          navigate("/history");
          setOpen?.(false);
        }}
      >
        Watch history
      </Button>

      <Button
        sx={buttonSx}
        onClick={() => {
          navigate("/subs");
          setOpen?.(false);
        }}
      >
        Subscriptions
      </Button>

      <Typography
        variant="h5"
        color="rgba(255,255,255,0.8)"
        fontFamily={'"Freckle Face", system-ui'}
      >
        Community
      </Typography>

      <Button disabled={true} sx={buttonSx}>
        Clubs
      </Button>
      <Button disabled={true} sx={buttonSx}>
        Challenges
      </Button>

      <Typography
        variant="h5"
        color="rgba(255,255,255,0.8)"
        fontFamily={'"Freckle Face", system-ui'}
      >
        Explore
      </Typography>

      <Button disabled={true} sx={buttonSx}>
        Genres
      </Button>
      <Button disabled={true} sx={buttonSx}>
        Film map
      </Button>
      <Button disabled={true} sx={buttonSx}>
        Roll a dice
      </Button>
    </Box>
  );

  return (
    <>
      {/* Hamburger Icon (xs/sm only) */}
      {!open && (
        <IconButton
          sx={{
            display: { xs: "block", sm: "block", md: "block", lg: "none" },
            position: "absolute",
            top: "50vh",
            right: 10, //
            zIndex: 1300,
            color: "#341c1c",
          }}
          onClick={() => setOpen(true)}
        >
          <ChevronLeftIcon sx={{ fontSize: "3rem" }} />
        </IconButton>
      )}

      {/* Drawer (mobile) */}
      <SwipeableDrawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        PaperProps={{
          sx: {
            width: 240,
            background: "rgba(174, 155, 155, 0.95)",
            color: "white",
            backdropFilter: "blur(6px)",
          },
        }}
      >
        {MenuContent}
      </SwipeableDrawer>

      {/* Permanent sidebar (desktop) */}
      <Box
        sx={{
          display: { xs: "none", sm: "none", md: "none", lg: "flex" },
        }}
      >
        {MenuContentBig}
      </Box>
    </>
  );
}

export default SideMenu;
