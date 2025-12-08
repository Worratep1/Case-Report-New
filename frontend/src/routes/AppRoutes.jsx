import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import MainPage from "../pages/MainPage";
import MenuPage from "../pages/MenuPage";
import CasePage from "../pages/CasePage";
import ReportPage from "../pages/ReportPage";
import SettingPage from "../pages/SettingPage";
import AboutPage from "../pages/AboutPage";
import GameSetting from "../pages/GameSetting";
import MemberSetting from "../pages/MemberSetting";
import RecipientSetting from "../pages/RecipientSetting";
import DailyReportPage from "../pages/DailyreportPage";
import CustomreportPage from "../pages/CustomreportPage";
import DashPage from "../pages/DashPage";

export default function AppRoutes() {
  return (
    <Routes>

         {/* หน้า เปล่าๆ */}
      <Route path="/main" element={<MainPage />} />

      {/* หน้า Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* หน้าเมนูหลังล็อกอิน */}
      <Route path="/menu" element={<MenuPage />} />
       
        {/* หน้า สร้างเคสใหม่ */}
        <Route path="/case" element={<CasePage />} />

      <Route path="/report" element={<ReportPage />} />

      <Route path="/setting" element={<SettingPage/>} />

      <Route path="/about" element={<AboutPage/>} />

      <Route path="/game" element={<GameSetting/>} />

      <Route path ="/member" element ={<MemberSetting/>}/>

    <Route path ="/recipient" element ={<RecipientSetting/>}/>

    <Route path="/deilyreport" element={<DailyReportPage />} />

    <Route path="/customreport" element={<CustomreportPage/>} />

    <Route path="/dash" element={<DashPage />} />
      
   {/* { <Route path="/report/daily" element={<DailyReportPage />} /> }
      {<Route path="/report/custom" element={<CustomReportPage />} />} */}


      {/* ถ้าพิมพ์ path มั่ว ให้เด้งไป /login */}
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  );
}
