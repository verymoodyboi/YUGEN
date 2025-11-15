// src/features/thought/services.ts
import { api } from "../../lib/api";

const BASE = "/thoughts";

/* Return the full backend payload (not just .thoughts) so callers can read
   per-user vote maps returned by the server: upvotes/downvotes/upvoteReplies/downvoteReplies */
export async function getThoughts(filmId: number, token?: string) {
  const res = await api.get(`${BASE}/${filmId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  // return the full data object (controller/service returns { thoughts, upvotes, downvotes, upvoteReplies, downvoteReplies })
  return res.data ?? {};
}

export async function addThought(
  filmId: number,
  rating: number,
  comment: string | null,
  token: string
) {
  return api.post(
    `${BASE}/add`,
    { film_uuid: filmId, rating, comment },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function deleteThought(thoughtId: number, token: string) {
  return api.post(
    `${BASE}/delete`,
    { id: thoughtId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function voteThought(type: "upvote" | "downvote", payload: any, token: string) {
  return api.post(`${BASE}/${type}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/* Replies */
export async function addReply(thoughtId: number, comment: string, token: string) {
  return api.post(
    `${BASE}/replies/add`,
    { thoughtId, comment },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function deleteReply(replyId: number, token: string) {
  return api.post(
    `${BASE}/replies/delete`,
    { replyId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function voteReply(type: "upvote" | "downvote", payload: any, token: string) {
  return api.post(`${BASE}/replies/${type}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function flagThought(thoughtId: string, reason: string, token: string) {
  return api.post(
    `/thoughts/flag`,
    { thoughtId, reason }, // must match backend req.body
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function flagReply(replyId: string, reason: string, token: string) {
  return api.post(
    `/thoughts/replies/flag`,
    { replyId, reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}