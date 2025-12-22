import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  ChevronLeft, 
  PlusCircle, 
  Filter, 
  FileSpreadsheet, 
  Mail,
  MousePointer2 
} from "lucide-react";
import ButtonHome from "../components/ButtonHome";

// --- รายการขั้นตอนในคู่มือ ---
const MANUAL_STEPS = [
  {
    id: 1,
    title: "1. การเพิ่มเคสใหม่ (New Case)",
    icon: <PlusCircle className="text-emerald-500" />,
    description: "กดปุ่ม 'New Case' สีเขียวที่มุมขวาบน เพื่อเปิดหน้าต่างกรอกข้อมูลใหม่",
    image: "/assets/manual/step1.png", // ใส่ Path รูปของฟอร์ด
    tips: "Tip: ระบบจะคำนวณเวลา (Duration) ให้เองอัตโนมัติเมื่อเลือกเวลาเริ่มและเวลาจบ"
  },
  {
    id: 2,
    title: "2. การกรองและค้นหาข้อมูล",
    icon: <Filter className="text-blue-500" />,
    description: "ใช้ช่อง Search เพื่อค้นหาชื่อเกม หรือเลือก Status เพื่อดูเฉพาะเคสที่ต้องการ",
    image: "/assets/manual/step2.png",
    tips: "กราฟด้านบนจะขยับตามข้อมูลที่ท่านกรองแบบ Real-time"
  },
  {
    id: 3,
    title: "3. การส่งเมลและแนบไฟล์",
    icon: <Mail className="text-indigo-500" />,
    description: "กดปุ่ม 'Send Email' เลือกรายชื่อผู้รับ และสามารถแนบไฟล์ได้สูงสุด 5 ไฟล์",
    image: "/assets/manual/step3.png",
    tips: "ตรวจสอบชื่อผู้รับให้ถูกต้องก่อนกด 'Confirm Send'"
  }
];

export default function ManualPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/menu")}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <ChevronLeft className="text-slate-500" />
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="text-indigo-600 w-6 h-6" />
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">คู่มือการใช้งานระบบ</h1>
            </div>
          </div>
          <ButtonHome onClick={() => navigate("/menu")} />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">ยินดีต้อนรับสู่ระบบ NOC Daily Report</h2>
          <p className="text-slate-500 dark:text-slate-400">คำแนะนำขั้นตอนการใช้งานระบบเบื้องต้นสำหรับทีมงาน</p>
        </div>

        <div className="space-y-12">
          {MANUAL_STEPS.map((step) => (
            <div key={step.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-4">
                <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{step.title}</h3>
              </div>

              <div className="p-6 space-y-6 text-left">
                <p className="text-lg text-slate-600 dark:text-slate-300">
                   {step.description}
                </p>

                {/* ส่วนแสดงรูปภาพอธิบาย */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-indigo-600/5 rounded-2xl transition-opacity group-hover:opacity-0" />
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md transition-transform duration-500"
                    onError={(e) => { e.target.src = "https://placehold.co/800x450?text=Manual+Image+Placeholder"; }}
                  />
                </div>

                {/* ข้อความแนะนำเพิ่มเติม */}
                <div className="flex gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                  <MousePointer2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                    {step.tips}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}