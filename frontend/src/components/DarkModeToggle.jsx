import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * Component สำหรับสลับโหมด Light/Dark Mode และบันทึกสถานะไว้ใน Local Storage
 *
 * @returns {JSX.Element} ปุ่ม Toggle Dark Mode
 */
export default function DarkModeToggle() {
  // --- Logic Dark Mode ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 1. ดึงค่าจาก Local Storage เมื่อโหลดครั้งแรก
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    // 2. ใช้ useEffect เพื่อจัดการ class 'dark' บน HTML tag และบันทึกค่าลง Local Storage
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={toggleDarkMode}
        
        className="p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg border border-white/50 dark:border-slate-700
                   text-slate-600 dark:text-yellow-400 transition-all hover:scale-110 active:rotate-12 duration-300 hover:shadow-xl"
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
    </div>
  );
}