// src/features/profile/services/profileServices.ts
import { api } from "../../lib/api";

export async function updateSocials(
  socials: { Insta?: string; YT?: string; LI?: string },
  token: any
) {
  const res = await api.post("/profile/socials", socials, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// src/features/profile/services/profileServices.ts

export async function editProfile(
  payload: {
    FName: string;
    LName: string;
    UserName: string;
    Bio: string;
    Gender: string;
    Region: string;
    pfpContentType?: string;
  },
  token: string
) {
  const res = await api.post("/profile/edit", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data as {
    message: string;
    uploadUrl?: string | null;
  };
}



export async function addUserType(
  userType:string,
  token: any
) {
  const res = await api.post("/profile/type", {userType}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}


export async function fetchMyUploads({
  pageParam = 0,
  uploaderID,
}: {
  pageParam?: number;
  uploaderID: string;
}) {
  const res = await api.get("/view_profile/myUploads", {
    params: { offset: pageParam, limit: 10, uploaderID },
  });
  return res.data;
}