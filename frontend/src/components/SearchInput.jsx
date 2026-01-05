import React from 'react';
import { Search } from 'lucide-react';


export default function SearchInput({ 
  value, 
  onChange, 
  placeholder = "ค้นหา...", 
  className = "" 
}) {
  return (
    <div className={`relative w-full sm:w-auto ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64
                  bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white 
                  transition-all duration-200"
      />
    </div>
  );
}