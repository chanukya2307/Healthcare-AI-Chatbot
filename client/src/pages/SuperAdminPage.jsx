import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../hooks/useAuth.jsx";

export default function SuperAdminPage() {
  const { user, logout } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [{ data: adminsData }, { data: usersData }] = await Promise.all([
        api.get("/api/admin/hospital-admins"),
        api.get("/api/admin/users"),
      ]);

      setAdmins(adminsData.hospitalAdmins || []);
      setUsers(usersData.users || []);
    } catch {
      setAdmins([]);
      setUsers([]);
      setMessage("Unable to load the super admin overview right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const updateAdmin = async (id, action) => {
    try {
      const { data } = await api.patch(`/api/admin/${action}-hospital-admin/${id}`);
      setMessage(data.message);
      await loadData();
    } catch {
      setMessage("Unable to update hospital admin right now.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const approvedCount = admins.filter((item) => item.isApproved).length;
  const pendingCount = admins.filter((item) => !item.isApproved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="space-y-6">
          <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
                  Super Admin Control
                </div>
                <div>
                  <h1 className="text-3xl font-bold sm:text-4xl">
                    Welcome, {user?.name || "Super Admin"}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                    Review all users, manage hospital admin approvals, and keep the
                    platform organized from one dedicated workspace.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 font-medium text-white transition hover:bg-white/15"
                  onClick={() => navigate("/super-admin")}
                  type="button"
                >
                  Refresh Overview
                </button>
                <button
                  className="rounded-2xl bg-red-500 px-4 py-2.5 font-semibold text-white transition hover:bg-red-400"
                  onClick={handleLogout}
                  type="button"
                >
                  Logout
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Users" value={users.length} accent="cyan" />
            <StatCard title="Hospital Admins" value={admins.length} accent="indigo" />
            <StatCard title="Approved Admins" value={approvedCount} accent="emerald" />
            <StatCard title="Pending Admins" value={pendingCount} accent="amber" />
          </section>

          {message ? (
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-cyan-100 shadow-lg backdrop-blur-xl">
              {message}
            </div>
          ) : null}

          <section className="grid gap-6 xl:grid-cols-[1.25fr,0.95fr]">
            <div className="space-y-4 rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Hospital Admins</h2>
                  <p className="text-sm leading-6 text-slate-300">
                    Approve or reject hospital admins directly from this list.
                  </p>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
                  Live Approval Queue
                </p>
              </div>

              {loading ? (
                <EmptyState message="Loading hospital admins..." />
              ) : admins.length ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {admins.map((admin) => (
                    <div
                      key={admin._id}
                      className="rounded-2xl border border-white/10 bg-slate-950/25 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold">{admin.name}</h3>
                          <p className="mt-1 text-sm text-slate-400">{admin.email}</p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                            admin.isApproved
                              ? "bg-emerald-400/15 text-emerald-200"
                              : "bg-amber-300/15 text-amber-100"
                          }`}
                        >
                          {admin.isApproved ? "Approved" : "Pending"}
                        </span>
                      </div>

                      <div className="mt-5 flex gap-3">
                        {!admin.isApproved ? (
                          <>
                            <button
                              className="flex-1 rounded-xl bg-emerald-400 py-2.5 font-semibold text-black transition hover:bg-emerald-300"
                              onClick={() => updateAdmin(admin._id, "approve")}
                              type="button"
                            >
                              Approve
                            </button>
                            <button
                              className="flex-1 rounded-xl bg-amber-300 py-2.5 font-semibold text-black transition hover:bg-amber-200"
                              onClick={() => updateAdmin(admin._id, "reject")}
                              type="button"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            className="flex-1 rounded-xl bg-amber-300 py-2.5 font-semibold text-black transition hover:bg-amber-200"
                            onClick={() => updateAdmin(admin._id, "reject")}
                            type="button"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No hospital admins available." />
              )}
            </div>

            <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">All Users</h2>
                  <p className="text-sm leading-6 text-slate-300">
                    View all registered users on the platform.
                  </p>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
                  User Directory
                </p>
              </div>

              {loading ? (
                <EmptyState message="Loading users..." className="mt-4" />
              ) : users.length ? (
                <div className="mt-4 space-y-3">
                  {users.map((platformUser) => (
                    <div
                      key={platformUser._id}
                      className="rounded-2xl border border-white/10 bg-slate-950/25 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-white">{platformUser.name}</h3>
                          <p className="mt-1 text-sm text-slate-400">{platformUser.email}</p>
                        </div>
                        <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                          User
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No users found yet." className="mt-4" />
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, accent }) {
  const accentStyles = {
    cyan: "from-cyan-400/20 to-slate-900 text-cyan-100",
    indigo: "from-indigo-400/20 to-slate-900 text-indigo-100",
    emerald: "from-emerald-400/20 to-slate-900 text-emerald-100",
    amber: "from-amber-300/20 to-slate-900 text-amber-100",
  };

  return (
    <div
      className={`rounded-2xl border border-white/15 bg-gradient-to-br p-5 shadow-lg ${accentStyles[accent]}`}
    >
      <p className="text-sm text-slate-300">{title}</p>
      <h2 className="mt-3 text-3xl font-bold text-white">{value}</h2>
    </div>
  );
}

function EmptyState({ message, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-white/10 bg-slate-950/20 p-5 text-sm text-slate-300 ${className}`}
    >
      {message}
    </div>
  );
}
