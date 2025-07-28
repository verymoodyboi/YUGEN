import "../App.css";
import "../App.tsx";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { TextField } from "@mui/material";
import "react-datepicker/dist/react-datepicker.css";
import {
  Button,
  List,
  ListItem,
  IconButton,
  Typography,
  Tooltip,
  Autocomplete,
  Divider,
  FormControl,
  Select,
  Menu,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import countries from "../Data/countries.json";
import universities from "../Data/universities.json";
import DeleteIcon from "@mui/icons-material/Delete";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { ToastContainer, toast } from "react-toastify/unstyled";
import "react-toastify/dist/ReactToastify.css";
import { Avatar, Box, DialogContent, DialogTitle } from "@mui/material";
import ErrorImg from "../YugenAssits/Icons/ErrorImg.png";
import ReactCrop, { makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import supabase from "../server/config.ts";
import Dialog from "@mui/material/Dialog";
import { useAuth } from "../contexts/AuthContext.tsx";
// handle update links

// supabase client import
interface Probs {
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}
const EditProfile: React.FC<Probs> = ({ onSubmitSuccess, onCancel }) => {
  const { userInfo: user } = useAuth();
  const [fname, setfname] = useState<string>();
  const [lname, setlname] = useState();
  const [username, setusername] = useState();
  const [bio, setbio] = useState();
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [crop, setCrop] = useState<Crop>();
  const [pfpPath, setPFPPath] = useState("");
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [gender, setGender] = useState("");
  const [region, setregion] = useState("");
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current || !user) return;
    setGender(user.gender || "prefer not to say");
    setregion(user.region || "");
    setSID(user.sid || "");
    setUni(user.university || "");
    setfname(user.f_name || "");
    setlname(user.l_name || "");
    setusername(user.username || "");
    setbio(user.bio || "");
    setPfpFile(user.pfp_path || "");
    setCroppedFile(user.pfp_path || "");

    setLinks([]);
    if (user.instagram) addLinkDirectly(user.instagram);
    if (user.youtube) addLinkDirectly(user.youtube);
    if (user.linkedin) addLinkDirectly(user.linkedin);

    hasInitialized.current = true;
  }, [user]);
  //handle crop
  const MinWidth = 150;
  const aspectRatio = 1;
  const onPFPload = (e: any) => {
    const { w, h, naturalWidth, naturalHight } = e.currentTarget;
    if (naturalWidth < MinWidth || naturalHight < MinWidth) {
      toast.warn("image must at least be 150 X 150 pixels!");
      setPFPPath(ErrorImg);
    }
    const crop = makeAspectCrop(
      {
        unit: "px",
        width: MinWidth,
      },
      aspectRatio,
      w,
      h
    );
    setCrop(crop);
  };
  const setCroppedPFP = (img, canvas, crop) => {
    const ctx = canvas.getContext("2d");
    const pxRation = window.devicePixelRatio;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    canvas.width = Math.floor(crop.width * scaleX * pxRation);
    canvas.height = Math.floor(crop.height * scaleY * pxRation);
    ctx.scale(pxRation, pxRation);
    ctx.imageSmoothingQuality = "high";
    ctx.save();
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    ctx.translate(-cropX, -cropY);
    ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], "cropped_pfp.png", {
          type: "image/png",
        });
        setPfpFile(croppedFile);
        setCroppedFile(croppedFile);
      }
    }, "image/png");
    ctx.restore();
  };
  //Crop done
  //handle student info
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
    formData.append("Email", user.email);
    try {
      await axios.post("http://localhost:3001/StudentInfo", {
        Uni: uni,
        SID: SID,
        Email: user.email,
      });
    } catch (err) {
      toast.error("Registration failed");
    }
  };
  //handle update links
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
        Email: user.email,
      });
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
  const addLinkDirectly = (link: string) => {
    const trimmed = link.trim();
    if (trimmed === "") return;

    const platform = getPlatform(trimmed);

    if (!["instagram", "youtube", "linkedin"].includes(platform)) return;

    setLinks((prevLinks) => {
      const filteredLinks = prevLinks.filter(
        (existing) => getPlatform(existing) !== platform
      );
      return [...filteredLinks, trimmed];
    });

    if (platform === "instagram") setInsta(trimmed);
    if (platform === "youtube") setYT(trimmed);
    if (platform === "linkedin") setLinkedin(trimmed);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    let errors: any = {};
    let empty = JSON.stringify(errors);
    errors = await validateAll();
    if (JSON.stringify(errors) == empty) {
      toast("vaild user info");
      await SendToServer();
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    }
  };

  const SendToServer = async () => {
    try {
      handleSubmitSocials();
      handleSubmitStudent();

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        toast.error("User not authenticated");
        return;
      }

      const formData = new FormData();
      console.log("yah");

      formData.append("Region", region);
      formData.append("Gender", gender);
      formData.append("FName", fname);
      formData.append("LName", lname);
      formData.append("UserName", username.toLowerCase());
      formData.append("Bio", bio);

      if (pfpFile) {
        formData.append("PFP", pfpFile);
        console.log("File appended:", pfpFile.name);
      }

      formData.append("auth_id", currentUser.id);

      formData.append("Email", user?.email || "");

      await axios.post("http://localhost:3001/editprofile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
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
    if (!pfpFile) {
      errors.pfpFile = "Please upload a profil picture.";
      toast.warn("Please upload a profile picture.");
    }
    if (!croppedFile) {
      errors.pfpFile = "profile picture not cropped";
      toast.warn("Please set Your profile image");
    }
    return errors;
  };
  const containsN = async (name: string) => {
    return /\d/.test(name);
  };

  const ValidateUserName = async () => {
    try {
      await axios.get("http://localhost:3001/users", {
        params: { username },
      });
      return;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 409) {
          const existingUsernameRaw = err.response?.data;
          const existingUsername =
            typeof existingUsernameRaw === "string"
              ? existingUsernameRaw.trim()
              : JSON.stringify(existingUsernameRaw);

          if (existingUsername != user.username) {
            console.log(
              "Username already taken:",
              existingUsername,
              user.username
            );
            toast("Username already in use!");
            return "username already in use";
          }
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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (imgRef.current && canvasRef.current && crop) {
      setCroppedPFP(imgRef.current, canvasRef.current, crop);
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  useEffect(() => {
    if (imgRef.current && canvasRef.current && crop) {
      setCroppedPFP(imgRef.current, canvasRef.current, crop);
    }
  }, [crop]);
  const fileInputRef = useRef(null);
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.warn("Only JPEG or PNG images are allowed!");
      return;
    }

    const pfpPath = URL.createObjectURL(file);
    setPfpFile(file);
    setPFPPath(pfpPath);
    setPreview(pfpPath);
    showModal();
  };

  const handleRemoveFile = () => {
    setPFPPath("");
    setCrop(null);
    setCroppedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };
  const publicUrl = supabase.storage.from("pfps").getPublicUrl(user.pfp_path)
    .data.publicUrl;

  if (!isRegister) {
    return (
      <Box className="centered-box-v-blurred" sx={{ marginLeft: "10vw" }}>
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
            >
              Change PFP
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg, image/png"
                hidden
                onChange={handleFileChange}
              />
            </Button>
          </Box>
          <br />
          <br />

          <Dialog
            open={isModalOpen}
            onClose={handleCancel}
            maxWidth="xs"
            fullScreen
          >
            <DialogTitle align="center">
              Adjust your profile picture
            </DialogTitle>

            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              {pfpPath && (
                <>
                  <ReactCrop
                    crop={crop}
                    circularCrop
                    keepSelection
                    aspect={1}
                    minWidth={MinWidth}
                    onChange={(pixelCrop) => setCrop(pixelCrop)}
                  >
                    <Box
                      component="img"
                      ref={imgRef}
                      src={pfpPath}
                      alt="PFP"
                      onLoad={onPFPload}
                      sx={{
                        borderRadius: 2,
                        border: 1,
                        borderColor: "divider",
                        maxWidth: "100%",
                      }}
                    />
                  </ReactCrop>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      onClick={handleOk}
                      variant="contained"
                      color="primary"
                    >
                      Save
                    </Button>
                  </Box>
                </>
              )}
            </DialogContent>
          </Dialog>

          {!crop && !pfpPath && (
            <Avatar
              style={{
                objectFit: "contain",
                width: "150px",
                height: "150px",
                justifySelf: "center",
              }}
              src={
                supabase.storage.from("pfps").getPublicUrl(user.pfp_path).data
                  .publicUrl
              }
            ></Avatar>
          )}

          {crop && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mt: 0,
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  borderRadius: "50%",
                  objectFit: "contain",
                  width: "150px",
                  height: "150px",
                }}
              />
              <Box sx={{ mt: 2 }}>
                <Button
                  onClick={showModal}
                  style={{
                    backgroundColor: "transparent",
                    border: "0px",
                  }}
                >
                  Edit
                </Button>
                <Button
                  onClick={handleRemoveFile}
                  color="secondary"
                  variant="outlined"
                  sx={{ ml: 2 }}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          )}
          <TextField
            name="FName"
            helperText="First name"
            placeholder="First Name"
            defaultValue={user?.f_name}
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
            placeholder="Last Name"
            helperText="Last name"
            defaultValue={user?.l_name}
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
            placeholder="User name"
            helperText="User name"
            defaultValue={user?.username}
            variant="outlined"
            onChange={(event) => {
              const lowercase = event?.target.value.toLowerCase();
              setusername(lowercase);
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
            placeholder="Bio"
            helperText="Bio"
            defaultValue={user?.bio}
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
          <Divider
            sx={{
              color: "rgba(0, 0, 0, 0.3)",
              borderColor: "rgba(0, 0, 0, 0.3)",
              fontWeight: "normal",
              fontSize: "1rem",
            }}
          >
            Links
          </Divider>
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
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
            <br />
            <Divider
              sx={{
                color: "rgba(0, 0, 0, 0.3)",
                borderColor: "rgba(0, 0, 0, 0.3)",
                fontWeight: "normal",
                fontSize: "1rem",
              }}
            >
              Student account
            </Divider>
            <Typography
              variant="body1"
              fontFamily='"Freckle Face", system-ui'
              color="font.secondary"
            >
              {" "}
              are you a student? submit your student info
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
                  value={uni}
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
            />
            <Divider
              sx={{
                color: "rgba(0, 0, 0, 0.3)",
                borderColor: "rgba(0, 0, 0, 0.3)",
                fontWeight: "normal",
                fontSize: "1rem",
              }}
            >
              General info{" "}
            </Divider>
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
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
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
              Comfirm
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{
                fontFamily: '"Freckle Face", system-ui, sans-serif',
                color: "#fff",
                margin: "2rem",
              }}
              onClick={() => {
                if (onCancel) {
                  onCancel();
                }
              }}
            >
              Cancel
            </Button>
          </Box>
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
      </Box>
    );
  }
};
export default EditProfile;
