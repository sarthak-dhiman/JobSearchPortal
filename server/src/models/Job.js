import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    location: { type: String, default: "" },
    workMode: {
      type: String,
      enum: ["remote", "onsite", "hybrid", ""],
      default: "",
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", ""],
      default: "",
    },

    role: { type: String, default: "fullstack" },
    level: {
      type: String,
      enum: ["intern", "junior", "mid", "senior", "lead"],
      default: "mid",
    },

    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    salaryPeriod: { type: String, default: "month" },
    experienceYears: { type: Number, default: 0 },

    companyName: { type: String, trim: true },

    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    image: String,

    source: { type: String, default: "" },
    url: { type: String, default: "" },
    postedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


JobSchema.virtual("type").get(function () {
  return this.workMode || this.employmentType || "";
});

const WORK_MODES = new Set(["remote", "onsite", "hybrid"]);
const EMP_TYPES = new Set(["full-time", "part-time", "contract"]);

JobSchema.virtual("type").set(function (val) {
  if (!val) {
    this.workMode = "";
    this.employmentType = "";
    return;
  }
  if (WORK_MODES.has(val)) {
    this.workMode = val;
  } else if (EMP_TYPES.has(val)) {
    this.employmentType = val;
  }
});


JobSchema.pre("validate", async function (next) {
  try {
    if (!this.companyName && this.company) {
      const Company = mongoose.model("Company");
      const c = await Company.findById(this.company).select("name").lean();
      if (c?.name) this.companyName = c.name;
    }
  } catch (e) {
    
  }
  next();
});


JobSchema.index({ title: "text", description: "text", companyName: "text" });
JobSchema.index({ location: 1, workMode: 1, employmentType: 1, level: 1 });
JobSchema.index(
  { url: 1 },
  {
    unique: true,
    partialFilterExpression: { url: { $type: "string", $ne: "" } },
  }
);

export default mongoose.model("Job", JobSchema);
