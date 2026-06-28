import { createContext, useCallback, useContext, useEffect, useState } from "react";
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

function buildSession(user, token) {
  return {
    id: user?.id ?? null,
    username: user?.username ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    avatarUrl: user?.avatarUrl ?? "",
    addressLine1: user?.addressLine1 ?? "",
    addressLine2: user?.addressLine2 ?? "",
    city: user?.city ?? "",
    postalCode: user?.postalCode ?? "",
    country: user?.country ?? "",
    role: user?.role ?? "User",
    token: token ?? user?.token ?? null
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession());

  const persistUser = useCallback((nextUser, tokenOverride) => {
    const session = buildSession(nextUser, tokenOverride);
    saveSession(session);
    setUser(session);
    return session;
  }, []);

  const refreshUser = useCallback(async () => {
    const session = loadSession();
    if (!session?.token) return null;

    const data = await apiFetch("/auth/me");
    return persistUser(data?.user, session.token);
  }, [persistUser]);

  useEffect(() => {
    let active = true;
    const session = loadSession();
    if (!session?.token) return undefined;

    apiFetch("/auth/me")
      .then((data) => {
        if (!active) return;
        persistUser(data?.user, session.token);
      })
      .catch(() => {
        if (!active) return;
        clearSession();
        setUser(null);
      });

    return () => {
      active = false;
    };
  }, [persistUser]);

  // login(identifier, password) — identifier can be email or username
  const login = useCallback(async (identifier, password) => {
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });

      persistUser(data?.user, data?.token);
      return { success: true, role: data?.user?.role ?? null, error: null };
    } catch (e) {
      return { success: false, role: null, error: e?.message || "Login failed." };
    }
  }, [persistUser]);

  // register(name, email, password, phone) — creates User-role account
  const register = useCallback(async (name, email, password, phone) => {
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username: name, email, password, phone }),
      });

      persistUser(data?.user, data?.token);
      return { success: true, error: null };
    } catch (e) {
      return { success: false, error: e?.message || "Registration failed." };
    }
  }, [persistUser]);

  const updateProfile = useCallback(async (payload) => {
    const data = await apiFetch("/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    return persistUser(data?.user, loadSession()?.token);
  }, [persistUser]);

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
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, hasRole, refreshUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
