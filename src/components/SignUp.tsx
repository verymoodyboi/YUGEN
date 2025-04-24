import "../App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { TextField } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { ToastContainer, toast } from "react-toastify/unstyled";
import "react-toastify/dist/ReactToastify.css";
import { Button, colors, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material";
import { error } from "console";
import { Link } from 'react-router-dom';

registerPlugin(FilePondPluginFileValidateType);
registerPlugin(FilePondPluginImagePreview);
function SignUpForm() {
  const [Inputs, SetInputs] = useState({});
  const [startDate, setStartDate] = useState(new Date());
  //OnChange
  const HandleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    SetInputs((prevValues) => ({ ...prevValues, [name]: value }));
  };
  const ValidateUserName = async (event) => {
    let result;
    try {
      await axios.get("http:loaclhost:3001/getUser", result);
    } catch (result) {
      if (result) {
        toast.warn("User Name already in use!");
      } else {
        const name = event.target.name;
        const value = event.target.value;
        SetInputs((prevValues) => ({ ...prevValues, [name]: value }));
      }
    }
    ////test
  };
  return (
    <div className="SignupForm">
      <p>Already have an account? <Link to="/LoginPage">Login</Link> </p>
      <label htmlFor="PFP">Upload a profile picture:</label>
      <FilePond
        name="PFP"
        allowMultiple={false}
        acceptedFileTypes={["image/jpeg", "image/png"]}
        labelFileTypeNotAllowed="Onlu JPEG images are allowed!"
        onaddfile={(error, fileItem) => {
          if (error) {
            toast.warn("PFP upload error");
          } else {
            SetInputs((prevValues) => ({
              ...prevValues,
              File: fileItem.file,
            }));
          }
        }}
      />

      <TextField
        name="FName"
        label="First Name"
        variant="outlined"
        onChange={ValidateUserName}
        sx={{
          minHeight: "80px",
          height: "auto",
          fontSize: "16px",
          padding: "10px",
          width: "100%",
        }}
      />
      <TextField
        name="LName"
        label="Last Name"
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
        name="Bio"
        label="Bio"
        variant="outlined"
        multiline
        maxRows={6}
        onChange={HandleChange}
        sx={{
          minHeight: "80px",
          height: "auto",
          fontSize: "16px",
          padding: "10px",
          width: "100%",
        }}
      />
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
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
        Create Account
      </Button>
    </div>
  );
}
export default SignUpForm;
