"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import debounce from "lodash.debounce";  // ✅ ใช้ lodash debounce
import {
  PlusCircle, Clock, Eye, Edit, Plus, Trash2, PackageMinus, ArrowUp, ArrowDown, ArrowUpDown,
} from "lucide-react";

// Dynamic import
const DeleteBtn = dynamic(() => import("./components/DeleteBtn"), { ssr: false });
const ProductModal = dynamic(() => import("./components/Modal/ProductModal"));
const WithdrawModal = dynamic(() => import("./components/Modal/WithdrawModal"));
const AddStockModal = dynamic(() => import("./components/Modal/AddStockModal"));

export default function Home() {
  const [postData, setPostData] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [withdrawProduct, setWithdrawProduct] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(1);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const [addProduct, setAddProduct] = useState(null);
  const [addAmount, setAddAmount] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const getPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const { posts } = await res.json();
      setPostData(posts);
      setFilteredPosts(posts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getPosts();
  }, [getPosts]);

  // ✅ ใช้ debounce search
  const handleSearch = useCallback(debounce((value) => {
    setSearchQuery(value);
  }, 300), []);

  useEffect(() => {
    let filtered = postData.filter((post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortOrder === "asc") {
      filtered.sort((a, b) => a.quantity - b.quantity);
    } else if (sortOrder === "desc") {
      filtered.sort((a, b) => b.quantity - a.quantity);
    }

    setFilteredPosts(filtered);
  }, [postData, searchQuery, sortOrder]);

  const handleSort = () => {
    if (sortOrder === "") setSortOrder("asc");
    else if (sortOrder === "asc") setSortOrder("desc");
    else setSortOrder("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(dateString));
  };

  return (
    <main className="container mx-auto px-4">
      {/* Header */}
      <h1 className="text-3xl font-extrabold text-center text-gray-800 my-8 flex items-center justify-center gap-2">
        <PackageMinus className="w-7 h-7 text-green-600" /> รายการสินค้าในคลัง
      </h1>

      {/* Control Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <Link href="/create" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center gap-2">
            <PlusCircle className="w-5 h-5" /> เพิ่มสินค้าใหม่
          </Link>
          <Link href="/history" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center gap-2">
            <Clock className="w-5 h-5" /> ประวัติการทำรายการ
          </Link>
        </div>
        <input
          type="text"
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="ค้นหาสินค้าด้วยชื่อหรือรายละเอียด..."
          className="w-full md:w-1/2 bg-white border border-gray-300 py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border">#</th>
                <th className="p-3 border">รูป</th>
                <th className="p-3 border">ชื่อสินค้า</th>
                <th className="p-3 border cursor-pointer" onClick={handleSort}>
                  จำนวน
                  <span className="ml-2">{sortOrder === "asc" ? <ArrowUp /> : sortOrder === "desc" ? <ArrowDown /> : <ArrowUpDown />}</span>
                </th>
                <th className="p-3 border">รายละเอียด</th>
                <th className="p-3 border">อัปเดตล่าสุด</th>
                <th className="p-3 border">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((val, index) => (
                <tr key={val._id} className={val.quantity === 0 ? "bg-red-100" : val.quantity < 10 ? "bg-yellow-50" : ""}>
                  <td className="p-3 border text-center">{index + 1}</td>
                  <td className="p-3 border">
                    <Image src={val.img || "/image.svg"} alt={val.title} width={60} height={60} className="rounded-md shadow-md" />
                  </td>
                  <td className="p-3 border font-semibold">{val.title}</td>
                  <td className={`p-3 border text-center font-bold ${val.quantity === 0 ? "text-red-700" : val.quantity < 10 ? "text-red-500" : "text-green-600"}`}>
                    {val.quantity} {val.quantity === 0 ? <span className="ml-1 text-xs">(ของหมด)</span> : val.quantity < 10 ? <span className="ml-1 text-xs">(ใกล้หมด)</span> : null}
                  </td>
                  <td className="p-3 border text-gray-600">{val.content?.slice(0, 40)}</td>
                  <td className="p-3 border text-sm text-gray-500">{formatDate(val.updatedAt)}</td>
                  <td className="p-3 border">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => { setSelectedProduct(val); setShowModal(true); }} className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm flex items-center gap-1 cursor-pointer">
                        <Eye className="w-4 h-4" /> ดู
                      </button>
                      <button onClick={() => { setWithdrawProduct(val); setWithdrawAmount(1); setShowWithdrawModal(true); }} disabled={val.quantity === 0} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded text-sm flex items-center gap-1 cursor-pointer">
                        <PackageMinus className="w-4 h-4" /> เบิก
                      </button>
                      <button onClick={() => { setAddProduct(val); setAddAmount(1); setShowAddModal(true); }} className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded text-sm flex items-center gap-1 cursor-pointer">
                        <Plus className="w-4 h-4" /> เพิ่ม
                      </button>
                      <Link href={`/edit/${val._id}`} className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm flex items-center gap-1">
                        <Edit className="w-4 h-4" /> แก้ไข
                      </Link>
                      <DeleteBtn id={val._id} title={val.title} quantity={val.quantity} icon={<Trash2 className="w-4 h-4" />} />
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

      {/* Modals */}
      {showModal && selectedProduct && (
        <ProductModal selectedProduct={selectedProduct} onClose={() => setShowModal(false)} />
      )}
      {showWithdrawModal && withdrawProduct && (
        <WithdrawModal
          withdrawProduct={withdrawProduct}
          withdrawAmount={withdrawAmount}
          setWithdrawAmount={setWithdrawAmount}
          onClose={() => setShowWithdrawModal(false)}
          onWithdrawSuccess={getPosts}
        />
      )}
      {showAddModal && addProduct && (
        <AddStockModal
          addProduct={addProduct}
          addAmount={addAmount}
          setAddAmount={setAddAmount}
          onClose={() => setShowAddModal(false)}
          onAddSuccess={getPosts}
        />
      )}
    </main>
  );
}
