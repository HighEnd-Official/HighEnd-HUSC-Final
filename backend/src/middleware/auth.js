import jwt from "jsonwebtoken";
import { createHttpError } from "../lib/http.js";

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(createHttpError(401, "Missing bearer token."));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = payload;
    return next();
  } catch {
    return next(createHttpError(401, "Invalid or expired token."));
  }
}

export function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, _res, next) => {
    if (!req.auth?.role) return next(createHttpError(401, "Not authenticated."));
    if (!allowed.includes(req.auth.role)) return next(createHttpError(403, "Forbidden."));
    next();
  };
}

