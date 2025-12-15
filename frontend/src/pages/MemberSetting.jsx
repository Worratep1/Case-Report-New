import React, { useEffect, useState } from "react";
import {
  getMembers,
  registerMember,
  updateMember,
  deleteMember,
} from "../api/member";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Mail,
  User,
  Lock,
  X,
  Save,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

import ActionFeedbackModal from "../components/ActionFeedbackModal";
import ButtonBack from "../components/ButtonBack";
import ButtonAdd from "../components/ButtonAdd";
import ButtonSave from "../components/ButtonSave";
import ButtonCancel from "../components/ButtonCancel";

export default function MemberSetting() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);

  // -----------------------------
  // 1) โหลดข้อมูลสมาชิกจาก Backend
  // -----------------------------
  const fetchMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data.users || []);
    } catch (error) {
      console.error("Error fetching members:", error);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถโหลดข้อมูลสมาชิกได้',
      });
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // -----------------------------
  // 2) State ของฟอร์ม + Modal
  // -----------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const initialFormState = {
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    email: "",
    is_active: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const closeFeedbackModal = () => {
    setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
  };

  // -----------------------------
  // 3) เปิด/ปิด Modal
  // -----------------------------
  const openModal = (index = null) => {
    if (index !== null) {
      const user = members[index];
      setEditingIndex(index);
      setFormData({
        username: user.username,
        password: "",
        confirmPassword: "",
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        is_active: user.is_active ?? true,
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
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // -----------------------------
  // 4) handleChange
  // -----------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // -----------------------------
  // 5) บันทึก (Add / Edit)
  // -----------------------------
  const handleSave = async (e) => {
    e.preventDefault();
    const {
      username,
      password,
      confirmPassword,
      first_name,
      last_name,
      email,
      is_active,
    } = formData;

    // Validation
    if (!username || !first_name || !last_name || !email) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      });
      return;
    }

    // Password Validation
    if (editingIndex === null) { // กรณีเพิ่มใหม่
      if (!password || !confirmPassword) {
        setFeedbackModal({
            isOpen: true,
            type: 'error',
            title: 'ข้อมูลไม่ครบถ้วน',
            message: 'กรุณากรอก Password และ Confirm Password',
        });
        return;
      }
      if (password !== confirmPassword) {
        setFeedbackModal({
            isOpen: true,
            type: 'error',
            title: 'รหัสผ่านไม่ตรงกัน',
            message: 'Password และ Confirm Password ไม่ตรงกัน',
        });
        return;
      }
    }

    if (editingIndex !== null && (password || confirmPassword)) { // กรณีแก้ไขและมีการกรอกรหัสผ่าน
      if (password !== confirmPassword) {
        setFeedbackModal({
            isOpen: true,
            type: 'error',
            title: 'รหัสผ่านไม่ตรงกัน',
            message: 'Password และ Confirm Password ไม่ตรงกัน',
        });
        return;
      }
    }

    const payload = {
      username,
      password,
      first_name,
      last_name,
      email,
      is_active,
    };

    try {
      const isNew = editingIndex === null;

      if (isNew) {
        await registerMember(payload);
      } else {
        const userId = members[editingIndex].user_id;
        await updateMember(userId, payload);
      }

      await fetchMembers();
      closeModal();
      
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: isNew ? 'เพิ่มสมาชิกสำเร็จ' : 'แก้ไขสมาชิกสำเร็จ',
        message: isNew 
            ? 'เพิ่มสมาชิกใหม่เข้าสู่ระบบเรียบร้อยแล้ว' 
            : 'ข้อมูลสมาชิกถูกแก้ไขเรียบร้อยแล้ว',
      });

    } catch (err) {
      console.error("Save error:", err);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'บันทึกข้อมูลไม่สำเร็จ',
        message: err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  // -----------------------------
  // 6) ลบสมาชิก
  // -----------------------------
  const handleDelete = (indexToDelete) => {
    const memberName = `${members[indexToDelete].first_name} ${members[indexToDelete].last_name}`;
    const userId = members[indexToDelete].user_id;

    setFeedbackModal({
      isOpen: true,
      type: 'confirm-delete',
      title: 'ยืนยันการลบสมาชิก',
      message: `คุณต้องการลบสมาชิกชื่อ ${memberName} ใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้`,
      onConfirm: async () => {
        try {
          await deleteMember(userId);
          await fetchMembers();
          
          setFeedbackModal({
            isOpen: true,
            type: 'success',
            title: 'ลบสำเร็จ',
            message: 'ข้อมูลสมาชิกถูกลบออกจากระบบแล้ว',
          });
        } catch (err) {
          console.error("Delete error:", err);
          setFeedbackModal({
            isOpen: true,
            type: 'error',
            title: 'ลบสมาชิกไม่สำเร็จ',
            message: 'เกิดข้อผิดพลาดในการลบข้อมูล กรุณาลองใหม่อีกครั้ง',
          });
        }
      }
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
   <div className="fixed inset-0 w-full h-full overflow-y-auto pt-10
    bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
    dark:from-slate-900 dark:via-slate-950 dark:to-zinc-900
    grid place-items-center">
      
      {/* --- UI Container หลัก --- */}
      <div className="w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden relative
        bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
        
        {/* Header */}
        <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4
          bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700">
          <div>
            <h1 className="text-2xl font-medium text-left text-slate-900 dark:text-white">
              Member Setting
            </h1>
            <p className="text-sm mt-1 text-left text-slate-500 dark:text-slate-400">
              Manage usernames and passwords
            </p>
          </div>
          <ButtonAdd onClick={() => openModal()}>
            <Plus size={18} />
            Add Member
          </ButtonAdd>
        </div>

        {/* List Content */}
        <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
          {members.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center text-slate-400 dark:text-slate-500">
              <AlertCircle size={48} className="mb-2 opacity-20" />
              <p>No members found.</p>
            </div>
          ) : (
            members.map((member, index) => (
              <div
                key={member.user_id ?? index}
                className="group p-4 sm:px-6 transition-colors flex items-center justify-between gap-4
                  hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                {/* ข้อมูลสมาชิก */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-full ${getAvatarColor(member.first_name)} flex items-center justify-center text-white font-normal text-lg shadow-sm shrink-0`}>
                    {member.first_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-normal truncate text-slate-900 dark:text-slate-200">
                        {member.first_name} {member.last_name}
                      </h3>
                    </div>
                    <p className="text-sm truncate flex items-center gap-1.5 mt-0.5 text-slate-500 dark:text-slate-400">
                      <Mail size={12} /> {member.email}
                    </p>
                  </div>
                </div>

                {/* ปุ่ม Action */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(index)}
                    className="p-2 rounded-lg transition-colors
                      text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 
                      dark:hover:text-yellow-400 dark:hover:bg-yellow-900/30"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
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

        {/* Footer / Back Button */}
        <div className="p-4 border-t text-left
          bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700">
          <div className="w-fit">
             <ButtonBack onClick={() => navigate("/setting")}>Back</ButtonBack>
          </div>
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto
            bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            
            <div className="p-5 border-b flex justify-between items-center sticky top-0 z-10 backdrop-blur
              bg-slate-50/80 dark:bg-slate-900/80 border-slate-100 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                {editingIndex !== null ? "Edit Member" : "Add New Member"}
              </h3>
              <button
                onClick={closeModal}
                className="transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-left">
              {/* Username */}
              <div>
                <label className="block text-xs font-medium uppercase mb-1 text-slate-500 dark:text-slate-400">
                  Username
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    maxLength={50}
                    placeholder="Enter username"
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                      bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-xs font-medium uppercase mb-1 text-slate-500 dark:text-slate-400">
                  First Name
                </label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Enter first name"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                    bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-medium uppercase mb-1 text-slate-500 dark:text-slate-400">
                  Last Name
                </label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Enter last name"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                    bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium uppercase mb-1 text-slate-500 dark:text-slate-400">
                  Email
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                      bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium uppercase mb-1 text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    maxLength={64}
                    placeholder={editingIndex !== null ? "Enter new password (optional)" : "Enter password"}
                    className="w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                      bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium uppercase mb-1 text-slate-500 dark:text-slate-400">
                  Confirm Password
                </label>
                <div className="relative">
                  <CheckCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                     maxLength={64}
                    placeholder={editingIndex !== null ? "Re-enter new password (optional)" : "Re-enter password"}
                    className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                      bg-white dark:bg-slate-900 text-slate-800 dark:text-white
                      ${formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
              </div>

              <div className="pt-4 flex gap-3">
                <ButtonCancel type="button" onClick={closeModal}>
                   Cancel
                </ButtonCancel>
                <ButtonSave type="submit" onClick={handleSave}>
                  <Save size={16} /> Save Member
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