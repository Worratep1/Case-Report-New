import { 

  LogOut   
  // ... อื่นๆ
} from 'lucide-react';

export default function MenuButton({ children, type = "button", onClick }) {
  return (
    <button
      type={type}
      
      onClick={onClick}
      className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow shadow-blue-200 duration-300 
  hover:-translate-y-1 
  hover:shadow-md "
      
    >
      {children}
    </button>
  );
}
