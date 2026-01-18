import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchNotifications } from "./services";

export function useNotifications() {
  const { getAccessToken } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const handleFetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const token = await getAccessToken();
      const data = await fetchNotifications(token);
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  return {
    notifications,
    notificationsLoading,
    handleFetchNotifications,
  };
}
