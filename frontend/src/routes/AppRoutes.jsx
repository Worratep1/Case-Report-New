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
import ManualPage from "../pages/ManualPage";
import DashboardPage from '../pages/DashboardPage';

import RequierAuth from "../components/RequireAuth";

export default function AppRoutes() {
  return (
    <Routes>
      
      
      <Route path="/login" element={ <LoginPage/> } />

     
    {/* Redirect หน้าแรกไป dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace /> } />
     
      {/* หน้า Dashboard ต้องล็อกอินก่อนถึงจะดูได้ */}
      <Route path="/dashboard" element={<RequierAuth> <DashboardPage /> </RequierAuth>} />

      <Route path="/main" element={<RequierAuth> <MainPage /> </RequierAuth>} />

      <Route path="/menu" element={  <RequierAuth> <MenuPage /> </RequierAuth>} />

      <Route path="/case" element={ <RequierAuth> <CasePage /> </RequierAuth>} />

      <Route path="/report" element={<RequierAuth> <ReportPage /> </RequierAuth>} />

      <Route path="/setting" element={ <RequierAuth><SettingPage /></RequierAuth> } />

      <Route path="/about" element={ <RequierAuth> <AboutPage /> </RequierAuth>} />

      <Route path="/game" element={ <RequierAuth> <GameSetting /> </RequierAuth>} />

      <Route path="/member" element={<RequierAuth> <MemberSetting /> </RequierAuth>} />

      <Route path="/recipient" element={ <RequierAuth> <RecipientSetting /> </RequierAuth> } />

      <Route path="/dailyreport" element={ <RequierAuth> <DailyReportPage /> </RequierAuth> } />

      <Route path="/customreport" element={ <RequierAuth> <CustomreportPage /> </RequierAuth>} />

      <Route path="/manual" element={<RequierAuth> <ManualPage/> </RequierAuth>}/>




      {/* ถ้าพิมพ์ path มั่ว ให้เด้งไป /login  */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
