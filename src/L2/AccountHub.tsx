import "../App.css";
import { useEffect, useState } from "react";
import supabase from "../server/config";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import PhotoCameraFrontIcon from "@mui/icons-material/PhotoCameraFront";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CheckIcon from "@mui/icons-material/Check";
import { ToastContainer, toast } from "react-toastify";
import {
  Box,
  Menu,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  ThemeProvider,
  createTheme,
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { Flex } from "antd";
function AccHub() {
  //
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  //logout Handle///////////////
  const logOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return;
    }
    navigate("/loginPage");
  };
  //pass reset
  const [OpenResetPassword, setOpenResetPassword] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [email, setEmail] = useState("");

  const handleChangePasswordEmail = async () => {
    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
      return toast.warn("Valid email required");

    setIsDone(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/#/resetPassword",
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 1,
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 10,
      }}
    >
      <Avatar
        aria-controls={open ? "demo-positioned-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        src={
          userInfo?.pfp_path
            ? supabase.storage.from("pfps").getPublicUrl(userInfo.pfp_path).data
                .publicUrl
            : undefined // fallback until loaded
        }
        sx={{ width: 60, height: 60, cursor: "pointer" }}
      />
      <Typography
        variant="h6"
        fontFamily={'"Freckle Face", system-ui'}
        sx={{
          maxWidth: { xs: 50, sm: 80, md: 220 }, // responsive max widths
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {(userInfo && userInfo.username) || "guest"}
      </Typography>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#341c1c",
            color: "#fff",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.15)",
            minWidth: 160,
            mt: 7,
            py: 1,
          },
        }}
      >
        <MenuItem
          sx={{
            fontFamily: '"Freckle Face", system-ui',
            justifyContent: "space-evenly",
          }}
          onClick={() => {
            navigate("/profile");
            handleClose();
          }}
        >
          <PhotoCameraFrontIcon />
          Profile
        </MenuItem>
        <MenuItem
          sx={{
            fontFamily: '"Freckle Face", system-ui',
            justifyContent: "space-evenly",
          }}
          onClick={() => {
            setOpenResetPassword(true);
          }}
        >
          <VpnKeyIcon />
          Reset password
        </MenuItem>
        <MenuItem
          sx={{
            fontFamily: '"Freckle Face", system-ui',
            justifyContent: "space-evenly",
          }}
          onClick={() => {
            handleClose();
            logOut();
          }}
        >
          <LogoutIcon />
          Logout
        </MenuItem>
      </Menu>
      {/* Password reset dialog */}
      <Dialog
        open={OpenResetPassword}
        onClose={() => setOpenResetPassword(false)}
        fullScreen
        sx={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
        }}
        PaperProps={{ sx: { backgroundColor: "transparent" } }}
      >
        {isDone ? (
          <Box className="centered-box-v-blurred">
            <CheckIcon sx={{ fontSize: 100 }} />
            <Typography variant="h3" fontFamily='"Freckle Face", system-ui'>
              You will be sent an email to reset your password!
            </Typography>
          </Box>
        ) : (
          <Box className="centered-box-v-blurred">
            <VpnKeyIcon sx={{ fontSize: 100, color: "#341c1c" }} />
            <Typography
              variant="h5"
              fontFamily='"Freckle Face", system-ui'
              color="#341c1c"
            >
              Please confirm your email to reset your password
            </Typography>
            <TextField
              fullWidth
              label="Email"
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
            <Button
              variant="contained"
              sx={{ backgroundColor: "#9cd5ac" }}
              onClick={handleChangePasswordEmail}
            >
              Finish
            </Button>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
export default AccHub;
