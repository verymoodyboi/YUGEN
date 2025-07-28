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
function config() {
  return 0;
}
export default config;
