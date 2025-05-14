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
  // await params ตาม Next.js 15+
  const { id } = await params;
  const body = await req.json();

  // สร้าง object สำหรับอัปเดตฟิลด์ที่มีส่งมา
  const updateData = {};

  // ถ้ามี newTitle ให้อัปเดต title
  if (typeof body.newTitle === "string") {
    updateData.title = body.newTitle;
  }
  // ถ้ามี newImg ให้อัปเดต img
  if (typeof body.newImg === "string") {
    updateData.img = body.newImg;
  }
  // ถ้ามี newContent ให้อัปเดต content
  if (typeof body.newContent === "string") {
    updateData.content = body.newContent;
  }
  // ถ้ามี newCategory ให้อัปเดต category
  if (typeof body.newCategory === "string") {
    updateData.category = body.newCategory;
  }
  // ถ้ามี newQuantity ให้อัปเดต quantity
  if (typeof body.newQuantity !== "undefined") {
    const q = body.newQuantity;
    if (!Number.isInteger(q) || q < 0) {
      return NextResponse.json(
        { message: "จำนวนสินค้าไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    updateData.quantity = q;
  }

  // ถ้าไม่มีฟิลด์ใดเลย ก็ไม่ต้องอัปเดต
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { message: "ไม่มีข้อมูลที่จะอัปเดต" },
      { status: 400 }
    );
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
