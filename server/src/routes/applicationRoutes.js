import express from "express";
import Application from "../models/Application.js";
import { authMiddleware, recruiterOnly, candidateOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/:jobId", authMiddleware, candidateOnly, async (req, res) => {
  try {
    const { resume, coverLetter } = req.body;
    const jobId = req.params.jobId;

    const application = await Application.create({
      job: jobId,
      candidate: req.user.id,
      resume,
      coverLetter
    });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/job/:jobId", authMiddleware, recruiterOnly, async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate("candidate", "name email")
      .populate("job", "title company");

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/my", authMiddleware, candidateOnly, async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate("job", "title company location");

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/:id/status", authMiddleware, recruiterOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
