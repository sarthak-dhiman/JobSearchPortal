import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";

import savedRoutes from "./routes/savedRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import filterRoutes from "./routes/filterRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;


const app = express();


app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/filters", filterRoutes);
app.use("/api", savedRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));


app.use("/api", (_req, res) => res.status(404).json({ message: "Not found" }));


app.use((err, _req, res, _next) => {
  console.error("❌", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});


(async () => {
  try {
    
    await connectDB(MONGODB_URI);

    ;

    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (e) {
    console.error("DB connection failed:", e.message);
    process.exit(1);
  }
})();
