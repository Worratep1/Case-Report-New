import React from "react";
import { Send } from "lucide-react";

const ButtonSend = ({ 
  onClick, 
  disabled = false, 
  label = "Send Report" 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/50 transition-all active:scale-95 text-sm font-normal whitespace-nowrap
        duration-300
        ${
          disabled
            ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:-translate-y-1 hover:shadow-lg"
        }
      `}
    >
      <Send size={16} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

export default ButtonSend;