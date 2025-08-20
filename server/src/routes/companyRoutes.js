import express from "express";
import Company from "../models/Company.js";
import { authMiddleware, recruiterOnly } from "../middleware/auth.js";

const router = express.Router();


router.post("/", authMiddleware, recruiterOnly, async (req, res) => {
  try {
    const { name, description, website, logo } = req.body;

    const company = await Company.create({
      name,
      description,
      website,
      logo,
      recruiters: [req.user.id],
    });

    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const companies = await Company.find().populate("recruiters", "name email");
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate("recruiters", "name email");
    
    if (!company) return res.status(404).json({ error: "Company not found" });

    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/:id", authMiddleware, recruiterOnly, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ error: "Company not found" });

    if (!company.recruiters.includes(req.user.id)) {
      return res.status(403).json({ error: "Not your company" });
    }

    const updated = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
