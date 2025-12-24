import React from "react";
import { Loader2, FileDown } from "lucide-react";

const ExportButton = ({ 
  onClick, 
  isExporting = false, 
  disabled = false, 
  label = "Export File",
  loadingLabel = "กำลัง Export..."
}) => {
  return (
    <button
      onClick={onClick}
      // ปุ่มจะกดไม่ได้ถ้ากำลังโหลด หรือ ถูกสั่งให้ disable (เช่น ไม่มีข้อมูล)
      disabled={isExporting || disabled}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-normal whitespace-nowrap
        transition-all duration-300 
        ${
          disabled
            ? "bg-slate-200 text-slate-400 cursor-not-allowed" // สีตอนกดไม่ได้
            : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg  shadow-green-600/50 hover:-translate-y-1 active:scale-95" // สีปกติ
        }
      `}
    >
      {isExporting ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span className="hidden sm:inline">{loadingLabel}</span>
        </>
      ) : (
        <>
          <FileDown size={18} strokeWidth={2.5} />
          <span className="hidden sm:inline">{label}</span>
        </>
      )}
    </button>
  );
};

export default ExportButton;