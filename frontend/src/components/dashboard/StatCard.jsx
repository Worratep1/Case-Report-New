import React from 'react';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-center">
      <div className="flex items-center gap-4 "> 
        
        <div className="flex-1 min-w-0">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-0.5 text-left">
            {title}
          </p>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white leading-none truncate text-left" title={value}>
            {value}
          </h3>
        </div>

        <div className={`p-3 rounded-lg ${color} dark:bg-opacity-20 shrink-0 items-center justify-center flex`}>
          {icon}
        </div>
        
      </div>
    </div>
  );
};

export default StatCard;