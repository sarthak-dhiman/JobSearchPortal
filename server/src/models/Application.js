import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    job:  { type: mongoose.Schema.Types.ObjectId, ref: "Job",  required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["applied", "review", "rejected", "accepted"],
      default: "applied",
      index: true,
    },
    resumeUrl: { type: String, default: "" },
    coverLetter: { type: String, default: "", maxlength: 20000 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ApplicationSchema.index({ job: 1, user: 1 }, { unique: true });
ApplicationSchema.index({ job: 1, createdAt: -1 });
ApplicationSchema.index({ user: 1, createdAt: -1 });

ApplicationSchema.pre("save", function (next) {
  if (typeof this.coverLetter === "string") this.coverLetter = this.coverLetter.trim();
  if (typeof this.resumeUrl === "string") this.resumeUrl = this.resumeUrl.trim();
  next();
});

export default mongoose.model("Application", ApplicationSchema);
