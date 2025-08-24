import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },

    role: { type: String, enum: ["admin","recruiter","user"], default: "user" },

    phone:   { type: String,  default: "" },
    address: { type: String,  default: "" },
    skills:  { type: [String], default: [] },

  
    savedJobs: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
      default: [],
    },
  },
  { timestamps: true }
);



UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


UserSchema.methods.comparePassword = async function (plain = "") {
  if (typeof this.password !== "string" || !this.password) return false;
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", UserSchema);
