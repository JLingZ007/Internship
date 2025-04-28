"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, PlusCircle, Trash2 } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(true); // ✅ เพิ่ม isLoading

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/history", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data.history);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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

  const filteredHistory = history.filter((item) => {
    if (!selectedDate) return true;
    const itemDate = new Date(item.timestamp).toISOString().split("T")[0];
    return itemDate === selectedDate;
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">
        ประวัติการทำรายการสินค้า
      </h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <Link
          href="/"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded shadow transition w-fit"
        >
          กลับหน้าหลัก
        </Link>

        <div className="text-right">
          <label className="block text-md font-semibold mb-1 text-gray-700">ค้นหาตามวันที่</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px] overflow-y-scroll">
            <table className="min-w-full text-sm text-left divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">เวลา</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">การกระทำ</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">ชื่อสินค้า</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">จำนวน</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">คงเหลือ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-200 transition duration-200">
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {new Date(item.timestamp).toLocaleString("th-TH")}
                      </td>
                      <td className="px-6 py-4">{renderAction(item.action)}</td>
                      <td className="px-6 py-4 text-gray-800">{item.productTitle}</td>
                      <td className="px-6 py-4 text-right">{item.amount ?? "-"} ชิ้น</td>
                      <td className="px-6 py-4 text-right">{item.remaining ?? "-"} ชิ้น</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                      {selectedDate ? "ไม่พบข้อมูลในวันที่เลือก" : "ยังไม่มีข้อมูลประวัติ"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
