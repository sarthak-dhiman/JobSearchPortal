import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    website: { type: String, default: "" },
    logo: { type: String, default: "" },
    location: { type: String, default: "" },
    size: { type: String, default: "" },
  },
  { timestamps: true }
);


export default mongoose.model("Company", CompanySchema);
