import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 *
 * Props:
 *   allowedRoles  — string[]  e.g. ["Admin", "SuperAdmin"]
 *                   If omitted / empty, any authenticated user is allowed.
 *
 * Behaviour:
 *   • Not logged in         → redirect to /signin (with ?from=current path)
 *   • Wrong role            → redirect to /unauthorized
 *   • OK                    → render child routes via <Outlet />
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
