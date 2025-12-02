// src/features/upload/hooks/useUpload.ts
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import { uploadFilm } from "../services";
import { searchMentions } from "../../search/services";
import { useNavigate } from "react-router-dom";
export const useUpload = () => {
  const { getAccessToken } = useAuth();
const {userInfo}=useAuth()
  // core film upload states
  const [filmFile, setFilmFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [thesis, setThesis] = useState("");
  const [country, setCountry] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [crewList, setCrewList] = useState<any[]>([]);
  const [cast, setCast] = useState<any[]>([]);
  const [isValidFilm, setIsValidFilm] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // === Mention search ===
  const [crewSearchInput, setCrewSearchInput] = useState("");
  const [crewSearchResults, setCrewSearchResults] = useState<any[]>([]);
  const [crewLoading, setCrewLoading] = useState(false);

  const [actorSearchInput, setActorSearchInput] = useState("");
  const [actorSearchResults, setActorSearchResults] = useState<any[]>([]);
  const [actorLoading, setActorLoading] = useState(false);
const navigate=useNavigate()
  // Debounced mention searches
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!crewSearchInput.trim()) {
        setCrewSearchResults([]);
        return;
      }
      setCrewLoading(true);
      try {
        const token = await getAccessToken();
        const results = await searchMentions(token, crewSearchInput);
        setCrewSearchResults(results);
      } catch (err) {
        console.error("Crew search error:", err);
        setCrewSearchResults([]);
      } finally {
        setCrewLoading(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [crewSearchInput, getAccessToken]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!actorSearchInput.trim()) {
        setActorSearchResults([]);
        return;
      }
      setActorLoading(true);
      try {
        const token = await getAccessToken();
        const results = await searchMentions(token, actorSearchInput);
        setActorSearchResults(results);
      } catch (err) {
        console.error("Actor search error:", err);
        setActorSearchResults([]);
      } finally {
        setActorLoading(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [actorSearchInput, getAccessToken]);

  // === Submit film upload ===
  const handleSubmit = async () => {
          navigate('/profile?to=uploads')

    if (!filmFile || !posterFile || !title || !thesis || genres.length === 0) {
      toast.warn("Please fill all required fields before uploading");
      return;
    }

    setIsSubmit(true);
    setUploadProgress(0);
    try {
      const token = await getAccessToken();
      const formData = new FormData();
      formData.append("Title", title);
      formData.append("Thesis", thesis);
formData.append("Genres", JSON.stringify(genres));
      formData.append("Country", country);
      formData.append("Crew", JSON.stringify(crewList));
      formData.append("Cast", JSON.stringify(cast));
      formData.append("uplouderUsername", userInfo?.username);
      if (filmFile) formData.append("Film", filmFile);
      if (posterFile) formData.append("Poster", posterFile);

      await uploadFilm(token, formData, setUploadProgress);
            navigate('/profile?to=uploads')

      setIsDone(true);
      toast.success("Upload complete!");
      navigate('/profile?to=uploads')
    } catch (error) {
      console.error("Upload failed:", error);
      setErrorMsg("Upload failed! Please try again.");
    } finally {
      setIsSubmit(false);
    }
  };

  return {
    // core states
    filmFile,
    posterFile,
    title,
    thesis,
    country,
    genres,
    crewList,
    cast,
    isValidFilm,
    isSubmit,
    isDone,
    uploadProgress,
    errorMsg,

    // search
    crewSearchInput,
    crewSearchResults,
    crewLoading,
    actorSearchInput,
    actorSearchResults,
    actorLoading,

    // setters
    setFilmFile,
    setPosterFile,
    setTitle,
    setThesis,
    setCountry,
    setGenres,
    setCrewList,
    setCast,
    setIsValidFilm,
    setCrewSearchInput,
    setActorSearchInput,
    setErrorMsg,
    setIsDone,

    // actions
    handleSubmit,
  };
};
