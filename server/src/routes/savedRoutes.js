import { Router } from "express";
import mongoose from "mongoose";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

const router = Router();


router.get("/saved", authMiddleware, async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page, 10)  || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id)
      .select("savedJobs")
      .populate({
        path: "savedJobs",
        options: { sort: "-createdAt", skip, limit },
        populate: [{ path: "company", select: "name logo" }, { path: "postedBy", select: "name" }],
      });

    const total = user?.savedJobs?.length || 0;
    const items = (user?.savedJobs || []).slice(0, limit);

    return res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error("GET /api/saved error:", e);
    res.status(500).json({ message: "Failed to load saved jobs" });
  }
});


router.get("/saved/:jobId", authMiddleware, async (req, res) => {
  const { jobId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: "Invalid job id" });
  }
  const user = await User.findById(req.user.id).select("savedJobs");
  const saved = Boolean(user?.savedJobs?.some(id => id.toString() === jobId));
  return res.json({ saved });
});


router.post("/saved/:jobId", authMiddleware, async (req, res) => {
  const { jobId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: "Invalid job id" });
  }
  const exists = await Job.exists({ _id: jobId });
  if (!exists) return res.status(404).json({ message: "Job not found" });

  await User.updateOne(
    { _id: req.user.id },
    { $addToSet: { savedJobs: jobId } } 
  );
  return res.status(201).json({ message: "Saved" });
});


router.delete("/saved/:jobId", authMiddleware, async (req, res) => {
  const { jobId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: "Invalid job id" });
  }
  await User.updateOne(
    { _id: req.user.id },
    { $pull: { savedJobs: jobId } }
  );
  return res.status(204).send();
});

export default router;
