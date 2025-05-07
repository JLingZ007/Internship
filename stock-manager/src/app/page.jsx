"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import debounce from "lodash.debounce";
import {
  PlusCircle, Clock, Eye, Edit, Plus, Trash2, PackageMinus,
  ArrowUp, ArrowDown, ArrowUpDown, Search
} from "lucide-react";

const DeleteBtn = dynamic(() => import("./components/DeleteBtn"), { ssr: false });
const ProductModal = dynamic(() => import("./components/Modal/ProductModal"));
const WithdrawModal = dynamic(() => import("./components/Modal/WithdrawModal"));
const AddStockModal = dynamic(() => import("./components/Modal/AddStockModal"));

const LIMIT = 20; // จำนวนสินค้าที่โหลดต่อรอบ

export default function Home() {
  const [postData, setPostData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [withdrawProduct, setWithdrawProduct] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(1);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const [addProduct, setAddProduct] = useState(null);
  const [addAmount, setAddAmount] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const observerRef = useRef(null);
  const tableContainerRef = useRef(null);

  const fetchPosts = useCallback(async () => {
    if (!hasMore || isLoading) return;
  
    setIsLoading(true);
    try {
      const lastItem = postData[postData.length - 1];
      const lastUpdatedAt = lastItem?.updatedAt;
  
      const url = new URL("/api/posts", window.location.origin);
      url.searchParams.set("limit", LIMIT);
      if (lastUpdatedAt) {
        url.searchParams.set("lastUpdatedAt", lastUpdatedAt);
      }
  
      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();
  
      if (!Array.isArray(data.posts) || data.posts.length < LIMIT) setHasMore(false);
  
      setPostData(prev => {
        const existingIds = new Set(prev.map(p => p._id));
        const uniqueNew = data.posts.filter(p => !existingIds.has(p._id));
        return [...prev, ...uniqueNew];
      });
    } catch (err) {
      console.error("Error loading posts:", err);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [postData, hasMore, isLoading]);
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ✅ IntersectionObserver for lazyload
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isLoading && hasMore) {
        setPage(prev => prev + 1);
      }
    }, {
      rootMargin: "200px",
    });

    const sentinel = document.getElementById("load-more-sentinel");
    if (sentinel) observer.observe(sentinel);
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [isLoading, hasMore]);

  const handleSearch = useCallback(debounce((value) => {
    setSearchQuery(value);
  }, 300), []);

  const filteredPosts = useMemo(() => {
    let filtered = postData.filter(post =>
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortOrder === "asc") {
      filtered.sort((a, b) => a.quantity - b.quantity);
    } else if (sortOrder === "desc") {
      filtered.sort((a, b) => b.quantity - a.quantity);
    }

    return filtered;
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
    <main className="container mx-auto px-4 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white pt-4 pb-4 shadow-sm">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 my-6 flex items-center justify-center gap-2">
          <PackageMinus className="w-8 h-8 text-green-600" /> 
          <span className="bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
            ระบบจัดการสินค้าในคลัง
          </span>
        </h1>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <Link href="/create" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg">
              <PlusCircle className="w-5 h-5" /> เพิ่มสินค้าใหม่
            </Link>
            <Link href="/history" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg">
              <Clock className="w-5 h-5" /> ประวัติการทำรายการ
            </Link>
          </div>
          <div className="relative w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="ค้นหาสินค้าด้วยชื่อหรือรายละเอียด..."
              className="w-full bg-white border border-gray-300 py-2 pl-10 pr-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table Container with Fixed Height */}
      <div 
        ref={tableContainerRef} 
        className="overflow-auto bg-white rounded-lg shadow-lg border border-gray-200"
        style={{ maxHeight: "calc(100vh - 230px)", minHeight: "400px" }}
      >
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
            <tr>
              <th className="p-3 border-b border-r border-gray-200 w-12 text-center">#</th>
              <th className="p-3 border-b border-r border-gray-200 w-20">รูป</th>
              <th className="p-3 border-b border-r border-gray-200 w-1/4">ชื่อสินค้า</th>
              <th className="p-3 border-b border-r border-gray-200 w-24 cursor-pointer" onClick={handleSort}>
                <div className="flex items-center justify-between">
                  จำนวน
                  {sortOrder === "asc" ? 
                    <ArrowUp className="w-4 h-4" /> : 
                    sortOrder === "desc" ? 
                    <ArrowDown className="w-4 h-4" /> : 
                    <ArrowUpDown className="w-4 h-4" />
                  }
                </div>
              </th>
              <th className="p-3 border-b border-r border-gray-200 w-30">รายละเอียด</th>
              <th className="p-3 border-b border-r border-gray-200 w-30">อัปเดตล่าสุด</th>
              <th className="p-3 border-b border-gray-200 w-60 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((val, index) => (
                <tr 
                  key={`${val._id}-${index}`} 
                  className={`hover:bg-gray-50 ${
                    val.quantity === 0 
                    ? "bg-red-50" 
                    : val.quantity < 10 
                    ? "bg-yellow-50" 
                    : ""
                  } transition-colors`}
                >
                  <td className="p-3 border-b border-r border-gray-200 text-center">{index + 1}</td>
                  <td className="p-3 border-b border-r border-gray-200">
                    <div className="flex justify-center">
                      <Image 
                        src={val.img || "/image.svg"} 
                        alt={val.title} 
                        width={60} 
                        height={60} 
                        className="rounded-md shadow-md object-cover" 
                      />
                    </div>
                  </td>
                  <td className="p-3 border-b border-r border-gray-200 font-semibold">{val.title}</td>
                  <td className={`p-3 border-b border-r border-gray-200 text-center font-bold ${
                    val.quantity === 0 
                    ? "text-red-700" 
                    : val.quantity < 10 
                    ? "text-orange-500" 
                    : "text-green-600"
                  }`}>
                    {val.quantity}
                    {val.quantity === 0 
                      ? <div className="text-xs mt-1 bg-red-100 text-red-800 rounded-full px-2 py-0.5 inline-block">ของหมด</div> 
                      : val.quantity < 10 
                      ? <div className="text-xs mt-1 bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 inline-block">ใกล้หมด</div> 
                      : null}
                  </td>
                  <td className="p-3 border-b border-r border-gray-200 text-gray-600">
                    {val.content ? (val.content.length > 80 ? `${val.content.slice(0, 80)}...` : val.content) : "-"}
                  </td>
                  <td className="p-3 border-b border-r border-gray-200 text-sm text-gray-500">{formatDate(val.updatedAt)}</td>
                  <td className="p-3 border-b border-gray-200">
                    <div className="flex flex-wrap justify-center gap-2">
                      <button 
                        onClick={() => { setSelectedProduct(val); setShowModal(true); }} 
                        className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md text-sm flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> ดู
                      </button>
                      <button 
                        onClick={() => { setWithdrawProduct(val); setWithdrawAmount(1); setShowWithdrawModal(true); }} 
                        disabled={val.quantity === 0} 
                        className={`${
                          val.quantity === 0 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-yellow-500 hover:bg-yellow-600"
                        } text-white py-1 px-3 rounded-md text-sm flex items-center gap-1 transition-colors`}
                      >
                        <PackageMinus className="w-4 h-4" /> เบิก
                      </button>
                      <button 
                        onClick={() => { setAddProduct(val); setAddAmount(1); setShowAddModal(true); }} 
                        className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded-md text-sm flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> เพิ่ม
                      </button>
                      <Link 
                        href={`/edit/${val._id}`} 
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm flex items-center gap-1 transition-colors"
                      >
                        <Edit className="w-4 h-4" /> แก้ไข
                      </Link>
                      <DeleteBtn 
                        id={val._id} 
                        title={val.title} 
                        quantity={val.quantity} 
                        icon={<Trash2 className="w-4 h-4" />} 
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  {searchQuery ? "ไม่พบสินค้าที่ค้นหา" : "ไม่มีข้อมูลสินค้า"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ Lazy load sentinel */}
        <div id="load-more-sentinel" className="py-6 text-center text-gray-500">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              <span>กำลังโหลดข้อมูล...</span>
            </div>
          ) : hasMore ? (
            "เลื่อนเพื่อโหลดเพิ่มเติม..."
          ) : (
            "โหลดข้อมูลครบแล้ว"
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mt-4 bg-white p-3 rounded-lg shadow flex flex-wrap justify-between gap-4">
        <div className="text-sm">
          <span className="font-medium text-gray-600">รายการทั้งหมด:</span> <span className="font-bold text-blue-600">{filteredPosts.length}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">สินค้าที่ใกล้หมด:</span> <span className="font-bold text-orange-500">
            {filteredPosts.filter(p => p.quantity > 0 && p.quantity < 10).length}
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-600">สินค้าที่หมด:</span> <span className="font-bold text-red-600">
            {filteredPosts.filter(p => p.quantity === 0).length}
          </span>
        </div>
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
          onWithdrawSuccess={() => {
            setPage(1);
            setPostData([]);
            setHasMore(true);
          }}
        />
      )}
      {showAddModal && addProduct && (
        <AddStockModal
          addProduct={addProduct}
          addAmount={addAmount}
          setAddAmount={setAddAmount}
          onClose={() => setShowAddModal(false)}
          onAddSuccess={() => {
            setPage(1);
            setPostData([]);
            setHasMore(true);
          }}
        />
      )}
    </main>
  );
}