import React, { useState } from "react";
import {
  LogIn,
  LayoutDashboard,
  PlusCircle,
  FileText,
  UserCog,
  Mail,
  ChevronRight,
  FileCog,
  Edit2,
  Trash2,
  Gamepad2,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackIconButton from "../components/BackIconButton.jsx";
import loginImg from "../assets/manual/login1.png";
import menuImg from "../assets/manual/menupage.png";
import casepageImg from "../assets/manual/Casepage.png";
import dailyReportImg from "../assets/manual/Dailyreport2.png";
import sendEmailImg from "../assets/manual/sendmail1.png";
import addGame from "../assets/manual/Addgame.png";
import addMember from "../assets/manual/Addmember.png";
import AddRecipient from "../assets/manual/AddRecipient.png"
import customReportImg from "../assets/manual/Customreport.png";
import gamesettingImg from "../assets/manual/Gamesetting.png";
import membersettingImg from "../assets/manual/Membersetting.png";
import recipientsettingImg from "../assets/manual/recipientSetting.png";


// Component สำหรับแสดงปุ่มจำลองในเนื้อหาคู่มือ 
const UIHint = ({ icon: Icon, label, variant = "primary" }) => {
  const styles = {
    primary: "bg-blue-600 text-white border-blue-700 hover:bg-blue-700",
    add: "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700",
    success: "bg-blue-600 text-white border-blue-700 hover:bg-blue-700",
    danger: "rounded-lg transition-colors text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30",
    Edit: " rounded-xs transition-colors text-slate-400 hover:text-yellow-600 hover:bg-yellow-50  dark:hover:text-yellow-400 dark:hover:bg-yellow-900/30 ",
    Send: "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700"
  };

  return (
    <span
      className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 mx-1 
      rounded-lg font-normal text-sm border shadow-sm 
      transition-colors cursor-default select-none
      ${styles[variant] || styles.primary}
    `}
    >
      {Icon && <Icon size={14} strokeWidth={3} />}
      {label}
    </span>
  );
};

// 2.1 Card Item Component (สำหรับหน้า Overview)
const ManualCard = ({ item, onClick }) => (
  <div
    onClick={() => onClick(item)}
    className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
  >
    <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
      {item.icon}
    </div>
    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
      {item.title}
    </h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-grow">
      {item.description}
    </p>
    <div className="flex items-center text-sm font-semibold text-indigo-500 dark:text-indigo-400 mt-auto">
      ดูรายละเอียด{" "}
      <ChevronRight
        size={16}
        className="ml-1 group-hover:translate-x-1 transition-transform"
      />
    </div>
  </div>
);


const ManualDetail = ({ item, onBack }) => {
  if (!item) return null;

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
    

      <div className="bg-white dark:bg-slate-900 m-6 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
        <div className="p-8 border-b   border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm">
              {item.icon}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {item.title}
            </h2>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {item.description}
          </p>
        </div>

        <div className="p-8 space-y-10">
          {item.content.steps && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                {item.content.stepTitle || "ขั้นตอนการใช้งาน"}
              </h3>
              <ul className="space-y-3 pl-2">
                {item.content.steps.map((step, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-lg"
                  >
                    <span className="flex-shrink-0    text-indigo-600 dark:text-indigo-400  flex items-center justify-center text-xs font-bold mt-1.5">
                      {"-"}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.content.features && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                ความสามารถหลัก
              </h3>
              <ul className="space-y-2 pl-4">
                {item.content.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-slate-600 dark:text-slate-300"
                  >
                    <span className=" text-emerald-500">-</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              ตัวอย่างหน้าจอ
            </h3>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-inner">
              {item.content.image ? (
                <img
                  src={item.content.image}
                  alt={item.title}
                  className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="h-80 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-full mb-3 shadow-sm">
                    {item.icon}
                  </div>
                  <span className="font-medium">ยังไม่มีรูปภาพประกอบ</span>
                </div>
              )}
            </div>
            {item.content.imageCaption && (
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 italic">
                {item.content.imageCaption}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3. MAIN PAGE COMPONENT ---
export default function ManualPage() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleNavbarBack = () => {
    if (activeItem) {
      setActiveItem(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/menu");
    }
  };

  const handleBackToOverview = () => {
    setActiveItem(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const MANUAL_DATA = [
    {
      id: "group-start",
      groupTitle: "เริ่มต้นใช้งาน",
      items: [
        {
          id: "login",
          title: "การเข้าสู่ระบบ (Login)",
          icon: <LogIn className="w-6 h-6 text-blue-500" />,
          description: "การเข้าสู่ระบบ จำเป็นต้องมี Account หากยังไม่มี Account สามารถขอสมัครกับผู้ใช้งานระดับ Admin ได้ ",
          content: {
            steps: [
              "กรอก Username ",
              "กรอก Password ",
              <>คลิกที่ปุ่ม <UIHint label="LOGIN" /> เพื่อเข้าสู่ระบบ</>,
            ],
            image: loginImg,
            imageCaption: "รูปที่ 1 หน้า Login เข้าสู่ระบบ",
          },
        },
        {
          id: "main-menu",
          title: "หน้าเมนูหลัก (Main Menu)",
          icon: <LayoutDashboard className="w-6 h-6 text-indigo-500" />,
          description: "ศูนย์รวมเมนูและฟังก์ชันทั้งหมดของระบบ",
          content: {
            stepTitle: "รายละเอียดเมนูหลัก",
            steps: [
              "แจ้ง Case: รายงานบันทึกเหตุการณ์และปัญหาประจำวัน ",
              "Report: รายงาน",
              "Setting: ตั้งค่าระบบ",
              "Manual: คู่มือการใช้งาน",
              "About: เกี่ยวกับ",
              "Logout: ออกจากระบบ",
            ],
            image: menuImg,
            imageCaption: "รูปที่ 2 หน้าเมนูหลักของระบบ",
          },
        },
      ],
    },
    {
      id: "group-case",
      groupTitle: "เเจ้ง Case",
      items: [
        {
          id: "add-case",
          title: "การแจ้ง Case",
          icon: <PlusCircle className="w-6 h-6 text-emerald-500" />,
          description: "บันทึกเหตุการณ์และปัญหาประจำวัน",
          content: {
            steps: [
              "เลือกวันที่เริ่มต้น–สิ้นสุด และเวลาเริ่มต้น–สิ้นสุดของเหตุการณ์ (ระบบจะคำนวณระยะเวลาให้อัตโนมัติ)",
              "เลือก Game ที่เกิดปัญหา และเลือก Status ",
              "เลือกประเภทปัญหา (Problem) ให้ตรงกับเหตุการณ์ที่เกิดขึ้น",
              "กรอกรายละเอียดของเคส (Detail) เพื่ออธิบายเหตุการณ์หรือปัญหาที่เกิดขึ้น",
              "ระบุวิธีการแก้ไข (Solution) ที่ดำเนินการหรือแนวทางการแก้ไข",
              "ระบุผู้ร้องขอ (Requester) และผู้ดำเนินการแก้ไข (Operator)",
              <>เมื่อกรอกข้อมูลครบ แล้วกดปุ่ม <UIHint label="Submit Case" variant="success" /> เพื่อบันทึกข้อมูลลงในระบบ</>,
            ],
            image: casepageImg,
            imageCaption: "รูปที่ 3 แบบฟอร์มการแจ้งเคสใหม่",
          },
        },
      ],
    },
    {
      id: "group-report",
      groupTitle: "รายงาน (Report)",
      items: [
        {
          id: "daily-report",
          title: "Daily Report",
          icon: <FileText className="w-6 h-6 text-blue-500" />,
          description: "รายงานสรุปข้อมูลเคสประจำวัน",
          content: {
            features: [
              "แสดงรายการเคสทั้งหมดของวันปัจจุบัน",
              "เลือกดูข้อมูลย้อนหลังในเเต่ละวันได้",
              "เลือกสลับโหมดเป็นรายวันหรือ รายเดือนได้",
              "Dashboard กราฟสรุปสถานะและสถิติของข้อมูล",
              <>ปุ่ม <UIHint label="Export File " variant="add" /> ดาวน์โหลดข้อมูลเป็น Excel</>,
              <>ปุ่ม <UIHint label="Send Email" variant="Send" /> ส่งอีเมลรายงาน (เลือกผู้รับอีเมล,พิมพ์หัวข้อ/ข้อความ,เเนบไฟล์ได้ไม่เกิน 5 MB ในเเต่ละช่อง) <button onClick={() => setPreviewImage(sendEmailImg)} className="ml-2 text-indigo-500 underline text-sm hover:text-indigo-600 font-medium">ตัวอย่างภาพ</button></>,
            ],
            image: dailyReportImg,
            imageCaption: "รูปที่ 4 หน้าจอ Daily Report",
          },
        },
        {
          id: "custom-report",
          title: "Custom Report",
          icon: <FileCog className="w-6 h-6 text-yellow-500" />,
          description: "จัดการข้อมูลเคสย้อนหลังและแก้ไขข้อมูล",
          content: {
            features: [
              "แสดงรายการเคสทั้งหมดของวันปัจจุบัน",
              "เลือกดูข้อมูลย้อนหลังและสลับโหมดรายวัน/รายเดือน",
              "Dashboard กราฟสรุปสถานะและสถิติของข้อมูล",
              <>หากต้องการแก้ไขข้อมูล ให้เลือกไอคอน <UIHint icon={Edit2} variant="Edit" /> ที่ท้ายแถว</>,
              <>หากต้องการลบข้อมูล ให้เลือกไอคอน <UIHint icon={Trash2} variant="danger" /> ที่ท้ายแถว</>,
              <>คลิกที่ปุ่ม <UIHint label="+ New case" variant="add" /> เพื่อเพิ่มเคสย้อนหลัง</>,
              <>ปุ่ม <UIHint label="Export File " variant="add" /> ดาวน์โหลดข้อมูลเป็น Excel</>,
              <>ปุ่ม <UIHint label="Send Email" variant="Send" /> ส่งอีเมลรายงาน (เลือกผู้รับอีเมล,พิมพ์หัวข้อ/ข้อความ,เเนบไฟล์ได้ไม่เกิน 5 MB ในเเต่ละช่อง) <button onClick={() => setPreviewImage(sendEmailImg)} className="ml-2 text-indigo-500 underline text-sm hover:text-indigo-600 font-medium">ตัวอย่างภาพ</button></>,
            ],
            image: customReportImg,
            imageCaption: "รูปที่ 5 หน้าจอ Custom Report สำหรับจัดการข้อมูล",
          },
        },
      ],
    },
    {
      id: "group-setting",
      groupTitle: "การตั้งค่า (Setting)",
      items: [
        {
          id: "Game-setting",
          title: "Game Setting",
          icon: <Gamepad2 className="w-6 h-6 text-blue-400" />,
          description: "จัดการรายชื่อเกม",
          content: {
            steps: [
              <>คลิกที่ปุ่ม <UIHint label="+ Add Game" /> เพื่อเพิ่มเกมใหม่</>,
              <>จะปรากฎหน้า Pop-up กรอกชื่อ แล้วกดปุ่ม เพื่อบันทึกข้อมูลลงระบบ <UIHint label="Save game" variant="success" /><button onClick={() => setPreviewImage(addGame)} className="ml-2 text-indigo-500 underline text-sm hover:text-indigo-600 font-medium">ตัวอย่างภาพ</button> </>,
              <>หากต้องการแก้ไขให้เลือกไอคอน <UIHint icon={Edit2} variant="Edit" /></>,
              <>หากต้องการลบให้เลือกไอคอน <UIHint icon={Trash2} variant="danger" /></>,
            ],
            image: gamesettingImg,
            imageCaption: "รูปที่ 6 gamesetting สำหรับจัดการข้อมูลเกม",
          },
        },
        {
          id: "member-setting",
          title: "Member Setting",
          icon: <UserCog className="w-6 h-6 text-yellow-600" />, //Addmember
          description: "จัดการรายชื่อสมาชิก",
          content: {
            steps: [
              <>คลิกที่ปุ่ม <UIHint label="+ Add Member" /> เพื่อเพิ่มสมาชิกใหม่</>,
              <>จะปรากฎหน้า Pop-up กรอกข้อมูลให้ครบตามที่กำหนดไว้ แล้วกดปุ่ม <UIHint label="Save Member" variant="success" /> เพื่อบันทึกข้อมูลลงระบบ <button onClick={() => setPreviewImage(addMember)} className="ml-2 text-indigo-500 underline text-sm hover:text-indigo-600 font-medium">ตัวอย่างภาพ</button> </>,
              <>หากต้องการแก้ไขให้เลือกไอคอน <UIHint icon={Edit2} variant="Edit" /></>,
              <>หากต้องการแก้ไขให้เลือกไอคอน <UIHint icon={Trash2} variant="danger" /></>,
            ],
            image: membersettingImg,
            imageCaption: "รูปที่ 7 Member setting สำหรับจัดการข้อมูลสมาชิก",
          },
        },
        {
          id: "recipient-setting",
          title: "Recipients Setting",
          icon: <Mail className="w-6 h-6 text-indigo-500" />,
          description: "จัดการรายชื่ออีเมลผู้รับ",
          content: {
            steps: [
              <>คลิกที่ปุ่ม <UIHint label="+ Add Recipient" /> เพื่อเพิ่มอีเมลผู้รับใหม่</>,
              <>จะปรากฎหน้า Pop-up กรอกข้อมูลให้ครบตามที่กำหนดไว้ แล้วกดปุ่ม <UIHint label="Save Recipient" variant="success" /> เพื่อบันทึกข้อมูลลงระบบ <button onClick={() => setPreviewImage(AddRecipient)} className="ml-2 text-indigo-500 underline text-sm hover:text-indigo-600 font-medium">ตัวอย่างภาพ</button></>,
              <>หากต้องการแก้ไขให้เลือกไอคอน <UIHint icon={Edit2} variant="Edit" /></>,
              <>หากต้องการแก้ไขให้เลือกไอคอน <UIHint icon={Trash2} variant="danger" /></>,
            ],
            image: recipientsettingImg,
            imageCaption: "รูปที่ 8 Recipients Setting สำหรับจัดการรายชื่ออีเมลผู้รับ",
          },
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 w-full bg-slate-50 dark:bg-slate-950 overflow-y-auto transition-colors duration-500">
      {/*  Navbar Header  */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
             <BackIconButton  onClick={handleNavbarBack}/>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-none">NOC Manual</h1>
              <span className="text-xs text-start text-slate-500 dark:text-slate-400 mt-1">คู่มือการใช้งาน</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 px-6 py-10">
        <div className="max-w-7xl mx-auto">
          {!activeItem ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
              <div className="text-center max-w-3xl mx-auto mb-16 p-3">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold mb-6 uppercase tracking-wider">
                  Documentation
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
                  คู่มือการใช้งาน <span className="text-indigo-600 dark:text-indigo-400">NOC Report System</span>
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  ระบบสำหรับบันทึกเหตุการณ์ (Case), ติดตามสถานะ และจัดทำรายงานประจำวัน/ย้อนหลัง ออกแบบมาเพื่อเพิ่มประสิทธิภาพการทำงานร่วมกันของทีม NOC
                </p>
              </div>

              <div className="space-y-12">
                {MANUAL_DATA.map((group) => (
                  <div key={group.id} className="scroll-mt-24">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 border-l-4 border-indigo-500 pl-4 text-left">
                      {group.groupTitle}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.items.map((item) => (
                        <ManualCard key={item.id} item={item} onClick={setActiveItem} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ManualDetail item={activeItem} onBack={handleBackToOverview} />
          )}
        </div>
      </main>

      {/*  3. Popup Modal (วางไว้นอกสุดเพื่อให้แสดงทับทุกส่วน) */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-5xl w-full animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold hover:text-indigo-400 transition-colors"
            >
              CLOSE <X size={24} />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-[75vh] w-auto h-auto mx-auto rounded-lg object-contain shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}