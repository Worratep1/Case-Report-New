import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, ChevronLeft, ChevronRight, PlusCircle, FileSpreadsheet, 
  MousePointer2, Settings, FileCog, User, ChevronUp, ShieldCheck
} from "lucide-react";
import ButtonHome from "../components/ButtonHome";

// --- 1. ข้อมูลคงเดิมตามที่คุณฟอร์ดกำหนดไว้ ---
const MANUAL_DATA = [
  {
    id: 1,
    title: "1. การเข้าสู่ระบบ (Admin Login)",
    icon: <User className="text-blue-500" />,
    slides: [
      {
        description: "ระบุ Username และ Password เพื่อเข้าใช้งานระบบ หากท่านยังไม่มีบัญชี กรุณาติดต่อหัวหน้าทีม NOC เพื่อขอรับสิทธิ์",
        image: "src/assets/manual/login1.png", 
      },
      {
        description: "กรณีลืมรหัสผ่านหรือเข้าไม่ได้ ระบบจะล็อกชั่วคราวหากกรอกผิดเกิน 5 ครั้ง ให้ติดต่อ Admin ส่วนกลาง",
        image: "src/assets/manual/menupage.png",
      }
    ]
  },
  {
    id: 2,
    title: "2. การแจ้งเคสใหม่ (Add Case)",
    icon: <PlusCircle className="text-emerald-500" />,
    slides: [
      {
        description: "เลือกปุ่ม 'แจ้ง Case' จากเมนูหลัก เพื่อบันทึกปัญหาที่เกิดขึ้น ระบบจะดึงเวลาปัจจุบันให้อัตโนมัติ",
        image: "src/assets/manual/menupage3.png",
      },
      {
        description: "ระบุรายชื่อเกม และรายละเอียดปัญหาให้ครบถ้วน เพื่อให้ระบบคำนวณ Downtime ได้อย่างแม่นยำ",
        image: "src/assets/manual/Casepage2.png",
      }
    ]
  },
];

// --- 2. คอมโพเนนต์ Card ที่ปรับปรุง Animation ---
const InteractiveCard = ({ step }) => {
  const [activeSub, setActiveSub] = useState(0); //

  // ฟังก์ชันควบคุมการเลื่อนสไลด์
  const nextSub = () => setActiveSub((prev) => (prev + 1) % step.slides.length);
  const prevSub = () => setActiveSub((prev) => (prev - 1 + step.slides.length) % step.slides.length);

  return (
    <div className="relative group/card bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all hover:shadow-2xl">
      
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm text-indigo-600 dark:text-indigo-400">
            {step.icon}
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{step.title}</h3>
        </div>
        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black">
          {activeSub + 1} / {step.slides.length}
        </span>
      </div>

      <div className="p-8 md:p-12 space-y-8 relative overflow-hidden">
        {/* ปุ่มลูกศรซ้าย-ขวา */}
        {step.slides.length > 1 && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none">
            <button onClick={prevSub} className="p-3 bg-white/90 dark:bg-slate-800 rounded-full shadow-lg pointer-events-auto hover:scale-110 active:scale-95 transition-all border border-slate-200 dark:border-slate-700">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextSub} className="p-3 bg-white/90 dark:bg-slate-800 rounded-full shadow-lg pointer-events-auto hover:scale-110 active:scale-95 transition-all border border-slate-200 dark:border-slate-700">
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {/* --- ส่วนที่เพิ่ม Animation: Sliding Track --- */}
        <div 
          className="flex transition-transform duration-500 ease-in-out" 
          style={{ transform: `translateX(-${activeSub * 100}%)` }} // เลื่อน Track ตาม index
        >
          {step.slides.map((slide, idx) => (
            <div key={idx} className="w-full flex-shrink-0 space-y-8">
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {slide.description}
              </p>

              <div className="relative rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-inner">
                <img 
                  src={slide.image} 
                  className="w-full h-auto max-h-[500px] object-contain"
                  alt="Manual Detail"
                  onError={(e) => { e.target.src = "https://placehold.co/1200x675/4f46e5/ffffff?text=Image+Coming+Soon"; }}
                />
              </div>
            </div>
          ))}
        </div>
      

        <div className="flex justify-center gap-2 mt-4">
          {step.slides.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveSub(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeSub ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-300 dark:bg-slate-700'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ManualPage() {
  const navigate = useNavigate(); //
  const [showBackTop, setShowBackTop] = useState(false); //

  useEffect(() => {
    const handleScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 font-sans pb-20 transition-colors duration-500">
      
      {/* Header คงเดิม */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 h-20 flex items-center">
        <div className="max-w-screen-2xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/menu")} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <ChevronLeft size={24} className="text-slate-500" />
            </button>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Manual</h1>
          </div>
          <ButtonHome onClick={() => navigate("/menu")} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Welcome Section คงเดิม */}
        <div className="mb-20 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-black mb-6 uppercase border border-indigo-100 dark:border-indigo-800">
            <ShieldCheck size={16} /> Interactive Manual
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">NOC Operations Guide</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">เลื่อนเมาส์ไปที่หัวข้อแล้วกดลูกศรเพื่อดูขั้นตอนการทำงานย่อย</p>
        </div>

        {/* รายการ Card ทั้งหมด */}
        <div className="space-y-16">
          {MANUAL_DATA.map((step) => (
            <InteractiveCard key={step.id} step={step} />
          ))}
        </div>
      </main>

      {showBackTop && (
        <button onClick={scrollToTop} className="fixed bottom-10 right-10 p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl active:scale-95 transition-all">
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}