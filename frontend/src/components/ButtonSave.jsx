
export default function ButtonSave({ children, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
       className="px-6 py-2.5 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 font-medium shadow-md shadow-blue-200 
                   transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm duration-300 
                    hover:-translate-y-1 
                  hover:shadow-md"
    >
      {children}
    </button>
  );}