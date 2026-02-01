import mongoose from "mongoose";

const connectionString = process.env.MONGODB_URI;

if (!connectionString) {
  throw new Error("Please provide a valid MONGODB_URI in your .env file");
}

const connectDB = async () => {
  if (mongoose.connection?.readyState >= 1) {
    // console.log("---- Already connected to MongoDB ----");
    return;
  }

  try {
    console.log("---- Connecting to MongoDB ----");
    await mongoose.connect(connectionString);
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
};

export default connectDB;
