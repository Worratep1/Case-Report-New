// src/pages/Main.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import ButtonBack from "../components/ButtonBack";

export default function MainPage() {
  const navigate = useNavigate();

  return ( // flex-col ให้อย่คนละบรรทัด
    <div className="min-h-screen flex flex-col items-center justify-center gap-7">
      <h1 className="text-3xl font-bold text-slate-800 font-mono">
        Version DEMO 1.0.0
      </h1>

      <ButtonBack onClick={() => navigate("/menu")}>
        Back
      </ButtonBack>
    </div>
  );
}




