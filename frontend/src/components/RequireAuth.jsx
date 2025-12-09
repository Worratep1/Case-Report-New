import { Navigate } from "react-router-dom";

//หน้าอื่น ถ้ายังไม่ได้ล็อกอิน เช็ก token

export default function RequierAuth({children}){
    const token = localStorage.getItem("token")


    if (!token){
        return <Navigate to ="/login" replace/>
    }

     return children;
}