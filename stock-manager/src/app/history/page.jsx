"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, PlusCircle, Trash2 } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch("/api/history");
      const data = await res.json();
      setHistory(data.history);
    };
    fetchHistory();
  }, []);

  const renderAction = (action) => {
    switch (action) {
      case "add":
        return <span className="text-green-600 flex items-center gap-1"><PlusCircle className="w-4 h-4" /> เพิ่มสินค้า</span>;
      case "withdraw":
        return <span className="text-red-500 flex items-center gap-1"><ArrowDownCircle className="w-4 h-4" /> เบิกสินค้า</span>;
      case "increase":
        return <span className="text-blue-500 flex items-center gap-1"><ArrowUpCircle className="w-4 h-4" /> เพิ่มจำนวนสินค้า</span>;
      case "delete":
        return <span className="text-gray-500 flex items-center gap-1"><Trash2 className="w-4 h-4" /> ลบสินค้า</span>;
      default:
        return <span className="text-gray-600 capitalize">{action}</span>;
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">ประวัติการทำรายการสินค้า</h2>

      <div className="text-center mb-6">
        <Link
          href="/"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded shadow transition"
        >
          กลับหน้าหลัก
        </Link>
      </div>

      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xl font-semibold text-gray-600 uppercase tracking-wider">เวลา</th>
              <th scope="col" className="px-6 py-3 text-left text-xl font-semibold text-gray-600 uppercase tracking-wider">การกระทำ</th>
              <th scope="col" className="px-6 py-3 text-left text-xl font-semibold text-gray-600 uppercase tracking-wider">ชื่อสินค้า</th>
              <th scope="col" className="px-6 py-3 text-right text-xl font-semibold text-gray-600 uppercase tracking-wider">จำนวน</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {history.length > 0 ? (
              history.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-l text-gray-600 font-bold">{new Date(item.timestamp).toLocaleString("th-TH")}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-l font-medium">{renderAction(item.action)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-l text-gray-800">{item.productTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-l  text-right">{item.amount ?? "-"} ชิ้น</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">ยังไม่มีข้อมูลประวัติ</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
