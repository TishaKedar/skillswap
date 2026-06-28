import { Shell } from "../components/Shell";
import { useNotifications } from "../context/NotificationContext";
import { Bell, MessageCircle, Star, Repeat, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const iconMap = {
  swap_request: <Repeat size={18} className="text-purple-500" />,
  swap_accepted: <Repeat size={18} className="text-green-500" />,
  swap_rejected: <Repeat size={18} className="text-red-400" />,
  new_message: <MessageCircle size={18} className="text-blue-500" />,
  new_review: <Star size={18} className="text-yellow-500" />,
};

export default function Notifications() {
  const { notifications, unreadCount, markAllRead, reload } = useNotifications();
  const navigate = useNavigate();

  const handleClick = async (n) => {
    if (!n.read) {
      await api.patch(`/notifications/${n._id}/read`).catch(() => {});
      reload();
    }
    if (n.type === "new_message" && n.relatedId) {
      navigate(`/chat/${n.relatedId}`);
    } else if (["swap_request", "swap_accepted", "swap_rejected"].includes(n.type)) {
      navigate("/swaps");
    }
  };

  return (
    <Shell>
      <div className="px-5 pt-8 pb-4">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-primary font-medium"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-16">
            <Bell size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No notifications yet</p>
          </div>
        )}

        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => handleClick(n)}
              className={`w-full text-left flex items-start gap-3 rounded-2xl p-4 transition ${
                n.read ? "bg-gray-50" : "bg-purple-50 border border-purple-100"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {iconMap[n.type] || <Bell size={18} className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                {n.body && <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>}
                <p className="text-[10px] text-gray-300 mt-1">
                  {new Date(n.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
              )}
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}
