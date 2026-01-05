import React from 'react';
import { ChevronLeft } from 'lucide-react';

export default function BackIconButton({ className = "", onClick }) {
  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      window.history.back();
    }
  };

  return (
    <button
      type="button"
      className={`
        p-2 rounded-full 
        text-slate-500 dark:text-slate-400
        hover:bg-slate-100 dark:hover:bg-slate-700
        transition-colors duration-200
        ${className}
      `}
      onClick={handleBack}
      aria-label="Back"
    >
      <ChevronLeft size={24} />
    </button>
  );
}