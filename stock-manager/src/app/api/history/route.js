import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import History from "../../../../models/History";

export async function POST(req) {
  const body = await req.json();
  await connectMongoDB();
  const history = await History.create({
    ...body,
    remaining: body.remaining, // ✅ เพิ่มฟิลด์ remaining ลงใน document
  });
  return NextResponse.json({ success: true, history });
}

export async function GET() {
  await connectMongoDB();
  const history = await History.find().sort({ timestamp: -1 });
  return NextResponse.json({ history });
}

export async function DELETE(req) {
  const body = await req.json();
  await connectMongoDB();
  const history = await History.create({
    action: "delete",
    productId: body.productId,
    productTitle: body.productTitle,
    timestamp: new Date().toISOString(),
  });
  return NextResponse.json({ success: true, history });
}
