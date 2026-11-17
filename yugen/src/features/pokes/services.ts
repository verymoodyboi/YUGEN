import { api } from "../../lib/api";

export interface PokeUser {
  auth_id: string;
  username: string;
  pfp_path?: string;
}

export interface SentPoke {
  id: string;
  poked_id: string; // receiver
  accepted: boolean;
  seen: boolean;
  created_at: string;
  receiver?: PokeUser;
}

export interface ReceivedPoke {
  id: string;
  poker_id: string; // sender
  accepted: boolean;
  seen: boolean;
  created_at: string;
  sender?: PokeUser;
}

export interface UserPokesResponse {
  sent: SentPoke[];
  received: ReceivedPoke[];
}

/**
 * Fetch all user pokes (sent + received)
 */
export async function fetchUserPokes(
  token: string
): Promise<UserPokesResponse> {
  const res = await api.get("/pokes/user-pokes", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    sent: res.data.sent || [],
    received: res.data.received || [],
  };
}

/**
 * Send a poke
 */
export async function sendPoke(
  targetId: string,
  token: string
): Promise<void> {
  await api.post(
    "/pokes/poke",
    { targetId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/**
 * Accept a poke
 */
export async function acceptPoke(
  pokeId: string,
  token: string
): Promise<void> {
  await api.put(
    "/pokes/accept-poke",
    { pokeId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/**
 * Delete / cancel a poke
 */
export async function deletePoke(
  pokeId: string,
  token: string
): Promise<void> {
  await api.delete("/pokes/delete", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: { pokeId },
  });
}

/**
 * OPTIONAL — Only if you insist on backend status endpoint
 */
export async function fetchPokeStatus(
  profileUserId: string,
  token: string
): Promise<{
  status: "none" | "sent" | "received" | "accepted";
  pokeId: string | null;
}> {
  const res = await api.get("/pokes/status", {
    params: { profileUserId },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

// services/pokeService.ts

export async function rejectPoke(
  pokeId: string,
  getAccessToken: () => Promise<string>
) {
  const token = await getAccessToken();

  const res = await api.delete(
    `/pokes/reject/${pokeId}`,
    {
      headers: {
      Authorization: `Bearer ${token}`,
    },
    }
  );


}