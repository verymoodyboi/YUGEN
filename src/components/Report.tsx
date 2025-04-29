import "../App.css";
import { useState, useEffect } from "react";
import { TextField, Button, Select, MenuItem } from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ReportForm() {
  const [inputs, setInputs] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, files } = event.target;
    setInputs((prevValues) => ({
      ...prevValues,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSelect = (event) => {
    const { value } = event.target;
    setInputs((prevValues) => ({
      ...prevValues,
      Type: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const validate = (values) => {
    const errors = {};
    if (!values.Email) {
      errors.Email = "Email is required.";
      toast.warn("Email is required!");
    }
    if (!values.Type || values.Type.length === 0) {
      errors.Type = "Select a problem.";
      toast.warn("Select a problem!");
    }
    return errors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errors = validate(inputs);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      const formData = new FormData();
      formData.append("Email", inputs.Email);
      formData.append("Type", JSON.stringify(inputs.Type || []));
      formData.append("OpMssg", inputs.OpMssg || "");
      setIsSubmit(true);
      toast.success("Form submitted successfully!");
    } else {
      setIsSubmit(false);
    }
  };

  const options = [
    { id: "Legal Issue", value: "Legal Issue" },
    { id: "Other", value: "Other" },
  ];

  return (
    <form className="ReportForm" onSubmit={handleSubmit}>
      <label id="ReportLabel">Report Film</label>
      <TextField
        name="Email"
        label="Email"
        variant="outlined"
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="OpMssg"
        label="Details (Optional)"
        variant="outlined"
        onChange={handleChange}
        fullWidth
        margin="normal"
        multiline
        rows={4}
      />

      <div id="TypeContainer">
        <label id="TypeLabel">Report Type:</label>
        <Select
          name="Type"
          value={inputs.Type || []}
          onChange={handleSelect}
          renderValue={(selected) => selected.join(", ")}
          fullWidth
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.id}
            </MenuItem>
          ))}
        </Select>
      </div>

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
  );
}
export default ReportForm;
