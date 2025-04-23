// ✅ post model
import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    img: String,
    content: String,
    quantity: { type: Number, required: true },  // ✅ กำหนด type และ required
  },
  {
    timestamps: true
  }
);

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
export default Post;
