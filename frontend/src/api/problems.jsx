import client from "./client";

// ดึงปัญหาทั้งหมด

export async function getProblems() {
    const res = await client.get("/problems");
    return res.data;
}
