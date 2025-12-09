import { useNavigate } from "react-router-dom";
import HeaderTitle from "../components/HeaderTitle";
import MenuButton from "../components/MenuButton";
import MenuLogout from "../components/MenuLogout";
import { 
  AlertTriangle, // สามเหลี่ยมตกใจ
  Settings,  
  BookOpen,
  FileChartColumn,
  LogOut   
  // ... อื่นๆ
} from 'lucide-react';
export default function MenuPage() {
  const navigate = useNavigate();

  return (
    <div className="fixed grid place-items-center inset-0 w-full h-full 
  bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
  overflow-y-auto z-0 pt-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">

        <HeaderTitle />

        <div className="space-y-3">    
          <MenuButton
          icon={<AlertTriangle className="text-red-600"/>}
            label="แจ้ง Case "
            onClick={() => navigate("/case")} // ไปหน้า CasePage
          />

          <MenuButton
            icon={<FileChartColumn className="text-purple-600"/>}
            label="Report"
            
            onClick={() => navigate("/report")}
          />

          <MenuButton
            icon={<Settings/>}
            label="Setting"
            onClick={() => navigate("/setting")}
          />

          <MenuButton
            icon={<BookOpen className="text-orange-500"/>}
            label="Manual"
            onClick={() => navigate("/manual")}
          />
         
        </div>

        <div className="flex justify-between mt-6">
          <button className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl shadow-sm duration-300 
          hover:-translate-y-1 
          hover:shadow-md" 
          onClick={()=>navigate("/about")}>
            About 
          </button>

          <MenuLogout > <LogOut /> Logout</MenuLogout>

           {/* <button className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow shadow-blue-200">
           
          </button> */}
        </div>

      </div>
    </div>
  );
}
