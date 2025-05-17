import "../App.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { TextField } from "@mui/material";
//import DatePicker as date from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@mui/material";
import { FilePond, registerPlugin } from "react-filepond";
import { FilePondFile } from 'filepond';
//import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { ToastContainer, toast } from "react-toastify/unstyled";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { Modal } from "antd";
import { UserOutlined, ExpandOutlined } from "@ant-design/icons";
import { Button as AntButton, Avatar, Space } from "antd";
import ErrorImg from "../YugenAssits/Icons/ErrorImg.png";
import ReactCrop, { makeAspectCrop, Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import type { DatePickerProps } from "antd";
import { DatePicker } from "antd";
import type { Dayjs } from 'dayjs';
registerPlugin(FilePondPluginFileValidateType);
//registerPlugin(FilePondPluginImagePreview);
function SignUpForm() {
  const [fname, setfname] = useState<string>("");
  const [lname, setlname] = useState<string>("");
  const [username, setusername] = useState<string>("");
  const [bio, setbio] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [bday, setbday] = useState<string>("");
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [CPassword, setCPassword] = useState<string>("");
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [crop, setCrop] = useState<Crop>();
  const [pfpPath, setPFPPath] = useState<string>("");
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  //croppingPFP
  const MinWidth = 150;
  const aspectRatio = 1;
  const onPFPload = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const { naturalWidth, naturalHeight } = img;
    if (naturalWidth < MinWidth || naturalHeight < MinWidth) {
      toast.warn("image must at least be 150 X 150 pixels!");
      setPFPPath(ErrorImg);
    }
    const crop = makeAspectCrop(
      {
        unit: "px",
        width: MinWidth,
      },
      aspectRatio,
      img.width,
      img.height
    );
    setCrop(crop);
  };
  const setCroppedPFP = (img: HTMLImageElement, canvas: HTMLCanvasElement, crop: Crop) => {
    if (!img || !canvas || !crop) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let errors: any = {};
    let empty = JSON.stringify(errors);
    errors = await validateAll();
    if (JSON.stringify(errors) == empty) {
      toast("valid user info");
      setIsRegister(true);
      SendToServer();
    } else {
      toast.warn("invalid user info:" + JSON.stringify(errors));
    }
  };
    const SendToServer = async () => {
    try {
      const formData = new FormData();
      
      if (!fname || !lname || !username || !bio || !email || !Password || !bday || !pfpFile) {
        throw new Error("Missing required fields");
      }

      formData.append("FName", fname);
      formData.append("LName", lname);
      formData.append("UserName", username.toLowerCase());
      formData.append("Bio", bio);
      formData.append("Email", email.toLowerCase());
      formData.append("Password", Password);
      formData.append("BirthDate", bday);
      formData.append("PFP", pfpFile);

      await axios.post("http://localhost:3303/Register", formData);
    } catch (error: any) {
      toast(error.message || "Registration failed");
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
    if (!bday) {
      errors.bday = "Birth date is required";
      toast.warn("Birth date is a required field.");
    } else {
      //errors.bday=validateAge()
      errors.bday = await validateAge();
    }
    if (!pfpFile) {
      errors.pfpFile = "Please upload a profil picture.";
      toast.warn("Please upload a profile picture.");
    }
    if (!croppedFile) {
      errors.pfpFile = "profile picture not cropped";
      toast.warn("Please set Your profile image");
    }
    if (!email) {
      errors.email = "Please enter your email.";
      toast.warn("please enter you email.");
    } else {
      const validEmail = await validateEmail(email);
      if (!validEmail) {
        errors.email = "Please enter sa valid email";
        toast.warn("Please enter a valid email");
      } else {
        errors.email = await freeEmail();
      }
    }
    if (!Password) {
      errors.password = "Password missing";
      toast.warn("Please enter a passwrod");
    } else {
      if (!CPassword) {
        errors.password = "Password comfirmation missing";
        toast.warn("Please comfirm your passwrod");
      } else {
        const validPass = await validatePassword(Password, CPassword);
        if (!validPass) {
          errors.password = "Password comfirmation issue";
        }
      }
    }
    return errors;
  };
  const containsN = async (name: string) => {
    return /\d/.test(name);
  };
  const validatePassword = async (Pass: string, cPass: string) => {
    if (Pass.length >= 8) {
      if (Pass == cPass) {
        return true;
      } else {
        toast.warn("Please make sure passwords match");
        return false;
      }
    } else {
      toast.warn("Password must contain at least 8 characters");
      return false;
    }
  };
  const validateEmail = async (testEmail: string) => {
    const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if (testEmail.match(isValidEmail)) {
      return true;
    } else {
      return false;
    }
  };
  const ValidateUserName = async () => {
    const usernameTest = username.toLowerCase();
    try {
      const response = await axios.get("http://localhost:3303/users", {
        params: { username },
      });
      return;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.status === 409) {
          toast("Username already in use!");
          return "username alredy in use";
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
  const freeEmail = async () => {
    const emailTest = email.toLowerCase();
    try {
      const response = await axios.get("http://localhost:3303/email", {
        params: { email },
      });
      return;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.status === 409) {
          toast("Email already in use!");
          return "Email alredy in use";
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
  const validateAge = async () => {
    let year = bday.substring(0, 4);
    let month = bday.substring(5, 7);
    let day = bday.substring(8);
    let ageInDays = 0;
    ageInDays += Number(year) * 365;
    ageInDays += Number(month) * 30;
    ageInDays += Number(day);
    let currDate = new Date().toISOString().split("T")[0];
    let currYear = currDate.substring(0, 4);
    let currMonth = currDate.substring(5, 7);
    let currDay = currDate.substring(8);
    let currDateInDays = 0;
    currDateInDays += Number(currYear) * 365;
    currDateInDays += Number(currMonth) * 30;
    currDateInDays += Number(currDay);
    ageInDays = currDateInDays - ageInDays;
    if (ageInDays >= 4745) {
      return;
    } else {
      toast.warn("Sorry, you must be 13 years old at least to register!");
      return "Too young";
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    if (imgRef.current && canvasRef.current && crop) {
      setCroppedPFP(imgRef.current, canvasRef.current, crop);
      setCroppedFile(null);
    }
  };

  const handleCancel = () => {
    if (croppedFile) {
      setIsModalOpen(false);
    } else {
      toast.warn("Please comfirm your profile picture!");
    }
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setStartDate(date.toDate());
      setbday(date.format('YYYY-MM-DD'));
    }
  };

  const onaddfile = (error: any, fileItem: FilePondFile) => {
    if (error) {
      toast.warn("Error uploading pfp!");
      return;
    }
    
    const file = fileItem.file as File;
    const pfpPath = URL.createObjectURL(file);
    setPfpFile(file);
    setPFPPath(pfpPath);
    setPreview(pfpPath);
    showModal();
  };

  const onremovefile = () => {
    setPFPPath("");
    setCrop(undefined);
    setCroppedFile(null);
  };

  if (!isRegister) {
    return (
      <div className="Form">
        <form onSubmit={handleSubmit}>
          <p>
            Already have an account? <Link to="/LoginPage">Login</Link>{" "}
          </p>
          <label htmlFor="PFP">Upload a profile picture:</label>
          <FilePond
            className={"PFP_Peview"}
            name="PFP"
            allowMultiple={false}
            acceptedFileTypes={["image/jpeg", "image/png"]}
            labelFileTypeNotAllowed="Only JPEG images are allowed!"
            allowImagePreview={false}
            onremovefile={onremovefile}
            onaddfile={onaddfile}
          />
          <Modal
            title="Adjust your profile picture"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            {pfpPath && (
              <ReactCrop
                crop={crop}
                circularCrop
                keepSelection
                aspect={1}
                minWidth={MinWidth}
                onChange={(pixelCrop, percentCrop) => {
                  setCrop(pixelCrop);
                }}
              >
                <img
                  ref={imgRef}
                  src={pfpPath}
                  alt="PFP"
                  onLoad={onPFPload}
                  style={{
                    borderRadius: "10%",
                    borderColor: "black",
                    borderWidth: "10px",
                  }}
                />
              </ReactCrop>
            )}
          </Modal>

          {!crop && !pfpPath && (
            <Avatar size={128} icon={<UserOutlined />}></Avatar>
          )}
          {!crop && pfpPath && (
            <>
              <Avatar
                style={{
                  borderRadius: "50%",
                  width: "150px",
                  height: "150px",
                }}
                src={pfpPath}
              ></Avatar>
              <br />
              <AntButton
                onClick={showModal}
                style={{ backgroundColor: "transparent", border: "0px" }}
                icon={<ExpandOutlined />}
              ></AntButton>
            </>
          )}
          {crop && (
            <>
              <canvas
                ref={canvasRef}
                style={{
                  borderRadius: "50%",
                  objectFit: "contain",
                  width: "150px",
                  height: "150px",
                }}
              />
              <br />
              <AntButton
                onClick={showModal}
                style={{
                  backgroundColor: "transparent",
                  border: "0px",
                }}
                icon={<ExpandOutlined />}
              ></AntButton>
            </>
          )}
          <TextField
            name="FName"
            label="First Name"
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
            label="Last Name"
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
            label="User Name"
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
            label="Bio"
            placeholder="I love movies"
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
          <TextField
            name="Email"
            label="Email"
            variant="outlined"
            placeholder="exampl@gmail.com"
            onChange={(event) => {
              const lowercase2 = event?.target.value.toLowerCase();
              setEmail(lowercase2);
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
            name="Password"
            label="Password"
            variant="outlined"
            type="password"
            placeholder="Password must contain at least 8 characters"
            onChange={(event) => {
              setPassword(event?.target.value);
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
            name="CPassword"
            label="Comfirm Password"
            variant="outlined"
            placeholder="Make sure Passwords Match"
            type="password"
            onChange={(event) => {
              setCPassword(event?.target.value);
            }}
            sx={{
              minHeight: "80px",
              height: "auto",
              fontSize: "16px",
              padding: "10px",
              width: "100%",
            }}
          />
          <label htmlFor="BDay" style={{ paddingBottom: "0.5rem" }}>
            Birth Date:
          </label>
          <br />

          <DatePicker
            name="BDay"
            onChange={handleDateChange}
          />
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
            Create Account
          </Button>
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
      </div>
    );
  } else {
    let seconds = 10;
    let foo: ReturnType<typeof setInterval>;

    function redirect(): void {
      window.location.replace("#/LoginPage");
    }

    const updateSecs = async () => {
      const secondsElement = document.getElementById("seconds");
      console.log("updateSecs called, seconds:", seconds); // Debug line

      if (secondsElement) {
        secondsElement.innerHTML = seconds.toString();
      }
      seconds--;
      if (seconds < 0) {
        clearInterval(foo);
        redirect();
      }
    };
    function countdownTimer(): void {
      toast("Film uploaded successfully!");
      foo = setInterval(updateSecs, 1000);
    }

    countdownTimer();
    return (
      <div className="film-submit">
        <p className="film-submit-text">
          Accont created, please log in to verify your account. For any
          inquiries please contact us at:
        </p>
        <p className="film-submit-text" id="email-hover">
          {" "}
          Yugen@placeholder.com
        </p>
        <p className="film-submit-text" id="redirect">
          You should automatically be redirected in <span id="seconds">10</span>{" "}
          seconds.
        </p>
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
      </div>
    );
  }
}
export default SignUpForm;
