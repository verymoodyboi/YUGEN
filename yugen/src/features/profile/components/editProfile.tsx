import React, { useState, useEffect, useRef } from "react";
import supabase from "../../../lib/supabaseClient";
import { useAuth } from "../../../contexts/AuthContext";
import countries from "../../../Data/countries.json";
import "react-toastify/dist/ReactToastify.css";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import DeleteIcon from "@mui/icons-material/Delete";

import { useEditProfile } from "../hooks/useEditProfile";
import { ImageCropper } from "../../../util/image-cropping/components/image-cropper";
import { Crop } from "react-image-crop";
import { useToast } from "../../../components/toaster";
import tempPFP from "../../../YugenAssits/Avatar_Placeholder.png";

interface Props {
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

const EditProfile: React.FC<Props> = ({ onSubmitSuccess, onCancel }) => {
  const toast = useToast();
  const { userInfo: user } = useAuth();
  const { handleSubmit, loading } = useEditProfile(onSubmitSuccess);

  // form state
  const [fname, setfname] = useState("");
  const [lname, setlname] = useState("");
  const [username, setusername] = useState("");
  const [bio, setbio] = useState("");
  const [gender, setGender] = useState("");
  const [region, setregion] = useState("");

  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [insta, setInsta] = useState("");
  const [YT, setYT] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // cropper logic
  const [rawPreview, setRawPreview] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // populate user info
  useEffect(() => {
    if (!user) return;
    setfname(user.f_name || "");
    setlname(user.l_name || "");
    setusername(user.username || "");
    setbio(user.bio || "");
    setGender(user.gender || "");
    setregion(user.region || "");
    const userLinks: string[] = [];
    if (user.instagram) userLinks.push(user.instagram);
    if (user.youtube) userLinks.push(user.youtube);
    if (user.linkedin) userLinks.push(user.linkedin);
    setLinks(userLinks);
    setInsta(user.instagram || "");
    setYT(user.youtube || "");
    setLinkedin(user.linkedin || "");
  }, [user]);

  // ========== CROPPER HANDLING ==========
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!(file instanceof File)) return;
    setRawPreview(URL.createObjectURL(file));
  };

  const createCroppedFile = (
    image: HTMLImageElement,
    crop: Crop
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!crop.width || !crop.height) return reject("Invalid crop");

      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No context");

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) return reject("Crop failed");
        const file = new File([blob], "cropped.jpeg", { type: "image/jpeg" });
        resolve(file);
      }, "image/jpeg");
    });
  };

  const confirmCrop = async (img: HTMLImageElement, crop: Crop) => {
    try {
      const cropped = await createCroppedFile(img, crop);
      setCroppedFile(cropped);
      setRawPreview(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to crop image");
    }
  };
  // ======================================

  const getPlatform = (url: string) => {
    if (url.includes("instagram.com")) return "instagram";
    if (url.includes("youtube.com")) return "youtube";
    if (url.includes("linkedin.com")) return "linkedin";
    return "other";
  };

  const handleAddLink = () => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;

    const platform = getPlatform(trimmed);
    if (!["instagram", "youtube", "linkedin"].includes(platform)) {
      toast.error("Only Instagram, YouTube, or LinkedIn links allowed.");
      return;
    }

    const filtered = links.filter((l) => getPlatform(l) !== platform);
    setLinks([...filtered, trimmed]);

    if (platform === "instagram") setInsta(trimmed);
    if (platform === "youtube") setYT(trimmed);
    if (platform === "linkedin") setLinkedin(trimmed);

    setLinkInput("");
  };

  const handleRemoveLink = (index: number) => {
    const removed = links[index];
    const platform = getPlatform(removed);
    if (platform === "instagram") setInsta("");
    if (platform === "youtube") setYT("");
    if (platform === "linkedin") setLinkedin("");
    setLinks(links.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("Region", region);
    formData.append("Gender", gender);
    formData.append("FName", fname);
    formData.append("LName", lname);
    formData.append("UserName", username.toLowerCase());
    formData.append("Bio", bio);
    if (croppedFile instanceof File) formData.append("PFP", croppedFile);

    await handleSubmit(formData, {
      Insta: insta,
      YT: YT,
      LI: linkedin,
    });
  };
  const PFPurl = user?.pfp
    ? supabase.storage.from("pfps").getPublicUrl(user?.pfp).data.publicUrl +
      (user?.updated_at ? `?v=${new Date(user?.updated_at).getTime()}` : "")
    : tempPFP;
  return (
    <div className="h-[90%] no-scrollbar max-w-3xl mx-auto bg-emerald-50 border-4 border-emerald-950 overflow-y-scroll rounded-3xl p-6 shadow-xl">
      <h1 className="text-3xl font-bold mb-4">Edit Profile</h1>

      <form onSubmit={onFormSubmit} className="space-y-6">
        {/* PFP Upload */}
        <div>
          <label className="block mb-1 font-semibold">Profile Picture</label>
          <div className="p-3 border-2 border-dashed border-emerald-950 rounded-lg bg-emerald-50">
            <div className="flex items-center gap-3">
              <label
                htmlFor="pfp"
                className="inline-flex items-center gap-2 px-3 py-2 border border-emerald-950 rounded-md hover:bg-emerald-100 transition cursor-pointer"
              >
                <CloudUploadIcon fontSize="small" />
                Upload
                <input
                  id="pfp"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {croppedFile instanceof File ? (
                <img
                  src={URL.createObjectURL(croppedFile)}
                  alt="pfp"
                  className="w-20 h-20 rounded-full border-2 border-emerald-950 object-cover shadow"
                />
              ) : user?.pfp_path ? (
                <img
                  src={PFPurl}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== tempPFP) {
                      img.src = tempPFP;
                    }
                  }}
                  alt="pfp"
                  className="w-20 h-20 rounded-full border-2 border-emerald-950 object-cover shadow"
                />
              ) : null}
            </div>

            {rawPreview && (
              <div className="mt-4">
                <ImageCropper
                  src={rawPreview}
                  onCropConfirm={confirmCrop}
                  onCancel={() => setRawPreview(null)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">First Name</label>
            <input
              value={fname}
              onChange={(e) => setfname(e.target.value)}
              className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1">Last Name</label>
            <input
              value={lname}
              onChange={(e) => setlname(e.target.value)}
              className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setusername(e.target.value.toLowerCase())}
              className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1">Region</label>
            <select
              value={region}
              onChange={(e) => setregion(e.target.value)}
              className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
            >
              <option value="">Select region</option>
              {countries.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setbio(e.target.value)}
            rows={3}
            className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
          />
        </div>

        {/* Socials */}
        <div>
          <label className="block mb-2 font-semibold">Social Links</label>
          <div className="flex gap-2 mb-3">
            <input
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              className="flex-1 rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
              placeholder="Add Instagram, YouTube, or LinkedIn URL"
            />
            <button
              type="button"
              onClick={handleAddLink}
              className="px-4 py-2 bg-emerald-950 text-emerald-50 rounded-lg hover:scale-105 transition"
            >
              Add
            </button>
          </div>

          {links.map((link, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-emerald-100 border-2 border-emerald-950 rounded-lg px-3 py-2 mb-2"
            >
              <div className="flex items-center gap-2 truncate">
                {link.includes("instagram") && <InstagramIcon />}
                {link.includes("youtube") && <YouTubeIcon />}
                {link.includes("linkedin") && <LinkedInIcon />}
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-sm"
                >
                  {link}
                </a>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveLink(idx)}
                className="text-emerald-950 hover:text-red-600"
              >
                <DeleteIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-emerald-950 text-emerald-50 rounded-full font-semibold hover:scale-105 transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Confirm"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border-2 border-emerald-950 rounded-full font-semibold hover:bg-emerald-100 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
