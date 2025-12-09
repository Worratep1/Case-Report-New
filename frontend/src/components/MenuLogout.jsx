import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function MenuLogout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
   <button
  onClick={handleLogout}
  className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow 
             hover:bg-blue-700 duration-200 
          hover:-translate-y-1 
          hover:shadow-md"
>
  Logout
</button>
  );
}
