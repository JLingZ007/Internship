import { useState, useEffect } from "react";
import { Plus, Save, X, Edit, Trash2, AlertCircle } from "lucide-react";

export default function CategoryModal({ isOpen, onClose }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    setIsLoading(true);
    try {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory }),
      });
      setNewCategory("");
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setEditName(cat.name);
  };

  const handleSave = async (id) => {
    if (!editName.trim()) return;
    setIsLoading(true);
    try {
      await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      setEditId(null);
      setEditName("");
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      setConfirmDelete(null);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-medium">จัดการหมวดหมู่</h2>
          <button 
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Add new category */}
          <div className="flex items-center space-x-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="ชื่อหมวดหมู่ใหม่"
              className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              disabled={isLoading}
            />
            <button 
              onClick={handleAdd} 
              disabled={!newCategory.trim() || isLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              <span>เพิ่ม</span>
            </button>
          </div>
          
          {/* Categories list */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-medium text-gray-600">
              หมวดหมู่ทั้งหมด ({categories.length})
            </div>
            
            {isLoading && categories.length === 0 ? (
              <div className="flex justify-center items-center py-8 text-gray-500">
                กำลังโหลด...
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-500 ">
                <div className="mb-2 text-gray-400">
                  <AlertCircle size={32} />
                </div>
                <p>ยังไม่มีหมวดหมู่</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                {categories.map((cat) => (
                  <li key={cat._id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    {confirmDelete === cat._id ? (
                      <div className="flex flex-col space-y-2">
                        <p className="text-red-600 font-medium">คุณแน่ใจหรือไม่ว่าต้องการลบ "{cat.name}"?</p>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleDelete(cat._id)} 
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors cursor-pointer"
                            disabled={isLoading}
                          >
                            ยืนยัน
                          </button>
                          <button 
                            onClick={() => setConfirmDelete(null)} 
                            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm transition-colors cursor-pointer"
                            disabled={isLoading}
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </div>
                    ) : editId === cat._id ? (
                      <div className="flex items-center space-x-2 ">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all "
                          autoFocus
                          disabled={isLoading}
                        />
                        <button 
                          onClick={() => handleSave(cat._id)} 
                          disabled={!editName.trim() || isLoading}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                          title="บันทึก"
                        >
                          <Save size={18} />
                        </button>
                        <button 
                          onClick={() => setEditId(null)} 
                          className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg transition-colors cursor-pointer"
                          title="ยกเลิก"
                          disabled={isLoading}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800">{cat.name}</span>
                        <div className="flex items-center space-x-1 ">
                          <button 
                            onClick={() => handleEdit(cat)} 
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไข"
                            disabled={isLoading}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => setConfirmDelete(cat._id)} 
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                            title="ลบ"
                            disabled={isLoading}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end ">
          <button 
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}