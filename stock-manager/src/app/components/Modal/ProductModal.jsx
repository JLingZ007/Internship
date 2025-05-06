"use client";

import Image from "next/image";

export default function ProductModal({ selectedProduct, onClose }) {
  if (!selectedProduct) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
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
          {selectedProduct.title}
        </h3>

        <div className="flex justify-center mb-4">
          <Image
            src={selectedProduct.img || "/image.svg"}
            alt={selectedProduct.title}
            width={280}
            height={280}
            className="rounded-lg shadow-md object-cover"
          />
        </div>

        <div className="space-y-2 text-gray-700">
          <p>
            <strong>จำนวนคงเหลือ:</strong>{" "} 
            <span
              className={
                selectedProduct.quantity < 10
                  ? "text-red-500 font-semibold"
                  : "text-green-600 font-semibold"
              }
            >
              {selectedProduct.quantity} ชิ้น
            </span>
          </p>

          <p>
            <strong>รายละเอียด:</strong> {selectedProduct.content || "-"}
          </p>

          <p className="text-sm text-gray-400 pt-2 border-t mt-3">
            <strong>อัปเดตล่าสุด:</strong> {formatDate(selectedProduct.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
