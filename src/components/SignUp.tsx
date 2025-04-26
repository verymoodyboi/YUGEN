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
import { data, Link } from "react-router-dom";
import { validateHeaderName } from "http";
import { ChangeEvent } from "react";
registerPlugin(FilePondPluginFileValidateType);
registerPlugin(FilePondPluginImagePreview);
function SignUpForm() {
  const test = (event) => {
    toast.warn("test");
  };
  const [Inputs, SetInputs] = useState({});
  const [fname, setfname] = useState();
  const [lname, setlname] = useState();
  const [username, setusername] = useState();
  const [bio, setbio] = useState();
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [bday, setbday] = useState("");
  const [pfpFile, setPfpFile] = useState<File | null>(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    let errors: any = {};
    let empty = JSON.stringify(errors);
    errors = await validateAll();
    if (JSON.stringify(errors) == empty) {
      toast("vaild user info");
    } else {
      toast.warn("invalid user info:" + JSON.stringify(errors));
    }
  };
  const validateAll = async () => {
    const errors: any = {};
    if (!fname) {
      errors.fname = "First name is required";
      toast.warn("First name is a required field.");
    }
    if (!lname) {
      errors.lname = "Last name is required";
      toast.warn("Last name is a required field.");
    }
    if (!username) {
      errors.username = "Username is required";
      toast.warn("Username is a required field.");
    } else {
      errors.username = await ValidateUserName();
    }
    if (!bio) {
      errors.bio = "Bio is required";
      toast.warn("Bio is a required field.");
    }
    if (!bday) {
      errors.bday = "Birth date is required";
      toast.warn("Birth date is a required field.");
    } else {
      //errors.bday=validateAge()
      errors.bday = await validateAge();
    }
    if (!pfpFile) {
      errors.pfpFile = "PFP date is required";
      toast.warn("Please upload a profile picture.");
    }
    return errors;
  };
  const ValidateUserName = async () => {
    try {
      const response = await axios.get("http://localhost:3001/users", {
        params: { username },
      });
      return;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.status === 409) {
          toast("Username already in use!");
          return "username alredy in use";
        } else {
          toast("Server error: " + err.message);
          return "server error";
        }
      } else {
        toast("Unexpected error occurred.");
        return "unexpected error";
      }
    }
  };

  const validateAge = async () => {
    let year = bday.substring(0, 4);
    let month = bday.substring(5, 7);
    let day = bday.substring(8);
    let ageInDays = 0;
    ageInDays += Number(year) * 365;
    ageInDays += Number(month) * 30;
    ageInDays += Number(day);
    let currDate = new Date().toISOString().split("T")[0];
    let currYear = currDate.substring(0, 4);
    let currMonth = currDate.substring(5, 7);
    let currDay = currDate.substring(8);
    let currDateInDays = 0;
    currDateInDays += Number(currYear) * 365;
    currDateInDays += Number(currMonth) * 30;
    currDateInDays += Number(currDay);
    ageInDays = currDateInDays - ageInDays;
    if (ageInDays >= 4745) {
      return;
    } else {
      toast.warn("Sorry, you must be 13 years old at least to register!");
      return "Too young";
    }
  };
  return (
    <div className="Form">
      <form onSubmit={handleSubmit}>
        <p>
          Already have an account? <Link to="/LoginPage">Login</Link>{" "}
        </p>
        <label htmlFor="PFP">Upload a profile picture:</label>
        <FilePond
          className={"PFP_Peview"}
          name="PFP"
          allowMultiple={false}
          acceptedFileTypes={["image/jpeg", "image/png"]}
          labelFileTypeNotAllowed="Onlu JPEG images are allowed!"
          onaddfile={(error, fileItem) => {
            if (error) {
              toast.warn("Error uploading pfp!");
              return;
            } else {
              setPfpFile(fileItem.file);
            }
          }}
        />

        <TextField
          name="FName"
          label="First Name"
          variant="outlined"
          onChange={(event) => {
            setfname(event?.target.value);
          }}
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
          onChange={(event) => {
            setlname(event?.target.value);
          }}
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
          label="User Name"
          variant="outlined"
          onChange={(event) => {
            setusername(event?.target.value);
          }}
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
          onChange={(event) => {
            setbio(event?.target.value);
          }}
          sx={{
            minHeight: "80px",
            height: "auto",
            fontSize: "16px",
            padding: "10px",
            width: "100%",
          }}
        />
        <DatePicker
          name="BDay"
          selected={startDate}
          onChange={(date) => {
            setStartDate(date);
            const datesplit = date.toISOString().split("T")[0];
            setbday(datesplit);
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
          Create Account
        </Button>
      </form>
      <ToastContainer /*this styles the "toast alerts (alerts that show up on the side when there is an error)*/
        position="top-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
export default SignUpForm;
