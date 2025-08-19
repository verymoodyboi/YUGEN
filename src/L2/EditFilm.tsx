import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  ThemeProvider,
  createTheme,
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import DeleteIcon from "@mui/icons-material/Delete";
import ReactPlayer from "react-player";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import countries from "../Data/countries.json";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import ErrorImg from "../YugenAssits/Icons/ErrorImg.png";
import ReactCrop, { makeAspectCrop } from "react-image-crop";
import supabase from "../server/config";
registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

const theme = createTheme({
  typography: {
    fontFamily: '"Freckle Face", system-ui, sans-serif',
  },
  palette: {
    primary: {
      main: "#8fbe91ff",
      contrastText: "#fff",
    },
  },
});

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

interface FilmInfo {
  id: string;
  title: string;
  thesis: string;
  genres: string[];
  country: string;
  crew: { role: string; name: string }[];
  cast: { character: string; actor: string }[];
  poster_path?: string;
  // add other fields if necessary
}

interface EditFilmProps {
  filmInfo: FilmInfo;
  onDone?: () => void;
}

const EditFilm: React.FC<EditFilmProps> = ({ filmInfo, onDone }) => {
  // delete film
  const [openDelete, setOpenDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await axios.post("http://localhost:3001/deletefilm", {
        film_uuid: filmInfo.film_uuid,
      });

      toast.success("Film Deleted successfully!");
    } catch (error: any) {
      toast.error("Failed to Delete film: " + (error.message || error));
    } finally {
      setIsSaving(false);
    }
    setOpenDelete(false);
  };
  //mentions
  const [crewPFP, setCrewPFP] = useState<any>("");
  const [actorPFP, setActorPFP] = useState<any>("");

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
          .select("username, pfp_path")
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
  const [croppedFile, setCroppedFile] = useState(filmInfo.poster_path);
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

  /////
  const [title, setTitle] = useState(filmInfo.film_title || "");
  const [thesis, setThesis] = useState(filmInfo.thesis || "");
  const [genres, setGenres] = useState<string[]>(
    Array.isArray(filmInfo.film_genre)
      ? filmInfo.film_genre
      : typeof filmInfo.film_genre === "string"
        ? filmInfo.film_genre.split(",").map((g) => g.trim())
        : []
  );
  const [country, setCountry] = useState(filmInfo.country || "");
  const [crewList, setCrewList] = useState(() => {
    try {
      if (Array.isArray(filmInfo.crew)) return filmInfo.crew;
      if (typeof filmInfo.crew === "string") return JSON.parse(filmInfo.crew);
      return [];
    } catch (e) {
      console.error("Failed to parse crew:", e);
      return [];
    }
  });
  useEffect(() => {
    console.log("Incoming cast:", filmInfo.cast);
  }, [filmInfo]);
  const [cast, setCast] = useState(() => {
    try {
      if (Array.isArray(filmInfo.cast)) return filmInfo.cast;
      if (typeof filmInfo.cast === "string") return JSON.parse(filmInfo.cast);
      return [];
    } catch (e) {
      console.error("Failed to parse cast:", e);
      return [];
    }
  });

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [crewName, setCrewName] = useState("");
  const [crewRole, setCrewRole] = useState("");
  const [actor, setActor] = useState("");
  const [character, setCharacter] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCrew = () => {
    if (!crewRole || !crewName) {
      toast.warn("Please select a role and enter a name.");
      return;
    }
    if (crewList?.some((m) => m.role === crewRole)) {
      toast.warn("Role already added.");
      return;
    }
    setCrewList((prev) => [
      ...prev,
      { role: crewRole, name: crewName, pfp: crewPFP },
    ]);
    setCrewName("");
    setCrewRole("");
  };

  const handleAddCast = () => {
    if (!character || !actor) {
      toast.warn("Please enter a character and an actor.");
      return;
    }
    setCast((prev) => [...prev, { character, actor, pfp: actorPFP }]);
    setCharacter("");
    setActor("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onDone) {
      onDone();
    }
    if (!title || !thesis || genres.length === 0) {
      toast.warn("Please fill title, thesis, and select genres.");
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("id", filmInfo.id);
      formData.append("Title", title);
      formData.append("Thesis", thesis);
      formData.append("Film_id", filmInfo.film_uuid);
      formData.append("Genres", genres.join(", "));
      formData.append("Country", country);
      formData.append("Crew", JSON.stringify(crewList));
      formData.append("Cast", JSON.stringify(cast));
      if (croppedFile) formData.append("Poster", croppedFile);
      await axios.post("http://localhost:3001/editfilm", formData);

      toast.success("Film updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update film: " + (error.message || error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          overflowY: "auto",
          backdropFilter: "blur(2px)",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          p: 2,
        }}
      >
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Box
                sx={{
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                {/* LEFT SIDE: All fields except Title, Thesis, ReactPlayer */}
                <Box sx={{ flex: 1, minWidth: 400 }}>
                  {/* Genres */}
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Genres</InputLabel>
                    <Select
                      multiple
                      value={genres}
                      onChange={(e) =>
                        setGenres(
                          typeof e.target.value === "string"
                            ? e.target.value.split(",")
                            : e.target.value
                        )
                      }
                      renderValue={(selected) =>
                        Array.isArray(selected)
                          ? selected.join(", ")
                          : String(selected)
                      }
                    >
                      {genreOptions.map((genre) => (
                        <MenuItem key={genre} value={genre}>
                          {genre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Country */}
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Country</InputLabel>
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

                  {/* Poster Image */}
                  <Divider sx={{ my: 2 }}>Poster Image (optional)</Divider>
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
                        src={
                          supabase.storage
                            .from("posters")
                            .getPublicUrl(filmInfo.poster_path).data.publicUrl
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

                  {/* Crew */}
                  <Divider
                    sx={{
                      color: "rgba(0, 0, 0, 0.3)",
                      borderColor: "rgba(0, 0, 0, 0.3)",
                      fontWeight: "normal",
                      fontSize: "1rem",
                      my: 2,
                    }}
                  >
                    Crew info (optional)
                  </Divider>

                  <Box sx={{ flex: 1, minWidth: "300px" }}>
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
                            toast.warn(
                              "Please select a role and enter a name."
                            );
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
                        }}
                      >
                        Add
                      </Button>
                    </Box>
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
                    </Box>{" "}
                  </Box>

                  {/* Cast info */}
                  <Divider sx={{ my: 2 }}>Cast</Divider>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <TextField
                      label="Character"
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
                    <Button variant="contained" onClick={handleAddCast}>
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

                {/* RIGHT SIDE: ReactPlayer + Film Title + Thesis */}
                <Box
                  sx={{ width: 400, display: "flex", flexDirection: "column" }}
                >
                  <ReactPlayer
                    url={
                      supabase.storage
                        .from("films")
                        .getPublicUrl(filmInfo.film_path).data.publicUrl
                    }
                    controls
                    width="100%"
                    height="225px"
                  />
                  <TextField
                    label="Film Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    margin="normal"
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    label="Film Thesis"
                    value={thesis}
                    onChange={(e) => setThesis(e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                  />
                </Box>
              </Box>
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    fontFamily: '"Freckle Face", system-ui',
                    borderColor: "#9cd5ac",
                    color: "white",
                    backgroundColor: "#9cd5ac",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "#3e5e47ff",
                      backgroundColor: "#3e5e47ff",
                    },
                  }}
                >
                  Save
                </Button>

                <Button
                  variant="contained"
                  sx={{
                    fontFamily: '"Freckle Face", system-ui',
                    borderColor: "#ff89b2ff",
                    color: "#ffffffff",
                    backgroundColor: "#ff89b2ff",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#ffffffff",
                      borderColor: "#552637ff",
                      backgroundColor: "#552637ff",
                    },
                  }}
                  onClick={() => {
                    if (onDone) {
                      onDone();
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    fontFamily: '"Freckle Face", system-ui',
                    borderColor: "#d02c2cff",
                    color: "#ffffffff",
                    backgroundColor: "#d02c2cff",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#ffffffff",
                      borderColor: "#3f1313ff",
                      backgroundColor: "#3f1313ff",
                    },
                  }}
                  onClick={() => {
                    setOpenDelete(true);
                  }}
                  startIcon={<DeleteIcon />}
                >
                  Delete film
                </Button>
                <Dialog
                  sx={{
                    "& .MuiDialog-container": {
                      backgroundColor: "transparent",
                      display: "flex", // Enable flexbox
                      justifyContent: "center", // Horizontal centering
                      alignItems: "center", // Vertical centering
                    },
                    "& .MuiPaper-root": {
                      backgroundColor: "transparent",
                      boxShadow:
                        "0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.10)",
                      display: "flex", // Needed to center contents inside Paper
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  }}
                  BackdropProps={{
                    sx: {
                      backgroundColor: "transparent !important",
                      opacity: 1,
                    },
                  }}
                  fullScreen
                  open={openDelete}
                >
                  <Box className="centered-box-v-blurred">
                    <PriorityHighIcon
                      sx={{ fontSize: 200, color: "#d02c2cff" }}
                    />
                    <Typography
                      variant="h4"
                      sx={{ fontFamily: '"Freckle Face", system-ui' }}
                    >
                      Warning!
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontFamily: '"Freckle Face", system-ui' }}
                    >
                      By comfirming the film will be perminantly deleted! This
                      action is irreversable.
                    </Typography>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="contained"
                        sx={{
                          fontFamily: '"Freckle Face", system-ui',
                          borderColor: "#ff89b2ff",
                          color: "#ffffffff",
                          backgroundColor: "#ff89b2ff",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            color: "#ffffffff",
                            borderColor: "#552637ff",
                            backgroundColor: "#552637ff",
                          },
                        }}
                        onClick={() => {
                          setOpenDelete(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          fontFamily: '"Freckle Face", system-ui',
                          borderColor: "#d02c2cff",
                          color: "#ffffffff",
                          backgroundColor: "#d02c2cff",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            color: "#ffffffff",
                            borderColor: "#3f1313ff",
                            backgroundColor: "#3f1313ff",
                          },
                        }}
                        onClick={() => {
                          handleDelete();
                          if (onDone) {
                            onDone();
                          }
                        }}
                        startIcon={<DeleteIcon />}
                      >
                        Delete film
                      </Button>
                    </Box>
                  </Box>
                </Dialog>
              </Box>
            </form>
          </CardContent>
        </Card>
        <ToastContainer theme="dark" />
      </Box>
    </ThemeProvider>
  );
};

export default EditFilm;
