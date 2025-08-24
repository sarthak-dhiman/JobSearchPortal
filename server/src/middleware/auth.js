import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const authMiddleware = async (req, res, next) => {
  try {
    const auth = req.header("Authorization");
    const bearer = auth && auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const cookieTok = req.cookies?.token || req.cookies?.jid || null;
    const token = bearer || cookieTok;

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      const isExpired = e?.name === "TokenExpiredError";
      return res.status(401).json({ error: isExpired ? "Token expired" : "Invalid token" });
    }

    const userId = payload?.id || payload?._id || payload?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; 
    next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};

export const recruiterOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "recruiter") {
    return res.status(403).json({ error: "Recruiter only access" });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only access" });
  }
  next();
};


export const candidateOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const role = req.user.role;
  if (!(role === "candidate" || role === "user")) {
    return res.status(403).json({ error: "Candidate only access" });
  }
  next();
};
