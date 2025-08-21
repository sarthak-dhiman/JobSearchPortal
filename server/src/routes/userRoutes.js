import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "resumes");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") return cb(new Error("PDF only"));
    cb(null, true);
  },
});

router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

router.put("/me", authMiddleware, async (req, res) => {
  const { name } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { ...(name ? { name } : {}) },
    { new: true }
  ).select("-password");
  res.json(user);
});
router.post("/me/resume", authMiddleware, upload.single("resume"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file received" });

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const url = `${baseUrl}/uploads/resumes/${file.filename}`;

  const user = await User.findById(req.user.id);
  if (user?.resume?.url) {
    try {
      const old = user.resume.url.split("/uploads/")[1];
      const p = path.join(process.cwd(), "uploads", old);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch {}
  }

  user.resume = {
    url,
    originalName: file.originalname,
    size: file.size,
    updatedAt: new Date(),
  };
  await user.save();

  res.json({ message: "Uploaded", resume: user.resume });
});

router.delete("/me/resume", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user?.resume?.url) {
    try {
      const old = user.resume.url.split("/uploads/")[1];
      const p = path.join(process.cwd(), "uploads", old);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch {}
  }
  user.resume = undefined;
  await user.save();
  res.json({ message: "Deleted" });
});

export default router;
