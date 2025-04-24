import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
  action: String,
  productId: String,
  productTitle: String,
  amount: Number,
  // by: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.History || mongoose.model("History", HistorySchema);
