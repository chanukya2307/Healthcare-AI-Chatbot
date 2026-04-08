import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      if (!token) {
        if (isMounted) {
          setAuthReady(true);
        }
        return;
      }

      if (user) {
        if (isMounted) {
          setAuthReady(true);
        }
        return;
      }

      try {
        const { data } = await api.get("/api/protected/me");
        if (isMounted) {
          setUser(data.user);
        }
      } catch {
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setAuthReady(true);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [token, user]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", credentials);
      setToken(data.token);
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed.",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", payload);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed.",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!token) {
      return null;
    }

    try {
      const { data } = await api.get("/api/protected/me");
      setUser(data.user);
      return data.user;
    } catch {
      logout();
      return null;
    }
  };

  const value = {
    token,
    user,
    loading,
    authReady,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
