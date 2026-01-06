export default function ButtonCancel({ children, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
     className="flex-1 py-3 rounded-lg border  text-slate-600 hover:bg-slate-50 font-medium  duration-300 
                    hover:-translate-y-1 
                  hover:shadow-md"
    >
      {children}
    </button>
  );
}
