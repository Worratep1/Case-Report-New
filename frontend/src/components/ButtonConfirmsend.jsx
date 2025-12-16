import React from 'react';
import { Loader2, Send } from 'lucide-react'; // อย่าลืม import ไอคอนมาด้วยนะ

const SendButton = ({ onClick, isLoading, label = "Confirm Send" }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="px-6 py-2.5 rounded-lg font-medium text-sm shadow-md shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center 
      gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
       bg-indigo-600 text-white hover:bg-indigo-700  duration-300 hover:-translate-y-1 transition-all "
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Send size={16} />
      )}
      {label}
    </button>
  );
};

export default SendButton;