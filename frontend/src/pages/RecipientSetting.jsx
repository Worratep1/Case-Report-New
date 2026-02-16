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
  Loader2,
  Users,
  ChevronDown,
  ChevronUp,
  Check,
  Dot
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getRecipients,
  createRecipient,
  updateRecipient,
  deleteRecipient,
} from "../api/recipients.jsx";
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from "../api/recipientsgroup.jsx";

// Components
import ActionFeedbackModal from "../components/ActionFeedbackModal.jsx";
import ButtonBack from "../components/ButtonBack.jsx";
import ButtonAdd from "../components/ButtonAdd.jsx";
import ButtonSave from "../components/ButtonSave.jsx";
import ButtonCancel from "../components/ButtonCancel.jsx";
import DarkModeToggle from "../components/DarkModeToggle.jsx";

export default function RecipientSetting() {
  const navigate = useNavigate();

  // --- 1. STATE ---
  const [recipients, setRecipients] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [modalType, setModalType] = useState("recipient");

  // Modal States
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [groupForm, setGroupForm] = useState({
    group_name: "",
    is_default: false,
    recipient_ids: [],
  });

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
    const fetchData = async () => {
      try {
        setLoading(true);
        // ดึงข้อมูลทั้งสองอย่างพร้อมกัน
        const [recipientsData, groupsData] = await Promise.all([
          getRecipients(),
          getGroups(),
        ]);
        setRecipients(recipientsData);
        setGroups(groupsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "ดึงข้อมูลไม่สำเร็จ",
          message: "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 3. Modal Actions ---
  const openModal = (index = null) => {
    if (index !== null) {
      const r = recipients[index];
      setEditingIndex(index);
      setModalType("recipient");
      setFormData({
        name: r.name || "",
        email: r.email || "",
        is_active: r.is_active ?? true,
      });
      setIsModalOpen(true);
    } else {
      setEditingIndex(null);
      setModalType("recipient");
      setFormData(initialFormState);
      setGroupForm({ group_name: "", is_default: false, recipient_ids: [] });
      setIsModalOpen(true);
    }
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
        message: "กรุณากรอก Email ให้ถูกต้อง (เช่น user@example.com)",
      });
      return;
    }

    const isEmailDuplicate = recipients.some(
      (r, i) => r.email === email && i !== editingIndex,
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


  // 1. ฟังก์ชันเปิด Modal สำหรับสร้างหรือแก้ไขกลุ่ม
  const openGroupModal = (group) => {
    setEditingIndex(999);
    setEditingItem(group);
    setModalType("group"); // บังคับเป็นหน้า Group
    setGroupForm({
      group_name: group.group_name,
      is_default: group.is_default,
      recipient_ids: group.members.map((m) => m.recipient_id),
    });
    setIsModalOpen(true);
  };


 // 2. ฟังก์ชันบันทึกข้อมูลกลุ่มไปยัง Backend (พร้อม Validation)
  const handleSaveGroup = async (e) => {
    e.preventDefault();

    // --- 1. Validation Logic ---
    if (!groupForm.group_name.trim()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ข้อมูลไม่ครบถ้วน",
        message: "กรุณากรอกชื่อกลุ่ม (Group Name)",
      });
      return; // หยุดการทำงานถ้าไม่ผ่าน
    }

    if (groupForm.recipient_ids.length === 0) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ข้อมูลไม่ครบถ้วน",
        message: "กรุณาเลือกสมาชิกในกลุ่มอย่างน้อย 1 คน",
      });
      return; // หยุดการทำงานถ้าไม่ผ่าน
    }
    // ---------------------------

      if (groupForm.group_name.length > 100) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ชื่อกลุ่มยาวเกินไป",
        message: "ชื่อกลุ่มต้องไม่เกิน 100 ตัวอักษร",
      });
      return;
    }

    if (groupForm.recipient_ids.length === 0) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "ข้อมูลไม่ครบถ้วน",
        message: "กรุณาเลือกสมาชิกในกลุ่มอย่างน้อย 1 คน",
      });
      return; 
    }

    try {
      setLoading(true);
      if (editingItem) {
        await updateGroup(editingItem.group_id, groupForm);
      } else {
        await createGroup(groupForm);
      }

      // เมื่อสำเร็จ ให้ดึงข้อมูลใหม่
      const [recipientsData, groupsData] = await Promise.all([
        getRecipients(),
        getGroups(),
      ]);
      setRecipients(recipientsData);
      setGroups(groupsData);
      
      setIsModalOpen(false); // ปิด Modal ตัวหลัก
      
      setEditingItem(null); 
      setGroupForm({ group_name: "", is_default: false, recipient_ids: [] });

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "บันทึกสำเร็จ",
        message: "ข้อมูลกลุ่มถูกบันทึกเรียบร้อยแล้ว",
      });
    } catch (err) {
      console.error(err);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "บันทึกไม่สำเร็จ",
        message:
          err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกกลุ่ม",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-purple-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-sky-500",
      "bg-lime-500",
      "bg-pink-500",
      "bg-violet-500",
    ];
    const charCode = name ? name.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };

  // ฟังก์ชันสำหรับยืนยันการลบกลุ่ม
  const handleConfirmDeleteGroup = (group) => {
    setFeedbackModal({
      isOpen: true,
      type: "confirm-delete",
      title: "ยืนยันการลบกลุ่ม",
      message: `คุณต้องการลบกลุ่ม "${group.group_name}" ใช่หรือไม่? (สมาชิกในกลุ่มจะไม่ถูกลบออกจากระบบ)`,
      onConfirm: async () => {
        try {
          setLoading(true);
          await deleteGroup(group.group_id); // เรียก API ลบกลุ่ม

          // โหลดข้อมูลใหม่
          const groupsData = await getGroups();
          setGroups(groupsData);

          setFeedbackModal({
            isOpen: true,
            type: "success",
            title: "ลบสำเร็จ",
            message: "ลบกลุ่มเรียบร้อยแล้ว",
          });
        } catch (err) {
          console.error(err);
          setFeedbackModal({
            isOpen: true,
            type: "error",
            title: "ลบไม่สำเร็จ",
            message: "เกิดข้อผิดพลาดในการลบกลุ่ม",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-y-auto pt-10
      bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
      dark:from-slate-900 dark:via-slate-950 dark:to-zinc-900
      grid place-items-center"
    >
      <DarkModeToggle />

      {/* --- UI Container --- */}
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative
        bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl 
          border border-white/50 dark:border-slate-700/50"
      >
        {/* Header */}
        <div
          className="p-8 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 
          bg-transparent border-slate-200/50 dark:border-slate-700/50"
        >
          <div>
            <h1 className="text-2xl font-medium text-left text-slate-900 dark:text-white">
              Recipient Setting
            </h1>
            <p className="text-sm mt-1 text-left text-slate-500 dark:text-slate-400">
              Manage email recipients
            </p>
          </div>

          <ButtonAdd
            onClick={() => {
              setModalType("recipient"); // ค่าเริ่มต้นเป็นเพิ่มคน
              openModal();
            }}
            disabled={loading}
          >
            <Plus size={18} />
            Add Recipient
          </ButtonAdd>
        </div>

        {/* --- List Content (แสดงรวมกันในหน้าเดียว) --- */}
   
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/30">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
              <p className="mt-2 font-medium text-slate-600 dark:text-slate-300">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <div className="p-4 space-y-6 text-left">
              
              {/* --- SECTION 1: EMAIL GROUPS --- */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2">
                  Email Groups ({groups.length})
                </h3>
                
                {groups.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-sm text-slate-400">No groups.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {groups.map((group) => (
                      <div key={group.group_id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                        {/* Header ของกลุ่ม */}
                        <div 
                          onClick={() => setExpandedGroupId(expandedGroupId === group.group_id ? null : group.group_id)}
                          className="p-4 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                              <Users size={20} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                {group.group_name} 
                                {group.is_default && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Default</span>}
                              </h4>
                              <p className="text-xs text-slate-500">{group.members.length} recipients</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); openGroupModal(group); }}
                              className="p-2 rounded-lg transition-colors
                            text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 
                            dark:hover:text-yellow-400 dark:hover:bg-yellow-900/30"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleConfirmDeleteGroup(group); }}
                              className="p-2 rounded-lg transition-colors
                            text-slate-400 hover:text-red-600 hover:bg-red-50 
                            dark:hover:text-red-400 dark:hover:bg-red-900/30"
                            >
                              <Trash2 size={16} />
                            </button>
                            {expandedGroupId === group.group_id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                          </div>
                        </div>

                        {/* สมาชิกในกลุ่ม (Accordion Body) */}
                        {expandedGroupId === group.group_id && (
                          <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 px-4 py-3 space-y-2">
                            {group.members.map((m) => (
                              <div key={m.recipient_id} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 ml-14">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <span className="font-medium text-slate-700 dark:text-slate-300">{m.name}</span>
                                <span className="text-slate-500 dark:text-slate-400 text-sm">({m.email})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* --- SECTION 2: INDIVIDUAL RECIPIENTS --- */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2 mt-4">
                  All Individual Recipients ({recipients.length})
                </h3>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
                  {recipients.map((recipient, index) => (
                    <div key={recipient.recipient_id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm shrink-0 uppercase ${getAvatarColor(recipient.name)}`}>
                            {recipient.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-medium text-slate-700 dark:text-slate-300 truncate">{recipient.name || "Unnamed"}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{recipient.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                          <button onClick={() => openModal(index)} className="p-2 rounded-lg transition-colors
                                text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 
                                dark:hover:text-yellow-400 dark:hover:bg-yellow-900/30">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(index)} className="p-2 rounded-lg transition-colors
                      text-slate-400 hover:text-red-600 hover:bg-red-50 
                      dark:hover:text-red-400 dark:hover:bg-red-900/30">
                            <Trash2 size={16} />
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t flex items-center justify-between
          bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700"
        >
          <div className="flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded w-fit text-slate-500 hover:text-slate-800">
            <ButtonBack onClick={() => navigate("/setting")}>Back</ButtonBack>
          </div>
          {/* {loading && (
            <span className="text-xs text-slate-400">Processing...</span>
          )} */}
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl shadow-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-medium text-slate-800 dark:text-white">
                {editingIndex !== null
                  ? modalType === "recipient"
                    ? "Edit Recipient"
                    : "Edit Group"
                  : "Add New Recipient"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* --- ส่วนสลับโหมด (TAB SWITCHER) --- */}
            {/* จะแสดงเฉพาะตอนเพิ่มใหม่ (editingIndex === null) เพื่อไม่ให้สับสนตอนแก้ไข */}
            {editingIndex === null && (
              <div className="px-6 pt-5">
                <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setModalType("recipient")}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                      modalType === "recipient"
                        ? "bg-white dark:bg-slate-600 text-blue-400 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalType("group")}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                      modalType === "group"
                        ? "bg-white dark:bg-slate-600 text-blue-500 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    Group
                  </button>
                </div>
              </div>
            )}

            {/* Content Form */}
            {modalType === "recipient" ? (
              // --- ฟอร์มเพิ่มคน (ของเดิม) ---
              <form 
                onSubmit={handleSave}
                noValidate
                className="px-6 py-5 space-y-5 text-left"
              >
                {/* Username Input */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">
                    Username
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500"

                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter username"
                      maxLength={150}
                      
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${isValidEmail(formData.email) ? "text-emerald-500" : "text-slate-400"}`}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="user@example.com"
                      maxLength={255}
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Footer ปุ่ม Save */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <ButtonCancel
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Cancel
                  </ButtonCancel>
                  <ButtonSave type="submit"
                  
                   disabled={loading}>
                    <Save size={16} />
                    {editingIndex !== null ? "Save Changes" : "Save Recipient"}
                  </ButtonSave>
                </div>
              </form>
            ) : (
              // --- ฟอร์มเพิ่มกลุ่ม (เอามาใส่ตรงนี้) ---
              <form
                onSubmit={handleSaveGroup} noValidate
                className="px-6 py-5 space-y-5 text-left"
              >
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">
                    Group Name
                  </label>
                  <div className="relative">
                    <Users
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500"
                    />
                    <input
                      value={groupForm.group_name}
                      maxLength={100}
                      onChange={(e) =>
                        setGroupForm({
                          ...groupForm,
                          group_name: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                      placeholder="ex. Infra Team"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">
                    Select Recipients
                  </label>
                  <div className="mt-1 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 space-y-1 bg-slate-50 dark:bg-slate-800/50 custom-scrollbar">
                    {recipients.map((r) => (
                      <div
                        key={r.recipient_id}
                        onClick={() => {
                          const ids = groupForm.recipient_ids.includes(
                            r.recipient_id,
                          )
                            ? groupForm.recipient_ids.filter(
                                (id) => id !== r.recipient_id,
                              )
                            : [...groupForm.recipient_ids, r.recipient_id];
                          setGroupForm({ ...groupForm, recipient_ids: ids });
                        }}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
                        ${groupForm.recipient_ids.includes(r.recipient_id) ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800" : "hover:bg-white dark:hover:bg-slate-700 border border-transparent"}`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {r.name}
                          </span>
                          <span className="text-[14px] text-slate-500 dark:text-slate-400">
                            {r.email}
                          </span>
                        </div>
                        {groupForm.recipient_ids.includes(r.recipient_id) && (
                          <Check size={16} className="text-blue-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer ปุ่ม Save Group */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <ButtonCancel
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Cancel
                  </ButtonCancel>
                <ButtonSave type="submit" disabled={loading}>
                <Save size={16} />
                {modalType === "group" ? (editingItem ? "Save Changes" : "Save Group") : (editingIndex !== null ? "Save Changes" : "Save Recipient")}
                {/* {editingIndex !== null ? "Save Changes" : "Save Recipient"} */}
              </ButtonSave>
                </div>

                
              </form>
            )}
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
