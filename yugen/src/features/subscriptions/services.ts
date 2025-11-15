// src/features/subs/services/subsServices.ts
import { api } from "../../lib/api";

export interface Subscription {
  sub: {
    auth_id: string;
    username: string;
    pfp_path?: string;
    films_count?: number;
    sub_count?: number;
  };
}

export async function fetchMySubscriptions(token: string): Promise<Subscription[]> {
  const res = await api.get("/subs/my", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.subscriptions || [];
}

export async function subscribe(authId: string, token: string): Promise<void> {
  await api.post(
    `/subs/${authId}/subscribe`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function unsubscribe(authId: string, token: string): Promise<void> {
  await api.post(
    `/subs/${authId}/unsubscribe`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
export async function subscribeToArtist(artistId: string, token: string) {
  await api.post(
    "/subs",
    { artistId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return { isSubscribed: true, notify: true };
}

// ✅ Unsubscribe from an artist
export async function unsubscribeFromArtist(artistId: string, token: string) {
  await api.delete("/subs", {
    data: { artistId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return { isSubscribed: false, notify: false };
}
// export async function checkSubscription(
//   targetUserId: string,
//   token: string
// ): Promise<boolean> {
//   const res = await api.get(`/subs/${targetUserId}/check`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return res.data?.isSubscribed ?? false;
// }
export async function checkSubscriptionStatus(
  artistId: string,
  token: string
): Promise<{ isSubscribed: boolean; notify: boolean }> {
  const { data } = await api.get("/subs/check", {
    params: { artistId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    isSubscribed: !!data.isSubscribed,
    notify: !!data.notify,
  };
}
