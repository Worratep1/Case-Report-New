import client from "./client";

export async function login(username, password) {
  try {
    const res = await client.post("/login", { username, password });
    return res.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error; 
  }
}