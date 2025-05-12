import { connectMongoDB } from "../../../../lib/mongodb";
import Post from "../../../../models/post";
import { NextResponse } from "next/server";


export async function POST(req) {
  const { title, img, content, quantity, category } = await req.json();

  console.log("Received:", { title, img, content, quantity, category });

  // ✅ ตรวจสอบข้อมูลที่จำเป็น
  if (!title || !quantity || !category) {
    return NextResponse.json(
      { message: "กรุณากรอกข้อมูลให้ครบ: ชื่อ, จำนวน, และ หมวดหมู่ จำเป็น" },
      { status: 400 }
    );
  }

  try {
    await connectMongoDB();
    const created = await Post.create({
      title,
      img,
      content,
      quantity,
      category, // ✅ บันทึก category (_id ของ Category)
    });

    console.log("Created:", created);
    return NextResponse.json({ message: "Post created", post: created }, { status: 201 });
  } catch (error) {
    console.error("Create error:", error);
    return NextResponse.json({ message: "ไม่สามารถสร้างสินค้าได้", error }, { status: 500 });
  }
}

export async function GET(req) {
  await connectMongoDB();

  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit")) || 20;
  const lastUpdatedAt = searchParams.get("lastUpdatedAt");
  const category = searchParams.get("category");

  // ✅ สร้าง query แบบ dynamic
  const query = {};

  if (lastUpdatedAt) {
    query.updatedAt = { $lt: new Date(lastUpdatedAt) };
  }

  if (category) {
    query.category = category; // ต้องเป็น _id ของ category
  }

  try {
    const posts = await Post.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate("category") // ✅ เพื่อให้ได้ชื่อหมวดหมู่แทนแค่ _id
      .lean();

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Error loading posts:", err);
    return NextResponse.json({ posts: [], error: "Error" }, { status: 500 });
  }
}

  

export async function DELETE(req) {
    const id = req.nextUrl.searchParams.get("id");
    await connectMongoDB();
    await Post.findByIdAndDelete(id);
    return NextResponse.json({ message: "Post deleted" }, { status: 200 });
}