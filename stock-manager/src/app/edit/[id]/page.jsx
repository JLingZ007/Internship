"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImg, setNewImg] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewImg(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newTitle || !newContent) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        text: "ชื่อและรายละเอียดสินค้าต้องไม่ว่าง",
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
          newImg: newImg || "https://picsum.photos/300",
          newContent,
          newQuantity: 1,
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
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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
              onError={(e) => (e.target.src = "https://picsum.photos/300")}
            />
          )}

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg"
            placeholder="รายละเอียดสินค้า"
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
