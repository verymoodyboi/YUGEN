import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  initializeUpload,
  processUpload,
  uploadToR2WithProgress,
} from "../services";
import { searchMentions } from "../../search/services";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../components/toaster";
import { useUploadProgress } from "../uploadContext";
import { deleteFilm } from "../../editFilm/services";
import { sliceFirst49MB } from "../util/sliceForMod";
import { uploadModerationSnapshots } from "../util/uploadModFrame";

export const useUpload = () => {
  const { uploadProgress, setUploadProgress } = useUploadProgress();

  const toast = useToast();
  const { getAccessToken, userInfo } = useAuth();
  const navigate = useNavigate();


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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [pendingFilmId, setPendingFilmId] = useState<string | null>(null);
  const [pendingUploadUrl, setPendingUploadUrl] = useState<string | null>(null);
  const [pendingPosterUploadUrl, setPendingPosterUploadUrl] = useState<string | null>(null);
const [pendingModerationUploadUrls, setPendingModerationUploadUrls] =
  useState<string[] | null>(null);
    const [uploadStage, setUploadStage] = useState<
    "init" | "uploading-film" | "uploading-poster" | "finalizing" | null
  >(null);

 
  const [crewSearchInput, setCrewSearchInput] = useState("");
  const [crewSearchResults, setCrewSearchResults] = useState<any[]>([]);
  const [crewLoading, setCrewLoading] = useState(false);

  const [actorSearchInput, setActorSearchInput] = useState("");
  const [actorSearchResults, setActorSearchResults] = useState<any[]>([]);
  const [actorLoading, setActorLoading] = useState(false);

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
      } catch {
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
      } catch {
        setActorSearchResults([]);
      } finally {
        setActorLoading(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [actorSearchInput, getAccessToken]);

  const handleSubmit = async () => {
    if (!filmFile || !title || !thesis || genres.length === 0) {
      toast.warn("Please fill all required fields before uploading");
      return;
    }

    setIsSubmit(true);
    setUploadProgress(0);
    setErrorMsg(null);

    try {
      const token = await getAccessToken();

      setUploadStage("init");
      const init = await initializeUpload(token, {
        title,
        thesis,
        genres,
        country,
        crew: crewList,
        cast,
        filmMime: filmFile.type,
        posterMime: posterFile?.type ?? null,
      });
//console.log("INIT RESPONSE", init);

const {
  uploadUrl,
  posterUploadUrl,
  moderationUploadUrls,
} = init;


      const filmId = init.filmId;
      setPendingFilmId(filmId);
      setPendingUploadUrl(uploadUrl ?? null);
      setPendingPosterUploadUrl(posterUploadUrl ?? null);
setPendingModerationUploadUrls(moderationUploadUrls ?? null);

      setUploadStage("uploading-film");
      await uploadToR2WithProgress(uploadUrl, filmFile, (p) =>
        setUploadProgress(Math.round(p * 0.70))
      );

      if (posterFile && posterUploadUrl) {
        setUploadStage("uploading-poster");
        await uploadToR2WithProgress(posterUploadUrl, posterFile, (p) =>
          setUploadProgress(70 + Math.round(p * 0.15))
        );
      }
try {
  if (moderationUploadUrls?.length === 4 && filmFile) {
    await uploadModerationSnapshots(
      filmFile,
      moderationUploadUrls,
      (p) => setUploadProgress(85 + Math.round(p * 0.15))
    );
  }
} catch (e) {
  console.warn("Moderation snapshot upload failed", e);
  // allow film upload to continue
}



      setUploadStage("finalizing");
      await processUpload(token, filmId);

      // success
      setIsDone(true);
      setPendingFilmId(null);
      setPendingUploadUrl(null);
      setPendingPosterUploadUrl(null);
      setUploadStage(null);
      setIsSubmit(false);
      setUploadProgress(100);
      toast.success("Upload complete!");
    } catch (err) {
      console.error("Upload error:", err);

      try {
        const filmId = pendingFilmId;
        const token = await getAccessToken();

        // If we are *not* in the middle of uploading to R2, remove the backend film record to avoid orphan records.
     if (filmId) {
  await deleteFilm(filmId, token);
  setPendingFilmId(null);
  setPendingUploadUrl(null);
  setPendingPosterUploadUrl(null);
  setPendingModerationUploadUrls(null);
  //console.log("Cleanup: deleted film", filmId);
}
      } catch (cleanupErr) {
        console.error("Cleanup failed:", cleanupErr);
      }

      if (uploadStage === "uploading-film" || uploadStage === "uploading-poster") {
        setErrorMsg("Upload interrupted (network or R2 error). You can try again.");
      } else {
        setErrorMsg("Upload failed. Please try again.");
      }

      toast.error("Upload failed");
      setIsSubmit(false);
      setUploadStage(null);
    }
  };

  
  const retryUpload = async () => {
    if (!pendingFilmId || !pendingUploadUrl) {
      toast.warn("Nothing to retry — please start a fresh upload.");
      return;
    }

    setIsSubmit(true);
    setUploadProgress(0);
    setErrorMsg(null);

    try {
      const token = await getAccessToken();

      setUploadStage("uploading-film");
      if (!filmFile) throw new Error("Original film file not present in memory to retry upload.");
      await uploadToR2WithProgress(pendingUploadUrl, filmFile, (p) =>
        setUploadProgress(Math.round(p * 0.7))
      );

      if (pendingPosterUploadUrl && posterFile) {
        setUploadStage("uploading-poster");
        await uploadToR2WithProgress(pendingPosterUploadUrl, posterFile, (p) =>
          setUploadProgress(80 + Math.round(p * 0.2))
        );
      }

      setUploadStage("finalizing");
      await processUpload(token, pendingFilmId);

      setIsDone(true);
      setPendingFilmId(null);
      setPendingUploadUrl(null);
      setPendingPosterUploadUrl(null);
      setUploadStage(null);
      setIsSubmit(false);
      setUploadProgress(100);
      toast.success("Upload complete (retry)!");
    } catch (err) {
      console.error("Retry failed:", err);
      setErrorMsg("Retry failed. Please try again.");
      setIsSubmit(false);
      setUploadStage(null);
      toast.error("Retry failed");
    }
  };

  return {
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

    crewSearchInput,
    crewSearchResults,
    crewLoading,
    actorSearchInput,
    actorSearchResults,
    actorLoading,

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

    handleSubmit,
    retryUpload,
  };
};
