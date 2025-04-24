"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

function CreatePostPage() {
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

    if (!title || !content || quantity <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    const imageToUpload = img || defaultImage;

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          img: imageToUpload,
          content,
          quantity: Number(quantity)
        })
      });

      if (res.ok) {
        // ✅ เพิ่มการบันทึก log
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add",
            productTitle: title,
            amount: Number(quantity),
            timestamp: new Date().toISOString()
          })
        });

        Swal.fire({
          icon: 'success',
          title: 'เพิ่มสินค้าสำเร็จ!',
          showConfirmButton: false,
          timer: 800
        });

        setTimeout(() => {
          router.push("/");
        }, 900);

      } else {
        throw new Error("เกิดข้อผิดพลาดในการสร้าง");
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเพิ่มสินค้าได้',
        confirmButtonText: 'ลองอีกครั้ง'
      });
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 py-10 px-4'>
      <div className='max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg'>
        <h3 className='text-3xl font-extrabold text-center text-gray-800 mb-4'>เพิ่มสินค้าใหม่</h3>

        <Link
          href="/"
          className='block text-center mb-6 text-sm text-gray-600 hover:text-gray-900'
        >
          ⬅ กลับหน้าหลัก
        </Link>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            className='w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400'
            placeholder='ชื่อสินค้า'
          />

          <input
            onChange={handleImageChange}
            type="file"
            accept='image/*'
            className='w-full bg-white border border-gray-300 py-2 px-4 rounded-lg cursor-pointer'
          />

          {preview && (
            <img
              src={preview}
              alt="preview"
              className='w-full h-auto object-cover rounded-lg border border-gray-300'
            />
          )}

          <textarea
            onChange={(e) => setContent(e.target.value) || ("")}
            rows={4}
            className='w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400'
            placeholder='รายละเอียดของสินค้า'
          />

          <input
            type="number"
            onChange={(e) => setQuantity(e.target.value)}
            className='w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400'
            placeholder='จำนวนสินค้า'
            min="1"
          />

          <button
            type='submit'
            className='w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200'
          >
            ➕ สร้างสินค้า
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePostPage;
