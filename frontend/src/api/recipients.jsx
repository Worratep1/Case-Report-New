// src/api/recipients.jsx
import client from "./client";

// ดึงรายการผู้รับทั้งหมด
export const getRecipients = async () => {
  const res = await client.get("/recipients");

  return res.data.recipients;
};

// เพิ่มผู้รับใหม่
export const createRecipient = async (data) => {
 
  const res = await client.post("/recipients", data);
  return res.data;
};

// แก้ไขผู้รับ
export const updateRecipient = async (id, data) => {
  const res = await client.put(`/recipients/${id}`, data);
  return res.data;
};

// ลบผู้รับ
export const deleteRecipient = async (id) => {
  const res = await client.delete(`/recipients/${id}`);
  return res.data;
};
