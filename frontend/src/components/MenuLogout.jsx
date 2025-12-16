import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function MenuLogout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };//handleLogout
  return (
   <button 
    onClick={handleLogout}
    className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 
    rounded-xl font-medium 
    hover:bg-red-100 dark:hover:bg-red-900/40 border border-transparent dark:border-red-900/30
    transition-all duration-200 
    shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
  >
    {!children && <LogOut size={18} />}
    {children || <span>Logout</span>}
  </button>
  );
}
