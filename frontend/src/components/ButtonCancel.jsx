export default function ButtonCancel({ children, type = "button", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="px-4 py-2.5 rounded-lg border border-slate-400 text-red-500 hover:bg-white font-bold text-sm"
    >
      {children}
    </button>
  );
}

//className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white font-bold text-sm
// px-4 py-2 rounded-md border border-red-300 text-red-500 text-sm hover:bg-red-50"
