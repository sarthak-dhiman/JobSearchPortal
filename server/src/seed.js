import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Company from "./models/Company.js";
import Job from "./models/Job.js";
import Application from "./models/Application.js";
import crypto from "crypto";

const uid = () => crypto.randomUUID();

const run = async () => {
  await connectDB(process.env.MONGODB_URI);

  console.log("🧹 Clearing old data...");
  await Promise.all([
    User.deleteMany({}),
    Company.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
  ]);

  console.log("👥 Creating users...");
  const [admin, user] = await User.create([
    { name: "Admin User", email: "admin@example.com", password: "Admin@123", role: "admin" },
    { name: "Jane Doe",   email: "jane@example.com",  password: "User@123",  role: "user"  },
  ]);

  console.log("🏢 Creating companies...");
  const [google, microsoft, amazon] = await Company.create([
    { name: "Google",    website: "https://google.com",    location: "United States", size: "10k+" },
    { name: "Microsoft", website: "https://microsoft.com", location: "United States", size: "10k+" },
    { name: "Amazon",    website: "https://amazon.com",    location: "United States", size: "10k+" },
  ]);

  console.log("💼 Creating jobs...");
  const now = Date.now();
  const jobs = await Job.create([
    {
      title: "Frontend Developer",
      description: "Build delightful UI in React.",
      location: "United States",
      type: "remote",                
      role: "frontend",
      level: "mid",
      salaryMin: 4000, salaryMax: 7000, salaryPeriod: "month",
      experienceYears: 2,
      company: google._id,
      companyName: google.name,  
      postedBy: admin._id,
      postedAt: new Date(now - 1000 * 60 * 60 * 24 * 7),
      image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=800&q=60",
      url: `https://jobs.example.com/${uid()}`,
    },
    {
      title: "Backend Engineer",
      description: "Design scalable APIs in Node/Express.",
      location: "India",
      type: "hybrid",
      role: "backend",
      level: "senior",
      salaryMin: 5000, salaryMax: 9000, salaryPeriod: "month",
      experienceYears: 4,
      company: microsoft._id,
      companyName: microsoft.name,
      postedBy: admin._id,
      postedAt: new Date(now - 1000 * 60 * 60 * 24 * 3),
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60",
      url: `https://jobs.example.com/${uid()}`,
    },
    {
      title: "Full-Stack Developer",
      description: "Own features across React + Node + Mongo.",
      location: "United Kingdom",
      type: "full-time",             
      role: "fullstack",
      level: "junior",
      salaryMin: 3200, salaryMax: 5200, salaryPeriod: "month",
      experienceYears: 1,
      company: amazon._id,
      companyName: amazon.name,
      postedBy: admin._id,
      postedAt: new Date(now - 1000 * 60 * 60 * 24 * 10),
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=60",
      url: `https://jobs.example.com/${uid()}`,
    },
    {
      title: "Data Analyst",
      description: "Analyze product metrics and build dashboards.",
      location: "Remote",
      type: "remote",
      role: "data",
      level: "mid",
      salaryMin: 3800, salaryMax: 6000, salaryPeriod: "month",
      experienceYears: 2,
      company: google._id,
      companyName: google.name,
      postedBy: admin._id,
      postedAt: new Date(now - 1000 * 60 * 60 * 24 * 1),
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=60",
      url: `https://jobs.example.com/${uid()}`,
    },
  ]);

  console.log("📝 Creating sample application...");
  await Application.create({
    job: jobs[0]._id,
    user: user._id,
    status: "applied",
  });

  console.log("✅ Seed complete.");
  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (e) => {
  console.error(e);
  await mongoose.connection.close();
  process.exit(1);
});
