import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
     company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true, 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
