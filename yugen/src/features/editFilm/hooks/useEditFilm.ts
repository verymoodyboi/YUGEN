import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import * as services from "../services";



export const useEditFilmApi = () => {
  const { getAccessToken } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchUsers = async () => {
        if (!searchInput.trim()) {
          setSearchResults([]);
          return;
        }
        setLoadingUsers(true);
        try {
          const token = await getAccessToken();
          const res = await services.searchMentions(searchInput, token);
          const formatted = (res.data.users || []).map((user: any) => ({
            username: user.username,
            pfp: user.pfp_path,
          }));
          setSearchResults(formatted);
        } catch (err) {
          console.error("Frontend search error:", err);
          setSearchResults([]);
        } finally {
          setLoadingUsers(false);
        }
      };

      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const submitEdit = async (formData: FormData) => {
    setIsSaving(true);
    try {
      const token = await getAccessToken();
      await services.editFilm(formData, token);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteFilmByUuid = async (film_uuid: string) => {
    setIsSaving(true);
    try {
      const token = await getAccessToken();
      await services.deleteFilm(film_uuid, token);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    searchInput,
    setSearchInput,
    searchResults,
    loadingUsers,
    isSaving,
    setIsSaving,
    submitEdit,
    deleteFilmByUuid,
  };
};

export default useEditFilmApi;
