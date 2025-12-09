import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:4000/api",   // ชี้ไปที่ backend 
//   withCredentials: false,                 // ถ้าอนาคตใช้ cookie ค่อยเปิดเป็น true
});

client.interceptors.request.use(
  (config) =>{
    const token = localStorage.getItem("token")

    if(token){
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// (ออฟชั่น) ถ้าเจอ 401 ให้เด้งไปหน้า login

client.interceptors.response.use(
  (response) => response,
  (error)=> {

    if (error?.response?.status === 401) {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
  
}
    return Promise.reject(error)
  }
)
export default client;