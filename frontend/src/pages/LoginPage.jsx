import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { login } from "../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    // สมมติ res คือ response จาก API login
    

    try {
      const data = await login(username, password);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("เข้าสู่ระบบสำเร็จ 🎉");
      navigate("/menu");  // ไปหน้า MainPage
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
   <div className="fixed grid place-items-center inset-0 w-full h-full 
  bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 
  overflow-y-auto z-0 pt-10">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-center text-xl font-bold text-slate-800 mb-1">
          Daily Report System
        </h1>
        <p className="text-center text-xs text-slate-500 mb-6">
          Web Report & Case Management
        </p>


        <form onSubmit={handleLogin}>
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit">Login</Button>
        </form>

        {message && (
          <p className="mt-4 text-center text-red-500 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
}

// export default function LoginPage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-100">
//       <h1 className="text-2xl font-bold text-slate-800">
//         Login Page
//       </h1>
//     </div>
//   );
// }

