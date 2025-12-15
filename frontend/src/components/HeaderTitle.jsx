import React from 'react';
import { LayoutGrid } from 'lucide-react';

const HeaderTitle = () => (
  <div className="mb-8 text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 shadow-inner duration-300">
      <LayoutGrid size={32} />
    </div>
    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight duration-300">
      Daily Report System
    </h1>
    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 duration-300">
      ยินดีต้อนรับสู่ระบบรายงานประจำวัน 
    </p>
  </div>
);

export default HeaderTitle;