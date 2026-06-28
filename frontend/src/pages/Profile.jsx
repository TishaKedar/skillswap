import { useState, useEffect } from "react";
import { Plus, X, LogOut, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Shell } from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", bio: "", skillsCanTeach: [], skillsWantToLearn: [] });
  const [teach, setTeach] = useState("");
  const [learn, setLearn] = useState("");
  const [saved, setSaved] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        skillsCanTeach: user.skillsCanTeach || [],
        skillsWantToLearn: user.skillsWantToLearn || [],
      });
    }
    if (user?._id) {
      api.get(`/reviews/user/${user._id}`).then((r) => {
        setReviews(r.data.reviews || []);
        setAvgRating(r.data.avgRating || 0);
      }).catch(() => {});
    }
  }, [user]);

  const addSkill = (type) => {
    const val = type === "teach" ? teach.trim() : learn.trim();
    if (!val) return;
    const key = type === "teach" ? "skillsCanTeach" : "skillsWantToLearn";
    if (form[key].map((s) => s.toLowerCase()).includes(val.toLowerCase())) return;
    setForm((f) => ({ ...f, [key]: [...f[key], val] }));
    type === "teach" ? setTeach("") : setLearn("");
  };

  const removeSkill = (type, skill) => {
    const key = type === "teach" ? "skillsCanTeach" : "skillsWantToLearn";
    setForm((f) => ({ ...f, [key]: f[key].filter((s) => s !== skill) }));
  };

  const save = async () => {
    try {
      const res = await api.put("/users/me", form);
      updateUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Shell>
      <div className="px-5 pt-8 pb-4">
        {/* Avatar & header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
            {avgRating > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={12} className={s <= Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
                ))}
                <span className="text-xs text-gray-500 ml-0.5">{avgRating} ({reviews.length})</span>
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-400 mb-1 block uppercase tracking-wide">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Bio */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-400 mb-1 block uppercase tracking-wide">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={2}
            placeholder="Tell others about yourself…"
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Skills */}
        <SkillSection
          title="Skills I Can Teach"
          color="blue"
          skills={form.skillsCanTeach}
          input={teach}
          onInput={setTeach}
          onAdd={() => addSkill("teach")}
          onRemove={(s) => removeSkill("teach", s)}
        />
        <SkillSection
          title="Skills I Want to Learn"
          color="orange"
          skills={form.skillsWantToLearn}
          input={learn}
          onInput={setLearn}
          onAdd={() => addSkill("learn")}
          onRemove={(s) => removeSkill("learn", s)}
        />

        {/* Save */}
        <button
          onClick={save}
          className={`w-full rounded-xl py-3 font-semibold text-sm mb-3 transition ${
            saved ? "bg-green-500 text-white" : "bg-primary text-white"
          }`}
        >
          {saved ? "Saved ✓" : "Save Changes"}
        </button>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-gray-800 mb-3">Reviews</h2>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                      {r.reviewer?.name?.[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm font-medium">{r.reviewer?.name}</p>
                    <div className="ml-auto flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={12} className={s <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-xs text-gray-500 italic">"{r.comment}"</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-sm text-red-500 font-medium py-3 rounded-xl border border-red-100"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </Shell>
  );
}

function SkillSection({ title, color, skills, input, onInput, onAdd, onRemove }) {
  const colors = {
    blue: { bg: "bg-blue-100 text-blue-700", btn: "bg-blue-500" },
    orange: { bg: "bg-orange-100 text-orange-700", btn: "bg-orange-500" },
  };
  const c = colors[color];

  return (
    <div className="mb-5">
      <label className="text-xs font-semibold text-gray-400 mb-2 block uppercase tracking-wide">{title}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.map((s) => (
          <span key={s} className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full ${c.bg}`}>
            {s}
            <button onClick={() => onRemove(s)}><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder="Add a skill…"
          className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button onClick={onAdd} className={`${c.btn} text-white rounded-xl px-3 py-2.5`}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
