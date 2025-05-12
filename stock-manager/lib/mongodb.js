// import mongoose, { mongo } from "mongoose";

// export const connectMongoDB = async () => {
//     try {

//         await mongoose.connect(process.env.MONGODB_URI);
//         console.log("Connected to mongodb");

//     } catch(error) {
//         console.log("Error connecting to mongodb: ", error)
//     }
// }

// lib/mongodb.js
import mongoose from "mongoose";

let isConnected = false;

export async function connectMongoDB() {
  if (isConnected || mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "stock", // เปลี่ยนเป็นชื่อ database ของคุณ
    });
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}
