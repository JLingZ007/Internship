"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newQuantity, setNewQuantity] = useState(0);
  const [newImg, setNewImg] = useState(""); // ภาพจาก database
  const [preview, setPreview] = useState(null); // ภาพ preview ใหม่
  const [loading, setLoading] = useState(true); // สำหรับแสดงสถานะโหลด

  // ดึงข้อมูลจาก post เดิม
  const getPostById = async (id) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลสินค้าได้");
      }

      const data = await res.json();
      setNewTitle(data.post.title || "");
      setNewContent(data.post.content || "");
      setNewQuantity(data.post.quantity || 0);
      setNewImg(data.post.img || "");
      setPreview(data.post.img || null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getPostById(id);
    }
  }, [id]);

  // จัดการการอัพโหลดรูปภาพ
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewImg(reader.result); // set image ที่จะส่งไป backend
      setPreview(reader.result); // ใช้แสดง preview
    };
    reader.readAsDataURL(file);
  };

  // อัปเดตข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!newTitle || !newContent || !Number.isInteger(Number(newQuantity)) || newQuantity <= 0) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        text: "ชื่อ, รายละเอียด, และจำนวนสินค้าต้องถูกต้องและมากกว่า 0",
      });
      return;
    }

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newTitle,
          newImg: newImg || "https://picsum.photos/300", // Fallback image
          newContent,
          newQuantity: Number(newQuantity),
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "แก้ไขสำเร็จ",
          showConfirmButton: false,
          timer: 1000,
        });
        setTimeout(() => {
          router.push("/");
        }, 1100);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "ไม่สามารถอัปเดตได้");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        confirmButtonText: "ตกลง",
      });
    }
  };

  if (loading) {
    return <div className="text-center mt-10">กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h3 className="text-3xl font-extrabold text-center text-gray-800 mb-4">แก้ไขสินค้า</h3>

        <Link
          href="/"
          className="block text-center mb-6 text-sm text-gray-600 hover:text-gray-900"
        >
          ⬅ กลับหน้าหลัก
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            type="text"
            className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg"
            placeholder="ชื่อสินค้า"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full bg-white border border-gray-300 py-2 px-4 rounded-lg cursor-pointer"
          />

          {(preview || newImg) && (
            <img
              src={preview || newImg}
              alt="Preview"
              className="w-full h-auto object-cover rounded-lg border border-gray-300"
              onError={(e) => (e.target.src = "https://picsum.photos/300")} // Fallback ถ้ารูปเสีย
            />
          )}

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg"
            placeholder="รายละเอียดสินค้า"
          />

          <input
            type="number"
            value={newQuantity}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^[0-9]+$/.test(value)) {
                setNewQuantity(Number(value) || 0);
              }
            }}
            className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg"
            placeholder="จำนวนสินค้า"
            min="1"
            step="1"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            ✅ อัปเดตสินค้า
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditPostPage;