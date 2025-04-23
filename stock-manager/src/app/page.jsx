"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import DeleteBtn from "./DeleteBtn";
import {
  PlusCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  PackageMinus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";

export default function Home() {
  const [postData, setPostData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [sortOrder, setSortOrder] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawProduct, setWithdrawProduct] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(1);



  const getPosts = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/posts", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();
      setPostData(data.posts);
      setFilteredPosts(data.posts);
    } catch (error) {
      console.log("Error loading posts: ", error);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  useEffect(() => {
    let filtered = postData.filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortOrder === "asc") {
      filtered.sort((a, b) => a.quantity - b.quantity);
    } else if (sortOrder === "desc") {
      filtered.sort((a, b) => b.quantity - a.quantity);
    }

    setFilteredPosts(filtered);
  }, [searchQuery, postData, sortOrder]);

  const handleSort = () => {
    if (sortOrder === "") {
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortOrder("");
    }
  };

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
    <main className="container mx-auto px-4">
      <h1 className="text-3xl font-extrabold text-gray-800 text-center mt-8 mb-8 flex items-center justify-center gap-2">
        <PackageMinus className="w-7 h-7 text-green-600 " /> ระบบจัดการสต็อกสินค้า
      </h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <Link href="/create" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded shadow flex items-center gap-2">
            <PlusCircle className="w-5 h-5" /> เพิ่มสินค้าใหม่
          </Link>
          <Link href="/history" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow flex items-center gap-2">
            <Clock className="w-5 h-5" /> ประวัติการเบิก
          </Link>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาสินค้าด้วยชื่อหรือรายละเอียด..."
          className="w-full md:w-1/2 bg-white border border-gray-300 py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        {filteredPosts.length > 0 ? (
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border">#</th>
                <th className="p-3 border">รูป</th>
                <th className="p-3 border">ชื่อสินค้า</th>
                <th className="p-3 border cursor-pointer" onClick={handleSort}>
                  จำนวน
                  <span className="ml-2">
                    {sortOrder === "asc" ? <ArrowUp className="inline w-4 h-4" /> : sortOrder === "desc" ? <ArrowDown className="inline w-4 h-4" /> : <ArrowUpDown className="inline w-4 h-4" />}
                  </span>
                </th>
                <th className="p-3 border">รายละเอียด</th>
                <th className="p-3 border">อัปเดตล่าสุด</th>
                <th className="p-3 border">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((val, index) => (
                <tr key={val._id} className={`${val.quantity < 10 ? "bg-yellow-50" : ""} hover:bg-gray-50`}>
                  <td className="p-3 border text-center">{index + 1}</td>
                  <td className="p-3 border">
                    <Image
                      className="rounded-md shadow-md"
                      src={val.img || "/default-image.jpg"}
                      width={60}
                      height={60}
                      alt={val.title}
                    />
                  </td>
                  <td className="p-3 border font-semibold">{val.title}</td>
                  <td className={`p-3 border text-center font-bold ${val.quantity < 10 ? "text-red-500" : "text-green-600"}`}>
                    {val.quantity}
                    {val.quantity < 10 && <span className="ml-1 text-xs">(ใกล้หมด)</span>}
                  </td>
                  <td className="p-3 border text-gray-600">{val.content?.slice(0, 40)}...</td>
                  <td className="p-3 border text-sm text-gray-500">{formatDate(val.updatedAt)}</td>
                  <td className="p-3 border">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(val);
                          setShowModal(true);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> ดู
                      </button>
                      <button
                        onClick={() => {
                          setWithdrawProduct(val);
                          setWithdrawAmount(1);
                          setShowWithdrawModal(true);
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded text-sm flex items-center gap-1"
                      >
                        <PackageMinus className="w-4 h-4" /> เบิก
                      </button>
                      <Link
                        href={`/edit/${val._id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" /> แก้ไข
                      </Link>
                      <DeleteBtn id={val._id} icon={<Trash2 className="w-4 h-4" />} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center p-4 text-gray-500">
            {searchQuery ? "ไม่พบสินค้าที่ตรงกับคำค้นหา" : "ยังไม่มีข้อมูลสินค้าในระบบ"}
          </p>
        )}
      </div>

      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl transition"
            aria-label="Close"
          >
            &times;
          </button>
      
          <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">{selectedProduct.title}</h3>
      
          <div className="flex justify-center mb-4">
            <Image
              src={selectedProduct.img || "/default-image.jpg"}
              alt={selectedProduct.title}
              width={280}
              height={280}
              className="rounded-lg shadow-md object-cover"
            />
          </div>
      
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>จำนวนคงเหลือ:</strong>{" "}
              <span className={selectedProduct.quantity < 10 ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
                {selectedProduct.quantity}
              </span>
            </p>
      
            <p>
              <strong>รายละเอียด:</strong> {selectedProduct.content}
            </p>
      
            <p className="text-sm text-gray-400 pt-2 border-t mt-3">
              <strong>อัปเดตล่าสุด:</strong> {formatDate(selectedProduct.updatedAt)}
            </p>
          </div>
        </div>
      </div>
      
      )}

      {showWithdrawModal && withdrawProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg relative">
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">เบิกสินค้า: {withdrawProduct.title}</h3>

            <p className="mb-2">คงเหลือ: <span className="font-semibold">{withdrawProduct.quantity}</span></p>

            <input
              type="number"
              min="1"
              max={withdrawProduct.quantity}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4"
            />

            <button
              onClick={async () => {
                if (withdrawAmount <= 0 || withdrawAmount > withdrawProduct.quantity) {
                  Swal.fire({
                    icon: "warning",
                    title: "จำนวนเบิกไม่ถูกต้อง",
                    text: "กรุณาระบุจำนวนให้ถูกต้อง",
                  });
                  return;
                }

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
                    Swal.fire({
                      icon: "success",
                      title: "เบิกสินค้าสำเร็จ",
                      showConfirmButton: false,
                      timer: 1500,
                    });
            
                    setShowWithdrawModal(false);
                    getPosts(); // โหลดข้อมูลใหม่
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
                }
              }}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              ✅ ยืนยันการเบิก
            </button>
          </div>
        </div>
      )}


    </main>
  );
}
