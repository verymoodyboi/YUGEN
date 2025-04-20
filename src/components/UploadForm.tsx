import "../App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify/unstyled";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-dropdown-select";

function UploadForm() {
  const [Inputs, SetInput] = useState({});
  const [FErrors, SetErrors] = useState({});
  const [isSubmit, setisSubmit] = useState(false);

  const handleUpload = async (event) => {
    event.preventDefault();
    SetErrors(validate(Inputs));
    setisSubmit(true);

    if (Object.keys(validate(Inputs)).length === 0) {
      const formData = new FormData();
      formData.append("Title", Inputs.Title);
      formData.append("Description", Inputs.Description);
      formData.append("Genres", JSON.stringify(Inputs.Genres));
      formData.append("File", Inputs.File);
      formData.append("Thumbnail", Inputs.Thumbnail);
      try {
        await axios.post("http://localhost:3001/upload-film", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast("Film uploaded successfully!");
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
      toast("Title is required!");
    }
    if (!Inputs.File) {
      errors.File = "Upload film file.";
      toast("Upload film File!");
    } else {
      const allowedExtensions = ["mp4"];
      const fileExtension = Inputs.File.name.split(".").pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        errors.FileType = "Invalid film file type. Only mp4 is allowed.";
        toast(
          "Invalid film file type. Only (" + allowedExtensions + ") is allowed!"
        );
      }
    }
    if (!Inputs.Thumbnail) {
      errors.Thumbnail = "Upload thumbnail picture.";
      toast("Upload thumbnail picture!");
    } else {
      const allowedExtensions2 = ["jpg"];
      const fileExtension2 = Inputs.Thumbnail.name
        .split(".")
        .pop()
        .toLowerCase();
      if (!allowedExtensions2.includes(fileExtension2)) {
        errors.ThumbnailType =
          "Invalid Thumbnail file type. Only jpeg allowed.";
        toast(
          "Invalid Thumbnail file type, Only (" +
            allowedExtensions2 +
            ") allowed!"
        );
      }
    }
    if (!Inputs.Description) {
      errors.Description = "Description is required.";
      toast("Description is required!");
    }
    if (!Inputs.Genres) {
      errors.Genres = "Select at least 1 Genre";
      toast("Select at least 1 Genre!");
    }
    return errors;
  };
  const handleChange = (event) => {
    const name = event.target.name;
    let value;
    if (event.target.type === "file") {
      value = event.target.files[0];
    } else {
      value = event.target.value;
    }
    SetInput((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSelect = (selectedOptions) => {
    SetInput((prevValues) => ({ ...prevValues, Genres: selectedOptions }));
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
    <div>
      <form onSubmit={handleUpload}>
        <label htmlFor="File">Film:</label>
        <input name="File" type="file" onChange={handleChange} />
        <br />
        <label htmlFor="Thumbnail">Thumbnail:</label>
        <input name="Thumbnail" type="file" onChange={handleChange} />
        <br />
        <label htmlFor="Title">Title:</label>
        <input name="Title" type="text" onChange={handleChange} />
        <br />
        <label htmlFor="Description">Description:</label>
        <input name="Description" type="text" onChange={handleChange} />
        <br />
        <Select
          labelField="id"
          valueField="value"
          multi
          options={options}
          onChange={handleSelect}
        />
        <button type="submit">Upload</button>
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
