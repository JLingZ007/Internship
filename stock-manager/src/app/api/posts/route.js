import { connectMongoDB } from "../../../../lib/mongodb";
import Post from "../../../../models/post";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { title, img, content, quantity } = await req.json();
    console.log(" Received:", { title, img, content, quantity }); 
    await connectMongoDB();
    const created = await Post.create({ title, img, content, quantity });
    console.log(" Created:", created); // เพิ่มอีกบรรทัด
    return NextResponse.json({ message: "Post created"}, { status: 201 });
}


// export async function GET(req) {
//   await connectMongoDB();

//   // ดึงค่าจาก query string
//   const searchParams = req.nextUrl.searchParams;
//   const page = parseInt(searchParams.get("page")) || 1;
//   const limit = parseInt(searchParams.get("limit")) || 20;
//   const skip = (page - 1) * limit;

//   try {
//     const posts = await Post.find({})
//       .sort({ updatedAt: -1 })   // เรียงล่าสุดก่อน
//       .skip(skip)
//       .limit(limit)
//       .lean();                   // ลด overhead
//     const total = await Post.countDocuments();

//     return NextResponse.json({
//       posts,
//       page,
//       total,
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     console.error("Error loading posts:", err);
//     return NextResponse.json({ error: "Error loading posts" }, { status: 500 });
//   }
// }

export async function GET(req) {
    await connectMongoDB();
  
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const lastUpdatedAt = searchParams.get("lastUpdatedAt");
  
    const query = lastUpdatedAt
      ? { updatedAt: { $lt: new Date(lastUpdatedAt) } }  // เอาที่เก่ากว่า
      : {};
  
    try {
      const posts = await Post.find(query)
        .sort({ updatedAt: -1 })
        .limit(limit)
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