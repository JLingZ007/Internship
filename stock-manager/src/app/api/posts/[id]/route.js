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
    newCategory,    // ✅ รับหมวดหมู่ใหม่
  } = await req.json();

  // ตรวจสอบข้อมูล
  if (!newTitle || !newCategory) {
    return NextResponse.json(
      { message: "กรุณาระบุชื่อสินค้าและหมวดหมู่" },
      { status: 400 }
    );
  }

  try {
    await connectMongoDB();
    const updated = await Post.findByIdAndUpdate(
      id,
      {
        title: newTitle,
        img: newImg,
        content: newContent,
        category: newCategory,  // ✅ อัปเดต category
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "ไม่พบสินค้า" }, { status: 404 });
    }

    return NextResponse.json({ message: "อัปเดตสำเร็จ", post: updated }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "เกิดข้อผิดพลาด", error: err }, { status: 500 });
  }
}
