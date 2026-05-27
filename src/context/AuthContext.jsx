import { createContext, useCallback, useContext, useState } from "react";
import { apiFetch } from "../api/client";

const SESSION_KEY = "hues_session";

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession());

  // login(identifier, password) — identifier can be email or username
  // Returns { success: bool, role: string|null, error: string|null }
  const login = useCallback(async (identifier, password) => {
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });

      const session = {
        id: data?.user?.id,
        username: data?.user?.username,
        email: data?.user?.email,
        role: data?.user?.role,
        token: data?.token,
      };

      saveSession(session);
      setUser(session);
      return { success: true, role: session.role, error: null };
    } catch (e) {
      return { success: false, role: null, error: e?.message || "Login failed." };
    }
  }, []);

  // register(name, email, password) — creates User-role account
  // Returns { success: bool, error: string|null }
  const register = useCallback(async (name, email, password) => {
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username: name, email, password }),
      });

      const session = {
        id: data?.user?.id,
        username: data?.user?.username,
        email: data?.user?.email,
        role: data?.user?.role,
        token: data?.token,
      };

      saveSession(session);
      setUser(session);
      return { success: true, error: null };
    } catch (e) {
      return { success: false, error: e?.message || "Registration failed." };
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const isAuthenticated = !!user?.token;

  const hasRole = useCallback(
    (roles) => {
      if (!user?.role) return false;
      if (Array.isArray(roles)) return roles.includes(user.role);
      return user.role === roles;
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

