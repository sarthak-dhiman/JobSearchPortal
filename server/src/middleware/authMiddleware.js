import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; 
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};


export const recruiterOnly = (req, res, next) => {
  if (req.user.role !== "recruiter") {
    return res.status(403).json({ error: "Recruiter only access" });
  }
  next();
};


export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only access" });
  }
  next();
};


export const candidateOnly = (req, res, next) => {
  if (req.user.role !== "candidate") {
    return res.status(403).json({ error: "Candidate only access" });
  }
  next();
};
