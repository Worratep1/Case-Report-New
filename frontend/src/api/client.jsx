import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:4000/api",   // ชี้ไปที่ backend 
//   withCredentials: false,                 // ถ้าอนาคตใช้ cookie ค่อยเปิดเป็น true
});

export default client;
