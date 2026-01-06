import React from "react";
import { Home } from "lucide-react";

const ButtonHome = ({ onClick, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
       
        flex items-center justify-center p-2.5 rounded-full transition-all duration-200 bg-transparent text-slate-500 dark:text-slate-400  border border-transparent 
        hover:bg-slate-100 dark:hover:bg-slate-700
        hover:text-blue-600 dark:hover:text-blue-400
        hover:shadow-sm active:scale-90 active:bg-slate-200 dark:active:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40
        ${className}`}
      aria-label="Home Menu"
    >
      <Home
        size={22}
        strokeWidth={2}
        className="transition-transform duration-200"
      />
    </button>
  );
};

export default ButtonHome;
