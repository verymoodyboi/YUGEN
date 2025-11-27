// src/features/upload/hooks/useUpload.ts
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useUploadManager } from "../../uploads/useUploadManager";
import { useAuth } from "../../../contexts/AuthContext";
import { uploadFilm } from "../services";
import { searchMentions } from "../../search/services";

export const useUpload = () => {
  const { getAccessToken } = useAuth();
  const uploadManager = (() => {
    try {
      return useUploadManager();
    } catch {
      return null as any;
    }
  })();
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
    // non-blocking: delegate to UploadManager if present, otherwise fallback to existing uploadFilm
    if (!filmFile || !posterFile || !title || !thesis || genres.length === 0) {
      toast.warn("Please fill all required fields before uploading");
      return;
    }

    // If UploadManager is available, use it to start a background upload and return immediately
    if (uploadManager && uploadManager.addUpload) {
      try {
        uploadManager.addUpload(filmFile, {
          Title: title,
          Thesis: thesis,
          Genres: genres,
          Country: country,
          Crew: crewList,
          Cast: cast,
          Poster: posterFile,
        });
        toast.success("Upload started — running in background");
        return;
      } catch (err) {
        console.error("Failed to start background upload", err);
        toast.error("Failed to start upload");
        return;
      }
    }

    // Fallback: older direct upload path (keeps behavior for code paths that expect it)
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
      setIsDone(true);
      toast.success("Upload complete!");
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
    setCrewSearchResults,
    setActorSearchInput,
    setActorSearchResults,
    setErrorMsg,
    setIsDone,

    // actions
    handleSubmit,
  };
};
