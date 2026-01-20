// src/pages/Main.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import ButtonBack from "../components/ButtonBack";

export default function MainPage() {
  const navigate = useNavigate();

  return ( 
    
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-7 bg-white dark:bg-slate-900 transition-colors duration-300">
      
      
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-mono">
        Version 1.0
      </h1>

      <ButtonBack onClick={() => navigate("/menu")}>
        Back
      </ButtonBack>
    </div>
  );
}