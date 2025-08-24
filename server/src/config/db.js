import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, { dbName: undefined });
    console.log("MongoDB connected");
  } catch (err) {
    console.error(" MongoDB error:", err.message);
    process.exit(1);
  }
}
