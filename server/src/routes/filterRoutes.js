import express from "express";
import Job from "../models/Job.js";
import Company from "../models/Company.js";

const router = express.Router();


router.get("/", async (_req, res) => {
  try {
    const locations = await Job.distinct("location", { location: { $ne: null, $ne: "" } });

    
    const companiesDocs = await Company.find({}, "name").sort({ name: 1 }).lean();
    let companies = companiesDocs.map((c) => c.name);
    if (companies.length === 0) {
      companies = await Job.distinct("company", { company: { $ne: null, $ne: "" } });
    }

    res.json({
      locations: locations.sort((a, b) => a.localeCompare(b)),
      companies: companies.sort((a, b) => a.localeCompare(b)),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load filters", error: err.message });
  }
});

export default router;
