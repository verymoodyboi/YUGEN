// src/features/challenges/services/challengeServices.ts
import { api } from "../../lib/api";

/**
 * --- Public routes ---
 */
export async function listAdminChallenges() {
  const res = await api.get("/challenges");
  return res.data;
}

export async function listCommunityChallenges() {
  const res = await api.get("/challenges/community-challenges");
  return res.data;
}

export async function listAcademicChallenges() {
  const res = await api.get("/challenges/academic-challenges");
  return res.data;
}

export async function listUserChallenges() {
  const res = await api.get("/challenges/user-challenges");
  return res.data;
}
export async function fetchUserChallenges({
  pageParam = 0,
  auth_id,
}: {
  pageParam?: number;
  auth_id: string;
}) {
  const { data } = await api.get("/challenges/user-challenges", {
    params: { offset: pageParam, limit: 10, auth_id },
  });
  return data;
}
/**
 * --- Authenticated routes ---
 */
export async function getMyFilms(token: string) {
  const res = await api.get("/challenges/my/films", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getChallenge(id: string, token: string) {
  const res = await api.get(`/challenges/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getChallengeFilms(id: string, token: string) {
  const res = await api.get(`/challenges/${id}/films`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getSubmission(id: string, token: string) {
  const res = await api.get(`/challenges/${id}/submission`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * --- Submissions ---
 */
export async function submitFilm(id: string, filmData: any, token: string) {
  const res = await api.post(`/challenges/${id}/submit`, filmData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function removeSubmission(id: string, token: string) {
  const res = await api.delete(`/challenges/${id}/remove`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * --- Voting ---
 */
export async function getVote(id: string, token: string) {
  const res = await api.get(`/challenges/${id}/vote`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function toggleVote(id: string, token: string) {
  const res = await api.post(
    `/challenges/${id}/vote`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

/**
 * --- Creation & management ---
 */
export async function createChallenge(formData: FormData, token: string) {
  const res = await api.post("/challenges/create", formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function editChallenge(id: string, payload: any, token: string) {
  const res = await api.put(`/challenges/${id}/edit`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * --- Admin / owner moderation ---
 */
export async function getPendingFilms(id: string, token: string) {
  const res = await api.get(`/challenges/${id}/pending-films`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function acceptFilm(id: string, filmUuid: string, token: string) {
  const res = await api.put(
    `/challenges/${id}/films/${filmUuid}/accept`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function removeFilm(id: string, filmUuid: string, token: string) {
  const res = await api.delete(`/challenges/${id}/films/${filmUuid}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * --- Podium ---
 */
export async function getPodium(id: string, token: string) {
  const res = await api.get(`/challenges/${id}/podium`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function savePodium(id: string, data: any, token: string) {
  const res = await api.post(`/challenges/${id}/podium/save`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// src/services/challengeService.ts

export const ChallengeService = {
  async getChallenge(id: string) {
    const { data } = await api.get(`/challenges/${id}`);
    return data.challenge;
  },

  async getChallengeFilms(id: string) {
    const { data } = await api.get(`/challenges/${id}/films`);
    return data.films || [];
  },

  async getPendingFilms(id: string) {
    const { data } = await api.get(`/challenges/${id}/pending-films`);
    return data.films || [];
  },

  async getPodiumFilms(id: string) {
    const { data } = await api.get(`/challenges/${id}/podium`);
    return data.podium || [];
  },


  

  async getUserVote(id: string) {
    const { data } = await api.get(`/challenges/${id}/vote`);
    return data.vote;
  },

  async getSubmittedFilm(id: string) {
    const { data } = await api.get(`/challenges/${id}/submission`);
    return data.submission;
  },

  async removeFilm(challengeId: string, filmUuid: string) {
    await api.delete(`/challenges/${challengeId}/films/${filmUuid}`);
  },

  async acceptFilm(challengeId: string, filmUuid: string) {
    await api.put(`/challenges/${challengeId}/films/${filmUuid}/accept`, {});
  },

  async saveChallenge(challengeId: string, rules: string[], deadline?: string | null) {
    await api.put(`/challenges/${challengeId}/edit`, {
      rules,
      deadlineExtension: deadline,
    });
  },

  async vote(challengeId: string, filmUuid: string) {
    const { data } = await api.post(`/challenges/${challengeId}/vote`, { film_uuid: filmUuid });
    return data.vote;
  },

  async removeSubmission(challengeId: string, filmUuid: string) {
    await api.delete(`/challenges/${challengeId}/remove`, {
      data: { film_uuid: filmUuid },
    });
  },

async getUserFilms(token: string) {
  const { data } = await api.get("/challenges/my/films", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.films || [];
},

async submitFilm(challengeId: string, film_uuid: string, token: string) {
  const { data } = await api.post(
    `/challenges/${challengeId}/submit`,
    { film_uuid },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data.submission;
},

  async savePodium(challengeId: string, podium: { rank: number; film_uuid: string }[]) {
    const { data } = await api.post(`/challenges/${challengeId}/podium/save`, { podium });
    return data;
  },


};


