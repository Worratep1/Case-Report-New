import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Mail,
  X,
  Save,
  AlertCircle,
  User,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

// API (ระบุ .js เพื่อความชัวร์)
import {
  getRecipients,
  createRecipient,
  updateRecipient,
  deleteRecipient,
} from "../api/recipients.jsx";

// Components
import ActionFeedbackModal from "../components/ActionFeedbackModal.jsx";
import ButtonBack from "../components/ButtonBack.jsx";
import ButtonAdd from "../components/ButtonAdd.jsx"; // ใช้ ButtonAdd มาตรฐาน
import ButtonSave from "../components/ButtonSave.jsx";
import ButtonCancel from "../components/ButtonCancel.jsx";
import DarkModeToggle from "../components/DarkModeToggle.jsx"

export default function RecipientSetting() {
  const navigate = useNavigate();

  // --- 1. STATE ---
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

  // --- 2. Fetch Data ---
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        setLoading(true);
        const data = await getRecipients();
        setRecipients(data);
      } catch (err) {
        console.error("Error fetching recipients:", err);
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "ดึงข้อมูลไม่สำเร็จ",
          message: "ไม่สามารถดึงข้อมูลผู้รับอีเมลได้ในขณะนี้",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchRecipients();
  }, []);

  // --- 3. Modal Actions ---
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

  // --- 4. Save Logic ---
  const handleSave = async (e) => {
    e.preventDefault();
    const isNew = editingIndex === null; 

    const { name, email, is_active } = formData;

    if (!name || !email) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ข้อมูลไม่ครบถ้วน",
        message: "กรุณากรอก Username และ Email ให้ครบถ้วน",
      });
      return;
    }

    if (!isValidEmail(email)) {
       setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "รูปแบบอีเมลไม่ถูกต้อง",
        message: "กรุณากรอกอีเมลให้ถูกต้อง (เช่น user@example.com)",
      });
      return;
    }

    const isEmailDuplicate = recipients.some(
      (r, i) => r.email === email && i !== editingIndex
    );
    if (isEmailDuplicate) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Email ซ้ำ",
        message: "Email นี้มีอยู่ในระบบแล้ว กรุณาใช้ Email อื่น",
      });
      return;
    }

    try {
      setLoading(true);

      if (editingIndex !== null) {
        const target = recipients[editingIndex];
        await updateRecipient(target.recipient_id, { name, email, is_active });
      } else {
        await createRecipient({ name, email, is_active });
      }

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
      const msg = err?.response?.data?.message ?? "บันทึกข้อมูลไม่สำเร็จ";
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

    setFeedbackModal({
      isOpen: true,
      type: "confirm-delete",
      title: "ยืนยันการลบ",
      message: `คุณต้องการลบ: ${target.name} (${target.email}) ใช่หรือไม่?`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await deleteRecipient(target.recipient_id);
          const data = await getRecipients();
          setRecipients(data); 

          setFeedbackModal((prev) => ({
            ...prev,
            isOpen: true,
            type: "success",
            title: "ลบสำเร็จ",
            message: "ข้อมูลถูกลบออกจากระบบแล้ว",
          }));
        } catch (err) {
          console.error("Error deleting recipient:", err);
          setFeedbackModal((prev) => ({
            ...prev,
            isOpen: true,
            type: "error",
            title: "ลบไม่สำเร็จ",
            message: "เกิดข้อผิดพลาดในการลบข้อมูล",
          }));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-rose-500",
    ];
    const charCode = name ? name.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };

  return (
    <div className ="fixed inset-0 w-full h-full overflow-y-auto pt-10
      bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
      dark:from-slate-900 dark:via-slate-950 dark:to-zinc-900
      grid place-items-center">
         <DarkModeToggle />
      
      {/* --- UI Container --- */}
      <div className ="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative
  bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl 
  border border-white/50 dark:border-slate-700/50">
        
        {/* Header */}
        <div className ="p-8 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 
          bg-transparent border-slate-200/50 dark:border-slate-700/50">
          <div>
            <h1 className="text-2xl font-medium text-left text-slate-900 dark:text-white">
              Recipients Setting
            </h1>
            <p className="text-sm mt-1 text-left text-slate-500 dark:text-slate-400">
              Manage email recipients 
            </p>
          </div>
          
          <ButtonAdd onClick={() => openModal()} disabled={loading}>
            <Plus size={18} />
            Add Recipient
          </ButtonAdd>
        </div>

        {/* List Content */}
        <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
          {loading && recipients.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center text-slate-400 dark:text-slate-500">
              <AlertCircle size={48} className="mb-3 opacity-20" />
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : recipients.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center text-slate-400 dark:text-slate-500">
              <AlertCircle size={48} className="mb-3 opacity-20" />
              <p>No recipients found.</p>
            </div>
          ) : (
            recipients.map((recipient, index) => (
              <div
                key={recipient.recipient_id ?? index}
                className="group p-4 sm:px-6 transition-colors flex items-center justify-between gap-4
                  hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                {/* Left: Avatar + Name/Email */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-full ${getAvatarColor(recipient.name)} flex items-center justify-center text-white font-normal text-lg shadow-sm shrink-0 uppercase`}>
                    {recipient.name?.charAt(0) || "U"}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-normal truncate text-left text-base flex items-center gap-2 text-slate-900 dark:text-slate-200">
                      {recipient.name || "Unnamed"}
                      {recipient.is_active ? (
                        <span className=""></span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold
                          bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                          Inactive
                        </span>
                      )}
                    </h3>
                    <p className="text-sm truncate flex items-center gap-1.5 mt-0.5 text-slate-500 dark:text-slate-400">
                      <Mail size={12} /> {recipient.email}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-60 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openModal(index)}
                    className="p-2 rounded-lg transition-colors
                      text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 
                      dark:hover:text-yellow-400 dark:hover:bg-yellow-900/30"
                    title="Edit"
                    disabled={loading}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 rounded-lg transition-colors
                      text-slate-400 hover:text-red-600 hover:bg-red-50 
                      dark:hover:text-red-400 dark:hover:bg-red-900/30"
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
        <div className="p-4 border-t flex items-center justify-between
          bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded w-fit text-slate-500 hover:text-slate-800">
            <ButtonBack onClick={() => navigate("/setting")}>Back</ButtonBack>
          </div>
          {loading && (
            <span className="text-xs text-slate-400">
              Processing...
            </span>
          )}
        </div>
      </div>

      {/* --- MODAL FORM --- */}
     {isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div
      className="w-full max-w-md rounded-xl shadow-2xl overflow-hidden
      bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
      animate-in zoom-in-95 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-medium text-slate-800 dark:text-white">
          {editingIndex !== null ? "Edit Recipient" : "Add New Recipient"}
        </h3>
        <button
          onClick={closeModal}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <form onSubmit={handleSave} noValidate className="px-6 py-5 space-y-5 text-left">
        {/* Username */}
        <div>
          <label className="block text-xs font-medium mb-2 text-slate-600 dark:text-slate-300">
            Username
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter username"
              maxLength={150}
              autoFocus
              required
              className="w-full pl-10 pr-4 py-3 rounded-lg text-sm
                bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-700
                text-slate-800 dark:text-white
                focus:outline-none
                focus:ring-2 focus:ring-blue-500/30
                focus:border-blue-500"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium mb-2 text-slate-600 dark:text-slate-300">
            Email
          </label>
          <div className="relative">
            <Mail
              size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isValidEmail(formData.email)
                  ? "text-blue-500"
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
              required
              className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm
                bg-white dark:bg-slate-900
                text-slate-800 dark:text-white
                border
                focus:outline-none
                focus:ring-2
                ${
                  isValidEmail(formData.email)
                    ? "border-slate-200 dark:border-slate-700 focus:ring-blue-500/30 focus:border-blue-500"
                    : "border-slate-200 dark:border-slate-700 focus:ring-slate-300"
                }`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <ButtonCancel type="button" onClick={closeModal} disabled={loading}>
            Cancel
          </ButtonCancel>
          <ButtonSave type="submit" disabled={loading}>
            <Save size={16} />
            {editingIndex !== null ? "Save Changes" : "Save Recipient"}
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