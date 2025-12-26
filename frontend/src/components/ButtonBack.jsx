import React from 'react';
import { ChevronLeft } from 'lucide-react';

export default function ButtonBack({ children, type = "button", onClick, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        flex items-center gap-1 pr-4 pl-3 py-2.5 rounded-full
        bg-slate-100 dark:bg-slate-800
        text-slate-600 dark:text-slate-300
        font-semibold text-sm
        border border-transparent
        transition-all duration-300
        
        hover:bg-blue-50 dark:hover:bg-blue-900/30
        hover:text-blue-600 dark:hover:text-blue-400
        hover:pr-5 hover:pl-2
        ${className}
      `}
    >
      <ChevronLeft size={20} />
      {children || "Back"}
    </button>
  );
}