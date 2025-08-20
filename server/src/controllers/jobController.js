import Job from "../models/Job.js";

export const createJob = async (req, res) => {
  try {
    const { title, description, company, location, salary } = req.body;

    const job = await Job.create({
      title,
      description,
      company,
      location,
      salary,
      createdBy: req.user.id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("createdBy", "name email role");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("createdBy", "name email role");
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.createdBy.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.createdBy.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await job.deleteOne();
    res.json({ message: "Job removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
