import "../App.css";
import { useState } from "react";
import { TextField } from "@mui/material";
import "react-datepicker/dist/react-datepicker.css";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from './AuthContext';
import { toast } from "react-toastify";

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Attempting login with:', { username });
      await login(username, password);
      console.log('Login successful');
      toast.success('Login successful!');
      navigate('/'); // Redirect to homepage after successful login
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="LoginForm">
      <p id="Loginlabel">
        Don't have an account? <Link to="/SignUpPage">Signup</Link>{" "}
      </p>

      <form onSubmit={handleSubmit}>
        <TextField
          name="UserName"
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
      </form>

      <p>
        Forgot password? <Link to="/LoginPage">Reset password</Link>
      </p>
    </div>
  );
}

export default LoginForm;