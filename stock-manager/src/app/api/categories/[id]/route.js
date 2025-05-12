import { connectMongoDB } from "../../../../../lib/mongodb";
import Category from "../../../../../models/category";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const { id } = await params; // ✅ await params ตรง ๆ ตาม Next.js 15

  const { name } = await req.json();

  await connectMongoDB();
  const updated = await Category.findByIdAndUpdate(id, { name }, { new: true });

  return NextResponse.json({ message: "อัปเดตสำเร็จ", category: updated });
}

export async function DELETE(_, { params }) {
  const { id } = await params; // ✅ เช่นเดียวกัน

  await connectMongoDB();
  await Category.findByIdAndDelete(id);

  return NextResponse.json({ message: "ลบหมวดหมู่แล้ว" });
}
