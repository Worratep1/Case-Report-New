export default function ButtonBack({ children, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
        className="px-4 py-2 rounded-md border border-gray-300 
             text-gray-700 text-sm bg-white
             hover:bg-gray-100 transition duration-300
  hover:-translate-y-1 
  hover:shadow-md"
>
      {children}
    </button>
  );
}
