export default function MenuButton({ onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 bg-blue-50 hover:bg-blue-100
                       text-slate-700 px-5 py-4 rounded-xl shadow-sm transition transition-all duration-300 
  hover:-translate-y-1 
  hover:shadow-md"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-lg font-medium">{label}</span>
    </button>
  );
}
