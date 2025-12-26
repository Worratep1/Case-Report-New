import React from 'react';
import { ChevronRight } from 'lucide-react';

const MenuButton = ({ icon, label, onClick, description }) => (
  <button 
    onClick={onClick}
    className="group w-full flex items-center p-4 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 
    border border-slate-100 dark:border-slate-700/50 rounded-2xl transition-all duration-200 
    shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
  >
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-600 transition-colors shadow-sm duration-300">
      <div className="transition-colors duration-300">
        {icon}
      </div>
    </div>
    
    <div className="ml-4 text-left flex-1">
      <h3 className="font-medium text-slate-700 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-300">
        {label}
      </h3>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5 duration-300">
          {description}
        </p>
      )}
    </div>
    
    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-500 group-hover:text-blue-400 dark:group-hover:text-blue-400 transition-colors duration-300" />
  </button>
);

export default MenuButton;