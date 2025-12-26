import React from 'react';

const ViewModeToggle = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg border border-slate-200 dark:border-slate-600">
      <button
        onClick={() => setViewMode("daily")}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          viewMode === "daily"
            ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
      >
        รายวัน
      </button>
      <button
        onClick={() => setViewMode("monthly")}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          viewMode === "monthly"
            ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
      >
        รายเดือน
      </button>
    </div>
  );
};

export default ViewModeToggle;