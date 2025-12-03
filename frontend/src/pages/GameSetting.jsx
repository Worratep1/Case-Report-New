import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Save, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ButtonBack from "../components/ButtonBack";
import ButtonSave from "../components/ButtonSave";
import {
  getproducts,
  addproducts,
  deleteProduct,
  updateProduct,
} from "../api/products";
import StatusModal from "../components/StatusModal";

export default function ProductSetting() {
  // รายการ game ที่จะเอาไปแสดงในตาราง (object: { product_id, product_name })
  const [products, setProducts] = useState([]);

  // popup แจ้งผล (บันทึก / แก้ไข / ลบ)
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: "success", // "success" | "warning" | "error"
    title: "",
    message: "",
  });

  // popup ยืนยันลบ -> เก็บ index ที่จะลบ (null = ไม่โชว์)
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);

  // ฟังก์ชันเปิด popup แจ้งผล
  const showStatus = (type, title, message) => {
    setStatusModal({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const closeStatus = () => {
    setStatusModal((prev) => ({ ...prev, isOpen: false }));
  };

  // state สำหรับ modal add/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // ฟอร์มใน modal (ชื่อ product)
  const [formData, setFormData] = useState({
    productName: "",
  });

  const navigate = useNavigate();

  // -----------------------------
  // 2) โหลดข้อมูลจาก DB ตอนเปิดหน้า
  // -----------------------------
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getproducts(); // { products: [...] }
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error loading products:", error);
      showStatus(
        "error",
        "โหลดข้อมูลไม่สำเร็จ",
        "ไม่สามารถโหลดรายการ Game ได้ กรุณาลองใหม่อีกครั้ง"
      );
    }
  };

  // -----------------------------
  // 3) ฟังก์ชันเปิด/ปิด Modal + จัดการ input
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
  // 4) บันทึก (Add / Edit) ผ่าน Modal
  // -----------------------------
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const name = formData.productName.trim();

    if (!name) {
      alert("กรุณากรอกชื่อ Game");
      return;
    }

    // เช็คชื่อซ้ำ (ยกเว้นตัวที่กำลังแก้)
    const isDuplicate = products.some(
      (p, i) => p.product_name === name && i !== editingIndex
    );
    if (isDuplicate) {
      alert("มีชื่อ Game นี้อยู่แล้ว");
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
        showStatus("success", "แก้ไขข้อมูลสำเร็จ", "อัปเดต Game เรียบร้อยแล้ว");
      } else {
        // เพิ่มใหม่
        const res = await addproducts(name);
        const newProduct = res.product || null;

        if (!newProduct) {
          throw new Error("ไม่พบข้อมูลใน response");
        }

        setProducts((prev) => [...prev, newProduct]);
        closeModal();
        showStatus(
          "success",
          "บันทึกข้อมูลสำเร็จ",
          "เพิ่ม Game ใหม่ในระบบเรียบร้อยแล้ว"
        );
      }
    } catch (error) {
      console.error("Error saving product:", error);
      showStatus(
        "error",
        "เกิดข้อผิดพลาด",
        "ไม่สามารถบันทึก Game ได้ กรุณาลองใหม่อีกครั้ง"
      );
    }
  };

  // -----------------------------
  // 5) ลบ product (ลบจริง — เรียกจาก popup ยืนยัน)
  // -----------------------------
  const handleDeleteProduct = async (index) => {
    try {
      const product = products[index];
      const id = product.product_id;

      await deleteProduct(id); // DELETE /products/:id

      setProducts((prev) => prev.filter((_, i) => i !== index));

      showStatus(
        "success",
        "ลบข้อมูลสำเร็จ",
        `ลบเกม "${product.product_name}" เรียบร้อยแล้ว`
      );
    } catch (error) {
      console.error("Error deleting product:", error);
      showStatus(
        "error",
        "เกิดข้อผิดพลาด",
        "ไม่สามารถลบ Game ได้ กรุณาลองใหม่อีกครั้ง"
      );
    }
  };

  // -----------------------------
  // 6) Save ทั้งหน้า (ตอนนี้ยังไม่ได้ใช้)
  // -----------------------------
  const handleSaveAll = () => {
    console.log("Save products:", products);
    alert(
      "(Demo) ตอนนี้เราบันทึกทีละตัวลง DB แล้ว ไม่จำเป็นต้อง Save ทั้งหน้า"
    );
  };

  // -----------------------------
  // 7) UI
  // -----------------------------
  return (
    <div className="fixed grid place-items-center inset-0 w-full h-full 
  bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
  overflow-y-auto z-0 pt-10">
      {/* กล่อง card กลางจอ */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header แบบ MemberSetting */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 text-left">
              Game Setting
            </h1>
            <p className="text-sm text-slate-500 mt-1 text-left">
              Manage the Games for the case form
            </p>
          </div>

          {/* ปุ่ม Add ใช้เปิด modal */}
          <button
            type="button"
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md shadow-blue-200 active:scale-95"
          >
            <Plus size={18} />
            Add Game
          </button>
        </div>

        {/* List Content สไตล์ Email List */}
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
                {/* ชื่อ Product ด้านซ้าย */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 flex items-center justify-center text-sm font-semibold shrink-0">
                    
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-slate-800 truncate text-base ">
                      {product.product_name}
                    </h3>
                  </div>
                </div>

                {/* ปุ่ม Action ด้านขวา */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-60 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openModal(index)}
                    className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteIndex(index)} // ⬅ เปิด popup ยืนยันลบ
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
          {/* <ButtonSave onClick={handleSaveAll}>
            <Save size={16} className="mr-1" />
            Save
          </ButtonSave> */}
        </div>
      </div>

      {/* MODAL: Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <h3 className="font-bold text-lg text-slate-800">
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

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-5">
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                <label className="block text-xs font-bold text-blue-800 uppercase mb-2 text-left">
                  Game Name
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  autoFocus
                />
                <p className="text-[11px] text-blue-700/70 mt-2 text-left">
                  This Game will be available in the case form dropdown.
                </p>
              </div>

              {/* ปุ่มใน Modal */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 font-medium shadow-md shadow-blue-200 
                   transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                >
                  <Save size={16} />
                  Save Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Delete */}
      {confirmDeleteIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">
              ต้องการลบ Product นี้ใช่ไหม?
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              {products[confirmDeleteIndex]?.product_name}
            </p>

            <div className="flex gap-3">
              <button
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
                onClick={() => setConfirmDeleteIndex(null)}
              >
                ยกเลิก
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-semibold"
                onClick={async () => {
                  await handleDeleteProduct(confirmDeleteIndex);
                  setConfirmDeleteIndex(null);
                }}
              >
                ลบเลย
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Status (สำเร็จ / ผิดพลาด) */}
      <StatusModal
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={closeStatus}
      />
    </div>
  );
}
