import axios from "axios";

const client = axios.create({
  baseURL : import.meta.env.VITE_API_BASE_URL   // ชี้ไปที่ backend 
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

      if (window.location.pathname !== "/login"){
         localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
      }
 
}
    return Promise.reject(error)
  }
)
export default client;

// export async function getProfile() {

//   try{
//     const res = await client.get("/profile");
//     return res.data


//   }catch (error) {
//   if(error.response?.status === 401 ){
//      throw new Error("Unauthorized or token expired")
//   }
//     throw new Error(error.response?.data?.message || "Failed to fetch profile")


  
//   }
  
// }