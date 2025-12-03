import { useNavigate } from "react-router-dom";
import HeaderTitle from "../components/HeaderTitle";
import MenuButton from "../components/MenuButton";
import ButtonCancel from "../components/ButtonCancel";
import ButtonBack from "../components/ButtonBack";


export default function SettingPage() {
  const navigate = useNavigate();

  return (
    <div className="fixed grid place-items-center inset-0 w-full h-full 
  bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
  overflow-y-auto z-0 pt-10">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 sm:p-8">

         <h1 className="text-2xl font-bold text-slate-900 mb-6 text-left">Setting</h1>

        <div className="space-y-3">
          <MenuButton
            icon={"🎮"}
            label="Game Setting"
            onClick={() => navigate("/game")} // ไปหน้า CasePage
          />

          <MenuButton
            icon={"👥"}
            label="Member Setting"
            onClick={() => navigate("/member")}
          />

          <MenuButton
            icon={"⚙️"}
            label="Recipient Setting"
            onClick={() => navigate("/recipient")}
          />
         
 <div className="text-left p-1">
            <ButtonBack 
            onClick={() => navigate("/menu")} 
            > Back </ButtonBack></div>

        </div>

        {/* <div className="flex justify-between mt-6">
          <button className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl shadow-sm">
            About
          </button>

          <MenuLogout onClick={()=> navigate("/login")}>Logout</MenuLogout>

           <button className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow shadow-blue-200">
           
          </button>
        </div> */}
       
      </div>
    </div>
  );
}
