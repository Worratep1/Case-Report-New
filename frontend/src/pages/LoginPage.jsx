import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

import Input from "../components/Input";
import Button from "../components/Button";
import Logoplaypark1 from "../assets/Logoplaypark1.png";
import BackgroundBlue from "../assets/BackgroundBlue.png";

import ActionFeedbackModal from "../components/ActionFeedbackModal";
import DarkmodeToggle from "../components/DarkModeToggle";
import { User, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/menu");
    } catch (err) {
  console.error("Login Error", err);
  let msg = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";

  if (err.response) {
    // กรณี Server ตอบกลับมา (เช่น 401)
    msg = err.response.data?.message || "Username หรือ Password ไม่ถูกต้อง";
  } else {
    // กรณีไม่มี response (เช่น Server Down) 
    // พอมันไม่มี err.response มันจะวิ่งมาที่นี่ และใช้ภาษาไทยที่เราตั้งไว้
    msg = "ไม่สามารถเชื่อมต่อกับ Server ได้ กรุณาตรวจสอบการเชื่อมต่อของคุณ";
  }

  setErrorMessage(msg);
  setShowErrorModal(true);
}finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center overflow-hidden">
      {/* --- BACKGROUND SECTION --- */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url(${BackgroundBlue})`,
          filter: "blur(4px)", 
        }}
      />
      {/* Subtle Gradient Overlay: ช่วยให้ Card ดูลอยเด่นขึ้น */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-slate-950/40 dark:bg-slate-950/70 transition-colors duration-500" />

      {/* Dark Mode Toggle Area */}
      <div className="absolute top-8 right-8 z-20">
        <DarkmodeToggle />
      </div>

      <div className="relative w-full max-w-[420px] mx-4 z-10 animate-in fade-in zoom-in duration-500">
        {/* --- MAIN LOGIN CARD --- */}
        <div className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-10 transition-all">
          {/* Header Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-5">
              {/* Logo (h-24) */}
              <img
                src={Logoplaypark1}
                alt="System Logo"
                className="h-32 w-auto object-contain drop-shadow-2xl animate-pulse-slow"
              />
            
            </div>

            <h1 className="text-center text-2xl font-bold text-slate-800 dark:text-white tracking-tight leading-tight">
              NOC Report System
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <ShieldCheck size={14} className="text-blue-500" />
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-[0.2em]">
                Administrator Access
              </p>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <Input
                label="Username"
                value={username}
                icon={<User size={20} className="text-blue-500" />} // ใช้สีแบรนด์ที่ไอคอน
                maxLength={100}
                placeholder="ชื่อผู้ใช้งาน"
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-1">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                icon={<KeyRound size={20} className="text-blue-500" />}
                maxLength={64}
                placeholder="รหัสผ่าน"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:bg-slate-100  rounded-full transition-all text-slate-400 hover:text-blue-500 focus:outline-none"
                    title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Login Button Section */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold uppercase tracking-[0.1em] shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </div>
                ) : (
                  "LOGIN" 
                )}
              </Button>
            </div>
          </form>

          {/* Footer Note */}
          <p className="text-center mt-8 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            &copy; v 1.0 
          </p>
        </div>
      </div>

      {/* Error Feedback Modal */}
      <ActionFeedbackModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
        title="เข้าสู่ระบบไม่สำเร็จ"
        message={errorMessage}
        confirmText="ลองใหม่อีกครั้ง"
      />
    </div>
  );
}
