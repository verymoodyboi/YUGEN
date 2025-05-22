import "../App.css";
import { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import { Button, colors, ThemeProvider } from "@mui/material";
import { Link } from "react-router-dom";
import "../App.tsx";

function LoginForm() {
  const [Inputs, SetInputs] = useState({});
  //OnChange
  const HandleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    SetInputs((prevValues) => ({ ...prevValues, [name]: value }));
  };
  return (
    <div className="Form">
      <form>
        <p>
          Don't have an account? <Link to="/SignUpPage">Signup</Link>
        </p>

        <TextField
          name="UserName"
          label="Username"
          variant="outlined"
          onChange={HandleChange}
          sx={{
            minHeight: "80px",
            height: "auto",
            fontSize: "16px",
            padding: "10px",
            width: "100%",
          }}
        />
        <TextField
          name="Pword"
          label="Password"
          variant="outlined"
          onChange={HandleChange}
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
