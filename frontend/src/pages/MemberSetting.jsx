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
  Search,
  Edit2,
  Trash2,
  Mail,
  User,
  Lock,
  ChevronLeft,
  X,
  Save,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
 import ActionFeedbackModal from "../components/ActionFeedbackModal";
 import ButtonBack from "../components/ButtonBack";

 import ButtonAdd from "../components/ButtonAdd"
// ✅ 1. Import Component ใหม่


export default function MemberSetting() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);

  // -----------------------------
  // 1) โหลดข้อมูลสมาชิกจาก Backend
  // -----------------------------
  const fetchMembers = async () => {
    try {
      const data = await getMembers(); // backend ส่ง { users: [...] }
      setMembers(data.users || []);
    } catch (error) {
      console.error("Error fetching members:", error);
      // ✅ ใช้ Modal แทน alert()
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
  
  // ✅ 2. State สำหรับ Feedback Modal (แจ้งเตือน/ยืนยัน)
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: 'success', // success, error, confirm-delete
    title: '',
    message: '',
    onConfirm: () => {} // ฟังก์ชันที่จะรันเมื่อกด 'ยืนยัน'
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
  // 4) handleChange ของฟอร์ม
  // -----------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // -----------------------------
  // 5) บันทึก (Add / Edit) ใช้ axios ผ่าน API
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

    // ✅ แทนที่ alert() ด้วย Modal Error
    // กรอกช่องบังคับ
    if (!username || !first_name || !last_name || !email) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณากรอก Username, First Name, Last Name และ Email ให้ครบ',
      });
      return;
    }

    // สมัครใหม่ → ต้องกรอก password + confirm
    if (editingIndex === null) {
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

    // แก้ไข → ถ้าใส่ password ใหม่ ให้เช็คว่าตรงกัน
    if (editingIndex !== null && (password || confirmPassword)) {
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
      password, // ถ้าเป็นแก้ไขแล้ว password = "" → backend จะใช้ password เดิม
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
      
      // ✅ Modal บันทึกสำเร็จ
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
      // ✅ Modal บันทึกไม่สำเร็จ
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

    // ✅ แทนที่ window.confirm() ด้วย Modal Confirm
    setFeedbackModal({
      isOpen: true,
      type: 'confirm-delete',
      title: 'ยืนยันการลบสมาชิก',
      message: `คุณต้องการลบสมาชิกชื่อ ${memberName} ใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้`,
      onConfirm: async () => {
        try {
          await deleteMember(userId);
          await fetchMembers();
          
          // Modal ลบสำเร็จ
          setFeedbackModal({
            isOpen: true,
            type: 'success',
            title: 'ลบสำเร็จ',
            message: 'ข้อมูลสมาชิกถูกลบออกจากระบบแล้ว',
          });
        } catch (err) {
          console.error("Delete error:", err);
          // Modal ลบไม่สำเร็จ
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

  // Helper สำหรับสี Avatar
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

  // -----------------------------
  // 7) UI
  // -----------------------------
  return (
   <div className="fixed grid place-items-center inset-0 w-full h-full 
  bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
  overflow-y-auto z-0 pt-10">
      {/* --- UI Container หลัก --- */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <div>
            <h1 className="text-2xl font-medium text-slate-700 text-left">
              Member Setting
            </h1>
            <p className="text-sm text-slate-500 mt-1 text-left">
              Manage usernames and passwords
            </p>
          </div>
          <ButtonAdd
            onClick={() => openModal()}
          >
            <Plus size={18} />
            Add Member
          </ButtonAdd>
        </div>

        {/* List Content */}
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {members.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center text-slate-400">
              <AlertCircle size={48} className="mb-2 opacity-20" />
              <p>No members found.</p>
            </div>
          ) : (
            members.map((member, index) => (
              <div
                key={member.user_id ?? index}
                className="group p-4 sm:px-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
              >
                {/* ข้อมูลสมาชิก */}
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-full ${getAvatarColor(
                      member.first_name
                    )} flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0`}
                  >
                    {member.first_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900 truncate">
                        {member.first_name} {member.last_name}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                      <Mail size={12} /> {member.email}
                    </p>
                  </div>
                </div>

                {/* ปุ่ม Action */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(index)}
                    className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
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

        {/* Footer / Back Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-left">
          
        <ButtonBack onClick={() => navigate("/setting")}>Back</ButtonBack>
          
          
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 bg-white/95 backdrop-blur z-10">
              <h3 className="font-semibold text-lg text-slate-800">
                {editingIndex !== null ? "Edit Member" : "Add New Member"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-left">
              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">
                  Username
                </label>
                <div className="relative">
                  <User
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    maxLength={50}
                    placeholder="Enter username"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">
                  First Name
                </label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Enter first name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">
                  Last Name
                </label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Enter last name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    maxLength={64}
                    placeholder={
                      editingIndex !== null
                        ? "Enter new password (optional)"
                        : "Enter password"
                    }
                    className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <CheckCircle
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                     maxLength={64}
                    placeholder={
                      editingIndex !== null
                        ? "Re-enter new password (optional)"
                        : "Re-enter password"
                    }
                    className={`w-full pl-9 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      Passwords do not match
                    </p>
                  )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md shadow-blue-200 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Member
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
  );
}