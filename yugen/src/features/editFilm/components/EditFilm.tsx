import React, { useState, useEffect, useRef } from "react";

import ReactPlayer from "react-player";
import { useToast } from "../../../components/toaster";
import "react-toastify/dist/ReactToastify.css";
import countries from "../../../Data/countries.json";
import { registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import ErrorImg from "../../../YugenAssits/Icons/ErrorImg.png";
import ReactCrop, { makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import supabase from "../../../lib/supabaseClient";
import { useAuth } from "../../../contexts/AuthContext";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import useEditFilmApi from "../../../features/editFilm/hooks/useEditFilm";
import { useGenresWithFilms } from "../../../features/genres/useGenres";
import { useUpload } from "../../../features/upload/hooks/useUpload";
import tempPFP from "../../../YugenAssits/Avatar_Placeholder.png";
import tempPoster from "../../../YugenAssits/Cover_Placeholder.png";

registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

const crewRoles = ["Director", "DP", "Editor", "Producer", "Writer"];

interface FilmInfo {
  film_uuid: string;
  id: string;
  film_title?: string;
  title?: string;
  thesis?: string;
  film_genre?: any;
  country?: string;
  crew?: any;
  cast?: any;
  poster_path?: string;
  poster?: string;
  film_path?: string;
  uploader_id?: string;
}

interface EditFilmProps {
  filmInfo: FilmInfo;
  onDone?: () => void;
}

const EditFilm: React.FC<EditFilmProps> = ({ filmInfo, onDone }) => {
  const toast = useToast();
  const { userInfo } = useAuth();
  const { genres: allGenres, loading: genresLoading } = useGenresWithFilms();
  const genreOptions = React.useMemo(
    () =>
      Array.isArray(allGenres)
        ? allGenres.map((g: any) => g.genre || g.name || g.id)
        : [],
    [allGenres],
  );
  const { getAccessToken } = useAuth();

  const {
    searchInput,
    setSearchInput,
    searchResults,
    loadingUsers,
    isSaving,
    setIsSaving,
    submitEdit,
    deleteFilmByUuid,
  } = useEditFilmApi();
  const {
    crewList,
    cast,

    crewSearchInput,
    crewSearchResults,
    crewLoading,
    actorSearchInput,
    actorSearchResults,
    actorLoading,

    setCrewList,
    setCast,
    setCrewSearchInput,
    setActorSearchInput,
  } = useUpload();

  const [openDelete, setOpenDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteFilmByUuid(filmInfo.film_uuid);
      toast.success("Film Deleted successfully!");
      if (onDone) onDone();
    } catch (error: any) {
      toast.error("Failed to Delete film: " + (error.message || error));
    } finally {
      setIsSaving(false);
      setOpenDelete(false);
    }
  };

  const [crewPFP, setCrewPFP] = useState<string>("");
  const [actorPFP, setActorPFP] = useState<string>("");

  const MinWidth = 200;
  const MinHeight = 300;
  const aspectRatio = 2 / 3;

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(
    null,
  );
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(
    null,
  );

  const [crop, setCrop] = useState<any>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
      if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    };
  }, [originalPreviewUrl, croppedPreviewUrl]);

  const onPFPload = (e: any) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth < MinWidth || naturalHeight < MinHeight) {
      toast.warn("Image must be at least 200x300 pixels");
      setOriginalPreviewUrl(ErrorImg);
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

  const applyCropAndSetFile = async (imgEl: HTMLImageElement, cropArg: any) => {
    if (!imgEl || !cropArg || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pxRatio = window.devicePixelRatio || 1;
    const scaleX = imgEl.naturalWidth / imgEl.width;
    const scaleY = imgEl.naturalHeight / imgEl.height;
    const sx = Math.round(cropArg.x * scaleX);
    const sy = Math.round(cropArg.y * scaleY);
    const sw = Math.round(cropArg.width * scaleX);
    const sh = Math.round(cropArg.height * scaleY);

    canvas.width = Math.floor(sw * pxRatio);
    canvas.height = Math.floor(sh * pxRatio);

    ctx.setTransform(pxRatio, 0, 0, pxRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, sw, sh);

    return new Promise<File | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const file = new File([blob], "poster_cropped.png", {
            type: "image/png",
          });
          if (croppedPreviewUrl) {
            try {
              URL.revokeObjectURL(croppedPreviewUrl);
            } catch {}
          }
          const url = URL.createObjectURL(file);
          setCroppedFile(file);
          setCroppedPreviewUrl(url);
          resolve(file);
        },
        "image/png",
        0.95,
      );
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.warn("Only JPEG or PNG images allowed!");
      return;
    }
    if (originalPreviewUrl) {
      try {
        URL.revokeObjectURL(originalPreviewUrl);
      } catch {}
    }
    const path = URL.createObjectURL(file);
    setPosterFile(file);
    setOriginalPreviewUrl(path);
    setIsModalOpen(true);
    if (croppedPreviewUrl) {
      try {
        URL.revokeObjectURL(croppedPreviewUrl);
      } catch {}
    }
    setCroppedFile(null);
    setCroppedPreviewUrl(null);
  };

  const handleRemoveFile = () => {
    if (originalPreviewUrl) {
      try {
        URL.revokeObjectURL(originalPreviewUrl);
      } catch {}
    }
    if (croppedPreviewUrl) {
      try {
        URL.revokeObjectURL(croppedPreviewUrl);
      } catch {}
    }
    setOriginalPreviewUrl(null);
    setCroppedPreviewUrl(null);
    setPosterFile(null);
    setCroppedFile(null);
    setCrop(null);
    setIsModalOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const showModal = () => setIsModalOpen(true);

  const handleOk = async () => {
    if (imgRef.current && crop && canvasRef.current) {
      await applyCropAndSetFile(imgRef.current, crop);
    }
  };

  const handleCancel = async () => {
    if (imgRef.current && crop && canvasRef.current) {
      await applyCropAndSetFile(imgRef.current, crop);
    }
    setIsModalOpen(false);
  };

  useEffect(() => {
    const apply = async () => {
      if (imgRef.current && crop && canvasRef.current) {
        await applyCropAndSetFile(imgRef.current, crop);
      }
    };
    apply();
  }, [crop]);

  const [title, setTitle] = useState(
    filmInfo.film_title || filmInfo.title || "",
  );
  const [thesis, setThesis] = useState(filmInfo.thesis || "");
  const [genres, setGenres] = useState<string[]>(
    Array.isArray(filmInfo.film_genre)
      ? filmInfo.film_genre
      : typeof filmInfo.film_genre === "string"
        ? filmInfo.film_genre.split(",").map((g) => g.trim())
        : [],
  );
  const [country, setCountry] = useState(filmInfo.country || "");

  const [crewName, setCrewName] = useState("");
  const [crewRole, setCrewRole] = useState("");
  const [actor, setActor] = useState("");
  const [character, setCharacter] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    if (/\r|\n/.test(thesis)) {
      toast.warn("Thesis cannot contain line breaks");
      return false;
    }
    if (/[^\p{L}\p{N}\s.,!?'"-]/u.test(thesis)) {
      toast.warn("Thesis cannot contain emojis or special characters");
      return false;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("id", filmInfo.id);
      formData.append("Title", title);
      formData.append("Thesis", thesis);
      formData.append("Film_id", filmInfo.film_uuid);
      formData.append("Genres", genres.join(", "));
      formData.append("Country", country);
      formData.append("Crew", JSON.stringify(crewList));
      formData.append("Cast", JSON.stringify(cast));
      formData.append("uplouderUsername", userInfo.username);

      if (croppedFile) formData.append("Poster", croppedFile);
      else if (posterFile) formData.append("Poster", posterFile);

      await submitEdit(formData);

      toast.success("Film updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update film: " + (error.message || error));
    } finally {
      setIsSaving(false);
    }
  };

  const getPublic = (bucket: string, path?: string | null) => {
    try {
      if (!path) return "";
      return (
        supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl || ""
      );
    } catch {
      return "";
    }
  };

  const posterUrl = filmInfo.poster_path
    ? `https://posters.try-yugen.com/${filmInfo.poster_path}`
    : tempPoster;

  return (
    <div
      className="w-screen h-screen overflow-auto bg-emerald-50 text-emerald-950 p-6"
      style={{
        backgroundImage: 'url("/Background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-[1200px] mx-auto rounded-2xl p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <div>
                <label className="block mb-2 font-freckle font-semibold">
                  Genres
                </label>
                <div className="flex flex-wrap gap-2">
                  {genreOptions.map((g) => {
                    const selected = genres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() =>
                          setGenres((prev) =>
                            prev.includes(g)
                              ? prev.filter((x) => x !== g)
                              : [...prev, g],
                          )
                        }
                        className={`px-3 py-1 rounded-md border-2 font-freckle text-sm transition ${
                          selected
                            ? "bg-emerald-950 text-emerald-50 border-emerald-950"
                            : "bg-emerald-50 text-emerald-950 border-emerald-950 hover:bg-emerald-100"
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4">
                <label className="block mb-2 font-freckle font-semibold">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-md border-2 border-emerald-950 bg-emerald-50 px-3 py-2 text-emerald-950 focus:outline-none"
                >
                  <option value="">Select country</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {isModalOpen && (
                <div
                  className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                  onClick={() => setIsModalOpen(false)}
                >
                  <div
                    className="bg-emerald-50 text-emerald-950 rounded-xl w-full max-w-2xl p-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-freckle font-semibold mb-3">
                      Adjust your poster
                    </h3>
                    {originalPreviewUrl && (
                      <>
                        <div className="w-full">
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
                              src={originalPreviewUrl}
                              onLoad={onPFPload}
                              className="max-w-full"
                            />
                          </ReactCrop>
                        </div>

                        <div className="mt-4 flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={handleOk}
                            className="px-4 py-2 rounded-md bg-emerald-950 text-emerald-50 border-2 border-emerald-950"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-md border-2 border-emerald-950 bg-emerald-50"
                          >
                            Close
                          </button>
                        </div>

                        <canvas ref={canvasRef} style={{ display: "none" }} />
                      </>
                    )}
                  </div>
                </div>
              )}

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
                                setCrewPFP(opt.pfp || tempPFP);
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
                                setActorPFP(opt.pfp || tempPFP);
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

            <div className="w-full lg:w-[400px] flex-shrink-0">
              <div className="w-full bg-emerald-50 border-2 border-emerald-950 rounded-md overflow-hidden">
                <ReactPlayer
                  url={`https://cdn.try-yugen.com/${filmInfo.film_path}`}
                  controls
                  width="100%"
                  height="225px"
                />
              </div>

              <div className="mt-4">
                <label className="block mb-2 font-freckle font-semibold">
                  Film Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
                />
              </div>

              <div className="mt-4">
                <label className="block mb-2 font-freckle font-semibold">
                  Film Thesis
                </label>
                <textarea
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border-2 border-emerald-950 bg-emerald-50 px-3 py-2 resize-y"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-full border-2 bg-emerald-950 text-emerald-50 hover:scale-105 transition"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={() => {
                if (onDone) onDone();
              }}
              className="px-5 py-2 rounded-full border-2 bg-emerald-50 text-emerald-950 hover:scale-105 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => setOpenDelete(true)}
              className="px-5 py-2 rounded-full border-2 bg-red-600 text-white hover:scale-105 transition flex items-center gap-2"
            >
              <DeleteIcon />
              Delete film
            </button>
          </div>
        </form>
      </div>

      {openDelete && (
        <div
          className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setOpenDelete(false)}
        >
          <div
            className="bg-emerald-50 text-emerald-950 rounded-2xl w-full max-w-lg p-6 border-2 border-emerald-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-20 h-20 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <h3 className="text-2xl font-freckle font-semibold">Warning!</h3>
              <p className="text-center">
                By confirming the film will be permanently deleted. This action
                is irreversible.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setOpenDelete(false)}
                  className="flex-1 px-4 py-2 rounded-md border-2 bg-emerald-50 text-emerald-950"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                  }}
                  className="flex-1 px-4 py-2 rounded-md border-2 bg-red-600 text-white"
                >
                  Delete film
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditFilm;
