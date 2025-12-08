// src/pages/RecipientSetting.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Mail,
  ChevronLeft,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  User,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  getRecipients,
  createRecipient,
  updateRecipient,
  deleteRecipient,
} from "../api/recipients";

import ActionFeedbackModal from "../components/ActionFeedbackModal";

import ButtonBack from "../components/ButtonBack";
import ButtonAdd from "../components/ButtonAdd"

export default function RecipientSetting() {
  const navigate = useNavigate();

  // --- 1. STATE: เก็บรายการผู้รับจาก Backend ---
  const [recipients, setRecipients] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const closeFeedbackModal = () => {
    setFeedbackModal((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const initialFormState = {
    name: "",
    email: "",
    is_active: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- 2. ดึงข้อมูลจาก Backend ตอนเปิดหน้า ---
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        setLoading(true);
        const data = await getRecipients(); // data = array
        setRecipients(data);
      } catch (err) {
        console.error("Error fetching recipients:", err);
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "ดึงข้อมูลไม่สำเร็จ",
          message:
            "ไม่สามารถดึงข้อมูลผู้รับอีเมลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipients();
  }, []);

  // --- 3. Modal: เปิด/ปิด + โหลดค่าเวลาแก้ไข ---
  const openModal = (index = null) => {
    if (index !== null) {
      const r = recipients[index];
      setEditingIndex(index);
      setFormData({
        name: r.name || "",
        email: r.email || "",
        is_active: r.is_active ?? true,
      });
    } else {
      setEditingIndex(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setEditingIndex(null);
  };

  // --- 4. จัดการ input ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const isValidEmail = (email) => {
    return email && email.includes("@") && email.includes(".");
  };

  // --- 5. บันทึก (Create / Update) ---
  const handleSave = async (e) => {
    e.preventDefault();
    const isNew = editingIndex === null; 

    const { name, email, is_active } = formData;

    if (!name || !email) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ข้อมูลไม่ครบถ้วน",
        message: "กรุณากรอก username และ Email ให้ครบถ้วน",
      });
      return;
    }

    // เช็ค Email ซ้ำฝั่งหน้าเว็บ
    const isEmailDuplicate = recipients.some(
      (r, i) => r.email === email && i !== editingIndex
    );
    if (isEmailDuplicate) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Email ซ้ำ",
        message: "Email นี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น",
      });
      return;
    }

    try {
      setLoading(true);

      if (editingIndex !== null) {
        const target = recipients[editingIndex];
        await updateRecipient(target.recipient_id, { name, email, is_active });
      } else {
        // เพิ่มใหม่
        await createRecipient({ name, email, is_active });
      }

      // ดึงข้อมูลใหม่ให้ sync กับ DB
      const data = await getRecipients();
      setRecipients(data);
      closeModal();

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: isNew ? "เพิ่มสำเร็จ" : "แก้ไขสำเร็จ",
        message: isNew
          ? "เพิ่มข้อมูลใหม่เข้าสู่ระบบเรียบร้อยแล้ว"
          : "ข้อมูลถูกอัปเดตเรียบร้อยแล้ว",
      });
    } catch (err) {
      console.error("Error saving recipient:", err);
      const msg =
        err?.response?.data?.message ?? "บันทึกข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง";

      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "บันทึกข้อมูลไม่สำเร็จ",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (indexToDelete) => {
    const target = recipients[indexToDelete];

    // ✅ แทนที่ window.confirm() ด้วย Modal Confirm Delete
    setFeedbackModal({
      isOpen: true,
      type: "confirm-delete",
      title: "ยืนยันการลบ",
      message: `คุณต้องการลบ: ${target.name} (${target.email}) ใช่หรือไม่?`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await deleteRecipient(target.recipient_id);

          // ดึงข้อมูลใหม่ (✅ ใช้ Logic ดึง Array ที่ถูกต้อง)
          const data = await getRecipients();
          // setRecipients(extractRecipientsArray(data));
          setRecipients(data); 

          // Modal ลบสำเร็จ
          setFeedbackModal((prev) => ({
            ...prev,
            isOpen: true,
            type: "success",
            title: "ลบสำเร็จ",
            message: "ข้อมูลถูกลบออกจากระบบแล้ว",
          }));
        } catch (err) {
          console.error("Error deleting recipient:", err);
          // Modal ลบไม่สำเร็จ
          setFeedbackModal((prev) => ({
            ...prev,
            isOpen: true,
            type: "error",
            title: "ลบไม่สำเร็จ",
            message: "เกิดข้อผิดพลาดในการลบข้อมูล ลองใหม่อีกครั้ง",
          }));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Avatar: ใช้ตัวอักษรแรกของ name ทำสีวงกลม
  const getAvatarColor = (name) => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-purple-500",
      "bg-amber-500",
      "bg-rose-500",
    ];
    const charCode = name ? name.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };

  return (
    <>

      <div className="fixed grid place-items-center inset-0 w-full h-full 
  bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
  overflow-y-auto z-0 pt-10">
        {/* --- UI Container --- */}
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
            <div>
              <h1 className="text-2xl font-medium text-slate-900 text-left">
                Recipients Setting
              </h1>
              <p className="text-sm text-slate-500 mt-1 text-left">
                Manage email recipients for Daily Report
              </p>
            </div>
            
            <ButtonAdd
              onClick={() => openModal()}
              disabled={loading}
>
              <Plus size={18} />
              Add Recipient
            </ButtonAdd>
          </div>

          {/* List Content */}
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {loading && recipients.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center text-slate-400">
                <AlertCircle size={48} className="mb-3 opacity-20" />
                <p>กำลังโหลดข้อมูล...</p>
              </div>
            ) : recipients.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center text-slate-400">
                <AlertCircle size={48} className="mb-3 opacity-20" />
                <p>No recipients found.</p>
              </div>
            ) : (
              recipients.map((recipient, index) => (
                <div
                  key={recipient.recipient_id ?? index}
                  className="group p-4 sm:px-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                >
                  {/* Left: Avatar + Name/Email */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full ${getAvatarColor(
                        recipient.name
                      )} flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 uppercase`}
                    >
                      {recipient.name?.charAt(0) || "U"}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-700 truncate text-left text-base flex items-center gap-2">
                        {recipient.name || "Unnamed"}
                        {recipient.is_active ? (
                          <span className="">
                            
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 uppercase font-bold">
                            Inactive
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} /> {recipient.email}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-60 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(index)}
                      className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Edit"
                      disabled={loading}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                      disabled={loading}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => navigate("/setting")}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors px-3 py-2 rounded  w-fit"
            >
              <ButtonBack onClick={() => navigate("/setting")}>Back</ButtonBack>
            </button>
            {loading && (
              <span className="text-xs text-slate-400">
                Processing... please wait
              </span>
            )}
          </div>
        </div>

        {/* --- MODAL FORM --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-lg text-slate-800">
                  {editingIndex !== null
                    ? "Edit Recipient"
                    : "Add New Recipient"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 shadow-sm space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-bold text-blue-800 uppercase mb-2 justify-between flex items-center">
                      Username
                    </label>
                    <div className="relative group">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                      />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        maxLength={100}
                        placeholder="username"
                        className="w-full pl-10 pr-4 py-3 bg-white border rounded-lg text-base focus:outline-none focus:ring-4 transition-all border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 text-slate-800"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-bold text-blue-800 uppercase mb-2 justify-between flex items-center">
                      Email
                      {isValidEmail(formData.email) && (
                        <span className="">
                          {/* <CheckCircle size={10} /> Valid */}
                        </span>
                      )}
                    </label>
                    <div className="relative group">
                      <Mail
                        size={18}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                          isValidEmail(formData.email)
                            ? "text-blue-600"
                            : "text-slate-400"
                        }`}
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="user@example.com"
                        maxLength={255}
                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-lg text-base focus:outline-none focus:ring-4 transition-all
                          ${
                            isValidEmail(formData.email)
                              ? "border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 text-slate-800"
                              : "border-slate-200 focus:border-slate-400 focus:ring-slate-200 text-slate-600"
                          }
                        `}
                        required
                      />
                    </div>
                  </div>

                  {/* is_active
                  <div className="flex items-center gap-2">
                    <input
                      id="is_active"
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="is_active"
                      className="text-sm text-slate-700 select-none"
                    >
                      Active (ใช้สำหรับส่งอีเมลรายงาน)
                    </label>
                  </div> */}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                    disabled={loading}
                  >
                    <Save size={18} />
                    {editingIndex !== null ? "Save Changes" : "Save Recipient"}
                  </button>
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
    </>
  );
}
