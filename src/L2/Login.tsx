import "../App.css";
import { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import { Button, Typography, IconButton, Box, Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CheckIcon from "@mui/icons-material/Check";
import { Link } from "react-router-dom";
import supabase from "../server/config.ts";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import "../App.tsx";
import { toast, ToastContainer } from "react-toastify";

function LoginForm() {
  //Reset Password
  const [openReset, setOpenReset] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleChangePasswordEmail = async () => {
    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
      return toast.warn("Valid email required");
    setIsDone(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/#/resetPassword",
    });
  };
  /////
  const [Inputs, SetInputs] = useState({});
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password,
    });

    if (error) {
      if (error) {
        console.error("Supabase login error:", error);
        setMessage(error.message);
        setEmail("");
        setPassword("");
        if (error.message.includes("Email not confirmed")) {
          return toast.warn("Please confirm your email before logging in.");
        } else {
          return toast.warn("invalid email or password!");
        }
      }
      return;
    }

    if (data) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email_confirmed_at) {
        return toast.warn("Please verify your email before logging in.");
      }

      navigate("/home");
      return null;
    }
  };
  const handleGoogleSignIn = async () => {
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });
    if (error) {
      console.error("Google sign in error:", error);
      setMessage(error.message);
    }
  };
  return (
    <div className="Form">
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <p>
          Don't have an account? <Link to="/SignUpPage">Signup</Link>
        </p>

        <TextField
          name="email"
          label="Eamil"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            minHeight: "80px",
            height: "auto",
            fontSize: "16px",
            padding: "10px",
            width: "100%",
          }}
        />
        <TextField
          name="password"
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            minHeight: "80px",
            height: "auto",
            fontSize: "16px",
            padding: "10px",
            width: "100%",
          }}
        />
        <br />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{
            fontFamily: '"Freckle Face", system-ui, sans-serif',
            color: "#fff",
            margin: "2rem",
          }}
        >
          Login
        </Button>
        <br />
        <Button
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          sx={{
            textTransform: "none",
            fontFamily: '"Freckle Face", system-ui, sans-serif',
            color: "#fff",
          }}
        >
          Sign in with Google
        </Button>
        <br />
        <br />
        <br />
        <Button
          variant="outlined"
          sx={{
            fontFamily: '"Freckle Face", system-ui',
            borderColor: "#ff89b2ff",
            color: "#ff89b2ff",
            "&:hover": {
              color: "#552637ff", // Font color on hover
              borderColor: "#552637ff", // Border color on hover
            },
          }}
          onClick={() => {
            setOpenReset(true);
          }}
        >
          Forgot password?
        </Button>
      </form>
      <Dialog
        open={openReset}
        onClose={() => {
          setOpenReset(false);
        }}
        hideBackdrop
        fullScreen
        PaperProps={{
          sx: {
            display: "flex",
            justifyContent: "center", // center vertically
            alignItems: "center", // center horizontally
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        {isDone && (
          <Box className="centered-box-v-blurred">
            <IconButton
              edge="start"
              onClick={() => {
                setOpenReset(false);
              }}
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                color: "white",
              }}
            >
              <CloseIcon />
            </IconButton>{" "}
            <CheckIcon sx={{ fontSize: 100 }}></CheckIcon>
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Freckle Face", system-ui',
              }}
            >
              You will be sent an email to reset your password!
            </Typography>
          </Box>
        )}
        {!isDone && (
          <Box className="centered-box-v-blurred">
            <IconButton
              edge="start"
              onClick={() => {
                setOpenReset(false);
              }}
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                color: "white",
              }}
            >
              <CloseIcon />
            </IconButton>
            <VpnKeyIcon sx={{ fontSize: 100, color: "#341c1c" }} />
            <Typography
              variant="h5"
              sx={{
                fontFamily: ' "Freckle Face", system-ui',
                color: "#341c1c",
              }}
            >
              Please comfirm your email to reset your password
            </Typography>
            <TextField
              fullWidth
              label="Email"
              //value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                handleChangePasswordEmail();
              }}
            >
              Finish
            </Button>
          </Box>
        )}
      </Dialog>
    </div>
  );
}
export default LoginForm;
