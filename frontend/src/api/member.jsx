import client from "./client";

export async function getMembers() {
  const res = await client.get("/users");
  return res.data;
  
}

export async function getMemberById(id) {
  const res = await client.get(`/users/${id}`);
  return res.data;
}

export async function updateMember(id, memberData) {
  const res = await client.put(`/users/${id}`, memberData);
  return res.data;
}

export async function deleteMember(id) {
    const res = await client.delete(`/users/${id}`);
    return res.data;
}

export async function registerMember(data) {
  try {
    const res = await client.post("/register", {
        username: data.username,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email
    });
    return res.data; // ส่งข้อมูลกลับไปให้หน้า Register ใช้
  } catch (error) {
    if (error.response) {
      // error จาก backend เช่น status 400, 401, 500
      throw new Error(error.response.data.message || "Registration failed");
    } else {
      // error จาก network
      throw new Error("Cannot connect to server");
    }
    }
}

