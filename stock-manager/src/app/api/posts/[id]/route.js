import { connectMongoDB } from "../../../../../lib/mongodb";
import Post from "../../../../../models/post";
import { NextResponse } from "next/server";

// ✅ GET - ต้องรับ params แยกและ await
export async function GET(req, { params }) {
  const { id } = await params; // ✅ ต้อง await ตาม Next.js 15+
  
  await connectMongoDB();
  const post = await Post.findById(id);

  if (!post) {
    return NextResponse.json({ message: "ไม่พบสินค้า" }, { status: 404 });
  }

  return NextResponse.json({ post }, { status: 200 });
}

// ✅ PUT - รับ params และ await เช่นเดียวกัน
export async function PUT(req, { params }) {
  const { id } = await params;
  const {
    newTitle,
    newImg,
    newContent,
    newQuantity,     // จะมีเมื่อมาจาก Withdraw/AddStock
    newCategory,     // จะมีเมื่อมาจาก EditPostPage
  } = await req.json();

  // ตรวจสอบฟิลด์ที่บังคับ (สำหรับแก้ไขชื่อ/หมวดหมู่)
  if (!newTitle || !newCategory) {
    return NextResponse.json(
      { message: "กรุณาระบุชื่อสินค้าและหมวดหมู่" },
      { status: 400 }
    );
  }

  const updateData = {
    title: newTitle,
    img: newImg,
    content: newContent,
    category: newCategory,
  };

  // ถ้ามี newQuantity ส่งมาด้วย (มาจาก modal เบิก/เติม) ให้ตรวจสอบและอัปเดต
  if (typeof newQuantity !== "undefined") {
    if (!Number.isInteger(newQuantity) || newQuantity < 0) {
      return NextResponse.json(
        { message: "จำนวนสินค้าไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    updateData.quantity = newQuantity;
  }

  try {
    await connectMongoDB();
    const updated = await Post.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ message: "ไม่พบสินค้า" }, { status: 404 });
    }
    return NextResponse.json({ message: "อัปเดตสำเร็จ", post: updated }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/posts/[id] error:", err);
    return NextResponse.json({ message: "เกิดข้อผิดพลาด", error: err }, { status: 500 });
  }
}
