import { useState, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../components/toaster";
import { api } from "../../../lib/api";
import { useNavigate } from "react-router-dom";
import supabase from "../../../lib/supabaseClient";

export const useDeleteAccount = () => {
  const { getAccessToken, userInfo } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = useCallback(async () => {
    if (!userInfo?.auth_id) {
      toast.error("Not signed in");
      return;
    }

    setIsDeleting(true);
    try {
      const token = await getAccessToken();
      await api.post(
        "/register/delete", 
        { userID: userInfo.auth_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // clear local session since the auth user no longer exists
      await supabase.auth.signOut();

      toast.success("Account deleted");
      navigate("/about");
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  }, [getAccessToken, userInfo, toast, navigate]);

  return { handleDeleteAccount, isDeleting };
};