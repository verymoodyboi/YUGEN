import "../App.css";
import React, { useState, useRef } from "react";
import supabase from "../server/config";
import axios from "axios";
import {
  TextField,
  Button,
  Avatar,
  Box,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  Typography,
  List,
  ListItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import DoneOutlineIcon from "@mui/icons-material/DoneOutline";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import BlurText from "../SmallComponents/BlurText.tsx";
import { StepIconProps } from "@mui/material/StepIcon";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import DeleteIcon from "@mui/icons-material/Delete";

import { styled } from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import countries from "../Data/countries.json";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonIcon from "@mui/icons-material/Person";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, Links } from "react-router-dom";
import ReactCrop, { makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ErrorImg from "../YugenAssits/Icons/ErrorImg.png";
import MovieIcon from "@mui/icons-material/Movie";
import CoPresentIcon from "@mui/icons-material/CoPresent";
import VideoLabelIcon from "@mui/icons-material/VideoLabel";
import GradientText from "../SmallComponents/GradiantText";
import { useNavigate } from "react-router-dom";
import ButtonBase from "@mui/material/ButtonBase";
import SchoolIcon from "@mui/icons-material/School";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RateReviewIcon from "@mui/icons-material/RateReview";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import universities from "../Data/universities.json";
import Autocomplete from "@mui/material/Autocomplete";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useAuth } from "../contexts/AuthContext";

