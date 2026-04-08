import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form);
    if (res.success) {
      const requestedPath = location.state?.from?.pathname;
      const fallbackPath =
        res.data.user?.role === "superAdmin" ? "/super-admin" : "/dashboard";

      navigate(requestedPath || fallbackPath, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-950">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-1/2 text-white">
        <h1 className="text-5xl font-bold leading-tight">
          AI-Powered <br /> Healthcare Assistant
        </h1>
        <p className="mt-6 text-lg text-slate-300">
          Manage patients, appointments, and AI-assisted diagnosis in one place.
        </p>

        <div className="mt-10 space-y-4">
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur">
            🤖 Smart AI Chatbot
          </div>
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur">
            📅 Appointment Management
          </div>
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur">
            🏥 Multi-role Dashboard
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center w-full lg:w-1/2 px-6">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">

          <h2 className="text-2xl font-bold text-white mb-6">Welcome back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-3 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-cyan-400"
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-3 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-cyan-400"
              onChange={handleChange}
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-400 to-teal-400 p-3 rounded-xl font-semibold text-black hover:scale-105 transition"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-slate-300 mt-4">
            Don’t have an account?{" "}
            <Link to="/register" className="text-cyan-400 font-semibold">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
