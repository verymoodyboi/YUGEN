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
import { json } from "stream/consumers";
registerPlugin(FilePondPluginFileValidateType);
registerPlugin(FilePondPluginImagePreview);
function SignUpForm() {
  const test = (event) => {
    toast.warn("test");
  };
  const [Inputs, SetInputs] = useState({});
  const [fname, setfname] = useState<string | Blob>();
  const [lname, setlname] = useState();
  const [username, setusername] = useState();
  const [bio, setbio] = useState();
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [bday, setbday] = useState("");
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [email, setEmail] = useState();
  const [Password, setPassword] = useState<string>();
  const [CPassword, setCPassword] = useState<string>();
  const [isRegister, setIsRegister] = useState<boolean>(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    let errors: any = {};
    let empty = JSON.stringify(errors);
    errors = await validateAll();
    if (JSON.stringify(errors) == empty) {
      toast("vaild user info");
      setIsRegister(true);
      SendToServer();
    } else {
      toast.warn("invalid user info:" + JSON.stringify(errors));
    }
  };
  const SendToServer = async () => {
    try {
      const formData = new FormData();
      console.log("yah");
      formData.append("FName", fname);
      formData.append("LName", lname);
      formData.append("UserName", username);
      formData.append("Bio", bio);
      formData.append("Email", email);
      formData.append("Password", Password);
      formData.append("BirthDate", bday);
      formData.append("PFP", pfpFile);
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      axios.post("http://localhost:3001/Register", formData);
    } catch (error: any) {
      if (error) {
        toast("" + error);
      } else {
        setIsRegister(true);
      }
    }
  };
  const validateAll = async () => {
    const errors: any = {};
    if (!fname) {
      errors.fname = "First name is required";
      toast.warn("First name is a required field.");
    } else {
      const hasN = await containsN(fname);
      if (hasN) {
        errors.fname = "Name contains a number";
        toast.warn("Please enter a valid first name");
      }
    }
    if (!lname) {
      errors.lname = "Last name is required";
      toast.warn("Last name is a required field.");
    } else {
      const hasN = await containsN(lname);
      if (hasN) {
        errors.fname = "Name contains a number";
        toast.warn("Please enter a valid last name");
      }
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
      errors.pfpFile = "Please upload a profil picture.";
      toast.warn("Please upload a profile picture.");
    }
    if (!email) {
      errors.email = "Please enter your email.";
      toast.warn("please enter you email.");
    } else {
      const validEmail = await validateEmail(email);
      if (!validEmail) {
        errors.email = "Please enter sa valid email";
        toast.warn("Please enter a valid email");
      } else {
        errors.email = await freeEmail();
      }
    }
    if (!Password) {
      errors.password = "Password missing";
      toast.warn("Please enter a passwrod");
    } else {
      if (!CPassword) {
        errors.password = "Password comfirmation missing";
        toast.warn("Please comfirm your passwrod");
      } else {
        const validPass = await validatePassword(Password, CPassword);
        if (!validPass) {
          errors.password = "Password comfirmation issue";
        }
      }
    }
    return errors;
  };
  const containsN = async (name: string) => {
    return /\d/.test(name);
  };
  const validatePassword = async (Pass: string, cPass: string) => {
    if (Pass.length >= 8) {
      if (Pass == cPass) {
        return true;
      } else {
        toast.warn("Please make sure passwords match");
        return false;
      }
    } else {
      toast.warn("Password must contain at least 8 characters");
      return false;
    }
  };
  const validateEmail = async (testEmail: string) => {
    const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if (testEmail.match(isValidEmail)) {
      return true;
    } else {
      return false;
    }
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
  const freeEmail = async () => {
    try {
      const response = await axios.get("http://localhost:3001/email", {
        params: { email },
      });
      return;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.status === 409) {
          toast("Email already in use!");
          return "Email alredy in use";
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
  if (!isRegister) {
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
            placeholder="I love movies"
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
          <TextField
            name="Email"
            label="Email"
            variant="outlined"
            placeholder="exampl@gmail.com"
            onChange={(event) => {
              setEmail(event?.target.value);
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
            name="Password"
            label="Password"
            variant="outlined"
            type="password"
            placeholder="Password must contain at least 8 characters"
            onChange={(event) => {
              setPassword(event?.target.value);
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
            name="CPassword"
            label="Comfirm Password"
            variant="outlined"
            placeholder="Make sure Passwords Match"
            type="password"
            onChange={(event) => {
              setCPassword(event?.target.value);
            }}
            sx={{
              minHeight: "80px",
              height: "auto",
              fontSize: "16px",
              padding: "10px",
              width: "100%",
            }}
          />
          <label htmlFor="BDay" style={{ paddingBottom: "0.5rem" }}>
            Birth Date:
          </label>
          <br />
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
  } else {
    let seconds = 10;
    let foo: ReturnType<typeof setInterval>;

    function redirect(): void {
      window.location.replace("/LoginPage");
    }

    const updateSecs = async () => {
      const secondsElement = document.getElementById("seconds");
      console.log("updateSecs called, seconds:", seconds); // Debug line

      if (secondsElement) {
        secondsElement.innerHTML = seconds.toString();
      }
      seconds--;
      if (seconds < 0) {
        clearInterval(foo);
        redirect();
      }
    };
    function countdownTimer(): void {
      toast("Film uploaded successfully!");
      foo = setInterval(updateSecs, 1000);
    }

    countdownTimer();
    return (
      <div className="film-submit">
        <p className="film-submit-text">
          Accont created, please log in to verify your account. For any
          inquiries please contact us at:
        </p>
        <p className="film-submit-text" id="email-hover">
          {" "}
          Yugen@placeholder.com
        </p>
        <p className="film-submit-text" id="redirect">
          You should automatically be redirected in <span id="seconds">10</span>{" "}
          seconds.
        </p>
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
}
export default SignUpForm;
