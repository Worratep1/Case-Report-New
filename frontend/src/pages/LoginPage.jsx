import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { login } from "../api/auth";

import ActionFeedbackModal from "../components/ActionFeedbackModal";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // ✅ แก้ชื่อตัวแปรให้เป็น CamelCase (S ตัวใหญ่) ให้ตรงกัน
  const [showErrorModal , setShowErrorModal] = useState(false);
  const [errorMessage , setErrorMessage] = useState("");
  

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const data = await login(username, password);
      // 🎯 เก็บ token + user ไว้

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("เข้าสู่ระบบสำเร็จ 🎉");
      navigate("/menu");  // ไปหน้า MainPage (เฉพาะตอน Login ผ่านเท่านั้น)
    } catch (err) {
       console.error("Login Error", err);

       const msg = err.response?.data?.message || "Username หรือ Password ไม่ถูกต้อง";
       
       setErrorMessage(msg);
       setShowErrorModal(true); // ✅ เรียกใช้ตัวแปรที่ถูก

      // setMessage(err.message); // อันนี้อาจจะไม่ต้องใช้แล้วก็ได้ถ้ามี Modal
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="fixed grid place-items-center inset-0 w-full h-full 
  bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
  overflow-y-auto z-0 pt-10">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-center text-xl font-bold text-slate-800 mb-1">
          Daily Report System
        </h1>
        <p className="text-center text-xs text-slate-500 mb-6">
          Web Report & Case Management
        </p>


        <form onSubmit={handleLogin}>
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

         
          <Button type="submit" disabled={loading}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
          </Button>
        </form>

        {/* ถ้าอยากซ่อนข้อความ text สีแดงเดิม ก็ลบส่วนนี้ออกได้ เพราะมี Modal แล้ว
        {message && !showErrorModal && (
          <p className="mt-4 text-center text-green-600 text-sm">{message}</p>
        )} */}
      </div>
      
      <ActionFeedbackModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)} // ✅ ตอนนี้ชื่อตรงกันแล้ว
        type="error" 
        title="เข้าสู่ระบบไม่สำเร็จ"
        message={errorMessage} 
        confirmText="ลองใหม่อีกครั้ง"
      />
    </div>
  );
}