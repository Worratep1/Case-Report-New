// src/api/export.js
import client from "./client";

export async function exportReport({ startDate, endDate, mode, status, search }) {
  try {
    const res = await client.get("/exportreport", {
      params: {
        startDate,
        endDate,
        mode,
        status,
        search,
      },
      responseType: "blob",
    });

    return res.data; // ส่งกลับข้อมูลไฟล์แบบ blob
  } catch (error) {
    console.error("Error exporting report:", error);
    throw error;
  }
}
    
    

 


