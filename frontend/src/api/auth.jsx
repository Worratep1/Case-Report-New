import client from "./client";

export async function login(username, password) {
  try {
    const res = await client.post("/login", {
      username,
      password,
    });

    return res.data; // ส่งข้อมูลกลับไปให้หน้า Login ใช้
  } catch (error) {
    if (error.response) {
      // error จาก backend เช่น status 400, 401, 500
      throw new Error(error.response.data.message || "Login failed");
    } else {
      // error จาก network
      throw new Error("Cannot connect to server");
    }
  }
}
