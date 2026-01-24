import React, { useEffect, useRef, useState } from "react";
import supabase from "../../../lib/supabaseClient";
import CustomLoading from "../../../SmallComponents/CutomsLoading";
import "react-toastify/dist/ReactToastify.css";
import ShinyText from "../../../SmallComponents/ShinyText";
import FuzzyText from "../../../SmallComponents/FuzzyText";
import Shuffle from "../../../SmallComponents/Shuffle";
import TechnicalReportForm from "../../report/components/TechReport";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import countries from "../../../Data/countries.json";
import ReactCrop, { makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import ErrorImg from "../../../YugenAssits/Icons/ErrorImg.png";
import AccHub from "../../../components/AccountHub";
import { useUpload } from "../hooks/useUpload";
import { useGenresWithFilms } from "../../genres/useGenres";
import { useToast } from "../../../components/toaster";
import uploading_animation from "../../../YugenAssits/upload-button/Yugen Upload.gif";
import tempPFP from "../../../YugenAssits/Avatar_Placeholder.png";

registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

const steps = ["Upload", "Details", "more details"];

const UploadForm: React.FC = () => {
  const toast = useToast();
  const {
    filmFile,
    title,
    thesis,
    country,
    genres,
    crewList,
    cast,
    isDone,
    isSubmit,
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
    setCrewSearchInput,
    setActorSearchInput,
    setErrorMsg,
    setIsDone,
    handleSubmit,
    isValidFilm,
    setIsValidFilm,
  } = useUpload();

  const [activeStep, setActiveStep] = useState(0);
  const [crewName, setCrewName] = useState<string>("");
  const [crewPFP, setCrewPFP] = useState<string>("");
  const [crewRole, setCrewRole] = useState<string>("");
  const [actor, setActor] = useState<string>("");
  const [actorPFP, setActorPFP] = useState<string>("");
  const [character, setCharacter] = useState<string>("");

  const MinWidth = 200;
  const MinHeight = 300;
  const aspectRatio = 2 / 3;
  const [croppedFile, setCroppedFile] = useState<any>(null);
  const [crop, setCrop] = useState<any | null>(null);
  const [posterPath, setPosterPath] = useState<string>("");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onPFPload = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const { naturalWidth, naturalHeight } = img;

    if (naturalWidth < MinWidth || naturalHeight < MinHeight) {
      toast.warn(`Poster must be at least ${MinWidth}x${MinHeight} pixels`);

      setPosterPath("");
      setCrop(null);
      setIsModalOpen(false);

      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const newCrop = makeAspectCrop(
      { unit: "px", width: MinWidth, height: MinHeight },
      aspectRatio,
      naturalWidth,
      naturalHeight,
    );

    setCrop(newCrop);
  };

  const setCroppedPFP = (
    img: HTMLImageElement,
    canvas: HTMLCanvasElement,
    cropParam: any,
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pxRatio = window.devicePixelRatio || 1;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    canvas.width = Math.floor(cropParam.width * scaleX * pxRatio);
    canvas.height = Math.floor(cropParam.height * scaleY * pxRatio);
    ctx.scale(pxRatio, pxRatio);
    ctx.imageSmoothingQuality = "high";
    ctx.save();
    ctx.translate(-cropParam.x * scaleX, -cropParam.y * scaleY);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "cropped_poster.png", {
          type: "image/png",
        });
        setPosterFile(file);
        setCroppedFile(file);
      }
    }, "image/png");
    ctx.restore();
  };

  const handleCancel = () => {
    if (imgRef.current && canvasRef.current && crop) {
      setCroppedPFP(imgRef.current, canvasRef.current, crop);
    }
    setIsModalOpen(false);
  };

  const handleFilmFileChange = (file: File | null) => {
    if (!file) {
      setFilmFile(null);
      setIsValidFilm(false);
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const height = video.videoHeight;

      if (height < 1080) {
        toast.error("Film must be at least 1080p.");
        setFilmFile(null);
        setIsValidFilm(false);
        return;
      }

      setFilmFile(file);
      setIsValidFilm(true);
    };

    video.onerror = () => {
      toast.error("Invalid video file.");
      setFilmFile(null);
      setIsValidFilm(false);
    };

    video.src = URL.createObjectURL(file);
  };

  const handlePosterFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.warn("Only JPEG or PNG images allowed!");
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (img.width < MinWidth || img.height < MinHeight) {
        toast.warn(`Poster must be at least ${MinWidth}x${MinHeight} pixels`);
        return;
      }

      const path = URL.createObjectURL(file);
      setPosterFile(file);
      setPosterPath(path);
      setIsModalOpen(true);
    };

    img.src = URL.createObjectURL(file);
  };

  const handleRemoveFile = () => {
    setPosterPath("");
    setCrop(null);
    setCroppedFile(null);
    setIsModalOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (imgRef.current && canvasRef.current && crop) {
      setCroppedPFP(imgRef.current, canvasRef.current, crop);
    }
  }, [crop]);

  const handleNext = async () => {
    const valid = validateStep();
    if (!valid) return;

    if (activeStep === steps.length - 1) {
      handleSubmit();
      return;
    }

    setActiveStep((p) => p + 1);
  };

  const handleBack = () => setActiveStep((p) => Math.max(0, p - 1));

  const validateStep = () => {
    const s = activeStep;

    if (s === 0 && (!filmFile || !croppedFile)) {
      toast.warn("Please upload both a film and a poster.");
      return false;
    }

    if (s === 1) {
      if (!title || !thesis || !genres || genres.length === 0) {
        toast.warn("Please fill the title, thesis, and at least one genre.");
        return false;
      }

      if (title.length > 100) {
        toast.warn("Title cannot exceed 100 characters");
        return false;
      }
      if (/\r|\n/.test(title)) {
        toast.warn("Title cannot contain line breaks");
        return false;
      }
      if (/[^\p{L}\p{N}\s.,!?'"-]/u.test(title)) {
        toast.warn("Title cannot contain emojis or special characters");
        return false;
      }

      if (thesis.length > 1000) {
        toast.warn("Thesis cannot exceed 1000 characters");
        return false;
      }
     

      return true;
    }

    if (s === 2 && !country) {
      toast.warn("Please choose a country.");
      return false;
    }

    return true;
  };

  const crewRoles = ["Director", "DP", "Editor", "Producer", "Writer"];

  const { genres: allGenres, loading: genresLoading } = useGenresWithFilms();
  const genreOptions = React.useMemo(
    () =>
      Array.isArray(allGenres)
        ? allGenres.map((g: any) => g.genre || g.name || g.id)
        : [],
    [allGenres],
  );
  const [openReport, setOpenReport] = useState(false);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-6">
        <div className="max-w-lg w-full text-center rounded-2xl border-4 border-emerald-950 bg-emerald-50 p-8 shadow-2xl">
          <FuzzyText baseIntensity={0.2}>Unexpected Error</FuzzyText>

          <button
            onClick={() => setErrorMsg(null)}
            className="mt-6 mr-6 inline-flex items-center justify-center gap-2 px-6 py-2 
             rounded-full border-2 border-emerald-950 bg-emerald-950 text-emerald-50 
             font-freckle hover:scale-105 hover:shadow-md 
             active:scale-95 transition-all duration-200"
          >
            Try Again
          </button>

          <button
            onClick={() => setOpenReport(true)}
            className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-2 
             rounded-full border-2 border-emerald-950 bg-emerald-50 text-emerald-950 
             font-freckle hover:bg-emerald-100 hover:scale-105 hover:shadow-md 
             active:scale-95 transition-all duration-200"
          >
            Report Issue
          </button>

          {openReport && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={(e) => {
                if (e.target === e.currentTarget) setOpenReport(false);
              }}
            >
              <div
                className=" rounded-xl p-6 max-w-xl w-full "
                onClick={(e) => e.stopPropagation()}
              >
                <TechnicalReportForm
                  onClose={() => setOpenReport(false)}
                  onSubmitSuccess={() => setOpenReport(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="min-h-screen flex items-center justify-center  p-6">
        <div className="max-w-lg w-full text-center rounded-2xl border-4 border-emerald-950  p-8 shadow-2xl">
          <svg
            className="mx-auto mb-4 w-24 h-24 text-emerald-950"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M9 12l2 2 4-4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
          </svg>
          <h2 className="text-2xl font-semibold mb-2">
            Thanks for uploading to Yūgen, your film is being prepeared for
            release!
          </h2>
          <p className="mb-4">
            Go back to{" "}
            <a className="text-emerald-950 underline" href="/">
              home page
            </a>{" "}
            to continue exploring or go to your{" "}
            <a
              className="text-emerald-950 underline"
              href="/profile?to=uploads"
            >
              profile
            </a>{" "}
            to watch your film!
          </p>
        </div>
      </div>
    );
  }

  if (isSubmit) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center  p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src={uploading_animation}
            className="h-[200px] min-w-[100px] cursor-pointer rounded-lg transition-transform duration-300 ease-in-out"
            alt="upload done!"
          />
          <p className="text-2xl title text-emerald-950 mb-2">
            Prepare for take off!
          </p>
        </div>

        <div className="mt-1 w-full h-2 bg-emerald-100 rounded">
          <div
            className="h-full bg-emerald-950 rounded transition-all"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        <p className="text-sm text-emerald-950 font-semibold mt-1">
          Your upload is {uploadProgress}% completed, please do not leave this
          tab before upload is done!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-[100%] h[100%] mx-auto rounded-3xl    p-6 overflow-y-auto text-emerald-950 font-freckle">
        <div className="flex items-center justify-between mb-6">
          {steps.map((s, i) => {
            const active = i === activeStep;
            const done = i < activeStep;
            return (
              <div key={s} className="flex-1 px-2">
                <div className={`flex-row items-center gap-1`}>
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold
                        ${
                          done
                            ? "bg-emerald-950 text-emerald-50"
                            : active
                              ? "bg-emerald-950 text-emerald-50 shadow-lg"
                              : "bg-emerald-50 text-emerald-950 border-2 border-emerald-950"
                        }`}
                  >
                    {i + 1}
                  </div>
                  <div
                    className={`${
                      active
                        ? "text-emerald-950 font-semibold"
                        : "text-emerald-950/80"
                    }`}
                  >
                    {s}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          {activeStep === 0 && (
            <div className="space-y-4">
              <label className="block font-semibold">Upload a film:</label>
              <div className="w-full">
                <FilePond
                  name="File"
                  allowMultiple={false}
                  acceptedFileTypes={[
                    "video/mp4",
                    "video/quicktime", // .mov
                    "video/x-msvideo", // .avi
                  ]}
                  files={filmFile ? [filmFile] : []}
                  onupdatefiles={(fileItems: any[]) => {
                    const file = fileItems[0]?.file || null;
                    if (file) handleFilmFileChange(file);
                    else handleFilmFileChange(null);
                  }}
                  beforeAddFile={(item) => {
                    return new Promise((resolve) => {
                      const file = item.file;
                      const video = document.createElement("video");
                      video.preload = "metadata";
                      video.onloadedmetadata = () => {
                        const height = video.videoHeight;
                        if (height < 1080) {
                          toast.error("Film must be at least 1080p.");
                          resolve(false);
                        } else {
                          resolve(true);
                        }
                      };
                      video.onerror = () => {
                        toast.error("Invalid video file.");
                        resolve(false);
                      };
                      video.src = URL.createObjectURL(file);
                    });
                  }}
                  className="filepond-custom"
                />
              </div>

              <label className="block font-semibold">Upload a thumbnail:</label>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-emerald-950 cursor-pointer bg-emerald-50 hover:bg-emerald-100">
                    Choose poster
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg, image/png"
                      className="hidden"
                      onChange={handlePosterFileChange}
                    />
                  </label>
                </div>

                {isModalOpen && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) setIsModalOpen(false);
                    }}
                  >
                    <div
                      className="bg-emerald-50 rounded-xl p-4 max-w-2xl w-full border-2 border-emerald-950"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 className="text-lg font-semibold mb-3">
                        Adjust your poster
                      </h3>
                      {posterPath && (
                        <>
                          <div className="max-h-[70vh] overflow-hidden flex justify-center">
                            <ReactCrop
                              crop={crop}
                              keepSelection
                              aspect={2 / 3}
                              minWidth={MinWidth}
                              minHeight={MinHeight}
                              onChange={(pixelCrop) => setCrop(pixelCrop)}
                            >
                              <img
                                ref={imgRef}
                                src={posterPath}
                                alt="poster"
                                onLoad={onPFPload}
                                className="max-h-[70vh] w-auto object-contain rounded-md border"
                              />
                            </ReactCrop>
                          </div>

                          <div className="mt-3 flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                if (
                                  imgRef.current &&
                                  canvasRef.current &&
                                  crop
                                ) {
                                  setCroppedPFP(
                                    imgRef.current as HTMLImageElement,
                                    canvasRef.current as HTMLCanvasElement,
                                    crop,
                                  );
                                }
                                setIsModalOpen(false);
                              }}
                              className="px-4 py-2 rounded-md bg-emerald-950 text-emerald-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setIsModalOpen(false)}
                              className="px-4 py-2 rounded-md border-2 border-emerald-950"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {!crop && !posterPath && (
                  <div className="w-48 h-72 bg-emerald-100 rounded-md border-2 border-emerald-950 flex items-center justify-center">
                    <div className="text-sm text-emerald-900">
                      No poster selected
                    </div>
                  </div>
                )}

                {crop && (
                  <div className="flex flex-col items-center gap-2">
                    <canvas
                      ref={canvasRef}
                      style={{ width: 200, height: 300, borderRadius: "6px" }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-3 py-1 rounded-md border-2 border-emerald-950"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleRemoveFile}
                        className="px-3 py-1 rounded-md border-2 border-emerald-950 bg-emerald-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">Film title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border-2 border-emerald-950 px-3 py-2 bg-emerald-50"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Film thesis</label>
                <textarea
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border-2 border-emerald-950 px-3 py-2 bg-emerald-50"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">Genres</label>
                <div className="flex flex-wrap gap-2">
                  {genreOptions.map((g) => {
                    const selected = genres.includes(g);
                    return (
                      <button
                        key={g}
                        onClick={() =>
                          setGenres((prev) =>
                            selected
                              ? prev.filter((x) => x !== g)
                              : [...prev, g],
                          )
                        }
                        className={`px-3 py-1 rounded-full border-2 ${
                          selected
                            ? "bg-emerald-950 text-emerald-50"
                            : "bg-emerald-50 text-emerald-950 border-emerald-950"
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">
                  Country (required)
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-lg border-2 border-emerald-950 px-3 py-2 bg-emerald-50"
                >
                  <option value="">Select country...</option>
                  {countries.map((c: any) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-emerald-950/20">
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-3">
                  <select
                    value={crewRole}
                    onChange={(e) => setCrewRole(e.target.value)}
                    className="rounded-lg border-2 border-emerald-950 px-3 py-2 bg-emerald-50 w-full sm:w-auto"
                  >
                    <option value="">Select role</option>
                    {crewRoles
                      .filter((role) => !crewList.some((m) => m.role === role))
                      .map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                  </select>

                  <div className="relative flex-1 w-full">
                    <input
                      value={crewName}
                      onChange={(e) => {
                        setCrewName(e.target.value);
                        setCrewSearchInput(e.target.value);
                      }}
                      placeholder="Start typing a username..."
                      className="w-full rounded-lg border-2 border-emerald-950 px-3 py-2 bg-emerald-50"
                    />
                    {crewSearchInput.trim() !== "" && (
                      <div className="absolute left-0 right-0 mt-1 bg-emerald-50 border-2 border-emerald-950 rounded-lg max-h-56 overflow-y-auto z-40">
                        {crewLoading ? (
                          <div className="p-2 text-center">
                            <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
                          </div>
                        ) : (
                          crewSearchResults.map((opt: any) => (
                            <div
                              key={opt.username}
                              onClick={() => {
                                setCrewName("@" + opt.username);
                                setCrewPFP(opt.pfp);
                                setCrewSearchInput("");
                                setCrewSearchResults([]);
                              }}
                              className="px-3 py-2 cursor-pointer hover:bg-emerald-100 flex items-center gap-2"
                            >
                              <img
                                src={
                                  opt.pfp
                                    ? supabase.storage
                                        .from("pfps")
                                        .getPublicUrl(opt.pfp).data.publicUrl
                                    : tempPFP
                                }
                                alt={opt.username}
                                className="w-8 h-8 rounded-full object-cover border"
                              />
                              <span>@{opt.username}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (!crewName || !crewRole) {
                        toast.warn("Please select a role and enter a name.");
                        return;
                      }
                      if (crewList.some((m) => m.role === crewRole)) {
                        toast.warn("Role already added.");
                        return;
                      }
                      setCrewList((prev) => [
                        ...prev,
                        { role: crewRole, name: crewName, pfp: crewPFP },
                      ]);
                      setCrewName("");
                      setCrewRole("");
                      setCrewPFP("");
                    }}
                    type="button"
                    className="px-4 py-2 rounded-md bg-emerald-950 text-emerald-50 w-full sm:w-auto"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {crewList.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-emerald-100 p-3 rounded-lg border-2 border-emerald-950"
                    >
                      <div className="flex items-center gap-3">
                        <strong>{member.role}:</strong>
                        <div className="flex items-center gap-2">
                          {member.name.includes("@") && (
                            <img
                              src={
                                member.pfp
                                  ? supabase.storage
                                      .from("pfps")
                                      .getPublicUrl(member.pfp).data.publicUrl
                                  : tempPFP
                              }
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}

                          <span>{member.name}</span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setCrewList((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                        className="px-3 py-1 rounded-md border-2 border-red-500 text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-emerald-950/20">
                <h4 className="font-semibold mb-2">Cast info (optional)</h4>

                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-3">
                  <input
                    value={character}
                    onChange={(e) => setCharacter(e.target.value)}
                    placeholder="Character"
                    className="rounded-lg border-2 border-emerald-950 px-3 py-2 bg-emerald-50 w-full sm:w-auto"
                  />

                  <div className="relative flex-1 w-full">
                    <input
                      value={actor}
                      onChange={(e) => {
                        setActor(e.target.value);
                        setActorSearchInput(e.target.value);
                      }}
                      placeholder="Start typing a username..."
                      className="w-full rounded-lg border-2 border-emerald-950 px-3 py-2 bg-emerald-50"
                    />
                    {actorSearchInput.trim() !== "" && (
                      <div className="absolute left-0 right-0 mt-1 bg-emerald-50 border-2 border-emerald-950 rounded-lg max-h-56 overflow-y-auto z-40">
                        {actorLoading ? (
                          <div className="p-2 text-center">
                            <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
                          </div>
                        ) : (
                          actorSearchResults.map((opt: any) => (
                            <div
                              key={opt.username}
                              onClick={() => {
                                setActor("@" + opt.username);
                                setActorPFP(opt.pfp);
                                setActorSearchInput("");
                                setActorSearchResults([]);
                              }}
                              className="px-3 py-2 cursor-pointer hover:bg-emerald-100 flex items-center gap-2"
                            >
                              <img
                                src={
                                  opt.pfp
                                    ? supabase.storage
                                        .from("pfps")
                                        .getPublicUrl(opt.pfp).data.publicUrl
                                    : tempPFP
                                }
                                alt={opt.username}
                                className="w-8 h-8 rounded-full object-cover border"
                              />
                              <span>@{opt.username}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (!character || !actor) {
                        toast.warn(
                          "Please select a character and enter an actor.",
                        );
                        return;
                      }
                      setCast((prev) => [
                        ...prev,
                        { character, actor, pfp: actorPFP },
                      ]);
                      setCharacter("");
                      setActor("");
                      setActorPFP("");
                    }}
                    className="px-4 py-2 rounded-md bg-emerald-950 text-emerald-50 w-full sm:w-auto"
                    type="button"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {cast.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-emerald-100 p-3 rounded-lg border-2 border-emerald-950"
                    >
                      <div className="flex items-center gap-3">
                        <strong>{member.character}:</strong>
                        <div className="flex items-center gap-2">
                          {member.actor.includes("@") && (
                            <img
                              src={
                                member.pfp
                                  ? supabase.storage
                                      .from("pfps")
                                      .getPublicUrl(member.pfp).data.publicUrl
                                  : tempPFP
                              }
                              alt={member.actor}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <span>{member.actor}</span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setCast((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="px-3 py-1 rounded-md border-2 border-red-500 text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className="px-4 py-2 rounded-md border-2 border-emerald-950 bg-emerald-50 disabled:opacity-50"
            >
              Back
            </button>
            <div className="flex-1" />
            {activeStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 rounded-md bg-emerald-950 text-emerald-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 rounded-md bg-emerald-950 text-emerald-50"
              >
                Upload
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadForm;
