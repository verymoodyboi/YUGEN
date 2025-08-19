import "../App.css";
import { useState, useEffect, useRef } from "react";
import supabase from "../server/config";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Box,
  ThemeProvider,
  createTheme,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  Avatar,
  Typography,
  CircularProgress,
  Autocomplete,
  Popper,
} from "@mui/material";
import DoneOutlineIcon from "@mui/icons-material/DoneOutline";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import countries from "../Data/countries.json";
import { useAuth } from "../contexts/AuthContext";
import ReactCrop, { makeAspectCrop } from "react-image-crop";
import ErrorImg from "../YugenAssits/Icons/ErrorImg.png";
registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

const theme = createTheme({
  typography: {
    fontFamily: '"Freckle Face", system-ui, sans-serif',
  },
  palette: {
    primary: {
      main: "#388e3c",
      contrastText: "#fff",
    },
  },
});

const steps = ["Upload", "Details", "Additional details"];

const UploadForm: React.FC = () => {
  const [isDone, setIsDone] = useState(false);
  const { userInfo: user } = useAuth();
  const [filmFile, setFilmFile] = useState<any>();
  const [posterFile, setPosterFile] = useState<any>();
  const [title, setTitle] = useState<any>();
  const [thesis, setThesis] = useState<any>();
  const [country, setCountry] = useState<any>();
  const [genres, setGenres] = useState<any>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [crewName, setCrewName] = useState<any>("");
  const [crewPFP, setCrewPFP] = useState<any>("");
  const [crewRole, setCrewRole] = useState<any>("");
  const [crewList, setCrewList] = useState<any[]>([]);
  const [actor, setActor] = useState<any>("");
  const [actorPFP, setActorPFP] = useState<any>("");
  const [character, setCharacter] = useState<any>("");
  const [cast, setCast] = useState<any[]>([]);
  const [isSubmit, setisSubmit] = useState(false);

  //mentions

  const [users, setUsers] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchUsers = async () => {
        if (!searchInput.trim()) {
          setSearchResults([]);
          return;
        }

        setLoadingUsers(true);

        const { data, error } = await supabase
          .from("users")
          .select("username, pfp_path") // ❌ no auth_id
          .ilike("username", `${searchInput}%`)
          .limit(10);

        if (error) {
          console.error("User fetch error:", error);
          setSearchResults([]);
        } else {
          const formatted = data.map((user) => ({
            username: user.username,
            pfp: user.pfp_path,
          }));
          setSearchResults(formatted);
        }

        setLoadingUsers(false);
      };

      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  //crop poster
  const MinWidth = 200;
  const MinHeight = 300;
  const aspectRatio = 2 / 3;
  const [croppedFile, setCroppedFile] = useState();
  const [crop, setCrop] = useState(null);
  const [posterPath, setPosterPath] = useState("");
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onPFPload = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth < MinWidth || naturalHeight < MinHeight) {
      toast.warn("Image must be at least 150x150 pixels");
      setPosterPath(ErrorImg);
      return;
    }
    const crop = makeAspectCrop(
      { unit: "px", width: MinWidth, height: MinHeight },
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
        setPosterFile(file);
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
    setPosterFile(file);
    setPosterPath(path);
    setIsModalOpen(true);
  };

  const handleRemoveFile = () => {
    setPosterPath("");
    setCrop(null);
    setCroppedFile(null);
    setIsModalOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (imgRef.current && canvasRef.current && crop) {
      setCroppedPFP(imgRef.current, canvasRef.current, crop);
    }
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (imgRef.current && canvasRef.current && crop) {
      setCroppedPFP(imgRef.current, canvasRef.current, crop);
    }
  }, [crop]);

  const handleNext = async () => {
    const valid = validateStep();
    if (valid) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setisSubmit(true);
    const formData = new FormData();

    formData.append("Uploader", user.auth_id);
    formData.append("Title", title);
    formData.append("Thesis", thesis);
    formData.append("Genres", (genres || []).join(", "));
    formData.append("Country", country);
    formData.append("Crew", JSON.stringify(crewList));
    formData.append("Cast", JSON.stringify(cast));

    if (filmFile) formData.append("Film", filmFile);
    if (croppedFile) formData.append("Poster", croppedFile);

    try {
      await axios.post("http://localhost:3001/upload-film", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsDone(true);
      toast("Upload complete!");
    } catch (error) {
      toast.error("Upload failed!" + error);
    }
  };

  const validateStep = () => {
    const step = activeStep;
    if (step === 0 && (!filmFile || !croppedFile)) {
      toast.warn("Please upload both film and poster.");
      return false;
    }
    if (step === 1 && (!title || !thesis || !genres)) {
      toast.warn("Please fill title, description and genres.");
      return false;
    }
    return true;
  };
  const crewRoles = ["Director", "DP", "Editor", "Producer", "Writer"];
  const genreOptions = [
    "Horror",
    "Thriller",
    "Action",
    "Comedy",
    "Romance",
    "Sci-Fi",
    "Animation",
    "Documentary",
    "Biography",
    "Musical",
    "Mystery",
    "History",
    "Educational",
  ];
  if (isDone) {
    return (
      <Box
        className="centered-box-v-blurred"
        sx={{ display: "flex", flexDirection: "column", gap: 4 }}
      >
        <DoneOutlineIcon sx={{ fontSize: 100 }}></DoneOutlineIcon>
        <Typography variant="h4">Thanks for your upload!</Typography>
        <Typography variant="h5">
          Go back to <a href="/">home page</a> to continue exploring? or go to
          your<a href="Profile">profile</a> to watch your film!
        </Typography>
      </Box>
    );
  }
  if (isSubmit) {
    return (
      <Box
        className="centered-box-v-blurred"
        sx={{ display: "flex", flexDirection: "column", gap: 4 }}
      >
        <CircularProgress sx={{ fontSize: 100 }}></CircularProgress>
        <Typography variant="h4">Your film is being uploaded...</Typography>
        <Typography variant="h5">
          Please do not leave this page, this might take a few minutes.
        </Typography>
      </Box>
    );
  }
  return (
    <Box className="centered-box-v-blurred">
      <ThemeProvider theme={theme}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box className="film-form">
          {" "}
          {activeStep === 0 && (
            <>
              <label>Upload a film:</label>
              <div style={{ width: "100%", maxWidth: "100%" }}>
                <FilePond
                  name="File"
                  allowMultiple={false}
                  acceptedFileTypes={["video/mp4"]}
                  files={filmFile ? [filmFile] : []}
                  onupdatefiles={(fileItems) => {
                    setFilmFile(fileItems[0]?.file || null); // ✅ store actual File
                  }}
                  className="filepond-custom"
                />
              </div>

              <label>Upload a thumbnail:</label>
              {/* Poster Image */}

              <Box
                sx={{
                  maxWidth: "100%",
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
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
                    CHoose poster
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
                  <DialogTitle align="center">Adjust your poster</DialogTitle>

                  <DialogContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    {posterPath && (
                      <>
                        <ReactCrop
                          crop={crop}
                          keepSelection
                          aspect={2 / 3}
                          minWidth={MinWidth}
                          minHeight={MinHeight}
                          onChange={(pixelCrop) => setCrop(pixelCrop)}
                        >
                          <Box
                            component="img"
                            ref={imgRef}
                            src={posterPath}
                            alt="poster"
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

                {!crop && !posterPath && (
                  <Avatar
                    variant="square"
                    style={{
                      objectFit: "contain",
                      width: "200px",
                      height: "300px",
                      justifySelf: "center",
                      borderRadius: "3%",
                    }}
                    src={""}
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
                        borderRadius: "3%",
                        objectFit: "contain",
                        width: "200px",
                        height: "300px",
                      }}
                    />
                    <Box sx={{ mt: 2 }}>
                      <Button
                        onClick={() => {
                          setIsModalOpen(true);
                        }}
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
              </Box>
            </>
          )}
          {activeStep === 1 && (
            <>
              <TextField
                label="Film title"
                name="Title"
                fullWidth
                margin="normal"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
              <TextField
                label="Film thesis"
                name="Description"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                value={thesis}
                onChange={(e) => {
                  setThesis(e.target.value);
                }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Genres</InputLabel>
                <Select
                  multiple
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  renderValue={(selected: any) => selected.join(", ")}
                >
                  {genreOptions.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
          {activeStep === 2 && (
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>Country (optional)</InputLabel>
                <Select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {countries.map((c) => (
                    <MenuItem key={c.code} value={c.name}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              '
              <Divider
                sx={{
                  color: "rgba(0, 0, 0, 0.3)",
                  borderColor: "rgba(0, 0, 0, 0.3)",
                  fontWeight: "normal",
                  fontSize: "1rem",
                }}
              >
                Crew info (optional)
              </Divider>
              <Box sx={{ flex: 1, minWidth: "300px" }}>
                {/* Role + Name Input */}
                <Box display="flex" gap={2} mb={2} alignItems="center">
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={crewRole}
                      onChange={(e) => setCrewRole(e.target.value)}
                    >
                      {crewRoles
                        .filter(
                          (role) => !crewList.some((m) => m.role === role)
                        )
                        .map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <Autocomplete
                    fullWidth
                    options={searchResults}
                    getOptionLabel={(option) => option.username}
                    filterOptions={(x) => x}
                    loading={loadingUsers}
                    onInputChange={(e, value) => setSearchInput(value)}
                    onChange={(event, selectedUser) => {
                      if (selectedUser) {
                        setCrewName(selectedUser.username);
                        setCrewPFP(selectedUser.pfp);
                      } else {
                        setCrewName("");
                        setCrewPFP("");
                      }
                    }}
                    renderOption={(props, option) => (
                      <Box
                        component="li"
                        {...props}
                        display="flex"
                        alignItems="center"
                      >
                        <Avatar
                          src={
                            supabase.storage
                              .from("pfps")
                              .getPublicUrl(option.pfp).data.publicUrl
                          }
                          alt={option.username}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        @{option.username}
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select User"
                        placeholder="Start typing a username..."
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingUsers ? (
                                <CircularProgress size={16} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    value={
                      crewName
                        ? searchResults.find(
                            (u) => u.username === crewName
                          ) || {
                            username: crewName,
                            pfp: crewPFP,
                          }
                        : null
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.username === value.username
                    }
                  />

                  <Button
                    variant="contained"
                    onClick={() => {
                      if (!crewName || !crewRole) {
                        toast.warn("Please select a role and enter a name.");
                        return;
                      }
                      if (crewList.some((m) => m.role === crewRole)) {
                        toast.warn("Role already added.");
                        return;
                      }
                      setCrewList((prev) => [
                        ...prev,
                        { role: crewRole, name: crewName, pfp: crewPFP },
                      ]);
                      setCrewName("");
                      setCrewRole("");
                      setCrewPFP("");
                    }}
                  >
                    Add
                  </Button>
                </Box>

                {/* Crew List Display with Remove */}
                <Box>
                  {crewList.map((member, idx) => (
                    <Box
                      key={idx}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        background: "#f5f5f5",
                        p: 1,
                        mb: 1,
                        borderRadius: "8px",
                      }}
                    >
                      <strong>{member.role}</strong>:
                      <Box
                        key={idx}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        sx={{
                          background: "#f5f5f5",
                          p: 1,
                          mb: 1,
                          borderRadius: "8px",
                        }}
                      >
                        <Avatar
                          src={
                            supabase.storage
                              .from("pfps")
                              .getPublicUrl(member.pfp).data.publicUrl
                          }
                          alt={member.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />{" "}
                        <span>{member.name}</span>
                      </Box>
                      <Button
                        size="small"
                        color="error"
                        onClick={() =>
                          setCrewList((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Divider
                sx={{
                  color: "rgba(0, 0, 0, 0.3)",
                  borderColor: "rgba(0, 0, 0, 0.3)",
                  fontWeight: "normal",
                  fontSize: "1rem",
                }}
              >
                Cast info (optional)
              </Divider>
              {/*cast */}
              <Box sx={{ flex: 1, minWidth: "300px" }}>
                <Box display="flex" gap={2} mb={2} alignItems="center">
                  <TextField
                    label="Charecter"
                    value={character}
                    onChange={(e) => setCharacter(e.target.value)}
                    fullWidth
                  />
                  <Autocomplete
                    fullWidth
                    options={searchResults}
                    getOptionLabel={(option) => option.username}
                    filterOptions={(x) => x}
                    loading={loadingUsers}
                    onInputChange={(e, value) => setSearchInput(value)}
                    onChange={(event, selectedUser) => {
                      if (selectedUser) {
                        setActor(selectedUser.username);
                        setActorPFP(selectedUser.pfp);
                      } else {
                        setActor("");
                        setActorPFP("");
                      }
                    }}
                    renderOption={(props, option) => (
                      <Box
                        component="li"
                        {...props}
                        display="flex"
                        alignItems="center"
                      >
                        <Avatar
                          src={
                            supabase.storage
                              .from("pfps")
                              .getPublicUrl(option.pfp).data.publicUrl
                          }
                          alt={option.username}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        @{option.username}
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select User"
                        placeholder="Start typing a username..."
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingUsers ? (
                                <CircularProgress size={16} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    value={
                      crewName
                        ? searchResults.find((u) => u.username === actor) || {
                            username: actor,
                            pfp: actorPFP,
                          }
                        : null
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.username === value.username
                    }
                  />
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (!character || !actor) {
                        toast.warn(
                          "Please select a character and enter an actor."
                        );
                        return;
                      }

                      setCast((prev) => [
                        ...prev,
                        { character: character, actor: actor, pfp: actorPFP },
                      ]);
                      setCharacter("");
                      setActor("");
                    }}
                  >
                    Add
                  </Button>
                </Box>

                <Box>
                  {cast.map((member, idx) => (
                    <Box
                      key={idx}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        background: "#f5f5f5",
                        p: 1,
                        mb: 1,
                        borderRadius: "8px",
                      }}
                    >
                      <strong>{member.character}</strong>:{" "}
                      <Box
                        key={idx}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        sx={{
                          background: "#f5f5f5",
                          p: 1,
                          mb: 1,
                          borderRadius: "8px",
                        }}
                      >
                        <Avatar
                          src={
                            supabase.storage
                              .from("pfps")
                              .getPublicUrl(member.pfp).data.publicUrl
                          }
                          alt={member.actor}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />{" "}
                        <span>{member.actor}</span>
                      </Box>
                      <Button
                        size="small"
                        color="error"
                        onClick={() =>
                          setCast((prev) => prev.filter((_, i) => i !== idx))
                        }
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
          <Box sx={{ display: "flex", mt: 2 }}>
            <Button
              type="button"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box sx={{ flex: 1 }} />
            {activeStep < steps.length - 1 ? (
              <Button type="button" onClick={handleNext} variant="contained">
                Next
              </Button>
            ) : (
              <Button
                onClick={() => {
                  handleSubmit();
                }}
                variant="contained"
                color="primary"
              >
                Upload
              </Button>
            )}
          </Box>
        </Box>
      </ThemeProvider>
      <ToastContainer theme="dark" />
    </Box>
  );
};

export default UploadForm;
