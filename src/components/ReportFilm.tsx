import "../App.css";
import { useState, useEffect } from "react";
import { TextField, Button, Select, MenuItem } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function ReportFilmForm() {
  const [isSubmit, setIsSubmit] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [report, setReport] = useState<string>("");

  const validate = async () => {
    const errors = {};
    if (!email) {
      errors.Email = "Email is required.";
      toast.warn("Email is required!");
    } else {
      const validEmail = await validateEmail(email);
      if (!validEmail) {
        errors.Email = "Please enter a valid email";
        toast.warn("Please enter a valid email");
      }
    }
    if (!report) {
      errors.report = "report is required.";
      toast.warn("Please enter a report message!");
    }
    return errors;
  };

  const validateEmail = async (testEmail: string) => {
    const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if (testEmail.match(isValidEmail)) {
      return true;
    } else {
      return false;
    }
  };

  const SendToServer = async () => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("report", report);
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      axios.post("http://localhost:3001/Report", formData);
    } catch (error: any) {
      if (error) {
        toast("" + error);
        return error;
      } else {
        toast("succes");
        setIsSubmit(true);
        return "";
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = await validate();

    if (Object.keys(errors).length === 0) {
      setIsSubmit(true);
      await SendToServer();
    }
  };

  if (!isSubmit) {
    return (
      <div className="ReportForm">
        <form onSubmit={handleSubmit}>
          <label id="ReportLabel">Report Film</label>
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
            name="report"
            label="Report Message"
            variant="outlined"
            placeholder="Please describe the issue in detail"
            multiline
            onChange={(event) => {
              setReport(event?.target.value);
            }}
            sx={{
              minHeight: "80px",
              height: "auto",
              fontSize: "16px",
              padding: "10px",
              width: "100%",
            }}
          />

          <Button
            id="ReportButton"
            variant="contained"
            color="primary"
            type="submit"
            sx={{
              fontFamily: '"Freckle Face", system-ui, sans-serif',
              color: "#fff",
              margin: "2rem",
            }}
          >
            Submit Report
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
    // Countdown timer for redirecting to another URL after several seconds
    let seconds = 10;
    let foo: ReturnType<typeof setInterval>;

    function redirect(): void {
      window.location.replace("/");
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
          We appreciate you feedback! Your report will be reviewed and you will
          recieve a follow up email. In the mean time, enjoy your movies!
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
export default ReportFilmForm;
