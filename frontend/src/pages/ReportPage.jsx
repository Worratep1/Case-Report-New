import React from 'react';
import { useNavigate } from "react-router-dom";
import {
  FileText,
  FileCog,
  
} from "lucide-react";

// Import Components ที่แยกไฟล์ไว้
import ButtonBack from "../components/ButtonBack";
import MenuButton from "../components/MenuButton";
import DarkModeToggle from '../components/DarkModeToggle';

export default function ReportPage() {
  const navigate = useNavigate();
  return (
    <div
      className="fixed grid place-items-center inset-0 w-full h-full 
      bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
      dark:from-slate-900 dark:via-slate-950 dark:to-zinc-900 
      overflow-y-auto z-0 pt-10"
    >
        

      <div className="w-full max-w-sm rounded-2xl shadow-lg p-6 sm:p-8
        bg-white dark:bg-slate-900 border-none dark:border dark:border-slate-700/50">
        <DarkModeToggle />
        {/* Title */}
        <h1 className="text-2xl font-medium mb-6 text-left
          text-slate-900 dark:text-white">
          Report
        </h1>

        <div className="space-y-4">
          {/* Daily Report */}
          <MenuButton
            icon={<FileText className="text-blue-400" />}
            label="Daily Report"
            description="รายงานประจำวัน"
            onClick={() => navigate("/dailyreport")} 
          />

          {/* Custom Report */}
          <MenuButton
            icon={<FileCog className="text-yellow-500" />}
            label="Custom Report"
            description="เพิ่มข้อมูลย้อนหลัง/แก้ไข/ลบข้อมูล"
            onClick={() => navigate("/customreport")} 
          />

          <div className="text-left pt-2">
            <ButtonBack onClick={() => navigate("/menu")}>Back</ButtonBack>
          </div>
        </div>
      </div>
    </div>
  );
}