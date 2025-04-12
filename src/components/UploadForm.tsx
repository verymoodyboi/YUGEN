import "../App.css";
import { useState } from "react";
import axios from "axios";
import Select from "react-dropdown-select";

function UploadForm() {
  const [Inputs, SetInput] = useState({});

  const handleUpload = (event) => {
    event.preventDefault();
    console.log("Form submitted!");
    console.log(Inputs);
  };

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
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
    </div>
  );
}

export default UploadForm;
