export default function ButtonSubmit({ children, type = "submit", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="flex-1 py-3 rounded-lg border  bg-blue-600 text-white font-medium   hover:bg-blue-700 shadow-lg shadow-blue-500/30 
      
      duration-300 
      hover:-translate-y-1 
      hover:shadow-md"
    >
      {children}
    </button>
  );
  // "flex-1 py-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium  duration-300 
                   
}