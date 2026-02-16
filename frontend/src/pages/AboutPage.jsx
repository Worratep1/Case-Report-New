import React from "react";
import { useNavigate } from "react-router-dom";
import ButtonBack from "../components/ButtonBack";
import {Cpu, Globe, Mail, Database } from "lucide-react";
import DarkModeToggle from "../components/DarkModeToggle";
export default function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 transition-colors duration-300">
      <DarkModeToggle />
      {/* ส่วนหัวข้อ  */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tighter">
          About System
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          Version 1.0 (Build 25/01/2026)
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Frontend Card */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4 text-blue-500">
            <Globe size={24} />
            <h2 className="text-xl font-bold">Frontend</h2>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">React & Tailwind CSS</p>
          <p className="text-sm text-slate-500 mt-1">พัฒนาระบบส่วนติดต่อผู้ใช้งานของเว็บแอปพลิเคชัน</p>
        </div>

        {/* Backend Card */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4 text-emerald-500">
            <Cpu size={24} />
            <h2 className="text-xl font-bold">Backend</h2>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">Node.js (Express)</p>
          <p className="text-sm text-slate-500 mt-1"> พัฒนา API สำหรับเชื่อมต่อและจัดการข้อมูลกับฐานข้อมูล</p>
        </div>

        {/* Database Card */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4 text-indigo-500">
            <Database size={24} />
            <h2 className="text-xl font-bold">Database</h2>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">PostgreSQL</p>
          <p className="text-sm text-slate-500 mt-1">ฐานข้อมูลสำหรับจัดเก็บและบริหารจัดการข้อมูลของระบบ</p>
        </div>

        {/* API Email Card */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4 text-orange-500">
            <Mail size={24} />
            <h2 className="text-xl font-bold">Email</h2>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">SMTP</p>
          <p className="text-sm text-slate-500 mt-1"> ใช้ SMTP Relay ของบริษัทสำหรับการส่งรายงานผ่านอีเมลไปยังผู้รับ</p>
        </div>

        {/* Developer Credit  */}
        <div className="md:col-span-2 mt-4 p-8 rounded-[2rem] bg-slate-900 dark:bg-slate-700 text-white  flex flex-col items-center">
          <span className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2 font-bold">Developed By</span>
          <h3 className="text-2xl font-bold">Worratep Puted (Ford)</h3>
          <div className="mt-4 flex gap-4">
             <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-12">
        <ButtonBack onClick={() => navigate("/menu")}>
          Back
        </ButtonBack>
      </div>
    </div>
  );
}