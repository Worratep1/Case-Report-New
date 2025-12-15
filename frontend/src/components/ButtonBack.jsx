export default function ButtonBack({ children, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
        className=" dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-md border border-gray-300 
              text-sm bg-white
             hover:bg-gray-100 transition duration-300
  hover:-translate-y-1 
  hover:shadow-md"
>
      {children}
    </button>
  );
}
