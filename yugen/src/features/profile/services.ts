// src/features/profile/services/profileServices.ts
import { api } from "../../lib/api";

export async function updateSocials(
  socials: { Insta?: string; YT?: string; LI?: string },
  token: string
) {
  const res = await api.post("/profile/socials", socials, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function editProfile(formData: FormData, token: string) {
  const res = await api.post("/profile/edit", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}
