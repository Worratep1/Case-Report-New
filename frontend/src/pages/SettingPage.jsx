import { useNavigate } from "react-router-dom";
import MenuButton from "../components/MenuButton";
import ButtonBack from "../components/ButtonBack";
import { UserCog, Gamepad2 , Mail} from "lucide-react";
import DarkModeToggle from "../components/DarkModeToggle";

export default function SettingPage() {
  const navigate = useNavigate();

  return (
    <div
        className="fixed grid place-items-center inset-0 w-full h-full 
      bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
      dark:from-slate-900 dark:via-slate-950 dark:to-zinc-900 
      overflow-y-auto z-0 pt-10"
    >
      <div className="w-full max-w-sm rounded-2xl shadow-lg p-6 sm:p-8
        bg-white dark:bg-slate-800 border-none dark:border dark:border-slate-700">
          <DarkModeToggle />

        <h1 className="text-2xl font-medium mb-6 text-left
          text-slate-900 dark:text-white">
          SETTING
        </h1>

        <div className="space-y-3 ">
          <MenuButton
            icon={<Gamepad2 className="text-blue-500" />}
            label="Game Setting"
            description="จัดการข้อมูลเกม"
            onClick={() => navigate("/game")} // ไปหน้า CasePage
          />

          <MenuButton
            icon={<UserCog className="text-yellow-600" />}
            label="Member Setting"
            description="จัดการสมาชิก"
            onClick={() => navigate("/member")}
          />

          <MenuButton
            icon={<Mail className="text-indigo-500" />}
            label="Recipient Setting"
            description="จัดการผู้รับอีเมล"
            onClick={() => navigate("/recipient")}
          />

          <div className="text-left px-1">
            <ButtonBack onClick={() => navigate("/menu")} > Back </ButtonBack>

            
             
          </div>
        </div>
      </div>
    </div>
  );
}
