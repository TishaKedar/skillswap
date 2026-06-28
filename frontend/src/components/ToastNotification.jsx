import { useNotifications } from "../context/NotificationContext";
import { Bell, MessageCircle, Star, Repeat } from "lucide-react";

const icons = {
  swap_request: <Repeat size={16} className="text-purple-500" />,
  swap_accepted: <Repeat size={16} className="text-green-500" />,
  swap_rejected: <Repeat size={16} className="text-red-500" />,
  new_message: <MessageCircle size={16} className="text-blue-500" />,
  new_review: <Star size={16} className="text-yellow-500" />,
};

export default function ToastNotification() {
  const { toast } = useNotifications();
  if (!toast) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] w-[90vw] max-w-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-start gap-3 animate-slide-down">
        <div className="mt-0.5">{icons[toast.type] || <Bell size={16} />}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{toast.title}</p>
          {toast.body && <p className="text-xs text-gray-500 truncate">{toast.body}</p>}
        </div>
      </div>
    </div>
  );
}
