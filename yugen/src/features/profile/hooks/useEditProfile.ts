import { useState } from "react";
import { addUserType, editProfile, updateSocials } from "../services";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../components/toaster";

/* ================== VALIDATION HELPERS ================== */
const hasLineBreaks = (v: string) => /[\r\n]/.test(v);
const containsEmoji = (v: string) =>
  /[\p{Extended_Pictographic}]/u.test(v);
const isEmpty = (v?: string) => !v || !v.trim();

function validateProfileForm(
  formData: FormData,
  toast: ReturnType<typeof useToast>
): boolean {
  const fname = formData.get("FName") as string;
  const lname = formData.get("LName") as string;
  const username = formData.get("UserName") as string;
  const region = formData.get("Region") as string;
  const gender = formData.get("Gender") as string;
  const bio = formData.get("Bio") as string;

  if (
    isEmpty(fname) ||
    isEmpty(lname) ||
    isEmpty(username) ||
    isEmpty(region) ||
    isEmpty(gender) ||
    isEmpty(bio)
  ) {
    toast.error("All fields except socials are required.");
    return false;
  }

  if (username.length > 30) {
    toast.error("Username must be under 30 characters.");
    return false;
  }

  if (username.includes(" ")) {
    toast.error("Username cannot contain spaces.");
    return false;
  }

  if (containsEmoji(username)) {
    toast.error("Username cannot contain emojis.");
    return false;
  }

  if (hasLineBreaks(username)) {
    toast.error("Username cannot contain line breaks.");
    return false;
  }

  if (bio.length <= 10 || bio.length >= 500) {
    toast.error("Bio must be between 10 and 500 characters.");
    return false;
  }

  if (hasLineBreaks(bio)) {
    toast.error("Bio cannot contain line breaks.");
    return false;
  }

  return true;
}
/* ======================================================== */

export function useEditProfile(onSuccess?: () => void) {
  const { getAccessToken } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // --- main profile update (profile + socials) ---
  const handleSubmit = async (
    formData: FormData,
    socials: { Insta?: string; YT?: string; LI?: string }
  ) => {
    if (!validateProfileForm(formData, toast)) return;

    setLoading(true);
    try {
      const token = await getAccessToken();

      await updateSocials(socials, token);
      await editProfile(formData, token);

      toast.success("Profile updated successfully!");
      onSuccess?.();
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  // --- socials-only update ---
  const handleUpdateSocials = async (
    socials: { Insta?: string; YT?: string; LI?: string }
  ) => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      await updateSocials(socials, token);
      toast.success("Socials updated!");
    } catch (err) {
      console.error("Failed to update socials:", err);
      toast.error("Error updating socials");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserType = async (userType: string) => {
    try {
      const token = await getAccessToken();
      await addUserType(userType, token);
    } catch (err) {
      console.error("Failed to add user type:", err);
      toast.error("Error adding user type");
    }
  };

  return {
    handleSubmit,
    handleUpdateSocials,
    handleAddUserType,
    loading,
  };
}
