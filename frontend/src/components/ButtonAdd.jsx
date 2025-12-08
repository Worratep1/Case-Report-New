export default function ButtonAddGame({ children, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md shadow-blue-200 active:scale-95 duration-300
  hover:-translate-y-1 
  hover:shadow-md"
>
      {children}
    </button>
  );
}
