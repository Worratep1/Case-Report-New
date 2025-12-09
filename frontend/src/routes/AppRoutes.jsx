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
import RequierAuth from "../components/RequireAuth";

export default function AppRoutes() {
  return (
    <Routes>
      
      {/* หน้า Login */}
      <Route path="/login" element={ <LoginPage/> } />

      {/* หน้า เปล่าๆ */}
      <Route path="/main" element={<RequierAuth> <MainPage /> </RequierAuth>} />

      {/* หน้าเมนูหลังล็อกอิน */}
      <Route path="/menu" element={  <RequierAuth> <MenuPage /> </RequierAuth>} />

      {/* หน้า สร้างเคสใหม่ */}
      <Route path="/case" element={ <RequierAuth> <CasePage /> </RequierAuth>} />

      <Route path="/report" element={<RequierAuth> <ReportPage /> </RequierAuth>} />

      <Route path="/setting" element={ <RequierAuth><SettingPage /></RequierAuth> } />

      <Route path="/about" element={ <RequierAuth> <AboutPage /> </RequierAuth>} />

      <Route path="/game" element={ <RequierAuth> <GameSetting /> </RequierAuth>} />

      <Route path="/member" element={<RequierAuth> <MemberSetting /> </RequierAuth>} />

      <Route path="/recipient" element={ <RequierAuth> <RecipientSetting /> </RequierAuth> } />

      <Route path="/deilyreport" element={ <RequierAuth> <DailyReportPage /> </RequierAuth> } />

      <Route path="/customreport" element={ <RequierAuth> <CustomreportPage /> </RequierAuth>} />

      <Route path="/dash" element={<DashPage />} />

      {/* { <Route path="/report/daily" element={<DailyReportPage />} /> }
      {<Route path="/report/custom" element={<CustomReportPage />} />} */}

      {/* ถ้าพิมพ์ path มั่ว ให้เด้งไป /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
