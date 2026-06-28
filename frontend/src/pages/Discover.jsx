import { useEffect, useState, useCallback } from "react";
import { Send, X, Search, Star } from "lucide-react";
import { Shell } from "../components/Shell";
import api from "../api/axios";

export default function Discover() {
  const [tab, setTab] = useState("matches");
  const [matches, setMatches] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ skillOffered: "", skillRequested: "", message: "" });
  const [status, setStatus] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api.get("/users/matches").then((r) => setMatches(r.data)).catch(() => {});
    api.get("/users").then((r) => setAllUsers(r.data)).catch(() => {});
  }, []);

  const handleSearch = useCallback(async () => {
    setSearching(true);
    try {
      const url = searchQuery.trim() ? `/users?skill=${encodeURIComponent(searchQuery.trim())}` : "/users";
      const res = await api.get(url);
      setAllUsers(res.data);
    } catch {} finally {
      setSearching(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (tab !== "all") return;
    const t = setTimeout(handleSearch, 300);
    return () => clearTimeout(t);
  }, [searchQuery, tab, handleSearch]);

  const openRequestModal = (user, suggestedOffer = "", suggestedRequest = "") => {
    setSelected(user);
    setForm({ skillOffered: suggestedOffer, skillRequested: suggestedRequest, message: "" });
    setStatus("");
  };

  const sendRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post("/swaps", { toUser: selected._id, ...form });
      setStatus("sent");
    } catch (err) {
      setStatus(err.response?.data?.message || "Failed to send");
    }
  };

  return (
    <Shell>
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold mb-4">Discover Skills</h1>

        <div className="flex bg-gray-100 rounded-full p-1 mb-4">
          <TabBtn active={tab === "matches"} onClick={() => setTab("matches")}>Suggested</TabBtn>
          <TabBtn active={tab === "all"} onClick={() => setTab("all")}>Browse All</TabBtn>
        </div>

        {tab === "all" && (
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill (e.g. Python, Guitar…)"
              className="w-full bg-gray-50 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {tab === "matches" && (
          <div className="space-y-3">
            {matches.length === 0 && (
              <p className="text-sm text-gray-400 py-4">No matches yet — add skills on your profile.</p>
            )}
            {matches.map((m) => (
              <MatchCard
                key={m.user._id}
                match={m}
                onRequest={() => openRequestModal(m.user, m.youCanTeachThem[0] || "", m.theyCanTeachYou[0] || "")}
              />
            ))}
          </div>
        )}

        {tab === "all" && (
          <div className="space-y-3">
            {searching && <p className="text-sm text-gray-400 py-2">Searching…</p>}
            {!searching && allUsers.length === 0 && (
              <p className="text-sm text-gray-400 py-4">No users found for that skill.</p>
            )}
            {allUsers.map((u) => (
              <UserCard key={u._id} user={u} onRequest={() => openRequestModal(u)} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Swap with {selected.name}</h2>
              <button onClick={() => setSelected(null)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            {status === "sent" ? (
              <div className="py-6 text-center">
                <p className="text-4xl mb-2">🎉</p>
                <p className="text-green-600 font-medium">Request sent!</p>
                <p className="text-sm text-gray-400 mt-1">Track it on the Swaps tab.</p>
                <button
                  onClick={() => setSelected(null)}
                  className="mt-4 w-full bg-primary text-white rounded-xl py-3 font-medium"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={sendRequest} className="space-y-3">
                <input
                  placeholder="Skill you'll teach them"
                  required
                  value={form.skillOffered}
                  onChange={(e) => setForm({ ...form, skillOffered: e.target.value })}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  placeholder="Skill you want from them"
                  required
                  value={form.skillRequested}
                  onChange={(e) => setForm({ ...form, skillRequested: e.target.value })}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  placeholder="Short message (optional)"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                />
                {status && status !== "sent" && <p className="text-red-500 text-sm">{status}</p>}
                <button className="w-full bg-primary text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2">
                  <Send size={16} /> Send Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}

function TabBtn({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-sm font-medium py-2 rounded-full transition ${
        active ? "bg-white shadow text-primary" : "text-gray-400"
      }`}
    >
      {children}
    </button>
  );
}

function RatingStars({ rating, count }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1 mt-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star
          key={s}
          size={10}
          className={s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
      <span className="text-[10px] text-gray-400 ml-0.5">{rating} ({count})</span>
    </div>
  );
}

function MatchCard({ match, onRequest }) {
  const { user, theyCanTeachYou, youCanTeachThem, isMutualSwap } = match;
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold">{user.name}</p>
          <RatingStars rating={user.avgRating} count={user.reviewCount} />
        </div>
        {isMutualSwap && (
          <span className="text-[11px] bg-purple-100 text-primary font-medium px-2 py-0.5 rounded-full">
            Mutual ✨
          </span>
        )}
      </div>
      {theyCanTeachYou.length > 0 && (
        <p className="text-xs text-gray-500 mb-1">
          Can teach you: <span className="font-medium text-gray-700">{theyCanTeachYou.join(", ")}</span>
        </p>
      )}
      {youCanTeachThem.length > 0 && (
        <p className="text-xs text-gray-500 mb-3">
          Wants to learn: <span className="font-medium text-gray-700">{youCanTeachThem.join(", ")}</span>
        </p>
      )}
      <button
        onClick={onRequest}
        className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-medium"
      >
        Send Swap Request
      </button>
    </div>
  );
}

function UserCard({ user, onRequest }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
          {user.name[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm">{user.name}</p>
          <RatingStars rating={user.avgRating} count={user.reviewCount} />
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-1">
        Teaches: <span className="text-gray-700">{user.skillsCanTeach.join(", ") || "—"}</span>
      </p>
      <p className="text-xs text-gray-500 mb-3">
        Wants: <span className="text-gray-700">{user.skillsWantToLearn.join(", ") || "—"}</span>
      </p>
      <button
        onClick={onRequest}
        className="w-full bg-gray-900 text-white rounded-xl py-2.5 text-sm font-medium"
      >
        Send Swap Request
      </button>
    </div>
  );
}
