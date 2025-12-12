import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Crop } from "react-image-crop";
import { api } from "../../../lib/api";
import { getCroppedFileFromImage } from "../../../util/image-cropping/services";
import { checkUsernameAvailable } from "../../../util/availability-validation/services";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../components/toaster";

export function useSignupGoogle(googleUser: { email: string; name: string }) {
    const {user}= useAuth()
  const navigate = useNavigate();
const toast=useToast()
  const steps = ["Name", "Additional Info", "Profile"];
  const [activeStep, setActiveStep] = useState(0);

  // Google-provided fields
  const [fname, setFname] = useState(googleUser.name.split(" ")[0] || "");
  const [lname, setLname] = useState(googleUser.name.split(" ")[1] || "");

  // Form fields
  const [region, setRegion] = useState("");
  const [gender, setGender] = useState("");
  const [bday, setBday] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  // Crop/file
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [rawPreview, setRawPreview] = useState<string | null>(null);
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);

  const [isRegistering, setIsRegistering] = useState(false);

  // Validators
  const containsNumber = (s: string) => /\d/.test(s);
  const validateAge = (isoDate: string) => {
    if (!isoDate) return false;
    const year = parseInt(isoDate.substring(0, 4));
    const age = new Date().getFullYear() - year;
    return age >= 13;
  };

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
      if (!username) {
        toast.warn("Username required");
        return false;
      }
      const ok = await checkUsernameAvailable(username);
      if (!ok) {
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
      (await validateStep(2));
    if (!ok) return;

    setIsRegistering(true);
    try {
      const formData = new FormData();
      formData.append("FName", fname);
      formData.append("LName", lname);
      formData.append("UserName", username);
      formData.append("Bio", bio);
      formData.append("Email", user.email);
      formData.append("BirthDate", bday);
      formData.append("Region", region);
      formData.append("Gender", gender);
      formData.append("auth_id",user.id)
      if (croppedFile) formData.append("PFP", croppedFile);

      await api.post("/register/google", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Google registration successful!");
      navigate(`/profile-customization?username=${username}`);
    } catch (err) {
      toast.error("Google registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

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
    username,
    bio,
    setFname,
    setLname,
    setRegion,
    setGender,
    setBday,
    setUsername,
    setBio,
    rawPreview,
    croppedFile,
    handleFileChange,
      setRawPreview, 

    confirmCrop,
    fileInputRef,
    isRegistering,
    handleSubmit,
   
  };
}
