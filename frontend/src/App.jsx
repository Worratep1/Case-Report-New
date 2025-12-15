// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
//dsfsasfafa }

// export default App 

// src/App.jsx
import AppRoutes from "./routes/AppRoutes.jsx";
import "./App.css";
import React, { useEffect } from "react";


export default function App() {

useEffect(() => {
    // 1. ไปดูในถังเก็บข้อมูล (localStorage) ว่าเคยเมมไว้ไหม
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    
    // 2. ถ้าใช่ ให้เติม class="dark" ใส่ที่ html tag ทันที
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);


  return <AppRoutes />;
}
