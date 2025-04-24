"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { ImageIcon } from "lucide-react";

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
      const res = await fetch(`/api/posts/${id}`);
      if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลสินค้าได้");
      const data = await res.json();
      setNewTitle(data.post.title || "");
      setNewContent(data.post.content || "");
      setNewImg(data.post.img || "");
      setPreview(data.post.img || null);
    } catch (error) {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) getPostById(id);
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

    if (!newTitle) {
      Swal.fire({ icon: "warning", title: "กรุณาระบุชื่อสินค้า" });
      return;
    }

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newTitle,
          newImg: newImg || "https://picsum.photos/300",
          newContent,
          newQuantity: 1,
        }),
      });

      if (res.ok) {
        Swal.fire({ icon: "success", title: "แก้ไขสำเร็จ", timer: 1000, showConfirmButton: false });
        setTimeout(() => router.push("/"), 1100);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "ไม่สามารถอัปเดตได้");
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: error.message });
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
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-gray-600 hover:underline">&larr; กลับหน้าหลัก</Link>
          <span className="text-sm text-blue-600 font-medium">แก้ไข</span>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800">แก้ไขสินค้า</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">ชื่อสินค้า *</label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              type="text"
              className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="ชื่อสินค้า"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">รูปภาพสินค้า</label>
            <label className="flex flex-col items-center justify-center w-full h-48 px-4 transition bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400">
              {preview ? (
                <img src={preview} alt="preview" className="h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                  <p className="text-gray-400 text-sm mt-2">คลิกเพื่อเลือกรูปภาพ หรือปล่อยไฟล์วาง</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">รายละเอียดสินค้า</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
              className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="รายละเอียดสินค้า"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-200 cursor-pointer"
          >
            ✅ อัปเดตสินค้า
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditPostPage;
