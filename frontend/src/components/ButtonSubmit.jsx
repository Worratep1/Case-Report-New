export default function ButtonSubmit({ children, type = "submit", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-normal  text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all 
      active:scale-95 flex items-center gap-2 
      duration-300 
      hover:-translate-y-1 
      hover:shadow-md"
    >
      {children}
    </button>
  );
}