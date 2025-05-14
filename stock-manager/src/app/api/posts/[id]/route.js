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
    newQuantity,
    newCategory,   // จะมีก็ต่อเมื่อมาจากหน้า edit เท่านั้น
  } = await req.json();

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!newTitle || !Number.isInteger(newQuantity) || newQuantity < 0) {
    return NextResponse.json(
      { message: "กรุณาระบุชื่อสินค้าและจำนวนให้ถูกต้อง" },
      { status: 400 }
    );
  }

  // สร้าง object สำหรับอัปเดต
  const updateData = {
    title: newTitle,
    img: newImg,
    content: newContent,
    quantity: newQuantity,
  };

  // ถ้ามี newCategory ส่งมาด้วย ให้ใส่ลงไป
  if (newCategory) {
    updateData.category = newCategory;
  }

  try {
    await connectMongoDB();
    const updated = await Post.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ message: "ไม่พบสินค้า" }, { status: 404 });
    }
    return NextResponse.json({ message: "อัปเดตสำเร็จ", post: updated }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "เกิดข้อผิดพลาด", error: err }, { status: 500 });
  }
}
