import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PlusCircle, FileSpreadsheet, ChevronLeft, ChevronRight, 
  User, ChevronUp, ShieldCheck, Settings
} from "lucide-react";
import ButtonHome from "../components/ButtonHome";
 
//    ,
          
const MANUAL_DATA = [
  {
    id: 1,
    title: "1. การเข้าสู่ระบบ (Admin Login)",
    icon: <User className="text-blue-500" />,
    slides: [
      {
        description:
          "ผู้ใช้งานระดับผู้ดูแลระบบ (Admin) ต้องระบุ Username และ Password เพื่อเข้าสู่ระบบ หากยังไม่มีบัญชีผู้ใช้งาน สามารถติดต่อผู้ดูแลระบบเพื่อขอสร้างบัญชีได้",
        image: "src/assets/manual/login1.png",
      },
      {
        description:
          "เมื่อเข้าสู่ระบบสำเร็จ ระบบจะแสดงหน้าเมนูหลักสำหรับการใช้งานฟังก์ชันต่าง ๆ ภายในระบบ",
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
        description:
          "ผู้ใช้งานสามารถเลือกเมนู 'แจ้ง Case' จากหน้าเมนูหลัก เพื่อบันทึกรายละเอียดปัญหาเมื่อมีเหตุการณ์หรือเคสใหม่เกิดขึ้น",
        image: "src/assets/manual/menupage3.png",
      },
      {
        description:
          "เมื่อเลือกเมนู 'แจ้ง Case' ระบบจะแสดงหน้าฟอร์มสำหรับบันทึกข้อมูลเคส ผู้ใช้งานต้องกรอกข้อมูลให้ครบถ้วนและถูกต้องทุกช่อง เนื่องจากข้อมูลดังกล่าวจะถูกนำไปประมวลผลเพื่อจัดทำรายงาน (Report) ในภายหลัง เมื่อกรอกข้อมูลเรียบร้อยแล้วให้กดปุ่ม Submit Case เพื่อบันทึกข้อมูลลงระบบ",
        image: "src/assets/manual/Casepage2.png"
      }
    ]
  },
  {
    id: 3,
    title: "3. การจัดทำรายงาน (Report)",
    icon: <FileSpreadsheet className="text-blue-500" />,
    slides: [
      {
        description:
          "ผู้ใช้งานระดับผู้ดูแลระบบ (Admin) สามารถจัดทำรายงานได้โดยเลือกเมนู 'Report' จากหน้าเมนูหลัก",
        image: "src/assets/manual/Menu2.png",
      },
      {
        description: "ประเภทของรายงานภายในระบบ",
        items: [
          "Daily Report: ใช้สำหรับสรุปรายงานข้อมูลประจำวัน",
          "Custom Report: ใช้สำหรับปรับแก้หรือกำหนดรูปแบบรายงานด้วยตนเอง"
        ],
        image: "src/assets/manual/MenuReport.png"
      },
      {
        description:
          "เมื่อเลือกเมนู 'Daily Report' ระบบจะแสดงหน้ารายงานประจำวัน โดยแสดงรายการเคสทั้งหมดที่ถูกบันทึกไว้ พร้อมสรุปข้อมูลสำคัญในรูปแบบ Dashboard เพื่อให้สามารถตรวจสอบภาพรวมของข้อมูลได้อย่างรวดเร็ว",
        image: "src/assets/manual/Dailyreport2.png",
      },
      {
        description: "การจัดการและส่งออกข้อมูลรายงาน",
        items: [
          "ปุ่ม Export File: ใช้สำหรับดาวน์โหลดข้อมูลรายงานทั้งหมดออกมาในรูปแบบไฟล์ Excel",
          "ปุ่ม Send Email: ใช้สำหรับส่งสรุปรายงานประจำวันไปยังผู้รับอีเมลที่ถูกกำหนดไว้ในระบบ"
        ],
        image: "src/assets/manual/Dailyreport2.png"
      },
      {
        description: "รายละเอียดการส่งรายงานผ่านอีเมล (Send Email)", // เมื่อกดปุ่ม Send Email จะเเสดง Pop-up ตามเเบบฟอร์มให้ -เลือกรายชื่อผู้รับอีเมลสามารถเลือกได้มากกว่า 1 ชื่อ -สามารถกำหนดหัวข้อและข้อความอธิบายรายงานเพิ่มเติม  -
        items: [
          "Select Recipients: เลือกรายชื่อผู้รับอีเมลได้มากกว่า 1 รายชื่อ",
          "Subject & Message: กำหนดหัวข้อและข้อความอธิบายรายงานเพิ่มเติม",
          "Attachments: แนบไฟล์ได้สูงสุด 5 ไฟล์ โดยแต่ละไฟล์ต้องมีขนาดไม่เกิน 5 MB",
          "Confirm Send: ยืนยันการส่งรายงานไปยังผู้รับอีเมล"
        ],
        image: "src/assets/manual/SendEmail.png"
      },
      {
         description:"เมื่อเลือกเมนู 'Custom Report' ระบบจะแสดงหน้ารายงานที่มีลักษณะการแสดงผลแบบ Dashboard เช่นเดียวกับหน้า Daily Report",

        image: "src/assets/manual/Customreport.png"
      },
      {
        description: "การจัดการข้อมูลในหน้า Custom Report",
        items: [
          "แก้ไขและลบข้อมูล: ปรับปรุงรายละเอียดเคสหรือลบข้อมูลที่ไม่ถูกต้องออกจากระบบ",
          "เพิ่มเคสใหม่หรือบันทึกย้อนหลัง: สามารถระบุวันและเวลาย้อนหลังได้",
          "Export File และ Send Email: การทำงานเหมือนกับหน้า Daily Report"
        ],
        image: "src/assets/manual/Customreport.png"
      }
    ]
  },
  {
    id: 4,
    title: "4. การตั้งค่าระบบ (Setting)",
    icon: <Settings className="text-slate-700 dark:text-slate-200" />,
    slides: [
      {
        description:
          "ผู้ใช้งานระดับผู้ดูแลระบบ (Admin) สามารถเข้าถึงเมนูการตั้งค่าระบบได้โดยเลือกเมนู 'Setting' จากหน้าเมนูหลัก",
        image: "src/assets/manual/menupagesetting.png",
      },
      {
        description:
          "เมื่อเข้าสู่เมนู 'Setting' ระบบจะแสดงเมนูการตั้งค่าหลัก 3 ส่วน ได้แก่ Game Setting, Member Setting และ Recipient Setting",
        image: "src/assets/manual/Settingpage.png"
      },
      {
        description:
          "เมื่อเลือกเมนู 'Game Setting' ระบบจะแสดงหน้ารายชื่อเกม ผู้ใช้งานสามารถเพิ่ม แก้ไข หรือ ลบข้อมูลเกมได้ โดยใช้ปุ่ม + Add Game, ไอคอนดินสอ (Edit) และไอคอนถังขยะ (Delete)",
        image: "src/assets/manual/Gamesetting.png"
      },
      {
        description:
          "เมื่อกดปุ่ม + Add Game ระบบจะแสดงหน้าต่าง Pop-up สำหรับกรอกชื่อเกมใหม่ เมื่อกรอกข้อมูลเรียบร้อยแล้วให้กดปุ่ม Save Game เพื่อบันทึกข้อมูล",
        image: "src/assets/manual/Addgame.png"
      },
      {
        description:
          "เมื่อเลือกเมนู 'Member Setting' ระบบจะแสดงรายชื่อสมาชิก ผู้ใช้งานสามารถเพิ่ม แก้ไข หรือ ลบข้อมูลสมาชิกได้",
        image: "src/assets/manual/membersetting.png"
      },
      {
        description:
          "เมื่อกดปุ่ม + Add Member ระบบจะแสดงหน้าต่าง Pop-up สำหรับกรอกข้อมูลสมาชิกใหม่ตามฟอร์มที่กำหนด เมื่อกรอกข้อมูลครบถ้วนแล้วให้กดปุ่ม Save Member เพื่อบันทึกข้อมูล",
        image: "src/assets/manual/addmember1.png"
      },
      {
        description:
          "เมื่อเลือกเมนู 'Recipient Setting' ระบบจะแสดงรายชื่อผู้รับอีเมล ผู้ใช้งานสามารถเพิ่ม แก้ไข หรือ ลบข้อมูลผู้รับอีเมลได้",
        image: "src/assets/manual/recipientSetting.png"
      },
      {
        description:
          "เมื่อกดปุ่ม + Add Recipient ระบบจะแสดงหน้าต่าง Pop-up สำหรับกรอกข้อมูลผู้รับอีเมลใหม่ตามฟอร์มที่กำหนด จากนั้นกดปุ่ม Save Recipient เพื่อบันทึกข้อมูลลงระบบ",
        image: "src/assets/manual/addRecipient.png"
      }
    ]
  }
];


