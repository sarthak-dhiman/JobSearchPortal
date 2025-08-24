import express from "express";
import mongoose from "mongoose";
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import { authMiddleware, recruiterOnly, adminOnly } from "../middleware/auth.js";
const router = express.Router();

const WORK_MODES = new Set(["remote", "onsite", "hybrid"]);
const EMP_TYPES = new Set(["full-time", "part-time", "contract"]);


router.get("/", async (req, res) => {
  try {
    const {
      q,
      location,
      company,        
      companyName,   
      type,          
      workMode,
      employmentType,
      role,
      level,
      url,            
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const cleanPage  = Math.max(parseInt(page, 10)  || 1, 1);
    const cleanLimit = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (cleanPage - 1) * cleanLimit;

    const filter = {};

    
    if (q && q.trim()) {
      const qtrim = q.trim();
      if (Job.schema.indexes().some(([def]) => def && def.title === "text")) {
        filter.$text = { $search: qtrim };
      } else {
        const rx = new RegExp(qtrim, "i");
        filter.$or = [{ title: rx }, { description: rx }, { companyName: rx }];
      }
    }

    if (location && location.trim()) {
      filter.location = new RegExp(`^${location.trim()}$`, "i");
    }

    
    const t = (type || "").trim().toLowerCase();
    if (t) {
      if (WORK_MODES.has(t)) filter.workMode = t;
      else if (EMP_TYPES.has(t)) filter.employmentType = t;
    }
    if (workMode && WORK_MODES.has(workMode)) filter.workMode = workMode;
    if (employmentType && EMP_TYPES.has(employmentType)) filter.employmentType = employmentType;

    if (role && role.trim())  filter.role  = role.trim();
    if (level && level.trim()) filter.level = level.trim();

    if (url && url.trim()) {
      filter.url = url.trim();
    }

    const compStr = (companyName || company || "").trim();
    if (compStr) {
      if (mongoose.Types.ObjectId.isValid(compStr)) {
        filter.company = compStr;
      } else {
      
        const compDoc = await Company.findOne({ name: new RegExp(`^${compStr}$`, "i") })
          .select("_id")
          .lean();
        if (compDoc?._id) {
          filter.company = compDoc._id;
        } else {
          
          filter.companyName = new RegExp(`^${compStr}$`, "i");
        }
      }
    }

   
    const allowedSorts = new Set(["createdAt", "-createdAt", "postedAt", "-postedAt"]);
    const sortSafe = allowedSorts.has(sort) ? sort : "-createdAt";

    const query = Job.find(filter)
      .populate("company", "name logo")
      .populate("postedBy", "name")
      .sort(sortSafe)
      .skip(skip)
      .limit(cleanLimit)
      .lean();

    const [items, total] = await Promise.all([query, Job.countDocuments(filter)]);

    return res.json({
      items,
      total,
      page: cleanPage,
      pages: Math.ceil(total / cleanLimit),
    });
  } catch (err) {
    console.error("GET /api/jobs failed:", err);
    res.status(500).json({
      message: "Failed to fetch jobs",
      detail: err.message,
    });
  }
});
router.get(
  "/mine",
  authMiddleware,
  recruiterOnly,
  async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
      const skip = (page - 1) * limit;

      const filter = { postedBy: req.user._id };
      const [items, total] = await Promise.all([
        Job.find(filter).sort("-createdAt").skip(skip).limit(limit).lean(),
        Job.countDocuments(filter),
      ]);

      return res.json({ items, total, page, pages: Math.ceil(total / limit) });
    } catch (e) {
      console.error("GET /api/jobs/mine error:", e);
      return res.status(500).json({ message: "Failed to load jobs" });
    }
  }
);

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }
    const job = await Job.findById(id)
      .populate("company", "name logo")
      .populate("postedBy", "name")
      .lean();
    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.json({ job });
  } catch (e) {
    console.error("GET /api/jobs/:id error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});
router.post(
  "/",
  authMiddleware,
  recruiterOnly,
  async (req, res) => {
    try {
      const {
        title,
        description = "",
        location = "",
        type = "",            
        role = "fullstack",
        level = "mid",
        salaryMin = null,
        salaryMax = null,
        salaryPeriod = "month",
        experienceYears = 0,
        company,             
        companyName = "",     
        image = "",
        url = "",
        postedAt,
      } = req.body;

      if (!title?.trim()) return res.status(400).json({ message: "Title is required" });

      const job = await Job.create({
        title: title.trim(),
        description,
        location,
        role,
        level,
        salaryMin,
        salaryMax,
        salaryPeriod,
        experienceYears,
        image,
        source: "",
        url,                  
        postedAt,
        postedBy: req.user._id,
        company: company || undefined,
        companyName: company ? undefined : companyName?.trim() || undefined,
      });

    
      if (type) { job.type = type; await job.save(); }

      return res.status(201).json({ job });
    } catch (e) {
      console.error("POST /api/jobs error:", e);
      return res.status(500).json({ message: "Failed to create job" });
    }
  }
);





router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return res.status(404).json({ message: "Job not found" });

      const isOwner = job.postedBy?.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

      const up = req.body || {};
      
      if (up.type != null) job.type = up.type;

      Object.assign(job, {
        title: up.title ?? job.title,
        description: up.description ?? job.description,
        location: up.location ?? job.location,
        role: up.role ?? job.role,
        level: up.level ?? job.level,
        salaryMin: up.salaryMin ?? job.salaryMin,
        salaryMax: up.salaryMax ?? job.salaryMax,
        salaryPeriod: up.salaryPeriod ?? job.salaryPeriod,
        experienceYears: up.experienceYears ?? job.experienceYears,
        image: up.image ?? job.image,
        url: up.url ?? job.url,
        postedAt: up.postedAt ?? job.postedAt,
        company: up.company ?? job.company,
        companyName: up.companyName ?? job.companyName,
      });

      await job.save();
      return res.json({ job });
    } catch (e) {
      console.error("PUT /api/jobs/:id error:", e);
      return res.status(500).json({ message: "Failed to update job" });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return res.status(404).json({ message: "Job not found" });

      const isOwner = job.postedBy?.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

      await job.deleteOne();
      return res.status(204).send();
    } catch (e) {
      console.error("DELETE /api/jobs/:id error:", e);
      return res.status(500).json({ message: "Failed to delete job" });
    }
  }
);

export default router;
