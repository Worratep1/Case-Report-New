export default function ButtonCancel({ children, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="
        
        px-6 py-2.5 
        rounded-xl 
        border border-red-200 
        bg-red-50/50 
        text-red-600 
        font-medium 
        text-sm 
        transition-all
        duration-200 
        hover:bg-red-100 
        hover:border-red-300 
        gap-2
        duration-300 
      hover:-translate-y-1 
      hover:shadow-md
      "
    >
      {children}
    </button>
  );
}