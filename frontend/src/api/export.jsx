import client from "./client";

export async function exportReport(selectedDate, token) {
  const res = await client.get(
    `/exportreport?date=${selectedDate}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob", // สำคัญมาก!
    }
  );

  return res.data; 
}
