import React from "react";

export default function Input({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  icon,
  rightElement, 
  ...props
}) {
  return (
    <div className="mb-4 w-full text-left">
      {label && (
        <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
          {label}
        </label>
      )}

      
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
          className={`w-full py-2.5 border border-slate-300 rounded-xl text-sm transition-all
                     focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500
                     bg-white dark:bg-slate-900 
                     dark:border-slate-700 
                     text-slate-900 dark:text-white
                     placeholder-slate-400 dark:placeholder-slate-500
                     ${icon ? "pl-11" : "px-4"} 
                     ${rightElement ? "pr-12" : "pr-4"}
          `}
        />
        {/* ไอคอนปุ่มลูกตาจะอยู่ตรงนี */}
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 dark:text-slate-500">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}