import { useEffect, useState } from "react";
import { ChevronRight, Zap, BookOpen, Repeat, Star, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shell } from "../components/Shell";
import api from "../api/axios";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [swaps, setSwaps] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/swaps").then((r) => setSwaps(r.data)).catch(() => {}),
      api.get("/users/matches").then((r) => setMatches(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const accepted = swaps.filter((s) => s.status === "accepted").length;
  const pending = swaps.filter((s) => s.status === "pending").length;
  const topMatches = matches.slice(0, 3);

  return (
    <Shell>
      <div className="px-5 pt-8 pb-4 w-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-0.5">Good to see you!</p>
            <h1 className="text-2xl font-bold leading-tight">
              Hey {user?.name?.split(" ")[0] || "there"} 👋
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white text-sm">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatCard icon={<BookOpen size={18} className="text-blue-500" />} value={user?.skillsCanTeach?.length || 0} label="Can Teach" bg="bg-blue-50" />
          <StatCard icon={<Zap size={18} className="text-orange-500" />} value={user?.skillsWantToLearn?.length || 0} label="Want Learn" bg="bg-orange-50" />
          <StatCard icon={<Repeat size={18} className="text-purple-500" />} value={matches.length} label="Matches" bg="bg-purple-50" />
        </div>

        {/* Active / Pending */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-primary rounded-2xl p-4 text-white">
            <p className="text-xs opacity-70 mb-1">Active swaps</p>
            <p className="text-xl font-bold">{accepted}</p>
          </div>
          <div className="bg-violet-500 rounded-2xl p-4 text-white">
            <p className="text-xs opacity-70 mb-1">Pending</p>
            <p className="text-xl font-bold">{pending}</p>
          </div>
        </div>

        {/* Recommendation Feed */}
        {topMatches.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">Recommended for You</h2>
              <button
                onClick={() => navigate("/discover")}
                className="text-xs text-primary font-medium flex items-center gap-0.5"
              >
                See all <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {topMatches.map((m) => (
                <RecommendCard key={m.user._id} match={m} onClick={() => navigate("/discover")} />
              ))}
            </div>
          </>
        )}

        {topMatches.length === 0 && !loading && (
          <div className="bg-purple-50 rounded-2xl p-4 flex items-center gap-3 mb-5">
            <Zap size={20} className="text-yellow-500 shrink-0" />
            <p className="text-sm text-gray-600">Add skills to your profile to see personalized matches</p>
          </div>
        )}

        {/* Recent Activity */}
        <h2 className="font-bold text-gray-900 mb-3">Recent Activity</h2>
        {swaps.length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet — head to Discover to find a match.</p>
        ) : (
          <div className="space-y-2">
            {swaps.slice(0, 5).map((s) => (
              <div
                key={s._id}
                className="flex items-center justify-between bg-gray-50 rounded-xl p-3 cursor-pointer"
                onClick={() => s.status === "accepted" && navigate(`/chat/${s._id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {s.fromUser?.name} ↔ {s.toUser?.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {s.skillOffered} for {s.skillRequested}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {s.status === "accepted" && (
                    <MessageCircle size={14} className="text-primary" />
                  )}
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

function StatCard({ icon, value, label, bg }) {
  return (
    <div className={`${bg} rounded-2xl py-3 flex flex-col items-center`}>
      {icon}
      <span className="font-bold mt-1 text-lg">{value}</span>
      <span className="text-[10px] text-gray-400 text-center">{label}</span>
    </div>
  );
}

function RecommendCard({ match, onClick }) {
  const { user, theyCanTeachYou, youCanTeachThem, isMutualSwap } = match;
  return (
    <div
      className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4 cursor-pointer border border-purple-100"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold">{user.name}</p>
            {user.avgRating > 0 && (
              <div className="flex items-center gap-0.5">
                <Star size={10} className="text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] text-gray-500">{user.avgRating} ({user.reviewCount})</span>
              </div>
            )}
          </div>
        </div>
        {isMutualSwap && (
          <span className="text-[10px] bg-primary text-white font-medium px-2 py-0.5 rounded-full">
            Mutual ✨
          </span>
        )}
      </div>
      {theyCanTeachYou.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          Teaches: <span className="font-medium text-gray-700">{theyCanTeachYou.join(", ")}</span>
        </p>
      )}
      {youCanTeachThem.length > 0 && (
        <p className="text-xs text-gray-500">
          Wants: <span className="font-medium text-gray-700">{youCanTeachThem.join(", ")}</span>
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors[status]}`}>
      {status}
    </span>
  );
}
