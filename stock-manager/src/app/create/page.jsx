"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2 } from "lucide-react"; // ✅ import รูปไอคอนหมุนจาก lucide

function CreatePostPage() {
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    img: "",
    preview: null,
    content: "",
    quantity: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ เพิ่ม state สำหรับ Loader

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        img: reader.result,
        preview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { code, title, img, content, quantity } = formData;
    const defaultImage = "https://via.placeholder.com/300";

    if (!title || quantity <= 0) {
      const Swal = (await import("sweetalert2")).default;
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ!",
      });
      return;
    }

    try {
      setIsSubmitting(true); // ✅ เริ่มหมุน Loader

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          title,
          img: img || defaultImage,
          content,
          quantity: Number(quantity),
        }),
      });

      if (!res.ok) throw new Error("เกิดข้อผิดพลาด");

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

      const Swal = (await import("sweetalert2")).default;
      Swal.fire({
        icon: "success",
        title: "เพิ่มสินค้าสำเร็จ!",
        showConfirmButton: false,
        timer: 800,
      });

      setTimeout(() => router.push("/"), 900);

    } catch (error) {
      console.error(error);
      const Swal = (await import("sweetalert2")).default;
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเพิ่มสินค้าได้",
      });
    } finally {
      setIsSubmitting(false); // ✅ หยุดหมุน Loader
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
          {/* ชื่อสินค้า */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">ชื่อสินค้า *</label>
            <input
              name="title"
              onChange={handleChange}
              type="text"
              className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="กรอกชื่อสินค้า"
              disabled={isSubmitting} // ❗ระหว่าง submit ไม่ให้พิมพ์
            />
          </div>

          {/* จำนวนสินค้า */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">จำนวนสินค้า *</label>
            <div className="flex items-center gap-2">
              <input
                name="quantity"
                type="number"
                onChange={handleChange}
                className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="จำนวน"
                min="1"
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-600">ชิ้น</span>
            </div>
          </div>

          {/* รูปภาพ */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">รูปภาพสินค้า</label>
            <label className="flex flex-col items-center justify-center w-full h-48 px-4 transition bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400">
              {formData.preview ? (
                <img src={formData.preview} alt="preview" className="h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                  <p className="text-gray-400 text-sm mt-2">คลิกเพื่อเลือกรูปภาพ</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isSubmitting}
              />
            </label>
          </div>

          {/* รายละเอียด */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">รายละเอียดสินค้า</label>
            <textarea
              name="content"
              onChange={handleChange}
              rows={4}
              className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="กรอกรายละเอียดของสินค้า"
              disabled={isSubmitting}
            />
          </div>

          {/* ปุ่ม Submit พร้อม Loader */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" /> กำลังเพิ่ม...
              </>
            ) : (
              "➕ เพิ่มสินค้าใหม่"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePostPage;
