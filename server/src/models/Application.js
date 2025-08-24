import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["applied", "review", "rejected", "accepted"], default: "applied" },
    resumeUrl: String,
    coverLetter: String,
  },
  { timestamps: true }
);

ApplicationSchema.index({ job: 1, user: 1 }, { unique: true });

export default mongoose.model("Application", ApplicationSchema);

