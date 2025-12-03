import { CheckCircle2,AlertTriangle,X } from "lucide-react";

export default function StatusModal({
     isOpen, 
     type = "success",
     title = "",
     message = "",
     onClose,
    }) {
    if (!isOpen) return null;

    const isSuccess = type === "success";
    const isWarning = type === "warning";
    const isError = type === "error";
        
    const iconColor = isSuccess
    ? "text-green-600"
    : isWarning
    ? "text-yellow-600"
    : "text-red-600";

    const bgIcon = isSuccess
    ? "bg-green-100"
    : isWarning
    ? "bg-yellow-100"
    : "bg-red-100";

     return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
        {/* ปุ่ม X ปิด */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ไอคอน */}
        <div
          className={`w-16 h-16 ${bgIcon} rounded-full flex items-center justify-center mx-auto mb-4`}
        >
          {isSuccess && <CheckCircle2 className={`w-9 h-9 ${iconColor}`} />}
          {isWarning && <AlertTriangle className={`w-9 h-9 ${iconColor}`} />}
          {isError && <AlertTriangle className={`w-9 h-9 ${iconColor}`} />}
        </div>

        {/* เนื้อหา */}
        <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
          {title}
        </h3>
        {message && (
          <p className="text-sm text-slate-500 text-center mb-5">
            {message}
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  );
}