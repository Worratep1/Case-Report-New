// ไฟล์นี้เก็บค่า Config ของสถานะต่างๆ ไว้ที่เดียว

export const STATUS_CONFIG = {
  open: {
    label: "Open",
    color: "#3b82f6", // สีฟ้า
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  onhold: {
    label: "Onhold",
    color: "#f59e0b", // สีเหลือง/ส้ม
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  closed: {
    label: "Closed",
    color: "#64748b", // สีเทา
    bg: "bg-slate-50",
    text: "text-slate-700",
  },
  others: {
    label: "Unknown",
    color: "#94a3b8",
    bg: "bg-gray-100",
    text: "text-gray-500",
  },
};