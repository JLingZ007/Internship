"use client";

import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch("/api/history");
      const data = await res.json();
      setLogs(data.logs);
    };

    fetchLogs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ประวัติการดำเนินการ</h1>
      <table className="w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="p-3">วันที่</th>
            <th className="p-3">รายการ</th>
            <th className="p-3">ชื่อสินค้า</th>
            <th className="p-3">จำนวน</th>
            <th className="p-3">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index} className="border-t">
              <td className="p-3">{new Date(log.date).toLocaleString("th-TH")}</td>
              <td className="p-3">{log.action}</td>
              <td className="p-3">{log.productName}</td>
              <td className="p-3">{log.quantityChanged}</td>
              <td className="p-3">{log.note || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
