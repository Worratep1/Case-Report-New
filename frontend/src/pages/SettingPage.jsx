import { useNavigate } from "react-router-dom";
import MenuButton from "../components/MenuButton";
import ButtonBack from "../components/ButtonBack";
import { UserCog, Gamepad2, Settings ,ChevronLeft} from "lucide-react";

export default function SettingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="fixed grid place-items-center inset-0 w-full h-full 
  bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
  overflow-y-auto z-0 pt-10"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-medium text-slate-900 mb-6 text-left">
          SETTING
        </h1>

        <div className="space-y-3 ">
          <MenuButton
            icon={<Gamepad2 className="text-blue-500" />}
            label="Game Setting"
            onClick={() => navigate("/game")} // ไปหน้า CasePage
          />

          <MenuButton
            icon={<UserCog className="text-yellow-600" />}
            label="Member Setting"
            onClick={() => navigate("/member")}
          />

          <MenuButton
            icon={<Settings className="text-black-900" />}
            label="Recipient Setting"
            onClick={() => navigate("/recipient")}
          />

          <div className="text-left p-1">
            <ButtonBack onClick={() => navigate("/menu")}
            
              > Back </ButtonBack>

          </div>
        </div>
      </div>
    </div>
  );
}
