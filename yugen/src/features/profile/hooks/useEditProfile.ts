import { useState } from "react";
import { addUserType, editProfile, updateSocials } from "../services";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";

export function useEditProfile(onSuccess?: () => void) {
  const { getAccessToken } = useAuth();
  const [loading, setLoading] = useState(false);

  // --- main profile update (profile + socials) ---
  const handleSubmit = async (
    formData: FormData,
    socials: { Insta?: string; YT?: string; LI?: string }
  ) => {
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

  // --- 🔹 new standalone socials update ---
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
const handleAddUserType= async(  userType: string
)=>{
  const token = await getAccessToken()
  await addUserType(userType,token)
}
  return { handleSubmit, handleUpdateSocials, loading,handleAddUserType };
}
