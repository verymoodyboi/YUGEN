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
interface CountryCode {
  name: string;
  dial_code: string;
  code: string;
}

const EditProfile: React.FC<Props> = ({ onSubmitSuccess, onCancel }) => {
  const toast = useToast();
  const { userInfo: user } = useAuth();
  const { handleSubmit, loading } = useEditProfile(onSubmitSuccess);

  const [fname, setfname] = useState("");
  const [lname, setlname] = useState("");
  const [username, setusername] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const [countryCode, setCountryCode] = useState("+965");
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch(
          "https://assets.try-yugen.com/CountryCodes.json",
        );
        const data = await res.json();
        setCountries(data);
      } catch {
        toast.error("Failed to load country codes");
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, [toast]);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");

  useEffect(() => {
    // Load universities JSON
    fetch("/world_universities_and_domains.json")
      .then((res) => res.json())
      .then((data) => setUniversities(data))
      .catch((err) => console.error("Failed to load universities:", err));
  }, []);

  const [countries, setCountries] = useState<CountryCode[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{6,15}$/;

  const [bio, setbio] = useState("");
  const [gender, setGender] = useState("");
  const [region, setregion] = useState("");

  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [insta, setInsta] = useState("");
  const [YT, setYT] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [rawPreview, setRawPreview] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    setContactEmail(user.contact_email || "");
    setSelectedUniversity(user.university || "");
    if (user.contact_number) {
      const match = user.contact_number.match(/\((\+\d+)\)\s*(\d+)/);

      if (match) {
        setCountryCode(match[1]);
        setContactNumber(match[2]);
      } else {
        setContactNumber(user.contact_number);
      }
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!(file instanceof File)) return;
    setRawPreview(URL.createObjectURL(file));
  };

  const createCroppedFile = (
    image: HTMLImageElement,
    crop: Crop,
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
        crop.height,
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
    formData.append("contactEmail", contactEmail);
    formData.append(
      "contactNumber",
      contactNumber ? `(${countryCode}) ${contactNumber}` : "",
    );
    if (croppedFile instanceof File) formData.append("PFP", croppedFile);

    setEmailError("");
    setPhoneError("");

    let valid = true;

    if (contactEmail && !emailRegex.test(contactEmail)) {
      setEmailError("Invalid email format");
      valid = false;
      toast.warn(emailError);
    }

    if (contactNumber && !phoneRegex.test(contactNumber)) {
      setPhoneError("Phone must be 6–15 digits");
      valid = false;
      toast.warn(phoneError);
    }

    if (!valid) return;
    await handleSubmit(
      formData,
      { Insta: insta, YT, LI: linkedin },
      croppedFile ?? undefined,
    );
  };
  const PFPurl = user?.pfp_path
    ? `https://pfps.try-yugen.com/${user?.pfp_path}?t=${Date.now()}`
    : tempPFP;
  return (
    <div className="h-[90%] no-scrollbar max-w-3xl mx-auto bg-emerald-50 border-4 border-emerald-950 overflow-y-scroll rounded-3xl p-6 shadow-xl">
      <h1 className="text-3xl font-bold mb-4">Edit Profile</h1>

      <form onSubmit={onFormSubmit} className="space-y-6">
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

        <div>
          <label className="block mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setbio(e.target.value)}
            rows={3}
            className="w-full rounded-lg border-2 border-emerald-950 bg-emerald-50 px-3 py-2"
          />
        </div>

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
        <div>
          <label className="block mb-2 font-semibold">Contact Info</label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                Contact Email
              </label>

              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value.toLowerCase())}
                placeholder="your@email.com"
                className={`w-full p-2 rounded-lg border-2 bg-emerald-50 focus:outline-none focus:ring-2 ${
                  emailError
                    ? "border-red-500 focus:ring-red-400"
                    : "border-emerald-950 focus:ring-emerald-400"
                }`}
              />

              {emailError && (
                <span className="text-xs text-red-500">{emailError}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                WhatsApp
              </label>

              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={loadingCountries}
                  className="p-2 rounded-lg border-2 border-emerald-950 bg-emerald-50 max-w-[120px]"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.dial_code}>
                      {c.dial_code}
                    </option>
                  ))}
                </select>

                <input
                  value={contactNumber}
                  onChange={(e) =>
                    setContactNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="51579287"
                  className={`flex-1 p-2 rounded-lg border-2 bg-emerald-50 focus:outline-none focus:ring-2 ${
                    phoneError
                      ? "border-red-500 focus:ring-red-400"
                      : "border-emerald-950 focus:ring-emerald-400"
                  }`}
                />
              </div>

              {phoneError && (
                <span className="text-xs text-red-500">{phoneError}</span>
              )}
            </div>
          </div>
        </div>
        <label className="block mb-2 font-semibold">
          A student? select your academic institute{" "}
        </label>

        <div className="relative w-full mb-52">
          <input
            type="text"
            placeholder="Type to search your university..."
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="w-full rounded-lg border-2 border-emerald-950 p-2"
          />

          {selectedUniversity && (
            <ul className="absolute left-0 top-full z-20 w-full max-h-48 overflow-y-auto bg-emerald-50 border-2 border-emerald-950 rounded-b-lg">
              {universities
                .map((u) => {
                  const search = selectedUniversity.toLowerCase();
                  const name = u.name.toLowerCase();
                  const domainMatch = u.domains?.some((d: string) =>
                    d.toLowerCase().includes(search),
                  );

                  let rank = -1;
                  if (name === search) rank = 0;
                  else if (name.includes(search)) rank = 1;
                  else if (domainMatch) rank = 2;

                  return { ...u, rank };
                })
                .filter((u) => u.rank >= 0)
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 10)
                .map((u) => (
                  <li
                    key={u.name}
                    className="px-3 py-2 hover:bg-emerald-100 cursor-pointer"
                    onClick={() => setSelectedUniversity(u.name)}
                  >
                    {u.name} ({u.country})
                  </li>
                ))}
            </ul>
          )}
        </div>
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
