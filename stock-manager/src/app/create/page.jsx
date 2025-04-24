"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { ImageIcon } from 'lucide-react';

function CreatePostPage() {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [img, setImg] = useState("");
  const [preview, setPreview] = useState(null);
  const [content, setContent] = useState("");
  const [quantity, setQuantity] = useState("");

  const router = useRouter();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImg(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const defaultImage = "https://via.placeholder.com/300";

    if (!title || !code || quantity <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ!',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    const imageToUpload = img || defaultImage;

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          title,
          img: imageToUpload,
          content,
          quantity: Number(quantity),
        }),
      });

      if (res.ok) {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add",
            productTitle: title,
            amount: Number(quantity),
            remaining: Number(quantity),
            timestamp: new Date().toISOString(),
          }),
        });

        Swal.fire({
          icon: 'success',
          title: 'เพิ่มสินค้าสำเร็จ!',
          showConfirmButton: false,
          timer: 800,
        });

        setTimeout(() => router.push("/"), 900);
      } else {
        throw new Error("เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเพิ่มสินค้าได้',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-gray-600 hover:underline">&larr; กลับหน้าหลัก</Link>
          <span className="text-sm text-green-600 font-medium">สินค้าใหม่</span>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800">เพิ่มสินค้าใหม่</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">ชื่อสินค้า *</label>
              <input
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="กรอกชื่อสินค้า"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">จำนวนสินค้า *</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="จำนวน"
                min="1"
              />
              <span className="text-sm text-gray-600">ชิ้น</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">รูปภาพสินค้า</label>
            <label className="flex flex-col items-center justify-center w-full h-48 px-4 transition bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400">
              {preview ? (
                <img src={preview} alt="preview" className="h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                  <p className="text-gray-400 text-sm mt-2">คลิกเพื่อเลือกรูปภาพ หรือลากมาใส่ลงวาง</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">รายละเอียดสินค้า</label>
            <textarea
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="กรอกรายละเอียดของสินค้า"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-200 cursor-pointer"
          >
            ➕ เพิ่มสินค้าใหม่
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePostPage;
