import { connectMongoDB } from "../../../../lib/mongodb";
import Category from "../../../../models/category";
import { NextResponse } from "next/server";

// GET
export async function GET() {
  await connectMongoDB();
  const categories = await Category.find().sort({ createdAt: -1 });
  return NextResponse.json({ categories });
}

// POST
export async function POST(req) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ message: "กรุณาระบุชื่อหมวดหมู่" }, { status: 400 });

  await connectMongoDB();
  const created = await Category.create({ name });
  return NextResponse.json({ message: "เพิ่มหมวดหมู่แล้ว", category: created }, { status: 201 });
}
