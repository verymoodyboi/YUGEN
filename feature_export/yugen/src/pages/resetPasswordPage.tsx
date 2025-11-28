import React, { useState } from "react";
import supabase from "../lib/supabaseClient";
import { Box, Typography, TextField, Button } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import CheckIcon from "@mui/icons-material/Check";
import { useNavigate } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [comfirmPassword, setComfirmPassword] = useState("");
  const [isDone] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8)
      return toast.warn("Password must be 8+ characters"), false;
    if (newPassword !== comfirmPassword)
      return toast.warn("Passwords must match"), false;
    await supabase.auth.updateUser({ password: newPassword });
    const Out = await supabase.auth.signOut();
    navigate("/LoginPage");
  };
  if (isDone) {
    return (
      <Box className="centered-box-v-blurred">
        <img
          src="https://iqvsgbsnpqvbddmdixoz.supabase.co/storage/v1/object/public/assets/Kickflip!.gif"
          alt="Yugen Logo"
          className="h-36 w-auto mx-auto mb-6"
        />

        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Freckle Face", system-ui',
          }}
        >
          Passwrod reset successful! You can now Login with the new Password.
        </Typography>
        <Button
          variant="contained"
          sx={{
            fontFamily: '"Freckle Face", system-ui',
            borderColor: "#9cd5ac",
            color: "white",
            backgroundColor: "#9cd5ac",
            "&:hover": {
              // Font color on hover
              borderColor: "#3e5e47ff",
              backgroundColor: "#3e5e47ff", // Border color on hover
            },
          }}
          onClick={() => {
            window.location.href = "/loginPage";
          }}
        >
          Login
        </Button>
      </Box>
    );
  }
  return (
    <Box className="centered-box-v-blurred">
      <Typography
        variant="h3"
        sx={{
          fontFamily: '"Freckle Face", system-ui',
        }}
      >
        Passwrod reset
      </Typography>

      <TextField
        fullWidth
        label="Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Confirm Password"
        type="password"
        value={comfirmPassword}
        onChange={(e) => setComfirmPassword(e.target.value)}
        margin="normal"
      />
      <Button
        variant="contained"
        sx={{
          fontFamily: '"Freckle Face", system-ui',
          borderColor: "#9cd5ac",
          color: "white",
          backgroundColor: "#9cd5ac",
          "&:hover": {
            // Font color on hover
            borderColor: "#3e5e47ff",
            backgroundColor: "#3e5e47ff", // Border color on hover
          },
        }}
        onClick={() => {
          handleResetPassword();
        }}
      >
        Reset
      </Button>
      <ToastContainer />
    </Box>
  );
};

export default ResetPassword;
