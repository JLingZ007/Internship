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


export async function GET() {
    await connectMongoDB();
    const posts = await Post.find({});
    return NextResponse.json({ posts });
}

export async function DELETE(req) {
    const id = req.nextUrl.searchParams.get("id");
    await connectMongoDB();
    await Post.findByIdAndDelete(id);
    return NextResponse.json({ message: "Post deleted" }, { status: 200 });
}