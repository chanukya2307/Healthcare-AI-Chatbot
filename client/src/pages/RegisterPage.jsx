import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const res = await register(form);

    if (!res.success) {
      setError(res.message);
      return;
    }

    setMessage(res.data.message);
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-950">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-1/2 text-white">
        <h1 className="text-5xl font-bold leading-tight">
          Join the Future of <br /> Healthcare
        </h1>

        <p className="mt-6 text-lg text-slate-300">
          Create your account to access AI-powered healthcare services, manage appointments, and streamline patient care.
        </p>

        <div className="mt-10 space-y-4">
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur">
            🧠 AI Health Assistant
          </div>
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur">
            📅 Smart Appointment System
          </div>
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur">
            🏥 Multi-role Access Control
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center w-full lg:w-1/2 px-6">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">

          <h2 className="text-2xl font-bold text-white mb-6">
            Create account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* NAME */}
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-cyan-400"
            />

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-cyan-400"
            />

            {/* PASSWORD */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-cyan-400"
            />

            {/* ROLE */}
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="user">User</option>
              <option value="hospitalAdmin">Hospital Admin</option>
            </select>

            {/* SUCCESS */}
            {message && (
              <div className="bg-green-500/20 text-green-300 p-3 rounded-xl text-sm">
                {message}
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="bg-red-500/20 text-red-300 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-teal-400 p-3 rounded-xl font-semibold text-black hover:scale-105 transition"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-slate-300 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-400 font-semibold">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}