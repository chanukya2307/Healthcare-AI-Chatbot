import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../hooks/useAuth.jsx";

const roleCopy = {
  user: "Patient workspace",
  hospitalAdmin: "Hospital admin workspace",
  superAdmin: "Super admin workspace",
};

function formatResponse(text) {
  if (!text) {
    return [];
  }

  const sanitized = text.replace(/\*\*/g, "").trim();

  return sanitized
    .split(/\r?\n|(?<=\.)\s+(?=[A-Z])/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

function normalizeHistory(history) {
  return (history || []).map((message) => ({
    ...message,
    timestamp: message.timestamp || new Date().toISOString(),
  }));
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(user);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const { data } = await api.get("/api/protected/me");
        if (isMounted) {
          setProfile(data.user);
        }
      } catch {
        // Keep the persisted user if the refresh request fails.
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayUser = profile || user;

  if (displayUser?.role === "superAdmin") {
    return <Navigate to="/super-admin" replace />;
  }

  const sidebarItems =
    displayUser?.role === "hospitalAdmin"
      ? [
          { label: "Dashboard", active: true, onClick: () => navigate("/dashboard") },
          {
            label: "Appointment Requests",
            active: false,
            onClick: () => navigate("/dashboard"),
          },
        ]
      : [
          { label: "Dashboard", active: true, onClick: () => navigate("/dashboard") },
          {
            label: "My Appointments",
            active: false,
            onClick: () => navigate("/my-appointments"),
          },
          {
            label: "AI Assistant",
            active: false,
            onClick: () => navigate("/dashboard"),
          },
        ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-950 text-white lg:flex">
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-white/5 p-6 lg:flex">
        <h2 className="mb-8 text-xl font-bold text-cyan-400">HealthAI</h2>

        <nav className="space-y-4 text-sm">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`block w-full cursor-pointer text-left transition hover:text-cyan-400 ${
                item.active ? "text-white" : "text-slate-300"
              }`}
              onClick={item.onClick}
              type="button"
            >
              {item.label}
            </button>
          ))}
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
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
            <h1 className="text-3xl font-bold">Welcome, {displayUser?.name || "User"}</h1>
            <p className="mt-1 text-sm text-slate-300">
              {roleCopy[displayUser?.role] || displayUser?.role || "Dashboard"}
            </p>
          </div>

          {displayUser?.role === "user" ? (
            <UserDashboard />
          ) : displayUser?.role === "hospitalAdmin" ? (
            <HospitalAdminDashboard />
          ) : (
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-slate-300 backdrop-blur-xl">
              {displayUser?.role === "superAdmin"
                ? "Use the dedicated super admin page for approvals."
                : "No dashboard is available for this account yet."}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function UserDashboard() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [hospitalAdmins, setHospitalAdmins] = useState([]);
  const [booking, setBooking] = useState({
    hospitalAdminId: "",
    date: "",
  });
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [chatError, setChatError] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const endRef = useRef(null);
  const recognitionRef = useRef(null);
  const minAppointmentDateTime = getMinDateTimeValue();
  const conversationStorageKey = "chatConversationId";

  const loadAppointments = async () => {
    try {
      const { data } = await api.get("/api/appointments/my-appointments");
      setAppointments(data.appointments);
    } catch {
      setAppointments([]);
    }
  };

  const loadHospitalAdmins = async () => {
    try {
      const { data } = await api.get("/api/appointments/hospital-admins");
      setHospitalAdmins(data.hospitalAdmins);
    } catch {
      setHospitalAdmins([]);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadAppointments();
      loadHospitalAdmins();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const savedConversationId = localStorage.getItem(conversationStorageKey);

    if (!savedConversationId) {
      return;
    }

    let isMounted = true;

    const loadChatHistory = async () => {
      setLoadingHistory(true);

      try {
        const { data } = await api.get(`/chat/${savedConversationId}`);

        if (isMounted) {
          setConversationId(data.conversationId);
          setMessages(normalizeHistory(data.history));
        }
      } catch {
        if (isMounted) {
          localStorage.removeItem(conversationStorageKey);
        }
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    };

    loadChatHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    setSpeechSupported(Boolean(SpeechRecognition));

    if (!SpeechRecognition) {
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setInput((current) => (current ? `${current.trim()} ${transcript}` : transcript));
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setChatError("Voice input could not be completed on this browser.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingChat]);

  const handleBookingChange = (event) => {
    const { name, value } = event.target;
    setBooking((current) => ({ ...current, [name]: value }));
  };

  const handleBookAppointment = async (event) => {
    event.preventDefault();
    setBookingMessage("");
    setBookingError("");

    try {
      const selectedDate = new Date(booking.date);

      if (!booking.date || Number.isNaN(selectedDate.getTime())) {
        setBookingError("Please select a valid appointment date and time.");
        return;
      }

      if (selectedDate < new Date()) {
        setBookingError("Appointment date must be today or later.");
        return;
      }

      const { data } = await api.post("/api/appointments/book", {
        ...booking,
        date: selectedDate.toISOString(),
      });

      setBooking({ hospitalAdminId: "", date: "" });
      setBookingMessage(data.message);
      await loadAppointments();
    } catch (error) {
      setBookingError(
        error.response?.data?.message || "Unable to book appointment."
      );
    }
  };

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }

    const outgoing = input.trim();
    setMessages((prev) => [
      ...prev,
      { role: "user", content: outgoing, timestamp: new Date().toISOString() },
    ]);
    setInput("");
    setLoadingChat(true);
    setChatError("");

    try {
      const { data } = await api.post("/chat", {
        message: outgoing,
        conversationId: conversationId || undefined,
      });
      setConversationId(data.conversationId);
      localStorage.setItem(conversationStorageKey, data.conversationId);
      setMessages(normalizeHistory(data.history));
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
      setChatError("Unable to reach the assistant right now.");
    } finally {
      setLoadingChat(false);
    }
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await handleSend();
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      setChatError("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    setChatError("");
    setIsListening(true);
    recognitionRef.current.start();
  };

  const approvedCount = appointments.filter(
    (item) => item.status === "approved"
  ).length;
  const pendingCount = appointments.filter(
    (item) => item.status === "pending"
  ).length;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Appointments" value={appointments.length} />
        <StatCard title="Approved" value={approvedCount} />
        <StatCard title="Pending" value={pendingCount} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex h-[560px] flex-col overflow-hidden rounded-[28px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/90 text-sm font-bold text-black shadow-lg shadow-cyan-500/20">
                  AI
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Healthcare Assistant</h2>
                  <p className="text-sm text-slate-300">
                    Ask about symptoms, care planning, and next-step guidance.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto bg-slate-950/20 px-4 py-5 pr-3 sm:px-6">
              {loadingHistory ? (
                <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 backdrop-blur">
                  Loading previous conversation...
                </div>
              ) : null}

              {messages.map((msg, index) => (
                <div
                  key={`${msg.role}-${msg.timestamp || index}-${index}`}
                  className={`flex items-end gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/90 text-xs font-bold text-black shadow-lg shadow-cyan-500/20">
                      AI
                    </div>
                  ) : (
                    <div className="hidden h-9 w-9 shrink-0 sm:block" />
                  )}

                  <div
                    className={`max-w-md rounded-[22px] border px-4 py-3.5 shadow-lg backdrop-blur-xl sm:px-5 ${
                      msg.role === "user"
                        ? "border-cyan-300/30 bg-cyan-400 text-black"
                        : "border-white/15 bg-white/10 text-white"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="space-y-3">
                        {formatResponse(msg.content).map((line, lineIndex) => (
                          <div
                            key={`${msg.timestamp || index}-line-${lineIndex}`}
                            className="flex items-start gap-3 text-sm leading-7 text-slate-50"
                          >
                            <span className="mt-1 text-cyan-300">•</span>
                            <p className="text-sm leading-7">{line}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm leading-7">{msg.content}</p>
                    )}
                    <span
                      className={`mt-3 block text-[11px] ${
                        msg.role === "user" ? "text-black/70" : "text-slate-300"
                      }`}
                    >
                      {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {!messages.length ? (
                <div className="rounded-[22px] border border-dashed border-white/10 bg-slate-900/60 p-5 text-sm leading-7 text-slate-400">
                  Start chatting with the healthcare assistant. Your conversation will appear here with clearer step-by-step responses.
                </div>
              ) : null}

              {loadingChat ? (
                <div className="flex max-w-xs items-center gap-3 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 backdrop-blur">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" />
                  </div>
                  <span className="animate-pulse">AI is thinking...</span>
                </div>
              ) : null}

              {chatError ? <p className="text-sm text-rose-300">{chatError}</p> : null}
              <div ref={endRef} />
            </div>

            <div className="border-t border-white/10 bg-slate-950/10 px-4 py-4 sm:px-6">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-2xl border border-white/10 bg-white/10 p-3.5 text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/30"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message the healthcare assistant..."
                />
                <button
                  className={`rounded-2xl border px-4 transition ${
                    isListening
                      ? "border-rose-300/30 bg-rose-400 text-black hover:bg-rose-300"
                      : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                  }`}
                  onClick={handleVoiceInput}
                  type="button"
                  title="Use microphone"
                  aria-label={isListening ? "Stop microphone" : "Start microphone"}
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <path d="M12 19v2" />
                    <path d="M8 21h8" />
                  </svg>
                </button>
                <button
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-400 px-5 font-semibold text-black transition hover:scale-[1.02]"
                  onClick={handleSend}
                  type="button"
                >
                  Send
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span
                  className={`rounded-full border px-3 py-1.5 font-semibold uppercase tracking-[0.2em] ${
                    speechSupported
                      ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  {speechSupported ? "Voice input ready" : "Voice input unavailable"}
                </span>
                {isListening ? (
                  <span className="font-semibold uppercase tracking-[0.2em] text-rose-200">
                    Listening...
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
            <h2 className="mb-3 text-lg font-semibold">Book Appointment</h2>
            <form className="space-y-3" onSubmit={handleBookAppointment}>
              <select
                className="w-full rounded-xl bg-white/20 p-3 text-white outline-none"
                name="hospitalAdminId"
                value={booking.hospitalAdminId}
                onChange={handleBookingChange}
                required
              >
                <option value="" className="text-black">
                  Select hospital
                </option>
                {hospitalAdmins.map((admin) => (
                  <option key={admin._id} value={admin._id} className="text-black">
                    {admin.name}
                  </option>
                ))}
              </select>

              <input
                className="w-full rounded-xl bg-white/20 p-3 text-white outline-none"
                name="date"
                type="datetime-local"
                value={booking.date}
                onChange={handleBookingChange}
                min={minAppointmentDateTime}
                required
              />

              <button
                className="w-full rounded-xl bg-teal-400 py-2 font-semibold text-black transition hover:bg-teal-300"
                type="submit"
              >
                Book
              </button>
            </form>

            {bookingMessage ? (
              <p className="mt-3 text-sm text-emerald-300">{bookingMessage}</p>
            ) : null}
            {bookingError ? (
              <p className="mt-3 text-sm text-rose-300">{bookingError}</p>
            ) : null}
            <button
              className="mt-4 w-full rounded-xl border border-cyan-300/25 bg-cyan-300/10 py-2 font-semibold text-cyan-100 transition hover:bg-cyan-300/15"
              onClick={() => navigate("/my-appointments")}
              type="button"
            >
              View My Appointments
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function HospitalAdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    try {
      const { data } = await api.get("/api/appointments/requests");
      setRequests(data.appointments);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadRequests();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/api/appointments/requests/${id}/status`, {
        status,
      });
      setMessage(data.message);
      await loadRequests();
    } catch {
      setMessage("Unable to update request right now.");
    }
  };

  const approvedCount = requests.filter(
    (item) => item.status === "approved"
  ).length;
  const pendingCount = requests.filter((item) => item.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Requests" value={requests.length} />
        <StatCard title="Approved" value={approvedCount} />
        <StatCard title="Pending" value={pendingCount} />
      </div>

      {message ? (
        <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-sm text-cyan-200 backdrop-blur-xl">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {requests.length ? (
          requests.map((appointment) => (
            <div
              key={appointment._id}
              className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl"
            >
              <p className="text-sm text-slate-400">
                {appointment.userId?.name || "Patient"}
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                {new Date(appointment.date).toLocaleString()}
              </h3>
              <p className="mt-2 text-sm text-slate-300 capitalize">
                Status: {appointment.status}
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  className="flex-1 rounded-xl bg-emerald-400 py-2 font-semibold text-black transition hover:bg-emerald-300"
                  onClick={() => updateStatus(appointment._id, "approved")}
                  type="button"
                >
                  Approve
                </button>
                <button
                  className="flex-1 rounded-xl bg-rose-400 py-2 font-semibold text-black transition hover:bg-rose-300"
                  onClick={() => updateStatus(appointment._id, "rejected")}
                  type="button"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-slate-300 backdrop-blur-xl">
            No appointment requests right now.
          </div>
        )}
      </div>
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

function getMinDateTimeValue() {
  const now = new Date();
  now.setSeconds(0, 0);

  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
}
