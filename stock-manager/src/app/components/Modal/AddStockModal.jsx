"use client";

import { useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";

export default function AddStockModal({
  addProduct,
  addAmount,
  setAddAmount,
  onClose,
  onAddSuccess,
}) {
  const [isAdding, setIsAdding] = useState(false);

  if (!addProduct) return null;

  const handleAddStock = async () => {
    if (addAmount <= 0) {
      Swal.fire({
        icon: "warning",
        title: "จำนวนไม่ถูกต้อง",
        text: "กรุณาระบุจำนวนให้ถูกต้อง",
      });
      return;
    }

    setIsAdding(true);

    try {
      const updatedQuantity = addProduct.quantity + addAmount;

      const res = await fetch(`/api/posts/${addProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newTitle: addProduct.title,
          newImg: addProduct.img,
          newContent: addProduct.content,
          newQuantity: updatedQuantity,
        }),
      });

      if (res.ok) {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "increase",
            productId: addProduct._id,
            productTitle: addProduct.title,
            amount: addAmount,
            remaining: updatedQuantity,
            timestamp: new Date().toISOString(),
          }),
        });

        Swal.fire({
          icon: "success",
          title: "เพิ่มสินค้าเรียบร้อย",
          showConfirmButton: false,
          timer: 1500,
        });

        onAddSuccess(); // โหลดข้อมูลใหม่
        onClose(); // ปิด Modal
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถเพิ่มสินค้าได้",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl transition cursor-pointer"
          aria-label="Close"
        >
          &times;
        </button>

        <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">
          เพิ่มจำนวนสินค้า: {addProduct.title}
        </h3>

        <div className="flex justify-center mb-4">
          <Image
            src={addProduct.img || "/image.svg"}
            alt={addProduct.title}
            width={280}
            height={280}
            className="rounded-lg shadow-md object-cover"
          />
        </div>

        <div className="space-y-4 text-gray-700">
          <p>
            <strong>จำนวนปัจจุบัน:</strong>{" "}
            <span className="text-green-600 font-semibold">{addProduct.quantity}</span>
          </p>

          <p>
            <strong>รายละเอียด:</strong> {addProduct.content}
          </p>

          <div>
            <label htmlFor="amount" className="block font-medium mb-1">
              จำนวนที่ต้องการเพิ่ม
            </label>
            <input
              id="amount"
              type="number"
              min="1"
              value={addAmount}
              onChange={(e) => setAddAmount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-4 py-2"
              disabled={isAdding}
            />
          </div>

          <button
            onClick={handleAddStock}
            disabled={isAdding}
            className={`w-full flex items-center justify-center gap-2 
              ${isAdding ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} 
              text-white py-2 px-4 rounded-lg transition`}
          >
            {isAdding && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                />
              </svg>
            )}
            {isAdding ? "กำลังเพิ่ม..." : "✅ ยืนยันการเพิ่มจำนวน"}
          </button>
        </div>
      </div>
    </div>
  );
}
