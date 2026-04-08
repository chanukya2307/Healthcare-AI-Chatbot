import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../hooks/useAuth.jsx";

export default function MyAppointmentsPage() {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadAppointments = async () => {
      try {
        const { data } = await api.get("/api/appointments/my-appointments");
        if (isMounted) {
          setAppointments(data.appointments || []);
          setError("");
        }
      } catch (requestError) {
        if (isMounted) {
          setAppointments([]);
          setError(
            requestError.response?.data?.message ||
              "Unable to load appointments right now."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const approvedCount = appointments.filter(
    (appointment) => appointment.status === "approved"
  ).length;
  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-950 text-white lg:flex">
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-white/5 p-6 lg:flex">
        <h2 className="mb-8 text-xl font-bold text-cyan-400">HealthAI</h2>

        <nav className="space-y-4 text-sm">
          <button
            className="block w-full cursor-pointer text-left text-slate-300 transition hover:text-cyan-400"
            onClick={() => navigate("/dashboard")}
            type="button"
          >
            Dashboard
          </button>
          <button
            className="block w-full cursor-pointer text-left text-white transition hover:text-cyan-400"
            type="button"
          >
            My Appointments
          </button>
        </nav>

        <button
          className="mt-auto rounded-xl bg-red-500 py-2 font-medium text-white transition hover:bg-red-400"
          onClick={handleLogout}
          type="button"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
            <h1 className="text-3xl font-bold">My Appointments</h1>
            <p className="mt-1 text-sm text-slate-300">
              Track all bookings for {user?.name || "your account"}.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <StatCard title="Total" value={appointments.length} />
            <StatCard title="Approved" value={approvedCount} />
            <StatCard title="Pending" value={pendingCount} />
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Appointment History</h2>
                <p className="text-sm text-slate-400">
                  Review upcoming and past requests in one place.
                </p>
              </div>
              <button
                className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-black transition hover:bg-cyan-300"
                onClick={() => navigate("/dashboard")}
                type="button"
              >
                Back to Dashboard
              </button>
            </div>

            {loading ? (
              <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-300">
                Loading appointments...
              </div>
            ) : null}

            {!loading && error ? (
              <div className="rounded-xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            {!loading && !error ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {appointments.length ? (
                  appointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="rounded-2xl border border-white/10 bg-slate-950/30 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {appointment.hospitalAdminId?.name || "Hospital"}
                          </h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {appointment.hospitalAdminId?.email || "No email available"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                            appointment.status === "approved"
                              ? "bg-emerald-400/15 text-emerald-200"
                              : appointment.status === "rejected"
                              ? "bg-rose-400/15 text-rose-200"
                              : "bg-amber-300/15 text-amber-100"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      <p className="mt-4 text-sm text-slate-300">
                        Scheduled for {new Date(appointment.date).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-sm text-slate-300 lg:col-span-2">
                    No appointments yet. Book your first appointment from the dashboard.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow-lg transition hover:scale-[1.02]">
      <p className="text-sm text-slate-400">{title}</p>
      <h2 className="mt-2 text-3xl font-bold">{value}</h2>
    </div>
  );
}
