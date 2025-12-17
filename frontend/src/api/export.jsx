// src/api/export.js
import client from "./client";

export async function exportReport(selectedDate ,mode) {
  const res = await client.get("/exportreport", {
    params: {
      date: selectedDate,
      mode: mode
    }, // ใส่ query ที่นี่แทน
    responseType: "blob", // ต้องมีเพื่อให้โหลดไฟล์ได้
  });

  return res.data; // คืน blob ให้ handleExport
}
// throw new Error("Simulated API failure for testing.");
