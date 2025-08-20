import express from "express";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { authMiddleware, recruiterOnly } from "../middleware/auth.js";

const router = express.Router();


router.post("/:jobId", authMiddleware, async (req, res) => {
  try {
    const { coverLetter, resumeUrl } = req.body;
    const { jobId } = req.params;

    
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    
    const existing = await Application.findOne({
      user: req.user.id,
      job: jobId,
    });
    if (existing) {
      return res.status(400).json({ error: "You already applied for this job" });
    }

    const application = await Application.create({
      user: req.user.id,
      job: jobId,
      coverLetter,
      resumeUrl,
    });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/job/:jobId", authMiddleware, recruiterOnly, async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const applications = await Application.find({ job: jobId })
      .populate("user", "name email")
      .populate("job", "title location");

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/my", authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate("job", "title location")
      .populate("user", "name email");

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/:id/status", authMiddleware, recruiterOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findById(id).populate("job");
    if (!application) return res.status(404).json({ error: "Application not found" });

    
    if (application.job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    application.status = status || application.status;
    await application.save();

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
