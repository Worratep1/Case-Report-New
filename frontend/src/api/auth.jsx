import client from "./client";

export async function login(username, password) {
  try {
    const res = await client.post("/login", { username, password });
    return res.data;
  } catch (error) {
    // โยน error ของ axios ออกไปทั้งก้อนเลย ไม่ต้องครอบ Error ใหม่
    throw error; 
  }
}