import { Home, Search, Repeat, User, Bell } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

export function Shell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white w-full max-w-3xl mx-auto relative">
      <div className="flex-1 overflow-y-auto pb-20">{children}</div>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const { unreadCount } = useNotifications();

  const items = [
    { to: "/dashboard", icon: Home, label: "Home" },
    { to: "/discover", icon: Search, label: "Discover" },
    { to: "/swaps", icon: Repeat, label: "Swaps" },
    { to: "/notifications", icon: Bell, label: "Alerts", badge: unreadCount },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl bg-white border-t flex justify-between px-6 py-3 z-50">
      {items.map(({ to, icon: Icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] relative ${
              isActive ? "text-primary" : "text-gray-300"
            }`
          }
        >
          <div className="relative">
            <Icon size={20} />
            {badge > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </div>
          {label}
        </NavLink>
      ))}
    </div>
  );
}
