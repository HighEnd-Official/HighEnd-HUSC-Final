import { createContext, useContext, useState, useCallback } from "react";

// ── Mock user database (replace with real API later) ──────────────────────
const MOCK_USERS = [
  { username: "Admin User",       email: "admin@hues.com",  password: "admin123",  role: "Admin" },
  { username: "Super Admin",      email: "super@hues.com",  password: "super123",  role: "SuperAdmin" },
  { username: "HUES Member",      email: "user@hues.com",   password: "user123",   role: "User" },
];

const SESSION_KEY = "hues_session";
const REGISTERED_USERS_KEY = "hues_registered_users";

// ── Helpers ───────────────────────────────────────────────────────────────
function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUser(user) {
  const existing = getRegisteredUsers();
  existing.push(user);
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(existing));
}

// ── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession());

  // login(identifier, password) — identifier can be email or username
  // Returns { success: bool, role: string|null, error: string|null }
  const login = useCallback((identifier, password) => {
    const identifierLower = identifier.trim().toLowerCase();

    // Check mock users first
    const allUsers = [
      ...MOCK_USERS,
      ...getRegisteredUsers(),
    ];

    const found = allUsers.find(
      (u) =>
        (u.email.toLowerCase() === identifierLower ||
          u.username.toLowerCase() === identifierLower) &&
        u.password === password
    );

    if (!found) {
      return { success: false, role: null, error: "Invalid email or password." };
    }

    const session = {
      username: found.username,
      email: found.email,
      role: found.role,
      token: btoa(`${found.email}:${Date.now()}`), // lightweight pseudo-token
    };

    saveSession(session);
    setUser(session);
    return { success: true, role: found.role, error: null };
  }, []);

  // register(name, email, password) — creates User-role account
  // Returns { success: bool, error: string|null }
  const register = useCallback((name, email, password) => {
    const emailLower = email.trim().toLowerCase();
    const allUsers = [...MOCK_USERS, ...getRegisteredUsers()];

    const exists = allUsers.some((u) => u.email.toLowerCase() === emailLower);
    if (exists) {
      return { success: false, error: "An account with this email already exists." };
    }

    const newUser = {
      username: name.trim(),
      email: emailLower,
      password,
      role: "User",
    };

    saveRegisteredUser(newUser);

    return { success: true, error: null };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  const hasRole = useCallback(
    (roles) => {
      if (!user) return false;
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
