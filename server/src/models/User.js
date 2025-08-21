import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    resume: {
      url: String,               
      originalName: String,      
      size: Number,              
      updatedAt: Date,
  },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
