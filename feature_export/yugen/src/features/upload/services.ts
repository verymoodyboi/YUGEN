// src/features/upload/services.ts
import { api } from "../../lib/api"; // your axios instance with baseURL + token handling

// === Upload film ===
export const uploadFilm = async (
  token: string,
  formData: FormData,
  onProgress?: (percent: number) => void
) => {
  const res = await api.post("/films/upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (evt) => {
      if (evt.total && onProgress) {
        const percent = Math.round((evt.loaded * 100) / evt.total);
        onProgress(percent);
      }
    },
  });
  return res.data;
};

// === Mention search ===
