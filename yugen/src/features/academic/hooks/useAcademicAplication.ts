import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import {
  fetchAcademicApplication,
  submitAcademicApplication,
  deleteAcademicApplication,
} from "../services";
export const loadUniversitiesData = async () => {
  const response = await fetch("/data/world_universities_and_domains.json");
  if (!response.ok) throw new Error("Failed to load universities data");
  return response.json();
};

export const useAcademic = () => {
  const { getAccessToken, userInfo } = useAuth();
  const [academicEmail, setAcademicEmail] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [uniID, setUniID] = useState("");
  const [role, setRole] = useState<"student" | "teacher" | "">("");
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [step, setStep] = useState<"button" | "form">("button");
 const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadUniversitiesData();
        setUniversities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {

    const loadApplication = async () => {
      try {
        const token = await getAccessToken();
        const data = await fetchAcademicApplication(token, userInfo?.username);
        setExistingApplication(data);
      } catch (err) {
        console.error("Failed to fetch academic application:", err);
      }
    };
    loadApplication();
  }, [getAccessToken, userInfo?.username]);

  const handleAcademicSubmit = () => {
    const domain = academicEmail.split("@")[1]?.toLowerCase();
    const uni = universities.find((u) =>
      u.domains.some((d) => d.toLowerCase() === domain)
    );

    if (uni) {
      setUniversityName(uni.name);
      toast.success(`Detected university: ${uni.name}`);
    } else {
      setUniversityName("");
      toast.error("Sorry, this academic domain is not supported.");
    }
  };

  const handleAcademicSubmitFinal = async () => {
    if (!academicEmail || !role || !universityName || !uniID)
      return toast.warn("Complete all fields before submitting");

    const formData = new FormData();
    formData.append("email", academicEmail);
    formData.append("role", role);
    formData.append("username", userInfo.username);
    formData.append("university", universityName);
    formData.append("uniID", uniID);
    if (verificationFile) formData.append("verificationFile", verificationFile);

    try {
      const token = await getAccessToken();
      const data = await submitAcademicApplication(token, formData);
      toast.success("Academic application submitted!");
      setExistingApplication(data);
      setStep("button");
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Failed to submit academic application");
    }
  };

  const handleRemoveApplication = async () => {
    if (!window.confirm("Remove your application?")) return;
    try {
      const token = await getAccessToken();
      await deleteAcademicApplication(token, userInfo?.username);
      setExistingApplication(null);
      toast.success("Application removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove application");
    }
  };

  return {
    academicEmail,
    universityName,
    uniID,
    role,
    verificationFile,
    existingApplication,
    step,
    setAcademicEmail,
    setUniversityName,
    setUniID,
    setRole,
    setVerificationFile,
    setStep,
    handleAcademicSubmit,
    handleAcademicSubmitFinal,
    handleRemoveApplication,
  };
};
