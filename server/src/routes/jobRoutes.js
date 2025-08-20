import express from "express";
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import { authMiddleware, recruiterOnly } from "../middleware/auth.js";

const router = express.Router();


router.post("/", authMiddleware, recruiterOnly, async (req, res) => {
  try {
    const { title, description, location, salary, companyId } = req.body;

    
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: "Company not found" });

    
    if (!company.recruiters.includes(req.user.id)) {
      return res
        .status(403)
        .json({ error: "You are not authorized to post for this company" });
    }

    const job = await Job.create({
      title,
      description,
      location,
      salary,
      recruiter: req.user.id,
      company: companyId,
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const { title, location, company } = req.query;
    let filters = {};

    if (title) filters.title = { $regex: title, $options: "i" };
    if (location) filters.location = { $regex: location, $options: "i" };
    if (company) filters.company = company;

    const jobs = await Job.find(filters)
      .populate("recruiter", "name email")
      .populate("company", "name logo website");

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("recruiter", "name email")
      .populate("company", "name logo website");

    if (!job) return res.status(404).json({ error: "Job not found" });

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/:id", authMiddleware, recruiterOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ error: "Job not found" });

    
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { title, description, location, salary } = req.body;
    job.title = title || job.title;
    job.description = description || job.description;
    job.location = location || job.location;
    job.salary = salary || job.salary;

    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id", authMiddleware, recruiterOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ error: "Job not found" });

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await job.deleteOne();
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/apply", auth, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can apply for jobs" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    
    if (job.applicants.some(app => app.user.toString() === req.user.id)) {
      return res.status(400).json({ message: "You have already applied to this job" });
    }

    job.applicants.push({ user: req.user.id });
    await job.save();

    res.json({ message: "Applied successfully", job });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:id/applicants", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can view applicants" });
    }

    const job = await Job.findById(req.params.id).populate("applicants.user", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json({ applicants: job.applicants });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
