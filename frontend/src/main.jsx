// import ReactDOM from "react-dom/client";
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import { BrowserRouter } from "react-router-dom";

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <ReactDOM.StrictMode>
//     <BrowserRouter>
//     <App />
//     </BrowserRouter>
//   </ReactDOM.StrictMode>,
// )

// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
// import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
