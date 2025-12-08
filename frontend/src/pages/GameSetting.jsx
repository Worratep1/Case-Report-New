import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Save, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ButtonBack from "../components/ButtonBack";
import ButtonSave from "../components/ButtonSave";
import ButtonCancel from "../components/ButtonCancel";
import ButtonAddGame from "../components/ButtonAdd";
import {
  getproducts,
  addproducts,
  deleteProduct,
  updateProduct,
} from "../api/products";

// ✅ 1. Import Component Modal ตัวใหม่
import ActionFeedbackModal from "../components/ActionFeedbackModal";

export default function ProductSetting() {
  const navigate = useNavigate();
  
  // รายการ game
  const [products, setProducts] = useState([]);

  // ✅ 2. สร้าง State สำหรับ Modal ใหม่ (แก้ไขชื่อตัวแปรให้ถูก isOpne -> isOpen)
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "success", // success, error, confirm-delete
    title: "",
    message: "",
    onConfirm: () => {}, // ฟังก์ชันที่จะทำงานเมื่อกดปุ่มยืนยัน
  });

  // ฟังก์ชันปิด Modal
  const closeFeedbackModal = () => {
    setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
  };

  // state สำหรับ modal add/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // ฟอร์มใน modal (ชื่อ product)
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
      // ✅ เรียกใช้ Modal แจ้งเตือน Error
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "โหลดข้อมูลไม่สำเร็จ",
        message: "ไม่สามารถโหลดรายการ Game ได้ กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  // -----------------------------
  // ฟังก์ชันเปิด/ปิด Modal Form
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

    // ✅ Validation: แจ้งเตือนด้วย Modal ใหม่
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
        // ✅ Success Modal
        setFeedbackModal({
          isOpen: true,
          type: "success",
          title: "แก้ไขสำเร็จ",
          message: "อัปเดต Game เรียบร้อยแล้ว",
        });

      } else {
        // เพิ่มใหม่
        const res = await addproducts(name);
        const newProduct = res.product || null;

        if (!newProduct) throw new Error("No data");

        setProducts((prev) => [...prev, newProduct]);
        closeModal();
        // ✅ Success Modal
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
  // ลบ product (เรียกจาก Modal ยืนยัน)
  // -----------------------------
  const handleDeleteProduct = async (index) => {
    try {
      const product = products[index];
      const id = product.product_id;

      await deleteProduct(id);

      setProducts((prev) => prev.filter((_, i) => i !== index));

      // ✅ ลบเสร็จแจ้งเตือน Success
      setFeedbackModal({
        isOpen: true,
        type: "success", // หรือใช้ 'delete-success' ถ้าใน Component รองรับ
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
  };

  return (
    <div className="fixed grid place-items-center inset-0 w-full h-full 
  bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
  overflow-y-auto z-0 pt-10">
      
      {/* กล่อง card กลางจอ */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div>
            <h1 className="text-2xl font-medium text-slate-700 text-left">
              Game Setting
            </h1>
            <p className="text-sm text-slate-500 mt-1 text-left">
              Manage the Games for the case form
            </p>
          </div>

          <ButtonAddGame onClick={() => openModal()}>
            <Plus size={18} />
            Add Game
          </ButtonAddGame>
        </div>

        {/* List Content */}
        <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
          {products.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center text-slate-400">
              <AlertCircle size={48} className="mb-3 opacity-20" />
              <p>No Game found.</p>
            </div>
          ) : (
            products.map((product, index) => (
              <div
                key={product.product_id}
                className="group p-4 sm:px-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
              >
                {/* ชื่อ Product */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 flex items-center justify-center text-sm font-semibold shrink-0">
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-slate-800 truncate text-base ">
                      {product.product_name}
                    </h3>
                  </div>
                </div>

                {/* ปุ่ม Action */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-60 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openModal(index)}
                    className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  
                  {/* ✅ ปุ่มลบ: เรียก Modal ยืนยัน (confirm-delete) */}
                  <button
                    type="button"
                    onClick={() => {
                        setFeedbackModal({
                            isOpen: true,
                            type: "confirm-delete",
                            title: "ยืนยันการลบ",
                            message: `คุณต้องการลบเกม "${product.product_name}" ใช่หรือไม่?`,
                            onConfirm: async () => {
                                await handleDeleteProduct(index);
                            }
                        });
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <ButtonBack onClick={() => navigate("/setting")}>Back</ButtonBack>
        </div>
      </div>

      {/* MODAL: Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <h3 className="font-medium text-lg text-slate-800">
                {editingIndex !== null ? "Edit Game" : "Add New Game"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5">
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                <label className="block text-xs font-medium text-blue-800 uppercase mb-2 text-left">
                  Game Name
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  maxLength={50} // ✅ ลิมิตตัวอักษร
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  autoFocus
                />
                <p className="text-[11px] text-blue-700/70 mt-2 text-left">
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

      {/* ✅ 3. วาง Component Modal ตัวใหม่ไว้ท้ายสุด */}
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