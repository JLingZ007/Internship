import { connectMongoDB } from "../../../../../lib/mongodb";
import Post from "../../../../../models/post";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  const { id } = context.params;
  
  await connectMongoDB();
  const post = await Post.findById(id); // ใช้ findById ตรงไปเลย

  if (!post) {
    return NextResponse.json({ message: "ไม่พบสินค้า" }, { status: 404 });
  }

  return NextResponse.json({ post }, { status: 200 });
}

export async function PUT(req, context) {
  const { id } = await context.params;
  const { newTitle, newImg, newContent, newQuantity } = await req.json();

  if (!newTitle || !Number.isInteger(newQuantity) || newQuantity < 0) {
    return NextResponse.json(
      { message: "กรุณากรอกข้อมูลให้ครบถ้วนและจำนวนสินค้าต้องไม่ติดลบ" },
      { status: 400 }
    );
  }

  try {
    await connectMongoDB();
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        title: newTitle,
        img: newImg,
        content: newContent,
        quantity: newQuantity,
      },
      { new: true }
    );

    if (!updatedPost) {
      return NextResponse.json({ message: "ไม่พบสินค้า" }, { status: 404 });
    }

    return NextResponse.json({ message: "อัปเดตสินค้าสำเร็จ" }, { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการอัปเดต" }, { status: 500 });
  }
}

