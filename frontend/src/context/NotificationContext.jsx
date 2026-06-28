import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import api from "../api/axios";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch {}
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket) return;

    const handler = (notif) => {
      setNotifications((prev) => [
        { ...notif, _id: Date.now(), read: false, createdAt: new Date().toISOString() },
        ...prev,
      ]);
      setToast(notif);
      setTimeout(() => setToast(null), 4000);
    };

    socket.on("notification", handler);
    return () => socket.off("notification", handler);
  }, [socket]);

  const markAllRead = async () => {
    await api.patch("/notifications/read-all").catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, reload: load, toast }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
