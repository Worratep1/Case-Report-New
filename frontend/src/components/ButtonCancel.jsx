export default function ButtonCancel({ children, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="
        
       px-4 py-2 bg-white border rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 duration-300 
      hover:-translate-y-1 
      hover:shadow-md
      "
    >
      {children}
    </button>
  );
}