"use client";

import { useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";

export default function WithdrawModal({
  withdrawProduct,
  withdrawAmount,
  setWithdrawAmount,
  onClose,
  onWithdrawSuccess,
}) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  if (!withdrawProduct) return null;

  const handleWithdraw = async () => {
    if (withdrawAmount <= 0 || withdrawAmount > withdrawProduct.quantity) {
      Swal.fire({
        icon: "warning",
        title: "จำนวนเบิกไม่ถูกต้อง",
        text: "กรุณาระบุจำนวนให้ถูกต้อง",
      });
      return;
    }

    setIsWithdrawing(true);

    try {
      const updatedQuantity = withdrawProduct.quantity - withdrawAmount;

      const res = await fetch(`/api/posts/${withdrawProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newTitle: withdrawProduct.title,
          newImg: withdrawProduct.img,
          newContent: withdrawProduct.content,
          newQuantity: updatedQuantity,
        }),
      });

      if (res.ok) {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "withdraw",
            productId: withdrawProduct._id,
            productTitle: withdrawProduct.title,
            amount: withdrawAmount,
            remaining: updatedQuantity,
            timestamp: new Date().toISOString(),
          }),
        });

        Swal.fire({
          icon: "success",
          title: "เบิกสินค้าสำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });

        onWithdrawSuccess();
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถเบิกสินค้าได้",
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
      setIsWithdrawing(false);
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
          เบิกสินค้า: {withdrawProduct.title}
        </h3>

        <div className="flex justify-center mb-4">
          <Image
            src={withdrawProduct.img || "/image.svg"}
            alt={withdrawProduct.title}
            width={280}
            height={280}
            className="rounded-lg shadow-md object-cover"
          />
        </div>

        <div className="space-y-4 text-gray-700">
          <p>
            <strong>จำนวนคงเหลือ:</strong>{" "}
            <span className={withdrawProduct.quantity < 10 ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
              {withdrawProduct.quantity}
            </span>
          </p>

          <p>
            <strong>รายละเอียด:</strong> {withdrawProduct.content}
          </p>

          <div>
            <label htmlFor="amount" className="block font-medium mb-1">
              จำนวนที่ต้องการเบิก
            </label>
            <input
              id="amount"
              type="number"
              min="1"
              max={withdrawProduct.quantity}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-4 py-2"
              disabled={isWithdrawing}
            />
          </div>

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className={`w-full flex items-center justify-center gap-2 
              ${isWithdrawing ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} 
              text-white py-2 px-4 rounded-lg transition`}
          >
            {isWithdrawing && (
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
            {isWithdrawing ? "กำลังเบิก..." : "✅ ยืนยันการเบิก"}
          </button>
        </div>
      </div>
    </div>
  );
}
