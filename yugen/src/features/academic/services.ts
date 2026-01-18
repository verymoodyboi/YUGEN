import { api } from "../../lib/api";

export const fetchAcademicApplication = async (token: string, username: string) => {
  const res = await api.get("/academic", {
    headers: { Authorization: `Bearer ${token}` },
    params: { username },
  });
  return res.data.application;
};

export const submitAcademicApplication = async (token: string, formData: FormData) => {
  const res = await api.post("/academic", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.application;
};

export const deleteAcademicApplication = async (token: string, username: string) => {
  const res = await api.delete("/academic", {
    headers: { Authorization: `Bearer ${token}` },
    params: { username },
  });
  return res.data;
};
