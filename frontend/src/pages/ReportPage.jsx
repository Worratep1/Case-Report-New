// src/pages/ReportPage.jsx
import { Link } from "react-router-dom";
import ButtonCancel from "../components/ButtonBack";
import { useNavigate } from "react-router-dom";
import ButtonBack from "../components/ButtonBack";
import MenuButton from "../components/MenuButton"

import { 
   
  ClipboardList,
  FileCog // ฟันเฟือง
  // ... อื่นๆ
} from 'lucide-react';

export default function ReportPage() {
  const navigate = useNavigate();
  return (
    <div className="fixed grid place-items-center inset-0 w-full h-full 
  bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
  overflow-y-auto z-0 pt-10">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Title */}
        <h1 className="text-2xl text-medium text-slate-900 mb-6 text-left">
          REPORT
        </h1>

        <div className="space-y-4">
          {/* Daily Report */}



          <MenuButton
                    icon={<ClipboardList className=" text-blue-400" />}
                    label="Daily Report"
                    onClick={() => navigate("/dailyreport")} // ไปหน้า CasePage
                  />
        

          {/* Custom Report */}


           <MenuButton
                    icon={<FileCog className="text-yellow-500"/>}
                    label="Custom Report"
                    onClick={() => navigate("/customreport")} // ไปหน้า CasePage
                  />
           
          <div className="text-left p-1">
            <ButtonBack onClick={() => navigate("/menu")}>
              Back
            </ButtonBack>
          </div>
        </div>
      </div>
    </div>
  );
}
