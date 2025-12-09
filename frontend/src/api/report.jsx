// src/api/report.jsx ส่งอีเมล์ 
import client from "./client";

export async function sendDailyReport(formData) {
  try {

    const res = await client.post("/sendmail", formData,{
         headers: { 
        "Content-Type": "multipart/form-data",
      },
    }); // ✅ ส่ง JSON ไป backend
    return res.data;

  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "ส่งรายงานไม่สำเร็จ (API Error)");
    } else {
      throw new Error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เพื่อส่งรายงาน");
    }
  }
}
