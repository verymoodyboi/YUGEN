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


export async function editProfile(
  payload: {
    authId:string;
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

//enque compress pfp after editting
export async function compressEditedPFP(
  payload: {
    authId:string;
  },
  token: string
) {
  const res = await api.post("/profile/edit_helper_pfp_compress", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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