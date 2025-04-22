import "../App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify/unstyled";
import "react-toastify/dist/ReactToastify.css";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import TextField from "@mui/material/TextField";
import { Button, colors, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material";

//global theme
const theme = createTheme({
  typography: {
    fontFamily: '"Freckle Face", system-ui, sans-serif',
  },
  palette: {
    primary: {
      main: "#388e3c",
      light: "#66bb6a",
      dark: "#1b5e20",
      contrastText: "#fff",
    },
    secondary: {
      main: "#388e3c",
      light: "#66bb6a",
      dark: "#1b5e20",
    },
  },
});

registerPlugin(FilePondPluginFileValidateType);
registerPlugin(FilePondPluginImagePreview);

function UploadForm() {
  const [Inputs, SetInput] = useState({});
  const [FErrors, SetErrors] = useState({});
  const [isSubmit, setisSubmit] = useState(false);

  // 🎯 REMOVED: FilmFile & ThumbnailFile state (unneeded!)
  // const [FilmFile, setFilmFile] = useState<any[]>([]);
  // const [ThumbnailFile, setThumbnailFile] = useState<any[]>([]);

  const handleUpload = async (event) => {
    event.preventDefault();
    setisSubmit(true);
    const errors = validate(Inputs);

    if (Object.keys(errors).length === 0) {
      const formData = new FormData();
      formData.append("Title", Inputs.Title);
      formData.append("Description", Inputs.Description);
      formData.append("Genres", JSON.stringify(Inputs.Genres));

      // 🎯 FIX: Use Inputs.File / Inputs.Thumbnail directly
      if (Inputs.File) {
        formData.append("File", Inputs.File);
      } else {
        toast.warn("No film file selected!");
        setisSubmit(false);
        return;
      }

      if (Inputs.Thumbnail) {
        formData.append("Thumbnail", Inputs.Thumbnail);
      } else {
        toast.warn("No thumbnail file selected!");
        setisSubmit(false);
        return;
      }

      try {
        await axios.post("http://localhost:3001/upload-film", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.done("Film uploaded successfully!");
      } catch (error) {
        console.error("Upload failed", error);
        toast("Upload failed!" + error);
        setisSubmit(false);
      }
    }
  };

  useEffect(() => {
    console.log(FErrors);
    if (Object.keys(FErrors).length === 0 && isSubmit) {
    }
  }, [FErrors]);

  const validate = (Inputs) => {
    const errors = {};
    if (!Inputs.Title) {
      errors.Title = "Title is required.";
      toast.warn("Title is required!");
    }
    if (!Inputs.File) {
      errors.File = "Upload film file.";
      toast.warn("Upload a film File!");
    }
    if (!Inputs.Thumbnail) {
      errors.Thumbnail = "Upload thumbnail picture.";
      toast.warn("Upload a thumbnail picture!");
    }
    if (!Inputs.Description) {
      errors.Description = "Description is required.";
      toast.warn("Description is required!");
    }
    if (!Inputs.Genres) {
      errors.Genres = "Select at least 1 Genre";
      toast.warn("Select at least 1 Genre!");
    }
    return errors;
  };

  const handleChange = (event) => {
    const name = event.target.name;
    let value;
    if (event.target.type === "file") {
      value = event.target.files[0];
      // 🎯 REMOVED: no need to set FilmFile/ThumbnailFile
      // if (name === "File") setFilmFile([value]);
      // if (name === "Thumbnail") setThumbnailFile([value]);
    } else {
      value = event.target.value;
    }
    SetInput((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSelect = (event) => {
    const { value } = event.target;
    SetInput((prevValues) => ({ ...prevValues, Genres: value }));
  };

  const options = [
    { id: "Horror", value: "Horror" },
    { id: "Thriller", value: "Thriller" },
    { id: "Action", value: "Action" },
    { id: "Comedy", value: "Comedy" },
    { id: "Romance", value: "Romance" },
    { id: "Sci-Fi", value: "Sci-Fi" },
    { id: "Animation", value: "Animation" },
    { id: "Documentary", value: "Documentary" },
    { id: "Biography", value: "Biography" },
    { id: "Musical", value: "Musical" },
    { id: "Mystery", value: "Mystery" },
    { id: "History", value: "History" },
    { id: "Educational", value: "Educational" },
  ];

  return (
    <div className="film-form">
      <form onSubmit={handleUpload} className="film-for">
        <ThemeProvider theme={theme}>
          <label htmlFor="File">Film:</label>
          <FilePond
            name="File"
            allowMultiple={false}
            acceptedFileTypes={["video/mp4", "video/mkv", "video/avi"]}
            labelFileTypeNotAllowed="Only video files are allowed"
            onaddfile={(error, fileItem) => {
              if (error) {
                toast.warn("Invalid video file type!");
              } else {
                SetInput((prevValues) => ({
                  ...prevValues,
                  File: fileItem.file,
                }));
              }
            }}
          />

          <FilePond
            name="Thumbnail"
            allowMultiple={false}
            acceptedFileTypes={["image/jpeg"]}
            labelFileTypeNotAllowed="Only JPG images are allowed"
            onaddfile={(error, fileItem) => {
              if (error) {
                toast.warn("Invalid file type! Only JPG images are allowed.");
              } else {
                SetInput((prevValues) => ({
                  ...prevValues,
                  Thumbnail: fileItem.file,
                }));
              }
            }}
          />

          <TextField
            className="Form-Field"
            label="Film Title"
            variant="outlined"
            onChange={handleChange}
            name="Title"
            sx={{
              minHeight: "80px",
              height: "auto",
              fontSize: "16px",
              padding: "10px",
              width: "100%",
            }}
          />
          <br />
          <TextField
            className="Form-Field"
            label="Film Description"
            variant="outlined"
            onChange={handleChange}
            name="Description"
            multiline
            maxRows={6}
            sx={{
              minHeight: "80px",
              height: "auto",
              padding: "10px",
              width: "100%",
              color: "white",
              fontFamily: '"Freckle Face", system-ui, sans-serif',
              input: {
                color: "#fff",
                fontFamily: '"Freckle Face", system-ui, sans-serif',
              },
            }}
          />
          <label htmlFor="genres" style={{ margin: "1rem" }}>
            genres
          </label>
          <Select
            name="Genres"
            labelId="genres-label"
            multiple
            value={Inputs.Genres || []}
            onChange={handleSelect}
            label="Select Genres"
            renderValue={(selected) => selected.join(", ")}
            sx={{
              color: "#fff",
              border: "1px solid #4caf50",
              "& .Mui-selected": {
                backgroundColor: "#fff",
                color: "#388e3c",
                border: "1px solid #388e3c",
              },
              "& .Mui-selected:hover": {
                backgroundColor: "#fff",
                border: "1px solid #388e3c",
              },
              "& .MuiMenuItem-root": {
                "&:hover": {
                  backgroundColor: "#388e3c",
                  color: "black",
                },
              },
            }}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.id}
              </MenuItem>
            ))}
          </Select>
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
            Uploud
          </Button>
        </ThemeProvider>
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
}

export default UploadForm;
