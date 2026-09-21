import { api } from "../../lib/api";





export const deleteFilm = async (film_uuid: string, token: any) => {
  return api.post(
    "films/delete",
    { film_uuid },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};






export const editFilm = async (formData: FormData, token: string) => {
  return api.post("films/edit", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};



export const searchMentions = async (q: string, token: string) => {
  const encoded = encodeURIComponent(q);
  return api.get(
    `search/mentions/?q=${encoded}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