const SignUpGoogle: React.FC = () => {
  //crop pfp
  const MinWidth = 150;
  const aspectRatio = 1;
  const { user } = useAuth();
  const [pfpFile, setPfpFile] = useState(null);
  const [croppedFile, setCroppedFile] = useState(null);
  const [crop, setCrop] = useState(null);
  const [pfpPath, setPFPPath] = useState("");
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const onPFPload = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth < MinWidth || naturalHeight < MinWidth) {
      toast.warn("Image must be at least 150x150 pixels");
      setPFPPath(ErrorImg);
      return;
    }
    const crop = makeAspectCrop(
      { unit: "px", width: MinWidth },
      aspectRatio,
      naturalWidth,
      naturalHeight
    );
    setCrop(crop);
  };

  const setCroppedPFP = (img, canvas, crop) => {
    const ctx = canvas.getContext("2d");
    const pxRatio = window.devicePixelRatio;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    canvas.width = Math.floor(crop.width * scaleX * pxRatio);
    canvas.height = Math.floor(crop.height * scaleY * pxRatio);
    ctx.scale(pxRatio, pxRatio);
    ctx.imageSmoothingQuality = "high";
    ctx.save();
    ctx.translate(-crop.x * scaleX, -crop.y * scaleY);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "cropped_pfp.png", { type: "image/png" });
        setPfpFile(file);
        setCroppedFile(file);
      }
    }, "image/png");
    ctx.restore();
  };

  const handleCancel = () => {
    setCroppedPFP(imgRef.current, canvasRef.current, crop);
    setIsModalOpen(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.warn("Only JPEG or PNG images allowed!");
      return;
    }
    const path = URL.createObjectURL(file);
    setPfpFile(file);
    setPFPPath(path);
    setIsModalOpen(true);
  };

  const handleRemoveFile = () => {
    setPFPPath("");
    setCrop(null);
    setCroppedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };
  //user info
  const [fname, setfname] = useState("");
  const [lname, setlname] = useState("");
  const [username, setusername] = useState("");
  const [bio, setbio] = useState("");
  const [region, setregion] = useState("");
  const [gender, setGender] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [bday, setbday] = useState("");
  const [email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [CPassword, setCPassword] = useState("");
  const containsN = (name) => /\d/.test(name);

  const ValidateUserName = async () => {
    try {
      await axios.get("http://localhost:3001/users", { params: { username } });
      return null;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          toast.warn("Username already in use!");
          return "Username already in use";
        }
      }
      toast.warn("Error validating username");
      return "Validation failed";
    }
  };

  const freeEmail = async () => {
    try {
      await axios.get("http://localhost:3001/email", { params: { email } });
      return null;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          toast.warn("Email already in use!");
          return "Email already in use";
        }
      }
      toast.warn("Error validating email");
      return "Validation failed";
    }
  };

  const validateAge = () => {
    const age = new Date().getFullYear() - parseInt(bday.substring(0, 4));
    return age >= 13;
  };
  //steps
  const [activeStep, setActiveStep] = useState(0);
  const [isRegister, setIsRegister] = useState(false);
  const steps = ["Name", "Aditional Info", "Profile"];
  const validateStep = async () => {
    if (activeStep === 2) {
      if (!username) return toast.warn("Username is required"), false;
      const usernameErr = await ValidateUserName();
      if (usernameErr) return false;
      if (!bio) return toast.warn("Bio is required"), false;
      if (!pfpFile || !croppedFile)
        return toast.warn("Profile picture required"), false;
      return true;
    }
    if (activeStep === 1) {
      if (!region) return toast.warn("Region is required"), false;
      if (!gender) return toast.warn("Gender is required"), false;
      if (!bday || !validateAge())
        return toast.warn("You must be at least 13"), false;

      return true;
    }
    if (activeStep === 0) {
      if (!fname || containsN(fname))
        return toast.warn("Enter a valid first name"), false;
      if (!lname || containsN(lname))
        return toast.warn("Enter a valid last name"), false;
      return true;
    }
    return false;
  };

  const handleNext = async () => {
    const valid = await validateStep();
    if (valid) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);
  const ColorlibStepIconRoot = styled("div")<{
    ownerState: { completed?: boolean; active?: boolean };
  }>(({ theme }) => ({
    backgroundColor: "#ccc",
    zIndex: 1,
    color: "#fff",
    width: 50,
    height: 50,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.grey[700],
    }),
    variants: [
      {
        props: ({ ownerState }) => ownerState.active,
        style: {
          backgroundImage:
            "linear-gradient(136deg, #9cd5ac , #ff89b2ff 100%, #ff89b2ff 50%)",
          boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
        },
      },
      {
        props: ({ ownerState }) => ownerState.completed,
        style: {
          backgroundImage:
            "linear-gradient( 136deg, #9cd5ac , #c2a3aeff 100%, #9cd5ac 100%)",
        },
      },
    ],
  }));

  function ColorlibStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;
    const icons: { [index: string]: React.ReactElement<unknown> } = {
      0: <DriveFileRenameOutlineIcon />,
      1: <InfoOutlineIcon />,
      2: <VideoLabelIcon />,
    };

    return (
      <ColorlibStepIconRoot
        ownerState={{ completed, active }}
        className={className}
      >
        {icons[String(props.icon)]}
      </ColorlibStepIconRoot>
    );
  }

  //submit signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      toast.error("User not authenticated");
      return;
    }

    const valid = await validateStep();
    if (!valid) return;

    const formData = new FormData();
    formData.append("FName", fname);
    formData.append("LName", lname);
    formData.append("UserName", username);
    formData.append("Bio", bio);
    formData.append("Email", user.email);
    formData.append("BirthDate", bday);
    formData.append("Region", region);
    formData.append("Gender", gender);
    formData.append("PFP", pfpFile);
    formData.append("auth_id", currentUser.id);

    try {
      await axios.post("http://localhost:3001/RegisterGoogle", formData);
      setIsRegister(true);
    } catch (err) {
      toast.error("Registration failed");
    }
  };
  // Blurtext animation
  const [animeDone, setAnimeDone] = useState<boolean>(false);
  const containerRef = useRef(null);
  const handleAnimationComplete = () => {
    setAnimeDone(true);
  };

  //nav

  const navigate = useNavigate();
  //questionare
  const [isDone, setIsDone] = React.useState(false);
  const [isQuestions, setIsQuestions] = React.useState(false);
  const [isFilmmaker, setIsFilmmaker] = React.useState(false);
  const [isStudent, setIsStudent] = React.useState(false);
  const [uni, setUni] = React.useState("");
  const [SID, setSID] = React.useState("");
  const validateStudentInfo = async () => {
    if (!uni) return toast.warn("Select a university"), false;
    if (!SID) return toast.warn("Enter a valid student ID"), false;
    return true;
  };
  const handleSubmitStudent = async () => {
    const valid = await validateStudentInfo();
    if (!valid) return;

    const formData = new FormData();
    formData.append("Uni", uni);
    formData.append("SID", SID);
    formData.append("Email", email);
    try {
      await axios.post("http://localhost:3001/StudentInfo", {
        Uni: uni,
        SID: SID,
        Email: email,
      });
      setIsDone(true);
    } catch (err) {
      toast.error("Registration failed");
    }
  };
  const [isPro, setIsPro] = React.useState(false);
  const [YT, setYT] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [insta, setInsta] = useState("");
  const [links, setLinks] = React.useState([""]);
  const [linkInput, setLinkInput] = useState("");
  const handleSubmitSocials = async () => {
    try {
      await axios.post("http://localhost:3001/updatesocials", {
        Insta: insta,
        YT: YT,
        LI: linkedin,
        Email: email,
      });
      setIsDone(true);
    } catch (err) {
      toast.error("Registration failed");
    }
  };
  const getPlatform = (url) => {
    if (url.includes("instagram.com")) return "instagram";
    if (url.includes("youtube.com")) return "youtube";
    if (url.includes("linkedin.com")) return "linkedin";
    return "other";
  };

  // Get corresponding icon
  const getSocialIcon = (url) => {
    if (url.includes("instagram.com")) return <InstagramIcon color="primary" />;
    if (url.includes("youtube.com")) return <YouTubeIcon color="error" />;
    if (url.includes("linkedin.com"))
      return <LinkedInIcon sx={{ color: "#0077B5" }} />;
    return null;
  };

  const handleAddLink = () => {
    const trimmed = linkInput.trim();
    if (trimmed === "") return;

    const platform = getPlatform(trimmed);

    if (!["instagram", "youtube", "linkedin"].includes(platform)) {
      toast.error(
        "Platform not supported. Please use Instagram, YouTube, or LinkedIn."
      );
      return;
    }

    // Remove existing link of that platform
    const filteredLinks = links.filter(
      (link) => getPlatform(link) !== platform
    );
    setLinks([...filteredLinks, trimmed]);

    if (platform === "instagram") setInsta(trimmed);
    if (platform === "youtube") setYT(trimmed);
    if (platform === "linkedin") setLinkedin(trimmed);

    setLinkInput("");
  };
  const handleRemoveLink = (indexToRemove) => {
    const toRemove = links[indexToRemove];
    const platform = getPlatform(toRemove);

    // Clear platform-specific state if applicable
    if (platform === "instagram") setInsta("");
    if (platform === "youtube") setYT("");
    if (platform === "linkedin") setLinkedin("");

    setLinks(links.filter((_, index) => index !== indexToRemove));
  };
  const [isNew, setIsNew] = React.useState(false);
  const [isRegular, setIsRegular] = React.useState(false);
  const [isCritic, setIsCritic] = React.useState(false);
  const [isAudiance, setIsAudiance] = React.useState(false);
  const icons1 = [
    {
      icon: <SchoolIcon sx={{ fontSize: 60 }} />,
      title: "Student",
      width: "33%",
      onClick: () => {
        setIsStudent(true);
      },
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 60 }} />,
      title: "Profissional",
      width: "33%",
      onClick: () => {
        setIsPro(true);
      },
    },
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 60 }} />,
      title: "just started",
      width: "33%",
      onClick: () => {
        setIsNew(true);
        setIsDone(true);
      },
    },
  ];
  const icons2 = [
    {
      icon: <MovieIcon sx={{ fontSize: 60 }} />,
      title: "Filmmaking",
      width: "50%",
      onClick: () => {
        setIsFilmmaker(true);
      },
    },
    {
      icon: <CoPresentIcon sx={{ fontSize: 60 }} />,
      title: "Watching Films",
      width: "50%",
      onClick: () => {
        setIsAudiance(true);
      },
    },
  ];
  const icons3 = [
    {
      icon: <FavoriteBorderIcon sx={{ fontSize: 60 }} />,
      title: "Film lover",
      width: "50%",
      onClick: () => {
        setIsRegular(true);
        setIsDone(true);
      },
    },
    {
      icon: <RateReviewIcon sx={{ fontSize: 60 }} />,
      title: "Critic",
      width: "50%",
      onClick: () => {
        setIsCritic(true);
      },
    },
  ];

  const IconButtonStyled = styled(ButtonBase)(({ theme }) => ({
    position: "relative",
    height: 200,
    [theme.breakpoints.down("sm")]: {
      width: "100% !important",
      height: 100,
    },
    "&:hover, &.Mui-focusVisible": {
      zIndex: 1,
      "& .MuiImageBackdrop-root": {
        opacity: 0.15,
      },
      "& .MuiImageMarked-root": {
        opacity: 0,
      },
      "& .MuiTypography-root": {
        border: "4px solid currentColor",
      },
    },
  }));

  const IconContent = styled("span")(({ theme }) => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.common.white,
  }));

  const IconBackdrop = styled("span")(({ theme }) => ({
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create("opacity"),
  }));

  const IconMarked = styled("span")(({ theme }) => ({
    height: 3,
    width: 18,
    backgroundColor: theme.palette.common.white,
    position: "absolute",
    bottom: -2,
    left: "calc(50% - 9px)",
    transition: theme.transitions.create("opacity"),
  }));

  if (isDone) {
    return (
      <Box
        className="centered-box-v-blurred"
        sx={{ display: "flex", flexDirection: "column", gap: 4 }}
      >
        <DoneOutlineIcon sx={{ fontSize: 100 }}></DoneOutlineIcon>
        <Typography variant="h4">
          Welcome to Yūgen! we are thrilled to have you.
        </Typography>
        <Typography variant="h5">
          You are all set up! go back to the <a href="/login">login page</a> to
          log nto your account and start creating and watching movies!{" "}
        </Typography>
      </Box>
    );
  }
  if (isRegister && !isQuestions) {
    return (
      <Box className="centered-box-v-blurred">
        {!animeDone ? (
          <BlurText
            text="Welcome to YUGEN"
            delay={150}
            animateBy="letters"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="text-2xl mb-8"
          />
        ) : (
          <GradientText
            colors={["#bcabb1", "#bcabb1", "#bcabb1", "#9cd5ac", "#bcabb1"]}
            animationSpeed={10}
            showBorder={false}
            className="costom-class"
          >
            Welcome to YUGEN
          </GradientText>
        )}
        <Typography variant="h6" color="white">
          Almost there! just answer a few questions to improve your experiance.
        </Typography>
        <Box className="centered-box-h">
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
              setIsDone(true);
            }}
          >
            Skip
          </Button>
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
              setIsQuestions(true);
            }}
          >
            Lets go!
          </Button>
        </Box>
      </Box>
    );
  }
  if (!isRegister)
    return (
      <Box className="Form">
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={ColorlibStepIcon}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          {activeStep === 0 && (
            <>
              <TextField
                fullWidth
                label="First Name"
                value={fname}
                onChange={(e) => setfname(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Last Name"
                value={lname}
                onChange={(e) => setlname(e.target.value)}
                margin="normal"
              />
            </>
          )}
          {activeStep === 2 && (
            <>
              <TextField
                fullWidth
                label
                value={username}
                onChange={(e) => setusername(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                multiline
                label="Bio"
                value={bio}
                onChange={(e) => setbio(e.target.value)}
                margin="normal"
              />
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
              >
                Upload PFP
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/jpeg, image/png"
                  onChange={handleFileChange}
                />
              </Button>
              {pfpPath && crop && (
                <>
                  <canvas
                    ref={canvasRef}
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: "50%",
                      marginTop: "1rem",
                    }}
                  />
                  <Button onClick={() => setIsModalOpen(true)}>Edit</Button>
                  <Button onClick={handleRemoveFile} color="secondary">
                    Remove
                  </Button>
                </>
              )}
              {!pfpPath && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Avatar sx={{ width: 150, height: 150 }}>
                    <PersonIcon sx={{ fontSize: 130 }} />
                  </Avatar>
                </Box>
              )}
            </>
          )}

          {activeStep === 1 && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel id="region-label">Region</InputLabel>
                <Select
                  labelId="region-label"
                  id="region-select"
                  value={region}
                  label="Region"
                  onChange={(e: SelectChangeEvent) => setregion(e.target.value)}
                >
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.name}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel id="Gender-label">Gender</InputLabel>
                <Select
                  labelId="Gender-label"
                  id="Gender-select"
                  value={gender}
                  label="Gender"
                  onChange={(event) => setGender(event.target.value)}
                >
                  <MenuItem key={"Male"} value={"Male"}>
                    Male
                  </MenuItem>
                  <MenuItem key={"Female"} value={"Female"}>
                    Female
                  </MenuItem>
                  <MenuItem
                    key={"Prefare not to say"}
                    value={"Prefare not to say"}
                  >
                    Prefare not to say
                  </MenuItem>
                </Select>
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Birth Date"
                  value={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    setbday(date?.toISOString().split("T")[0] || "");
                  }}
                />
              </LocalizationProvider>
            </>
          )}

          <Box sx={{ display: "flex", mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button variant="contained" color="primary" type="submit">
                Create Account
              </Button>
            )}
          </Box>
          <Box>
            <p>
              Back to <Link to="/LoginPage">Login</Link>.
            </p>
            <ToastContainer theme="dark" />
          </Box>
        </form>
        <Dialog open={isModalOpen} onClose={handleCancel}>
          {pfpPath && (
            <Box p={2}>
              <ReactCrop
                crop={crop}
                circularCrop
                keepSelection
                aspect={1}
                onChange={(c) => setCrop(c)}
              >
                <img
                  ref={imgRef}
                  src={pfpPath}
                  onLoad={onPFPload}
                  style={{ maxWidth: "100%" }}
                />
              </ReactCrop>
              <Button onClick={handleCancel}>Confirm</Button>
            </Box>
          )}
        </Dialog>

        <ToastContainer theme="dark" />
      </Box>
    );

  if (isQuestions && isFilmmaker && isStudent) {
    return (
      <Box className="centered-box-v-blurred">
        <ToastContainer />
        <Typography variant="h4" fontFamily='"Freckle Face", system-ui'>
          {" "}
          OoOOoOO a student?! okay, smarty pants! Please fill this info.
        </Typography>
        <Autocomplete
          id="university-select"
          sx={{ width: "100%" }}
          options={universities}
          getOptionLabel={(option) => option}
          onChange={(event, value) => {
            setUni(value || "");
          }}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              {option}
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Choose a university"
              inputProps={{
                ...params.inputProps,
                autoComplete: "new-password",
              }}
            />
          )}
        />
        <TextField
          fullWidth
          label="Student ID"
          margin="normal"
          value={SID}
          onChange={(e) => setSID(e.target.value)}
        />{" "}
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
            handleSubmitStudent();
          }}
        >
          Finish
        </Button>
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
            setIsDone(true);
          }}
        >
          Skip
        </Button>
      </Box>
    );
  }
  if (isQuestions && isAudiance && isCritic) {
    return (
      <Box
        className="centered-box-v-blurred"
        sx={{ display: "flex", flexDirection: "column", gap: 4 }}
      >
        <ToastContainer></ToastContainer>
        <Typography variant="h4" fontFamily='"Freckle Face", system-ui'>
          Looks like we got a pro here! We are thrilled to have you!
        </Typography>

        <Typography variant="h6" fontFamily='"Freckle Face", system-ui'>
          Why don’t you share some of your social media accounts on your
          profile!
        </Typography>

        {/* Side-by-side input + list */}
        <Box
          sx={{
            display: "flex",
            gap: 4,
            width: "100%",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* Input & Button */}
          <Box
            sx={{
              flex: 1,
              minWidth: "300px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Add a link to your work"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={handleAddLink}
              sx={{
                fontFamily: '"Freckle Face", system-ui',
                borderColor: "#ff89b2ff",
                color: "#ff89b2ff",
                "&:hover": {
                  color: "#552637ff",
                  borderColor: "#552637ff",
                },
              }}
            >
              Add
            </Button>
          </Box>

          {/* Link List */}
          {links.filter((link) => link.trim() !== "").length > 0 && (
            <List sx={{ flex: 1, minWidth: "300px" }}>
              {links.map((link, index) =>
                link.trim() !== "" ? (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleRemoveLink(index)}
                      >
                        <DeleteIcon sx={{ color: "black" }} />
                      </IconButton>
                    }
                    sx={{ pl: 0 }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      {getSocialIcon(link)}
                      <Typography
                        variant="body2"
                        sx={{ wordBreak: "break-word", pr: 6 }}
                        component="a"
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.length > 20 ? `${link.slice(0, 20)}...` : link}
                      </Typography>
                    </Box>
                  </ListItem>
                ) : null
              )}
            </List>
          )}
        </Box>

        <Button
          variant="contained"
          sx={{
            fontFamily: '"Freckle Face", system-ui',
            borderColor: "#9cd5ac",
            color: "white",
            backgroundColor: "#9cd5ac",
            "&:hover": {
              borderColor: "#3e5e47ff",
              backgroundColor: "#3e5e47ff",
            },
          }}
          onClick={() => {
            handleSubmitSocials();
          }}
        >
          Finish
        </Button>
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
            setIsDone(true);
          }}
        >
          Skip
        </Button>
        <Typography variant="body1">Supported platforms</Typography>
        <Box display="flex" gap={2}>
          <Tooltip title="YouTube">
            <YouTubeIcon />
          </Tooltip>
          <Tooltip title="Instagram">
            <InstagramIcon />
          </Tooltip>
          <Tooltip title="LinkedIn">
            <LinkedInIcon />
          </Tooltip>
        </Box>
      </Box>
    );
  }
  if (isQuestions && isFilmmaker && isPro) {
    return (
      <Box
        className="centered-box-v-blurred"
        sx={{ display: "flex", flexDirection: "column", gap: 4 }}
      >
        <ToastContainer></ToastContainer>
        <Typography variant="h4" fontFamily='"Freckle Face", system-ui'>
          Looks like we got a pro here! We are thrilled to have you!
        </Typography>

        <Typography variant="h6" fontFamily='"Freckle Face", system-ui'>
          Why don’t you share some of your social media accounts on your
          profile!
        </Typography>

        {/* Side-by-side input + list */}
        <Box
          sx={{
            display: "flex",
            gap: 4,
            width: "100%",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* Input & Button */}
          <Box
            sx={{
              flex: 1,
              minWidth: "300px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Add a link to your work"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={handleAddLink}
              sx={{
                fontFamily: '"Freckle Face", system-ui',
                borderColor: "#ff89b2ff",
                color: "#ff89b2ff",
                "&:hover": {
                  color: "#552637ff",
                  borderColor: "#552637ff",
                },
              }}
            >
              Add
            </Button>
          </Box>

          {/* Link List */}
          {links.filter((link) => link.trim() !== "").length > 0 && (
            <List sx={{ flex: 1, minWidth: "300px" }}>
              {links.map((link, index) =>
                link.trim() !== "" ? (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleRemoveLink(index)}
                      >
                        <DeleteIcon sx={{ color: "black" }} />
                      </IconButton>
                    }
                    sx={{ pl: 0 }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      {getSocialIcon(link)}
                      <Typography
                        variant="body2"
                        sx={{ wordBreak: "break-word", pr: 6 }}
                        component="a"
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.length > 20 ? `${link.slice(0, 20)}...` : link}
                      </Typography>
                    </Box>
                  </ListItem>
                ) : null
              )}
            </List>
          )}
        </Box>

        <Button
          variant="contained"
          sx={{
            fontFamily: '"Freckle Face", system-ui',
            borderColor: "#9cd5ac",
            color: "white",
            backgroundColor: "#9cd5ac",
            "&:hover": {
              borderColor: "#3e5e47ff",
              backgroundColor: "#3e5e47ff",
            },
          }}
          onClick={() => {
            handleSubmitSocials();
          }}
        >
          Finish
        </Button>
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
            setIsDone(true);
          }}
        >
          Skip
        </Button>
        <Typography variant="body1">Supported platforms</Typography>
        <Box display="flex" gap={2}>
          <Tooltip title="YouTube">
            <YouTubeIcon />
          </Tooltip>
          <Tooltip title="Instagram">
            <InstagramIcon />
          </Tooltip>
          <Tooltip title="LinkedIn">
            <LinkedInIcon />
          </Tooltip>
        </Box>
      </Box>
    );
  }
  if (isQuestions && !isAudiance && !isFilmmaker) {
    return (
      <Box className="Form">
        <Typography variant="h4" fontFamily='"Freckle Face", system-ui'>
          What are you here for mostly?
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            minWidth: 300,
            width: "100%",
          }}
        >
          {icons2.map((item) => (
            <IconButtonStyled
              focusRipple
              key={item.title}
              style={{ width: item.width }}
              onClick={item.onClick}
            >
              <IconBackdrop className="MuiImageBackdrop-root" />
              <IconContent>
                {item.icon}
                <Typography
                  component="span"
                  variant="subtitle1"
                  color="inherit"
                  sx={(theme) => ({
                    position: "relative",
                    mt: 1,
                    px: 2, // Horizontal padding
                    py: 1, // Vertical padding
                    borderRadius: 1, // Optional: adds slight rounding for visual clarity
                  })}
                >
                  {item.title}
                  <IconMarked className="MuiImageMarked-root" />
                </Typography>
              </IconContent>
            </IconButtonStyled>
          ))}
        </Box>
      </Box>
    );
  }
  if (isQuestions && isFilmmaker) {
    return (
      <Box className="Form">
        <Typography variant="h4" fontFamily='"Freckle Face", system-ui'>
          What type of filmmaker are you?
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            minWidth: 300,
            width: "100%",
          }}
        >
          {icons1.map((item) => (
            <IconButtonStyled
              focusRipple
              key={item.title}
              onClick={item.onClick}
              style={{ width: item.width }}
            >
              <IconBackdrop className="MuiImageBackdrop-root" />
              <IconContent>
                {item.icon}
                <Typography
                  component="span"
                  variant="subtitle1"
                  color="inherit"
                  sx={(theme) => ({
                    position: "relative",
                    mt: 1,
                    px: 2, // Horizontal padding
                    py: 1, // Vertical padding
                    borderRadius: 1, // Optional: adds slight rounding for visual clarity
                  })}
                >
                  {item.title}
                  <IconMarked className="MuiImageMarked-root" />
                </Typography>
              </IconContent>
            </IconButtonStyled>
          ))}
        </Box>
      </Box>
    );
  }

  if (isQuestions && isAudiance) {
    return (
      <Box className="Form">
        <Typography variant="h4" fontFamily='"Freckle Face", system-ui'>
          What type of audiance are you?
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            minWidth: 300,
            width: "100%",
          }}
        >
          {icons3.map((item) => (
            <IconButtonStyled
              focusRipple
              key={item.title}
              style={{ width: item.width }}
              onClick={item.onClick}
            >
              <IconBackdrop className="MuiImageBackdrop-root" />
              <IconContent>
                {item.icon}
                <Typography
                  component="span"
                  variant="subtitle1"
                  color="inherit"
                  sx={(theme) => ({
                    position: "relative",
                    mt: 1,
                    px: 2, // Horizontal padding
                    py: 1, // Vertical padding
                    borderRadius: 1, // Optional: adds slight rounding for visual clarity
                  })}
                >
                  {item.title}
                  <IconMarked className="MuiImageMarked-root" />
                </Typography>
              </IconContent>
            </IconButtonStyled>
          ))}
        </Box>
      </Box>
    );
  }
};

export default SignUpGoogle;
