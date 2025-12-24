import React from "react";

export default function PageHeader({
  title,
  subtitle,
  icon,
  left,
  right,
  showDivider = true,
  iconColor = "text-blue-400"
}) {
  return (
    <header
      className="sticky top-0 z-40 shadow-sm
        bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"
    >
      <div className="w-full px-4 sm:px-8">
        <div className="flex items-center h-16 justify-around">

          {/* LEFT + DIVIDER */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {left}
            </div>

            {showDivider && (
              <div className="h-9 w-px bg-slate-500 " />
            )}

            {/* ICON + TITLE */}
            <div className="flex items-center gap-3 mr-auto">
              {icon && (
               <div className={`p-2 rounded-lg ${iconColor} group-hover:bg-white dark:group-hover:bg-slate-600`}>
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-xl font-medium text-slate-800 dark:text-white leading-tight text-start">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-start text-xs text-slate-400">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">
            {right}
          </div>

        </div>
      </div>
    </header>
  );
}
