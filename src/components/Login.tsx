import "../App.css";
import { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import { Button, colors, ThemeProvider } from "@mui/material";
import { Link } from "react-router-dom";
import supabase from "../server/config.ts";
import { useNavigate } from "react-router-dom";
import "../App.tsx";

function LoginForm() {
  const [Inputs, SetInputs] = useState({});
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      if (error) {
        console.error("Supabase login error:", error);
        setMessage(error.message);
        setEmail("");
        setPassword("");
        return;
      }
      return;
    }

    if (data) {
      navigate("/home");
      return null;
    }
  };

  return (
    <div className="Form">
      <form onSubmit={handleSubmit}>
        <p>
          Don't have an account? <Link to="/SignUpPage">Signup</Link>
        </p>

        <TextField
          name="email"
          label="Username"
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

        <p>
          Forgot password? <Link to="/LoginPage">Reset password</Link>
        </p>
      </form>
    </div>
  );
}
export default LoginForm;
