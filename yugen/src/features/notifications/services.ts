// src/features/notifications/notificationServices.ts
import { api } from "../../lib/api";

export async function checkNotifications(token: string): Promise<boolean> {
  const res = await api.get("/notifications/check", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.enabled ?? false;
}

export async function toggleNotifyStatus(
  artistId: string,
  notify: boolean,
  token: string
): Promise<void> {
  await api.put(
    "/subs/notify",
    { artistId, notify },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function fetchNotifications(token: string) {
  const { data } = await api.get("/subs/notifications", {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Normalize so it's always an array
  return data.films || data || [];
}