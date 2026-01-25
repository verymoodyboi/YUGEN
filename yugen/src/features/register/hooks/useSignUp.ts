
// src/features/signup/hooks/useSignup.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import { checkEmailAvailable } from "../../../util/availability-validation/services";
import { useToast } from "../../../components/toaster";

export function useSignup() {
  const navigate = useNavigate();
const toast= useToast()
  const steps = ["Credentials"];
  const [activeStep, setActiveStep] = useState(0);

  // form fields

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

const [emailValidated, setEmailValidated] = useState(false);
const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);





  const [isRegistering, setIsRegistering] = useState(false);


  // ===== validations =====
  async function validateStep(step = activeStep) {

  if (step === 0) {
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
      toast.warn("Error registering this email, try a different one.");
      return false;
    }
  }

  if (emailAvailable === false) {
    toast.warn("Email already in use");
    return false;
  }

 if (!isValidEmail(email)) {
  toast.warn("Enter a valid email");
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



    return false;
  }

  // handlers
  const isValidEmail = (e: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleNext = async () => {
     const ok = await validateStep(activeStep);
  if (ok) setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

const handleSubmit = async () => {
  const ok =
    (await validateStep(0))
   
  if (!ok) return;
  

  setIsRegistering(true);
  try {
    // 1Register + get signed URL
    const { data } = await api.post("/register", {
  
      Email: email,
      Password: password,
 
    });




    toast.success("Registration successful!");
    navigate("/pending-email-confirmation");
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

// Auto-check email when it changes (debounced)



  return {
    steps,
    activeStep,
    setActiveStep,
    handleNext,
    handleBack,
 
    email,
    password,
    confirmPassword,

    setEmail,
    setPassword,
    setConfirmPassword,
 
    isRegistering,
    handleSubmit,
    checkEmailAvailable,
    handleEmailChange
  };
}
