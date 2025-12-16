// components/HeaderTitle.jsx

import React from 'react';
import { LayoutGrid } from 'lucide-react'; // เดาไอคอนจากรูป

// ✅ รับ props { username } เข้ามาตรงนี้
export default function HeaderTitle({ username }) {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200 dark:shadow-none">
        <LayoutGrid size={32} className="text-white" />
      </div>
      
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
        Daily Report System
      </h1>
      
      
      <p className="text-slate-500 dark:text-slate-400 font-medium">
        ยินดีต้อนรับ คุณ <span className="text-indigo-600 dark:text-indigo-400">{username} </span>
      </p>
    </div>
  );
}