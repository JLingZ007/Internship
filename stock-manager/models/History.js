import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  action: String,          // เช่น "เพิ่มสินค้า", "เบิกสินค้า", "อัปเดตจำนวน"
  productId: mongoose.Schema.Types.ObjectId,
  productName: String,
  quantityChanged: Number,
  date: {
    type: Date,
    default: Date.now
  },
  note: String             // รายละเอียดเพิ่มเติม เช่น ใครเบิก หรือหมายเหตุ
});

export default mongoose.models.History || mongoose.model("History", historySchema);
