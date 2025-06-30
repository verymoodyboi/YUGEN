import "../App.css";
import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Autocomplete,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import supabase from "../server/config";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
interface probs {
  film_id: number;
  onSubmitSuccess?: () => void;
}
const ReportForm: React.FC<probs> = ({ film_id, onSubmitSuccess }) => {
  //auth
  const [userInfo, setUserInfo] = useState<any>(null);
  const [email, setEmail] = useState<any>("");
  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("users")
        .select("username, pfp_path,user_id")
        .eq("email", user.email)
        .single();
      setEmail(user.email);
      if (!error) {
        setUserInfo(data);
        console.log("User data loaded:", data);
      } else {
        console.error("Error loading user profile:", error);
      }
    } else {
      setUserInfo(null); // Clear info if no user
    }
  };

  useEffect(() => {
    loadProfile(); // Initial load

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change:", event);
        loadProfile(); // Refresh profile on login/logout
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  //auth//
  const [isSubmit, setIsSubmit] = useState(false);
  const [reportType, setReportType] = useState<string>("");
  const [report, setReport] = useState<string>("");

  const validate = async () => {
    const errors = {};

    if (!report) {
      errors.report = "report is required.";
      toast.warn("Please enter a report message!");
    }
    return errors;
  };

  const SendToServer = async () => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("report", report);
      formData.append("reportType", reportType);

      formData.append("film_id", film_id.toString());

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
  const types = [
    { label: "Intellectual preperty violation" },
    { label: "Spreading false information" },
    { label: "Spam, scam, or fraud" },
    { label: "Innapropriate content" },
    { label: "Intellectual Preperty Violation" },
  ];
  if (!isSubmit) {
    return (
      <div className="ReportForm">
        <form onSubmit={handleSubmit}>
          <label id="ReportLabel">Report this film</label>

          <Autocomplete
            id="select-type"
            sx={{
              minHeight: "80px",
              height: "auto",
              fontSize: "16px",
              padding: "10px",
              width: "100%",
              color: "whitesmoke",
            }}
            options={types}
            autoHighlight
            getOptionLabel={(option) => option.label}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props;
              return (
                <Box key={key} component="li" {...optionProps}>
                  {option.label}
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Why are you reporting this film?"
                slotProps={{
                  htmlInput: {
                    ...params.inputProps,
                    autoComplete: "new-password", // disable autocomplete and autofill
                  },
                }}
              />
            )}
            onChange={async (event, value) => {
              if (value) {
                setReportType(value.label);
              }
            }}
          />
          <TextField
            name="report"
            label="Deteails"
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
              color: "whitesmoke",
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
        <ToastContainer
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
    return (
      <div className="ReportForm">
        <CheckCircleOutlineIcon sx={{ fontSize: 100, color: "#3c1c24" }} />
        <Divider />
        <Typography variant="h4" fontFamily={'"Freckle Face", system-ui'}>
          Report submitted successfully!
        </Typography>
        <Typography
          variant="h6"
          fontFamily={'"Freckle Face", system-ui'}
          textAlign="center"
        >
          Thanks for your feedback, your report will be reviewed by our team.
        </Typography>
      </div>
    );
  }
};
export default ReportForm;
