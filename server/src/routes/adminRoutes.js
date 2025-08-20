import express from "express";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const router = express.Router();


router.get("/users", authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/users/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/jobs", authMiddleware, adminOnly, async (req, res) => {
  try {
    const jobs = await Job.find().populate("recruiter", "name email");
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/jobs/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/applications", authMiddleware, adminOnly, async (req, res) => {
  try {
    const apps = await Application.find()
      .populate("user", "name email")
      .populate("job", "title location");
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/applications/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: "Application deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
