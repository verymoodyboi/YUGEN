import { api } from "../../lib/api";

export const initializeUpload = async (token: any, payload: any) => {
  const res = await api.post("/films/initialize-upload", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; 
};

export const uploadToR2WithProgress = (
  signedUrl: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        const percent = Math.round((evt.loaded * 100) / evt.total);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
};


export const processUpload = async (token: any, filmId: string) => {
  return api.post(
    "/films/process-upload",
    { filmUuid: filmId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};



export const deleteFilm = async (token: any, film_uuid: string) => {
  const res = await api.post(
    "/films/delete",
    { film_uuid },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
};