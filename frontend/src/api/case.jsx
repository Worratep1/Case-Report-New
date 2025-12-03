import client from "./client";

//
// Case API functions

// สร้างเคสใหม่
export async function createCase(caseData) {
  const res = await client.post("/cases", caseData);
  return res.data;
}
// ดึงเคสทั้งหมด หรือ ดึงเคสตามวันที่
export async function getCases(params) {
  const res = await client.get("/cases", { params });
  return res.data;
}
// ดึงเคสตาม id
export async function getCaseById(id) {
  const res = await client.get(`/cases/${id}`);
  return res.data;
}
// ลบเคสตาม id
export async function deleteCase(id) {
  const res = await client.delete(`/cases/${id}`);
  return res.data;
}
// แก้ไขเคสตาม id
export async function updateCase(id, caseData) {
  const res = await client.put(`/cases/${id}`, caseData);
  return res.data;
}
