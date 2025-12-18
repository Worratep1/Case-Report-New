import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Save, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";


import ButtonBack from "../components/ButtonBack.jsx";
import ButtonSave from "../components/ButtonSave.jsx";
import ButtonCancel from "../components/ButtonCancel.jsx";
import ButtonAdd from "../components/ButtonAdd.jsx"; // ใช้ ButtonAdd แทน ButtonAddGame เพื่อลดความซ้ำซ้อน
import ActionFeedbackModal from "../components/ActionFeedbackModal.jsx";


import {
  getproducts,
  addproducts,
  deleteProduct,
  updateProduct,
} from "../api/products.jsx";

export default function GameSetting() { // เปลี่ยนชื่อ Component ให้ตรงกับไฟล์
  const navigate = useNavigate();
  
  // รายการ game
  const [products, setProducts] = useState([]);

  // State สำหรับ Modal แจ้งเตือน
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "success", 
    title: "",
    message: "",
    onConfirm: () => {}, 
  });

  const closeFeedbackModal = () => {
    setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
  };

  // state สำหรับ modal add/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // ฟอร์มใน modal
  const [formData, setFormData] = useState({
    productName: "",
  });

  // -----------------------------
  // โหลดข้อมูลจาก DB
  // -----------------------------
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getproducts();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error loading products:", error);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "โหลดข้อมูลไม่สำเร็จ",
        message: "ไม่สามารถโหลดรายการ Game ได้ กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  // -----------------------------
  // เปิด/ปิด Modal Form
  // -----------------------------
  const openModal = (index = null) => {
    if (index !== null) {
      const product = products[index];
      setEditingIndex(index);
      setFormData({ productName: product.product_name });
    } else {
      setEditingIndex(null);
      setFormData({ productName: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ productName: "" });
  };

  const handleChange = (e) => {
    setFormData({ productName: e.target.value });
  };

  // -----------------------------
  // บันทึก (Add / Edit)
  // -----------------------------
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const name = formData.productName.trim();

    if (!name) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ข้อมูลไม่ครบถ้วน",
        message: "กรุณากรอกชื่อ Game ให้เรียบร้อย",
      });
      return;
    }

    const isDuplicate = products.some(
      (p, i) => p.product_name === name && i !== editingIndex
    );
    if (isDuplicate) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ชื่อซ้ำ",
        message: "มีชื่อ Game นี้ในระบบแล้ว",
      });
      return;
    }

    try {
      if (editingIndex !== null) {
        // แก้ไข
        const product = products[editingIndex];
        const id = product.product_id;

        const res = await updateProduct(id, name);
        const updated = res.product || { ...product, product_name: name };

        setProducts((prev) => {
          const next = [...prev];
          next[editingIndex] = updated;
          return next;
        });

        closeModal();
        setFeedbackModal({
          isOpen: true,
          type: "success",
          title: "แก้ไขสำเร็จ",
          message: "อัปเดต Game เรียบร้อยแล้ว",
        });

      } else {
        
        const res = await addproducts(name);
        const newProduct = res.product || null; 

        if (!newProduct) {
             // Fallback สำหรับ Mock data ถ้า API ไม่ส่งกลับมา
             const mockNewProduct = { product_id: Date.now(), product_name: name };
             setProducts((prev) => [...prev, mockNewProduct]);
        } else {
             setProducts((prev) => [...prev, newProduct]);
        }

        closeModal();
        setFeedbackModal({
          isOpen: true,
          type: "success",
          title: "บันทึกสำเร็จ",
          message: "เพิ่ม Game ใหม่เรียบร้อยแล้ว",
        });
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "เกิดข้อผิดพลาด",
        message: "ไม่สามารถบันทึก Game ได้ กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  // -----------------------------
  // ลบ product
  // -----------------------------
  const handleDeleteProduct = async (index) => {
    const product = products[index];
    const id = product.product_id;

    // เปลี่ยนไปใช้ Modal แบบ Confirm Delete แทน window.confirm
    setFeedbackModal({
        isOpen: true,
        type: "confirm-delete",
        title: "ยืนยันการลบ",
        message: `คุณต้องการลบเกม "${product.product_name}" ใช่หรือไม่?`,
        onConfirm: async () => {
            try {
                await deleteProduct(id);
                setProducts((prev) => prev.filter((_, i) => i !== index));
          
                setFeedbackModal({
                  isOpen: true,
                  type: "success",
                  title: "ลบข้อมูลสำเร็จ",
                  message: `ลบเกม "${product.product_name}" เรียบร้อยแล้ว`,
                });
          
              } catch (error) {
                console.error("Error deleting product:", error);
                setFeedbackModal({
                  isOpen: true,
                  type: "error",
                  title: "เกิดข้อผิดพลาด",
                  message: "ไม่สามารถลบ Game ได้",
                });
              }
        }
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-y-auto pt-10
      bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
      dark:from-slate-900 dark:via-slate-950 dark:to-zinc-900
      grid place-items-center">
      
      {/* กล่อง card กลางจอ */}
      <div className="w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden relative
        bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
        
        {/* Header */}
        <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 
          bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700">
          <div>
            <h1 className="text-2xl font-medium text-left text-slate-900 dark:text-white">
              Game Setting
            </h1>
            <p className="text-sm mt-1 text-left text-slate-500 dark:text-slate-400">
              Manage the Games for the case form
            </p>
          </div>

          <ButtonAdd onClick={() => openModal()}>
            <Plus size={18} />
            Add Game
          </ButtonAdd>
        </div>

        {/* List Content */}
        <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
          {products.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center text-slate-400 dark:text-slate-500">
              <AlertCircle size={48} className="mb-3 opacity-20" />
              <p>No Game found.</p>
            </div>
          ) : (
            products.map((product, index) => (
              <div
                key={product.product_id}
                className="group p-4 sm:px-6 transition-colors flex items-center justify-between gap-4
                  hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                {/* ชื่อ Product */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <h3 className="font-medium truncate text-base text-slate-800 dark:text-slate-200">
                      {product.product_name}
                    </h3>
                  </div>
                </div>

                {/* ปุ่ม Action */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openModal(index)}
                    className="p-2 rounded-lg transition-colors
                      text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 
                      dark:hover:text-yellow-400 dark:hover:bg-yellow-900/30"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(index)}
                    className="p-2 rounded-lg transition-colors
                      text-slate-400 hover:text-red-600 hover:bg-red-50 
                      dark:hover:text-red-400 dark:hover:bg-red-900/30"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t text-left
          bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700">
          <div className="w-fit">
            <ButtonBack onClick={() => navigate("/setting")}></ButtonBack>
          </div>
        </div>
      </div>

      {/* MODAL: Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200
            bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            
            <div className="p-5 border-b flex justify-between items-center bg-slate-50/70 dark:bg-slate-900/70 border-slate-100 dark:border-slate-700">
              <h3 className="font-medium text-lg text-slate-800 dark:text-white">
                {editingIndex !== null ? "Edit Game" : "Add New Game"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5">
              <div className="p-4 rounded-xl border 
                bg-blue-50/60 border-blue-100 
                dark:bg-blue-900/20 dark:border-blue-800/50">
                <label className="block text-xs font-medium uppercase mb-2 text-left
                  text-blue-800 dark:text-blue-300">
                  Game Name
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  maxLength={150}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                    bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  autoFocus
                />
                <p className="text-[11px] mt-2 text-left
                  text-blue-700/70 dark:text-blue-400/70">
                  This Game will be available in the case form dropdown.
                </p>
              </div>

              <div className="flex gap-3 pt-1 justify-between">
                <ButtonCancel type="button" onClick={closeModal}>
                  Cancel
                </ButtonCancel>
                <ButtonSave onClick={handleSaveProduct}>
                  <Save size={16} />
                  Save Game
                </ButtonSave>
              </div>
            </form>
          </div>
        </div>
      )}

      <ActionFeedbackModal
        isOpen={feedbackModal.isOpen}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={closeFeedbackModal}
        onConfirm={feedbackModal.onConfirm}
      />
    </div>
  );
}