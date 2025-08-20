import jwt from "jsonwebtoken";

// Minimal auth middleware: decode Supabase JWT without verification to unblock dev.
// In production, verify the token using Supabase JWKS.
export function authenticateToken(req, res, next) {
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const decoded = jwt.decode(token) || {};
    // Common Supabase fields: sub (user id), email
    req.user = { id: decoded.sub, email: decoded.email };
    if (!req.user.id) return res.status(401).json({ error: "Invalid token" });
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