// --- 2. คอมโพเนนต์ Card ปรับปรุงเรื่องความเท่ากันและ Alignment ---
const InteractiveCard = ({ step }) => {
  const [activeSub, setActiveSub] = useState(0);

  const nextSub = () => setActiveSub((prev) => (prev + 1) % step.slides.length);
  const prevSub = () => setActiveSub((prev) => (prev - 1 + step.slides.length) % step.slides.length);

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
      
      {/* Header ของ Card - คงขนาดและรูปแบบเดิม */}
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm">
            {step.icon}
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{step.title}</h3>
        </div>
        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black">
          {activeSub + 1} / {step.slides.length}
        </span>
      </div>

      <div className="px-8 pb-8 pt-6 space-y-6 relative overflow-hidden">
        {/* Navigation Arrows */}
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

        <div 
          className="flex transition-transform duration-500 ease-in-out" 
          style={{ transform: `translateX(-${activeSub * 100}%)` }}
        >
          {step.slides.map((slide, idx) => (
            <div key={idx} className="w-full flex-shrink-0 space-y-6 px-2">
              
              {/* ส่วนเนื้อหาข้อความ: ปรับ Font Size และ Alignment ให้เท่ากันทุกหน้า */}
              <div className="min-h-0 flex flex-col justify-start space-y-3">
                {/* แสดง Slide Title (ถ้ามี) */}
                {slide.title && (
                  <p className="text-xl text-left text-slate-800 dark:text-white font-bold leading-tight">
                    {slide.title}
                  </p>
                )}

                {/* แสดง Slide Description (ถ้ามี) */}
                {slide.description && (
                  <p className="text-lg text-left whitespace-pre-line text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {slide.description}
                  </p>
                )}

                {/* แสดง Slide Items (ถ้ามี) */}
                {slide.items && (
                  <ul className="space-y-2">
                    {slide.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-lg text-slate-600 dark:text-slate-300">
                        <span className="mt-3 w-4 h-[2px] bg-indigo-500 flex-shrink-0" />
                        <span className="text-left leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* ส่วนรูปภาพ - ปรับกึ่งกลางและกรอบรูป */}
              <div className="flex justify-center w-full">
                <div className="relative rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-2xl">
                  <img 
                    src={slide.image} 
                    className="w-full h-auto max-h-[500px] object-contain mx-auto block" 
                    alt="Step Detail"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Navigator */}
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
  const navigate = useNavigate();
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 font-sans pb-20 transition-colors duration-500">
      
      {/* Header Bar - คงไว้แบบเดิม ไม่เปลี่ยนขนาด */}
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
        <div className="mb-20 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-black mb-6 uppercase border border-indigo-100 dark:border-indigo-800">
            <ShieldCheck size={16} /> Interactive Manual
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">NOC Operations Guide</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">คู่มือการใช้งานระบบสำหรับผู้ดูแลระบบ (Admin Only)</p>
        </div>

        <div className="space-y-24">
          {MANUAL_DATA.map((step) => (
            <InteractiveCard key={step.id} step={step} />
          ))}
        </div>
      </main>

      {showBackTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-10 right-10 p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl active:scale-95 transition-all">
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}