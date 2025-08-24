import express from "express";
import Job from "../models/Job.js";
import Company from "../models/Company.js"; 

const router = express.Router();



router.get("/", async (_req, res) => {
  try {
   
    const locations = await Job.distinct("location", { location: { $ne: null } });

  
    let companies = [];
    try {
      companies = await Company.distinct("name", { name: { $ne: null } });
    } catch {
     
      companies = await Job.distinct("companyName", { companyName: { $ne: null } });
    }

    res.json({
      locations: locations.sort((a, b) => String(a).localeCompare(String(b))),
      companies: companies.sort((a, b) => String(a).localeCompare(String(b))),
    });
  } catch (err) {
    console.error("GET /api/filters failed:", err);
    res.status(500).json({ message: "Failed to load filters", detail: err.message });
  }
});

export default router;
