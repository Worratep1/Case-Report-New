// src/api/export.js
import client from "./client";

export async function exportReport(selectedDate ,mode  , status , search) {
  const res = await client.get("/exportreport", {
    params: {
      date: selectedDate,
      mode: mode,
      status: status, 
      search: search   
    }, 
    responseType: "blob", // ต้องมีเพื่อให้โหลดไฟล์ได้
  });

  return res.data; // คืน blob ให้ handleExport
}

