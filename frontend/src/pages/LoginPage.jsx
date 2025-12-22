import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

import Input from "../components/Input";
import Button from "../components/Button";
import Logoplaypark1 from '../assets/Logoplaypark1.png';

import BackgroundBlue from '../assets/BackgroundBlue.png'; 

import ActionFeedbackModal from "../components/ActionFeedbackModal";
import DarkmodeToggle from "../components/DarkModeToggle";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showErrorModal , setShowErrorModal] = useState(false);
  const [errorMessage , setErrorMessage] = useState("");
  
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
       const msg = err.response?.data?.message || "Username หรือ Password ไม่ถูกต้อง";
       setErrorMessage(msg);
       setShowErrorModal(true); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 w-full h-full flex items-center justify-center ">

      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm scale-110" 
        style={{ backgroundImage: `url(${BackgroundBlue})` }}
      />
      {/* Overlay สำหรับ Dark Mode เพื่อให้ภาพพื้นหลังดูซอฟต์ลงเมื่อเปิดโหมดมืด */}
      <div className="absolute inset-0 bg-white/10 dark:bg-slate-950/60 transition-colors duration-500" />

      {/* ปุ่ม Toggle Dark Mode จัดให้อยู่มุมขวาบนเพื่อให้ไม่ทับ Card */}
      <div className="absolute top-5 right-5 z-10">
        <DarkmodeToggle />
      </div>

      <div className="relative w-full max-w-md mx-4 z-10">
        {/* Card พร้อมเอฟเฟกต์ Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-7
          dark:bg-slate-900/90 dark:border-slate-700/50 transition-all duration-300">
          
          <div className="flex flex-col items-center mb-6">
            <img 
              src={Logoplaypark1} 
              alt="System Logo" 
              className="h-32 w-auto object-contain drop-shadow-md mb-4"
            />
            <h1 className="text-center text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Wellcome to NOC Report System
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              LOGIN
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Username"
              value={username}
              maxLength={100}
              placeholder="กรอกชื่อผู้ใช้งาน"
              onChange={(e) => setUsername(e.target.value)}
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              maxLength={64}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold uppercase tracking-wider transition-transform active:scale-95"
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "LOGIN"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      
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