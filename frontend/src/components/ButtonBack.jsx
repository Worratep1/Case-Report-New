import React from 'react';
import { ArrowLeft } from 'lucide-react'; // เปลี่ยนจาก Chevron เป็น Arrow เพื่อความ Minimal

// ButtonBack.jsx
export default function ButtonBack({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative inline-flex items-center gap-2 py-2 px-4 rounded-full
        text-slate-500 dark:text-slate-400
        hover:text-blue-600 dark:hover:text-blue-400
        transition-all duration-300 z-10 
        ${className}
      `}
    >
      {/* ใส่ z-[-1] เพื่อให้พื้นหลังอยู่ใต้ตัวอักษรเสมอ */}
      <div className="absolute inset-0 bg-blue-50/80 dark:bg-blue-900/20 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 rounded-full transition-all duration-300 -z-10" />
      
      <ArrowLeft size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
      <span className="font-medium text-sm">{children || "Back"}</span>
    </button>
  );
}