import React from 'react';
import { Home } from 'lucide-react';

const ButtonHome = ({ onClick, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      // 1. กำหนดสีและ Transition ที่ปุ่มแม่ (SVG จะเปลี่ยนสีตาม text-color p-2 hover:bg-slate-100 hover:text-blue-600 rounded-full text-slate-500 transition-colors)
      // 2. เพิ่ม p-1.5 หรือ p-2 เพื่อให้มีพื้นที่รอบๆ ไอคอน กดง่ายขึ้น
      className={`text-color p-2 hover:bg-slate-100 hover:text-blue-600 rounded-full text-slate-500 transition-colors ${className}`}
      aria-label="Back to Menu"
    >
      {/* ใส่ขนาด w-6 h-6 และ strokeWidth ตามที่คุณต้องการ */}
      <Home  size={24}  />
    </button>
  );
};

export default ButtonHome;