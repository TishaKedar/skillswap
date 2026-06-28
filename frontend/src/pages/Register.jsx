import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    skillsCanTeach: "",
    skillsWantToLearn: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toArray = (str) =>
    str.split(",").map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        skillsCanTeach: toArray(form.skillsCanTeach),
        skillsWantToLearn: toArray(form.skillsWantToLearn),
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primaryLight via-primary to-primaryDark px-6 py-10">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold mb-1">Join SkillSwap</h1>
        <p className="text-gray-400 text-sm mb-6">Trade what you know for what you want to learn</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Full name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            placeholder="Skills you can teach (comma separated)"
            value={form.skillsCanTeach}
            onChange={(e) => setForm({ ...form, skillsCanTeach: e.target.value })}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            placeholder="Skills you want to learn (comma separated)"
            value={form.skillsWantToLearn}
            onChange={(e) => setForm({ ...form, skillsWantToLearn: e.target.value })}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-xl py-3 font-medium disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
