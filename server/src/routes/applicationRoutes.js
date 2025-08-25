import express from "express";
import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const allow = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : res.status(403).json({ message: "Forbidden" });

router.post("/:jobId", authMiddleware, allow("user", "recruiter", "admin"), async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const { coverLetter = "", resumeUrl = "" } = req.body;

    const job = await Job.findById(jobId).select("_id");
    if (!job) return res.status(404).json({ message: "Job not found" });

    const existing = await Application.findOne({ user: req.user._id, job: jobId }).lean();
    if (existing) return res.status(400).json({ message: "You already applied for this job" });

    const application = await Application.create({
      user: req.user._id,
      job: jobId,
      coverLetter,
      resumeUrl,
    });

    res.status(201).json({ application });
  } catch (err) {
    console.error("POST /api/applications/:jobId error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", authMiddleware, allow("admin"), async (req, res) => {
  try {
    const { jobId, userId, status, page = 1, limit = 20 } = req.query;
    const cleanPage = Math.max(parseInt(page, 10) || 1, 1);
    const cleanLimit = Math.max(parseInt(limit, 10) || 20, 1);
    const skip = (cleanPage - 1) * cleanLimit;

    const filter = {};
    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) filter.job = jobId;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) filter.user = userId;
    if (status) filter.status = status;

    const query = Application.find(filter)
      .populate({ path: "job", select: "title companyName company location postedBy", populate: { path: "company", select: "name logo" } })
      .populate("user", "name email role")
      .sort("-createdAt")
      .skip(skip)
      .limit(cleanLimit)
      .lean();

    const [items, total] = await Promise.all([query, Application.countDocuments(filter)]);
    res.json({ items, total, page: cleanPage, pages: Math.ceil(total / cleanLimit) });
  } catch (e) {
    console.error("GET /api/applications error:", e);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

router.get("/for-my-jobs", authMiddleware, allow("recruiter", "admin"), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
    const skip = (page - 1) * limit;

    const jobFilter = req.user.role === "admin" && req.query.all === "true"
      ? {}
      : { postedBy: req.user._id };

    const jobIds = await Job.find(jobFilter).distinct("_id");
    if (!jobIds.length) return res.json({ items: [], total: 0, page, pages: 0 });

    const filter = { job: { $in: jobIds } };

    const query = Application.find(filter)
      .populate({ path: "job", select: "title companyName company location postedBy", populate: { path: "company", select: "name logo" } })
      .populate("user", "name email role")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .lean();

    const [items, total] = await Promise.all([query, Application.countDocuments(filter)]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error("GET /api/applications/for-my-jobs error:", e);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

router.get("/job/:jobId", authMiddleware, allow("recruiter", "admin"), async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const job = await Job.findById(jobId).select("postedBy title").lean();
    if (!job) return res.status(404).json({ message: "Job not found" });

    const isOwner = req.user.role !== "admin" && job.postedBy?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const items = await Application.find({ job: jobId })
      .populate("user", "name email role")
      .sort("-createdAt")
      .lean();

    res.json({ job, items });
  } catch (e) {
    console.error("GET /api/applications/job/:jobId error:", e);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

router.patch("/:id", authMiddleware, allow("recruiter", "admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid application id" });
    }
    if (!["applied", "review", "rejected", "accepted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const app = await Application.findById(id).populate("job", "postedBy");
    if (!app) return res.status(404).json({ message: "Application not found" });

    const isOwner = req.user.role !== "admin" && app.job?.postedBy?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    app.status = status;
    await app.save();
    res.json({ application: app });
  } catch (e) {
    console.error("PATCH /api/applications/:id error:", e);
    res.status(500).json({ message: "Failed to update application" });
  }
});

router.get("/mine", authMiddleware, allow("user", "recruiter", "admin"), async (req, res) => {
  try {
    const items = await Application.find({ user: req.user._id })
      .populate("job", "title companyName company location")
      .sort("-createdAt")
      .lean();
    res.json({ items });
  } catch (e) {
    console.error("GET /api/applications/mine error:", e);
    res.status(500).json({ message: "Failed to fetch your applications" });
  }
});

export default router;
