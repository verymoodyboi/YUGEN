// src/features/signup/hooks/useSignup.tsx
import { useState, useRef,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Crop } from "react-image-crop";
import { api } from "../../../lib/api";
import { getCroppedFileFromImage } from "../../../util/image-cropping/services";
import { checkUsernameAvailable,checkEmailAvailable } from "../../../util/availability-validation/services";

export function useSignup() {
  const navigate = useNavigate();

  const steps = ["Name", "Additional Info", "Credentials", "Profile"];
  const [activeStep, setActiveStep] = useState(0);

  // form fields
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [region, setRegion] = useState("");
  const [gender, setGender] = useState("");
  const [bday, setBday] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
const [emailValidated, setEmailValidated] = useState(false);
const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

const [usernameValidated, setUsernameValidated] = useState(false);
const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // file/crop
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [rawPreview, setRawPreview] = useState<string | null>(null);
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);

  const [isRegistering, setIsRegistering] = useState(false);

  const containsNumber = (s: string) => /\d/.test(s);
  const validateAge = (isoDate: string) => {
    if (!isoDate) return false;
    const year = parseInt(isoDate.substring(0, 4));
    const age = new Date().getFullYear() - year;
    return age >= 13;
  };

  // ===== validations =====
  async function validateStep(step = activeStep) {
    if (step === 0) {
      if (!fname || containsNumber(fname)) {
        toast.warn("Enter a valid first name (no numbers).");
        return false;
      }
      if (!lname || containsNumber(lname)) {
        toast.warn("Enter a valid last name (no numbers).");
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (!region || !gender || !bday) {
        toast.warn("All fields required");
        return false;
      }
      if (!validateAge(bday)) {
        toast.warn("You must be at least 13 years old");
        return false;
      }
      return true;
    }
  if (step === 2) {
  if (!email) {
    toast.warn("Email required");
    return false;
  }

  // Recheck if not validated or email changed
  if (!emailValidated || emailAvailable === null) {
    const ok = await checkEmailAvailable(email);
    setEmailAvailable(ok);
    setEmailValidated(true);

    if (!ok) {
      toast.warn("Email already in use");
      return false;
    }
  }

  if (emailAvailable === false) {
    toast.warn("Email already in use");
    return false;
  }

  if (emailAvailable === null) {
    toast.warn("Please validate your email before continuing");
    return false;
  }

  if (!password || password.length < 8) {
    toast.warn("Password must be at least 8 characters");
    return false;
  }

  if (password !== confirmPassword) {
    toast.warn("Passwords must match");
    return false;
  }

  return true;
}

if (step === 3) {
  if (!username) {
    toast.warn("Username required");
    return false;
  }

  if (!usernameValidated) {
    const ok = await checkUsernameAvailable(username);
    setUsernameAvailable(ok);
    setUsernameValidated(true);
    if (!ok) {
      toast.warn("Username already in use");
      return false;
    }
  } else if (usernameAvailable === false) {
    toast.warn("Username already in use");
    return false;
  }

  if (!bio || bio.trim().length < 10) {
    toast.warn("Bio too short");
    return false;
  }
  if (!croppedFile && !rawFile) {
    toast.warn("Profile picture required");
    return false;
  }
  return true;
}
    return false;
  }

  // handlers
  const handleNext = async () => {
    const ok = await validateStep(activeStep);
    if (ok) setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png"].includes(f.type)) {
      toast.warn("Only JPEG/PNG allowed");
      return;
    }
    setRawFile(f);
    setRawPreview(URL.createObjectURL(f));
  };

  const confirmCrop = async (img: HTMLImageElement, crop: Crop) => {
    try {
      const file = await getCroppedFileFromImage(img, crop);
      setCroppedFile(file);
      setRawPreview(null);
      toast.success("Cropped image ready");
    } catch (err) {
      toast.error("Crop failed");
    }
  };


  const handleSubmit = async () => {
    const ok =
      (await validateStep(0)) &&
      (await validateStep(1)) &&
      (await validateStep(2)) &&
      (await validateStep(3));
    if (!ok) return;

    setIsRegistering(true);
    try {
      const formData = new FormData();
      formData.append("FName", fname);
      formData.append("LName", lname);
      formData.append("UserName", username);
      formData.append("Bio", bio);
      formData.append("Email", email);
      formData.append("Password", password);
      formData.append("BirthDate", bday);
      formData.append("Region", region);
      formData.append("Gender", gender);
      if (croppedFile) formData.append("PFP", croppedFile);

      await api.post("/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Registration successful!");
      navigate(`/profile-customization?username=${username}`);
    } catch (err) {
      toast.error("Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };
const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setEmail(e.target.value);
  setEmailValidated(false);
  setEmailAvailable(null);
};
const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setUsername(e.target.value);
  setUsernameValidated(false);
  setUsernameAvailable(null);
};
// Auto-check email when it changes (debounced)



  return {
    steps,
    activeStep,
    setActiveStep,
    handleNext,
    handleBack,
    fname,
    lname,
    region,
    gender,
    bday,
    email,
    password,
    confirmPassword,
    username,
    bio,
    setFname,
    setLname,
    setRegion,
    setGender,
    setBday,
    setEmail,
    setPassword,
    setConfirmPassword,
    setUsername,
    setBio,
    rawPreview,
    croppedFile,
    handleFileChange,
    confirmCrop,
    fileInputRef,
    isRegistering,
    handleSubmit,
    checkEmailAvailable,
    handleEmailChange,handleUsernameChange
  };
}
