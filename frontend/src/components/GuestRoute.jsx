import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * GuestRoute
 *
 * Prevents already-logged-in users from visiting /signin or /signup.
 * Redirects them to their role-appropriate home page.
 */
export default function GuestRoute() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Outlet />;

  // Redirect based on role
  if (user.role === "Admin" || user.role === "SuperAdmin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/" replace />;
}
