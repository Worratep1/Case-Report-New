import React, { useState, useEffect } from 'react';
import * as RouterDom from "react-router-dom"; 
import { 
  AlertTriangle, 
  Settings,  
  BookOpen,
  FileChartColumn,
  LogOut,
  PlusCircle
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

import HeaderTitle from "../components/HeaderTitle";
import MenuButton from "../components/MenuButton";
import MenuLogout from "../components/MenuLogout";
import DarkModeToggle from '../components/DarkModeToggle';
// import { getProfile } from '../api/auth';


export default function MenuPage() {

  const navigate = useNavigate();
 
  const [username, setUsername] = useState("Guest"); 
  const [isLoading, setIsLoading] = useState(true);


  useEffect(()=>{
    // 1. ดึงข้อมูลจาก localStorage 
    const userStorage = localStorage.getItem("user");

    if (userStorage){
      // 2. แปลงจาก Text กลับเป็น Object
      const userObj = JSON.parse(userStorage);



      
      // 3. เซ็ตค่า username


      setUsername( userObj.username || userObj.first_name || "Guest");
    }

    setIsLoading(false)
  })

  return (
     <div className="fixed grid place-items-center inset-0 w-full h-full overflow-y-auto z-0 p-10
      bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
      dark:from-slate-900 dark:via-slate-950 dark:to-zinc-900 ">

    
      
      {/* ปุ่ม Toggle Dark Mode */}
      <DarkModeToggle />

      {/* Main Card: ไม่ต้องใส่ mx-4 เพราะเรามี p-4/p-10 ที่ตัวแม่คุมไว้แล้ว */}
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl dark:shadow-black/50 p-10 border border-white/20 dark:border-slate-700 transition-colors duration-500 relative z-10">

        <HeaderTitle username={username} /> 

        <div className="space-y-4">    
          <MenuButton
            icon={<PlusCircle className="text-emerald-500 dark:text-emerald-400" />}
            label="แจ้ง Case"
            description="รายงานบันทึกเหตุการณ์และปัญหาประจำวัน"
            onClick={() => navigate("/case")}
          />

          <MenuButton
            icon={<FileChartColumn className="text-purple-600 dark:text-purple-400" />}
            label="Report"
            description="รายงาน"
            onClick={() => navigate("/report")}
          />

          <MenuButton
            icon={<Settings className="text-slate-600 dark:text-slate-300" />}
            label="Setting"
            description="ตั้งค่าระบบ"
            onClick={() => navigate("/setting")}
          />

          <MenuButton
            icon={<BookOpen className="text-orange-500 dark:text-orange-400" />}
            label="Manual"
            description="คู่มือการใช้งาน"
            onClick={() => navigate("/manual")}
          />
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <button 
            className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl shadow-sm 
            duration-300 hover:-translate-y-1 hover:shadow-md text-sm font-medium" 
            onClick={() => navigate("/about")}
          >
            About 
          </button>

          <MenuLogout onClick={() => navigate("/login")}>
             <LogOut size={18} /> <span className="ml-1">Logout</span>
          </MenuLogout>
        </div>

      </div>
    </div>
    
  );
}
