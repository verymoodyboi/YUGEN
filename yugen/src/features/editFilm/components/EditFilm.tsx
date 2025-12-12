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
import useEditFilmApi from "../hooks/useEditFilm";
import { useGenresWithFilms } from "../../genres/useGenres";
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
        ? allGenres.map((g: any) => g.genre || g.name || g.id) // support flexible schema
        : [],
    [allGenres]
  );
  // Auth (still available in this component because some non-API parts might use it)
  const { getAccessToken } = useAuth();

  // Use the refactored hook that contains API calls and mention search state
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

  // Delete film modal state
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

  // Mentions search (for crew/cast)
  const [crewPFP, setCrewPFP] = useState<string>("");
  const [actorPFP, setActorPFP] = useState<string>("");

  const MinWidth = 200;
  const MinHeight = 300;
  const aspectRatio = 2 / 3;

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(
    null
  );
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(
    null
  );

  const [crop, setCrop] = useState<any>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // cleanup object URLs on unmount
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
      naturalHeight
    );
    setCrop(newCrop);
  };

  const applyCropAndSetFile = async (imgEl: HTMLImageElement, cropArg: any) => {
    if (!imgEl || !cropArg || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pxRatio = window.devicePixelRatio || 1;
    // compute cropping in original image pixels
    const scaleX = imgEl.naturalWidth / imgEl.width;
    const scaleY = imgEl.naturalHeight / imgEl.height;
    const sx = Math.round(cropArg.x * scaleX);
    const sy = Math.round(cropArg.y * scaleY);
    const sw = Math.round(cropArg.width * scaleX);
    const sh = Math.round(cropArg.height * scaleY);

    // set canvas to the size of the cropped area (consider pixel ratio)
    canvas.width = Math.floor(sw * pxRatio);
    canvas.height = Math.floor(sh * pxRatio);

    // use setTransform for crisp scaling
    ctx.setTransform(pxRatio, 0, 0, pxRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw the cropped portion to canvas
    ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, sw, sh);

    // produce blob and file
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
          // revoke old cropped URL
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
        0.95
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
    // revoke old original preview
    if (originalPreviewUrl) {
      try {
        URL.revokeObjectURL(originalPreviewUrl);
      } catch {}
    }
    const path = URL.createObjectURL(file);
    setPosterFile(file);
    setOriginalPreviewUrl(path);
    // open crop modal
    setIsModalOpen(true);
    // reset any previous cropped file (user will crop again)
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

  // show modal (already used)
  const showModal = () => setIsModalOpen(true);

  // Save button in cropper
  const handleOk = async () => {
    if (imgRef.current && crop && canvasRef.current) {
      await applyCropAndSetFile(imgRef.current, crop);
    }
    setIsModalOpen(false);
  };

  // Original file in-state -> crop on change (mirror prior behavior)
  // In some original code the onClose applied crop; keep original behavior: apply crop when modal closes too
  const handleCancel = async () => {
    if (imgRef.current && crop && canvasRef.current) {
      await applyCropAndSetFile(imgRef.current, crop);
    }
    setIsModalOpen(false);
  };

  useEffect(() => {
    // whenever crop changes and we have an image element and canvas, produce a preview immediately (mirrors old code)
    const apply = async () => {
      if (imgRef.current && crop && canvasRef.current) {
        await applyCropAndSetFile(imgRef.current, crop);
      }
    };
    apply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop]);

  // Film data states
  const [title, setTitle] = useState(
    filmInfo.film_title || filmInfo.title || ""
  );
  const [thesis, setThesis] = useState(filmInfo.thesis || "");
  const [genres, setGenres] = useState<string[]>(
    Array.isArray(filmInfo.film_genre)
      ? filmInfo.film_genre
      : typeof filmInfo.film_genre === "string"
        ? filmInfo.film_genre.split(",").map((g) => g.trim())
        : []
  );
  const [country, setCountry] = useState(filmInfo.country || "");
  const [crewList, setCrewList] = useState<any[]>(() => {
    try {
      if (Array.isArray(filmInfo.crew)) return filmInfo.crew;
      if (typeof filmInfo.crew === "string") return JSON.parse(filmInfo.crew);
      return [];
    } catch (e) {
      console.error("Failed to parse crew:", e);
      return [];
    }
  });
  const [cast, setCast] = useState<any[]>(() => {
    try {
      if (Array.isArray(filmInfo.cast)) return filmInfo.cast;
      if (typeof filmInfo.cast === "string") return JSON.parse(filmInfo.cast);
      return [];
    } catch (e) {
      console.error("Failed to parse cast:", e);
      return [];
    }
  });

  const [crewName, setCrewName] = useState("");
  const [crewRole, setCrewRole] = useState("");
  const [actor, setActor] = useState("");
  const [character, setCharacter] = useState("");

  const handleAddCrew = () => {
    if (!crewRole || !crewName) {
      toast.warn("Please select a role and enter a name.");
      return;
    }
    if (crewList?.some((m) => m.role === crewRole)) {
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
  };

  const handleAddCast = () => {
    if (!character || !actor) {
      toast.warn("Please enter a character and an actor.");
      return;
    }
    setCast((prev) => [...prev, { character, actor, pfp: actorPFP }]);
    setCharacter("");
    setActor("");
    setActorPFP("");
  };

  // Submit update (calls the hook's submitEdit, which calls service)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // preserve original behavior: call onDone early (original code did this)
    if (onDone) {
      onDone();
    }
    if (!title || !thesis || genres.length === 0) {
      toast.warn("Please fill title, thesis, and select genres.");
      return;
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

      // prefer the cropped file if present; otherwise fall back to original selected file
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

  // Helper to get public url
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

  // simple autocomplete UI for users
  const UserAutocomplete = ({
    value,
    onChange,
    placeholder,
    loading,
  }: {
    value: string;
    onChange: (val: string, pfp?: string | undefined) => void;
    placeholder?: string;
    loading?: boolean;
  }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val);
            setSearchInput(val); // <- use the hook's setter so the hook's effect runs
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // small delay so click on result registers
            setTimeout(() => setOpen(false), 150);
          }}
          placeholder={placeholder}
          className="w-full rounded-md border-2 border-emerald-950 bg-emerald-50 px-3 py-2 text-emerald-950 focus:outline-none"
        />
        {loading && (
          <div className="absolute right-2 top-2">
            <div className="w-3 h-3 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {open && searchResults.length > 0 && (
          <ul className="absolute z-50 mt-2 w-full max-h-44 overflow-y-auto bg-emerald-50 border-2 border-emerald-950 rounded-md shadow-md">
            {searchResults.map((opt, i) => (
              <li
                key={i}
                onMouseDown={() => {
                  onChange(opt.username, opt.pfp);
                  setOpen(false);
                  setSearchInput("");
                }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-emerald-100 cursor-pointer"
              >
                <img
                  src={getPublic("pfps", opt.pfp) || "/default-avatar.png"}
                  alt={opt.username}
                  className="w-8 h-8 rounded-full object-cover border border-emerald-950"
                />
                <span className="text-emerald-950 font-freckle">
                  {opt.username}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  return (
    <div className="w-screen h-screen overflow-auto bg-emerald-50 text-emerald-950 p-6">
      <div className="max-w-[1200px] mx-auto rounded-2xl p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT COLUMN */}
            <div className="flex-1 min-w-0">
              {/* Genres */}
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
                              : [...prev, g]
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

              {/* Country */}
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

              {/* Poster Image */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-freckle font-semibold">
                    Poster Image (optional)
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border-2 border-emerald-950 bg-emerald-50 cursor-pointer">
                      <CloudUploadIcon />
                      Change Poster
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg, image/png"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="px-3 py-2 rounded-md border-2 border-red-400 text-red-600 bg-emerald-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="w-[200px] h-[300px] rounded-sm overflow-hidden border-2 border-emerald-950 bg-emerald-50 flex items-center justify-center">
                    {croppedPreviewUrl ? (
                      <img
                        src={croppedPreviewUrl}
                        alt="poster preview"
                        className="object-cover w-full h-full"
                      />
                    ) : originalPreviewUrl ? (
                      <img
                        src={originalPreviewUrl}
                        alt="poster preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <img
                        src={
                          getPublic("posters", filmInfo.poster_path) ||
                          "/placeholder.jpg"
                        }
                        alt="current poster"
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>

                  <div className="flex-1 text-sm">
                    <p className="text-emerald-950/80">
                      Recommended aspect ratio: 2:3 (200x300 minimum). Use JPEG
                      or PNG.
                    </p>
                    <p className="text-emerald-950/60 mt-2">
                      After selecting an image you can crop it to the
                      appropriate aspect ratio.
                    </p>
                    {posterFile && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="px-3 py-2 rounded-md border-2 border-emerald-950 bg-emerald-50"
                        >
                          Open cropper
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Poster Crop Modal */}
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
                            {/* eslint-disable-next-line jsx-a11y/alt-text */}
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
                            Cancel
                          </button>
                        </div>

                        {/* hidden canvas used for export */}
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Crew */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-freckle font-semibold">
                    Crew info (optional)
                  </h3>
                </div>

                <div className="flex gap-2 items-start mt-2">
                  <div className="w-36">
                    <select
                      value={crewRole}
                      onChange={(e) => setCrewRole(e.target.value)}
                      className="w-full rounded-md border-2 border-emerald-950 bg-emerald-50 px-2 py-2"
                    >
                      <option value="">Select role</option>
                      {crewRoles
                        .filter((r) => !crewList.some((m) => m.role === r))
                        .map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <UserAutocomplete
                      value={crewName}
                      onChange={(val: string, pfp?: string) => {
                        setCrewName("@" + val);
                        if (pfp) setCrewPFP(pfp);
                      }}
                      placeholder="Start typing a username..."
                      loading={loadingUsers}
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleAddCrew}
                      className="px-4 py-2 rounded-md bg-emerald-950 text-emerald-50 border-2 border-emerald-950"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {crewList.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 bg-emerald-50 border-2 border-emerald-950 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            getPublic("pfps", member.pfp) ||
                            "/default-avatar.png"
                          }
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div>
                          <div className="font-semibold">{member.role}</div>
                          <div className="text-sm">{member.name}</div>
                        </div>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setCrewList((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="px-3 py-1 rounded-md border-2 border-red-400 text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cast */}
              <div className="mt-6">
                <h3 className="font-freckle font-semibold mb-2">Cast</h3>
                <div className="flex gap-2">
                  <input
                    value={character}
                    onChange={(e) => setCharacter(e.target.value)}
                    placeholder="Character"
                    className="rounded-md border-2 border-emerald-950 bg-emerald-50 px-3 py-2 flex-1"
                  />
                  <div className="w-60">
                    <UserAutocomplete
                      value={actor}
                      onChange={(val: string, pfp?: string) => {
                        setActor("@" + val);
                        if (pfp) setActorPFP(pfp);
                      }}
                      placeholder="Actor username..."
                      loading={loadingUsers}
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddCast}
                      className="px-4 py-2 rounded-md bg-emerald-950 text-emerald-50 border-2 border-emerald-950"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {cast.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 bg-emerald-50 border-2 border-emerald-950 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            getPublic("pfps", member.pfp) ||
                            "/default-avatar.png"
                          }
                          alt={member.actor}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div>
                          <div className="font-semibold">
                            {member.character}
                          </div>
                          <div className="text-sm">@{member.actor}</div>
                        </div>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setCast((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="px-3 py-1 rounded-md border-2 border-red-400 text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full lg:w-[400px] flex-shrink-0">
              <div className="w-full bg-emerald-50 border-2 border-emerald-950 rounded-md overflow-hidden">
                <ReactPlayer
                  url={getPublic("films", filmInfo.film_path) || ""}
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

          {/* Actions */}
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

      {/* Delete confirmation modal */}
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
  // NOTE: The original file ended after UserAutocomplete. To preserve layout/style/logic exactly,
  // keep the rest of the component exactly as-is (no JSX changes were requested).
  // If your original file had a render/return block below, paste it here unchanged.
};

export default EditFilm;
