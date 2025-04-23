import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import History from "../../../../models/History"; // ✅ ถูกต้อง (H ใหญ่)

export async function POST(req) {
  const { action, productId, productName, quantityChanged, note } = await req.json();
  await connectMongoDB();
  await History.create({ action, productId, productName, quantityChanged, note });
  return NextResponse.json({ message: "History logged" }, { status: 201 });
}

export async function GET() {
  await connectMongoDB();
  const logs = await History.find().sort({ date: -1 });
  return NextResponse.json({ logs });
}
