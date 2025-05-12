"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ImageIcon, Loader2 } from "lucide-react";

function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    img: "",
    preview: null,
    category: "",       // ✅ เพิ่ม field category
  });
  const [categories, setCategories] = useState([]);  // ✅ รายการหมวดหมู่
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ดึงหมวดหมู่ทั้งหมด
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // ดึงข้อมูลสินค้าเดิม
  const fetchPost = async (id) => {
    try {
      const res = await fetch(`/api/posts/${id}`);
      if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลสินค้าได้");
      const { post } = await res.json();

      setFormData({
        title: post.title || "",
        content: post.content || "",
        img: post.img || "",
        preview: post.img || null,
        category: post.category?._id || "",  // ✅ เซ็ตหมวดหมู่เดิม
      });
    } catch (error) {
      const Swal = (await import("sweetalert2")).default;
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPost(id);
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) return;
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
    const { title, content, img, category } = formData;

    if (!title || !category) {
      const Swal = (await import("sweetalert2")).default;
      Swal.fire({ icon: "warning", title: "กรุณาระบุชื่อสินค้าและหมวดหมู่" });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newTitle: title,
          newImg: img || "/image.svg",
          newContent: content,
          newCategory: category,  // ✅ ส่งหมวดหมู่ไปด้วย
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "ไม่สามารถอัปเดตได้");
      }

      const Swal = (await import("sweetalert2")).default;
      Swal.fire({ icon: "success", title: "แก้ไขสำเร็จ", timer: 1000, showConfirmButton: false });
      setTimeout(() => router.push("/"), 1100);
    } catch (error) {
      const Swal = (await import("sweetalert2")).default;
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-gray-600 hover:underline">&larr; กลับหน้าหลัก</Link>
          <span className="text-sm text-blue-600 font-medium">แก้ไข</span>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800">แก้ไขสินค้า</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ชื่อสินค้า */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">ชื่อสินค้า *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              type="text"
              className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="ชื่อสินค้า"
              disabled={isSubmitting}
            />
          </div>

          {/* หมวดหมู่ */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">หมวดหมู่ *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- เลือกหมวดหมู่ --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* รูปภาพ */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">รูปภาพสินค้า</label>
            <label className="flex flex-col items-center justify-center w-full h-48 px-4 transition bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400">
              {formData.preview ? (
                <img src={formData.preview} alt="preview" className="h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                  <p className="text-gray-400 text-sm mt-2">คลิกเพื่อเลือกรูปภาพ หรือปล่อยไฟล์วาง</p>
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
              value={formData.content}
              onChange={handleChange}
              rows={4}
              className="w-full bg-gray-100 border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="รายละเอียดสินค้า"
              disabled={isSubmitting}
            />
          </div>

          {/* ปุ่ม Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังอัปเดต...
              </>
            ) : (
              "✅ อัปเดตสินค้า"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditPostPage;
