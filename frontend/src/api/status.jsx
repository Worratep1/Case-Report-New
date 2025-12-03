import client from "./client";

// ดึงสถานะทั้งหมด

export async function getStatuses() {
    const res = await client.get("/statuses");
    return res.data;
}

